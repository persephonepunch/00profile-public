# Webflow User Collection + Xano Auth Setup

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION                             │
│                     (Xano - Private Data)                         │
├──────────────────────────────────────────────────────────────────┤
│  users table:                                                     │
│  - email, password (hashed), role, status                         │
│  - JWT tokens, sessions                                           │
│  - Private data (loans, payments, settings)                       │
└──────────────────────────────────────────────────────────────────┘
                              │
                              │ Sync public profile data
                              ▼
┌──────────────────────────────────────────────────────────────────┐
│                      PUBLIC PROFILES                              │
│                 (Webflow CMS - Public Data)                       │
├──────────────────────────────────────────────────────────────────┤
│  User Profiles collection:                                        │
│  - name, photo, bio, major, cohort                                │
│  - Public-facing information only                                 │
│  - Linked to Xano via xano_user_id                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## Part 1: Webflow CMS Collection Schema

### Collection: "User Profiles" (or "Profiles")

Create this collection in Webflow CMS:

| Field Name | Slug | Type | Settings |
|------------|------|------|----------|
| Name | `name` | Plain Text | Required |
| Slug | `slug` | Slug | Auto from Name |
| First Name | `first-name` | Plain Text | |
| Last Name | `last-name` | Plain Text | |
| Email | `email` | Email | (for display only) |
| Photo | `photo` | Image | |
| Bio | `bio` | Rich Text | |
| Role | `role` | Option | student, instructor, family_member, admin |
| Sub Role | `sub-role` | Plain Text | father, mother, supporter |
| Major | `major` | Reference → Majors | |
| Cohort | `cohort` | Reference → Classes | |
| Phone | `phone` | Phone | |
| Profile Visibility | `profile-visibility` | Option | public, classmates_only, private |
| Xano User ID | `xano-user-id` | Number | **Critical for sync** |
| Status | `status` | Option | active, inactive |
| Created Date | `created-date` | Date | |
| Last Updated | `last-updated` | Date | |

### Important Notes:
- **DO NOT store passwords in Webflow** - Auth stays in Xano
- `xano-user-id` links Webflow profile to Xano user
- This collection is for **public display only**

---

## Part 2: Copy-Paste JavaScript for Webflow

### Step 1: Add to Webflow Footer Code

Go to **Project Settings > Custom Code > Footer Code** and paste:

```html
<script>
/**
 * Xano Auth + Webflow Integration
 * Version: 1.0.0
 *
 * SETUP:
 * 1. Update XANO_API_URL with your Xano Auth API endpoint
 * 2. Update WEBFLOW_PROFILES_COLLECTION_ID with your collection ID
 */

(function() {
  'use strict';

  // =============================================
  // CONFIGURATION - UPDATE THESE VALUES
  // =============================================
  const CONFIG = {
    XANO_API_URL: 'https://xerb-qpd6-hd8t.n7.xano.io/api:AUTH',
    // Get collection ID from Webflow CMS settings
    WEBFLOW_PROFILES_COLLECTION_ID: 'YOUR_COLLECTION_ID_HERE'
  };
  // =============================================

  const STORAGE = {
    TOKEN: 'xano_auth_token',
    USER: 'xano_user',
    PERMISSIONS: 'xano_permissions'
  };

  let state = {
    user: null,
    token: null,
    permissions: null,
    ready: false
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
  }

  function load(key) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : null;
    } catch(e) { return null; }
  }

  function clearStorage() {
    Object.values(STORAGE).forEach(k => localStorage.removeItem(k));
    state = { user: null, token: null, permissions: null, ready: true };
  }

  // ============================================
  // API FUNCTIONS
  // ============================================

  async function api(endpoint, method = 'GET', body = null, requireAuth = false) {
    const headers = { 'Content-Type': 'application/json' };

    if (requireAuth && state.token) {
      headers['Authorization'] = 'Bearer ' + state.token;
    }

    const opts = { method, headers };
    if (body && method !== 'GET') {
      opts.body = JSON.stringify(body);
    }

    const response = await fetch(CONFIG.XANO_API_URL + endpoint, opts);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Request failed');
      error.code = data.code;
      error.status = response.status;

      // Clear auth on 401
      if (response.status === 401) {
        clearStorage();
        updateUI();
      }
      throw error;
    }

    return data;
  }

  // ============================================
  // AUTH FUNCTIONS
  // ============================================

  async function initialize() {
    if (state.ready) return;

    // Load from storage
    state.token = load(STORAGE.TOKEN);
    state.user = load(STORAGE.USER);
    state.permissions = load(STORAGE.PERMISSIONS);

    // Validate token with /auth/me
    if (state.token) {
      try {
        const res = await api('/auth/me', 'GET', null, true);
        state.user = res.user;
        state.permissions = res.permissions;
        save(STORAGE.USER, state.user);
        save(STORAGE.PERMISSIONS, state.permissions);
      } catch (e) {
        console.log('XanoAuth: Session expired');
        clearStorage();
      }
    }

    state.ready = true;
    updateUI();

    // Dispatch ready event
    window.dispatchEvent(new CustomEvent('xano-auth-ready', {
      detail: { isAuthenticated: !!state.user, user: state.user }
    }));
  }

  async function login(email, password) {
    try {
      const res = await api('/auth/login', 'POST', { email, password });

      state.token = res.authToken;
      state.user = res.user;
      save(STORAGE.TOKEN, state.token);
      save(STORAGE.USER, state.user);

      // Get full user data with permissions
      const me = await api('/auth/me', 'GET', null, true);
      state.permissions = me.permissions;
      save(STORAGE.PERMISSIONS, state.permissions);

      updateUI();

      window.dispatchEvent(new CustomEvent('xano-auth-login', {
        detail: { user: state.user }
      }));

      return { success: true, user: state.user };
    } catch (e) {
      return { success: false, error: e.message, code: e.code };
    }
  }

  async function signup(inviteToken, userData) {
    try {
      const res = await api('/auth/signup', 'POST', {
        invite_token: inviteToken,
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || ''
      });

      state.token = res.authToken;
      state.user = res.user;
      save(STORAGE.TOKEN, state.token);
      save(STORAGE.USER, state.user);

      // Get permissions
      const me = await api('/auth/me', 'GET', null, true);
      state.permissions = me.permissions;
      save(STORAGE.PERMISSIONS, state.permissions);

      updateUI();

      window.dispatchEvent(new CustomEvent('xano-auth-signup', {
        detail: { user: state.user }
      }));

      return { success: true, user: state.user };
    } catch (e) {
      return { success: false, error: e.message, code: e.code };
    }
  }

  async function logout() {
    try {
      if (state.token) {
        await api('/auth/logout', 'POST', null, true);
      }
    } catch (e) {}

    clearStorage();
    updateUI();

    window.dispatchEvent(new CustomEvent('xano-auth-logout'));
    window.location.href = '/';
  }

  async function forgotPassword(email) {
    try {
      const res = await api('/auth/forgot-password', 'POST', { email });
      return { success: true, message: res.message };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function validateInvite(token) {
    try {
      return await api('/invites/validate', 'POST', { token });
    } catch (e) {
      return { valid: false, error: e.message };
    }
  }

  // ============================================
  // UI UPDATE FUNCTIONS
  // ============================================

  function updateUI() {
    const isLoggedIn = !!state.user;

    // .auth---visible: show only when logged IN
    document.querySelectorAll('.auth---visible').forEach(el => {
      el.style.display = isLoggedIn ? '' : 'none';
      el.classList.toggle('w-condition-invisible', !isLoggedIn);
    });

    // .auth---invisible: show only when logged OUT
    document.querySelectorAll('.auth---invisible').forEach(el => {
      el.style.display = isLoggedIn ? 'none' : '';
      el.classList.toggle('w-condition-invisible', isLoggedIn);
    });

    // Role-based visibility
    document.querySelectorAll('[data-role-visible]').forEach(el => {
      const roles = el.dataset.roleVisible.split(',').map(r => r.trim());
      const show = state.user && roles.includes(state.user.role);
      el.style.display = show ? '' : 'none';
    });

    // Sub-role visibility
    document.querySelectorAll('[data-sub-role-visible]').forEach(el => {
      const subRoles = el.dataset.subRoleVisible.split(',').map(r => r.trim());
      const show = state.user && state.user.sub_role && subRoles.includes(state.user.sub_role);
      el.style.display = show ? '' : 'none';
    });

    // User data attributes
    if (state.user) {
      document.querySelectorAll('[data-user-name]').forEach(el => {
        el.textContent = state.user.first_name + ' ' + state.user.last_name;
      });
      document.querySelectorAll('[data-user-first-name]').forEach(el => {
        el.textContent = state.user.first_name;
      });
      document.querySelectorAll('[data-user-last-name]').forEach(el => {
        el.textContent = state.user.last_name;
      });
      document.querySelectorAll('[data-user-email]').forEach(el => {
        el.textContent = state.user.email;
      });
      document.querySelectorAll('[data-user-role]').forEach(el => {
        el.textContent = (state.user.sub_role || state.user.role).replace(/_/g, ' ');
      });
      document.querySelectorAll('[data-user-avatar]').forEach(el => {
        if (state.user.profile_image_url) {
          el.src = state.user.profile_image_url;
        }
      });
    }

    // Protected page redirect
    if (document.body.classList.contains('auth---required') && !isLoggedIn) {
      sessionStorage.setItem('xano_redirect', window.location.href);
      window.location.href = '/login';
    }
  }

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  function isAuthenticated() { return !!state.user; }
  function getUser() { return state.user; }
  function getToken() { return state.token; }
  function getPermissions() { return state.permissions; }

  function isStudent() { return state.user?.role === 'student'; }
  function isInstructor() { return state.user?.role === 'instructor'; }
  function isFamilyMember() { return state.user?.role === 'family_member'; }
  function isAdmin() { return state.user?.role === 'admin'; }

  function getDashboardUrl() {
    if (!state.user) return '/';
    switch (state.user.role) {
      case 'admin': return '/admin/dashboard';
      case 'instructor': return '/instructor/dashboard';
      case 'family_member': return '/family/dashboard';
      default: return '/student/dashboard';
    }
  }

  function getRedirectUrl() {
    return sessionStorage.getItem('xano_redirect') || getDashboardUrl();
  }

  function clearRedirectUrl() {
    sessionStorage.removeItem('xano_redirect');
  }

  // ============================================
  // EXPOSE GLOBAL API
  // ============================================

  window.XanoAuth = {
    // Core Auth
    initialize,
    login,
    signup,
    logout,
    forgotPassword,
    validateInvite,

    // State
    isAuthenticated,
    getUser,
    getToken,
    getPermissions,

    // Role Checks
    isStudent,
    isInstructor,
    isFamilyMember,
    isAdmin,

    // UI
    updateUI,
    getDashboardUrl,
    getRedirectUrl,
    clearRedirectUrl
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
</script>
```

---

## Part 3: Login Page Setup

### HTML Structure for Login Page

```html
<!-- Add to your Webflow Login page -->
<div class="login-container">
  <!-- Show when logged OUT -->
  <div class="auth---invisible">
    <h1>Sign In</h1>

    <form id="login-form" class="login-form">
      <div class="form-field">
        <label for="login-email">Email</label>
        <input type="email" id="login-email" name="email" required
               placeholder="your@email.com" />
      </div>

      <div class="form-field">
        <label for="login-password">Password</label>
        <input type="password" id="login-password" name="password" required
               placeholder="Enter password" />
      </div>

      <div id="login-error" class="error-message" style="display:none;"></div>

      <button type="submit" class="btn-primary">Sign In</button>

      <div class="form-footer">
        <a href="/forgot-password">Forgot password?</a>
      </div>
    </form>
  </div>

  <!-- Show when logged IN -->
  <div class="auth---visible">
    <p>You're already logged in as <span data-user-email></span></p>
    <a href="/dashboard" class="btn-primary">Go to Dashboard</a>
    <button onclick="XanoAuth.logout()" class="btn-secondary">Logout</button>
  </div>
</div>

<script>
document.getElementById('login-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const submitBtn = this.querySelector('button[type="submit"]');

  // Disable button during request
  submitBtn.disabled = true;
  submitBtn.textContent = 'Signing in...';
  errorEl.style.display = 'none';

  const result = await XanoAuth.login(email, password);

  if (result.success) {
    // Redirect to saved URL or dashboard
    window.location.href = XanoAuth.getRedirectUrl();
    XanoAuth.clearRedirectUrl();
  } else {
    errorEl.textContent = result.error || 'Invalid email or password';
    errorEl.style.display = 'block';
    submitBtn.disabled = false;
    submitBtn.textContent = 'Sign In';
  }
});
</script>
```

---

## Part 4: Register Page Setup

### HTML Structure for Register Page

```html
<div class="register-container">
  <div id="register-content">
    <h1>Create Account</h1>

    <div id="invite-status">Validating invite...</div>

    <form id="register-form" style="display:none;">
      <div class="form-field">
        <label>Email</label>
        <input type="email" id="reg-email" readonly class="readonly-field" />
      </div>

      <div class="form-row">
        <div class="form-field">
          <label for="reg-first-name">First Name</label>
          <input type="text" id="reg-first-name" required />
        </div>
        <div class="form-field">
          <label for="reg-last-name">Last Name</label>
          <input type="text" id="reg-last-name" required />
        </div>
      </div>

      <div class="form-field">
        <label for="reg-password">Password</label>
        <input type="password" id="reg-password" required minlength="8"
               placeholder="Minimum 8 characters" />
      </div>

      <div class="form-field">
        <label for="reg-phone">Phone (optional)</label>
        <input type="tel" id="reg-phone" placeholder="(555) 123-4567" />
      </div>

      <div id="invite-role" class="invite-role-badge"></div>

      <div id="reg-error" class="error-message" style="display:none;"></div>

      <button type="submit" class="btn-primary">Create Account</button>
    </form>
  </div>
</div>

<script>
(async function() {
  const urlParams = new URLSearchParams(window.location.search);
  const inviteToken = urlParams.get('token');
  const statusEl = document.getElementById('invite-status');
  const formEl = document.getElementById('register-form');

  if (!inviteToken) {
    statusEl.innerHTML = '<p class="error">No invite token found. You need an invitation to register.</p>';
    return;
  }

  // Validate invite
  const validation = await XanoAuth.validateInvite(inviteToken);

  if (!validation.valid) {
    statusEl.innerHTML = '<p class="error">' + (validation.error || 'Invalid or expired invite') + '</p>';
    return;
  }

  // Show form with invite data
  statusEl.style.display = 'none';
  formEl.style.display = 'block';
  document.getElementById('reg-email').value = validation.invite.email;
  document.getElementById('invite-role').textContent =
    'Joining as: ' + validation.invite.role.replace('_', ' ');

  // Handle form submit
  formEl.addEventListener('submit', async function(e) {
    e.preventDefault();

    const errorEl = document.getElementById('reg-error');
    const submitBtn = this.querySelector('button[type="submit"]');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
    errorEl.style.display = 'none';

    const result = await XanoAuth.signup(inviteToken, {
      email: document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value,
      first_name: document.getElementById('reg-first-name').value,
      last_name: document.getElementById('reg-last-name').value,
      phone: document.getElementById('reg-phone').value
    });

    if (result.success) {
      window.location.href = XanoAuth.getDashboardUrl();
    } else {
      errorEl.textContent = result.error;
      errorEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
})();
</script>
```

---

## Part 5: Protected Page Setup

### For any page requiring login:

1. Select the **Body** element in Webflow
2. Add the class: `auth---required`

This will automatically redirect to `/login` if not authenticated.

### Show/Hide Content Based on Auth State

```html
<!-- Only visible when logged in -->
<div class="auth---visible">
  <p>Welcome, <span data-user-first-name></span>!</p>
  <button onclick="XanoAuth.logout()">Logout</button>
</div>

<!-- Only visible when logged out -->
<div class="auth---invisible">
  <a href="/login">Sign In</a>
  <a href="/register">Register</a>
</div>

<!-- Only visible to students -->
<div data-role-visible="student">
  Student-only content
</div>

<!-- Only visible to instructors and admins -->
<div data-role-visible="instructor,admin">
  Staff-only content
</div>
```

---

## Part 6: User Profile Display in Webflow

### Show User Data Dynamically

```html
<div class="user-profile auth---visible">
  <img data-user-avatar src="/images/default-avatar.png" alt="Profile" />
  <h2 data-user-name>Loading...</h2>
  <p data-user-email></p>
  <span class="role-badge" data-user-role></span>
</div>
```

---

## Part 7: Xano Endpoints Required

Create these endpoints in your Xano `api:AUTH` group:

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login` | POST | None | Login with email/password |
| `/auth/signup` | POST | None | Register with invite token |
| `/auth/logout` | POST | JWT | Clear session |
| `/auth/me` | GET | JWT | Get current user + permissions |
| `/auth/forgot-password` | POST | None | Request password reset |
| `/invites/validate` | POST | None | Validate invite token |
| `/invites/create` | POST | JWT | Create new invite |

---

## CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `auth---visible` | Show only when logged **IN** |
| `auth---invisible` | Show only when logged **OUT** |
| `auth---required` | On body: redirect to /login if not logged in |
| `w-condition-invisible` | Webflow's native hide class (used internally) |

## Data Attributes Reference

| Attribute | Purpose |
|-----------|---------|
| `data-role-visible="role1,role2"` | Show for specific roles |
| `data-sub-role-visible="father,mother"` | Show for family sub-roles |
| `data-user-name` | Displays "First Last" |
| `data-user-first-name` | Displays first name |
| `data-user-last-name` | Displays last name |
| `data-user-email` | Displays email |
| `data-user-role` | Displays role/sub_role |
| `data-user-avatar` | Sets img src to profile photo |

---

## Quick Test

After setup, open browser console and test:

```javascript
// Check if auth is ready
console.log('Ready:', XanoAuth.isAuthenticated());

// Test login
XanoAuth.login('test@example.com', 'password123').then(console.log);

// Check user
console.log('User:', XanoAuth.getUser());

// Logout
XanoAuth.logout();
```

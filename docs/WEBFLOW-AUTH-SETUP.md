# Webflow + Xano Auth Setup Guide

## Quick Start

### 1. Add to Webflow Custom Code (Footer)

Go to **Project Settings > Custom Code > Footer Code** and paste:

```html
<script>
// Copy the entire contents of xano-auth-webflow.js here
// Or link to hosted version:
</script>
<script src="https://your-cdn.com/xano-auth-webflow.js"></script>
```

### 2. Update the API URL

In the script, find and update this line with your Xano Auth API endpoint:

```javascript
const XANO_AUTH_API_URL = 'https://xerb-qpd6-hd8t.n7.xano.io/api:AUTH';
```

---

## CSS Classes for Visibility

Add these classes to any element in Webflow:

| Class | When Visible |
|-------|--------------|
| `auth---visible` | Only when logged **IN** |
| `auth---invisible` | Only when logged **OUT** |
| `hidden` | Hidden (used internally) |

### Page Protection

Add `auth---required` class to the **Body** element to require login:
- If not logged in → redirects to `/login`
- Original URL is saved for redirect after login

---

## Data Attributes

### Role-Based Visibility

Show elements only for specific roles:

```html
<!-- Student only -->
<div data-role-visible="student">Student content</div>

<!-- Instructor and Admin -->
<div data-role-visible="instructor,admin">Staff content</div>

<!-- Family members only -->
<div data-role-visible="family_member">Family content</div>
```

### Sub-Role Visibility (Family Members)

```html
<!-- Father only -->
<div data-sub-role-visible="father">Father view</div>

<!-- Mother only -->
<div data-sub-role-visible="mother">Mother view</div>

<!-- Supporter only -->
<div data-sub-role-visible="supporter">Supporter view</div>
```

### User Data Display

```html
<!-- Shows: "John Smith" -->
<span data-user-name></span>

<!-- Shows: "John" -->
<span data-user-first-name></span>

<!-- Shows: "john@email.com" -->
<span data-user-email></span>

<!-- Shows: "student" or "family member (father)" -->
<span data-user-role></span>

<!-- Sets src to profile image -->
<img data-user-avatar src="/default-avatar.jpg" />
```

---

## Login Form Example

```html
<form id="login-form">
  <input type="email" id="login-email" placeholder="Email" required />
  <input type="password" id="login-password" placeholder="Password" required />
  <div id="login-error" style="display:none; color:red;"></div>
  <button type="submit">Sign In</button>
</form>

<script>
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  errorEl.style.display = 'none';

  const result = await XanoAuth.login(email, password);

  if (result.success) {
    // Redirect to saved URL or dashboard
    window.location.href = XanoAuth.getRedirectUrl();
    XanoAuth.clearRedirectUrl();
  } else {
    errorEl.textContent = result.error;
    errorEl.style.display = 'block';
  }
});
</script>
```

---

## Register Form Example (with Invite Token)

```html
<form id="register-form">
  <input type="email" id="reg-email" readonly />
  <input type="text" id="reg-first-name" placeholder="First Name" required />
  <input type="text" id="reg-last-name" placeholder="Last Name" required />
  <input type="password" id="reg-password" placeholder="Password (min 8 chars)" required />
  <input type="tel" id="reg-phone" placeholder="Phone (optional)" />
  <div id="reg-role"></div>
  <div id="reg-error" style="display:none; color:red;"></div>
  <button type="submit">Create Account</button>
</form>

<script>
// Get token from URL: /register?token=xxx
const urlParams = new URLSearchParams(window.location.search);
const inviteToken = urlParams.get('token');

if (!inviteToken) {
  document.getElementById('register-form').innerHTML =
    '<p style="color:red;">No invite token. You need an invitation to register.</p>';
} else {
  // Validate invite on load
  XanoAuth.validateInvite(inviteToken).then(validation => {
    if (!validation.valid) {
      document.getElementById('register-form').innerHTML =
        '<p style="color:red;">' + validation.error + '</p>';
    } else {
      document.getElementById('reg-email').value = validation.invite.email;
      document.getElementById('reg-role').textContent =
        'Joining as: ' + validation.invite.role.replace('_', ' ');
    }
  });
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById('reg-error');
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
  }
});
</script>
```

---

## Logout Button

```html
<button onclick="XanoAuth.logout()">Logout</button>
```

---

## Invite Family Member Form (Students Only)

```html
<div data-role-visible="student">
  <h3>Invite Family Member</h3>
  <form id="invite-form">
    <input type="email" id="invite-email" placeholder="Family member email" required />
    <select id="invite-relationship" required>
      <option value="">Select relationship</option>
      <option value="father">Father</option>
      <option value="mother">Mother</option>
      <option value="supporter">Supporter</option>
    </select>
    <div id="invite-success" style="display:none; color:green;"></div>
    <div id="invite-error" style="display:none; color:red;"></div>
    <button type="submit">Send Invite</button>
  </form>
</div>

<script>
document.getElementById('invite-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('invite-email').value;
  const relationship = document.getElementById('invite-relationship').value;
  const successEl = document.getElementById('invite-success');
  const errorEl = document.getElementById('invite-error');

  successEl.style.display = 'none';
  errorEl.style.display = 'none';

  const result = await XanoAuth.createInvite(email, 'family_member', relationship);

  if (result.success) {
    successEl.textContent = 'Invite sent to ' + email;
    successEl.style.display = 'block';
    document.getElementById('invite-form').reset();
  } else {
    errorEl.textContent = result.error;
    errorEl.style.display = 'block';
  }
});
</script>
```

---

## Support Cards (Student Private Page)

### Display Cards with HTMX

```html
<div id="support-cards-container"
     hx-get="/api/students/{student_id}/support-cards?format=html"
     hx-trigger="load"
     hx-swap="innerHTML">
  Loading support cards...
</div>
```

### Create New Card Form

```html
<div data-role-visible="student">
  <form id="create-card-form">
    <input type="text" id="card-title" placeholder="Card Title" required />
    <input type="text" id="card-subtitle" placeholder="Subtitle" />
    <input type="number" id="card-price" placeholder="Price" step="0.01" />
    <input type="text" id="card-recurring" placeholder="e.g., monthly, one-time" />
    <input type="text" id="card-cta" placeholder="Button text" value="Support Me" />
    <textarea id="card-stripe-embed" placeholder="Paste Stripe embed code here"></textarea>
    <select id="card-visibility">
      <option value="public">Public (anyone)</option>
      <option value="family_only">Family only</option>
      <option value="private">Private (only me)</option>
    </select>
    <button type="submit">Create Card</button>
  </form>
</div>

<script>
document.getElementById('create-card-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const result = await XanoAuth.createSupportCard({
    card_title: document.getElementById('card-title').value,
    card_subtitle: document.getElementById('card-subtitle').value,
    price_amount: document.getElementById('card-price').value,
    price_recurring: document.getElementById('card-recurring').value,
    cta_text: document.getElementById('card-cta').value,
    stripe_embed_code: document.getElementById('card-stripe-embed').value,
    visibility: document.getElementById('card-visibility').value
  });

  if (result.success) {
    alert('Card created!');
    location.reload(); // Refresh to see new card
  } else {
    alert('Error: ' + result.error);
  }
});
</script>
```

---

## Event Listeners

Listen for auth events:

```javascript
// When auth is ready
window.addEventListener('xano-auth-ready', (e) => {
  console.log('Auth ready:', e.detail.isAuthenticated, e.detail.user);
});

// After login
window.addEventListener('xano-auth-login', (e) => {
  console.log('User logged in:', e.detail.user);
});

// After signup
window.addEventListener('xano-auth-signup', (e) => {
  console.log('User signed up:', e.detail.user);
});

// After logout
window.addEventListener('xano-auth-logout', () => {
  console.log('User logged out');
});
```

---

## API Reference

### Authentication

| Method | Description |
|--------|-------------|
| `XanoAuth.login(email, password)` | Login, returns `{success, user}` or `{success, error}` |
| `XanoAuth.signup(token, {email, password, first_name, last_name, phone})` | Register with invite |
| `XanoAuth.logout()` | Logout and redirect to home |
| `XanoAuth.forgotPassword(email)` | Request password reset |

### User State

| Method | Description |
|--------|-------------|
| `XanoAuth.isAuthenticated()` | Returns `true` if logged in |
| `XanoAuth.getUser()` | Returns current user object or `null` |
| `XanoAuth.getToken()` | Returns auth token or `null` |
| `XanoAuth.getPermissions()` | Returns permissions object |

### Role Checks

| Method | Description |
|--------|-------------|
| `XanoAuth.isStudent()` | Returns `true` if user is a student |
| `XanoAuth.isInstructor()` | Returns `true` if user is an instructor |
| `XanoAuth.isFamilyMember()` | Returns `true` if user is a family member |
| `XanoAuth.isAdmin()` | Returns `true` if user is admin |
| `XanoAuth.isFather()` | Returns `true` if sub_role is father |
| `XanoAuth.isMother()` | Returns `true` if sub_role is mother |
| `XanoAuth.isSupporter()` | Returns `true` if sub_role is supporter |

### Invites

| Method | Description |
|--------|-------------|
| `XanoAuth.validateInvite(token)` | Validate invite, returns `{valid, invite}` |
| `XanoAuth.createInvite(email, role, subRole, targetStudentId)` | Create invite |

### Support Cards

| Method | Description |
|--------|-------------|
| `XanoAuth.getSupportCards(studentId, format)` | Get cards (format: 'json' or 'html') |
| `XanoAuth.createSupportCard(data)` | Create a new support card |

### Utilities

| Method | Description |
|--------|-------------|
| `XanoAuth.updateUI()` | Manually refresh visibility classes |
| `XanoAuth.getDashboardUrl()` | Get role-appropriate dashboard URL |
| `XanoAuth.getRedirectUrl()` | Get saved redirect URL after login |
| `XanoAuth.clearRedirectUrl()` | Clear saved redirect URL |

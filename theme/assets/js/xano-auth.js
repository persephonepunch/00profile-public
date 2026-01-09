/**
 * Xano Authentication Module for Eleventy Static Site
 * Replaces Auth0 with Xano's built-in authentication
 *
 * Usage:
 *   - Include this script in your HTML
 *   - XanoAuth.initialize() runs automatically on DOMContentLoaded
 *   - Use CSS classes for visibility: .auth---visible, .auth---invisible
 *   - Use data-role-visible="role1,role2" for role-based content
 */

const XanoAuth = (function() {
  // Configuration - will be set from window.ENV_CONFIG or meta tags
  const CONFIG = {
    API_BASE_URL: '',
    TOKEN_KEY: 'xano_auth_token',
    USER_KEY: 'xano_user',
    PERMISSIONS_KEY: 'xano_permissions'
  };

  // State
  let currentUser = null;
  let authToken = null;
  let permissions = null;
  let isInitialized = false;

  // ============================================
  // INITIALIZATION
  // ============================================

  function loadConfig() {
    // Try window.ENV_CONFIG first (from Eleventy)
    if (window.ENV_CONFIG && window.ENV_CONFIG.XANO_AUTH_API_URL) {
      CONFIG.API_BASE_URL = window.ENV_CONFIG.XANO_AUTH_API_URL;
    }
    // Fallback to meta tag
    else {
      const metaUrl = document.querySelector('meta[name="xano-auth-url"]');
      if (metaUrl) {
        CONFIG.API_BASE_URL = metaUrl.content;
      }
    }

    if (!CONFIG.API_BASE_URL) {
      console.warn('XanoAuth: No API URL configured. Set XANO_AUTH_API_URL in env or add meta[name="xano-auth-url"]');
    }
  }

  // ============================================
  // STORAGE HELPERS
  // ============================================

  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('XanoAuth: Failed to save to localStorage:', e);
    }
  }

  function getFromStorage(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error('XanoAuth: Failed to read from localStorage:', e);
      return null;
    }
  }

  function clearStorage() {
    localStorage.removeItem(CONFIG.TOKEN_KEY);
    localStorage.removeItem(CONFIG.USER_KEY);
    localStorage.removeItem(CONFIG.PERMISSIONS_KEY);
  }

  // ============================================
  // API HELPERS
  // ============================================

  async function apiRequest(endpoint, method = 'GET', body = null, requiresAuth = false) {
    if (!CONFIG.API_BASE_URL) {
      throw new Error('XanoAuth: API URL not configured');
    }

    const headers = {
      'Content-Type': 'application/json'
    };

    if (requiresAuth && authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const options = {
      method,
      headers
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, options);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || data.error || 'Request failed');
        error.code = data.code || 'UNKNOWN_ERROR';
        error.status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      if (error.status === 401) {
        // Token expired or invalid, clear auth
        clearStorage();
        authToken = null;
        currentUser = null;
        permissions = null;
        updateUI();
      }
      throw error;
    }
  }

  // ============================================
  // AUTH METHODS
  // ============================================

  async function initialize() {
    if (isInitialized) return { isAuthenticated: !!currentUser, user: currentUser };

    loadConfig();

    // Load stored auth data
    authToken = getFromStorage(CONFIG.TOKEN_KEY);
    currentUser = getFromStorage(CONFIG.USER_KEY);
    permissions = getFromStorage(CONFIG.PERMISSIONS_KEY);

    // Validate token if exists
    if (authToken) {
      try {
        const response = await apiRequest('/auth/me', 'GET', null, true);
        currentUser = response.user;
        permissions = response.permissions;
        saveToStorage(CONFIG.USER_KEY, currentUser);
        saveToStorage(CONFIG.PERMISSIONS_KEY, permissions);
      } catch (error) {
        // Token invalid, clear storage
        console.log('XanoAuth: Token validation failed, clearing session');
        clearStorage();
        authToken = null;
        currentUser = null;
        permissions = null;
      }
    }

    isInitialized = true;
    updateUI();

    // Dispatch event for other scripts to listen to
    window.dispatchEvent(new CustomEvent('xano-auth-ready', {
      detail: { isAuthenticated: !!currentUser, user: currentUser }
    }));

    return { isAuthenticated: !!currentUser, user: currentUser };
  }

  async function login(email, password) {
    try {
      const response = await apiRequest('/auth/login', 'POST', { email, password });

      authToken = response.authToken;
      currentUser = response.user;

      saveToStorage(CONFIG.TOKEN_KEY, authToken);
      saveToStorage(CONFIG.USER_KEY, currentUser);

      // Fetch full user data with permissions
      const meResponse = await apiRequest('/auth/me', 'GET', null, true);
      permissions = meResponse.permissions;
      saveToStorage(CONFIG.PERMISSIONS_KEY, permissions);

      updateUI();

      window.dispatchEvent(new CustomEvent('xano-auth-login', {
        detail: { user: currentUser }
      }));

      return { success: true, user: currentUser };
    } catch (error) {
      return { success: false, error: error.message, code: error.code };
    }
  }

  async function signup(inviteToken, userData) {
    try {
      const response = await apiRequest('/auth/signup', 'POST', {
        invite_token: inviteToken,
        email: userData.email,
        password: userData.password,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || ''
      });

      authToken = response.authToken;
      currentUser = response.user;

      saveToStorage(CONFIG.TOKEN_KEY, authToken);
      saveToStorage(CONFIG.USER_KEY, currentUser);

      // Fetch full user data with permissions
      const meResponse = await apiRequest('/auth/me', 'GET', null, true);
      permissions = meResponse.permissions;
      saveToStorage(CONFIG.PERMISSIONS_KEY, permissions);

      updateUI();

      window.dispatchEvent(new CustomEvent('xano-auth-signup', {
        detail: { user: currentUser }
      }));

      return { success: true, user: currentUser };
    } catch (error) {
      return { success: false, error: error.message, code: error.code };
    }
  }

  async function logout() {
    try {
      if (authToken) {
        await apiRequest('/auth/logout', 'POST', null, true);
      }
    } catch (error) {
      console.warn('XanoAuth: Logout API call failed:', error);
    } finally {
      clearStorage();
      authToken = null;
      currentUser = null;
      permissions = null;
      updateUI();

      window.dispatchEvent(new CustomEvent('xano-auth-logout'));

      // Redirect to home
      window.location.href = '/';
    }
  }

  async function forgotPassword(email) {
    try {
      const response = await apiRequest('/auth/forgot-password', 'POST', { email });
      return { success: true, message: response.message };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async function validateInvite(token) {
    try {
      const response = await apiRequest('/invites/validate', 'POST', { token });
      return response;
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  async function createInvite(email, role, subRole = null, targetStudentId = null) {
    try {
      const response = await apiRequest('/invites/create', 'POST', {
        email,
        role,
        sub_role: subRole,
        target_student_id: targetStudentId
      }, true);
      return { success: true, invite: response.invite };
    } catch (error) {
      return { success: false, error: error.message, code: error.code };
    }
  }

  async function getCurrentUser(forceRefresh = false) {
    if (!authToken) return null;

    if (!forceRefresh && currentUser) {
      return { user: currentUser, permissions };
    }

    try {
      const response = await apiRequest('/auth/me', 'GET', null, true);
      currentUser = response.user;
      permissions = response.permissions;
      saveToStorage(CONFIG.USER_KEY, currentUser);
      saveToStorage(CONFIG.PERMISSIONS_KEY, permissions);
      return response;
    } catch (error) {
      return null;
    }
  }

  // ============================================
  // SUPPORT CARDS (HTMX Integration)
  // ============================================

  async function getSupportCards(studentId, format = 'json') {
    try {
      const endpoint = `/students/${studentId}/support-cards${format === 'html' ? '?format=html' : ''}`;
      const response = await apiRequest(endpoint, 'GET', null, !!authToken);
      return response;
    } catch (error) {
      return { error: error.message };
    }
  }

  async function createSupportCard(cardData) {
    try {
      const response = await apiRequest('/support-cards', 'POST', cardData, true);
      return { success: true, card: response.card };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ============================================
  // UI UPDATE METHODS
  // ============================================

  function updateUI() {
    const isAuthenticated = !!currentUser;

    // Update elements with auth-visible / auth-invisible classes (Auth0 pattern)
    document.querySelectorAll('.auth---visible').forEach(el => {
      if (isAuthenticated) {
        el.classList.remove('hidden');
        el.style.visibility = 'visible';
      } else {
        el.classList.add('hidden');
        el.style.visibility = 'hidden';
      }
    });

    document.querySelectorAll('.auth---invisible').forEach(el => {
      if (!isAuthenticated) {
        el.classList.remove('hidden');
        el.style.visibility = 'visible';
      } else {
        el.classList.add('hidden');
        el.style.visibility = 'hidden';
      }
    });

    // Update role-based visibility
    document.querySelectorAll('[data-role-visible]').forEach(el => {
      const allowedRoles = el.dataset.roleVisible.split(',').map(r => r.trim());
      if (currentUser && allowedRoles.includes(currentUser.role)) {
        el.classList.remove('hidden');
        el.style.visibility = 'visible';
        el.style.display = '';
      } else {
        el.classList.add('hidden');
        el.style.visibility = 'hidden';
      }
    });

    // Update sub-role visibility (for family members)
    document.querySelectorAll('[data-sub-role-visible]').forEach(el => {
      const allowedSubRoles = el.dataset.subRoleVisible.split(',').map(r => r.trim());
      if (currentUser && currentUser.sub_role && allowedSubRoles.includes(currentUser.sub_role)) {
        el.classList.remove('hidden');
        el.style.visibility = 'visible';
        el.style.display = '';
      } else {
        el.classList.add('hidden');
        el.style.visibility = 'hidden';
      }
    });

    // Update user info displays
    if (currentUser) {
      document.querySelectorAll('[data-user-name]').forEach(el => {
        el.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
      });

      document.querySelectorAll('[data-user-first-name]').forEach(el => {
        el.textContent = currentUser.first_name;
      });

      document.querySelectorAll('[data-user-email]').forEach(el => {
        el.textContent = currentUser.email;
      });

      document.querySelectorAll('[data-user-role]').forEach(el => {
        const roleText = currentUser.sub_role
          ? `${currentUser.role} (${currentUser.sub_role})`
          : currentUser.role;
        el.textContent = roleText.replace(/_/g, ' ');
      });

      document.querySelectorAll('[data-user-avatar]').forEach(el => {
        if (currentUser.profile_image_url) {
          el.src = currentUser.profile_image_url;
        }
      });
    }

    // Protect pages that require auth
    if (document.body.classList.contains('auth---required') && !isAuthenticated) {
      // Store intended destination
      sessionStorage.setItem('xano_redirect_after_login', window.location.href);
      window.location.href = '/login';
    }

    // Load HTMX content based on auth
    loadHtmxContent();
  }

  function loadHtmxContent() {
    // Trigger HTMX loads for auth-dependent content
    document.querySelectorAll('[data-htmx-auth-load]').forEach(el => {
      const studentId = el.dataset.studentId || (currentUser ? currentUser.id : null);
      if (studentId && window.htmx) {
        const url = `${CONFIG.API_BASE_URL}/students/${studentId}/support-cards?format=html`;
        el.setAttribute('hx-get', url);
        if (authToken) {
          el.setAttribute('hx-headers', JSON.stringify({ 'Authorization': `Bearer ${authToken}` }));
        }
        window.htmx.trigger(el, 'load');
      }
    });
  }

  // ============================================
  // PERMISSION HELPERS
  // ============================================

  function hasRole(role) {
    return currentUser?.role === role;
  }

  function hasAnyRole(roles) {
    return roles.includes(currentUser?.role);
  }

  function hasSubRole(subRole) {
    return currentUser?.sub_role === subRole;
  }

  function isStudent() {
    return hasRole('student');
  }

  function isInstructor() {
    return hasRole('instructor');
  }

  function isFamilyMember() {
    return hasRole('family_member');
  }

  function isAdmin() {
    return hasRole('admin');
  }

  function isFather() {
    return hasSubRole('father');
  }

  function isMother() {
    return hasSubRole('mother');
  }

  function isSupporter() {
    return hasSubRole('supporter');
  }

  function canInviteFamily() {
    return isStudent() || isAdmin();
  }

  function canInviteStudents() {
    return isInstructor() || isAdmin();
  }

  function canViewLoans() {
    return permissions?.can_view_own_loans || permissions?.can_view_student_loans;
  }

  function canCreateSupportCards() {
    return permissions?.can_create_support_cards;
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  function getRedirectUrl() {
    return sessionStorage.getItem('xano_redirect_after_login') || getDashboardUrl();
  }

  function clearRedirectUrl() {
    sessionStorage.removeItem('xano_redirect_after_login');
  }

  function getDashboardUrl() {
    if (!currentUser) return '/';

    switch (currentUser.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'instructor':
        return '/instructor/dashboard';
      case 'family_member':
        return '/family/dashboard';
      case 'student':
      default:
        return '/student/dashboard';
    }
  }

  // ============================================
  // PUBLIC API
  // ============================================

  return {
    // Core auth
    initialize,
    login,
    signup,
    logout,
    forgotPassword,

    // Invites
    validateInvite,
    createInvite,

    // User data
    getCurrentUser,
    isAuthenticated: () => !!currentUser,
    getUser: () => currentUser,
    getToken: () => authToken,
    getPermissions: () => permissions,

    // Support cards
    getSupportCards,
    createSupportCard,

    // Role checks
    hasRole,
    hasAnyRole,
    hasSubRole,
    isStudent,
    isInstructor,
    isFamilyMember,
    isAdmin,
    isFather,
    isMother,
    isSupporter,

    // Permission checks
    canInviteFamily,
    canInviteStudents,
    canViewLoans,
    canCreateSupportCards,

    // UI
    updateUI,

    // Utilities
    getRedirectUrl,
    clearRedirectUrl,
    getDashboardUrl
  };
})();

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', async () => {
  await XanoAuth.initialize();
});

// Export for ES modules if needed
if (typeof module !== 'undefined' && module.exports) {
  module.exports = XanoAuth;
}

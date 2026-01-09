/**
 * Xano Authentication - Webflow + 11ty Compatible
 *
 * WEBFLOW SETUP:
 * 1. Go to Project Settings > Custom Code > Footer Code
 * 2. Paste this entire script inside <script></script> tags
 * 3. Update XANO_AUTH_API_URL below with your Xano API endpoint
 *
 * 11TY SETUP:
 * 1. Include this file in your theme/assets/js/ folder
 * 2. Add <script src="/assets/js/xano-auth-webflow.js"></script> to your templates
 *
 * CSS CLASSES FOR VISIBILITY:
 * - .auth---visible     → Shows only when logged IN
 * - .auth---invisible   → Shows only when logged OUT
 * - .auth---required    → On <body>, redirects to /login if not logged in
 *
 * DATA ATTRIBUTES:
 * - data-role-visible="student,instructor"  → Shows for specific roles
 * - data-sub-role-visible="father,mother"   → Shows for family sub-roles
 * - data-user-name                          → Displays user's full name
 * - data-user-first-name                    → Displays user's first name
 * - data-user-email                         → Displays user's email
 * - data-user-role                          → Displays user's role
 * - data-user-avatar                        → Sets src to profile image
 *
 * CARD STACKS API:
 * - XanoAuth.getStacks()                    → Get all user's stacks
 * - XanoAuth.createStack(name, desc, opts)  → Create new stack
 * - XanoAuth.getStack(stackId)              → Get stack with cards
 * - XanoAuth.updateStack(stackId, data)     → Update stack
 * - XanoAuth.deleteStack(stackId)           → Delete stack
 * - XanoAuth.addCardToStack(stackId, cardId) → Add card to stack
 * - XanoAuth.removeCardFromStack(stackId, cardId) → Remove card
 * - XanoAuth.reorderStackCards(stackId, cardIds)  → Reorder cards
 *
 * SHARING API:
 * - XanoAuth.generateShareLink(stackId, opts) → Create shareable link
 * - XanoAuth.shareWithEmail(stackId, email)   → Share with specific person
 * - XanoAuth.getSharePermissions(stackId)     → Get sharing settings
 * - XanoAuth.revokeShare(stackId, shareId)    → Revoke access
 * - XanoAuth.getEmbedCode(stackId, opts)      → Get embed code
 *
 * PUBLIC ACCESS:
 * - XanoAuth.getPublicStack(studentSlug, stackSlug, token, password)
 *
 * CONSENT MANAGEMENT:
 * - XanoAuth.getConsent()                    → Get user's consent settings
 * - XanoAuth.updateConsent(type, granted)    → Update consent (peer_offers, sponsor_offers, marketing)
 * - XanoAuth.getConsentHistory(page, perPage) → Get consent change history
 *
 * PEER TRANSACTIONS (Venmo-style):
 * - XanoAuth.sendPeerOffer(recipientId, type, opts) → Send offer/gift/coupon
 * - XanoAuth.getPeerInbox(status, page, perPage)    → Get incoming offers
 * - XanoAuth.respondToPeerOffer(txnId, action)      → Accept/decline/block
 * - XanoAuth.getPeerHistory(direction, status)      → Transaction history
 */

(function() {
  'use strict';

  // =============================================
  // CONFIGURATION - UPDATE THIS FOR YOUR PROJECT
  // =============================================
  const XANO_AUTH_API_URL = 'https://xerb-qpd6-hd8t.n7.xano.io/api:AUTH';
  // =============================================

  const STORAGE_KEYS = {
    token: 'xano_auth_token',
    user: 'xano_user',
    permissions: 'xano_permissions'
  };

  // State
  let state = {
    user: null,
    token: null,
    permissions: null,
    initialized: false
  };

  // ============================================
  // STORAGE
  // ============================================

  function save(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('XanoAuth: localStorage error', e);
    }
  }

  function load(key) {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      return null;
    }
  }

  function clearAll() {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
    state = { user: null, token: null, permissions: null, initialized: true };
  }

  // ============================================
  // API
  // ============================================

  async function api(endpoint, method = 'GET', body = null, auth = false) {
    const headers = { 'Content-Type': 'application/json' };

    if (auth && state.token) {
      headers['Authorization'] = 'Bearer ' + state.token;
    }

    const opts = { method, headers };
    if (body && method !== 'GET') {
      opts.body = JSON.stringify(body);
    }

    const res = await fetch(XANO_AUTH_API_URL + endpoint, opts);
    const data = await res.json();

    if (!res.ok) {
      const err = new Error(data.message || 'Request failed');
      err.code = data.code;
      err.status = res.status;
      if (res.status === 401) {
        clearAll();
        updateUI();
      }
      throw err;
    }

    return data;
  }

  // ============================================
  // AUTH FUNCTIONS
  // ============================================

  async function initialize() {
    if (state.initialized) return;

    state.token = load(STORAGE_KEYS.token);
    state.user = load(STORAGE_KEYS.user);
    state.permissions = load(STORAGE_KEYS.permissions);

    if (state.token) {
      try {
        const res = await api('/auth/me', 'GET', null, true);
        state.user = res.user;
        state.permissions = res.permissions;
        save(STORAGE_KEYS.user, state.user);
        save(STORAGE_KEYS.permissions, state.permissions);
      } catch (e) {
        console.log('XanoAuth: Session expired');
        clearAll();
      }
    }

    state.initialized = true;
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
      save(STORAGE_KEYS.token, state.token);
      save(STORAGE_KEYS.user, state.user);

      // Get full permissions
      const me = await api('/auth/me', 'GET', null, true);
      state.permissions = me.permissions;
      save(STORAGE_KEYS.permissions, state.permissions);

      updateUI();
      return { success: true, user: state.user };
    } catch (e) {
      return { success: false, error: e.message, code: e.code };
    }
  }

  async function signup(inviteToken, data) {
    try {
      const res = await api('/auth/signup', 'POST', {
        invite_token: inviteToken,
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name
      });

      state.token = res.authToken;
      state.user = res.user;
      save(STORAGE_KEYS.token, state.token);
      save(STORAGE_KEYS.user, state.user);

      const me = await api('/auth/me', 'GET', null, true);
      state.permissions = me.permissions;
      save(STORAGE_KEYS.permissions, state.permissions);

      updateUI();
      return { success: true, user: state.user };
    } catch (e) {
      return { success: false, error: e.message, code: e.code };
    }
  }

  async function logout() {
    try {
      if (state.token) await api('/auth/logout', 'POST', null, true);
    } catch (e) {}
    clearAll();
    updateUI();
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

  async function createInvite(email, role, subRole, targetStudentId) {
    try {
      const res = await api('/invites/create', 'POST', {
        email, role, sub_role: subRole, target_student_id: targetStudentId
      }, true);
      return { success: true, invite: res.invite };
    } catch (e) {
      return { success: false, error: e.message, code: e.code };
    }
  }

  // ============================================
  // SUPPORT CARDS
  // ============================================

  async function getSupportCards(studentId, format) {
    try {
      const fmt = format === 'html' ? '?format=html' : '';
      return await api('/students/' + studentId + '/support-cards' + fmt, 'GET', null, !!state.token);
    } catch (e) {
      return { error: e.message };
    }
  }

  async function createSupportCard(data) {
    try {
      const res = await api('/support-cards', 'POST', data, true);
      return { success: true, card: res.card };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ============================================
  // CARD STACKS
  // ============================================

  async function getStacks() {
    try {
      return await api('/stacks', 'GET', null, true);
    } catch (e) {
      return { error: e.message };
    }
  }

  async function createStack(name, description, options = {}) {
    try {
      const res = await api('/stacks', 'POST', {
        stack_name: name,
        description,
        cover_image_url: options.coverImageUrl || null,
        theme_color: options.themeColor || '#8B0000',
        visibility: options.visibility || 'public',
        is_default: options.isDefault || false
      }, true);
      return { success: true, stack: res.stack };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function getStack(stackId) {
    try {
      return await api('/stacks/' + stackId, 'GET', null, true);
    } catch (e) {
      return { error: e.message };
    }
  }

  async function updateStack(stackId, data) {
    try {
      const res = await api('/stacks/' + stackId, 'PUT', {
        stack_name: data.name,
        description: data.description,
        cover_image_url: data.coverImageUrl,
        theme_color: data.themeColor,
        visibility: data.visibility,
        is_default: data.isDefault,
        display_order: data.displayOrder
      }, true);
      return { success: true, stack: res.stack };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function deleteStack(stackId) {
    try {
      await api('/stacks/' + stackId, 'DELETE', null, true);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function addCardToStack(stackId, cardId, displayOrder) {
    try {
      const res = await api('/stacks/' + stackId + '/cards', 'POST', {
        support_card_id: cardId,
        display_order: displayOrder
      }, true);
      return { success: true, stackCard: res.stack_card, card: res.card };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function removeCardFromStack(stackId, cardId) {
    try {
      await api('/stacks/' + stackId + '/cards/' + cardId, 'DELETE', null, true);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function reorderStackCards(stackId, cardIds) {
    try {
      await api('/stacks/' + stackId + '/reorder', 'PUT', { card_ids: cardIds }, true);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ============================================
  // STACK SHARING
  // ============================================

  async function generateShareLink(stackId, options = {}) {
    try {
      const res = await api('/stacks/' + stackId + '/share-link', 'POST', {
        link_type: options.linkType || 'unlisted',
        password: options.password || null,
        expires_at: options.expiresAt || null,
        max_views: options.maxViews || null
      }, true);
      return { success: true, shareLink: res.share_link, url: res.url };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function shareWithEmail(stackId, email, permission = 'view') {
    try {
      const res = await api('/stacks/' + stackId + '/share', 'POST', {
        email,
        permission_level: permission
      }, true);
      return { success: true, permission: res.permission };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function getSharePermissions(stackId) {
    try {
      const res = await api('/stacks/' + stackId, 'GET', null, true);
      return { permissions: res.share_permissions, links: res.share_links };
    } catch (e) {
      return { error: e.message };
    }
  }

  async function revokeShare(stackId, shareId, type = 'permission') {
    try {
      await api('/stacks/' + stackId + '/share/' + shareId + '?type=' + type, 'DELETE', null, true);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function getEmbedCode(stackId, options = {}) {
    try {
      const params = new URLSearchParams({
        theme: options.theme || 'light',
        width: options.width || 400,
        height: options.height || 600
      });
      const res = await api('/stacks/' + stackId + '/embed?' + params.toString(), 'GET', null, true);
      return res;
    } catch (e) {
      return { error: e.message };
    }
  }

  // ============================================
  // CONSENT MANAGEMENT
  // ============================================

  async function getConsent() {
    try {
      return await api('/consent', 'GET', null, true);
    } catch (e) {
      return { error: e.message };
    }
  }

  async function updateConsent(consentType, granted) {
    try {
      const res = await api('/consent', 'PUT', {
        consent_type: consentType,
        granted: granted
      }, true);
      return { success: true, consent: res.consent };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  async function getConsentHistory(page = 1, perPage = 20) {
    try {
      return await api('/consent/history?page=' + page + '&per_page=' + perPage, 'GET', null, true);
    } catch (e) {
      return { error: e.message };
    }
  }

  // ============================================
  // PEER TRANSACTIONS
  // ============================================

  async function sendPeerOffer(recipientId, type, options = {}) {
    try {
      const res = await api('/peer/send', 'POST', {
        recipient_id: recipientId,
        type: type,
        message: options.message || null,
        offer_id: options.offerId || null,
        value_type: options.valueType || null,
        value_amount: options.valueAmount || null,
        value_description: options.valueDescription || null,
        expires_in_days: options.expiresInDays || 30
      }, true);
      return { success: true, transaction: res.transaction };
    } catch (e) {
      return { success: false, error: e.message, code: e.code };
    }
  }

  async function getPeerInbox(status = 'pending', page = 1, perPage = 20) {
    try {
      const params = new URLSearchParams({
        status: status,
        page: page,
        per_page: perPage
      });
      return await api('/peer/inbox?' + params.toString(), 'GET', null, true);
    } catch (e) {
      return { error: e.message };
    }
  }

  async function respondToPeerOffer(transactionId, action) {
    try {
      const res = await api('/peer/respond', 'POST', {
        transaction_id: transactionId,
        action: action
      }, true);
      return { success: true, transaction: res.transaction, message: res.message };
    } catch (e) {
      return { success: false, error: e.message, code: e.code };
    }
  }

  async function getPeerHistory(direction = 'all', status = 'all', page = 1, perPage = 20) {
    try {
      const params = new URLSearchParams({
        direction: direction,
        status: status,
        page: page,
        per_page: perPage
      });
      return await api('/peer/history?' + params.toString(), 'GET', null, true);
    } catch (e) {
      return { error: e.message };
    }
  }

  // ============================================
  // PUBLIC STACK ACCESS
  // ============================================

  async function getPublicStack(studentSlug, stackSlug, token, password) {
    try {
      let endpoint = '/public/stacks/' + studentSlug;
      if (stackSlug) endpoint += '/' + stackSlug;

      const params = new URLSearchParams();
      if (token) params.set('t', token);
      if (password) params.set('p', password);

      const queryString = params.toString();
      if (queryString) endpoint += '?' + queryString;

      return await api(endpoint, 'GET');
    } catch (e) {
      return { error: e.message, status: e.status };
    }
  }

  // ============================================
  // UI UPDATE
  // ============================================

  function updateUI() {
    const loggedIn = !!state.user;

    // Auth visibility classes
    document.querySelectorAll('.auth---visible').forEach(el => {
      el.style.display = loggedIn ? '' : 'none';
      el.style.visibility = loggedIn ? 'visible' : 'hidden';
      el.classList.toggle('hidden', !loggedIn);
    });

    document.querySelectorAll('.auth---invisible').forEach(el => {
      el.style.display = loggedIn ? 'none' : '';
      el.style.visibility = loggedIn ? 'hidden' : 'visible';
      el.classList.toggle('hidden', loggedIn);
    });

    // Role visibility
    document.querySelectorAll('[data-role-visible]').forEach(el => {
      const roles = el.dataset.roleVisible.split(',').map(r => r.trim());
      const show = state.user && roles.includes(state.user.role);
      el.style.display = show ? '' : 'none';
      el.classList.toggle('hidden', !show);
    });

    // Sub-role visibility
    document.querySelectorAll('[data-sub-role-visible]').forEach(el => {
      const roles = el.dataset.subRoleVisible.split(',').map(r => r.trim());
      const show = state.user && state.user.sub_role && roles.includes(state.user.sub_role);
      el.style.display = show ? '' : 'none';
      el.classList.toggle('hidden', !show);
    });

    // User data display
    if (state.user) {
      document.querySelectorAll('[data-user-name]').forEach(el => {
        el.textContent = state.user.first_name + ' ' + state.user.last_name;
      });
      document.querySelectorAll('[data-user-first-name]').forEach(el => {
        el.textContent = state.user.first_name;
      });
      document.querySelectorAll('[data-user-email]').forEach(el => {
        el.textContent = state.user.email;
      });
      document.querySelectorAll('[data-user-role]').forEach(el => {
        el.textContent = (state.user.sub_role || state.user.role).replace(/_/g, ' ');
      });
      document.querySelectorAll('[data-user-avatar]').forEach(el => {
        if (state.user.profile_image_url) el.src = state.user.profile_image_url;
      });
    }

    // Protected page redirect
    if (document.body.classList.contains('auth---required') && !loggedIn) {
      sessionStorage.setItem('xano_redirect', window.location.href);
      window.location.href = '/login';
    }
  }

  // ============================================
  // ROLE HELPERS
  // ============================================

  function isStudent() { return state.user?.role === 'student'; }
  function isInstructor() { return state.user?.role === 'instructor'; }
  function isFamilyMember() { return state.user?.role === 'family_member'; }
  function isAdmin() { return state.user?.role === 'admin'; }
  function isSponsor() { return state.user?.role === 'sponsor'; }
  function isFather() { return state.user?.sub_role === 'father'; }
  function isMother() { return state.user?.sub_role === 'mother'; }
  function isSupporter() { return state.user?.sub_role === 'supporter'; }

  function getDashboardUrl() {
    if (!state.user) return '/';
    switch (state.user.role) {
      case 'admin': return '/admin/dashboard';
      case 'instructor': return '/instructor/dashboard';
      case 'family_member': return '/family/dashboard';
      default: return '/student/dashboard';
    }
  }

  // ============================================
  // EXPOSE GLOBAL API
  // ============================================

  window.XanoAuth = {
    // Auth
    initialize,
    login,
    signup,
    logout,
    forgotPassword,
    validateInvite,
    createInvite,

    // User
    isAuthenticated: () => !!state.user,
    getUser: () => state.user,
    getToken: () => state.token,
    getPermissions: () => state.permissions,

    // Support cards
    getSupportCards,
    createSupportCard,

    // Card Stacks
    getStacks,
    createStack,
    getStack,
    updateStack,
    deleteStack,
    addCardToStack,
    removeCardFromStack,
    reorderStackCards,

    // Stack Sharing
    generateShareLink,
    shareWithEmail,
    getSharePermissions,
    revokeShare,
    getEmbedCode,

    // Public Stack Access
    getPublicStack,

    // Consent Management
    getConsent,
    updateConsent,
    getConsentHistory,

    // Peer Transactions
    sendPeerOffer,
    getPeerInbox,
    respondToPeerOffer,
    getPeerHistory,

    // Role checks
    isStudent,
    isInstructor,
    isFamilyMember,
    isAdmin,
    isSponsor,
    isFather,
    isMother,
    isSupporter,

    // UI
    updateUI,
    getDashboardUrl,

    // Redirect helpers
    getRedirectUrl: () => sessionStorage.getItem('xano_redirect') || getDashboardUrl(),
    clearRedirectUrl: () => sessionStorage.removeItem('xano_redirect')
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();

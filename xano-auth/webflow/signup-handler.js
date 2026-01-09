/**
 * Signup Form Handler for Webflow
 *
 * SETUP:
 * 1. Include xano-auth-webflow.js first
 * 2. Include this file after
 * 3. Add the form structure from signup-schema.md
 *
 * URL PARAMETERS:
 * - ?token=xxx  - Invite token (required for production)
 * - ?email=xxx  - Pre-fill email
 *
 * EVENTS DISPATCHED:
 * - signup-success: User successfully signed up
 * - signup-error: Signup failed
 * - invite-validated: Invite token was validated
 * - invite-invalid: Invite token was invalid
 */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================

  const CONFIG = {
    // Selectors
    form: '#signup-form',
    emailInput: '#email',
    passwordInput: '#password',
    confirmPasswordInput: '#password_confirm',
    firstNameInput: '#first_name',
    lastNameInput: '#last_name',
    phoneInput: '#phone',
    submitButton: '#signup-submit',

    // State containers
    formError: '#form-error',
    errorMessage: '#error-message',
    inviteInfo: '#invite-info',
    invitedByName: '#invited-by-name',
    inviteRole: '#invite-role',
    loadingState: '#signup-loading',
    successState: '#signup-success',
    invalidInvite: '#invalid-invite',
    invalidMessage: '#invalid-invite-message',

    // Settings
    minPasswordLength: 8,
    redirectDelay: 2000, // ms after success
    allowSignupWithoutInvite: false // Set true for development
  };

  // ============================================
  // STATE
  // ============================================

  let inviteData = null;
  let inviteToken = null;

  // ============================================
  // UTILITIES
  // ============================================

  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return document.querySelectorAll(selector);
  }

  function show(selector) {
    const el = $(selector);
    if (el) {
      el.style.display = '';
      el.classList.add('visible');
      el.classList.remove('hidden');
    }
  }

  function hide(selector) {
    const el = $(selector);
    if (el) {
      el.style.display = 'none';
      el.classList.remove('visible');
      el.classList.add('hidden');
    }
  }

  function setLoading(isLoading) {
    const btn = $(CONFIG.submitButton);
    if (btn) {
      btn.disabled = isLoading;
      btn.textContent = isLoading ? 'Creating Account...' : 'Create Account';
    }

    if (isLoading) {
      show(CONFIG.loadingState);
      hide(CONFIG.form);
    } else {
      hide(CONFIG.loadingState);
      show(CONFIG.form);
    }
  }

  function showError(message) {
    const errorEl = $(CONFIG.errorMessage);
    if (errorEl) errorEl.textContent = message;
    show(CONFIG.formError);

    // Shake animation
    const form = $(CONFIG.form);
    if (form) {
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);
    }

    // Dispatch event
    window.dispatchEvent(new CustomEvent('signup-error', { detail: { message } }));
  }

  function hideError() {
    hide(CONFIG.formError);
  }

  function showSuccess() {
    hide(CONFIG.form);
    hide(CONFIG.loadingState);
    show(CONFIG.successState);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('signup-success', {
      detail: { user: window.XanoAuth.getUser() }
    }));

    // Redirect after delay
    setTimeout(() => {
      const redirectUrl = window.XanoAuth.getRedirectUrl();
      window.XanoAuth.clearRedirectUrl();
      window.location.href = redirectUrl;
    }, CONFIG.redirectDelay);
  }

  function showInvalidInvite(message) {
    hide(CONFIG.form);
    hide(CONFIG.loadingState);
    hide(CONFIG.inviteInfo);

    const msgEl = $(CONFIG.invalidMessage);
    if (msgEl) msgEl.textContent = message;
    show(CONFIG.invalidInvite);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('invite-invalid', { detail: { message } }));
  }

  function formatRole(role) {
    const roleNames = {
      student: 'Student',
      instructor: 'Instructor',
      family_member: 'Family Member',
      admin: 'Administrator',
      sponsor: 'Sponsor'
    };
    return roleNames[role] || role;
  }

  function formatSubRole(subRole) {
    const subRoleNames = {
      father: 'Father',
      mother: 'Mother',
      supporter: 'Supporter'
    };
    return subRoleNames[subRole] || subRole;
  }

  // ============================================
  // URL PARAMETER HANDLING
  // ============================================

  function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      token: params.get('token'),
      email: params.get('email')
    };
  }

  // ============================================
  // INVITE VALIDATION
  // ============================================

  async function validateInviteToken(token) {
    if (!token) {
      if (CONFIG.allowSignupWithoutInvite) {
        return { valid: true, noInvite: true };
      }
      return { valid: false, error: 'No invite token provided' };
    }

    try {
      const result = await window.XanoAuth.validateInvite(token);

      if (result.valid) {
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('invite-validated', {
          detail: { invite: result.invite, invitedBy: result.invited_by }
        }));
      }

      return result;
    } catch (e) {
      return { valid: false, error: e.message };
    }
  }

  function displayInviteInfo(invite, invitedBy) {
    // Show invite info banner
    show(CONFIG.inviteInfo);

    // Set inviter name
    const nameEl = $(CONFIG.invitedByName);
    if (nameEl && invitedBy) {
      nameEl.textContent = `${invitedBy.first_name} ${invitedBy.last_name}`;
    }

    // Set role
    const roleEl = $(CONFIG.inviteRole);
    if (roleEl) {
      let roleText = `You're joining as a ${formatRole(invite.role)}`;
      if (invite.sub_role) {
        roleText += ` (${formatSubRole(invite.sub_role)})`;
      }
      roleEl.textContent = roleText;
    }

    // Pre-fill and lock email
    const emailInput = $(CONFIG.emailInput);
    if (emailInput && invite.email) {
      emailInput.value = invite.email;
      emailInput.readOnly = true;
      emailInput.classList.add('readonly');
    }
  }

  // ============================================
  // FORM VALIDATION
  // ============================================

  function validateForm() {
    const firstName = $(CONFIG.firstNameInput)?.value?.trim();
    const lastName = $(CONFIG.lastNameInput)?.value?.trim();
    const email = $(CONFIG.emailInput)?.value?.trim();
    const password = $(CONFIG.passwordInput)?.value;
    const confirmPassword = $(CONFIG.confirmPasswordInput)?.value;

    // Required fields
    if (!firstName) {
      showError('First name is required');
      $(CONFIG.firstNameInput)?.focus();
      return false;
    }

    if (!lastName) {
      showError('Last name is required');
      $(CONFIG.lastNameInput)?.focus();
      return false;
    }

    if (!email) {
      showError('Email is required');
      $(CONFIG.emailInput)?.focus();
      return false;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Please enter a valid email address');
      $(CONFIG.emailInput)?.focus();
      return false;
    }

    // Password
    if (!password) {
      showError('Password is required');
      $(CONFIG.passwordInput)?.focus();
      return false;
    }

    if (password.length < CONFIG.minPasswordLength) {
      showError(`Password must be at least ${CONFIG.minPasswordLength} characters`);
      $(CONFIG.passwordInput)?.focus();
      return false;
    }

    // Confirm password
    if (password !== confirmPassword) {
      showError('Passwords do not match');
      $(CONFIG.confirmPasswordInput)?.focus();
      return false;
    }

    // Terms checkbox (if exists)
    const termsCheckbox = $('[data-terms-required]');
    if (termsCheckbox && !termsCheckbox.checked) {
      showError('Please agree to the Terms of Service');
      return false;
    }

    return true;
  }

  // ============================================
  // FORM SUBMISSION
  // ============================================

  async function handleSubmit(e) {
    e.preventDefault();
    hideError();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Get form data
    const formData = {
      first_name: $(CONFIG.firstNameInput)?.value?.trim(),
      last_name: $(CONFIG.lastNameInput)?.value?.trim(),
      email: $(CONFIG.emailInput)?.value?.trim(),
      password: $(CONFIG.passwordInput)?.value,
      phone: $(CONFIG.phoneInput)?.value?.trim() || ''
    };

    setLoading(true);

    try {
      let result;

      if (inviteToken) {
        // Signup with invite token
        result = await window.XanoAuth.signup(inviteToken, formData);
      } else if (CONFIG.allowSignupWithoutInvite) {
        // Simple signup (development only)
        result = await signupSimple(formData);
      } else {
        showError('An invite token is required to sign up');
        setLoading(false);
        return;
      }

      if (result.success) {
        showSuccess();
      } else {
        // Map error codes to user-friendly messages
        const errorMessages = {
          'INVALID_TOKEN': 'This invite link is invalid or expired.',
          'TOKEN_USED': 'This invite has already been used.',
          'TOKEN_EXPIRED': 'This invite has expired. Please request a new one.',
          'EMAIL_MISMATCH': 'The email you entered doesn\'t match the invite.',
          'USER_EXISTS': 'An account with this email already exists. Try signing in instead.',
          'VALIDATION_ERROR': result.error
        };

        showError(errorMessages[result.code] || result.error || 'Signup failed. Please try again.');
        setLoading(false);
      }
    } catch (e) {
      showError(e.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  // Simple signup (for development/testing)
  async function signupSimple(data) {
    // Call the simple signup endpoint directly
    try {
      const res = await fetch(window.XanoAuth._getApiUrl?.() || 'https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh' + '/auth/signup-simple', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await res.json();

      if (!res.ok) {
        return { success: false, error: result.message, code: result.code };
      }

      // Store auth data
      localStorage.setItem('xano_auth_token', JSON.stringify(result.authToken));
      localStorage.setItem('xano_user', JSON.stringify(result.user));

      // Reinitialize XanoAuth
      await window.XanoAuth.initialize?.();

      return { success: true, user: result.user };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // ============================================
  // PASSWORD VISIBILITY TOGGLE
  // ============================================

  function setupPasswordToggle() {
    $$('.password-toggle').forEach(toggle => {
      toggle.addEventListener('click', function() {
        const input = this.previousElementSibling;
        if (input && input.type === 'password') {
          input.type = 'text';
          this.textContent = 'Hide';
        } else if (input) {
          input.type = 'password';
          this.textContent = 'Show';
        }
      });
    });
  }

  // ============================================
  // PASSWORD STRENGTH INDICATOR
  // ============================================

  function setupPasswordStrength() {
    const passwordInput = $(CONFIG.passwordInput);
    const strengthIndicator = $('.password-strength');

    if (!passwordInput || !strengthIndicator) return;

    passwordInput.addEventListener('input', function() {
      const password = this.value;
      let strength = 0;
      let label = '';

      if (password.length >= 8) strength++;
      if (password.length >= 12) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/\d/.test(password)) strength++;
      if (/[^a-zA-Z0-9]/.test(password)) strength++;

      if (password.length === 0) {
        label = '';
      } else if (strength <= 2) {
        label = 'Weak';
        strengthIndicator.className = 'password-strength weak';
      } else if (strength <= 3) {
        label = 'Fair';
        strengthIndicator.className = 'password-strength fair';
      } else if (strength <= 4) {
        label = 'Good';
        strengthIndicator.className = 'password-strength good';
      } else {
        label = 'Strong';
        strengthIndicator.className = 'password-strength strong';
      }

      strengthIndicator.textContent = label;
    });
  }

  // ============================================
  // REAL-TIME VALIDATION
  // ============================================

  function setupRealTimeValidation() {
    // Email validation on blur
    const emailInput = $(CONFIG.emailInput);
    if (emailInput) {
      emailInput.addEventListener('blur', function() {
        const email = this.value.trim();
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          this.classList.add('error');
        } else {
          this.classList.remove('error');
        }
      });
    }

    // Password match validation
    const confirmInput = $(CONFIG.confirmPasswordInput);
    const passwordInput = $(CONFIG.passwordInput);

    if (confirmInput && passwordInput) {
      confirmInput.addEventListener('input', function() {
        if (this.value && this.value !== passwordInput.value) {
          this.classList.add('error');
        } else {
          this.classList.remove('error');
        }
      });
    }
  }

  // ============================================
  // INITIALIZATION
  // ============================================

  async function init() {
    // Wait for XanoAuth to be ready
    if (!window.XanoAuth) {
      console.error('SignupHandler: XanoAuth not loaded');
      return;
    }

    // If already logged in, redirect to dashboard
    if (window.XanoAuth.isAuthenticated()) {
      window.location.href = window.XanoAuth.getDashboardUrl();
      return;
    }

    // Get URL parameters
    const params = getUrlParams();
    inviteToken = params.token;

    // Pre-fill email from URL if provided
    if (params.email) {
      const emailInput = $(CONFIG.emailInput);
      if (emailInput) emailInput.value = params.email;
    }

    // Validate invite token
    if (inviteToken) {
      setLoading(true);
      const validation = await validateInviteToken(inviteToken);

      if (validation.valid && !validation.noInvite) {
        inviteData = validation.invite;
        displayInviteInfo(validation.invite, validation.invited_by);
        setLoading(false);
      } else if (!validation.valid) {
        showInvalidInvite(validation.error || 'This invite link is invalid or expired.');
        return;
      } else {
        setLoading(false);
      }
    } else if (!CONFIG.allowSignupWithoutInvite) {
      showInvalidInvite('An invite link is required to sign up. Please contact support for an invitation.');
      return;
    }

    // Setup form submission
    const form = $(CONFIG.form);
    if (form) {
      form.addEventListener('submit', handleSubmit);
    }

    // Setup enhancements
    setupPasswordToggle();
    setupPasswordStrength();
    setupRealTimeValidation();

    console.log('SignupHandler: Initialized');
  }

  // ============================================
  // START
  // ============================================

  // Wait for DOM and XanoAuth
  function waitForXanoAuth() {
    if (window.XanoAuth) {
      init();
    } else {
      window.addEventListener('xano-auth-ready', init);
      // Fallback if event doesn't fire
      setTimeout(() => {
        if (window.XanoAuth && !document.querySelector(CONFIG.successState + '.visible')) {
          init();
        }
      }, 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', waitForXanoAuth);
  } else {
    waitForXanoAuth();
  }

  // Expose for debugging
  window.SignupHandler = {
    getInviteData: () => inviteData,
    getInviteToken: () => inviteToken,
    validateForm,
    CONFIG
  };

})();

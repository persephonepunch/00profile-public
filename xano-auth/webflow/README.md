# Webflow Auth Integration

Complete authentication components for Webflow integration with Xano backend.

## Files

| File | Description | Use For |
|------|-------------|---------|
| `signup-schema.md` | Webflow element structure for signup page | Building signup page in Webflow Designer |
| `signup-handler.js` | JavaScript handler for signup form | Include in custom code when using `xano-auth-webflow.js` |
| `signup-embed.html` | Self-contained signup widget | Quick embed without separate files |
| `login-embed.html` | Self-contained login widget | Quick embed without separate files |

## Quick Start

### Option 1: Embeddable Widgets (Fastest)

1. Create an Embed element in Webflow
2. Copy contents of `signup-embed.html` or `login-embed.html`
3. Paste into the Embed element
4. Publish your site

### Option 2: Separate Handler (More Control)

1. Include the main auth library in your site footer:
```html
<script src="/assets/js/xano-auth-webflow.js"></script>
```

2. Include the signup handler:
```html
<script src="/assets/js/signup-handler.js"></script>
```

3. Build the page structure following `signup-schema.md`

## Signup Flow

```
1. User visits /signup?token=xxx
       ↓
2. JavaScript validates invite token
       ↓
3. If valid → Show form with pre-filled email
   If invalid → Show error message
       ↓
4. User fills form and submits
       ↓
5. POST to /auth/signup with invite_token + user data
       ↓
6. On success → Store JWT, redirect to dashboard
   On error → Show error message
```

## URL Parameters

| Parameter | Purpose |
|-----------|---------|
| `token` | Invite token (required in production) |
| `email` | Pre-fill email field |

## Events

The signup handler dispatches these events:

```javascript
// Signup succeeded
window.addEventListener('signup-success', (e) => {
  console.log('User:', e.detail.user);
});

// Signup failed
window.addEventListener('signup-error', (e) => {
  console.log('Error:', e.detail.message);
});

// Invite validated
window.addEventListener('invite-validated', (e) => {
  console.log('Invite:', e.detail.invite);
});

// Invite invalid
window.addEventListener('invite-invalid', (e) => {
  console.log('Error:', e.detail.message);
});
```

## Customization

### Colors

Update the CSS custom properties in the embed:

```css
/* Primary brand color (default: USC cardinal red) */
.submit-btn { background: #8B0000; }
.submit-btn:hover { background: #6B0000; }
.form-group input:focus { border-color: #8B0000; }
```

### API URL

Update this line in the embed scripts:

```javascript
const XANO_API_URL = 'https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh';
```

### Development Mode

To allow signup without invites (for testing):

```javascript
const allowSignupWithoutInvite = true; // Change to true
```

## Required Elements

The JavaScript handlers expect these element IDs:

### Signup Form
- `#signup-form` - The form element
- `#first_name` - First name input
- `#last_name` - Last name input
- `#email` - Email input
- `#password` - Password input
- `#password_confirm` - Confirm password input
- `#phone` - Phone input (optional)
- `#signup-submit` - Submit button
- `#form-error` - Error container
- `#error-message` - Error text
- `#invite-info` - Invite info banner
- `#invited-by-name` - Inviter's name
- `#invite-role` - Assigned role text
- `#signup-loading` - Loading state
- `#signup-success` - Success state
- `#invalid-invite` - Invalid invite state

### Login Form
- `#login-form` - The form element
- `#email` - Email input
- `#password` - Password input
- `#login-submit` - Submit button
- `#form-error` - Error container
- `#error-message` - Error text
- `#login-loading` - Loading state
- `#login-success` - Success state

## Security Notes

1. **Always use HTTPS** in production
2. **Delete `/auth/signup-simple`** endpoint before going live
3. **Set proper CORS** on Xano API group
4. **Enable rate limiting** on auth endpoints
5. **Remove `allowSignupWithoutInvite`** in production

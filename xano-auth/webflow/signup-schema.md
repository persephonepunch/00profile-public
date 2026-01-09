# Webflow Signup Page Schema

## Page Structure

Create these elements in Webflow Designer for the signup page.

---

## Page Settings

- **Page Name:** Signup
- **Slug:** `/signup`
- **SEO Title:** Create Your Account
- **Body Classes:** None (public page)

---

## Element Structure

```
Body
├── Navbar (existing global component)
│
├── Section: signup-section
│   └── Container: signup-container
│       │
│       ├── Div: signup-header
│       │   ├── Heading (H1): signup-title → "Create Your Account"
│       │   └── Paragraph: signup-subtitle → "Join our community"
│       │
│       ├── Div: invite-info (hidden by default)
│       │   ├── Div: invite-badge
│       │   │   └── Text: "Invited by"
│       │   ├── Text: invited-by-name
│       │   └── Text: invite-role → "You're joining as a [role]"
│       │
│       ├── Form Block: signup-form
│       │   ├── Div: form-error (hidden by default)
│       │   │   └── Text: error-message
│       │   │
│       │   ├── Div: form-row
│       │   │   ├── Div: form-group
│       │   │   │   ├── Label: "First Name"
│       │   │   │   └── Input: first_name (type: text, required)
│       │   │   └── Div: form-group
│       │   │       ├── Label: "Last Name"
│       │   │       └── Input: last_name (type: text, required)
│       │   │
│       │   ├── Div: form-group
│       │   │   ├── Label: "Email"
│       │   │   └── Input: email (type: email, required, readonly when invite)
│       │   │
│       │   ├── Div: form-group
│       │   │   ├── Label: "Password"
│       │   │   ├── Input: password (type: password, required)
│       │   │   └── Text: password-hint → "Minimum 8 characters"
│       │   │
│       │   ├── Div: form-group
│       │   │   ├── Label: "Confirm Password"
│       │   │   └── Input: password_confirm (type: password, required)
│       │   │
│       │   ├── Div: form-group (optional)
│       │   │   ├── Label: "Phone (optional)"
│       │   │   └── Input: phone (type: tel)
│       │   │
│       │   ├── Checkbox: terms-checkbox
│       │   │   └── Label: "I agree to the Terms of Service and Privacy Policy"
│       │   │
│       │   └── Submit Button: signup-submit → "Create Account"
│       │
│       ├── Div: signup-loading (hidden by default)
│       │   └── Text: "Creating your account..."
│       │
│       ├── Div: signup-success (hidden by default)
│       │   ├── Icon: checkmark
│       │   ├── Heading (H2): "Welcome!"
│       │   ├── Text: "Your account has been created."
│       │   └── Link Button: go-to-dashboard → "Go to Dashboard"
│       │
│       └── Div: signup-footer
│           └── Text: "Already have an account?"
│           └── Link: login-link → "Sign in"
│
├── Div: invalid-invite (hidden by default)
│   ├── Icon: error
│   ├── Heading (H2): "Invalid Invite"
│   ├── Text: invalid-invite-message → "This invite link is invalid or expired."
│   └── Link: request-invite-link → "Request a new invite"
│
└── Footer (existing global component)
```

---

## Element IDs (Required for JavaScript)

| Element | ID | Purpose |
|---------|-----|---------|
| Form | `signup-form` | Form submission handler |
| First Name Input | `first_name` | User's first name |
| Last Name Input | `last_name` | User's last name |
| Email Input | `email` | User's email (from invite or entered) |
| Password Input | `password` | Password field |
| Confirm Password | `password_confirm` | Password confirmation |
| Phone Input | `phone` | Optional phone number |
| Submit Button | `signup-submit` | Form submit button |
| Error Container | `form-error` | Error message display |
| Error Message | `error-message` | Error text |
| Invite Info | `invite-info` | Shows invite details |
| Invited By Name | `invited-by-name` | Inviter's name |
| Invite Role | `invite-role` | User's assigned role |
| Loading State | `signup-loading` | Loading indicator |
| Success State | `signup-success` | Success message |
| Invalid Invite | `invalid-invite` | Invalid invite error |
| Invalid Message | `invalid-invite-message` | Specific error text |

---

## CSS Classes

### Container Classes
```css
.signup-section { padding: 80px 20px; min-height: 100vh; }
.signup-container { max-width: 480px; margin: 0 auto; }
.signup-header { text-align: center; margin-bottom: 40px; }
```

### Form Classes
```css
.form-row { display: flex; gap: 16px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
.form-group input { width: 100%; padding: 12px 16px; border: 1px solid #e2e8f0; border-radius: 8px; }
.form-group input:focus { border-color: #8B0000; outline: none; box-shadow: 0 0 0 3px rgba(139,0,0,0.1); }
.form-group input.error { border-color: #ef4444; }
.form-group input[readonly] { background: #f1f5f9; cursor: not-allowed; }
```

### State Classes
```css
.form-error { background: #fef2f2; border: 1px solid #fecaca; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; display: none; }
.form-error.visible { display: block; }
.form-error .error-message { color: #dc2626; font-size: 14px; }

.signup-loading { display: none; text-align: center; padding: 40px; }
.signup-loading.visible { display: block; }

.signup-success { display: none; text-align: center; padding: 40px; }
.signup-success.visible { display: block; }

.invalid-invite { display: none; text-align: center; padding: 60px 20px; }
.invalid-invite.visible { display: block; }
```

### Invite Badge
```css
.invite-info { display: none; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin-bottom: 24px; }
.invite-info.visible { display: block; }
.invite-badge { display: inline-block; background: #8B0000; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; margin-bottom: 8px; }
```

### Button Classes
```css
.signup-submit { width: 100%; padding: 14px 24px; background: #8B0000; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.signup-submit:hover { background: #6B0000; }
.signup-submit:disabled { background: #9ca3af; cursor: not-allowed; }
```

---

## Webflow Custom Attributes

Add these custom attributes in Webflow:

### Form Element
```
data-signup-form="true"
```

### Password Hint
```
data-password-hint="true"
```

### Terms Checkbox
```
data-terms-required="true"
```

---

## Responsive Breakpoints

### Tablet (max-width: 991px)
```css
.signup-container { max-width: 420px; }
.signup-section { padding: 60px 20px; }
```

### Mobile (max-width: 767px)
```css
.form-row { flex-direction: column; gap: 0; }
.signup-section { padding: 40px 16px; }
```

---

## URL Parameters

The signup page reads these URL parameters:

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `token` | Invite token | `/signup?token=abc123` |
| `email` | Pre-fill email | `/signup?email=user@example.com` |

---

## Page States

### 1. Default State (No Token)
- Show full signup form
- Email field is editable
- No invite info shown

### 2. Valid Invite Token
- Show invite info banner
- Pre-fill and lock email field
- Show inviter name and role

### 3. Invalid/Expired Token
- Hide signup form
- Show invalid-invite error
- Show request new invite link

### 4. Loading State
- Hide form
- Show loading indicator

### 5. Success State
- Hide form
- Show success message
- Auto-redirect after 2 seconds

---

## Interactions (Webflow)

### Form Submit Animation
1. On form submit: Add class `submitting` to form
2. Disable submit button
3. Show loading state

### Error Shake
1. On error: Add class `shake` to form
2. Remove after 500ms

### Success Checkmark
1. On success: Scale in checkmark icon
2. Duration: 300ms
3. Timing: ease-out

---

## Integration Points

### Script Include (Before </body>)
```html
<script src="/assets/js/xano-auth-webflow.js"></script>
<script src="/assets/js/signup-handler.js"></script>
```

### Or Embed Code (Webflow Custom Code)
See `signup-embed.html` for complete embeddable widget.

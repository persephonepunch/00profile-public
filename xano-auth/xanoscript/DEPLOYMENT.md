# Auth Endpoints Deployment Guide

## Overview

This guide walks you through deploying the authentication endpoints to your Xano instance.

**Instance:** `xerb-qpd6-hd8t.n7.xano.io`
**API Group:** `AUTH`
**Base URL:** `https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh`

---

## Prerequisites

Before deploying endpoints, ensure you have:

1. **Created the database tables** (see `deploy/00-database-tables.md`)
   - `users` table with authentication enabled
   - `invites` table
   - `privacy_settings` table

2. **Enabled authentication on the `users` table**
   - Go to Database → users → Settings → Authentication
   - Set `email` as login field
   - Set `password` as password field

---

## Endpoint Deployment Order

Deploy in this order for best results:

1. **POST /auth/logout** - Simplest, good test
2. **POST /auth/login** - Core authentication
3. **GET /auth/me** - Requires login working first
4. **POST /auth/signup-simple** - Testing version
5. **POST /auth/signup** - Production version

---

## Deployment Steps (For Each Endpoint)

### Step 1: Create the Endpoint

1. Go to **API** → Select `AUTH` group (or create it)
2. Click **Add Endpoint**
3. Set:
   - **Name:** `/auth/login` (or appropriate path)
   - **Method:** POST (or GET for `/auth/me`)
   - **Description:** Copy from the file comment

### Step 2: Configure Authentication

- **For `/auth/login` and `/auth/signup`:** No auth required
- **For `/auth/me` and `/auth/logout`:** Enable authentication
  - Click the lock icon
  - Select `users` table

### Step 3: Add Inputs (POST endpoints only)

For each `input` line in the XanoScript file:

1. Click **Add Input**
2. Set the name and type
3. Mark required if no default

**Example for `/auth/login`:**
| Name | Type | Required |
|------|------|----------|
| email | text | Yes |
| password | text | Yes |

### Step 4: Build the Function Stack

Translate each line in the XanoScript to Xano's visual editor:

#### Common Mappings:

| XanoScript | Xano Visual Editor |
|------------|-------------------|
| `precondition $input.email != "" "message" 400` | Add **Precondition** → Set condition, message, status |
| `var name value` | Add **Create Variable** → Name it, set value |
| `conditional $condition` | Add **Conditional** → Set condition |
| `endconditional` | End the conditional block |
| `throw CODE "message" status` | Add **Precondition** or **Stop & Debug** with throw |
| `response {...}` | Add **Response** → Build the JSON |

#### Database Operations:

| XanoScript | Xano Visual Editor |
|------------|-------------------|
| `var user users\|query_single:...` | Add **Query All Records** from `users` table, set to Single mode |
| `var user users\|add:{...}` | Add **Add Record** to `users` table |
| `var user users\|edit:{...}:{...}` | Add **Edit Record** in `users` table |

#### Authentication Operations:

| XanoScript | Xano Visual Editor |
|------------|-------------------|
| `requiresAuth users` | Enable auth on endpoint (lock icon) |
| `var auth_token users\|create_auth_token:$user.id` | Add **Create Auth Token** function |
| `revokeAuthToken` | Add **Delete Auth Token** function |
| `$input.password\|hash` | Use `hash` filter on password |
| `$input.password\|check_password:$user.password` | Use `check_password` filter |

### Step 5: Test the Endpoint

After saving, test immediately:

```bash
# Test login
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Test auth/me (with token from login)
curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/me" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test logout
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/logout" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Endpoint Details

### 1. POST /auth/logout

**File:** `auth-logout.xs`
**Auth:** Required
**Purpose:** Revoke user's auth token

**Function Stack:**
1. Requires Authentication (users table)
2. Delete Auth Token
3. Return `{"success": true, "message": "Logged out successfully"}`

---

### 2. POST /auth/login

**File:** `auth-login.xs`
**Auth:** None
**Purpose:** Authenticate user and return JWT

**Inputs:**
- `email` (text, required)
- `password` (text, required)

**Function Stack:**
1. Precondition: email not empty
2. Precondition: password not empty
3. Query Single: users where email matches (lowercased)
4. Conditional: user not found → throw INVALID_CREDENTIALS (401)
5. Conditional: status = suspended → throw ACCOUNT_SUSPENDED (403)
6. Conditional: status = pending → throw ACCOUNT_PENDING (403)
7. Conditional: status = inactive → throw ACCOUNT_INACTIVE (403)
8. Variable: check password hash
9. Conditional: password invalid → throw INVALID_CREDENTIALS (401)
10. Edit Record: update last_login_at
11. Create Auth Token
12. Response: success, authToken, user object

---

### 3. GET /auth/me

**File:** `auth-me.xs`
**Auth:** Required
**Purpose:** Get current user with permissions

**Function Stack:**
1. Requires Authentication
2. Query Single: users where id = authenticated user
3. Query Single: privacy_settings for user
4. Initialize empty arrays (family_members, linked_students, support_cards)
5. Conditional: if student, query family_relationships
6. Conditional: if family_member, query linked students
7. Build permissions object based on role (switch/case)
8. Response: user, permissions, privacy_settings, related data

---

### 4. POST /auth/signup

**File:** `auth-signup.xs`
**Auth:** None
**Purpose:** Register with invite token

**Inputs:**
- `invite_token` (text, required)
- `email` (text, required)
- `password` (text, required - min 8 chars)
- `first_name` (text, required)
- `last_name` (text, required)
- `phone` (text, optional)

**Function Stack:**
1. Preconditions for all required fields
2. Query Single: invites by token
3. Validate invite exists, status = pending, not expired, email matches
4. Check no existing user with email
5. Hash password
6. Add Record: users
7. Conditional: if family_member invite with target_user_id, create family_relationship
8. Add Record: privacy_settings with defaults
9. Edit Record: invites (mark accepted)
10. Create Auth Token
11. Response: success, authToken, user

---

### 5. POST /auth/signup-simple (Testing Only)

**File:** `auth-signup-simple.xs`
**Auth:** None
**Purpose:** Quick signup without invite (development only)

**Inputs:**
- `email` (text, required)
- `password` (text, required - min 8 chars)
- `first_name` (text, required)
- `last_name` (text, required)
- `role` (text, optional - defaults to "student")
- `phone` (text, optional)

---

## Testing Sequence

```bash
# 1. Create a test user (using simple signup)
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/signup-simple" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'

# 2. Login with the test user
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
# Save the authToken from response

# 3. Get current user
curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/me" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# 4. Logout
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/logout" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# 5. Verify logout (should fail with 401)
curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/me" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## Common Issues

### "Invalid email or password" when password is correct

- Ensure password was hashed when creating user
- Use the `hash` filter in Xano, not plain text

### "Authentication required" error

- Ensure you're passing `Authorization: Bearer TOKEN`
- Token might be expired - login again

### "Table not found" error

- Create tables before endpoints
- Check table names match exactly

### Password hash not working

1. Create a utility endpoint to hash passwords:
   - Input: `password` (text)
   - Variable: `hashed` = `$input.password|hash`
   - Response: `{"hash": "$hashed"}`

2. Use the hash value when manually creating test users

---

## Frontend Integration

Update your frontend auth client with the correct base URL:

```javascript
// In xano-auth-webflow.js
const XANO_AUTH_API_URL = 'https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh';
```

---

## Email Functions (SendGrid)

### Prerequisites

1. **Get SendGrid API Key:**
   - Sign up at https://sendgrid.com
   - Create API key with "Mail Send" permission
   - Verify sender email/domain

2. **Set Environment Variables in Xano:**
   - Go to **Settings → Environment Variables**
   - Add:
     - `SENDGRID_API_KEY` = your SendGrid API key
     - `SENDGRID_FROM_EMAIL` = your verified sender email
     - `SENDGRID_FROM_NAME` = "USC Story"
     - `APP_URL` = "https://yourdomain.com"

### Deploy Functions (Order Matters!)

Deploy these as **Functions** (not endpoints) in Xano:

#### 1. util-send-email (Base Function)

**File:** `util-send-email.xs`
**Type:** Function
**Purpose:** Generic email sending via SendGrid

1. Go to **Functions → Add Function**
2. Name: `util-send-email`
3. Add parameters: `to_email`, `to_name`, `subject`, `html_content`, `text_content`
4. Build the function stack from the file

#### 2. util-send-invite-email

**File:** `util-send-invite-email.xs`
**Type:** Function
**Purpose:** Send invite emails with template

Depends on: `util-send-email`

#### 3. util-send-reset-email

**File:** `util-send-reset-email.xs`
**Type:** Function
**Purpose:** Send password reset emails

Depends on: `util-send-email`

### Test Email Function

```bash
# Test by creating an invite (if you have admin user)
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/invites" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "email": "test@example.com",
    "role": "student"
  }'
# Response includes: "email_sent": true/false
```

---

## Password Reset Endpoints

### 6. POST /auth/forgot-password

**File:** `auth-forgot-password.xs`
**Auth:** None
**Rate Limit:** 3/minute (IMPORTANT for security)

**Inputs:**
- `email` (text, required)

**Function Stack:**
1. Validate email
2. Find user by email (silently - don't reveal if exists)
3. If found: generate token, store hash, send reset email
4. Always return success (security - don't reveal if email exists)

---

### 7. POST /auth/reset-password

**File:** `auth-reset-password.xs`
**Auth:** None

**Inputs:**
- `token` (text, required) - from email link
- `password` (text, required - min 8 chars)
- `password_confirm` (text, required)

**Function Stack:**
1. Validate inputs and password match
2. Hash token to match stored hash
3. Find reset invite by token hash
4. Validate not expired
5. Get user and update password
6. Mark invite as accepted
7. Return success

---

### Testing Password Reset

```bash
# 1. Request password reset
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Check email for reset link with token

# 3. Reset password
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "TOKEN_FROM_EMAIL",
    "password": "newpassword123",
    "password_confirm": "newpassword123"
  }'

# 4. Login with new password
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "newpassword123"
  }'
```

---

## Complete File List

### Functions (deploy first)
| File | Type | Description |
|------|------|-------------|
| `util-hash-password.xs` | Function | Hash passwords for testing |
| `util-send-email.xs` | Function | Base SendGrid email sender |
| `util-send-invite-email.xs` | Function | Invite email template |
| `util-send-reset-email.xs` | Function | Password reset email template |

### Endpoints
| File | Method | Path | Auth |
|------|--------|------|------|
| `auth-logout.xs` | POST | /auth/logout | Required |
| `auth-login.xs` | POST | /auth/login | None |
| `auth-me.xs` | GET | /auth/me | Required |
| `auth-signup.xs` | POST | /auth/signup | None |
| `auth-signup-simple.xs` | POST | /auth/signup-simple | None |
| `auth-forgot-password.xs` | POST | /auth/forgot-password | None |
| `auth-reset-password.xs` | POST | /auth/reset-password | None |
| `invites-create.xs` | POST | /invites | Required |
| `invites-validate.xs` | GET | /invites/validate | None |

---

## Security Checklist

- [ ] Enable rate limiting on login endpoint (5/min)
- [ ] Enable rate limiting on signup endpoint (10/min)
- [ ] Enable rate limiting on forgot-password (3/min) - CRITICAL
- [ ] Enable HTTPS only
- [ ] Configure CORS for your domains
- [ ] Remove `/auth/signup-simple` in production
- [ ] Set appropriate JWT expiry (recommend 1 hour)
- [ ] Enable refresh token flow if needed
- [ ] Verify SendGrid sender domain for deliverability

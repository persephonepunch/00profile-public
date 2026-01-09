# Xano Auth Deployment Guide

## Quick Start

Deploy authentication endpoints for Webflow login in this order:

> **Testing First?** Use the [Simple Signup](#simple-signup-for-testing) flow to skip invite tokens.

### Step 1: Create Database Tables
📄 **[00-database-tables.md](./00-database-tables.md)**
- Create `users` table with authentication enabled
- Create `invites` table for invite-based registration
- Add a test user for testing

### Step 2: Create API Group
1. Go to Xano → **API**
2. Click **Add API Group**
3. Name it: `AUTH`
4. This creates the base URL: `https://your-instance.xano.io/api:hJgoiIwh`

### Step 3: Create Endpoints (In Order)

| Order | File | Endpoint | Description |
|-------|------|----------|-------------|
| 1 | [01-auth-login.md](./01-auth-login.md) | `POST /auth/login` | Login with email/password |
| 2 | [02-auth-me.md](./02-auth-me.md) | `GET /auth/me` | Get current user (requires auth) |
| 3 | [03-auth-signup.md](./03-auth-signup.md) | `POST /auth/signup` | Register with invite token |
| 4 | [04-auth-logout.md](./04-auth-logout.md) | `POST /auth/logout` | Logout (requires auth) |
| 5 | [05-invites-validate.md](./05-invites-validate.md) | `POST /invites/validate` | Validate invite token |

---

## Your Xano Instance

Based on your project configuration:

```
Instance: https://xerb-qpd6-hd8t.n7.xano.io
API Group: api:hJgoiIwh
Full Base URL: https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh
```

---

## Endpoint Summary

| Endpoint | Method | Auth Required | Purpose |
|----------|--------|---------------|---------|
| `/auth/login` | POST | No | Login, returns JWT token |
| `/auth/me` | GET | **Yes** | Get current user + permissions |
| `/auth/signup` | POST | No | Register with invite token |
| `/auth/logout` | POST | **Yes** | Logout |
| `/invites/validate` | POST | No | Validate invite before signup |

---

## Test Your Endpoints

### 1. Test Login

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Expected: `{"success": true, "authToken": "...", "user": {...}}`

### 2. Test /auth/me (with token)

```bash
# Save token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

Expected: `{"user": {...}, "permissions": {...}}`

### 3. Test Invalid Login

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@example.com",
    "password": "wrongpassword"
  }'
```

Expected: `{"code": "INVALID_CREDENTIALS", "message": "Invalid email or password"}`

---

## Connect to Webflow

After endpoints are deployed, update your Webflow JavaScript:

```javascript
const XANO_AUTH_API_URL = 'https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh';
```

This is already configured in your:
- `theme/assets/js/xano-auth-webflow.js`
- `public/assets/js/xano-auth-webflow.js`

---

## Deployment Checklist

- [ ] Created `users` table with all fields
- [ ] Enabled authentication on `users` table
- [ ] Created `invites` table
- [ ] Created `AUTH` API group
- [ ] Deployed `/auth/login` endpoint
- [ ] Deployed `/auth/me` endpoint
- [ ] Deployed `/auth/signup` endpoint
- [ ] Deployed `/auth/logout` endpoint
- [ ] Deployed `/invites/validate` endpoint
- [ ] Created test user in database
- [ ] Tested login with cURL
- [ ] Tested /auth/me with token
- [ ] Updated Webflow with correct API URL

---

## Troubleshooting

### "Invalid email or password"
- Check user exists in `users` table
- Verify password is hashed correctly (use `|hash` filter)
- Check `status` is `active`

### "Unauthorized" on /auth/me
- Ensure `Authorization: Bearer TOKEN` header is included
- Check token is valid and not expired
- Verify endpoint has authentication enabled

### CORS Errors in Browser
- Go to API Group settings in Xano
- Enable CORS
- Add your Webflow domain to allowed origins

### Token Expired
- Default JWT expiry is 1 hour
- Adjust in Xano → Settings → Authentication → Token Expiry

---

## Simple Signup (For Testing)

Skip invite tokens and allow direct registration:

### Deploy Simple Signup Endpoint
📄 **[06-auth-signup-simple.md](./06-auth-signup-simple.md)**

### Test with cURL

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/signup-simple" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Webflow Embed Widget

Copy the contents of **[webflow-simple-auth-embed.html](./webflow-simple-auth-embed.html)** into a Webflow Embed element for a ready-to-use login/signup form.

Features:
- Tab switching between Login and Signup
- Form validation
- Error messages
- Automatic session persistence
- Styled and responsive

---

## Production vs Testing

| Feature | Testing (Simple) | Production (Invite) |
|---------|------------------|---------------------|
| Endpoint | `/auth/signup-simple` | `/auth/signup` |
| Requires invite | No | Yes |
| Email verified | No | Yes |
| Role assignment | Default (student) | From invite |
| Use case | Development | Controlled access |

When ready for production, switch your JavaScript to use `/auth/signup` with invite tokens.

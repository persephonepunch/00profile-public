# Endpoint: /auth/login

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → Select or create `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/auth/login` |
| **Method** | POST |
| **Authentication** | None (public) |
| **Rate Limit** | 5 per minute (optional) |

---

## Function Stack (Add in Order)

### Step 1: Input - email
- **Type**: Input
- **Variable Name**: `email`
- **Data Type**: text
- **Required**: Yes

### Step 2: Input - password
- **Type**: Input
- **Variable Name**: `password`
- **Data Type**: text
- **Required**: Yes

### Step 3: Precondition - Email Required
- **Type**: Precondition
- **Condition**: `$input.email != ""`
- **Error Message**: `Email is required`
- **HTTP Status**: 400

### Step 4: Precondition - Password Required
- **Type**: Precondition
- **Condition**: `$input.password != ""`
- **Error Message**: `Password is required`
- **HTTP Status**: 400

### Step 5: Query Record - Find User
- **Type**: Query Record
- **Table**: `users`
- **Output Variable**: `user`
- **Return Type**: Single item
- **Filter**:
  - Field: `email`
  - Operator: `=`
  - Value: `$input.email|lower`

### Step 6: Conditional - User Not Found
- **Type**: Conditional
- **Condition**: `$user == null`
- **Then**:
  - **Stop & Debug** (or Throw Error)
  - Code: `INVALID_CREDENTIALS`
  - Message: `Invalid email or password`
  - HTTP Status: 401

### Step 7: Conditional - Account Not Active
- **Type**: Conditional
- **Condition**: `$user.status != "active"`
- **Then**:
  - **Stop & Debug**
  - Code: `ACCOUNT_NOT_ACTIVE`
  - Message: `Your account is not active`
  - HTTP Status: 403

### Step 8: Verify Password
- **Type**: Security: Check Password
- **Password** (plain text): `$input.password`
- **Password Hash**: `$user.password`
- **Output Variable**: `password_valid`

### Step 9: Conditional - Invalid Password
- **Type**: Conditional
- **Condition**: `$password_valid == false`
- **Then**:
  - **Stop & Debug**
  - Code: `INVALID_CREDENTIALS`
  - Message: `Invalid email or password`
  - HTTP Status: 401

### Step 10: Edit Record - Update Last Login
- **Type**: Edit Record
- **Table**: `users`
- **Filter**:
  - Field: `id`
  - Value: `$user.id`
- **Data**:
  - `last_login_at`: `now`
  - `updated_at`: `now`

### Step 11: Create Auth Token
- **Type**: Security: Create Auth Token
- **Table**: `users`
- **User ID**: `$user.id`
- **Output Variable**: `authToken`

### Step 12: Response
- **Type**: Response
- **Data**:
```json
{
  "success": true,
  "authToken": "$authToken",
  "user": {
    "id": "$user.id",
    "email": "$user.email",
    "role": "$user.role",
    "sub_role": "$user.sub_role",
    "first_name": "$user.first_name",
    "last_name": "$user.last_name",
    "profile_image_url": "$user.profile_image_url"
  }
}
```

---

## Test with cURL

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Expected Response

```json
{
  "success": true,
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "student",
    "sub_role": null,
    "first_name": "Test",
    "last_name": "User",
    "profile_image_url": null
  }
}
```

# Endpoint: /auth/signup-simple (No Invite Required)

## Purpose
Simple signup for testing - no invite token needed. Users can register directly with email/password.

> **Note**: For production, use `/auth/signup` with invite tokens for controlled access.

---

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/auth/signup-simple` |
| **Method** | POST |
| **Authentication** | None (public) |
| **Rate Limit** | 10 per minute (recommended) |

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

### Step 3: Input - first_name
- **Type**: Input
- **Variable Name**: `first_name`
- **Data Type**: text
- **Required**: Yes

### Step 4: Input - last_name
- **Type**: Input
- **Variable Name**: `last_name`
- **Data Type**: text
- **Required**: Yes

### Step 5: Input - phone
- **Type**: Input
- **Variable Name**: `phone`
- **Data Type**: text
- **Required**: No

### Step 6: Input - role
- **Type**: Input
- **Variable Name**: `role`
- **Data Type**: text
- **Required**: No
- **Default Value**: `student`

---

### Step 7: Precondition - Email Required
- **Type**: Precondition
- **Condition**: `$input.email != ""`
- **Error Message**: `Email is required`
- **HTTP Status**: 400

### Step 8: Precondition - Valid Email Format
- **Type**: Precondition
- **Condition**: `$input.email|is_email == true`
- **Error Message**: `Please enter a valid email address`
- **HTTP Status**: 400

### Step 9: Precondition - Password Length
- **Type**: Precondition
- **Condition**: `$input.password|length >= 8`
- **Error Message**: `Password must be at least 8 characters`
- **HTTP Status**: 400

### Step 10: Precondition - First Name Required
- **Type**: Precondition
- **Condition**: `$input.first_name != ""`
- **Error Message**: `First name is required`
- **HTTP Status**: 400

### Step 11: Precondition - Last Name Required
- **Type**: Precondition
- **Condition**: `$input.last_name != ""`
- **Error Message**: `Last name is required`
- **HTTP Status**: 400

---

### Step 12: Query Records - Check Existing User
- **Type**: Query All Records
- **Table**: `users`
- **Output Variable**: `existing_users`
- **Filter**:
  - Field: `email`
  - Operator: `=`
  - Value: `$input.email|lower`

### Step 13: Conditional - User Already Exists
- **Type**: Conditional
- **Condition**: `$existing_users|count > 0`
- **Then**:
  - **Stop & Debug**
  - Code: `USER_EXISTS`
  - Message: `An account with this email already exists`
  - HTTP Status: 409

---

### Step 14: Create Variable - Hash Password
- **Type**: Create Variable
- **Name**: `hashed_password`
- **Value**: `$input.password|hash`

### Step 15: Create Variable - Determine Role
- **Type**: Create Variable
- **Name**: `user_role`
- **Value**: `$input.role != "" ? $input.role : "student"`

### Step 16: Add Record - Create User
- **Type**: Add Record
- **Table**: `users`
- **Output Variable**: `new_user`
- **Data**:
  - `email`: `$input.email|lower`
  - `password`: `$hashed_password`
  - `role`: `$user_role`
  - `first_name`: `$input.first_name`
  - `last_name`: `$input.last_name`
  - `phone`: `$input.phone`
  - `status`: `active`
  - `email_verified`: `false`
  - `created_at`: `now`
  - `updated_at`: `now`

---

### Step 17: Create Auth Token
- **Type**: Security: Create Auth Token
- **Table**: `users`
- **User ID**: `$new_user.id`
- **Output Variable**: `authToken`

### Step 18: Response
- **Type**: Response
- **Data**:
```json
{
  "success": true,
  "authToken": "$authToken",
  "user": {
    "id": "$new_user.id",
    "email": "$new_user.email",
    "role": "$new_user.role",
    "first_name": "$new_user.first_name",
    "last_name": "$new_user.last_name"
  }
}
```

---

## Test with cURL

### Register New User

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/signup-simple" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Expected Response

```json
{
  "success": true,
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "newuser@example.com",
    "role": "student",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

### Register with Specific Role

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/signup-simple" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "password123",
    "first_name": "Jane",
    "last_name": "Smith",
    "role": "instructor"
  }'
```

---

## Error Responses

### Email Already Exists
```json
{
  "code": "USER_EXISTS",
  "message": "An account with this email already exists"
}
```

### Invalid Email
```json
{
  "code": "ERROR_CODE_INPUT_INVALID",
  "message": "Please enter a valid email address"
}
```

### Password Too Short
```json
{
  "code": "ERROR_CODE_INPUT_INVALID",
  "message": "Password must be at least 8 characters"
}
```

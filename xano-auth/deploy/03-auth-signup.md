# Endpoint: /auth/signup

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/auth/signup` |
| **Method** | POST |
| **Authentication** | None (public) |
| **Rate Limit** | 10 per minute (optional) |

---

## Function Stack (Add in Order)

### Step 1: Input - invite_token
- **Type**: Input
- **Variable Name**: `invite_token`
- **Data Type**: text
- **Required**: Yes

### Step 2: Input - email
- **Type**: Input
- **Variable Name**: `email`
- **Data Type**: text
- **Required**: Yes

### Step 3: Input - password
- **Type**: Input
- **Variable Name**: `password`
- **Data Type**: text
- **Required**: Yes

### Step 4: Input - first_name
- **Type**: Input
- **Variable Name**: `first_name`
- **Data Type**: text
- **Required**: Yes

### Step 5: Input - last_name
- **Type**: Input
- **Variable Name**: `last_name`
- **Data Type**: text
- **Required**: Yes

### Step 6: Input - phone
- **Type**: Input
- **Variable Name**: `phone`
- **Data Type**: text
- **Required**: No

---

### Step 7: Precondition - Invite Token Required
- **Type**: Precondition
- **Condition**: `$input.invite_token != ""`
- **Error Message**: `Invite token is required`
- **HTTP Status**: 400

### Step 8: Precondition - Email Required
- **Type**: Precondition
- **Condition**: `$input.email != ""`
- **Error Message**: `Email is required`
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

### Step 12: Query Record - Find Invite
- **Type**: Query Record
- **Table**: `invites`
- **Output Variable**: `invite`
- **Return Type**: Single item
- **Filter**:
  - Field: `token`
  - Operator: `=`
  - Value: `$input.invite_token`

### Step 13: Conditional - Invalid Token
- **Type**: Conditional
- **Condition**: `$invite == null`
- **Then**:
  - **Stop & Debug**
  - Code: `INVALID_TOKEN`
  - Message: `Invalid or expired invite token`
  - HTTP Status: 400

### Step 14: Conditional - Token Already Used
- **Type**: Conditional
- **Condition**: `$invite.status != "pending"`
- **Then**:
  - **Stop & Debug**
  - Code: `TOKEN_USED`
  - Message: `This invite has already been used`
  - HTTP Status: 400

### Step 15: Conditional - Token Expired
- **Type**: Conditional
- **Condition**: `$invite.expires_at < now`
- **Then**:
  - **Stop & Debug**
  - Code: `TOKEN_EXPIRED`
  - Message: `This invite has expired`
  - HTTP Status: 400

### Step 16: Conditional - Email Mismatch
- **Type**: Conditional
- **Condition**: `$invite.email|lower != $input.email|lower`
- **Then**:
  - **Stop & Debug**
  - Code: `EMAIL_MISMATCH`
  - Message: `Email does not match the invite`
  - HTTP Status: 400

---

### Step 17: Query Records - Check Existing User
- **Type**: Query All Records
- **Table**: `users`
- **Output Variable**: `existing_users`
- **Filter**:
  - Field: `email`
  - Operator: `=`
  - Value: `$input.email|lower`

### Step 18: Conditional - User Exists
- **Type**: Conditional
- **Condition**: `$existing_users|count > 0`
- **Then**:
  - **Stop & Debug**
  - Code: `USER_EXISTS`
  - Message: `An account with this email already exists`
  - HTTP Status: 409

---

### Step 19: Create Variable - Hash Password
- **Type**: Create Variable
- **Name**: `hashed_password`
- **Value**: `$input.password|hash`

### Step 20: Add Record - Create User
- **Type**: Add Record
- **Table**: `users`
- **Output Variable**: `new_user`
- **Data**:
  - `email`: `$input.email|lower`
  - `password`: `$hashed_password`
  - `role`: `$invite.role`
  - `sub_role`: `$invite.sub_role`
  - `first_name`: `$input.first_name`
  - `last_name`: `$input.last_name`
  - `phone`: `$input.phone`
  - `status`: `active`
  - `email_verified`: `true`
  - `invited_by_user_id`: `$invite.invited_by_user_id`
  - `created_at`: `now`
  - `updated_at`: `now`

---

### Step 21: Edit Record - Mark Invite Accepted
- **Type**: Edit Record
- **Table**: `invites`
- **Filter**:
  - Field: `id`
  - Value: `$invite.id`
- **Data**:
  - `status`: `accepted`
  - `accepted_at`: `now`

---

### Step 22: Create Auth Token
- **Type**: Security: Create Auth Token
- **Table**: `users`
- **User ID**: `$new_user.id`
- **Output Variable**: `authToken`

### Step 23: Response
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
    "sub_role": "$new_user.sub_role",
    "first_name": "$new_user.first_name",
    "last_name": "$new_user.last_name"
  }
}
```

---

## Test with cURL

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "invite_token": "abc123xyz",
    "email": "newuser@example.com",
    "password": "securepass123",
    "first_name": "New",
    "last_name": "User",
    "phone": "555-123-4567"
  }'
```

## Expected Response

```json
{
  "success": true,
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 2,
    "email": "newuser@example.com",
    "role": "student",
    "sub_role": null,
    "first_name": "New",
    "last_name": "User"
  }
}
```

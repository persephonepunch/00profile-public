# Endpoint: POST /users/{slug}/request-access

Request access to view a private profile.

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/users/{slug}/request-access` |
| **Method** | POST |
| **Authentication** | JWT Required |

---

## Function Stack

### Step 1: Require Authentication
- **Type**: Security: Require Authentication

### Step 2: Input - slug
- **Type**: Input
- **Variable Name**: `slug`
- **Data Type**: text
- **Required**: Yes

### Step 3: Input - message (optional)
- **Type**: Input
- **Variable Name**: `message`
- **Data Type**: text
- **Required**: No

### Step 4: Get Profile Owner
- **Type**: Query Record
- **Table**: `users`
- **Output Variable**: `owner`
- **Filter**: `slug` = `$input.slug`

### Step 5: Conditional - Not Found
- **Type**: Conditional
- **Condition**: `$owner == null`
- **Then**: Stop & Debug (404)

### Step 6: Conditional - Cannot Request Own Profile
- **Type**: Conditional
- **Condition**: `id == $owner.id`
- **Then**: Stop & Debug
  - Code: `INVALID_REQUEST`
  - Message: `Cannot request access to your own profile`
  - HTTP Status: 400

### Step 7: Check Existing Access
- **Type**: Query Record
- **Table**: `user_access`
- **Output Variable**: `existing`
- **Filters**:
  - `owner_user_id` = `$owner.id`
  - `viewer_user_id` = `id`

### Step 8: Conditional - Already Has Access
- **Type**: Conditional
- **Condition**: `$existing != null`
- **Then**: Stop & Debug
  - Code: `ALREADY_HAS_ACCESS`
  - Message: `You already have access to this profile`
  - HTTP Status: 400

### Step 9: Check Pending Request
- **Type**: Query Record
- **Table**: `access_invites`
- **Output Variable**: `pending`
- **Filters**:
  - `owner_user_id` = `$owner.id`
  - `email` = (get requester's email)
  - `status` = `pending`

### Step 10: Get Requester Info
- **Type**: Query Record
- **Table**: `users`
- **Output Variable**: `requester`
- **Filter**: `id` = `id`

### Step 11: Create Access Request
- **Type**: Add Record
- **Table**: `access_invites`
- **Data**:
```json
{
  "owner_user_id": "$owner.id",
  "email": "$requester.email",
  "token": "uuid()",
  "message": "$input.message",
  "status": "pending",
  "created_at": "now",
  "expires_at": "now|add_secs_to_timestamp:604800"
}
```
- **Output Variable**: `request`

### Step 12: Response
```json
{
  "success": true,
  "message": "Access request sent",
  "request_id": "$request.id"
}
```

---

## Test with cURL

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/users/jane-doe/request-access" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Hi Jane, I would like to connect!"
  }'
```

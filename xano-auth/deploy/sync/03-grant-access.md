# Endpoint: POST /access/grant

Grant or revoke access to your profile.

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/access/grant` |
| **Method** | POST |
| **Authentication** | JWT Required |

---

## Function Stack

### Step 1: Require Authentication
- **Type**: Security: Require Authentication

### Step 2: Input - viewer_user_id
- **Type**: Input
- **Variable Name**: `viewer_user_id`
- **Data Type**: integer
- **Required**: Yes

### Step 3: Input - action
- **Type**: Input
- **Variable Name**: `action`
- **Data Type**: enum
- **Enum Values**: `grant`, `revoke`
- **Required**: Yes

### Step 4: Input - access_level (optional)
- **Type**: Input
- **Variable Name**: `access_level`
- **Data Type**: enum
- **Enum Values**: `view`, `edit`, `admin`
- **Required**: No
- **Default**: `view`

### Step 5: Precondition - Cannot Grant Self
- **Type**: Precondition
- **Condition**: `$input.viewer_user_id != id`
- **Error Message**: `Cannot grant access to yourself`
- **HTTP Status**: 400

### Step 6: Verify Viewer Exists
- **Type**: Query Record
- **Table**: `users`
- **Output Variable**: `viewer`
- **Filter**: `id` = `$input.viewer_user_id`

### Step 7: Conditional - Viewer Not Found
- **Type**: Conditional
- **Condition**: `$viewer == null`
- **Then**: Stop & Debug (404)

### Step 8: Conditional - Grant Access
- **Type**: Conditional
- **Condition**: `$input.action == 'grant'`
- **Then**:
  - **Type**: Add or Edit Record (upsert)
  - **Table**: `user_access`
  - **Filter**:
    - `owner_user_id` = `id`
    - `viewer_user_id` = `$input.viewer_user_id`
  - **Data**:
  ```json
  {
    "owner_user_id": "id",
    "viewer_user_id": "$input.viewer_user_id",
    "access_level": "$input.access_level",
    "granted_by": "id",
    "granted_at": "now"
  }
  ```
  - **Output Variable**: `access`

### Step 9: Conditional - Revoke Access
- **Type**: Conditional
- **Condition**: `$input.action == 'revoke'`
- **Then**:
  - **Type**: Delete Record
  - **Table**: `user_access`
  - **Filter**:
    - `owner_user_id` = `id`
    - `viewer_user_id` = `$input.viewer_user_id`

### Step 10: Response
```json
{
  "success": true,
  "action": "$input.action",
  "viewer": {
    "id": "$viewer.id",
    "first_name": "$viewer.first_name",
    "last_name": "$viewer.last_name"
  },
  "message": "$input.action == 'grant' ? 'Access granted' : 'Access revoked'"
}
```

---

# Endpoint: GET /access/requests

Get pending access requests for your profile.

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/access/requests` |
| **Method** | GET |
| **Authentication** | JWT Required |

---

## Function Stack

### Step 1: Require Authentication

### Step 2: Query Pending Requests
- **Type**: Query All Records
- **Table**: `access_invites`
- **Output Variable**: `requests`
- **Filters**:
  - `owner_user_id` = `id`
  - `status` = `pending`
- **Sorting**: `created_at` desc

### Step 3: For Each - Get Requester Info
- Loop through and get user info for each email

### Step 4: Response
```json
{
  "success": true,
  "requests": "$requests"
}
```

---

# Endpoint: POST /access/respond

Respond to an access request.

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/access/respond` |
| **Method** | POST |
| **Authentication** | JWT Required |

---

## Function Stack

### Step 1: Require Authentication

### Step 2: Input - request_id
- **Type**: Input
- **Variable Name**: `request_id`
- **Data Type**: integer
- **Required**: Yes

### Step 3: Input - action
- **Type**: Input
- **Variable Name**: `action`
- **Data Type**: enum
- **Enum Values**: `accept`, `decline`
- **Required**: Yes

### Step 4: Get Request
- **Type**: Query Record
- **Table**: `access_invites`
- **Output Variable**: `request`
- **Filter**: `id` = `$input.request_id`

### Step 5: Verify Ownership
- **Type**: Conditional
- **Condition**: `$request.owner_user_id != id`
- **Then**: Stop & Debug (403 Forbidden)

### Step 6: Conditional - Accept
- **Type**: Conditional
- **Condition**: `$input.action == 'accept'`
- **Then**:
  - Get user by email from request
  - Add to `user_access` table
  - Update request status to `accepted`

### Step 7: Conditional - Decline
- **Type**: Conditional
- **Condition**: `$input.action == 'decline'`
- **Then**:
  - Update request status to `declined`

### Step 8: Response
```json
{
  "success": true,
  "action": "$input.action",
  "message": "$input.action == 'accept' ? 'Access granted' : 'Request declined'"
}
```

---

## Test with cURL

```bash
# Grant access
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/access/grant" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "viewer_user_id": 456,
    "action": "grant",
    "access_level": "view"
  }'

# Get pending requests
curl "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/access/requests" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Respond to request
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/access/respond" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "request_id": 1,
    "action": "accept"
  }'
```

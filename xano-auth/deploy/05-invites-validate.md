# Endpoint: /invites/validate

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/invites/validate` |
| **Method** | POST |
| **Authentication** | None (public) |

---

## Function Stack (Add in Order)

### Step 1: Input - token
- **Type**: Input
- **Variable Name**: `token`
- **Data Type**: text
- **Required**: Yes

### Step 2: Precondition - Token Required
- **Type**: Precondition
- **Condition**: `$input.token != ""`
- **Error Message**: `Token is required`
- **HTTP Status**: 400

### Step 3: Query Record - Find Invite
- **Type**: Query Record
- **Table**: `invites`
- **Output Variable**: `invite`
- **Return Type**: Single item
- **Filter**:
  - Field: `token`
  - Operator: `=`
  - Value: `$input.token`

### Step 4: Conditional - Token Not Found
- **Type**: Conditional
- **Condition**: `$invite == null`
- **Then**:
  - **Response**:
    ```json
    {
      "valid": false,
      "error": "Invalid invite token"
    }
    ```
  - **Stop** (don't continue after response)

### Step 5: Conditional - Token Already Used
- **Type**: Conditional
- **Condition**: `$invite.status != "pending"`
- **Then**:
  - **Response**:
    ```json
    {
      "valid": false,
      "error": "This invite has already been used"
    }
    ```
  - **Stop**

### Step 6: Conditional - Token Expired
- **Type**: Conditional
- **Condition**: `$invite.expires_at < now`
- **Then**:
  - **Response**:
    ```json
    {
      "valid": false,
      "error": "This invite has expired"
    }
    ```
  - **Stop**

### Step 7: Response - Valid Invite
- **Type**: Response
- **Data**:
```json
{
  "valid": true,
  "invite": {
    "email": "$invite.email",
    "role": "$invite.role",
    "sub_role": "$invite.sub_role",
    "expires_at": "$invite.expires_at"
  }
}
```

---

## Test with cURL

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/invites/validate" \
  -H "Content-Type: application/json" \
  -d '{"token": "abc123xyz"}'
```

## Expected Response (Valid)

```json
{
  "valid": true,
  "invite": {
    "email": "invited@example.com",
    "role": "student",
    "sub_role": null,
    "expires_at": 1735689600000
  }
}
```

## Expected Response (Invalid)

```json
{
  "valid": false,
  "error": "Invalid invite token"
}
```

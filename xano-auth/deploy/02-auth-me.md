# Endpoint: /auth/me

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/auth/me` |
| **Method** | GET |
| **Authentication** | **Requires Authentication** ✓ |
| **Auth Table** | `users` |

---

## Function Stack (Add in Order)

### Step 1: Query Record - Get User
- **Type**: Query Record
- **Table**: `users`
- **Output Variable**: `user`
- **Return Type**: Single item
- **Filter**:
  - Field: `id`
  - Operator: `=`
  - Value: `id` (this is the authenticated user's ID from the JWT)

> **Note**: After enabling authentication, `id` (without $) is automatically available as the authenticated user's ID.

### Step 2: Create Variable - permissions
- **Type**: Create Variable
- **Name**: `permissions`
- **Value**: `{}`

### Step 3: Conditional - Admin Permissions
- **Type**: Conditional
- **Condition**: `$user.role == "admin"`
- **Then**:
  - **Set Variable**: `permissions`
  - **Value**:
    ```json
    {
      "can_manage_users": true,
      "can_manage_cohorts": true,
      "can_view_all_students": true,
      "can_invite_all_roles": true
    }
    ```

### Step 4: Conditional - Instructor Permissions
- **Type**: Conditional
- **Condition**: `$user.role == "instructor"`
- **Then**:
  - **Set Variable**: `permissions`
  - **Value**:
    ```json
    {
      "can_view_cohort_students": true,
      "can_invite_students": true,
      "can_manage_cohort": true
    }
    ```

### Step 5: Conditional - Student Permissions
- **Type**: Conditional
- **Condition**: `$user.role == "student"`
- **Then**:
  - **Set Variable**: `permissions`
  - **Value**:
    ```json
    {
      "can_invite_family": true,
      "can_view_own_data": true,
      "can_create_support_cards": true
    }
    ```

### Step 6: Conditional - Family Member Permissions
- **Type**: Conditional
- **Condition**: `$user.role == "family_member"`
- **Then**:
  - **Set Variable**: `permissions`
  - **Value**:
    ```json
    {
      "can_view_student_data": true,
      "can_contribute": true
    }
    ```

### Step 7: Response
- **Type**: Response
- **Data**:
```json
{
  "user": {
    "id": "$user.id",
    "email": "$user.email",
    "role": "$user.role",
    "sub_role": "$user.sub_role",
    "first_name": "$user.first_name",
    "last_name": "$user.last_name",
    "profile_image_url": "$user.profile_image_url",
    "phone": "$user.phone",
    "status": "$user.status"
  },
  "permissions": "$permissions"
}
```

---

## Test with cURL

```bash
# First login to get a token
TOKEN=$(curl -s -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}' \
  | jq -r '.authToken')

# Then call /auth/me with the token
curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/me" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"
```

## Expected Response

```json
{
  "user": {
    "id": 1,
    "email": "test@example.com",
    "role": "student",
    "sub_role": null,
    "first_name": "Test",
    "last_name": "User",
    "profile_image_url": null,
    "phone": null,
    "status": "active"
  },
  "permissions": {
    "can_invite_family": true,
    "can_view_own_data": true,
    "can_create_support_cards": true
  }
}
```

## Error Response (No Token)

```json
{
  "code": "ERROR_CODE_UNAUTHORIZED",
  "message": "Unauthorized"
}
```

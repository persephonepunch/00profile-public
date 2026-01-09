# Endpoint: GET /users/{slug}

Get user profile with access control.

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/users/{slug}` |
| **Method** | GET |
| **Authentication** | Optional (public profiles don't require auth) |

---

## Function Stack

### Step 1: Input - slug
- **Type**: Input (from URL path)
- **Variable Name**: `slug`
- **Data Type**: text
- **Required**: Yes

### Step 2: Get Profile User
- **Type**: Query Record
- **Table**: `users`
- **Output Variable**: `profile_user`
- **Filter**: `slug` = `$input.slug`

### Step 3: Conditional - User Not Found
- **Type**: Conditional
- **Condition**: `$profile_user == null`
- **Then**: Stop & Debug
  - Code: `USER_NOT_FOUND`
  - Message: `User not found`
  - HTTP Status: 404

### Step 4: Check if Public
- **Type**: Create Variable
- **Variable Name**: `is_public`
- **Value**: `$profile_user.visibility == 'public'`

### Step 5: Conditional - Public Profile
- **Type**: Conditional
- **Condition**: `$is_public == true`
- **Then**: Skip to Response (show full profile)

### Step 6: Get Viewer Auth (if not public)
- **Type**: Get Auth Token (optional - don't fail if not present)
- **Output Variable**: `viewer_id`

### Step 7: Check if Viewer is Owner
- **Type**: Create Variable
- **Variable Name**: `is_owner`
- **Value**: `$viewer_id != null && $viewer_id == $profile_user.id`

### Step 8: Check Access Permission
- **Type**: Query Record
- **Table**: `user_access`
- **Output Variable**: `access_record`
- **Filters**:
  - `owner_user_id` = `$profile_user.id`
  - `viewer_user_id` = `$viewer_id`

### Step 9: Determine Has Access
- **Type**: Create Variable
- **Variable Name**: `has_access`
- **Value**: `$is_public || $is_owner || $access_record != null`

### Step 10: Conditional - No Access
- **Type**: Conditional
- **Condition**: `$has_access == false`
- **Then**: Return limited response
```json
{
  "success": true,
  "access": "restricted",
  "profile": {
    "id": "$profile_user.id",
    "first_name": "$profile_user.first_name",
    "visibility": "$profile_user.visibility",
    "profile_image_url": "$profile_user.profile_image_url"
  },
  "message": "This profile is private. Request access to view."
}
```

### Step 11: Get User Tags
- **Type**: Query All Records
- **Table**: `user_tags`
- **Output Variable**: `user_tag_links`
- **Filter**: `user_id` = `$profile_user.id`
- **Addon**: Include `tag` relationship

### Step 12: Response - Full Profile
- **Type**: Response
- **Data**:
```json
{
  "success": true,
  "access": "granted",
  "profile": {
    "id": "$profile_user.id",
    "first_name": "$profile_user.first_name",
    "last_name": "$profile_user.last_name",
    "email": "$is_owner ? $profile_user.email : null",
    "role": "$profile_user.role",
    "sub_role": "$profile_user.sub_role",
    "bio": "$profile_user.bio",
    "profile_image_url": "$profile_user.profile_image_url",
    "visibility": "$profile_user.visibility",
    "tags": "$user_tag_links"
  },
  "is_owner": "$is_owner"
}
```

---

## Test with cURL

```bash
# Public profile (no auth needed)
curl "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/users/john-smith"

# Private profile (with auth)
curl "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/users/jane-doe" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Responses

### Full Access:
```json
{
  "success": true,
  "access": "granted",
  "profile": {
    "id": 123,
    "first_name": "John",
    "last_name": "Smith",
    "role": "student",
    "bio": "Computer Science student...",
    "profile_image_url": "https://...",
    "visibility": "public",
    "tags": [
      {"id": 1, "tag": {"name": "Student", "color": "#F57C00"}},
      {"id": 2, "tag": {"name": "Cohort 2024", "color": "#455A64"}}
    ]
  },
  "is_owner": false
}
```

### Restricted:
```json
{
  "success": true,
  "access": "restricted",
  "profile": {
    "id": 456,
    "first_name": "Jane",
    "visibility": "private",
    "profile_image_url": "https://..."
  },
  "message": "This profile is private. Request access to view."
}
```

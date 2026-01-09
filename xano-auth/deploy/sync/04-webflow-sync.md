# Webflow CMS Sync

Sync Xano users to Webflow CMS Users collection.

---

## Setup Requirements

### 1. Get Webflow API Credentials

1. Go to **Webflow Dashboard** → **Workspace Settings** → **Integrations** → **API Access**
2. Generate an API token with CMS permissions
3. Save as environment variable in Xano: `WEBFLOW_API_TOKEN`

### 2. Get Site and Collection IDs

```bash
# List your sites
curl "https://api.webflow.com/v2/sites" \
  -H "Authorization: Bearer YOUR_WEBFLOW_TOKEN"

# Get collections for a site
curl "https://api.webflow.com/v2/sites/SITE_ID/collections" \
  -H "Authorization: Bearer YOUR_WEBFLOW_TOKEN"
```

Save in Xano environment variables:
- `WEBFLOW_SITE_ID`
- `WEBFLOW_USERS_COLLECTION_ID`
- `WEBFLOW_TAGS_COLLECTION_ID`

---

## Endpoint: POST /sync/user-to-webflow

Sync a Xano user to Webflow CMS.

### Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/sync/user-to-webflow` |
| **Method** | POST |
| **Authentication** | JWT Required (Admin only) |

---

### Function Stack

#### Step 1: Require Authentication
- Verify user is admin

#### Step 2: Input - user_id
- **Type**: Input
- **Variable Name**: `user_id`
- **Data Type**: integer
- **Required**: Yes

#### Step 3: Get User from Xano
- **Type**: Query Record
- **Table**: `users`
- **Output Variable**: `user`
- **Filter**: `id` = `$input.user_id`

#### Step 4: Get User Tags
- **Type**: Query All Records
- **Table**: `user_tags`
- **Output Variable**: `user_tags`
- **Filter**: `user_id` = `$input.user_id`
- **Addon**: Include tag details

#### Step 5: Build Webflow Payload
- **Type**: Create Variable
- **Variable Name**: `webflow_data`
- **Value**:
```json
{
  "isArchived": false,
  "isDraft": false,
  "fieldData": {
    "name": "$user.first_name ~ ' ' ~ $user.last_name",
    "slug": "$user.slug",
    "xano-user-id": "$user.id",
    "role": "$user.role",
    "visibility": "$user.visibility",
    "bio": "$user.bio",
    "profile-image": "$user.profile_image_url"
  }
}
```

#### Step 6: Check if Webflow Item Exists
- **Type**: Conditional
- **Condition**: `$user.webflow_item_id != null && $user.webflow_item_id != ''`

#### Step 7a: Update Existing Item
- **Type**: API Request
- **URL**: `https://api.webflow.com/v2/collections/$env.WEBFLOW_USERS_COLLECTION_ID/items/$user.webflow_item_id`
- **Method**: PATCH
- **Headers**:
  - `Authorization`: `Bearer $env.WEBFLOW_API_TOKEN`
  - `Content-Type`: `application/json`
- **Body**: `$webflow_data`
- **Output Variable**: `webflow_response`

#### Step 7b: Create New Item
- **Type**: API Request
- **URL**: `https://api.webflow.com/v2/collections/$env.WEBFLOW_USERS_COLLECTION_ID/items`
- **Method**: POST
- **Headers**:
  - `Authorization`: `Bearer $env.WEBFLOW_API_TOKEN`
  - `Content-Type`: `application/json`
- **Body**: `$webflow_data`
- **Output Variable**: `webflow_response`

#### Step 8: Save Webflow Item ID to Xano
- **Type**: Edit Record
- **Table**: `users`
- **Filter**: `id` = `$input.user_id`
- **Data**:
```json
{
  "webflow_item_id": "$webflow_response.id"
}
```

#### Step 9: Publish Item
- **Type**: API Request
- **URL**: `https://api.webflow.com/v2/collections/$env.WEBFLOW_USERS_COLLECTION_ID/items/publish`
- **Method**: POST
- **Headers**:
  - `Authorization`: `Bearer $env.WEBFLOW_API_TOKEN`
  - `Content-Type`: `application/json`
- **Body**:
```json
{
  "itemIds": ["$webflow_response.id"]
}
```

#### Step 10: Response
```json
{
  "success": true,
  "webflow_item_id": "$webflow_response.id",
  "message": "User synced to Webflow"
}
```

---

## Auto-Sync on User Update (Trigger)

Create a database trigger in Xano:

1. Go to **Database** → **users** table → **Triggers**
2. Add trigger: **After Update**
3. Call the sync endpoint automatically

---

## Webflow CMS Field Mapping

| Xano Field | Webflow Field | Webflow Slug |
|------------|---------------|--------------|
| `first_name + last_name` | Name | `name` |
| `slug` | Slug | `slug` |
| `id` | Xano User ID | `xano-user-id` |
| `role` | Role | `role` |
| `visibility` | Visibility | `visibility` |
| `bio` | Bio | `bio` |
| `profile_image_url` | Profile Image | `profile-image` |

---

## Test with cURL

```bash
# Sync a user to Webflow
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/sync/user-to-webflow" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "user_id": 123
  }'
```

---

## Bulk Sync All Users

### Endpoint: POST /sync/all-users-to-webflow

For initial migration or full resync:

```json
{
  "operations": [
    "Query all users",
    "Loop through each user",
    "Call sync endpoint for each",
    "Return summary"
  ]
}
```

---

## Environment Variables Needed in Xano

| Variable | Value |
|----------|-------|
| `WEBFLOW_API_TOKEN` | Your Webflow API token |
| `WEBFLOW_SITE_ID` | Your site ID |
| `WEBFLOW_USERS_COLLECTION_ID` | Users collection ID |
| `WEBFLOW_TAGS_COLLECTION_ID` | Tags collection ID |

# Endpoint: GET /consent

Get current user's consent settings.

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → Select or create `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/consent` |
| **Method** | GET |
| **Authentication** | JWT (requires auth) |

---

## Function Stack (Add in Order)

### Step 1: Require Authentication
- **Type**: Security: Require Authentication
- This makes `id` available as the authenticated user's ID

### Step 2: Query Consent Records
- **Type**: Query All Records
- **Table**: `consent_records`
- **Output Variable**: `consents`
- **Filter**:
  - Field: `user_id`
  - Operator: `=`
  - Value: `id` (auth user ID)

### Step 3: Get User Settings
- **Type**: Query Record
- **Table**: `users`
- **Output Variable**: `user`
- **Filter**:
  - Field: `id`
  - Operator: `=`
  - Value: `id` (auth user ID)

### Step 4: Build Response Object
- **Type**: Create Variable
- **Variable Name**: `settings`
- **Value**:
```json
{
  "can_receive_peer_offers": "$user.can_receive_peer_offers",
  "can_receive_sponsor_offers": "$user.can_receive_sponsor_offers",
  "profile_visibility": "$user.profile_visibility",
  "show_in_directory": "$user.show_in_directory"
}
```

### Step 5: Response
- **Type**: Response
- **Data**:
```json
{
  "success": true,
  "settings": "$settings",
  "consent_records": "$consents"
}
```

---

## Test with cURL

```bash
curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Response

```json
{
  "success": true,
  "settings": {
    "can_receive_peer_offers": false,
    "can_receive_sponsor_offers": false,
    "profile_visibility": "private",
    "show_in_directory": false
  },
  "consent_records": [
    {
      "id": 1,
      "user_id": 123,
      "consent_type": "peer_offers",
      "granted": true,
      "granted_at": 1704067200,
      "revoked_at": null
    }
  ]
}
```

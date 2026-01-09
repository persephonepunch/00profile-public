# Endpoint: PUT /consent

Update user's consent settings.

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → Select `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/consent` |
| **Method** | PUT |
| **Authentication** | JWT (requires auth) |

---

## Function Stack (Add in Order)

### Step 1: Require Authentication
- **Type**: Security: Require Authentication

### Step 2: Input - consent_type
- **Type**: Input
- **Variable Name**: `consent_type`
- **Data Type**: enum
- **Enum Values**: `peer_offers`, `sponsor_offers`, `marketing`
- **Required**: Yes

### Step 3: Input - granted
- **Type**: Input
- **Variable Name**: `granted`
- **Data Type**: boolean
- **Required**: Yes

### Step 4: Get Request Metadata
- **Type**: Create Variable
- **Variable Name**: `ip_address`
- **Value**: `$_server.REMOTE_ADDR`

### Step 5: Create Variable - user_agent
- **Type**: Create Variable
- **Variable Name**: `user_agent`
- **Value**: `$_server.HTTP_USER_AGENT`

### Step 6: Check Existing Consent Record
- **Type**: Query Record
- **Table**: `consent_records`
- **Output Variable**: `existing`
- **Return Type**: Single item
- **Filters**:
  - `user_id` = `id`
  - `consent_type` = `$input.consent_type`

### Step 7: Conditional - Record Exists
- **Type**: Conditional
- **Condition**: `$existing != null`

### Step 8a: Then - Update Existing
- **Type**: Edit Record
- **Table**: `consent_records`
- **Filter**: `id` = `$existing.id`
- **Data**:
```json
{
  "granted": "$input.granted",
  "granted_at": "$input.granted ? now : $existing.granted_at",
  "revoked_at": "$input.granted ? null : now",
  "ip_address": "$ip_address",
  "user_agent": "$user_agent"
}
```
- **Output Variable**: `consent`

### Step 8b: Else - Create New
- **Type**: Add Record
- **Table**: `consent_records`
- **Data**:
```json
{
  "user_id": "id",
  "consent_type": "$input.consent_type",
  "granted": "$input.granted",
  "granted_at": "$input.granted ? now : null",
  "revoked_at": null,
  "ip_address": "$ip_address",
  "user_agent": "$user_agent",
  "created_at": "now"
}
```
- **Output Variable**: `consent`

### Step 9: End Conditional

### Step 10: Update User Settings
- **Type**: Edit Record
- **Table**: `users`
- **Filter**: `id` = `id`
- **Data** (use conditional set based on consent_type):
```json
{
  "can_receive_peer_offers": "$input.consent_type == 'peer_offers' ? $input.granted : $user.can_receive_peer_offers",
  "can_receive_sponsor_offers": "$input.consent_type == 'sponsor_offers' ? $input.granted : $user.can_receive_sponsor_offers"
}
```

### Step 11: Response
- **Type**: Response
- **Data**:
```json
{
  "success": true,
  "consent": "$consent",
  "message": "$input.granted ? 'Consent granted' : 'Consent revoked'"
}
```

---

## Test with cURL

```bash
# Grant consent for peer offers
curl -X PUT "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/consent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "consent_type": "peer_offers",
    "granted": true
  }'
```

## Expected Response

```json
{
  "success": true,
  "consent": {
    "id": 1,
    "user_id": 123,
    "consent_type": "peer_offers",
    "granted": true,
    "granted_at": 1704067200,
    "revoked_at": null,
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  },
  "message": "Consent granted"
}
```

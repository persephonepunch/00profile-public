# Endpoint: POST /peer/send

Send an offer, coupon, or gift to another user.

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → Select `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/peer/send` |
| **Method** | POST |
| **Authentication** | JWT (requires auth) |

---

## Function Stack (Add in Order)

### Step 1: Require Authentication
- **Type**: Security: Require Authentication

### Step 2: Input - recipient_id
- **Type**: Input
- **Variable Name**: `recipient_id`
- **Data Type**: integer
- **Required**: Yes

### Step 3: Input - type
- **Type**: Input
- **Variable Name**: `type`
- **Data Type**: enum
- **Enum Values**: `coupon`, `offer`, `gift`, `request`
- **Required**: Yes

### Step 4: Input - message (optional)
- **Type**: Input
- **Variable Name**: `message`
- **Data Type**: text
- **Required**: No

### Step 5: Input - offer_id (optional)
- **Type**: Input
- **Variable Name**: `offer_id`
- **Data Type**: integer
- **Required**: No

### Step 6: Input - value_type (optional)
- **Type**: Input
- **Variable Name**: `value_type`
- **Data Type**: text
- **Required**: No

### Step 7: Input - value_amount (optional)
- **Type**: Input
- **Variable Name**: `value_amount`
- **Data Type**: decimal
- **Required**: No

### Step 8: Input - value_description (optional)
- **Type**: Input
- **Variable Name**: `value_description`
- **Data Type**: text
- **Required**: No

### Step 9: Input - expires_in_days (optional)
- **Type**: Input
- **Variable Name**: `expires_in_days`
- **Data Type**: integer
- **Required**: No
- **Default**: 30

### Step 10: Precondition - Cannot Send to Self
- **Type**: Precondition
- **Condition**: `$input.recipient_id != id`
- **Error Message**: `Cannot send offers to yourself`
- **HTTP Status**: 400

### Step 11: Get Recipient
- **Type**: Query Record
- **Table**: `users`
- **Output Variable**: `recipient`
- **Filter**: `id` = `$input.recipient_id`

### Step 12: Conditional - Recipient Not Found
- **Type**: Conditional
- **Condition**: `$recipient == null`
- **Then**: Stop & Debug
  - Code: `RECIPIENT_NOT_FOUND`
  - Message: `Recipient not found`
  - HTTP Status: 404

### Step 13: Conditional - Recipient Cannot Receive
- **Type**: Conditional
- **Condition**: `$recipient.can_receive_peer_offers != true`
- **Then**: Stop & Debug
  - Code: `RECIPIENT_NOT_ACCEPTING`
  - Message: `This user is not accepting peer offers`
  - HTTP Status: 403

### Step 14: Check if Blocked
- **Type**: Query Record
- **Table**: `user_blocks`
- **Output Variable**: `blocked`
- **Filters**:
  - `user_id` = `$input.recipient_id`
  - `blocked_user_id` = `id`

### Step 15: Conditional - Is Blocked
- **Type**: Conditional
- **Condition**: `$blocked != null`
- **Then**: Stop & Debug
  - Code: `USER_BLOCKED`
  - Message: `You cannot send offers to this user`
  - HTTP Status: 403

### Step 16: Calculate Expiration
- **Type**: Create Variable
- **Variable Name**: `expires_at`
- **Value**: `now|add_secs_to_timestamp:($input.expires_in_days * 86400)`

### Step 17: Create Transaction Record
- **Type**: Add Record
- **Table**: `peer_transactions`
- **Data**:
```json
{
  "sender_id": "id",
  "recipient_id": "$input.recipient_id",
  "offer_id": "$input.offer_id",
  "type": "$input.type",
  "status": "pending",
  "message": "$input.message",
  "value_type": "$input.value_type",
  "value_amount": "$input.value_amount",
  "value_description": "$input.value_description",
  "expires_at": "$expires_at",
  "created_at": "now"
}
```
- **Output Variable**: `transaction`

### Step 18: Get Sender Info (for response)
- **Type**: Query Record
- **Table**: `users`
- **Output Variable**: `sender`
- **Filter**: `id` = `id`

### Step 19: Response
- **Type**: Response
- **Data**:
```json
{
  "success": true,
  "transaction": {
    "id": "$transaction.id",
    "recipient": {
      "id": "$recipient.id",
      "first_name": "$recipient.first_name",
      "last_name": "$recipient.last_name"
    },
    "type": "$transaction.type",
    "status": "$transaction.status",
    "message": "$transaction.message",
    "expires_at": "$transaction.expires_at",
    "created_at": "$transaction.created_at"
  }
}
```

---

## Test with cURL

```bash
# Send a gift to another user
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/peer/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "recipient_id": 456,
    "type": "gift",
    "message": "Coffee on me!",
    "value_type": "fixed",
    "value_amount": 5.00,
    "value_description": "Starbucks $5 Gift",
    "expires_in_days": 7
  }'
```

## Expected Response

```json
{
  "success": true,
  "transaction": {
    "id": 1,
    "recipient": {
      "id": 456,
      "first_name": "Sarah",
      "last_name": "Smith"
    },
    "type": "gift",
    "status": "pending",
    "message": "Coffee on me!",
    "expires_at": 1704672000,
    "created_at": 1704067200
  }
}
```

## Error Responses

| Code | Status | Message |
|------|--------|---------|
| `RECIPIENT_NOT_FOUND` | 404 | Recipient not found |
| `RECIPIENT_NOT_ACCEPTING` | 403 | This user is not accepting peer offers |
| `USER_BLOCKED` | 403 | You cannot send offers to this user |

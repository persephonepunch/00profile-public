# Endpoint: POST /peer/respond

Accept or decline a peer offer.

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → Select `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/peer/respond` |
| **Method** | POST |
| **Authentication** | JWT (requires auth) |

---

## Function Stack (Add in Order)

### Step 1: Require Authentication
- **Type**: Security: Require Authentication

### Step 2: Input - transaction_id
- **Type**: Input
- **Variable Name**: `transaction_id`
- **Data Type**: integer
- **Required**: Yes

### Step 3: Input - action
- **Type**: Input
- **Variable Name**: `action`
- **Data Type**: enum
- **Enum Values**: `accept`, `decline`, `block`
- **Required**: Yes

### Step 4: Get Transaction
- **Type**: Query Record
- **Table**: `peer_transactions`
- **Output Variable**: `transaction`
- **Filter**: `id` = `$input.transaction_id`

### Step 5: Conditional - Transaction Not Found
- **Type**: Conditional
- **Condition**: `$transaction == null`
- **Then**: Stop & Debug
  - Code: `TRANSACTION_NOT_FOUND`
  - Message: `Transaction not found`
  - HTTP Status: 404

### Step 6: Conditional - Not Recipient
- **Type**: Conditional
- **Condition**: `$transaction.recipient_id != id`
- **Then**: Stop & Debug
  - Code: `NOT_AUTHORIZED`
  - Message: `You are not the recipient of this offer`
  - HTTP Status: 403

### Step 7: Conditional - Already Responded
- **Type**: Conditional
- **Condition**: `$transaction.status != 'pending'`
- **Then**: Stop & Debug
  - Code: `ALREADY_RESPONDED`
  - Message: `This offer has already been responded to`
  - HTTP Status: 400

### Step 8: Conditional - Check if Expired
- **Type**: Conditional
- **Condition**: `$transaction.expires_at != null && $transaction.expires_at < now`
- **Then**:
  - Edit Record: Update status to `expired`
  - Stop & Debug
    - Code: `OFFER_EXPIRED`
    - Message: `This offer has expired`
    - HTTP Status: 400

### Step 9: Map Action to Status
- **Type**: Create Variable
- **Variable Name**: `new_status`
- **Value**: `$input.action == 'accept' ? 'accepted' : 'declined'`

### Step 10: Update Transaction
- **Type**: Edit Record
- **Table**: `peer_transactions`
- **Filter**: `id` = `$input.transaction_id`
- **Data**:
```json
{
  "status": "$new_status",
  "responded_at": "now"
}
```
- **Output Variable**: `updated_transaction`

### Step 11: Conditional - Block User
- **Type**: Conditional
- **Condition**: `$input.action == 'block'`
- **Then**:
  - Add Record to `user_blocks`:
  ```json
  {
    "user_id": "id",
    "blocked_user_id": "$transaction.sender_id",
    "created_at": "now"
  }
  ```

### Step 12: Get Sender Info
- **Type**: Query Record
- **Table**: `users`
- **Output Variable**: `sender`
- **Filter**: `id` = `$transaction.sender_id`

### Step 13: Response
- **Type**: Response
- **Data**:
```json
{
  "success": true,
  "transaction": {
    "id": "$updated_transaction.id",
    "status": "$updated_transaction.status",
    "responded_at": "$updated_transaction.responded_at",
    "sender": {
      "id": "$sender.id",
      "first_name": "$sender.first_name"
    }
  },
  "message": "$input.action == 'accept' ? 'Offer accepted!' : ($input.action == 'block' ? 'Offer declined and user blocked' : 'Offer declined')"
}
```

---

## Test with cURL

```bash
# Accept an offer
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/peer/respond" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "transaction_id": 1,
    "action": "accept"
  }'

# Decline an offer
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/peer/respond" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "transaction_id": 2,
    "action": "decline"
  }'

# Decline and block sender
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/peer/respond" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "transaction_id": 3,
    "action": "block"
  }'
```

## Expected Response

```json
{
  "success": true,
  "transaction": {
    "id": 1,
    "status": "accepted",
    "responded_at": 1704153600,
    "sender": {
      "id": 789,
      "first_name": "John"
    }
  },
  "message": "Offer accepted!"
}
```

## Error Responses

| Code | Status | Message |
|------|--------|---------|
| `TRANSACTION_NOT_FOUND` | 404 | Transaction not found |
| `NOT_AUTHORIZED` | 403 | You are not the recipient of this offer |
| `ALREADY_RESPONDED` | 400 | This offer has already been responded to |
| `OFFER_EXPIRED` | 400 | This offer has expired |

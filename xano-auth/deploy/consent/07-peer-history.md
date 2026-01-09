# Endpoint: GET /peer/history

Get transaction history (both sent and received).

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → Select `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/peer/history` |
| **Method** | GET |
| **Authentication** | JWT (requires auth) |

---

## Function Stack (Add in Order)

### Step 1: Require Authentication
- **Type**: Security: Require Authentication

### Step 2: Input - direction (optional)
- **Type**: Input
- **Variable Name**: `direction`
- **Data Type**: enum
- **Enum Values**: `sent`, `received`, `all`
- **Required**: No
- **Default**: `all`

### Step 3: Input - status (optional)
- **Type**: Input
- **Variable Name**: `status`
- **Data Type**: enum
- **Enum Values**: `pending`, `accepted`, `declined`, `expired`, `all`
- **Required**: No
- **Default**: `all`

### Step 4: Input - page (optional)
- **Type**: Input
- **Variable Name**: `page`
- **Data Type**: integer
- **Required**: No
- **Default**: 1

### Step 5: Input - per_page (optional)
- **Type**: Input
- **Variable Name**: `per_page`
- **Data Type**: integer
- **Required**: No
- **Default**: 20

### Step 6: Query Sent Transactions
- **Type**: Conditional
- **Condition**: `$input.direction == 'sent' || $input.direction == 'all'`
- **Then**:
  - Query All Records
  - **Table**: `peer_transactions`
  - **Output Variable**: `sent_txns`
  - **Filters**:
    - `sender_id` = `id`
    - `status` = `$input.status` (if not 'all')
  - **Sorting**: `created_at` desc

### Step 7: Query Received Transactions
- **Type**: Conditional
- **Condition**: `$input.direction == 'received' || $input.direction == 'all'`
- **Then**:
  - Query All Records
  - **Table**: `peer_transactions`
  - **Output Variable**: `received_txns`
  - **Filters**:
    - `recipient_id` = `id`
    - `status` = `$input.status` (if not 'all')
  - **Sorting**: `created_at` desc

### Step 8: Merge and Sort Results
- **Type**: Create Variable
- **Variable Name**: `all_transactions`
- **Value**: Merge `$sent_txns` and `$received_txns`, sort by `created_at` desc

### Step 9: Paginate Results
- **Type**: Create Variable
- **Variable Name**: `paginated`
- **Value**: Apply offset and limit to `$all_transactions`

### Step 10: Calculate Stats
- **Type**: Create Variable
- **Variable Name**: `stats`
- **Value**:
```json
{
  "total_sent": "$sent_txns|count",
  "total_received": "$received_txns|count",
  "pending_received": "$received_txns|filter:{status:'pending'}|count",
  "accepted_total": "$all_transactions|filter:{status:'accepted'}|count"
}
```

### Step 11: Response
- **Type**: Response
- **Data**:
```json
{
  "success": true,
  "history": "$paginated",
  "stats": "$stats",
  "pagination": {
    "page": "$input.page",
    "per_page": "$input.per_page",
    "total": "$all_transactions|count"
  }
}
```

---

## Simpler Alternative: Two Separate Queries

If merging is complex, return sent and received separately:

### Response (Alternative)
```json
{
  "success": true,
  "sent": "$sent_txns",
  "received": "$received_txns",
  "stats": {
    "total_sent": "$sent_txns|count",
    "total_received": "$received_txns|count"
  }
}
```

---

## Test with cURL

```bash
# Get all history
curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/peer/history" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get only sent offers
curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/peer/history?direction=sent" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get only received offers with accepted status
curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/peer/history?direction=received&status=accepted" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Response

```json
{
  "success": true,
  "history": [
    {
      "id": 3,
      "direction": "sent",
      "sender_id": 123,
      "recipient_id": 456,
      "recipient": {
        "id": 456,
        "first_name": "Sarah",
        "last_name": "Smith"
      },
      "type": "gift",
      "status": "accepted",
      "message": "Coffee on me!",
      "value_description": "Starbucks $5 Gift",
      "created_at": 1704153600,
      "responded_at": 1704160800
    },
    {
      "id": 2,
      "direction": "received",
      "sender_id": 789,
      "recipient_id": 123,
      "sender": {
        "id": 789,
        "first_name": "John",
        "last_name": "Doe"
      },
      "type": "coupon",
      "status": "pending",
      "message": "Thought you'd like this!",
      "value_description": "20% off at Target",
      "created_at": 1704067200,
      "responded_at": null
    }
  ],
  "stats": {
    "total_sent": 5,
    "total_received": 3,
    "pending_received": 1,
    "accepted_total": 4
  },
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 8
  }
}
```

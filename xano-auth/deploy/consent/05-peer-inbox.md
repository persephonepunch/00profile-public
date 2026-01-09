# Endpoint: GET /peer/inbox

Get incoming offers for the authenticated user.

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → Select `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/peer/inbox` |
| **Method** | GET |
| **Authentication** | JWT (requires auth) |

---

## Function Stack (Add in Order)

### Step 1: Require Authentication
- **Type**: Security: Require Authentication

### Step 2: Input - status (optional)
- **Type**: Input
- **Variable Name**: `status`
- **Data Type**: enum
- **Enum Values**: `pending`, `accepted`, `declined`, `expired`, `all`
- **Required**: No
- **Default**: `pending`

### Step 3: Input - page (optional)
- **Type**: Input
- **Variable Name**: `page`
- **Data Type**: integer
- **Required**: No
- **Default**: 1

### Step 4: Input - per_page (optional)
- **Type**: Input
- **Variable Name**: `per_page`
- **Data Type**: integer
- **Required**: No
- **Default**: 20

### Step 5: Build Filter Object
- **Type**: Create Variable
- **Variable Name**: `filters`
- **Value**:
```json
{
  "recipient_id": "id"
}
```

### Step 6: Conditional - Add Status Filter
- **Type**: Conditional
- **Condition**: `$input.status != 'all'`
- **Then**: Update Variable
  - Variable: `filters`
  - Add: `"status": "$input.status"`

### Step 7: Query Transactions with Sender Info
- **Type**: Query All Records
- **Table**: `peer_transactions`
- **Output Variable**: `transactions`
- **Filters**: `$filters`
- **Sorting**:
  - Field: `created_at`
  - Direction: `desc`
- **Pagination**:
  - Page: `$input.page`
  - Per Page: `$input.per_page`
- **Return**: Include totals
- **Addons**: Include `sender` relationship from `users` table

### Step 8: Loop - Format Transactions
- **Type**: For Each
- **Array**: `$transactions.items`
- **As**: `txn`
- **Do**:
  - Query sender: `users` where `id` = `$txn.sender_id`
  - Build formatted object with sender name

### Step 9: Mark Expired Transactions
- **Type**: Create Variable
- **Variable Name**: `formatted_items`
- **Value**: Loop through `$transactions.items` and check if `expires_at < now`

### Step 10: Response
- **Type**: Response
- **Data**:
```json
{
  "success": true,
  "inbox": "$formatted_items",
  "pagination": {
    "page": "$input.page",
    "per_page": "$input.per_page",
    "total": "$transactions.itemsTotal",
    "total_pages": "$transactions.pageTotal"
  }
}
```

---

## Alternative: Simpler Implementation with JOIN

If you have addons configured, use this simpler approach:

### Step 5 (Alternative): Query with Addon
- **Type**: Query All Records
- **Table**: `peer_transactions`
- **Output Variable**: `inbox`
- **Filters**:
  - `recipient_id` = `id`
  - `status` = `$input.status` (if not 'all')
- **Sorting**: `created_at` desc
- **Pagination**: Page/Per Page
- **Addon**: `sender_user` (links to users table via sender_id)

---

## Test with cURL

```bash
# Get pending offers
curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/peer/inbox" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get all offers
curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/peer/inbox?status=all&page=1&per_page=10" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Response

```json
{
  "success": true,
  "inbox": [
    {
      "id": 1,
      "sender": {
        "id": 789,
        "first_name": "John",
        "last_name": "Doe",
        "profile_image_url": "https://..."
      },
      "type": "gift",
      "status": "pending",
      "message": "Coffee on me!",
      "value_type": "fixed",
      "value_amount": 5.00,
      "value_description": "Starbucks $5 Gift",
      "expires_at": 1704672000,
      "is_expired": false,
      "created_at": 1704067200
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 1,
    "total_pages": 1
  }
}
```

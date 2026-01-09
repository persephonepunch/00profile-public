# Endpoint: GET /consent/history

Get audit log of consent changes.

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → Select `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/consent/history` |
| **Method** | GET |
| **Authentication** | JWT (requires auth) |

---

## Function Stack (Add in Order)

### Step 1: Require Authentication
- **Type**: Security: Require Authentication

### Step 2: Input - page (optional)
- **Type**: Input
- **Variable Name**: `page`
- **Data Type**: integer
- **Required**: No
- **Default**: 1

### Step 3: Input - per_page (optional)
- **Type**: Input
- **Variable Name**: `per_page`
- **Data Type**: integer
- **Required**: No
- **Default**: 20

### Step 4: Query Consent History
- **Type**: Query All Records
- **Table**: `consent_records`
- **Output Variable**: `history`
- **Filters**:
  - `user_id` = `id`
- **Sorting**:
  - Field: `created_at`
  - Direction: `desc`
- **Pagination**:
  - Page: `$input.page`
  - Per Page: `$input.per_page`
- **Return**: Include totals

### Step 5: Response
- **Type**: Response
- **Data**:
```json
{
  "success": true,
  "history": "$history.items",
  "pagination": {
    "page": "$input.page",
    "per_page": "$input.per_page",
    "total": "$history.itemsTotal",
    "total_pages": "$history.pageTotal"
  }
}
```

---

## Test with cURL

```bash
curl -X GET "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/consent/history?page=1&per_page=10" \
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
      "user_id": 123,
      "consent_type": "peer_offers",
      "granted": true,
      "granted_at": 1704153600,
      "revoked_at": null,
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": 1704153600
    },
    {
      "id": 2,
      "user_id": 123,
      "consent_type": "peer_offers",
      "granted": false,
      "granted_at": 1704067200,
      "revoked_at": 1704153600,
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": 1704067200
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 10,
    "total": 2,
    "total_pages": 1
  }
}
```

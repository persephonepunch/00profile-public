# Endpoint: /auth/logout

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **API** → `api:hJgoiIwh` group
3. Click **Add API Endpoint**
4. Configure as below:

## Endpoint Configuration

| Setting | Value |
|---------|-------|
| **Name** | `/auth/logout` |
| **Method** | POST |
| **Authentication** | **Requires Authentication** ✓ |
| **Auth Table** | `users` |

---

## Function Stack (Add in Order)

### Step 1: Response
- **Type**: Response
- **Data**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

> **Note**: The JWT token is stateless, so logout is handled client-side by removing the token from localStorage. This endpoint exists for API consistency and potential future session invalidation.

---

## Optional: Track Logout (Add Before Response)

If you want to track logout events:

### Step 1a: Edit Record - Clear Last Login
- **Type**: Edit Record
- **Table**: `users`
- **Filter**:
  - Field: `id`
  - Value: `id` (authenticated user's ID)
- **Data**:
  - `updated_at`: `now`

---

## Test with cURL

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/logout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

## Expected Response

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

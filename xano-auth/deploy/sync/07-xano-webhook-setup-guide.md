# Xano Webhook Setup Guide (Step-by-Step)

Visual walkthrough for creating the Webflow → Xano Users sync webhook.

---

## Overview

| Setting | Value |
|---------|-------|
| **Xano Instance** | `xerb-qpd6-hd8t.n7.xano.io` |
| **API Group** | AUTH |
| **Endpoint Path** | `/webhooks/webflow-users` |
| **Method** | POST |
| **Authentication** | None (public) |

---

## Step 1: Open Xano Workspace

1. Go to: **https://app.xano.com**
2. Sign in to your account
3. Select workspace: **xerb-qpd6-hd8t**

---

## Step 2: Navigate to API Section

1. In left sidebar, click **API**
2. Find the **AUTH** API group
   - If it doesn't exist, click **+ Add API Group** and name it `AUTH`

---

## Step 3: Create New Endpoint

1. Click **+ Add API Endpoint** (top right)
2. Select **Custom endpoint**

### Configure Endpoint Settings:

| Field | Value |
|-------|-------|
| **Path** | `/webhooks/webflow-users` |
| **Method** | `POST` |
| **Description** | Receives Webflow CMS webhooks for Users collection |

3. Click **Save** or **Create**

---

## Step 4: Disable Authentication

⚠️ **IMPORTANT:** Webhooks must be publicly accessible!

1. Click on the endpoint you just created
2. Find **Authentication** section (usually in Settings tab)
3. Set to **None** or **Public**
4. Save changes

---

## Step 5: Build Function Stack (Phase 1 - Minimal)

Start with a minimal version to verify connectivity.

### Add These Operations:

**Operation 1: Create Variable - payload**
```
Type: Create Variable
Name: payload
Value: $_POST
```

**Operation 2: Create Variable - webflow_id**
```
Type: Create Variable
Name: webflow_id
Value: $payload.payload._id
```

**Operation 3: Return Response**
```
Type: Response
Value: {
  "success": true,
  "received_id": "$webflow_id",
  "message": "Webhook received"
}
```

### How to Add Each Operation:

1. Click **+ Add Function** in the stack
2. Search for the operation type
3. Configure as shown above
4. Repeat for each operation

---

## Step 6: Save and Publish

1. Click **Save** (top right)
2. Click **Run & Debug** to test in Xano
3. Or click **Publish** to make it live

---

## Step 7: Test the Endpoint

### Option A: Test in Xano Debugger

1. Click **Run & Debug**
2. In the Request Body, paste:
```json
{
  "triggerType": "collection_item_changed",
  "site": "69437b5f2a4e8316713c38e3",
  "_cid": "6956932cc240cd46605bd66e",
  "payload": {
    "_id": "test-webflow-id-123",
    "_draft": false,
    "_archived": false,
    "fieldData": {
      "name": "Test User",
      "slug": "test-user",
      "role": "student"
    }
  }
}
```
3. Click **Run**
4. Verify response shows:
```json
{
  "success": true,
  "received_id": "test-webflow-id-123",
  "message": "Webhook received"
}
```

### Option B: Test with cURL

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/webhooks/webflow-users" \
  -H "Content-Type: application/json" \
  -d '{
    "triggerType": "collection_item_changed",
    "payload": {
      "_id": "test-123",
      "fieldData": {"name": "Test User"}
    }
  }'
```

---

## Step 8: Add Full Logic (Phase 2)

Once Phase 1 works, expand the function stack:

### Additional Operations to Add:

**Operation 4: Extract field_data**
```
Type: Create Variable
Name: field_data
Value: $payload.payload.fieldData
```

**Operation 5: Precondition - Validate payload**
```
Type: Precondition
Condition: $payload.payload != null
Error Message: No item data in webhook payload
HTTP Status: 400
```

**Operation 6: Extract name parts**
```
Type: Create Variable
Name: wf_name
Value: $field_data.name
```

**Operation 7: Query existing user by webflow_item_id**
```
Type: Query Record
Table: users
Filter: webflow_item_id = $webflow_id
Output: existing_user
```

**Operation 8: Conditional - User exists**
```
Type: Conditional
Condition: $existing_user != null
```

**Inside Conditional (Then):**

**Operation 9: Build merge data**
```
Type: Create Variable
Name: merge_data
Value: {
  "webflow_item_id": "$webflow_id",
  "updated_at": now
}
```

**Operation 10: Update user**
```
Type: Edit Record
Table: users
Filter: id = $existing_user.id
Data: $merge_data
Output: updated_user
```

**End Conditional**

**Operation 11: Final Response**
```
Type: Response
Value: {
  "success": true,
  "action": "$existing_user != null ? 'updated' : 'skipped'",
  "webflow_item_id": "$webflow_id"
}
```

---

## Step 9: Configure Webflow Webhook

After Xano endpoint is working:

1. Go to **Webflow** → Your site (usc-profiles)
2. **Site Settings** → **Integrations** → **Webhooks**
3. Click **Add Webhook**
4. Configure:

| Field | Value |
|-------|-------|
| **URL** | `https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/webhooks/webflow-users` |
| **Trigger** | `collection_item_changed` |
| **Collection** | Users (`6956932cc240cd46605bd66e`) |

5. Click **Add Webhook**

---

## Step 10: Verify End-to-End

1. Edit a user in Webflow CMS
2. Check Xano **Request History** for the webhook call
3. Verify user record updated in Xano `users` table

---

## Troubleshooting

### Webhook not receiving data
- Check Webflow webhook is enabled
- Verify URL is exactly: `https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/webhooks/webflow-users`
- Check Xano endpoint authentication is set to None

### User not updating
- Verify `webflow_item_id` field exists in users table
- Check user was originally synced from Xano (has webflow_item_id)
- Review Xano API logs for errors

### 400 Bad Request
- Payload structure doesn't match expected format
- Missing required fields in webhook data

---

## Quick Reference: Xano Function Stack

```
┌─────────────────────────────────────────────────┐
│ 1. var payload = $_POST                         │
├─────────────────────────────────────────────────┤
│ 2. var webflow_id = $payload.payload._id        │
├─────────────────────────────────────────────────┤
│ 3. var field_data = $payload.payload.fieldData  │
├─────────────────────────────────────────────────┤
│ 4. precondition: $payload.payload != null       │
├─────────────────────────────────────────────────┤
│ 5. query users where webflow_item_id = $id      │
├─────────────────────────────────────────────────┤
│ 6. if existing_user:                            │
│    └─ edit record with merge_data               │
├─────────────────────────────────────────────────┤
│ 7. response { success, action, webflow_id }     │
└─────────────────────────────────────────────────┘
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `xano-webhooks/webflow-users-to-xano-webhook.xanoscript` | Full webhook code |
| `xano-auth/deploy/sync/06-webflow-users-webhook.md` | Technical documentation |
| This file | Step-by-step visual guide |

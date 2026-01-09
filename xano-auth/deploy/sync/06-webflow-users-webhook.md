# Webflow → Xano Users Sync (Bidirectional)

Enable automatic sync from Webflow CMS Users collection to Xano.

---

## Overview

When user profiles are updated in Webflow CMS, changes sync to Xano automatically via webhook.

**Sync Direction:** Webflow → Xano (complements existing Xano → Webflow sync)

**Merge Logic:** Only updates empty fields in Xano - existing data is preserved.

---

## Architecture

```
┌─────────────┐     Webhook      ┌─────────────────────────┐     ┌─────────────┐
│   Webflow   │ ───────────────> │ /webhooks/webflow-users │ ──> │    Xano     │
│  Users CMS  │  item_changed    │    (Xano endpoint)      │     │   users     │
│             │                  │                         │     │    table    │
└─────────────┘                  └─────────────────────────┘     └─────────────┘
```

---

## Setup Steps

### Step 1: Create Xano Endpoint

1. Log into Xano and open your workspace
2. Go to **API → AUTH group → Add API Endpoint**
3. Configure:
   - **Method:** POST
   - **Path:** `/webhooks/webflow-users`
   - **Authentication:** None (webhook must be publicly accessible)
4. Paste the contents of `xano-webhooks/webflow-users-to-xano-webhook.xanoscript`
5. Click **Save & Publish**

### Step 2: Configure Webflow Webhook

1. Log into Webflow and open your site (usc-profiles)
2. Go to **Site Settings → Integrations → Webhooks**
3. Click **Add Webhook**
4. Configure:
   - **Webhook URL:** `https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/webhooks/webflow-users`
   - **Trigger Type:** Select:
     - `collection_item_changed`
   - **Filter:** Collection ID `6956932cc240cd46605bd66e` (Users)
5. Click **Add Webhook**

### Step 3: Test the Integration

1. Edit an existing user in Webflow CMS
2. Check Xano users table - empty fields should update
3. Verify fields with existing Xano data are NOT overwritten

---

## Field Mapping

| Webflow Field | Xano Field | Notes |
|---------------|------------|-------|
| `name` | `first_name`, `last_name` | Split on space |
| `slug` | `slug` | URL-friendly identifier |
| `role` | `role` | User role |
| `visibility` | `visibility` | public/private/invite_only |
| `bio` | `bio` | Profile biography |
| `profile-image.url` | `profile_image_url` | Profile photo |
| `xano-user-id` | - | Used for matching |
| `_id` | `webflow_item_id` | Webflow item ID |

---

## Important Notes

### Users Cannot Be Created from Webflow

Unlike Stories, **new users cannot be created** from Webflow because:
- Users require email + password for authentication
- Users must go through the signup flow

The webhook only **updates existing users** that were created via signup.

### Merge Behavior

| Scenario | Result |
|----------|--------|
| Xano field empty, Webflow has value | ✅ Updated from Webflow |
| Xano field has value, Webflow has value | ❌ Xano value preserved |
| Both fields empty | No change |

---

## Complete Bidirectional Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BIDIRECTIONAL SYNC                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  USER SIGNUP                                                            │
│  ──────────                                                             │
│  User → Signup Form → Xano (creates user) → Webhook → Webflow CMS      │
│                                                                         │
│  PROFILE EDIT IN WEBFLOW                                                │
│  ───────────────────────                                                │
│  Webflow CMS Edit → Webhook → Xano (updates empty fields only)         │
│                                                                         │
│  PROFILE EDIT IN APP                                                    │
│  ────────────────────                                                   │
│  App Form → Xano API → Database Trigger → Webflow API (full update)    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Test with cURL

```bash
# Simulate a Webflow webhook (for testing)
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/webhooks/webflow-users" \
  -H "Content-Type: application/json" \
  -d '{
    "triggerType": "collection_item_changed",
    "site": "69437b5f2a4e8316713c38e3",
    "_cid": "6956932cc240cd46605bd66e",
    "payload": {
      "_id": "test-webflow-id",
      "_draft": false,
      "_archived": false,
      "fieldData": {
        "name": "John Doe",
        "slug": "john-doe",
        "role": "student",
        "visibility": "public",
        "bio": "Test bio from Webflow",
        "xano-user-id": "123"
      }
    }
  }'
```

---

## Troubleshooting

### Webhook not firing
- Verify webhook is enabled in Webflow dashboard
- Check webhook URL is correct: `https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/webhooks/webflow-users`

### User not updating
- Check Xano API logs for errors
- Verify user exists in Xano (webhook can't create users)
- Check if `webflow_item_id` or `slug` matches

### Fields not syncing
- Expected if Xano field already has data (merge logic)
- Clear the Xano field first to allow Webflow value

# Webflow → Xano Real-Time Sync Guide

This guide explains how to set up real-time synchronization from Webflow CMS to Xano.

## Overview

When stories are created or updated in Webflow CMS, they are automatically synced to Xano via webhooks.

**Sync Direction:** Webflow → Xano (reverse of the existing Xano → Webflow sync)

**Conflict Resolution:** Merge fields - only updates empty Xano fields, preserving existing data.

## Architecture

```
┌─────────────┐     Webhook      ┌────────────────────┐     ┌─────────────┐
│   Webflow   │ ───────────────> │ /webhooks/webflow  │ ──> │    Xano     │
│     CMS     │  item_created    │   (Xano endpoint)  │     │   stories   │
│             │  item_changed    │                    │     │    table    │
└─────────────┘                  └────────────────────┘     └─────────────┘
```

## Setup Steps

### Step 1: Create the Xano Endpoint

1. Log into Xano and open your workspace
2. Go to **API → Add API Endpoint**
3. Configure:
   - **Method:** POST
   - **Path:** `/webhooks/webflow`
   - **Authentication:** None (webhook must be publicly accessible)
4. Paste the contents of `xano-webhooks/webflow-to-xano-webhook.xanoscript`
5. Click **Save & Publish**

### Step 2: Add Source Field to Stories Table (Optional but Recommended)

1. Go to **Database → stories table**
2. Add new field:
   - **Name:** `source`
   - **Type:** text
   - **Default:** `"form"`
3. This tracks where each story originated: `form`, `webflow`, or `csv_import`

### Step 3: Configure Webflow Webhook

1. Log into Webflow and open your site
2. Go to **Site Settings → Integrations → Webhooks**
3. Click **Add Webhook**
4. Configure:
   - **Webhook URL:** `https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/webhooks/webflow`
   - **Trigger Type:** Select both:
     - `collection_item_created`
     - `collection_item_changed`
   - **Filter (optional):** Collection ID `69546a95697458f39f126faa` (Stories)
5. Click **Add Webhook**

### Step 4: Test the Integration

1. Create a new story directly in Webflow CMS
2. Check Xano stories table - the story should appear within seconds
3. Edit an existing story in Webflow
4. Verify the changes sync to Xano (only empty fields should update)

## Field Mapping

| Webflow Field | Xano Field | Notes |
|---------------|------------|-------|
| name | story_name | Story title |
| story-content | body_html | Rich text HTML content |
| excerpt | story_input | Brief summary |
| featured-image.url | uploadcare_url | Hero image URL |
| author-name | author_name | Author display name |
| author-email | story_email | Author email |
| author-bio | author_bio | Author biography |
| author-image.url | author_photo | Author photo URL |
| category | category | Story category |
| featured | featured | Featured flag |
| read-time | read_time | Estimated read time |
| published-date | published_date | Publication date |
| document-file.url | document_url | Attached document URL |
| video-url | video_url | Video URL |
| _id | webflow_item_id | Webflow item ID (for tracking) |
| _draft | status | Maps to "draft" status |
| _archived | status | Maps to "archived" status |

## Merge Logic

The sync uses **field merge** conflict resolution:

```
For each Webflow field:
  IF Xano field is NULL or empty string:
    → Update with Webflow value
  ELSE:
    → Keep existing Xano value (skip)
```

This ensures:
- Data entered via your form is never overwritten
- Webflow can fill in missing fields
- Both systems can coexist without conflicts

## Story Matching

The endpoint uses three methods to match incoming Webflow items to existing Xano stories:

1. **webflow_item_id** - Most reliable, used when story was previously synced
2. **xano-id** - Uses the Xano ID stored in Webflow (for stories that originated from Xano)
3. **name + email** - Fallback match by story name and author email

If no match is found, a new story is created with `source: "webflow"`.

## Webhook Payload Format

Webflow sends webhooks in this format:

```json
{
  "triggerType": "collection_item_created",
  "site": "site-id",
  "_cid": "collection-id",
  "payload": {
    "_id": "webflow-item-id",
    "_draft": false,
    "_archived": false,
    "fieldData": {
      "name": "Story Title",
      "story-content": "<p>Content...</p>",
      "excerpt": "Brief summary",
      "featured-image": {"url": "https://..."},
      "author-name": "John Doe",
      "author-email": "john@example.com",
      ...
    }
  }
}
```

## Troubleshooting

### Webhook not firing
- Verify webhook is enabled in Webflow dashboard
- Check webhook URL is correct and publicly accessible
- Test endpoint with curl: `curl -X POST https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/webhooks/webflow -H "Content-Type: application/json" -d '{"test": true}'`

### Story not appearing in Xano
- Check Xano API logs for errors
- Verify the stories table has all required fields
- Ensure the endpoint is published (not in draft mode)

### Fields not updating
- This is expected if the Xano field already has a value (merge logic)
- To force update, clear the Xano field first
- Check field names match exactly (case-sensitive)

### Duplicate stories
- Ensure `webflow_item_id` field exists in Xano
- Check that stories have unique name + email combinations

## Security Considerations

For production use, consider adding webhook signature validation:

1. Webflow includes a signature header with each webhook
2. Validate this signature in your Xano endpoint
3. This prevents unauthorized requests to your webhook

## Related Files

- `xano-webhooks/webflow-to-xano-webhook.xanoscript` - The webhook endpoint code
- `xano-webhooks/sync-story-webhook.xanoscript` - Xano → Webflow sync (reverse direction)
- `xano-triggers/story-sync-trigger.xanoscript` - Database trigger for auto-sync
- `docs/xano-webflow-sync-guide.md` - Original Xano → Webflow sync guide

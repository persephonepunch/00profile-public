# Xano to Webflow Sync - Visual Diagram

## The Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER SUBMITS FORM                                  │
│                         (Webflow Stories Page)                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Form Data Sent to Xano                                             │
│  ─────────────────────────────────                                          │
│  POST https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/stories                │
│                                                                             │
│  {                                                                          │
│    "story_name": "My Story Title",                                          │
│    "story_email": "author@example.com",                                     │
│    "story_content_html": "<p>Story content...</p>",                         │
│    "story_input": "Brief excerpt",                                          │
│    "category": "personal",                                                  │
│    "uploadcare_url": "https://ucarecdn.com/image.jpg"                       │
│  }                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                        XANO ENDPOINT FUNCTION STACK                         │
│                        ════════════════════════════                         │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  PART A: EXISTING CODE (Already Working)                              │  │
│  │  ═══════════════════════════════════════                              │  │
│  │                                                                       │  │
│  │  1. INPUT VALIDATION                                                  │  │
│  │     ├── Check story_name not empty                                    │  │
│  │     └── Check story_email is valid                                    │  │
│  │                                                                       │  │
│  │  2. DATA TRANSFORMATION                                               │  │
│  │     ├── Convert checkbox to boolean                                   │  │
│  │     ├── Set default status = "draft"                                  │  │
│  │     └── Clean empty fields to null                                    │  │
│  │                                                                       │  │
│  │  3. CREATE STORY RECORD ◄─────────────────────────────────────────┐   │  │
│  │     │                                                             │   │  │
│  │     │  var new_story = stories|add:{                              │   │  │
│  │     │    story_name: "My Story Title",                            │   │  │
│  │     │    story_email: "author@example.com",                       │   │  │
│  │     │    story_content_html: "<p>...</p>",                        │   │  │
│  │     │    ...                                                      │   │  │
│  │     │  }                                                          │   │  │
│  │     │                                                             │   │  │
│  │     │  Returns: { id: 18, story_name: "...", ... }                │   │  │
│  │     │                                                             │   │  │
│  │     ▼                                                             │   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │   │  │
│  │  │              XANO DATABASE: stories table                   │  │   │  │
│  │  │  ┌────┬─────────────────┬───────────────────┬────────────┐  │  │   │  │
│  │  │  │ id │ story_name      │ story_email       │ status     │  │  │   │  │
│  │  │  ├────┼─────────────────┼───────────────────┼────────────┤  │  │   │  │
│  │  │  │ 18 │ My Story Title  │ author@example    │ draft      │  │  │   │  │
│  │  │  └────┴─────────────────┴───────────────────┴────────────┘  │  │   │  │
│  │  └─────────────────────────────────────────────────────────────┘  │   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  PART B: NEW CODE TO ADD (Webflow Sync)                               │  │
│  │  ══════════════════════════════════════                               │  │
│  │                                                                       │  │
│  │  4. GET ENVIRONMENT VARIABLES                                         │  │
│  │     ├── webflow_token = $env.WEBFLOW_API_TOKEN                        │  │
│  │     └── webflow_collection_id = $env.WEBFLOW_COLLECTION_ID            │  │
│  │                                                                       │  │
│  │  5. CONDITIONAL: if tokens exist                                      │  │
│  │     │                                                                 │  │
│  │     ▼                                                                 │  │
│  │  6. GENERATE SLUG                                                     │  │
│  │     │  "My Story Title" → "my-story-title-18"                         │  │
│  │     │                                                                 │  │
│  │     ▼                                                                 │  │
│  │  7. BUILD WEBFLOW FIELDS ◄── Map Xano fields to Webflow fields        │  │
│  │     │                                                                 │  │
│  │     │  ┌──────────────────────┬─────────────────────────────────┐     │  │
│  │     │  │ Xano Field           │ Webflow Field                   │     │  │
│  │     │  ├──────────────────────┼─────────────────────────────────┤     │  │
│  │     │  │ story_name           │ name                            │     │  │
│  │     │  │ story_content_html   │ story-content                   │     │  │
│  │     │  │ story_input          │ excerpt                         │     │  │
│  │     │  │ story_email          │ author-email                    │     │  │
│  │     │  │ uploadcare_url       │ hero-image                      │     │  │
│  │     │  │ category             │ category                        │     │  │
│  │     │  └──────────────────────┴─────────────────────────────────┘     │  │
│  │     │                                                                 │  │
│  │     ▼                                                                 │  │
│  │  8. EXTERNAL API REQUEST ─────────────────────────────────────────┐   │  │
│  │     │                                                             │   │  │
│  │     │  POST https://api.webflow.com/v2/collections/{id}/items     │   │  │
│  │     │                                                             │   │  │
│  │     │  Headers:                                                   │   │  │
│  │     │    Authorization: Bearer {WEBFLOW_API_TOKEN}                │   │  │
│  │     │    Content-Type: application/json                           │   │  │
│  │     │                                                             │   │  │
│  │     │  Body:                                                      │   │  │
│  │     │  {                                                          │   │  │
│  │     │    "fieldData": {                                           │   │  │
│  │     │      "name": "My Story Title",                              │   │  │
│  │     │      "slug": "my-story-title-18",                           │   │  │
│  │     │      "story-content": "<p>...</p>",                         │   │  │
│  │     │      "excerpt": "Brief excerpt",                            │   │  │
│  │     │      ...                                                    │   │  │
│  │     │    }                                                        │   │  │
│  │     │  }                                                          │   │  │
│  │     │                                                             │   │  │
│  │     ▼                                                             ▼   │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    WEBFLOW API                                  │  │  │
│  │  │                                                                 │  │  │
│  │  │  Response: { "id": "abc123xyz", ... }                           │  │  │
│  │  │                         │                                       │  │  │
│  │  └─────────────────────────│───────────────────────────────────────┘  │  │
│  │                            │                                          │  │
│  │                            ▼                                          │  │
│  │  9. CONDITIONAL: if webflow_response.id exists                        │  │
│  │     │                                                                 │  │
│  │     ▼                                                                 │  │
│  │  10. UPDATE XANO RECORD ──────────────────────────────────────────┐   │  │
│  │      │                                                            │   │  │
│  │      │  stories|edit:$new_story.id:{                              │   │  │
│  │      │    webflow_item_id: "abc123xyz",  ◄── Save Webflow ID      │   │  │
│  │      │    webflow_synced_at: now         ◄── Save timestamp       │   │  │
│  │      │  }                                                         │   │  │
│  │      │                                                            │   │  │
│  │      ▼                                                            │   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │   │  │
│  │  │              XANO DATABASE: stories table (UPDATED)         │  │   │  │
│  │  │  ┌────┬────────────────┬──────────────────┬────────────────┐│  │   │  │
│  │  │  │ id │ story_name     │ webflow_item_id  │ webflow_synced ││  │   │  │
│  │  │  ├────┼────────────────┼──────────────────┼────────────────┤│  │   │  │
│  │  │  │ 18 │ My Story Title │ abc123xyz        │ 2025-12-31...  ││  │   │  │
│  │  │  └────┴────────────────┴──────────────────┴────────────────┘│  │   │  │
│  │  └─────────────────────────────────────────────────────────────┘  │   │  │
│  │                                                                   │   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                      │
│                                      ▼                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │  PART C: RESPONSE                                                     │  │
│  │  ════════════════                                                     │  │
│  │                                                                       │  │
│  │  11. RETURN SUCCESS RESPONSE                                          │  │
│  │      {                                                                │  │
│  │        "success": true,                                               │  │
│  │        "story_id": 18,                                                │  │
│  │        "webflow_sync": {                                              │  │
│  │          "success": true,                                             │  │
│  │          "webflow_item_id": "abc123xyz"                               │  │
│  │        }                                                              │  │
│  │      }                                                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        WEBFLOW CMS COLLECTION                               │
│                        ══════════════════════                               │
│                                                                             │
│  Stories Collection (automatically updated!)                                │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  name           │ My Story Title                                    │   │
│  │  slug           │ my-story-title-18                                 │   │
│  │  story-content  │ <p>Story content...</p>                           │   │
│  │  excerpt        │ Brief excerpt                                     │   │
│  │  author-email   │ author@example.com                                │   │
│  │  hero-image     │ https://ucarecdn.com/image.jpg                    │   │
│  │  category       │ personal                                          │   │
│  │  _draft         │ true (or false if published)                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  This item now appears in your Webflow CMS and can be displayed            │
│  on your Webflow site using Collection Lists!                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Summary: What Each Part Does

| Part | What It Does | Already Done? |
|------|--------------|---------------|
| **Part A** | Validates input, saves to Xano database | ✅ Yes |
| **Part B** | Syncs the saved record to Webflow CMS | ❌ Need to add |
| **Part C** | Returns response with sync status | ❌ Need to update |

---

## The Key New Steps (Part B)

```
AFTER saving to Xano database:
    │
    ├── Step 4: Get WEBFLOW_API_TOKEN from environment
    ├── Step 5: Get WEBFLOW_COLLECTION_ID from environment
    ├── Step 6: Check if both tokens exist
    │
    └── IF tokens exist:
        ├── Step 7: Generate URL-friendly slug
        ├── Step 8: Map Xano fields → Webflow fields
        ├── Step 9: POST to Webflow API
        │
        └── IF Webflow returns success:
            └── Step 10: Save webflow_item_id back to Xano
```

---

## Required Database Fields

Add these 2 fields to your `stories` table in Xano:

| Field Name | Type | Purpose |
|------------|------|---------|
| `webflow_item_id` | text | Stores the Webflow CMS item ID |
| `webflow_synced_at` | timestamp | When the sync occurred |

---

## Required Environment Variables

Set these in Xano (Settings → Environment Variables):

| Variable Name | Where to Get It |
|---------------|-----------------|
| `WEBFLOW_API_TOKEN` | Webflow → Site Settings → Apps & Integrations → API Access |
| `WEBFLOW_COLLECTION_ID` | Webflow → CMS → Stories collection → Settings → Collection ID |

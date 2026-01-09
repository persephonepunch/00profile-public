# Xano to Webflow Sync - Step by Step Guide

This guide walks you through adding real-time Webflow sync to your Xano `/story` endpoint.

---

## Prerequisites (Already Done ✓)

- [x] Webflow API Token set as `WEBFLOW_API_TOKEN` in Xano environment variables
- [x] Webflow Collection ID set as `WEBFLOW_COLLECTION_ID` in Xano environment variables

---

## Step 1: Open the Endpoint

1. Go to **https://xerb-qpd6-hd8t.n7.xano.io**
2. Click **API** in the left sidebar
3. Find and click on **pIN2vLYu** (your API group)
4. Click on **POST /story** endpoint
5. Click **Edit** or the endpoint name to open the function stack editor

---

## Step 2: Locate the "Add Record" Block

In the function stack, find the block that creates the story record. It should be called something like:
- `Add Record` or `Create Record`
- Table: `stories`

**All new blocks will be added AFTER this block.**

---

## Step 3: Add "Create Variable" for Slug

1. Click the **+** button after the Add Record block
2. Select **Create Variable**
3. Configure:
   - **Name**: `slug`
   - **Type**: Text
   - **Value** (click the `{ }` button for expression mode):
   ```
   $story.story_name|lowercase|replace:" ":"-"|truncate:100
   ```

> Note: `$story` refers to the output of your Add Record block. If yours is named differently (like `$result` or `$new_story`), use that name instead.

---

## Step 4: Add "Create Variable" for Xano ID String

1. Click **+** after the slug variable
2. Select **Create Variable**
3. Configure:
   - **Name**: `xano_id_str`
   - **Type**: Text
   - **Value**:
   ```
   $story.id|to_string
   ```

---

## Step 5: Add "Create Variable" for Webflow Fields

1. Click **+** after xano_id_str
2. Select **Create Variable**
3. Configure:
   - **Name**: `webflow_fields`
   - **Type**: Object
   - **Value** (use the object builder or raw JSON):

```json
{
  "name": "$story.story_name",
  "slug": "$slug",
  "_archived": false,
  "_draft": true,
  "xano-id": "$xano_id_str"
}
```

**Or use the Object Builder:**
| Key | Value |
|-----|-------|
| name | `$story.story_name` |
| slug | `$slug` |
| _archived | `false` |
| _draft | `true` |
| xano-id | `$xano_id_str` |

---

## Step 6: Add Conditional Blocks for Optional Fields

### 6a: Story Content (body_html)
1. Click **+** → **Conditional**
2. Condition: `$story.body_html != null`
3. Inside the conditional, add **Update Variable**:
   - **Variable**: `webflow_fields`
   - **Operation**: Set
   - **Key**: `story-content`
   - **Value**: `$story.body_html`
4. Close the conditional (End If)

### 6b: Excerpt (story_input)
1. Click **+** → **Conditional**
2. Condition: `$story.story_input != null && $story.story_input != ""`
3. Inside, add **Update Variable**:
   - **Variable**: `webflow_fields`
   - **Key**: `excerpt`
   - **Value**: `$story.story_input`
4. Close the conditional

### 6c: Category
1. Click **+** → **Conditional**
2. Condition: `$story.category != null && $story.category != ""`
3. Inside, add **Update Variable**:
   - **Variable**: `webflow_fields`
   - **Key**: `category`
   - **Value**: `$story.category`
4. Close the conditional

### 6d: Featured Image (uploadcare_url)
1. Click **+** → **Conditional**
2. Condition: `$story.uploadcare_url != null`
3. Inside, add **Update Variable**:
   - **Variable**: `webflow_fields`
   - **Key**: `featured-image`
   - **Value**: `{"url": $story.uploadcare_url}` (as object)
4. Close the conditional

---

## Step 7: Add "Create Variable" for Request Body

1. Click **+** after all conditionals
2. Select **Create Variable**
3. Configure:
   - **Name**: `request_body`
   - **Type**: Object
   - **Value**:
   ```json
   {
     "fieldData": "$webflow_fields"
   }
   ```

---

## Step 8: Add "External API Request" (The Main Sync!)

1. Click **+** → **External API Request**
2. Configure:

| Setting | Value |
|---------|-------|
| **URL** | `https://api.webflow.com/v2/collections/` then click `{ }` and add: `$env.WEBFLOW_COLLECTION_ID` then `/items` |
| **Method** | `POST` |
| **Headers** | See below |
| **Body/Params** | `$request_body` |
| **Run As** | Async (optional, for faster response) |
| **Output Variable** | `webflow_response` |

**Full URL Expression:**
```
"https://api.webflow.com/v2/collections/" ~ $env.WEBFLOW_COLLECTION_ID ~ "/items"
```

**Headers (add 2 headers):**

| Header Name | Header Value |
|-------------|--------------|
| `Authorization` | `"Bearer " ~ $env.WEBFLOW_API_TOKEN` |
| `Content-Type` | `application/json` |

**Body:**
- Select **JSON** or **Raw**
- Value: `$request_body`

---

## Step 9: Add Conditional to Check Success

1. Click **+** → **Conditional**
2. Condition: `$webflow_response.result.id != null`
3. Inside the conditional:

### Add "Edit Record" to Save Webflow ID
1. Click **+** → **Edit Record**
2. Configure:
   - **Table**: `stories`
   - **Record ID**: `$story.id`
   - **Fields to update**:
     | Field | Value |
     |-------|-------|
     | webflow_item_id | `$webflow_response.result.id` |
     | webflow_synced_at | `now` |

4. Close the conditional

---

## Step 10: Update the Response (Optional)

If you want the API response to include the Webflow sync status:

1. Find the **Response** block at the end
2. Add these fields to the response object:
   - `webflow_item_id`: `$webflow_response.result.id`
   - `webflow_synced`: `true`

---

## Step 11: Save and Test

1. Click **Save** or **Publish** in Xano
2. Test with this curl command:

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/story" \
  -H "Content-Type: application/json" \
  -d '{
    "story_name": "My First Synced Story",
    "story_email": "author@example.com",
    "story_input": "This is an excerpt",
    "story_tags": "test,sync",
    "story_checkbox": true,
    "body_html": "<h2>Hello World</h2><p>This syncs to Webflow!</p>",
    "category": "news"
  }'
```

3. Check:
   - ✅ Xano: Record created with `webflow_item_id` populated
   - ✅ Webflow: New item appears in Stories collection

---

## Troubleshooting

### "webflow_item_id is empty"
- Check environment variables are set correctly
- Verify the External API Request URL is correct
- Look at Xano request history for error details

### "401 Unauthorized"
- Your `WEBFLOW_API_TOKEN` is invalid or expired
- Generate a new token in Webflow: Site Settings → Apps & Integrations → API Access

### "404 Not Found"
- Your `WEBFLOW_COLLECTION_ID` is wrong
- Get the correct ID from Webflow: CMS → Stories → Settings → Collection ID

### "400 Bad Request"
- Check the field names match your Webflow collection exactly
- Required fields: `name`, `slug`
- Category must be one of: opinion, news, feature, review, campus, sports, curriculum, other

---

## Quick Reference: Field Mapping

| Xano Field | Webflow Field | Type |
|------------|---------------|------|
| story_name | name | PlainText (required) |
| (generated) | slug | PlainText (required) |
| body_html | story-content | RichText |
| story_input | excerpt | PlainText |
| uploadcare_url | featured-image | Image |
| category | category | Option |
| id | xano-id | PlainText |

---

## Complete Function Stack Overview

```
1. [Existing] Input Validation
2. [Existing] Add Record → $story
3. [NEW] Create Variable: slug
4. [NEW] Create Variable: xano_id_str
5. [NEW] Create Variable: webflow_fields
6. [NEW] Conditional: if body_html exists → add to webflow_fields
7. [NEW] Conditional: if story_input exists → add to webflow_fields
8. [NEW] Conditional: if category exists → add to webflow_fields
9. [NEW] Conditional: if uploadcare_url exists → add to webflow_fields
10. [NEW] Create Variable: request_body
11. [NEW] External API Request → $webflow_response
12. [NEW] Conditional: if success → Edit Record (save webflow_item_id)
13. [Existing] Response
```

---

Done! Your endpoint now syncs to Webflow in real-time. 🎉

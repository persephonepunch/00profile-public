# Story Endpoint Implementation Guide

## Overview
This guide will help you implement the story submission endpoint in Xano following the recommended incremental workflow.

## Files Created
1. `xano-story-endpoint-MINIMAL.xanoscript` - Start with this for testing
2. `xano-story-endpoint.xanoscript` - Complete implementation

## Incremental Implementation (RECOMMENDED)

### Phase 1: Deploy Minimal Version First

**Why?** Test that your endpoint works before adding complex logic.

1. **Open Xano Dashboard**
   - Navigate to: https://xerb-qpd6-hd8t.n7c.xano.io
   - Go to API Group `pIN2vLYu`
   - Find or create endpoint: `POST /story`

2. **Copy Minimal XanoScript**
   - Open `xano-story-endpoint-MINIMAL.xanoscript`
   - Copy the entire content
   - Paste into the Xano Function Stack editor
   - Save the endpoint

3. **Test Minimal Version**
   ```bash
   curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/story" \
     -H "Content-Type: application/json" \
     -d '{
       "story_name": "Test Story",
       "story_email": "test@example.com"
     }'
   ```

4. **Expected Response**
   ```json
   {
     "success": true,
     "message": "Story validation passed",
     "received_name": "Test Story",
     "received_email": "test@example.com"
   }
   ```

### Phase 2: Deploy Complete Version

**After minimal version works**, upgrade to the complete implementation:

1. **Open the same endpoint in Xano**
2. **Copy Complete XanoScript**
   - Open `xano-story-endpoint.xanoscript`
   - Copy the entire content
   - Replace the minimal version in Function Stack
   - Save the endpoint

3. **Test Complete Version**
   ```bash
   curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/story" \
     -H "Content-Type: application/json" \
     -d '{
       "story_name": "My First Story",
       "story_email": "author@example.com",
       "story_input": "https://example.com/reference",
       "story_tags": "adventure, fiction",
       "story_checkbox": "true",
       "story_content_html": "<p>This is a <strong>test story</strong> with rich text content.</p>",
       "uploadcare_uuid": "abc123-def456",
       "uploadcare_url": "https://ucarecdn.com/abc123/",
       "uploadcare_file_name": "hero-image.jpg",
       "uploadcare_file_size": 245678,
       "uploadcare_mime_type": "image/jpeg",
       "uploadcare_metadata": {
         "width": 1920,
         "height": 1080,
         "format": "JPEG"
       }
     }'
   ```

4. **Expected Response**
   ```json
   {
     "success": true,
     "message": "Story created successfully",
     "story_id": 123,
     "data": {
       "id": 123,
       "story_name": "My First Story",
       "story_email": "author@example.com",
       "story_input": "https://example.com/reference",
       "story_tags": "adventure, fiction",
       "story_checkbox": true,
       "story_content_html": "<p>This is a <strong>test story</strong> with rich text content.</p>",
       "uploadcare_uuid": "abc123-def456",
       "uploadcare_url": "https://ucarecdn.com/abc123/",
       "uploadcare_file_name": "hero-image.jpg",
       "uploadcare_file_size": 245678,
       "uploadcare_mime_type": "image/jpeg",
       "uploadcare_metadata": {
         "width": 1920,
         "height": 1080,
         "format": "JPEG"
       },
       "created_at": 1702345678
     }
   }
   ```

## What the Complete Implementation Does

### Step 1: Input Validation
- Validates required fields (story_name, story_email)
- Returns 400 error if validation fails

### Step 2: Checkbox Conversion
Converts the checkbox string value to a proper boolean:
```javascript
// JavaScript sends: "true" or "false" (string)
// Xano converts to: true or false (boolean)
```

### Step 3: Uploadcare Data Cleaning
Handles missing/empty Uploadcare fields:
- Empty strings → `null`
- Missing file size → `0`
- Preserves metadata object if present

### Step 4: Database Insert
Inserts the story into the `stories` table with all fields properly typed.

### Step 5: Response
Returns success message with:
- Success status
- Message
- New story ID
- Complete story data

## Database Table Requirements

Your `stories` table should have these fields:

| Field Name | Type | Required | Notes |
|------------|------|----------|-------|
| id | integer | auto | Primary key |
| story_name | text | yes | Story title |
| story_email | text | yes | Author email |
| story_input | text | no | Reference URL |
| story_tags | text | no | Comma-separated tags |
| story_checkbox | boolean | no | Checkbox state |
| story_content_html | text | no | Rich text HTML from Tiptap |
| uploadcare_uuid | text | no | Uploadcare file UUID |
| uploadcare_url | text | no | Uploadcare CDN URL |
| uploadcare_file_name | text | no | Original filename |
| uploadcare_file_size | integer | no | File size in bytes |
| uploadcare_mime_type | text | no | MIME type (e.g., "image/jpeg") |
| uploadcare_metadata | object/json | no | Image metadata (width, height, format) |
| created_at | timestamp | auto | Auto-generated |

## Troubleshooting

### Error: "Story name is required"
- Check that `story_name` field is included in request
- Check that it's not an empty string

### Error: "Email is required"
- Check that `story_email` field is included in request
- Check that it's not an empty string

### Error: Invalid table or field
- Verify your table is named exactly `stories`
- Check that all field names match exactly (case-sensitive)
- Ensure field types match the schema

### No response or timeout
- Check Xano instance is running
- Verify API group canonical ID is correct (`pIN2vLYu`)
- Check endpoint method is `POST` not `GET`

## Testing from Your Form

After deploying, your HTML form at `/Users/yoonsunlee/usc-story/theme/stories.html` should work automatically since it's already configured to submit to:

```
https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/story
```

The form already includes all the required fields and the Tiptap editor integration, so it should work seamlessly once the endpoint is deployed.

## Next Steps

1. ✅ Deploy minimal version and test with curl
2. ✅ Verify database insert works
3. ✅ Deploy complete version
4. ✅ Test from your HTML form
5. ✅ Add any custom validation rules you need
6. ✅ Customize the response format if needed

## Need Help?

If you encounter any issues:
1. Check the Xano debugger for detailed error messages
2. Test with curl first before testing with the form
3. Verify all database field names and types match exactly
4. Review the XanoScript comments for each step's purpose

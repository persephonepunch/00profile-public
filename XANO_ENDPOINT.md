# Xano Endpoint for HTML File Storage

This document explains how to create the Xano endpoint that saves HTML content as files to Xano File Storage.

## Endpoint Overview

**Purpose:** Accept HTML content from the rich text editor and save it as an `.html` file in Xano File Storage.

**Endpoint URL:** `/story/save-html`
**Method:** `POST`
**API Group:** Same as your existing story endpoint (`api:pIN2vLYu`)

---

## Input Parameters

The endpoint expects a JSON body with these fields:

```json
{
  "filename": "story_1234567890_my_story.html",
  "html_content": "<h1>My Story</h1><p>This is my story content...</p>",
  "story_name": "My Story"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `filename` | text | Yes | The name for the HTML file (e.g., `story_123.html`) |
| `html_content` | text | Yes | The HTML content from the Quill editor |
| `story_name` | text | No | The story title (for metadata) |

---

## Response

Success response (200 OK):
```json
{
  "success": true,
  "file_url": "https://your-xano-storage.com/stories/story_123.html",
  "filename": "story_1234567890_my_story.html",
  "file_size": 2048,
  "created_at": 1234567890
}
```

Error response (400/500):
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## Implementation Options

### Option 1: Manual Creation in Xano UI (Recommended for Beginners)

1. **Go to your Xano workspace**
2. **Navigate to your API Group** (the same one with your `/story` endpoint)
3. **Click "Add API Endpoint"**
4. **Configure:**
   - Name: `save-html`
   - Path: `/story/save-html`
   - Method: `POST`

5. **Add Inputs:**
   - `filename` (text, required)
   - `html_content` (text, required)
   - `story_name` (text, optional)

6. **Add Function Stack** (copy the XanoScript below):

```xanoscript
# Validate inputs
input filename text
input html_content text
input story_name text

precondition $input.filename != "" "Filename is required" 400
precondition $input.html_content != "" "HTML content is required" 400

# Create HTML file in Xano File Storage
var file storageCreateFile $input.filename $input.html_content "html_file"

# Get the file URL
var file_url storageGetUrl $html_file.id "file_url"

# Prepare response
var response {}|set:"success":true|set:"file_url":$file_url|set:"filename":$input.filename|set:"file_size":$input.html_content|length|set:"created_at":now

response $response
```

7. **Save and Test**

---

### Option 2: Using XanoScript SDK (Advanced)

If you're comfortable with the Xano SDK Builder skill, here's the JSON structure:

```json
{
  "type": "endpoint",
  "name": "/story/save-html",
  "method": "POST",
  "operations": [
    {"method": "input", "args": ["filename", "text"]},
    {"method": "input", "args": ["html_content", "text"]},
    {"method": "input", "args": ["story_name", "text"]},
    {"method": "precondition", "args": ["$input.filename != \"\"", "Filename is required", 400]},
    {"method": "precondition", "args": ["$input.html_content != \"\"", "HTML content is required", 400]},
    {"method": "storageCreateFile", "args": ["$input.filename", "$input.html_content", "html_file"]},
    {"method": "storageGetUrl", "args": ["$html_file.id", "file_url"]},
    {"method": "var", "args": ["response", "{}|set:\"success\":true|set:\"file_url\":$file_url|set:\"filename\":$input.filename|set:\"file_size\":($input.html_content|length)|set:\"created_at\":now"]},
    {"method": "response", "args": ["$response"]}
  ]
}
```

---

### Option 3: Extended Version with Database Logging

If you want to track all HTML files created in a database:

1. **Create a database table** named `story_html_files`:
   - `id` (integer, auto-increment, primary key)
   - `filename` (text)
   - `file_url` (text)
   - `story_name` (text)
   - `file_size` (integer)
   - `created_at` (timestamp)

2. **Use this XanoScript:**

```xanoscript
# Validate inputs
input filename text
input html_content text
input story_name text

precondition $input.filename != "" "Filename is required" 400
precondition $input.html_content != "" "HTML content is required" 400

# Create HTML file in Xano File Storage
var html_file storageCreateFile $input.filename $input.html_content "html_file"

# Get the file URL
var file_url storageGetUrl $html_file.id "file_url"

# Calculate file size
var file_size $input.html_content|length

# Save to database for tracking
var record {}|set:"filename":$input.filename|set:"file_url":$file_url|set:"story_name":$input.story_name|set:"file_size":$file_size|set:"created_at":now
var db_record story_html_files|addRecord:$record

# Prepare response
var response {}|set:"success":true|set:"file_url":$file_url|set:"filename":$input.filename|set:"file_size":$file_size|set:"created_at":now|set:"record_id":$db_record.id

response $response
```

---

## Testing the Endpoint

### Using curl:

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/story/save-html" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "test_story_123.html",
    "html_content": "<h1>Test Story</h1><p>This is a test.</p>",
    "story_name": "Test Story"
  }'
```

Expected response:
```json
{
  "success": true,
  "file_url": "https://x-yz-abc.xano.io/vault/xyz/test_story_123.html",
  "filename": "test_story_123.html",
  "file_size": 46,
  "created_at": 1234567890
}
```

### Using JavaScript (from your form):

```javascript
const response = await fetch('https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/story/save-html', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    filename: 'story_123.html',
    html_content: '<h1>My Story</h1><p>Content here</p>',
    story_name: 'My Story'
  })
});

const result = await response.json();
console.log('File URL:', result.file_url);
```

---

## Updating Your Story Database Table

To store the HTML file URL with your story, update your `story` table to include:

1. **Add new fields:**
   - `story_content_html_url` (text) - URL to the HTML file
   - `story_content_preview` (text) - First 500 characters for preview

2. **Update your main `/story` endpoint** to accept these fields in the input

---

## File Storage Location

HTML files will be stored in Xano's File Storage and accessible via:
- Public URLs (if using public access)
- Signed URLs (if using private access with expiry)

**File path structure:**
```
/vault/[workspace-id]/[filename]
```

Example:
```
https://xerb-qpd6-hd8t.n7.xano.io/vault/xyz123/story_1234567890_my_story.html
```

---

## Security Considerations

### Input Validation
- The endpoint validates that `filename` and `html_content` are not empty
- You may want to add additional validation:
  - Max file size limit
  - Allowed HTML tags (sanitization)
  - Filename format validation

### HTML Sanitization
Consider sanitizing HTML on the server to prevent XSS attacks:

```xanoscript
# Add after input validation
var safe_html $input.html_content|strip_tags:"<p><br><h1><h2><h3><strong><em><ul><ol><li><a><img>"
```

### Access Control
If you want to restrict who can create HTML files:

```xanoscript
# Add authentication at the start
requiresAuth

# Then check user permissions
conditional id == null
  throw "UNAUTHORIZED" "Authentication required" 401
endConditional
```

---

## Troubleshooting

### Error: "storageCreateFile is not defined"
- Make sure you're using Xano's File Storage feature
- Check that File Storage is enabled in your workspace

### Error: "Invalid filename"
- Filenames must be valid (no special characters except underscore and dash)
- Use `.html` extension
- Example: `story_123_my_title.html`

### File Not Accessible
- Check file access permissions (public vs private)
- Use signed URLs for private files
- Verify the file URL in the response

### Large HTML Content Fails
- Xano has limits on request body size
- Consider compressing HTML or using a different approach for very large content

---

## Next Steps

1. **Create the endpoint** in Xano using Option 1 (Manual) or Option 2 (SDK)
2. **Test with curl** to verify it works
3. **Update your story table** to include HTML URL fields
4. **Deploy your updated form** with Quill editor
5. **Test the complete flow** from form submission to file creation

---

## Support

If you encounter issues:
1. Check Xano logs for error messages
2. Verify all inputs are being sent correctly
3. Test the endpoint independently with curl
4. Check file storage permissions in Xano

For Xano-specific questions, refer to:
- [Xano File Storage Documentation](https://docs.xano.com/working-with-files)
- [Xano API Documentation](https://docs.xano.com)

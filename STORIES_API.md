# Stories API Documentation v2.0

Complete REST API documentation for the Stories endpoints.

## Base URL

```
https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu
```

---

## Database Schema

### `stories` Table

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `id` | integer | auto | - | Primary key |
| `story_name` | text | yes | - | Story title |
| `story_email` | text | yes | - | Author email |
| `story_input` | text | no | null | Brief summary (140 chars) |
| `story_tags` | text | no | null | Comma-separated tags |
| `story_checkbox` | boolean | no | false | Publish permission |
| `story_content_html` | text | no | null | Rich text HTML content |
| `category` | text | no | null | Story category |
| `featured` | boolean | no | false | Featured story flag |
| `status` | text | no | "draft" | draft, pending, published, archived |
| `view_count` | integer | no | 0 | Number of views |
| `author_bio` | text | no | null | Author biography |
| `author_photo` | text | no | null | Author photo URL |
| `author_social` | text/object | no | null | Author social links |
| `uploadcare_uuid` | text | no | null | Hero image UUID |
| `uploadcare_url` | text | no | null | Hero image CDN URL |
| `uploadcare_file_name` | text | no | null | Original filename |
| `uploadcare_file_size` | integer | no | 0 | File size in bytes |
| `uploadcare_mime_type` | text | no | null | MIME type |
| `uploadcare_metadata` | object | no | null | Image metadata |
| `video_url` | text | no | null | Video URL |
| `audio_url` | text | no | null | Audio URL |
| `gallery_images` | object | no | null | Gallery images array |
| `published_date` | timestamp | no | null | When published |
| `created_at` | timestamp | auto | now | Creation timestamp |
| `updated_at` | timestamp | auto | now | Last update timestamp |

---

## Endpoints

### 1. Create Story

**POST** `/stories`

Create a new story with content, author profile, and media.

#### Request Body

```json
{
  "story_name": "My Amazing Story",
  "story_email": "author@example.com",
  "story_input": "A brief summary of my story",
  "story_tags": "adventure, travel, inspiration",
  "story_checkbox": true,
  "story_content_html": "<h1>My Story</h1><p>Content here...</p>",
  "category": "personal",
  "featured": false,
  "status": "draft",
  "author_bio": "Writer and adventurer",
  "author_photo": "https://example.com/photo.jpg",
  "author_social": {
    "twitter": "@author",
    "instagram": "@author"
  },
  "uploadcare_uuid": "abc123",
  "uploadcare_url": "https://ucarecdn.com/abc123/",
  "uploadcare_file_name": "hero.jpg",
  "uploadcare_file_size": 102400,
  "uploadcare_mime_type": "image/jpeg",
  "video_url": "https://youtube.com/watch?v=xxx",
  "audio_url": "https://soundcloud.com/track",
  "gallery_images": [
    {"url": "https://ucarecdn.com/img1/", "caption": "Image 1"},
    {"url": "https://ucarecdn.com/img2/", "caption": "Image 2"}
  ]
}
```

#### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `story_name` | text | Story title |
| `story_email` | text | Valid email address |

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Story created successfully",
  "story_id": 123,
  "status": "draft",
  "created_at": "2025-12-30T10:00:00Z",
  "data": {
    "id": 123,
    "story_name": "My Amazing Story",
    "story_email": "author@example.com",
    "story_input": "A brief summary of my story",
    "story_tags": "adventure, travel, inspiration",
    "story_checkbox": true,
    "category": "personal",
    "featured": false,
    "status": "draft",
    "author_bio": "Writer and adventurer",
    "author_photo": "https://example.com/photo.jpg",
    "author_social": {"twitter": "@author"},
    "hero_image_url": "https://ucarecdn.com/abc123/",
    "video_url": "https://youtube.com/watch?v=xxx",
    "audio_url": "https://soundcloud.com/track",
    "has_gallery": true
  }
}
```

#### Errors

| Status | Message |
|--------|---------|
| 400 | Story name is required |
| 400 | Email is required |
| 400 | Valid email address is required |
| 400 | Video URL must be a valid URL |
| 400 | Audio URL must be a valid URL |

---

### 2. List Stories

**GET** `/stories`

Retrieve a paginated list of stories with filtering and sorting.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `per_page` | integer | 10 | Items per page (max 100) |
| `status` | text | - | Filter by status (draft, pending, published, archived) |
| `category` | text | - | Filter by category |
| `featured` | boolean | - | Filter featured stories only |
| `author_email` | text | - | Filter by author email |
| `search` | text | - | Search in story_name and story_input |
| `tags` | text | - | Filter by tags (contains) |
| `sort_by` | text | created_at | Sort field: created_at, updated_at, story_name, view_count, published_date |
| `sort_order` | text | desc | Sort direction: asc, desc |

#### Example Request

```
GET /stories?page=1&per_page=10&status=published&category=personal&sort_by=view_count&sort_order=desc
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 123,
      "story_name": "My Amazing Story",
      "story_email": "author@example.com",
      "story_input": "A brief summary",
      "story_tags": "adventure, travel",
      "category": "personal",
      "featured": true,
      "status": "published",
      "view_count": 150,
      "author": {
        "email": "author@example.com",
        "bio": "Writer and adventurer",
        "photo": "https://example.com/photo.jpg",
        "social": {"twitter": "@author"}
      },
      "hero_image": "https://ucarecdn.com/abc123/",
      "has_video": true,
      "has_audio": false,
      "has_gallery": true,
      "created_at": "2025-12-30T10:00:00Z",
      "updated_at": "2025-12-30T12:00:00Z",
      "published_date": "2025-12-30T11:00:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total_items": 45,
    "total_pages": 5,
    "has_next_page": true,
    "has_prev_page": false
  },
  "filters": {
    "status": "published",
    "category": "personal",
    "featured": null,
    "search": null,
    "tags": null
  },
  "sort": {
    "sort_by": "view_count",
    "sort_order": "desc"
  }
}
```

---

### 3. Get Single Story

**GET** `/stories/{stories_id}`

Retrieve a single story by ID with full details.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `stories_id` | integer | yes | Story ID |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `increment_views` | boolean | false | Increment view count |

#### Example Request

```
GET /stories/123?increment_views=true
```

#### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 123,
    "story_name": "My Amazing Story",
    "story_email": "author@example.com",
    "story_input": "A brief summary",
    "story_content_html": "<h1>My Story</h1><p>Full content here...</p>",
    "story_tags": "adventure, travel",
    "story_checkbox": true,
    "category": "personal",
    "featured": true,
    "status": "published",
    "view_count": 151,
    "author": {
      "email": "author@example.com",
      "bio": "Writer and adventurer",
      "photo": "https://example.com/photo.jpg",
      "social": {"twitter": "@author"}
    },
    "hero_image": {
      "url": "https://ucarecdn.com/abc123/",
      "uuid": "abc123",
      "file_name": "hero.jpg",
      "file_size": 102400,
      "mime_type": "image/jpeg",
      "metadata": {}
    },
    "media": {
      "video_url": "https://youtube.com/watch?v=xxx",
      "audio_url": null,
      "gallery_images": [
        {"url": "https://ucarecdn.com/img1/", "caption": "Image 1"}
      ]
    },
    "created_at": "2025-12-30T10:00:00Z",
    "updated_at": "2025-12-30T12:00:00Z",
    "published_date": "2025-12-30T11:00:00Z"
  }
}
```

#### Errors

| Status | Message |
|--------|---------|
| 400 | Story ID is required |
| 400 | Story ID must be a positive integer |
| 404 | Story not found |

---

### 4. Update Story

**PUT** `/stories/{stories_id}`

Update an existing story with partial or full data.

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `stories_id` | integer | yes | Story ID |

#### Request Body

Only include fields you want to update:

```json
{
  "story_name": "Updated Story Title",
  "status": "published",
  "featured": true,
  "category": "featured",
  "author_bio": "Updated author bio"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Story updated successfully",
  "story_id": 123,
  "updated_at": "2025-12-30T14:00:00Z",
  "data": {
    "id": 123,
    "story_name": "Updated Story Title",
    "story_email": "author@example.com",
    "story_input": "A brief summary",
    "story_tags": "adventure, travel",
    "category": "featured",
    "featured": true,
    "status": "published",
    "view_count": 151,
    "author": {
      "email": "author@example.com",
      "bio": "Updated author bio",
      "photo": "https://example.com/photo.jpg",
      "social": {"twitter": "@author"}
    },
    "hero_image_url": "https://ucarecdn.com/abc123/",
    "video_url": "https://youtube.com/watch?v=xxx",
    "audio_url": null,
    "has_gallery": true,
    "created_at": "2025-12-30T10:00:00Z",
    "updated_at": "2025-12-30T14:00:00Z",
    "published_date": "2025-12-30T14:00:00Z"
  }
}
```

#### Errors

| Status | Message |
|--------|---------|
| 400 | Story ID is required |
| 400 | Story name cannot be empty |
| 400 | Email cannot be empty |
| 400 | Valid email address is required |
| 400 | Invalid status value |
| 400 | Video URL must be a valid URL |
| 404 | Story not found |

---

### 5. Delete Story

**DELETE** `/stories/{stories_id}`

Delete a story (hard delete) or archive it (soft delete).

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `stories_id` | integer | yes | Story ID |

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `soft_delete` | boolean | false | Archive instead of delete |

#### Example Requests

Hard delete:
```
DELETE /stories/123
```

Soft delete (archive):
```
DELETE /stories/123?soft_delete=true
```

#### Response - Hard Delete (200 OK)

```json
{
  "success": true,
  "message": "Story deleted permanently",
  "story_id": 123,
  "story_name": "My Amazing Story",
  "action": "deleted",
  "deleted_at": "2025-12-30T15:00:00Z"
}
```

#### Response - Soft Delete (200 OK)

```json
{
  "success": true,
  "message": "Story archived successfully",
  "story_id": 123,
  "story_name": "My Amazing Story",
  "action": "archived",
  "archived_at": "2025-12-30T15:00:00Z"
}
```

#### Errors

| Status | Message |
|--------|---------|
| 400 | Story ID is required |
| 400 | Story ID must be a positive integer |
| 404 | Story not found |

---

## XanoScript Files

| Endpoint | File |
|----------|------|
| POST /stories | `xano-story-endpoint.xanoscript` |
| GET /stories | `xano-stories-get-list.xanoscript` |
| GET /stories/:id | `xano-stories-get-single.xanoscript` |
| PUT /stories/:id | `xano-stories-put.xanoscript` |
| DELETE /stories/:id | `xano-stories-delete.xanoscript` |

---

## Status Values

| Status | Description |
|--------|-------------|
| `draft` | Story is being edited, not visible publicly |
| `pending` | Story submitted for review |
| `published` | Story is live and visible |
| `archived` | Story is soft-deleted/hidden |

---

## Testing with cURL

### Create Story

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/stories" \
  -H "Content-Type: application/json" \
  -d '{
    "story_name": "Test Story",
    "story_email": "test@example.com",
    "story_input": "A test story",
    "category": "test",
    "status": "draft"
  }'
```

### List Stories

```bash
curl "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/stories?page=1&per_page=10&status=published"
```

### Get Single Story

```bash
curl "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/stories/123?increment_views=true"
```

### Update Story

```bash
curl -X PUT "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/stories/123" \
  -H "Content-Type: application/json" \
  -d '{
    "story_name": "Updated Title",
    "status": "published"
  }'
```

### Delete Story

```bash
# Hard delete
curl -X DELETE "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/stories/123"

# Soft delete (archive)
curl -X DELETE "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/stories/123?soft_delete=true"
```

---

## Migration Notes

### New Database Fields to Add

If upgrading from v1.0, add these fields to your `stories` table:

```sql
-- Author profile fields
author_bio TEXT
author_photo TEXT
author_social JSONB

-- Metadata fields
category TEXT
featured BOOLEAN DEFAULT false
status TEXT DEFAULT 'draft'
view_count INTEGER DEFAULT 0
published_date TIMESTAMP

-- Media fields
video_url TEXT
audio_url TEXT
gallery_images JSONB

-- Timestamps (if not present)
created_at TIMESTAMP DEFAULT NOW()
updated_at TIMESTAMP DEFAULT NOW()
```

### Breaking Changes from v1.0

1. Response format now includes nested `author` and `media` objects
2. New `status` field replaces implicit draft/published logic
3. `published_date` is automatically set when status changes to "published"
4. View count tracking is now built-in

# Cards Architecture

## Overview

Story cards with visibility controls, invitation-based sharing, and social interactions.

```
┌─────────────────────────────────────────────────────────────┐
│                        CARD                                  │
│  ┌─────────────┬─────────────┬─────────────────────────┐    │
│  │   PUBLIC    │   PRIVATE   │        SHARED           │    │
│  │             │             │  ┌───────────────────┐  │    │
│  │  Anyone     │  Owner      │  │  Invited Users    │  │    │
│  │  can view   │  only       │  │  ├─ can_view      │  │    │
│  │             │             │  │  ├─ can_comment   │  │    │
│  │             │             │  │  └─ can_like      │  │    │
│  └─────────────┴─────────────┴──┴───────────────────┴──┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### 1. Cards Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Auto-increment |
| `user_id` | Integer (FK) | Owner reference |
| `title` | Text | Card title |
| `content` | Text | Rich text (TipTap JSON or HTML) |
| `excerpt` | Text | Preview text (auto-generated) |
| `cover_image` | Text | Cover image URL |
| `visibility` | Enum | `public`, `private`, `shared` |
| `status` | Enum | `draft`, `published`, `archived` |
| `allow_comments` | Boolean | Enable/disable comments |
| `allow_likes` | Boolean | Enable/disable likes |
| `like_count` | Integer | Cached count |
| `comment_count` | Integer | Cached count |
| `view_count` | Integer | View tracking |
| `tags` | JSON Array | Tag IDs |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |
| `published_at` | Timestamp | When first published |

### 2. Card Shares Table (Invitations)

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Auto-increment |
| `card_id` | Integer (FK) | Card reference |
| `shared_by_user_id` | Integer (FK) | Who shared |
| `shared_with_user_id` | Integer (FK) | Recipient (if registered) |
| `shared_with_email` | Text | Recipient email (for invites) |
| `token` | Text | Unique invite token (hashed) |
| `can_view` | Boolean | View permission |
| `can_comment` | Boolean | Comment permission |
| `can_like` | Boolean | Like permission |
| `status` | Enum | `pending`, `accepted`, `declined`, `revoked` |
| `message` | Text | Personal message with invite |
| `created_at` | Timestamp | |
| `accepted_at` | Timestamp | |
| `expires_at` | Timestamp | Optional expiration |

### 3. Card Likes Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Auto-increment |
| `card_id` | Integer (FK) | Card reference |
| `user_id` | Integer (FK) | Who liked |
| `created_at` | Timestamp | |

**Unique constraint:** `(card_id, user_id)`

### 4. Card Comments Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Auto-increment |
| `card_id` | Integer (FK) | Card reference |
| `user_id` | Integer (FK) | Who commented |
| `parent_id` | Integer (FK) | For threaded replies (nullable) |
| `content` | Text | Comment text |
| `status` | Enum | `visible`, `hidden`, `deleted` |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |

### 5. Card Views Table (Analytics)

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Auto-increment |
| `card_id` | Integer (FK) | Card reference |
| `user_id` | Integer (FK) | Viewer (nullable for public) |
| `session_id` | Text | Anonymous session tracking |
| `ip_hash` | Text | Hashed IP for uniqueness |
| `created_at` | Timestamp | |

---

## API Endpoints

### Cards CRUD

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/cards` | Create card | Required |
| `GET` | `/cards` | List my cards | Required |
| `GET` | `/cards/public` | List public cards | Optional |
| `GET` | `/cards/shared-with-me` | Cards shared with user | Required |
| `GET` | `/cards/:id` | Get card (with permission check) | Optional |
| `PUT` | `/cards/:id` | Update card | Required (owner) |
| `DELETE` | `/cards/:id` | Delete card | Required (owner) |

### Sharing

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/cards/:id/share` | Create share invitation | Required (owner) |
| `GET` | `/cards/:id/shares` | List shares for card | Required (owner) |
| `DELETE` | `/cards/:id/shares/:share_id` | Revoke share | Required (owner) |
| `POST` | `/cards/accept-invite` | Accept share invitation | Required |
| `GET` | `/cards/view/:token` | View via share token | Optional |

### Social Interactions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/cards/:id/like` | Like card | Required |
| `DELETE` | `/cards/:id/like` | Unlike card | Required |
| `GET` | `/cards/:id/likes` | Get likes with users | Optional |
| `POST` | `/cards/:id/comments` | Add comment | Required |
| `GET` | `/cards/:id/comments` | Get comments | Optional |
| `PUT` | `/cards/:id/comments/:comment_id` | Edit comment | Required (author) |
| `DELETE` | `/cards/:id/comments/:comment_id` | Delete comment | Required (author/owner) |

---

## Permission Matrix

### Visibility Levels

| Visibility | Who Can View | Who Can Interact |
|------------|--------------|------------------|
| `public` | Anyone | Logged-in users (if enabled) |
| `private` | Owner only | Owner only |
| `shared` | Owner + Invited users | Based on share permissions |

### Share Permissions

| Permission | Allows |
|------------|--------|
| `can_view` | View card content |
| `can_comment` | View + Add comments |
| `can_like` | View + Like/unlike |

### Permission Check Logic

```javascript
function canAccessCard(user, card, shareToken) {
  // Owner always has access
  if (user?.id === card.user_id) return { view: true, comment: true, like: true };

  // Public cards
  if (card.visibility === 'public') {
    return {
      view: true,
      comment: card.allow_comments && !!user,
      like: card.allow_likes && !!user
    };
  }

  // Private cards - owner only
  if (card.visibility === 'private') {
    return { view: false, comment: false, like: false };
  }

  // Shared cards - check share record
  if (card.visibility === 'shared') {
    const share = findShare(card.id, user, shareToken);
    if (share && share.status === 'accepted') {
      return {
        view: share.can_view,
        comment: share.can_comment && card.allow_comments,
        like: share.can_like && card.allow_likes
      };
    }
  }

  return { view: false, comment: false, like: false };
}
```

---

## Share Invitation Flow

### 1. Owner Creates Share

```
POST /cards/:id/share
{
  "email": "friend@example.com",
  "can_view": true,
  "can_comment": true,
  "can_like": true,
  "message": "Check out my story!",
  "expires_in_days": 30
}
```

### 2. System Sends Invite Email

```
Subject: [Name] shared a story with you

[Name] has shared their story "[Card Title]" with you.

Message from [Name]:
"Check out my story!"

[View Story Button] → /cards/view/{token}

This link expires in 30 days.
```

### 3. Recipient Clicks Link

**If logged in:** Auto-accept, redirect to card
**If not logged in:** Show card preview, prompt to login/signup

### 4. Share Acceptance

```
POST /cards/accept-invite
{
  "token": "abc123..."
}
```

---

## Webflow Integration

### Card Display Classes

```css
/* Visibility indicators */
.card---public { }
.card---private { }
.card---shared { }

/* Permission-based display */
.card---can-view { }
.card---can-comment { }
.card---can-like { }

/* Interaction states */
.card---liked { }
.card---owner { }
```

### Card Component Structure

```html
<div class="story-card" data-card-id="123" data-visibility="shared">
  <!-- Cover Image -->
  <div class="card-cover">
    <img src="..." alt="">
    <span class="visibility-badge">Shared</span>
  </div>

  <!-- Content -->
  <div class="card-content">
    <h3 class="card-title">My Story Title</h3>
    <p class="card-excerpt">First few lines of the story...</p>
    <div class="card-meta">
      <span class="card-author">By Jane Doe</span>
      <span class="card-date">Jan 5, 2026</span>
    </div>
  </div>

  <!-- Social Actions -->
  <div class="card-actions">
    <!-- Like Button -->
    <button class="like-btn" data-card-id="123">
      <span class="like-icon">♡</span>
      <span class="like-count">24</span>
    </button>

    <!-- Comment Count -->
    <button class="comment-btn" data-card-id="123">
      <span class="comment-icon">💬</span>
      <span class="comment-count">8</span>
    </button>

    <!-- Share Button (owner only) -->
    <button class="share-btn card---owner" data-card-id="123">
      <span class="share-icon">↗</span>
      Share
    </button>
  </div>
</div>
```

---

## Share Modal Component

```html
<div id="share-modal" class="modal" style="display: none;">
  <div class="modal-content">
    <div class="modal-header">
      <h3>Share Story</h3>
      <button class="modal-close">&times;</button>
    </div>

    <form id="share-form">
      <!-- Recipient -->
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" name="email" required placeholder="friend@example.com">
      </div>

      <!-- Permissions -->
      <div class="form-group">
        <label>Permissions</label>
        <div class="permission-toggles">
          <label class="toggle">
            <input type="checkbox" name="can_view" checked disabled>
            <span>Can View</span>
          </label>
          <label class="toggle">
            <input type="checkbox" name="can_comment" checked>
            <span>Can Comment</span>
          </label>
          <label class="toggle">
            <input type="checkbox" name="can_like" checked>
            <span>Can Like</span>
          </label>
        </div>
      </div>

      <!-- Personal Message -->
      <div class="form-group">
        <label>Personal Message (optional)</label>
        <textarea name="message" rows="3" placeholder="Add a note..."></textarea>
      </div>

      <!-- Expiration -->
      <div class="form-group">
        <label>Link Expires</label>
        <select name="expires_in_days">
          <option value="7">In 7 days</option>
          <option value="30" selected>In 30 days</option>
          <option value="90">In 90 days</option>
          <option value="">Never</option>
        </select>
      </div>

      <button type="submit" class="submit-btn">Send Invitation</button>
    </form>

    <!-- Existing Shares -->
    <div class="existing-shares">
      <h4>Shared With</h4>
      <div id="shares-list">
        <!-- Populated dynamically -->
      </div>
    </div>
  </div>
</div>
```

---

## Comments Component

```html
<div class="comments-section" data-card-id="123">
  <!-- Comment Form -->
  <form class="comment-form card---can-comment">
    <div class="comment-input-wrapper">
      <img src="user-avatar.jpg" class="comment-avatar">
      <textarea name="content" placeholder="Write a comment..." rows="2"></textarea>
    </div>
    <button type="submit" class="comment-submit">Post</button>
  </form>

  <!-- Comments List -->
  <div class="comments-list">
    <div class="comment" data-comment-id="456">
      <img src="commenter-avatar.jpg" class="comment-avatar">
      <div class="comment-body">
        <div class="comment-header">
          <span class="comment-author">John Smith</span>
          <span class="comment-date">2 hours ago</span>
        </div>
        <p class="comment-content">This is such a beautiful story!</p>
        <div class="comment-actions">
          <button class="reply-btn">Reply</button>
          <button class="delete-btn comment---owner">Delete</button>
        </div>
      </div>

      <!-- Nested Replies -->
      <div class="comment-replies">
        <!-- Threaded replies here -->
      </div>
    </div>
  </div>
</div>
```

---

## Tags for Cards

### Card Tags Table

| Field | Type | Description |
|-------|------|-------------|
| `id` | Integer (PK) | Auto-increment |
| `name` | Text | Tag name |
| `slug` | Text | URL-safe |
| `color` | Text | Hex color |
| `category` | Enum | `topic`, `genre`, `mood`, `custom` |
| `usage_count` | Integer | Cached count |
| `created_at` | Timestamp | |

### Suggested Tags

**Topics:**
- Family, School, Sports, Travel, Friendship, Achievement

**Genres:**
- Personal Essay, Memoir, Fiction, Poetry, Reflection

**Moods:**
- Inspiring, Funny, Thoughtful, Emotional, Adventurous

---

## File Structure

```
xano-auth/
├── xanoscript/
│   ├── cards-create.xs
│   ├── cards-get.xs
│   ├── cards-list.xs
│   ├── cards-update.xs
│   ├── cards-delete.xs
│   ├── cards-share.xs
│   ├── cards-accept-invite.xs
│   ├── cards-like.xs
│   ├── cards-unlike.xs
│   ├── cards-comments-create.xs
│   ├── cards-comments-list.xs
│   └── cards-comments-delete.xs
│
├── webflow/
│   ├── card-embed.html
│   ├── share-modal-embed.html
│   ├── comments-embed.html
│   └── cards-list-embed.html
│
└── deploy/
    └── cards-architecture.md (this file)
```

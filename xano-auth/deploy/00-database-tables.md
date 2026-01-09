# Database Tables Setup

Create these tables in Xano **before** creating the endpoints.

---

## Table 1: users

### Create Table
1. Go to **Database** → **Add Table**
2. Name: `users`

### Add Fields

| Field Name | Type | Settings |
|------------|------|----------|
| `id` | Integer | Primary Key, Auto-increment (default) |
| `email` | Text | **Not null**, **Unique** |
| `password` | Text | Not null |
| `role` | Enum | Values: `student`, `instructor`, `family_member`, `admin`, `sponsor` |
| `sub_role` | Text | Nullable |
| `first_name` | Text | Not null |
| `last_name` | Text | Not null |
| `profile_image_url` | Text | Nullable |
| `phone` | Text | Nullable |
| `status` | Enum | Values: `pending`, `active`, `suspended`, `inactive` |
| `email_verified` | Boolean | Default: `false` |
| `invited_by_user_id` | Integer | Nullable, Reference to `users.id` |
| `created_at` | Timestamp | Default: `now` |
| `updated_at` | Timestamp | Default: `now` |
| `last_login_at` | Timestamp | Nullable |

### Add Indexes
1. **Unique index** on `email`
2. **Index** on `status`
3. **Index** on `role`

### Enable Authentication
1. Go to **Settings** → **Authentication**
2. Enable authentication on `users` table
3. Set `email` as login field
4. Set `password` as password field

---

## Table 2: invites

### Create Table
1. Go to **Database** → **Add Table**
2. Name: `invites`

### Add Fields

| Field Name | Type | Settings |
|------------|------|----------|
| `id` | Integer | Primary Key, Auto-increment |
| `token` | Text | **Not null**, **Unique** |
| `email` | Text | Not null |
| `role` | Enum | Values: `student`, `instructor`, `family_member`, `admin`, `sponsor` |
| `sub_role` | Text | Nullable |
| `status` | Enum | Values: `pending`, `accepted`, `expired`, `revoked` |
| `invited_by_user_id` | Integer | Reference to `users.id` |
| `target_user_id` | Integer | Nullable, Reference to `users.id` |
| `expires_at` | Timestamp | Not null |
| `accepted_at` | Timestamp | Nullable |
| `created_at` | Timestamp | Default: `now` |

### Add Indexes
1. **Unique index** on `token`
2. **Index** on `email`
3. **Index** on `status`

---

## Table 3: privacy_settings (Optional)

### Create Table
1. Go to **Database** → **Add Table**
2. Name: `privacy_settings`

### Add Fields

| Field Name | Type | Settings |
|------------|------|----------|
| `id` | Integer | Primary Key |
| `user_id` | Integer | **Not null**, Reference to `users.id` |
| `show_profile_public` | Boolean | Default: `true` |
| `show_major_public` | Boolean | Default: `true` |
| `show_cohort_public` | Boolean | Default: `false` |
| `allow_classmate_view` | Boolean | Default: `true` |
| `allow_instructor_contact` | Boolean | Default: `true` |
| `created_at` | Timestamp | Default: `now` |
| `updated_at` | Timestamp | Default: `now` |

---

## Create Test User (Manual)

After creating tables, add a test user directly in the database:

1. Go to **Database** → **users** → **Add Record**
2. Fill in:
   - `email`: `test@example.com`
   - `password`: (use the hash filter - see below)
   - `role`: `student`
   - `first_name`: `Test`
   - `last_name`: `User`
   - `status`: `active`
   - `email_verified`: `true`
   - `created_at`: (current timestamp)
   - `updated_at`: (current timestamp)

### To Hash Password

Create a temporary endpoint to hash a password:

1. Create endpoint `/util/hash-password` (POST, no auth)
2. Add Input: `password` (text)
3. Add Variable: `hashed` = `$input.password|hash`
4. Add Response: `{"hash": "$hashed"}`
5. Call it with your desired password
6. Copy the hash value
7. Paste into the user record's `password` field
8. **Delete this endpoint after use!**

Or use this cURL after creating the endpoint:

```bash
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/util/hash-password" \
  -H "Content-Type: application/json" \
  -d '{"password": "password123"}'
```

---

## Create Test Invite (Manual)

1. Go to **Database** → **invites** → **Add Record**
2. Fill in:
   - `token`: `test-invite-123` (or any unique string)
   - `email`: `newuser@example.com`
   - `role`: `student`
   - `status`: `pending`
   - `invited_by_user_id`: `1` (test user's ID)
   - `expires_at`: (set to future date, e.g., 30 days from now)
   - `created_at`: (current timestamp)

---

## Table 4: cards

Story cards with visibility controls.

### Create Table
1. Go to **Database** → **Add Table**
2. Name: `cards`

### Add Fields

| Field Name | Type | Settings |
|------------|------|----------|
| `id` | Integer | Primary Key, Auto-increment |
| `user_id` | Integer | **Not null**, Reference to `users.id` |
| `title` | Text | Not null |
| `content` | Text | Not null (TipTap JSON/HTML) |
| `excerpt` | Text | Nullable |
| `cover_image` | Text | Nullable (URL) |
| `visibility` | Enum | Values: `public`, `private`, `shared` |
| `status` | Enum | Values: `draft`, `published`, `archived` |
| `allow_comments` | Boolean | Default: `true` |
| `allow_likes` | Boolean | Default: `true` |
| `like_count` | Integer | Default: `0` |
| `comment_count` | Integer | Default: `0` |
| `view_count` | Integer | Default: `0` |
| `tags` | JSON | Default: `[]` |
| `created_at` | Timestamp | Default: `now` |
| `updated_at` | Timestamp | Default: `now` |
| `published_at` | Timestamp | Nullable |

### Add Indexes
1. **Index** on `user_id`
2. **Index** on `visibility`
3. **Index** on `status`
4. **Composite index** on `(visibility, status, published_at)`

---

## Table 5: card_shares

Invitation-based sharing for cards.

### Create Table
1. Go to **Database** → **Add Table**
2. Name: `card_shares`

### Add Fields

| Field Name | Type | Settings |
|------------|------|----------|
| `id` | Integer | Primary Key, Auto-increment |
| `card_id` | Integer | **Not null**, Reference to `cards.id` |
| `shared_by_user_id` | Integer | **Not null**, Reference to `users.id` |
| `shared_with_user_id` | Integer | Nullable, Reference to `users.id` |
| `shared_with_email` | Text | Not null |
| `token` | Text | **Not null**, **Unique** (hashed) |
| `can_view` | Boolean | Default: `true` |
| `can_comment` | Boolean | Default: `true` |
| `can_like` | Boolean | Default: `true` |
| `status` | Enum | Values: `pending`, `accepted`, `declined`, `revoked` |
| `message` | Text | Nullable |
| `created_at` | Timestamp | Default: `now` |
| `accepted_at` | Timestamp | Nullable |
| `expires_at` | Timestamp | Nullable |

### Add Indexes
1. **Unique index** on `token`
2. **Index** on `card_id`
3. **Index** on `shared_with_user_id`
4. **Index** on `shared_with_email`
5. **Composite index** on `(card_id, status)`

---

## Table 6: card_likes

Track likes on cards (one per user per card).

### Create Table
1. Go to **Database** → **Add Table**
2. Name: `card_likes`

### Add Fields

| Field Name | Type | Settings |
|------------|------|----------|
| `id` | Integer | Primary Key, Auto-increment |
| `card_id` | Integer | **Not null**, Reference to `cards.id` |
| `user_id` | Integer | **Not null**, Reference to `users.id` |
| `created_at` | Timestamp | Default: `now` |

### Add Indexes
1. **Unique composite index** on `(card_id, user_id)` - prevents duplicate likes
2. **Index** on `card_id`
3. **Index** on `user_id`

---

## Table 7: card_comments

Comments on cards with threading support.

### Create Table
1. Go to **Database** → **Add Table**
2. Name: `card_comments`

### Add Fields

| Field Name | Type | Settings |
|------------|------|----------|
| `id` | Integer | Primary Key, Auto-increment |
| `card_id` | Integer | **Not null**, Reference to `cards.id` |
| `user_id` | Integer | **Not null**, Reference to `users.id` |
| `parent_id` | Integer | Nullable, Reference to `card_comments.id` |
| `content` | Text | Not null (max 2000 chars) |
| `status` | Enum | Values: `visible`, `hidden`, `deleted` |
| `created_at` | Timestamp | Default: `now` |
| `updated_at` | Timestamp | Default: `now` |

### Add Indexes
1. **Index** on `card_id`
2. **Index** on `user_id`
3. **Index** on `parent_id`
4. **Composite index** on `(card_id, status, created_at)`

---

## Table 8: card_tags

Reusable tags for organizing cards.

### Create Table
1. Go to **Database** → **Add Table**
2. Name: `card_tags`

### Add Fields

| Field Name | Type | Settings |
|------------|------|----------|
| `id` | Integer | Primary Key, Auto-increment |
| `name` | Text | **Not null**, **Unique** |
| `slug` | Text | **Not null**, **Unique** |
| `color` | Text | Nullable (hex color) |
| `category` | Enum | Values: `topic`, `genre`, `mood`, `custom` |
| `usage_count` | Integer | Default: `0` |
| `created_at` | Timestamp | Default: `now` |

### Add Indexes
1. **Unique index** on `name`
2. **Unique index** on `slug`
3. **Index** on `category`

### Pre-populate Tags

Add these default tags:

**Topics:**
- Family, School, Sports, Travel, Friendship, Achievement

**Genres:**
- Personal Essay, Memoir, Fiction, Poetry, Reflection

**Moods:**
- Inspiring, Funny, Thoughtful, Emotional, Adventurous

---

## Table Relationships Summary

```
users
  ├── 1:N → cards (user_id)
  ├── 1:N → card_shares (shared_by_user_id)
  ├── 1:N → card_shares (shared_with_user_id)
  ├── 1:N → card_likes (user_id)
  ├── 1:N → card_comments (user_id)
  └── 1:N → invites (invited_by_user_id)

cards
  ├── N:1 → users (user_id)
  ├── 1:N → card_shares (card_id)
  ├── 1:N → card_likes (card_id)
  ├── 1:N → card_comments (card_id)
  └── M:N → card_tags (via tags JSON array)

card_comments
  └── 1:N → card_comments (parent_id) - self-referencing for threads
```

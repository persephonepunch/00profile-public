# Tags & Access Control Database Tables

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **Database** → **Add Table**
3. Create each table below

---

## Update Existing: `users` table

Add these fields:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `webflow_item_id` | text | No | null | Webflow CMS item ID |
| `slug` | text | Yes | - | URL slug (auto-generate from name) |
| `visibility` | enum | Yes | `private` | Values: `public`, `private`, `invite_only` |
| `bio` | text | No | null | Profile description |

**Index:** `slug` (unique)

---

## Table: `tags`

Categorizes users by relationship, role, group, or cohort.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | int (auto) | Yes | - | Primary key |
| `name` | text | Yes | - | Tag name (e.g., "Family", "Cohort 2024") |
| `slug` | text | Yes | - | URL-safe version |
| `type` | enum | Yes | - | `relationship`, `role`, `group`, `cohort` |
| `description` | text | No | null | What this tag means |
| `color` | text | No | `#8B0000` | Display color (hex) |
| `is_system` | bool | No | false | System tags can't be deleted |
| `created_at` | timestamp | Yes | now | Created |

**Indexes:**
- `slug` (unique)
- `type`

**Seed Data:**
```json
[
  {"name": "Family", "slug": "family", "type": "relationship", "color": "#8B0000", "is_system": true},
  {"name": "Friend", "slug": "friend", "type": "relationship", "color": "#4A90D9", "is_system": true},
  {"name": "Instructor", "slug": "instructor", "type": "role", "color": "#2E7D32", "is_system": true},
  {"name": "Student", "slug": "student", "type": "role", "color": "#F57C00", "is_system": true},
  {"name": "Sponsor", "slug": "sponsor", "type": "role", "color": "#7B1FA2", "is_system": true},
  {"name": "Cohort 2024", "slug": "cohort-2024", "type": "cohort", "color": "#455A64", "is_system": false},
  {"name": "Cohort 2025", "slug": "cohort-2025", "type": "cohort", "color": "#455A64", "is_system": false}
]
```

---

## Table: `user_tags` (Pivot)

Links users to tags.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | int (auto) | Yes | - | Primary key |
| `user_id` | int | Yes | - | FK to `users` |
| `tag_id` | int | Yes | - | FK to `tags` |
| `assigned_by` | int | No | null | FK to `users` (who assigned) |
| `created_at` | timestamp | Yes | now | When assigned |

**Indexes:**
- `user_id`
- `tag_id`
- `user_id + tag_id` (unique composite - prevent duplicates)

---

## Table: `user_access`

Controls who can view private profiles.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | int (auto) | Yes | - | Primary key |
| `owner_user_id` | int | Yes | - | FK to `users` (profile owner) |
| `viewer_user_id` | int | Yes | - | FK to `users` (who has access) |
| `access_level` | enum | Yes | `view` | `view`, `edit`, `admin` |
| `granted_by` | int | No | null | FK to `users` |
| `granted_at` | timestamp | Yes | now | When granted |
| `expires_at` | timestamp | No | null | Optional expiration |

**Indexes:**
- `owner_user_id`
- `viewer_user_id`
- `owner_user_id + viewer_user_id` (unique composite)

---

## Table: `access_invites`

Invitations to view private profiles.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | int (auto) | Yes | - | Primary key |
| `owner_user_id` | int | Yes | - | FK to `users` (profile owner) |
| `email` | text | Yes | - | Invited email |
| `token` | text | Yes | - | Unique invite token (UUID) |
| `message` | text | No | null | Optional message |
| `status` | enum | Yes | `pending` | `pending`, `accepted`, `declined`, `expired` |
| `created_at` | timestamp | Yes | now | When sent |
| `expires_at` | timestamp | Yes | - | Default: 7 days |
| `accepted_at` | timestamp | No | null | When accepted |

**Indexes:**
- `token` (unique)
- `email`
- `owner_user_id`

---

## Relationships Diagram

```
users
  │
  ├──< user_tags >── tags
  │
  ├──< user_access (as owner)
  │       │
  │       └──> users (as viewer)
  │
  └──< access_invites (as owner)


Legend:
  ──<  = one-to-many
  >──  = many-to-one
```

---

## Access Control Logic

### Visibility Levels

| Visibility | Who Can View |
|------------|--------------|
| `public` | Everyone (no login required) |
| `private` | Owner + users in `user_access` table |
| `invite_only` | Owner + users who accepted invite |

### Tag-Based Access (Optional Enhancement)

You can also grant access by tag:

| If viewer has tag... | They can see profiles with tag... |
|---------------------|-----------------------------------|
| `instructor` | All `student` profiles |
| `family` + same student link | That student's profile |
| `sponsor` | Public profiles only |

---

## Webflow CMS Collections to Create

### Collection: Tags

| Field | Type |
|-------|------|
| Name | Plain Text |
| Slug | Slug |
| Type | Option (relationship, role, group, cohort) |
| Color | Color |
| Xano Tag ID | Number |

### Update Collection: Users

| Field | Type |
|-------|------|
| Tags | Multi-reference → Tags |
| Visibility | Option (public, private, invite_only) |
| Xano User ID | Number |

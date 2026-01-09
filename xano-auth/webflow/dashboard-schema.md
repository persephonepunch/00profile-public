# Webflow Dashboard Schema - Consolidated with Tags

## Architecture Overview

Instead of 4+ separate dashboard pages, use **ONE unified dashboard** that shows/hides content based on user role tags.

```
/dashboard (single page)
    ├── role---student sections
    ├── role---instructor sections
    ├── role---family sections
    ├── role---admin sections
    └── role---sponsor sections
```

---

## Webflow CMS Setup

### Option 1: Users Collection (Recommended)

Create a **Users** CMS Collection to mirror Xano users for Webflow-native features.

#### Users Collection Fields

| Field Name | Field Type | Purpose |
|------------|------------|---------|
| `name` | Plain Text | Display name |
| `email` | Email | User email (slug reference) |
| `role` | Option | student, instructor, family_member, admin, sponsor |
| `role-tags` | Multi-reference → Tags | Multiple role tags for filtering |
| `avatar` | Image | Profile photo |
| `bio` | Rich Text | User bio |
| `status` | Option | active, inactive, pending |
| `xano-id` | Plain Text | Reference to Xano user ID |

#### Tags Collection (for role-tags)

| Field Name | Field Type | Purpose |
|------------|------------|---------|
| `name` | Plain Text | Tag name (Student, Instructor, etc.) |
| `slug` | Slug | URL-safe identifier |
| `color` | Color | Badge color for UI |
| `icon` | Plain Text | Emoji or icon class |

**Pre-populate Tags:**
- Student
- Instructor
- Family Member
- Admin
- Sponsor
- Father (sub-role)
- Mother (sub-role)
- Supporter (sub-role)

---

## Webflow Page Structure

### Single Dashboard Page: `/dashboard`

```
Page: /dashboard
├── Body class: "auth---required"
│
├── [Embed] dashboard-embed.html (at top)
│
├── Header Section
│   └── class: "role---any"
│   └── Contains: User greeting, role badge, logout button
│
├── Student Section
│   └── class: "role---student"
│   └── Contains: Student-specific cards/content
│
├── Instructor Section
│   └── class: "role---instructor"
│   └── Contains: Instructor-specific cards/content
│
├── Family Section
│   └── class: "role---family"
│   └── Contains: Family-specific cards/content
│
├── Admin Section
│   └── class: "role---admin"
│   └── Contains: Admin-specific cards/content
│
└── Sponsor Section
    └── class: "role---sponsor"
    └── Contains: Sponsor-specific cards/content
```

---

## CSS Classes Reference

### Authentication Classes

| Class | Behavior |
|-------|----------|
| `auth---required` | Page requires login, redirects to /login if not authenticated |
| `auth---visible` | Element visible only when logged in |
| `auth---invisible` | Element visible only when logged out |

### Role Classes

| Class | Visible To |
|-------|------------|
| `role---any` | Any logged-in user |
| `role---student` | Students only |
| `role---instructor` | Instructors only |
| `role---family` | Family members only |
| `role---admin` | Admins only |
| `role---sponsor` | Sponsors only |

### Tag-Based Classes (for multi-role support)

| Class | Visible To |
|-------|------------|
| `tag---father` | Users with "father" sub-role |
| `tag---mother` | Users with "mother" sub-role |
| `tag---supporter` | Users with "supporter" sub-role |

---

## Implementation Steps

### Step 1: Create Collections in Webflow

1. **Tags Collection**
   - Add fields: name, slug, color, icon
   - Add items: Student, Instructor, Family Member, Admin, Sponsor

2. **Users Collection** (optional, for CMS features)
   - Add fields as listed above
   - Reference Tags collection for role-tags

### Step 2: Create Dashboard Page

1. Create page `/dashboard`
2. Add class `auth---required` to body or main wrapper
3. Add the embed code from `dashboard-embed.html`
4. Create sections with appropriate role classes

### Step 3: Build Role Sections

For each role, create a section with the role class:

```html
<section class="role---student">
  <!-- Student dashboard content -->
  <h2>My Stories</h2>
  <div class="dashboard-grid">
    <!-- Cards, links, etc. -->
  </div>
</section>
```

### Step 4: Optional Legacy Redirects

If you want `/student/dashboard` URLs to work:

**Option A: Webflow 301 Redirects**
```
/student/dashboard → /dashboard
/instructor/dashboard → /dashboard
/family/dashboard → /dashboard
/admin/dashboard → /dashboard
```

**Option B: JavaScript Redirect** (included in embed)
The embed already handles legacy URL redirects.

---

## Dynamic Content with CMS

### Using Collection Lists

You can use Webflow Collection Lists within role sections:

```html
<section class="role---instructor">
  <h2>My Classes</h2>

  <!-- Webflow Collection List -->
  <div class="w-dyn-list">
    <div class="w-dyn-items">
      <div class="w-dyn-item">
        <!-- CMS bound fields -->
      </div>
    </div>
  </div>
</section>
```

### Filtering by Current User

For user-specific content, you'll need to:
1. Fetch data from Xano API (not Webflow CMS)
2. Or use Webflow Memberships (paid feature)

---

## Complete File Structure

```
xano-auth/webflow/
├── login-embed.html           # Login form
├── signup-embed.html          # Invite-based signup
├── forgot-password-embed.html # Password reset request
├── reset-password-embed.html  # Password reset form
├── dashboard-embed.html       # Unified dashboard
├── dashboard-schema.md        # This file
└── README.md                  # Setup instructions
```

---

## Role Badge Colors

For consistent UI, use these colors for role badges:

| Role | Color | Hex |
|------|-------|-----|
| Student | Blue | `#3B82F6` |
| Instructor | Purple | `#8B5CF6` |
| Family Member | Green | `#10B981` |
| Admin | Red (USC Cardinal) | `#8B0000` |
| Sponsor | Gold | `#F59E0B` |

---

## Security Notes

1. **Role classes are CSS-only** - they hide content visually but don't secure it
2. **Always validate on backend** - Xano endpoints should verify user permissions
3. **Don't expose sensitive data** - Role-specific APIs should return only permitted data
4. **Token expiration** - Handle expired tokens gracefully with redirect to login

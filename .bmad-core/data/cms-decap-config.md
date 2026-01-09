# Decap CMS (formerly Netlify CMS) Configuration Reference

## Overview
Decap CMS provides a user-friendly content management interface for Eleventy static sites with Git-based workflow.

## Configuration File
- **Path**: `usc-11ty/admin/config.yml`

## Backend Configuration

```yaml
backend:
  name: git-gateway
  accept_roles:
    - admin
    - editor
  branch: main
```

### Authentication
- Uses **Git Gateway** authentication
- Supported roles: admin, editor
- See `Auth-Decap.md` for dual authentication setup (Netlify Identity + Auth0)

## Media Management

```yaml
media_folder: theme/assets/images
public_folder: /assets/images
```

## CMS Features
- **Local Backend**: `local_backend: true` - enables local development
- **Editorial Workflow**: `publish_mode: editorial_workflow` - draft/review/publish workflow

## Content Collections

### Core Collections

1. **Pages** (`cms/pages/`)
   - Static site pages (index, about-us, login, register, stories, etc.)
   - Cannot create/delete via CMS
   - SEO fields included

2. **Students** (`cms/students/`)
   - Student profiles with classes, schedules, links
   - Primary image and image library
   - Media files and tags
   - Relations to classes and tags

3. **Instructors** (`cms/instructors/`)
   - Instructor profiles with office hours
   - Classes taught
   - Image galleries
   - Contact links

4. **Classes** (`cms/classes/`)
   - Class information
   - Relations to students and instructors

5. **Tags** (`cms/tags/`)
   - Taxonomy system for content

6. **Categories** (`cms/category/`)
   - Content categorization

7. **Finance** (`cms/finance/`)
   - Financial data and topics

8. **Media** (`cms/media/`)
   - Media items with title, description, images

9. **Dashboard** (`cms/dashboard/`)
   - User dashboard content with hero images

10. **Parent-Student Relationships** (`cms/parent-student-relationship/`)
    - Parent-student linking
    - Permissions (view/edit records)
    - Verification status

11. **Team Members** (`cms/team-members/`)
    - Team member profiles
    - Roles: parent, class, instructor
    - Active status

12. **User Entitlements** (`cms/user-entitlements/`)
    - User permissions and access control
    - Expiration dates
    - Active status

13. **Personas** (`cms/personas/`)
    - User persona types: family member, teacher, institution, business sponsor
    - Institution linkage

14. **Work** (`cms/work/`)
    - Portfolio/work showcase items
    - Required images

### Theme Settings (File Collections)

Managed as JSON files in `cms/_data/`:

1. **General** (`cms/_data/settings/site.json`)
   - Domain configuration
   - Favicon and apple touch icon
   - Header/footer additional content
   - Image optimization settings (formats, dimensions)

2. **Colors** (`cms/_data/colors.json`)
   - Theme color palette

3. **Texts** (`cms/_data/texts.json`)
   - Localized/editable UI text strings
   - 100+ editable text items

4. **Links** (`cms/_data/links.json`)
   - Managed link URLs throughout the site

5. **Images** (`cms/_data/images.json`)
   - Reusable image assets with alt text

## Widget Types Used

- **string** - Single line text
- **text** - Multi-line text
- **markdown** - Rich text with markdown
- **datetime** - Date/time picker
- **number** - Numeric input
- **boolean** - Checkbox
- **select** - Dropdown selection
- **image** - Image upload with alt text
- **object** - Nested field groups
- **list** - Repeatable items
- **relation** - References to other collections
- **hidden** - Hidden fields with defaults

## Common Field Patterns

### SEO Fields
Standard SEO object included in all major collections:
- Title, Description
- No-index flag
- Open Graph (title, image)
- Twitter Card (title, card type, site, creator, image)
- Additional HTML tags

### Timestamps
- `created-on`
- `updated-on`
- `published-on`

### Search Control
- `f__noSearch` - Exclude from search indexing

## Accessing CMS

### Local Development
1. Ensure local backend is enabled in config
2. Navigate to `/admin` on your local site
3. Authenticate with configured identity provider

### Production
1. Navigate to `https://yoursite.com/admin`
2. Authenticate via Netlify Identity or Auth0
3. Content changes commit to Git repository

## Content Workflow

1. **Draft** - Create/edit content
2. **Review** - Submit for review (if editorial workflow enabled)
3. **Publish** - Merge to main branch, triggers rebuild

## Integration with Eleventy

All CMS content is stored as markdown files with YAML frontmatter:
- Eleventy reads these files during build
- Collections are automatically created
- Templates render the content

## Related Files
- See `eleventy-config.md` for 11ty integration details
- See `Auth-Decap.md` (if exists) for authentication configuration
- See `docs/brief.md` for project-specific CMS requirements

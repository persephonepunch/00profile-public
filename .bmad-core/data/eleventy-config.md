# Eleventy (11ty) Configuration Reference

## Overview
This project uses Eleventy (11ty) v3.1.2 as a static site generator, integrated with Decap CMS for content management.

## Project Location
- **Primary 11ty Project**: `usc-11ty/`

## Configuration File
- **Path**: `usc-11ty/.eleventy.js`

## Key Configuration Details

### Directory Structure
```javascript
{
  dir: {
    input: "cms",              // Content source directory
    includes: "../theme",      // Templates directory
    output: "public"           // Build output directory
  }
}
```

### Markdown Processing
- Uses `markdown-it` with HTML enabled
- Custom filter: `markdown` - renders markdown content to HTML

### Passthrough Copies
- `theme/assets` → `assets` (theme assets)
- `admin` → `admin` (CMS admin interface)

### Collections and Filters
- Loaded from: `usc-11ty/_utils/index.js`

## Content Collections Structure

Located in `usc-11ty/cms/` directory:
- **students/** - Student profiles and information
- **instructors/** - Instructor profiles and classes
- **classes/** - Class information and schedules
- **tags/** - Taxonomy tags
- **category/** - Content categories
- **finance/** - Financial data and topics
- **media/** - Media items and galleries
- **dashboard/** - Dashboard content
- **parent-student-relationship/** - Parent-student relationship data
- **team-members/** - Team member profiles
- **user-entitlements/** - User permissions and entitlements
- **personas/** - User persona definitions
- **work/** - Portfolio/work items
- **pages/** - Static pages (about-us, login, register, stories, etc.)

## Data Files

Located in `usc-11ty/cms/_data/`:
- **settings/site.json** - Global site settings, domain, favicon, SEO
- **colors.json** - Color theme definitions
- **texts.json** - Localized/editable text strings
- **links.json** - Managed link URLs
- **images.json** - Managed image assets

## Common Commands

```bash
# Development server with live reload
npm run dev
# or
npm run serve

# Production build to public/ directory
npm run build

# Clean build artifacts
npm clean
```

## Integration with Decap CMS
- CMS admin interface: `/admin`
- Content managed through `admin/config.yml`
- Uses Git Gateway for authentication
- All content stored as markdown files in `cms/` directory

## Important Notes

### Reserved Property Names
- **CRITICAL**: Do NOT name data files `collections.js` - it's reserved by Eleventy
- Use alternative names like `shopifyCollections.js` or similar

### Dual-Rendering Architecture
Many Eleventy projects in this workspace use:
1. Static HTML generated at build time
2. Dynamic data fetched at runtime via Web Components (e.g., Shopify integration)

## Related Files
- See `cms-decap-config.md` for CMS-specific configuration
- See `CLAUDE.md` for overall workspace 11ty project patterns

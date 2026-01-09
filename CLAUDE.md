# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

USC Profiles Story is an Eleventy (11ty) static site with Netlify CMS for content management. It's a University of South Carolina profiles and stories platform with Auth0 authentication and Xano backend integration.

## Commands

```bash
npm run serve          # Start Eleventy dev server with live reload (port 8080)
npm run build          # Production build to public/
npm run local-backend  # Start Netlify CMS proxy for local CMS editing
npm run optimize       # Optimize assets (runs automatically before serve/build)
```

## Architecture

### Directory Structure
```
cms/                   # Content source (Eleventy input)
  ├── _data/           # Global data files (JSON)
  │   ├── settings/    # Site configuration (site.json)
  │   ├── colors.json  # Theme colors
  │   ├── texts.json   # Localized text strings
  │   └── links.json   # URL mappings
  ├── pages/           # Static pages (index, login, profiles, stories)
  ├── items/           # Profile content (student profiles)
  ├── stories/         # Story content
  └── [collections]/   # Other CMS collections (menus, promotions, etc.)

theme/                 # Liquid/HTML templates
  ├── [collection].html  # Dynamic collection templates
  ├── partials/          # Reusable template partials
  └── assets/            # Static assets (copied to public/)

_utils/                # Eleventy configuration modules
  ├── index.js         # Main config (registers all modules)
  ├── shortcodes.js    # Custom shortcodes (image, seo, embedVideo, money)
  ├── collections/     # Collection definitions
  ├── filters.js       # Liquid filters
  └── transforms/      # HTML transforms

public/                # Build output (generated)
admin/                 # Netlify CMS admin interface
```

### Build Flow
1. Content in `cms/` is processed through templates in `theme/`
2. Images are optimized via `@11ty/eleventy-img` (webp format, multiple sizes)
3. Output goes to `public/` directory
4. After build, functions are zipped for Netlify

### Key Integrations
- **Auth0**: User authentication (configured via environment variables)
- **Xano**: Backend API for dynamic data
- **Netlify CMS**: Content editing with git-gateway backend
- **Uploadcare**: Media uploads

### Template Conventions
- Collection templates use bracket naming: `[items].html`, `[stories].html`
- Templates use Liquid templating with Nunjucks filters
- CMS content uses frontmatter fields prefixed with `f_` (e.g., `f_photo`, `f_quote`)

### Custom Shortcodes
- `{% image src, alt, dataSizes, attributes %}` - Responsive images with optimization
- `{% seo seoObject %}` - SEO meta tags
- `{% embedVideo videoObject %}` - YouTube/Vimeo embeds
- `{% money priceObject %}` - Multi-currency price formatting

## Environment Variables

Required in `.env`:
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET` - Auth0 config
- `XANO_API_BASE_URL`, `XANO_API_KEY` - Xano backend
- `UPLOADCARE_PUBLIC_KEY` - Media uploads

## CMS Configuration

CMS is configured in `admin/config.yml`:
- Backend: git-gateway (Netlify Identity in production)
- Local development: `local_backend: true` with `npm run local-backend`
- Collections map to `cms/` subdirectories

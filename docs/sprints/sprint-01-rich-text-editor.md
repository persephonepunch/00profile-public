# Sprint 01: Rich Text Editor & Story Submission

**Sprint Goal:** Implement Tiptap rich text editor with Uploadcare media integration for story submissions

**Status:** ✅ Complete
**Duration:** December 10-16, 2025
**Epic:** Epic 1 - Foundation & Public Publishing

---

## Sprint Overview

This sprint delivers the core story creation experience with a modern rich text editor (Tiptap) and media upload capabilities (Uploadcare), enabling students to create compelling long-form stories with embedded images.

### Key Deliverables

1. **Tiptap Rich Text Editor Integration**
   - Full-featured WYSIWYG editor for story content
   - Heading levels (H1, H2, H3)
   - Text formatting (bold, italic, strike, code)
   - Lists (bullet, numbered)
   - Block quotes and code blocks
   - Image insertion (URL and upload)

2. **Uploadcare Media Integration**
   - Hero image uploads for stories
   - In-editor image uploads via Tiptap toolbar
   - CDN delivery via Uploadcare
   - File metadata capture (UUID, URL, filename, size, mime type)

3. **Environment Variable Security**
   - Uploadcare public key via environment variables
   - Secure deployment configuration for Netlify
   - No hardcoded API keys in codebase

4. **Xano Backend Integration**
   - Story submission to Xano API endpoint
   - Rich HTML content storage
   - Uploadcare metadata persistence

---

## User Stories

### Story 1.1: Rich Text Story Editor
**Status:** ✅ Complete

**As a** student author,
**I want** a rich text editor for writing stories,
**so that** I can create formatted, professional-looking content.

#### Acceptance Criteria
1. ✅ Editor supports heading levels (H1, H2, H3)
2. ✅ Editor supports text formatting (bold, italic, strikethrough)
3. ✅ Editor supports lists (bulleted and numbered)
4. ✅ Editor supports blockquotes
5. ✅ Editor supports code blocks and inline code
6. ✅ Editor provides visual toolbar with formatting buttons
7. ✅ Active formatting state is visually indicated in toolbar
8. ✅ Editor content is captured as HTML for submission

#### Implementation Notes
- Uses Tiptap v2.1.13 with StarterKit extension
- ES modules loaded via esm.sh CDN
- Custom CSS styling for editor and toolbar
- ProseMirror-based rendering

---

### Story 1.2: Image Upload in Editor
**Status:** ✅ Complete

**As a** student author,
**I want** to add images to my story,
**so that** I can include visual content that enhances my storytelling.

#### Acceptance Criteria
1. ✅ "Add Image" button in editor toolbar
2. ✅ Option to upload image from desktop
3. ✅ Option to insert image via URL
4. ✅ Uploaded images delivered via Uploadcare CDN
5. ✅ Images display inline in editor
6. ✅ Images included in final HTML output

#### Implementation Notes
- Tiptap Image extension configured
- Uploadcare REST API for direct uploads
- CDN URL format: `https://ucarecdn.com/{uuid}/`
- File input for desktop uploads with image/* accept filter

---

### Story 1.3: Hero Image Upload
**Status:** ✅ Complete

**As a** student author,
**I want** to upload a hero image for my story,
**so that** my story has an eye-catching featured image.

#### Acceptance Criteria
1. ✅ Uploadcare file uploader widget integrated
2. ✅ Support for multiple file sources (local, URL, camera, Dropbox, Google Drive)
3. ✅ Cloud image editor for cropping/tuning
4. ✅ File metadata captured (UUID, URL, filename, size, mime type)
5. ✅ Metadata submitted with story form

#### Implementation Notes
- Uses Uploadcare File Uploader v1 web component
- uc-config element with pubkey from environment variable
- uc-form-input captures upload data as JSON
- Multiple event listeners for robust data capture

---

### Story 1.4: Secure Environment Configuration
**Status:** ✅ Complete

**As a** platform administrator,
**I want** API keys stored securely as environment variables,
**so that** sensitive credentials are not exposed in the codebase.

#### Acceptance Criteria
1. ✅ Uploadcare public key stored in Netlify env vars
2. ✅ Eleventy data file (`env.js`) exposes public vars to templates
3. ✅ Client-side JavaScript accesses keys via `window.ENV_CONFIG`
4. ✅ No hardcoded API keys in committed code
5. ✅ `.env` and `.npmrc` gitignored

#### Implementation Notes
- `cms/_data/env.js` - Eleventy global data file
- Template syntax: `{{ env.UPLOADCARE_PUBLIC_KEY }}`
- Window injection: `window.ENV_CONFIG.UPLOADCARE_PUBLIC_KEY`
- Netlify environment variables configured via dashboard

---

## Technical Implementation

### Files Created/Modified

| File | Change Type | Description |
|------|-------------|-------------|
| `cms/_data/env.js` | Created | Eleventy data file for environment variables |
| `theme/stories.html` | Modified | Added Tiptap editor, ENV_CONFIG injection, Uploadcare integration |
| `theme/comments.html` | Modified | Updated Uploadcare pubkey to use env variable |
| `.gitignore` | Modified | Added `.npmrc` to protect Tiptap Pro token |
| `.npmrc` | Created | Tiptap Pro registry configuration |

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@tiptap/core` | 2.1.13 | Rich text editor core |
| `@tiptap/starter-kit` | 2.1.13 | Basic editor extensions |
| `@tiptap/extension-image` | 2.1.13 | Image insertion support |
| `@uploadcare/file-uploader` | 1.x | File upload web component |

### Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `UPLOADCARE_PUBLIC_KEY` | Public | Uploadcare project public key |
| `UPLOADCARE_SECRET_KEY` | Server-only | Uploadcare secret (not exposed to client) |
| `XANO_API_BASE_URL` | Public | Xano API endpoint URL |
| `TIPTAP_PRO_TOKEN` | Build-only | Tiptap Pro npm registry token |

---

## Testing Checklist

- [x] Tiptap editor renders in story form
- [x] All toolbar buttons functional
- [x] Text formatting applies correctly
- [x] Images upload successfully
- [x] Hero image captures metadata
- [x] Form submits to Xano endpoint
- [x] Environment variables inject correctly
- [x] No hardcoded keys in deployed code
- [x] Netlify build succeeds with env vars

---

## Sprint Retrospective

### What Went Well
- Tiptap integration smooth with ES modules via CDN
- Uploadcare web component well-documented
- Environment variable pattern works across static and client-side

### Challenges
- Multiple Uploadcare event patterns required for robust data capture
- Different Uploadcare keys were hardcoded in different files
- Client-side JS required window injection pattern for env vars

### Improvements for Next Sprint
- Consider Tiptap Pro extensions for advanced features
- Add image resizing/alignment controls
- Implement auto-save draft functionality

---

## Related Documentation

- [Tiptap Documentation](https://tiptap.dev/docs)
- [Uploadcare File Uploader](https://uploadcare.com/docs/file-uploader/)
- [Xano API Documentation](https://docs.xano.com/)
- [PRD - FR5-FR9](../prd.md#functional-requirements) - Story Publishing Requirements

---

**Sprint Completed:** December 16, 2025
**Next Sprint:** Sprint 02 - Comments System & Moderation

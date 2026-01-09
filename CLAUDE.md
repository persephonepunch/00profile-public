# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

USC Story Generator Platform - A JAMstack storytelling platform for USC students with community-driven endowments. Uses Eleventy (11ty) for static site generation, Xano for backend APIs, TipTap for rich text editing, and Webflow for CMS integration.

**Live Site:** https://usc-story.netlify.app/

## Tech Stack

- **Static Site Generator:** Eleventy 2.0.1
- **Backend:** Xano (hosted at `xerb-qpd6-hd8t.n7.xano.io`)
- **Rich Text Editor:** TipTap (ProseMirror-based)
- **File Uploads:** Uploadcare
- **Hosting:** Netlify
- **Authentication:** Auth0 + custom JWT via Xano
- **Design System:** Webflow-exported CSS (no Tailwind)

## Commands

```bash
# Development
npm run serve        # Start dev server with live reload at localhost:8080
npm run build        # Production build to public/
npm run optimize     # Optimize assets (runs automatically before serve/build)

# CMS
npm run local-backend  # Run Netlify CMS proxy server for local content editing
```

## Project Architecture

### Directory Structure

```
cms/                    # Content source (Eleventy input)
  ├── _data/           # Global data files
  ├── pages/           # Static pages
  └── [collections]/   # Content collections (students, classes, etc.)

theme/                  # Templates & layouts
  ├── *.html           # Page templates (e.g., [students].html for students collection)
  ├── partials/        # Reusable template partials
  ├── embeds/          # Embeddable HTML components
  └── assets/          # Static assets (copied to public/assets)

_utils/                 # Eleventy utilities
  ├── index.js         # Main entry - registers filters, collections, transforms
  ├── collections/     # Custom collection definitions
  ├── filters.js       # Template filters
  └── transforms/      # HTML transforms

public/                 # Build output (Eleventy output directory)
admin/                  # Decap CMS admin interface
```

### Xano Backend Organization

```
xano-auth/              # Authentication system
  ├── endpoints/       # .xanoscript endpoint definitions
  ├── xanoscript/      # .xs function implementations (auth-login, auth-signup, etc.)
  ├── schema/          # .xanoscript table schemas
  ├── webflow/         # Webflow embed code for auth forms
  └── deploy/          # Deployment guides per endpoint

xano-webhooks/          # Webhook handlers for Webflow sync
xano-triggers/          # Database triggers

*.xanoscript            # Root-level story API endpoints:
  - xano-stories-get-list.xanoscript   # GET /stories (paginated list)
  - xano-stories-get-single.xanoscript # GET /stories/:id
  - xano-stories-put.xanoscript        # PUT /stories/:id
  - xano-stories-delete.xanoscript     # DELETE /stories/:id
  - xano-stories-submit.xanoscript     # POST /stories (create)
```

### Eleventy Configuration

The `.eleventy.js` config sets:
- Input directory: `cms/`
- Includes directory: `theme/`
- Output directory: `public/`

Template naming convention: `[collection-name].html` files create pages for collection items.

## Key Integrations

### TipTap Rich Text Editor

Editor outputs HTML with `card-*` CSS classes for Webflow CMS compatibility:
- `card-paragraph`, `card-h1`, `card-h2`, `card-h3`
- `card-list`, `card-quote`, `card-image`, `card-link`

See `RICH_TEXT_EDITOR_README.md` for full TipTap setup.

### TipTap + Uploadcare Form Integration

Complete form handler with TipTap editor and Uploadcare file uploads for Webflow → Xano:

```html
<script type="module">
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

(function() {
  const CONFIG = {
    formSelector: '#wf-form-story',
    xanoEndpoint: 'https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/stories',
    uploadcareKey: window.ENV_CONFIG?.UPLOADCARE_PUBLIC_KEY || ''
  };

  let uploadedFiles = null;
  let tiptapEditor = null;

  document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', init)
    : init();

  function init() {
    const form = document.querySelector(CONFIG.formSelector);
    if (!form) return console.error('Form not found');
    initTiptapEditor();
    setupUploadcare();
    setupFormSubmission(form);
  }

  function initTiptapEditor() {
    const editorContainer = document.getElementById('story-content-editor');
    if (!editorContainer) return;

    tiptapEditor = new Editor({
      element: editorContainer,
      extensions: [
        StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
        Image.configure({ inline: false, allowBase64: true })
      ],
      content: '<p>Write your story here...</p>',
      onUpdate: ({ editor }) => {
        const hiddenInput = document.getElementById('story_content_html');
        if (hiddenInput) hiddenInput.value = editor.getHTML();
      }
    });

    // Toolbar buttons
    const toolbar = document.getElementById('tiptap-toolbar');
    const buttons = [
      { label: 'H1', action: () => tiptapEditor.chain().focus().toggleHeading({ level: 1 }).run() },
      { label: 'H2', action: () => tiptapEditor.chain().focus().toggleHeading({ level: 2 }).run() },
      { label: 'Bold', action: () => tiptapEditor.chain().focus().toggleBold().run() },
      { label: 'Italic', action: () => tiptapEditor.chain().focus().toggleItalic().run() },
      { label: 'List', action: () => tiptapEditor.chain().focus().toggleBulletList().run() },
      { label: 'Quote', action: () => tiptapEditor.chain().focus().toggleBlockquote().run() }
    ];
    buttons.forEach(({ label, action }) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.type = 'button';
      btn.onclick = (e) => { e.preventDefault(); action(); };
      toolbar.appendChild(btn);
    });
  }

  function setupUploadcare() {
    const formInput = document.querySelector('uc-form-input[ctx-name="story"]');
    const hiddenInput = document.getElementById('story_hero');
    if (formInput) {
      new MutationObserver((mutations) => {
        mutations.forEach((m) => {
          if (m.attributeName === 'value') {
            try {
              const data = JSON.parse(formInput.getAttribute('value'));
              if (data?.length > 0) {
                uploadedFiles = { allEntries: data };
                if (hiddenInput) hiddenInput.value = data[0].cdnUrl || '';
              }
            } catch (e) {}
          }
        });
      }).observe(formInput, { attributes: true, attributeFilter: ['value'] });
    }
  }

  function setupFormSubmission(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn.value;
      submitBtn.value = 'Submitting...';
      submitBtn.disabled = true;

      try {
        const formData = {
          story_name: document.getElementById('story_name')?.value || '',
          story_email: document.getElementById('story_email')?.value || '',
          story_content_html: tiptapEditor ? tiptapEditor.getHTML() : '',
          uploadcare_uuid: uploadedFiles?.allEntries?.[0]?.uuid || '',
          uploadcare_url: uploadedFiles?.allEntries?.[0]?.cdnUrl || ''
        };

        const response = await fetch(CONFIG.xanoEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        form.style.display = 'none';
        form.parentElement.querySelector('.w-form-done').style.display = 'block';
      } catch (error) {
        form.parentElement.querySelector('.w-form-fail').style.display = 'block';
      } finally {
        submitBtn.value = originalText;
        submitBtn.disabled = false;
      }
    });
  }
})();
</script>

<!-- Disable Webflow native form handling -->
<script>
var Webflow = Webflow || [];
Webflow.push(function() { $(document).off('submit'); });
</script>
```

**Required HTML elements:**
- `#wf-form-story` - Form element
- `#story-content-editor` - TipTap editor container
- `#tiptap-toolbar` - Toolbar container
- `#story_content_html` - Hidden input for HTML content
- `uc-form-input[ctx-name="story"]` - Uploadcare file input
- `.w-form-done` / `.w-form-fail` - Webflow success/error states

### Xano API

Base URL: `https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu`

Test endpoints:
```bash
# Stories API
curl "https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/stories?page=1&per_page=10"

# Auth API
curl -X POST "https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

See `STORIES_API.md` for complete API documentation.

### Webflow → Xano Form Handler

Generic form handler for submitting any Webflow form to Xano endpoints. Add to Webflow's Project Settings → Custom Code → Footer:

```html
<script>
var Webflow = Webflow || [];
Webflow.push(function() {
  $(document).off('submit');
  $('form').submit(function(e) {
    e.preventDefault();
    const $form = $(this);
    const $submit = $('[type=submit]', $form);
    const buttonText = $submit.val();
    const buttonWaitingText = $submit.attr('data-wait');
    const formMethod = $form.attr('method');
    const formAction = $form.attr('action');
    const formRedirect = $form.attr('data-redirect');
    const formData = $form.serialize();

    if (buttonWaitingText) { $submit.val(buttonWaitingText); }

    $.ajax(formAction, { data: formData, method: formMethod })
      .done((res) => {
        if (formRedirect) { window.location = formRedirect; return; }
        $form.hide()
          .siblings('.w-form-done').show()
          .siblings('.w-form-fail').hide();
      })
      .fail((res) => {
        $form.siblings('.w-form-done').hide()
          .siblings('.w-form-fail').show();
      })
      .always(() => { $submit.val(buttonText); });
  });
});
</script>
```

**Webflow form setup:**
- `action` → Xano endpoint URL (e.g., `https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/endpoint`)
- `method` → `POST` or `GET`
- `data-redirect` → Optional redirect URL on success
- `data-wait` → Button text while submitting (e.g., "Sending...")

### Webflow Login Form (with Password Toggle)

Minimal login form for Webflow with password visibility toggle and Xano auth:

```html
<script>
document.addEventListener('DOMContentLoaded', function() {
  const form = document.querySelector('form');
  if (!form) return;

  // Password toggle - uses .hidepw class element
  const toggle = document.querySelector('.hidepw');
  const passwordInput = form.querySelector('input[name="password"]');

  if (toggle && passwordInput) {
    toggle.style.cursor = 'pointer';
    toggle.textContent = 'show password';
    toggle.addEventListener('click', function() {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      this.textContent = isPassword ? 'hide password' : 'show password';
    });
  }

  // Form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();

    const email = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;
    const btn = form.querySelector('[type="submit"]');
    const wForm = form.closest('.w-form');
    const fail = wForm?.querySelector('.w-form-fail');
    const done = wForm?.querySelector('.w-form-done');

    // Hide previous messages
    if (fail) fail.style.display = 'none';
    if (done) done.style.display = 'none';

    // Disable button
    const btnText = btn.value;
    btn.value = 'Signing in...';
    btn.disabled = true;

    try {
      const response = await fetch('https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.authToken) {
        // Store auth data (compatible with xano-auth-webflow.js)
        localStorage.setItem('xano_auth_token', JSON.stringify(data.authToken));
        localStorage.setItem('xano_user', JSON.stringify(data.user));

        // Show success & redirect
        form.style.display = 'none';
        if (done) done.style.display = 'block';
        setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
      } else {
        if (fail) {
          fail.textContent = data.message || 'Invalid email or password';
          fail.style.display = 'block';
        }
        btn.value = btnText;
        btn.disabled = false;
      }
    } catch (error) {
      if (fail) {
        fail.textContent = 'Connection error. Please try again.';
        fail.style.display = 'block';
      }
      btn.value = btnText;
      btn.disabled = false;
    }
  });
});
</script>
```

**Required Webflow elements:**
- Form with `input[name="email"]` and `input[name="password"]`
- `.hidepw` element for password toggle (any clickable element)
- `.w-form-done` / `.w-form-fail` for success/error messages

### Webflow CMS Sync

Stories sync bidirectionally between Xano and Webflow via webhooks. Configure sync in `.env`:
- `WEBFLOW_API_TOKEN`
- `WEBFLOW_SITE_ID`
- `WEBFLOW_STORIES_COLLECTION_ID`

## Xano Development

This project uses the **xano-sdk-builder** skill for building Xano endpoints. Key workflow:

1. **Build incrementally** - Start minimal, add one feature at a time
2. **Test with curl immediately** after each deployment
3. **Use `update_endpoint`** to modify existing endpoints (never create v2, v3)
4. **Check response structure**: API responses are at `$result.response.result`

XanoScript files use `.xanoscript` or `.xs` extensions. Deploy via Xano dashboard Function Stack editor.

## BMad Framework

Project management uses BMad (Business Model Agile Development) agents:

```bash
# Activate agents via Claude Code
/BMad:agents:po          # Product Owner
/BMad:agents:architect   # System Architect
/BMad:agents:dev         # Developer
```

Configuration in `.bmad/` and `.bmad-core/` directories.

## Environment Variables

Copy `.env.example` to `.env`. Required variables:
- `XANO_API_URL`, `XANO_API_KEY` - Backend API
- `UPLOADCARE_PUBLIC_KEY` - File uploads
- `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID` - Authentication
- `WEBFLOW_API_TOKEN`, `WEBFLOW_SITE_ID` - CMS sync
- `SENDGRID_API_KEY` - Email (for invites, password reset)

## Deployment

Netlify auto-deploys from `main` branch:
- Build command: `npm install && npm run build`
- Publish directory: `public`
- Node version: 20

Configure environment variables in Netlify dashboard → Site Settings → Environment Variables.

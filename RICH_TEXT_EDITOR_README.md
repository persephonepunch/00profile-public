# Rich Text Editor Integration for USC Story Project

Complete implementation of TipTap rich text editor that saves HTML content to Xano and syncs with Webflow CMS.

## What's Included

### For Eleventy Site
- **File:** `theme/stories.html`
- **Features:**
  - TipTap editor with full toolbar
  - Custom card-* CSS classes for Webflow CMS compatibility
  - Uploadcare image integration
  - Form submission to Xano

### For Webflow
- **File:** `WEBFLOW_TIPTAP_INTEGRATION.html`
- **Features:**
  - Standalone code for Webflow custom embed
  - Same functionality as Eleventy version
  - Detailed setup instructions included

### TipTap Styling
- **File:** `theme/tiptap-card-classes.html`
- **Features:**
  - Complete editor styles
  - Card-* class output for Webflow Rich Text compatibility
  - Hero image and author avatar upload components

### Xano Backend
- **File:** `XANO_ENDPOINT.md`
- **Contains:**
  - Complete endpoint documentation
  - XanoScript code
  - Testing examples

---

## Quick Start Guide

### Step 1: Include TipTap Dependencies

TipTap is loaded via ES modules from CDN:

```html
<script type="module">
import { Editor } from 'https://esm.sh/@tiptap/core@2.1.13';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit@2.1.13';
import Underline from 'https://esm.sh/@tiptap/extension-underline@2.1.13';
import Link from 'https://esm.sh/@tiptap/extension-link@2.1.13';
import Image from 'https://esm.sh/@tiptap/extension-image@2.1.13';
import Placeholder from 'https://esm.sh/@tiptap/extension-placeholder@2.1.13';
</script>
```

### Step 2: Create the Editor Container

```html
<div class="tiptap-wrapper" id="story-editor-wrapper">
  <div class="tiptap-toolbar" id="tiptap-toolbar">
    <button type="button" data-action="bold" title="Bold"><b>B</b></button>
    <button type="button" data-action="italic" title="Italic"><i>I</i></button>
    <button type="button" data-action="underline" title="Underline"><u>U</u></button>
    <button type="button" data-action="strike" title="Strikethrough"><s>S</s></button>
    <div class="separator"></div>
    <button type="button" data-action="h1" title="Heading 1">H1</button>
    <button type="button" data-action="h2" title="Heading 2">H2</button>
    <button type="button" data-action="h3" title="Heading 3">H3</button>
    <div class="separator"></div>
    <button type="button" data-action="bulletList" title="Bullet List">• List</button>
    <button type="button" data-action="orderedList" title="Numbered List">1. List</button>
    <button type="button" data-action="blockquote" title="Quote">"</button>
    <button type="button" data-action="codeBlock" title="Code Block">&lt;/&gt;</button>
    <div class="separator"></div>
    <button type="button" data-action="link" title="Add Link">Link</button>
    <button type="button" data-action="image" title="Upload Image">Image</button>
  </div>
  <div class="tiptap-editor" id="tiptap-editor"></div>
  <div class="tiptap-footer">
    <span id="word-count">0 words</span>
  </div>
</div>
<input type="hidden" id="body_html" name="body_html">
<input type="hidden" id="body_text" name="body_text">
```

### Step 3: Initialize the Editor

```javascript
const editor = new Editor({
  element: document.getElementById('tiptap-editor'),
  extensions: [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] }
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' }
    }),
    Image.configure({
      inline: false,
      allowBase64: false
    }),
    Placeholder.configure({
      placeholder: 'Write your story here...'
    })
  ],
  onUpdate: ({ editor }) => {
    document.getElementById('body_html').value = editor.getHTML();
    document.getElementById('body_text').value = editor.getText();
  }
});
```

### Step 4: Test the Editor

1. **Build your site:**
   ```bash
   npm run build
   ```

2. **Test locally:**
   ```bash
   npm run serve
   ```

3. **Open:** `http://localhost:8080/stories/`

---

## Rich Text Editor Features

### Text Formatting
- **Headers:** H1, H2, H3
- **Styles:** Bold, Italic, Underline, Strikethrough
- **Lists:** Ordered (numbered), Unordered (bullets)
- **Indentation:** Nested lists supported

### Media and Special Content
- **Links:** Add hyperlinks with target="_blank"
- **Images:** Via Uploadcare integration
- **Blockquotes:** Quote styling
- **Code Blocks:** For code snippets

### Toolbar Actions

```javascript
const actions = {
  bold: () => editor.chain().focus().toggleBold().run(),
  italic: () => editor.chain().focus().toggleItalic().run(),
  underline: () => editor.chain().focus().toggleUnderline().run(),
  strike: () => editor.chain().focus().toggleStrike().run(),
  h1: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  h2: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  h3: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  bulletList: () => editor.chain().focus().toggleBulletList().run(),
  orderedList: () => editor.chain().focus().toggleOrderedList().run(),
  blockquote: () => editor.chain().focus().toggleBlockquote().run(),
  codeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
  link: () => {
    const url = window.prompt('Enter URL:');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  }
};
```

---

## Webflow CMS Integration (Card-* Classes)

The editor outputs HTML with custom CSS classes that match Webflow CMS Rich Text styling:

### Custom Extensions

```javascript
import { Paragraph } from 'https://esm.sh/@tiptap/extension-paragraph@2.1.13';
import { Heading } from 'https://esm.sh/@tiptap/extension-heading@2.1.13';

// Custom Paragraph with card-paragraph class
const CardParagraph = Paragraph.extend({
  renderHTML({ HTMLAttributes }) {
    return ['p', { ...HTMLAttributes, class: 'card-paragraph' }, 0];
  }
});

// Custom Heading with card-h1, card-h2, card-h3 classes
const CardHeading = Heading.extend({
  renderHTML({ node, HTMLAttributes }) {
    const level = node.attrs.level;
    return [`h${level}`, { ...HTMLAttributes, class: `card-h${level}` }, 0];
  }
});
```

### Field Mapping

| Form Field | Xano Field | Webflow CMS Field | Card Class |
|------------|------------|-------------------|------------|
| `title` | `title` | `name` | `demo-card__h` |
| `body_html` | `body_html` | `body` (Rich Text) | Uses card-* classes |
| `featured_image` | `featured_image` | `featured-image` | `card-image` |
| `author_name` | `author_name` | `author-name` | `demo-card__p` |
| `author_image` | `author_image` | `author-image` | `demo__card-avatar` |

### HTML Output Example

```html
<p class="card-paragraph">This is a paragraph.</p>
<h1 class="card-h1">Main Heading</h1>
<h2 class="card-h2">Subheading</h2>
<ul class="card-list card-ul-title">
  <li>Bullet item</li>
</ul>
<blockquote class="card-quote">A quoted text</blockquote>
<img src="..." class="card-image" alt="...">
<a href="..." class="card-link">Link text</a>
```

---

## How It Works

### Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User writes story in TipTap editor                       │
│    - Rich formatting (bold, lists, headings, etc.)          │
│    - Images via Uploadcare                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. User clicks "Submit"                                     │
│    - JavaScript captures editor.getHTML()                   │
│    - Content includes card-* classes for Webflow            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Submit to Xano                                           │
│    POST /stories/submit                                     │
│    {                                                        │
│      title: "My Story",                                     │
│      body_html: "<p class='card-paragraph'>...</p>",        │
│      author_name: "Jane Doe",                               │
│      featured_image: "https://ucarecdn.com/..."             │
│    }                                                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Xano saves to database                                   │
│    - Triggers webhook to sync with Webflow CMS              │
│    - Story appears on Webflow site                          │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```javascript
// STEP 1: Get HTML from TipTap (with card-* classes)
const html = editor.getHTML();
// Result: "<p class='card-paragraph'>My story content...</p>"

// STEP 2: Get plain text for previews
const text = editor.getText();
// Result: "My story content..."

// STEP 3: Build submission data
const data = {
  title: formData.get('title'),
  body_html: html,  // Contains card-* classes
  body_text: text,
  author_name: formData.get('author_name'),
  author_email: formData.get('author_email'),
  featured_image: document.getElementById('featured_image').value
};

// STEP 4: Submit to Xano
await fetch('https://xerb-qpd6-hd8t.n7.xano.io/api:pIN2vLYu/stories/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});
```

---

## Testing Guide

### Test 1: Basic Rich Text Editing

1. **Open your stories page**
2. **Write in the editor:**
   ```
   Heading 1: My Test Story

   This is a paragraph with bold text and italic text.

   • Bullet point 1
   • Bullet point 2

   1. Numbered item 1
   2. Numbered item 2
   ```

3. **Check browser console**
   - Should see: "✅ Tiptap editor initialized"

### Test 2: Form Submission

1. **Fill out the form:**
   - Title: "Test Story"
   - Author Name: "Test Author"
   - Author Email: "test@example.com"
   - Story Content: Write some formatted text

2. **Click "Submit"**

3. **Watch browser console:**
   ```
   📤 Submitting with card-* classes: {...}
   ✅ Submission successful: {...}
   ```

### Test 3: Verify Card-* Classes

Check the hidden input value:
```javascript
console.log(document.getElementById('body_html').value);
// Should show HTML with card-paragraph, card-h1, etc.
```

---

## Customization Options

### Toolbar Customization

```javascript
// Minimal toolbar
const minimalToolbar = ['bold', 'italic', 'link'];

// Full toolbar
const fullToolbar = [
  'bold', 'italic', 'underline', 'strike',
  'h1', 'h2', 'h3',
  'bulletList', 'orderedList',
  'blockquote', 'codeBlock',
  'link', 'image'
];
```

### Editor Styling

```css
/* Change editor height */
.tiptap-editor {
  min-height: 500px;
}

/* Custom toolbar colors */
.tiptap-toolbar {
  background: #f8f9fa;
  border-color: #dee2e6;
}

/* Active button state */
.tiptap-toolbar button.is-active {
  background: #333;
  color: #fff;
}

/* Editor content styles */
.tiptap-editor p {
  margin: 0 0 1em 0;
  line-height: 1.6;
}
```

### Adding Custom Extensions

```javascript
import { Extension } from 'https://esm.sh/@tiptap/core@2.1.13';

// Example: Add character count
const CharacterCount = Extension.create({
  name: 'characterCount',
  onUpdate({ editor }) {
    const count = editor.getText().length;
    document.getElementById('char-count').textContent = `${count} characters`;
  }
});
```

---

## Troubleshooting

### Issue: Editor doesn't appear

**Solution:**
1. Check browser console for errors
2. Verify ES module imports are loading:
   ```javascript
   // Check in console
   import('https://esm.sh/@tiptap/core@2.1.13').then(m => console.log('TipTap loaded'));
   ```
3. Check that `#tiptap-editor` div exists

### Issue: Toolbar buttons not responding

**Solution:**
1. Ensure editor is initialized before toolbar setup
2. Check button `data-action` attributes match action names
3. Verify editor instance is accessible:
   ```javascript
   console.log('Editor:', editor);  // Should not be null
   ```

### Issue: HTML content not saving

**Solution:**
1. Check hidden input elements exist:
   ```javascript
   console.log(document.getElementById('body_html'));
   ```
2. Verify onUpdate callback is firing
3. Check form submission includes the hidden fields

### Issue: CORS errors

**Solution:**
1. Check Xano API Group CORS settings
2. Enable CORS for your domain
3. Or use same-origin deployment

### Issue: Images not uploading

**Solution:**
1. Verify Uploadcare widget is loaded:
   ```javascript
   console.log('Uploadcare:', typeof uploadcare);
   ```
2. Check Uploadcare public key is correct
3. Ensure imagesOnly option is set

---

## TipTap vs Quill Comparison

| Feature | TipTap | Quill |
|---------|--------|-------|
| **Architecture** | ProseMirror-based | Custom |
| **Output** | HTML + JSON | HTML + Delta |
| **Customization** | Extensions | Modules |
| **TypeScript** | Native support | Limited |
| **Bundle size** | Modular | Monolithic |
| **React support** | @tiptap/react | react-quill |

### Why TipTap?
- Better control over HTML output (custom classes)
- Structured JSON for complex data operations
- Extensible architecture for custom nodes
- Modern ES module support

---

## Performance Considerations

### Content Size

Average HTML file sizes with TipTap:
- **Short story (500 words):** ~5-8 KB
- **Medium story (2000 words):** ~15-25 KB
- **Long story (5000 words):** ~40-60 KB
- **With embedded images:** Add ~1 KB per image reference

**Recommendations:**
- Use Uploadcare for images (URLs, not base64)
- Store both HTML and plain text versions
- Use body_text for search/previews

---

## Security Best Practices

### 1. HTML Sanitization

Use DOMPurify for client-side sanitization:

```javascript
import DOMPurify from 'https://esm.sh/dompurify@3.0.6';

function sanitizeHTML(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'h1', 'h2', 'h3',
                   'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false
  });
}
```

### 2. URL Validation

```javascript
function isValidURL(string) {
  try {
    const url = new URL(string);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}
```

### 3. Server-Side Validation

Add to Xano endpoint:
```xanoscript
# Validate content length
var content_length $input.body_html|length
conditional $content_length > 500000
  throw "CONTENT_TOO_LARGE" "Content exceeds 500KB limit" 413
endConditional
```

---

## Additional Resources

### TipTap Documentation
- **Official Docs:** https://tiptap.dev/docs
- **Extensions:** https://tiptap.dev/docs/editor/extensions
- **API Reference:** https://tiptap.dev/docs/editor/api

### Project Files
- `theme/stories.html` - Eleventy implementation
- `WEBFLOW_TIPTAP_INTEGRATION.html` - Webflow standalone code
- `theme/tiptap-card-classes.html` - Styles and card-* class extensions
- `XANO_ENDPOINT.md` - Complete endpoint documentation

### Related npm Packages
```json
{
  "@tiptap/core": "^2.1.13",
  "@tiptap/starter-kit": "^2.1.13",
  "@tiptap/extension-underline": "^2.1.13",
  "@tiptap/extension-link": "^2.1.13",
  "@tiptap/extension-image": "^2.1.13",
  "@tiptap/extension-placeholder": "^2.1.13"
}
```

---

## Next Steps

1. **✓ Set up TipTap editor** (see Step 1-3)
2. **✓ Configure card-* class extensions** for Webflow
3. **✓ Set up Uploadcare** for image uploads
4. **✓ Create Xano endpoint** (see XANO_ENDPOINT.md)
5. **✓ Test complete flow** end-to-end
6. **Optional:** Add collaboration with Yjs
7. **Optional:** Implement autosave
8. **Optional:** Add custom extensions

---

**Happy Story Publishing with TipTap!**

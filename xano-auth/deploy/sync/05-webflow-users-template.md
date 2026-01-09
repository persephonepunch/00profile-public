# Webflow Users Template Script

Copy-paste code for the Webflow CMS Users Template page.

---

## Page Settings

1. Open **Users Template** in Webflow Designer
2. Go to **Page Settings** (gear icon)
3. Paste script in **Before </body> tag**

---

## Complete Script

```html
<script>
document.addEventListener('DOMContentLoaded', async function() {
  // Get profile slug from URL
  var pathParts = window.location.pathname.split('/');
  var profileSlug = pathParts[pathParts.length - 1];

  // Get viewer's auth
  var token = localStorage.getItem('xano_auth_token');
  var viewerData = localStorage.getItem('xano_user');
  var viewer = viewerData ? JSON.parse(viewerData) : null;
  var authToken = token ? JSON.parse(token) : null;

  // Elements
  var publicContent = document.querySelector('[data-visibility="public"]');
  var privateContent = document.querySelector('[data-visibility="private"]');
  var restrictedMessage = document.querySelector('[data-restricted]');
  var requestAccessBtn = document.querySelector('[data-request-access]');
  var loadingEl = document.querySelector('[data-loading]');

  // Show loading
  if (loadingEl) loadingEl.style.display = 'block';
  if (publicContent) publicContent.style.display = 'none';
  if (privateContent) privateContent.style.display = 'none';
  if (restrictedMessage) restrictedMessage.style.display = 'none';

  try {
    // Fetch profile from Xano with access control
    var headers = { 'Content-Type': 'application/json' };
    if (authToken) {
      headers['Authorization'] = 'Bearer ' + authToken;
    }

    var res = await fetch('https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/users/' + profileSlug, {
      method: 'GET',
      headers: headers
    });

    var data = await res.json();

    // Hide loading
    if (loadingEl) loadingEl.style.display = 'none';

    if (data.access === 'granted') {
      // Show full profile
      if (publicContent) publicContent.style.display = 'block';
      if (privateContent) privateContent.style.display = 'block';

      // Populate data
      populateProfile(data.profile, data.is_owner);

    } else if (data.access === 'restricted') {
      // Show limited profile
      if (publicContent) publicContent.style.display = 'block';
      if (restrictedMessage) restrictedMessage.style.display = 'block';

      // Populate limited data
      populateLimitedProfile(data.profile);

      // Show request access button if logged in
      if (requestAccessBtn) {
        requestAccessBtn.style.display = viewer ? 'block' : 'none';
      }
    }

  } catch (err) {
    console.error('Error loading profile:', err);
    if (loadingEl) loadingEl.style.display = 'none';
    if (restrictedMessage) {
      restrictedMessage.style.display = 'block';
      restrictedMessage.textContent = 'Error loading profile';
    }
  }

  // Request Access Button Handler
  if (requestAccessBtn) {
    requestAccessBtn.addEventListener('click', async function(e) {
      e.preventDefault();

      if (!authToken) {
        window.location.href = '/login';
        return;
      }

      requestAccessBtn.textContent = 'Sending...';
      requestAccessBtn.disabled = true;

      try {
        var res = await fetch('https://xerb-qpd6-hd8t.n7.xano.io/api:hJgoiIwh/users/' + profileSlug + '/request-access', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + authToken
          },
          body: JSON.stringify({ message: '' })
        });

        var data = await res.json();

        if (data.success) {
          requestAccessBtn.textContent = 'Request Sent!';
          requestAccessBtn.style.backgroundColor = '#2E7D32';
        } else {
          requestAccessBtn.textContent = data.message || 'Error';
          requestAccessBtn.disabled = false;
        }
      } catch (err) {
        requestAccessBtn.textContent = 'Error - Try Again';
        requestAccessBtn.disabled = false;
      }
    });
  }

  // Populate full profile
  function populateProfile(profile, isOwner) {
    setText('[data-profile-name]', profile.first_name + ' ' + profile.last_name);
    setText('[data-profile-first-name]', profile.first_name);
    setText('[data-profile-role]', profile.role);
    setText('[data-profile-bio]', profile.bio);
    setImage('[data-profile-image]', profile.profile_image_url);

    if (isOwner) {
      setText('[data-profile-email]', profile.email);
      showElement('[data-owner-only]');
    }

    // Render tags
    if (profile.tags && profile.tags.length > 0) {
      var tagsContainer = document.querySelector('[data-profile-tags]');
      if (tagsContainer) {
        tagsContainer.innerHTML = '';
        profile.tags.forEach(function(ut) {
          var tag = ut.tag || ut;
          var tagEl = document.createElement('span');
          tagEl.className = 'profile-tag';
          tagEl.textContent = tag.name;
          tagEl.style.backgroundColor = tag.color || '#8B0000';
          tagEl.style.color = '#fff';
          tagEl.style.padding = '4px 12px';
          tagEl.style.borderRadius = '16px';
          tagEl.style.marginRight = '8px';
          tagEl.style.fontSize = '14px';
          tagsContainer.appendChild(tagEl);
        });
      }
    }
  }

  // Populate limited profile (restricted)
  function populateLimitedProfile(profile) {
    setText('[data-profile-name]', profile.first_name);
    setText('[data-profile-first-name]', profile.first_name);
    setImage('[data-profile-image]', profile.profile_image_url);
    hideElement('[data-profile-bio]');
    hideElement('[data-profile-email]');
    hideElement('[data-profile-tags]');
  }

  // Helper functions
  function setText(selector, text) {
    var el = document.querySelector(selector);
    if (el && text) el.textContent = text;
  }

  function setImage(selector, url) {
    var el = document.querySelector(selector);
    if (el && url) el.src = url;
  }

  function showElement(selector) {
    var el = document.querySelector(selector);
    if (el) el.style.display = 'block';
  }

  function hideElement(selector) {
    var el = document.querySelector(selector);
    if (el) el.style.display = 'none';
  }

  // Logout handler
  var logoutBtn = document.querySelector('[data-logout]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('xano_auth_token');
      localStorage.removeItem('xano_user');
      window.location.href = '/login';
    });
  }
});
</script>
```

---

## Webflow Elements to Create

### Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-loading` | Div | Shows while loading |
| `data-visibility="public"` | Div wrapper | Content for everyone |
| `data-visibility="private"` | Div wrapper | Content for authorized only |
| `data-restricted` | Div | "Profile is private" message |
| `data-request-access` | Button | Request access button |
| `data-profile-name` | Text | Full name |
| `data-profile-first-name` | Text | First name only |
| `data-profile-email` | Text | Email (owner only) |
| `data-profile-role` | Text | Role badge |
| `data-profile-bio` | Rich Text/Paragraph | Bio |
| `data-profile-image` | Image | Profile photo |
| `data-profile-tags` | Div | Container for tags |
| `data-owner-only` | Any | Only visible to profile owner |
| `data-logout` | Button/Link | Logout button |

---

## Template Structure

```
Users Template
├── [data-loading] - "Loading..."
│
├── [data-visibility="public"] - Always shown wrapper
│   ├── [data-profile-image]
│   ├── [data-profile-name]
│   └── [data-profile-role]
│
├── [data-visibility="private"] - Only if access granted
│   ├── [data-profile-bio]
│   ├── [data-profile-email]
│   ├── [data-profile-tags]
│   └── [data-owner-only]
│       └── Edit Profile button
│
├── [data-restricted] - Only if no access
│   ├── "This profile is private"
│   └── [data-request-access] Button
│
└── Nav
    └── [data-logout]
```

---

## CSS Suggestions

```css
/* Add to Webflow custom code or embedded style */
.profile-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  margin-right: 8px;
  margin-bottom: 8px;
}

[data-loading] {
  text-align: center;
  padding: 40px;
}

[data-restricted] {
  background: #FFF3E0;
  border: 1px solid #FFB74D;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}
```

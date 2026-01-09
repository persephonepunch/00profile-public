# Sprint 03: Profiles Page with Card Slider

**Sprint Goal:** Build student profiles page with GSAP-powered overlapping card slider

**Status:** ✅ Complete
**Duration:** December 31, 2025 - TBD
**Epic:** Epic 2 - Student Profiles & Directory

---

## Sprint Overview

This sprint delivers a student profiles showcase page featuring an interactive overlapping card slider built with GSAP Draggable. The slider provides a visually engaging way to browse through 37 student profiles with smooth drag/throw animations, keyboard navigation, and responsive design.

### Key Deliverables

1. **Overlapping Card Slider**
   - GSAP Draggable-powered horizontal slider
   - Scale and rotation transforms on overlap
   - Inertia-based throw with snap-to-card
   - Keyboard navigation (arrow keys)
   - Touch/pointer support
   - Accessibility (ARIA labels, roles)

2. **Profiles Page Template**
   - Grid/list of student profile cards
   - Profile photo, name, major, excerpt
   - Link to individual profile detail pages
   - Filter by major/program (future enhancement)

3. **Profile Detail Page**
   - Full profile with all sections (How USC changed my life, Favorite memory, etc.)
   - Hero image
   - Back navigation

4. **Xano Integration**
   - Profiles API endpoint (GET /profiles)
   - Individual profile endpoint (GET /profiles/:slug)
   - CSV import to Xano database

---

## User Stories

### Story 3.1: Overlapping Card Slider Component
**Status:** 🔄 In Progress

**As a** site visitor,
**I want** an interactive card slider to browse student profiles,
**so that** I can explore profiles in an engaging, visually appealing way.

#### Acceptance Criteria
1. [ ] Slider uses GSAP Draggable for drag/throw interaction
2. [ ] Cards scale down (minScale: 0.45) and rotate (maxRotation: -8) on overlap
3. [ ] Inertia-enabled throwing with snap to nearest card
4. [ ] Keyboard navigation with arrow keys (when slider is 25%+ visible)
5. [ ] Touch/pointer support with `touchAction: none`
6. [ ] ResizeObserver recalculates layout on viewport changes
7. [ ] ARIA accessibility (role="region", aria-roledescription="carousel")

#### Implementation Notes
- Data attributes: `data-overlap-slider-init`, `data-overlap-slider-collection`, `data-overlap-slider-list`, `data-overlap-slider-item`
- Configurable via attributes: `data-scale`, `data-rotate`
- Uses GSAP + Draggable + InertiaPlugin
- Transform origin: `75% center`

---

### Story 3.2: Profiles Listing Page
**Status:** ⏳ Pending

**As a** site visitor,
**I want** to see a page of all student profiles,
**so that** I can discover and learn about different students.

#### Acceptance Criteria
1. [ ] Page displays profile cards with photo, name, major, excerpt
2. [ ] Cards link to individual profile detail pages
3. [ ] Responsive grid layout (mobile/tablet/desktop)
4. [ ] Data fetched from Xano API or embedded JSON

---

### Story 3.3: Profile Detail Page
**Status:** ⏳ Pending

**As a** site visitor,
**I want** to read a full student profile,
**so that** I can learn about their complete story and journey.

#### Acceptance Criteria
1. [ ] Dynamic route: `/profiles/[slug]`
2. [ ] Displays all profile sections (How USC changed my life, Favorite memory, Advice, What I learned, What played a role, What's next)
3. [ ] Hero image prominently displayed
4. [ ] Navigation back to profiles listing

---

### Story 3.4: Xano Profiles Backend
**Status:** ⏳ Pending

**As a** developer,
**I want** a Xano API for profiles,
**so that** the frontend can fetch profile data dynamically.

#### Acceptance Criteria
1. [ ] `profiles` table created in Xano with schema matching CSV
2. [ ] CSV data imported (37 profiles)
3. [ ] GET /profiles endpoint returns all profiles
4. [ ] GET /profiles/:slug returns individual profile

---

## Technical Implementation

### Card Slider Architecture

```
[data-overlap-slider-init]
├── [data-overlap-slider-collection] (overflow: hidden wrapper)
│   └── [data-overlap-slider-list] (draggable container)
│       ├── [data-overlap-slider-item] (card 1)
│       ├── [data-overlap-slider-item] (card 2)
│       └── ...
```

### GSAP Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| gsap | 3.x | Animation core |
| Draggable | 3.x | Drag interaction |
| InertiaPlugin | 3.x | Throw momentum (Club GSAP) |

### Data Schema (Profiles Table)

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Primary key |
| title | text | Profile name |
| slug | text | URL-friendly identifier |
| photo | text | Image URL (CDN) |
| description | text | Brief excerpt |
| major | text | Field of study |
| story | richtext | Full HTML content with sections |
| created_at | timestamp | Record creation |
| updated_at | timestamp | Last update |

### Files to Create/Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `theme/profiles.html` | Create | Profiles listing page with slider |
| `theme/[profile].html` | Create | Individual profile detail page |
| `theme/assets/js/overlap-slider.js` | Create | Card slider component |
| `cms/_data/profiles.js` | Create | Eleventy data file for profiles |

---

## Available Data

### CSV: 37 Student Profiles
- **Source:** `docs/usc-profiles - Profiles.csv`
- **Fields:** Title, Slug, Photo (CDN URL), Description, Major, Story (HTML)
- **Programs:** Accounting, Finance, International Business, Operations, HR Masters, MBA, MIB

### Images: 20+ Profile Photos
- **Location:** `theme/assets/images/students/`
- **Format:** JPG (16-42 KB)
- **Also available:** CDN URLs in CSV

---

## Testing Checklist

- [ ] Slider renders with profile cards
- [ ] Drag interaction works (mouse and touch)
- [ ] Inertia throw with snap works
- [ ] Keyboard navigation (←/→) works
- [ ] Responsive layout on mobile/tablet/desktop
- [ ] Profiles fetch from Xano API
- [ ] Individual profile pages load correctly
- [ ] ARIA accessibility passes basic audit

---

## Sprint Backlog

| Task | Priority | Status |
|------|----------|--------|
| Implement overlapping card slider component | High | 🔄 In Progress |
| Create profiles.html listing page | High | ⏳ Pending |
| Create [profile].html detail page | High | ⏳ Pending |
| Create Xano profiles table | Medium | ⏳ Pending |
| Import CSV to Xano | Medium | ⏳ Pending |
| Create Xano GET /profiles endpoint | Medium | ⏳ Pending |
| Create Xano GET /profiles/:slug endpoint | Medium | ⏳ Pending |
| Add filter by major/program | Low | ⏳ Pending |

---

## Related Documentation

- [Sprint 01: Rich Text Editor](./sprint-01-rich-text-editor.md)
- [Sprint 02: Webflow Sync](./sprint-02-webflow-sync.md)
- [GSAP Draggable](https://gsap.com/docs/v3/Plugins/Draggable/)
- [Xano Documentation](https://docs.xano.com/)

---

**Sprint Started:** December 31, 2025
**Next Sprint:** Sprint 04 - Comments System & Moderation

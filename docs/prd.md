# USC Story Generator Platform - Product Requirements Document (PRD)

**Version:** 1.0
**Date:** 2025-12-10
**Status:** Draft for Stakeholder Review
**Author:** Sarah (Product Owner Agent)

---

## Table of Contents

1. [Goals and Background Context](#goals-and-background-context)
2. [Requirements](#requirements)
3. [User Interface Design Goals](#user-interface-design-goals)
4. [Technical Assumptions](#technical-assumptions)
5. [Epic List](#epic-list)
6. [Epic Details](#epic-details)
7. [Next Steps](#next-steps)

---

## Goals and Background Context

### Goals

The USC Story Generator Platform PRD aims to deliver:

- **Establish alternative funding mechanism** to address federal funding loss through diversified endowment model:
  - **Family-Community Endowments**: Families, friends, churches, community groups providing direct tuition support to students in need
  - **Sponsor Donations**: Philanthropic organizations and foundations contributing without advertising requirements
  - **Corporate Endowments**: Companies funding platform in exchange for ethical, student-controlled loyalty advertising
- **Dual Benefit Model**: Platform sustains itself financially (school) WHILE enabling grassroots community support for individual students facing financial challenges
- **Implement freemium business model**: Free public publishing + Premium privacy features unlocked by corporate ad acceptance
- Launch MVP within 6 months with core story publishing, commenting, privacy controls, and endowment features
- Achieve 500+ active student users within first semester after launch
- **Achieve 60%+ premium tier adoption** (students opting into corporate advertising for privacy features)
- **Facilitate $50K+ in community endowment contributions** within first 6 months (family-community + sponsors + corporations)
- **Secure initial corporate endowment commitments** from 5+ corporate sponsors within first 3 months post-launch
- Maintain operational costs under $200/month through year one (excluding payment processing)
- Achieve 80%+ student satisfaction with platform usability and features
- Process 100+ published stories in first 3 months post-launch
- Provide modern, student-editable platform that replaces outdated USC website for community engagement
- Build sustainable, peer-to-peer content ecosystem driven by campus community relationships
- **Enable transparent community support network** where students in need can receive grassroots financial assistance
- Deliver cost-optimized JAMstack architecture that scales economically without vendor lock-in

### Background Context

The current University of South Carolina website is extremely outdated, cannot be edited by the student body, and provides only utility-focused functionality without engagement or community features. **With federal funding cuts threatening student financial stability and institutional resources, USC needs an innovative platform that simultaneously serves students' communication needs AND creates sustainable revenue streams through diversified community endowments.**

Students resort to fragmented social media platforms (Instagram, Twitter, TikTok) that are short-form focused, algorithm-driven, and unsuitable for meaningful storytelling or substantive discourse. **More critically, students facing financial hardship have no modern platform to receive grassroots community support**—no mechanism for churches, alumni, local community groups, or family friends to contribute directly to student tuition needs.

The USC Story Generator Platform addresses this dual challenge by combining static site generation (Eleventy) with headless CMS capabilities (Xano), sophisticated authentication and authorization (Auth0 + permit.io), personalized dashboards, **and integrated endowment contribution system (Stripe ACH)**. The platform enables students to publish long-form stories, engage in moderated discussions, maintain fine-grained privacy controls, **AND receive community-driven financial support through three endowment streams:**

1. **Family-Community Endowments** → Direct tuition payments from families, friends, churches, community organizations
2. **Sponsor Donations** → Philanthropic contributions from foundations, alumni, local businesses (without advertising requirements)
3. **Corporate Endowments** → Company contributions in exchange for ethical, student-controlled loyalty advertising (discount programs)

This creates a **sustainable ecosystem** where the platform itself becomes financially viable (benefiting the school) WHILE enabling grassroots support for individual students in need—all within a cost-effective, performant JAMstack architecture.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-12-10 | 1.0 | Initial PRD draft from Project Brief | Sarah (PO Agent) |

---

## Requirements

### Functional Requirements

**User Tiers & Access:**
- FR1: System supports two user tiers: **FREE** (public-only stories) and **PREMIUM** (privacy features enabled)
- FR2: Users start in FREE tier by default upon registration
- FR3: Users unlock PREMIUM tier by opting into corporate advertising/loyalty programs
- FR4: PREMIUM tier users can downgrade to FREE tier (lose privacy features, stories become public)

**Story Publishing & Content:**
- FR5: All users can create long-form stories using a rich text editor
- FR6: All users can save stories as drafts and publish when ready
- FR7: Published stories trigger GitOps workflow (GitHub → Netlify deployment)
- FR8: All users can preview stories before publishing
- FR9: Story authors can edit or delete their published stories
- FR10: **FREE tier users** can only publish **public stories** (visible to all)
- FR11: **PREMIUM tier users** can set story visibility: public, USC-only, specific groups, or private

**Authentication & Access Control:**
- FR12: Users authenticate via Auth0 SSO with role assignment (Student, Family, Instructor, Community, Admin, Corporate)
- FR13: System enforces fine-grained ABAC policies via permit.io for PREMIUM tier personalized dashboard access
- FR14: **PREMIUM tier users** can create and manage privacy settings for story visibility
- FR15: **PREMIUM tier users** can create and invite members to private comment groups

**Commenting System:**
- FR16: All users can post threaded comments on public stories
- FR17: **PREMIUM tier** story authors control who can comment (public, specific groups, invitation-only)
- FR18: **FREE tier** stories have public commenting only
- FR19: Users can flag inappropriate comments for moderation
- FR20: Moderators can review, hide, or delete flagged comments
- FR21: Users receive notifications for comment activity on their stories

**Personalized Dashboard:**
- FR22: All users have a basic dashboard showing their stories (drafts, published)
- FR23: **PREMIUM tier users** see enhanced dashboard with privacy management, comment moderation queue, activity feed, and group memberships
- FR24: **FREE tier users** see simplified dashboard with public story management only

**Family-Community Endowments (Grassroots Support):**
- FR25: **Family and community members** (relatives, friends, church groups, local organizations) can set up recurring tuition payments to specific students via Stripe ACH
- FR26: Students can create **endowment profile** to share with potential community supporters (optional, privacy-controlled)
- FR27: Students can link their tuition account to receive family-community endowment contributions
- FR28: System tracks and displays total endowment contributions per student (with privacy controls)
- FR29: Contributors receive tax receipts for endowment contributions
- FR30: Students can view endowment contribution history, upcoming payments, and thank contributors
- FR31: Students can send **thank-you messages** to contributors (optional, maintains contributor privacy if anonymous)

**Sponsor Donations (Philanthropic, Non-Advertising):**
- FR32: Sponsors (organizations/individuals) can make one-time or recurring endowment donations without advertising requirements
- FR33: Sponsor donations can go to: General student fund, Specific students, or Scholarship pools
- FR34: Sponsors receive public recognition (unless anonymous) in platform "Sponsors" page
- FR35: Sponsor donations do NOT unlock loyalty advertising access (pure philanthropy model)

**Corporate Endowments (Loyalty Advertising Exchange):**
- FR36: Corporations create endowment-backed loyalty subscription programs (e.g., "Colgate Student Rewards - 20% off")
- FR37: Corporate endowment contributions go to general student fund OR can be allocated to scholarship pools
- FR38: Platform displays corporate loyalty programs to all users with clear description of benefits and endowment contribution amounts
- FR39: **Students opt-in to corporate loyalty programs** → **Unlocks PREMIUM tier** (privacy features + discount access)
- FR40: PREMIUM tier students receive corporate discount codes, coupons, and offers via email and in-platform notifications
- FR41: PREMIUM tier students see corporate sponsor advertisements in designated platform areas (story feed, sidebar, dashboard)
- FR42: Corporate ads display "Sponsored by [Corporation] Endowment" disclosure
- FR43: Students can manage their loyalty subscriptions (view active programs, unsubscribe from specific corporations)
- FR44: Unsubscribing from ALL corporate loyalty programs → Downgrades to FREE tier (privacy features disabled, stories become public)
- FR45: Corporations can manage loyalty campaigns (edit offers, view subscriber counts, track engagement metrics)
- FR46: System tracks total corporate endowment contributions per sponsor

**Admin Moderation & Controls:**
- FR47: Platform administrators can review all corporate/sponsor applications before approval
- FR48: Administrators can suspend or permanently block corporations/sponsors for policy violations
- FR49: Blocked corporations lose all advertising access and loyalty program visibility
- FR50: Administrators can review corporate ad content and loyalty program descriptions for appropriateness
- FR51: System logs all admin moderation actions (approvals, suspensions, blocks) with timestamps and reasons
- FR52: Administrators receive alerts when corporations/sponsors are flagged by students or moderators

**Tombstone & Anonymous Donations:**
- FR53: Donors can contribute anonymously or as "In Memory of [Name]" tombstone donations
- FR54: Tombstone donations display memorial name publicly (e.g., "In Memory of Jane Doe")
- FR55: Anonymous donations display as "Anonymous Donor" with contribution amount (or fully hidden based on donor preference)
- FR56: Anonymous/Tombstone donors receive tax receipts privately via email
- FR57: Anonymous donors can choose to reveal their identity later or remain permanently anonymous

**Endowment Transparency & Allocation:**
- FR58: Platform displays total endowment contributions by category (Family-Community, Corporations, Sponsors, Tombstone/Anonymous)
- FR59: Public "Endowment Dashboard" shows aggregate funding sources and total $ raised without revealing individual student financial details
- FR60: Students can see their own endowment sources (family-community contributions, applicable corporate programs, sponsor allocations)
- FR61: **Students in need can opt-in to "Community Support Pool"** to receive general fund allocations from sponsors and corporate endowments
- FR62: Platform administrators can allocate general fund contributions to students in Community Support Pool based on need criteria

**Content Storage & Media:**
- FR63: System stores story content and metadata in Xano database
- FR64: Users can upload images and videos delivered via Bunny.net CDN
- FR65: System enforces media upload limits to control costs

**Moderation Tools:**
- FR66: Platform maintains moderation queue for flagged content
- FR67: Moderators can assign moderation tasks and track resolution status
- FR68: System logs all moderation actions for audit trail

**Private Group Pages:**
- FR69: Users can create groups with name, description, privacy level (Public, Private, Secret), and avatar/cover image
- FR70: Group creators become "Group Admins" with management permissions
- FR71: Group admins can assign additional admins or moderators from member list
- FR72: Group types supported: Class, Family, Peer Group, Cohort, Club/Organization, Custom
- FR73: Groups have unique URLs: `/groups/[group-slug]`
- FR74: Public groups: Users can browse and request to join (admin approval required)
- FR75: Private groups: Users can request to join if they discover the group (admin approval required)
- FR76: Secret groups: Users can only join via direct invitation from admin
- FR77: Group admins can invite users via email or platform username
- FR78: Members can leave groups voluntarily (except group admins must transfer ownership first)
- FR79: Group admins can remove members from group
- FR80: Members can publish stories to group (visible only to group members)
- FR81: Group feed displays all group stories chronologically
- FR82: Members can comment on group stories (threaded comments)
- FR83: Group admins can pin important posts to top of feed
- FR84: Group activity feed shows: new posts, new members, comments, group announcements
- FR85: Public groups: Content visible to all platform users, searchable
- FR86: Private groups: Content visible only to members, group discoverable but content hidden
- FR87: Secret groups: Not searchable, not listed in group directory, invitation-only
- FR88: Group admins can change privacy level (with member notification)
- FR89: Group page displays: group name, description, member count, recent posts, member list
- FR90: Group navigation tabs: Feed, Members, About, Settings (admins only)
- FR91: "My Groups" page lists all groups user is member of with unread activity indicators
- FR92: Group directory (`/groups`) lists public and private groups (secret groups not listed)
- FR93: Groups can enable "Group Endowment Pool" for collective fundraising (optional)
- FR94: Family-community members can contribute to group endowment pools
- FR95: Group funds tracked separately and distributed to group members based on need criteria
- FR96: Group endowment total displayed on group page (if group opts to make public)

**Group Notifications:**
- FR97: Members receive notifications for: new group posts, comments on posts they've engaged with, membership approvals
- FR98: Group admins receive notifications for: join requests, flagged content, member reports
- FR99: Users can customize notification preferences per group (mute, daily digest, real-time)

### Non-Functional Requirements

**Business Model:**
- NFR1: **Freemium model constraint**: Privacy features are ONLY available to PREMIUM tier (corporate ad opt-in) users
- NFR2: Platform must clearly communicate tier differences during onboarding
- NFR3: Tier transitions (FREE ↔ PREMIUM) must be instant and non-disruptive

**Performance:**
- NFR4: Page load time must be <2 seconds at P95
- NFR5: Time to Interactive (TTI) must be <3 seconds
- NFR6: Platform must achieve Lighthouse score of 90+ for Performance, Accessibility, Best Practices
- NFR7: Cumulative Layout Shift (CLS) must be <0.1

**Cost & Scalability:**
- NFR8: Operational costs must remain under $200/month through year one (excluding payment processing fees)
- NFR9: Payment processing fees for family endowments must be minimized (target: <1% for ACH transactions)
- NFR10: Platform must scale to support 1000+ users without infrastructure cost increase >50%

**Security & Compliance:**
- NFR11: All data transmission must use HTTPS encryption
- NFR12: Platform must comply with FERPA regulations for student data privacy
- NFR13: Payment processing must be PCI-DSS compliant (handled by Stripe)
- NFR14: System must maintain audit logs for all financial transactions and moderation actions
- NFR15: Corporate sponsor access to student data (email for loyalty programs) requires explicit opt-in consent
- NFR16: Students must be able to export or delete their data upon request (GDPR-style right)

**Availability & Reliability:**
- NFR17: Platform uptime must be 99.5%+
- NFR18: Financial transaction failures must trigger immediate alerts and retry mechanisms
- NFR19: System must gracefully degrade if third-party services (Auth0, permit.io, Stripe) are unavailable

**Accessibility:**
- NFR20: Platform must meet WCAG 2.1 AA accessibility standards
- NFR21: All interactive elements must be keyboard navigable

**Browser Support:**
- NFR22: Platform must support last 2 versions of Chrome, Firefox, Safari, and Edge

---

## User Interface Design Goals

### Overall UX Vision

The USC Story Generator Platform provides a **modern, clean, content-first interface** that balances storytelling with community engagement. The design prioritizes **readability for long-form content**, **intuitive navigation**, and **transparent communication of tier benefits** (FREE vs PREMIUM). The platform must feel **student-owned and student-editable**, avoiding institutional rigidity while maintaining professionalism suitable for a university environment.

The UX must clearly differentiate between **FREE tier** (public-only publishing) and **PREMIUM tier** (privacy controls + corporate loyalty access) without creating stigma for FREE users. Corporate advertising should be **tasteful, clearly disclosed, and non-intrusive**—integrated as native content rather than disruptive banners.

### Key Interaction Paradigms

1. **Tiered Onboarding Flow**
   - New users see tier comparison during registration (FREE vs PREMIUM benefits)
   - Clear call-to-action: "Unlock privacy features by joining corporate loyalty programs"
   - No pressure—FREE tier is fully functional for public storytelling

2. **Story-Centric Navigation**
   - Homepage features story feed (chronological or curated)
   - User dashboard as secondary navigation hub
   - Story creation is primary action (prominent "New Story" button)

3. **Privacy Controls as Premium Feature**
   - FREE tier: Simple "Publish" button (public by default)
   - PREMIUM tier: "Publish" with privacy dropdown (public, USC-only, groups, private)
   - Visual indicators show story visibility status (lock icon, globe icon, etc.)

4. **Corporate Loyalty Integration**
   - Dedicated "Corporate Partners" section in dashboard
   - In-feed sponsored content labeled "Sponsored by [Corporation] - Endowment Partner"
   - Loyalty discount codes delivered via notifications and email

5. **Endowment Transparency**
   - Public "Endowment Dashboard" shows aggregate funding sources
   - Students see personalized endowment summary (family contributions, corporate sponsors, allocated donations)
   - Clear visual distinction between donation types (family, corporate, sponsor, tombstone/anonymous)

### Core Screens and Views

**Public-Facing:**
1. **Homepage / Story Feed** - Chronological or curated story list with corporate sponsored content
2. **Story Detail Page** - Long-form reading experience with commenting (public or restricted based on tier)
3. **Login/Registration** - Auth0 SSO integration with tier selection
4. **Endowment Dashboard (Public)** - Aggregate funding transparency page

**Authenticated User:**
5. **User Dashboard** - Role-based view (FREE vs PREMIUM)
   - FREE: My stories (drafts, published public), basic activity
   - PREMIUM: My stories with privacy management, comment moderation queue, group memberships, corporate loyalty subscriptions
6. **Story Editor** - Rich text editor with preview (Webflow-styled WYSIWYG)
7. **Privacy Settings** (PREMIUM only) - Manage story visibility, comment permissions, group invitations
8. **Corporate Loyalty Marketplace** - Browse and subscribe to corporate loyalty programs
9. **Endowment Summary (Personal)** - View family contributions, corporate sponsors, sponsor allocations
10. **Group Pages** - Group feed, member list, settings (for private groups)
11. **Group Directory** - Browse and discover public/private groups

**Family Member:**
12. **Family Endowment Portal** - Set up recurring tuition payments, view contribution history

**Corporate Sponsor:**
13. **Corporate Dashboard** - Manage loyalty campaigns, view subscriber counts, track engagement

**Platform Administrator:**
14. **Admin Moderation Dashboard** - Review/approve/block corporate sponsors, moderate flagged content, view audit logs

### Accessibility: WCAG 2.1 AA

- All interactive elements must be keyboard navigable
- Color contrast ratios meet WCAG AA standards (4.5:1 for text)
- Alt text for all images
- ARIA labels for screen readers
- Focus indicators for all interactive elements
- Semantic HTML structure exported from Webflow

### Branding

- **Design System**: Webflow design components exported to 11ty templates
- **Styling**: Webflow-generated CSS (NO Tailwind dependency)
- **Typography**: University-appropriate fonts (clean, readable serif or sans-serif for long-form content)
- **Color Palette**: USC brand colors (garnet and black as primary) with neutral backgrounds for readability
- **Tone**: Modern, student-friendly, professional but not corporate
- **Corporate Sponsor Branding**: Sponsors can use their logos in loyalty program listings and sponsored content (within platform design guidelines)

### Target Device and Platforms: Web Responsive

- **Desktop-first design** for long-form reading and story creation
- **Mobile-responsive** for reading and lightweight interactions (commenting, browsing loyalty programs)
- **No native mobile apps** in MVP (web-first approach)
- **Supported Browsers**: Last 2 versions of Chrome, Firefox, Safari, Edge

---

## Technical Assumptions

### Repository Structure: Monorepo

**Decision:** Single monorepo for the USC Story Generator Platform

**Rationale:**
- Simplifies deployment and version management for JAMstack architecture
- All frontend code (11ty templates, Webflow exports, static assets) in one repository
- Configuration files for integrations (Auth0, Xano, permit.io, Stripe, Bunny.net) centralized
- GitOps workflow (GitHub → Netlify) easier with single repo
- Small team size makes monorepo management straightforward

**Structure:**
```
usc-story-generator/
├── src/                    # 11ty source files
│   ├── _includes/          # Webflow-exported templates
│   ├── stories/            # Story content (markdown/JSON)
│   ├── styles/             # Webflow-generated CSS
│   └── scripts/            # Client-side JavaScript
├── functions/              # Netlify serverless functions
│   ├── stripe-webhooks/    # Payment processing
│   ├── xano-proxy/         # API proxying
│   └── permit-io-checks/   # Authorization checks
├── .env.example            # Environment variable template
├── netlify.toml            # Netlify configuration
└── package.json            # Dependencies
```

### Service Architecture: JAMstack (Static + API + Serverless)

**Architecture Pattern:** Decoupled JAMstack with serverless edge functions

**Components:**

1. **Static Frontend (Eleventy 11ty)**
   - Pre-rendered HTML pages for stories and public content
   - Webflow → 11ty conversion pipeline for design updates
   - Client-side JavaScript for dynamic interactions (commenting, dashboard updates)
   - Build-time content generation from Xano API

2. **API Backend (Xano)**
   - Headless CMS for content storage (stories, comments, user data)
   - REST/GraphQL APIs for CRUD operations
   - User profiles, story metadata, endowment tracking
   - Webhook integration for real-time updates

3. **Authentication & Authorization (Auth0 + permit.io)**
   - Auth0: SSO, identity management, session handling
   - permit.io: Fine-grained ABAC policies for tier-based access (FREE vs PREMIUM)
   - Authorization checks run server-side via Netlify Functions

4. **Payment Processing (Stripe + Plaid)**
   - Stripe ACH for family-community endowments and sponsor donations
   - Plaid for bank account verification (Venmo-like UX)
   - Stripe webhooks handled via Netlify Functions
   - PCI-DSS compliance handled by Stripe

5. **Media Delivery (Bunny.net CDN)**
   - Image and video storage + CDN delivery
   - Direct uploads from client to Bunny.net (presigned URLs)
   - Cost-optimized CDN to avoid egress fees

6. **Serverless Functions (Netlify Functions)**
   - Stripe webhook handlers (payment confirmations, subscription updates)
   - permit.io authorization checks (avoid exposing policies client-side)
   - Xano API proxying (for sensitive operations)
   - Email notifications (comment alerts, endowment receipts)

### Testing Requirements: Unit + Integration + Manual E2E

**Testing Strategy:**

1. **Unit Testing**
   - Netlify Functions (payment processing, authorization checks)
   - Client-side JavaScript utilities
   - permit.io policy logic (test ABAC rules)
   - Coverage target: 70%+ for critical business logic

2. **Integration Testing**
   - Auth0 login flow (SSO, user registration)
   - Xano API integration (CRUD operations)
   - Stripe payment processing (use Stripe test mode)
   - permit.io authorization checks (tier upgrades/downgrades)
   - Bunny.net media uploads

3. **End-to-End Testing (Manual for MVP)**
   - Story creation and publishing (FREE vs PREMIUM tiers)
   - Comment moderation workflow
   - Endowment contribution flow (family-community, sponsor, corporate)
   - Tier upgrade (opt-in to corporate loyalty → unlock PREMIUM)
   - Admin moderation actions (block corporate sponsor)
   - No automated E2E for MVP (add Playwright/Cypress in Phase 2)

4. **Accessibility Testing**
   - Manual WCAG 2.1 AA compliance checks
   - Keyboard navigation testing
   - Screen reader testing (NVDA/JAWS)
   - Lighthouse accessibility audits (target: 90+ score)

**Testing Tools:**
- **Unit/Integration**: Jest or Vitest
- **Stripe Testing**: Stripe CLI + test mode
- **Auth0 Testing**: Auth0 test tenant
- **permit.io Testing**: permit.io sandbox environment
- **Accessibility**: Lighthouse, axe DevTools, manual testing

### Additional Technical Assumptions and Requests

**Frontend Technologies:**
- **Static Site Generator**: Eleventy (11ty) v3.1.2
- **Design System**: Webflow-exported templates and components
- **Styling**: Webflow-generated CSS (NO Tailwind dependency)
- **Build Tool**: Native 11ty build pipeline (no Vite/Webpack for MVP)
- **Client-side JS**: Vanilla JavaScript or lightweight library (Alpine.js if needed for reactivity)
- **Forms**: HTML forms with POST to Xano or Netlify Functions

**Backend & APIs:**
- **Headless CMS/Database**: Xano (managed backend)
- **API Style**: REST (Xano REST APIs)
- **Real-time Updates**: Xano webhooks → Netlify rebuild (not true real-time, acceptable for MVP)

**Authentication & Authorization:**
- **Identity Provider**: Auth0 (SSO, MFA optional)
- **Authorization Engine**: permit.io (ABAC policies for tier-based access)
- **Session Management**: Auth0 sessions with JWT tokens
- **User Roles**: Student, Family, Instructor, Community, Admin, Corporate Sponsor

**Payment Processing:**
- **Payment Gateway**: Stripe
- **Payment Methods**:
  - ACH bank transfers (preferred for family-community endowments)
  - Credit/debit cards (fallback for one-time donations)
- **Bank Verification**: Plaid integration for instant bank account verification
- **Recurring Payments**: Stripe Subscriptions API
- **Fee Optimization**: ACH transfers (0.8% capped at $5) instead of credit cards (2.9% + $0.30)
- **Tax Receipts**: Automated email via Stripe invoices + custom Netlify Function

**Media & CDN:**
- **CDN Provider**: Bunny.net (cost-optimized, avoid AWS egress fees)
- **Media Storage**: Bunny.net Storage
- **Upload Strategy**: Client-side direct uploads with presigned URLs (reduce server processing)
- **Supported Formats**: Images (JPG, PNG, WebP), Videos (MP4, WebM)
- **Upload Limits**: 5MB per image, 50MB per video (configurable)

**Hosting & Deployment:**
- **Hosting**: Netlify (static site hosting + serverless functions)
- **Deployment**: GitOps workflow (push to GitHub → Netlify auto-build → deploy)
- **Build Time**: Target <5 minutes for full site rebuild (11ty incremental builds if needed)
- **Environment Variables**: Stored in Netlify (Auth0, Xano, permit.io, Stripe, Bunny.net credentials)
- **Monitoring**: Netlify Analytics (included), consider adding Sentry for error tracking

**Security & Compliance:**
- **HTTPS Everywhere**: Netlify provides SSL certificates via Let's Encrypt
- **FERPA Compliance**: Student data privacy (no sharing with third parties without consent)
- **PCI-DSS Compliance**: Handled by Stripe (no card data touches our servers)
- **GDPR-style Rights**: Students can export or delete their data on request
- **Content Security Policy (CSP)**: Configure headers to prevent XSS
- **Input Sanitization**: Sanitize all user-generated content (stories, comments) to prevent injection attacks
- **Audit Logs**: Track all financial transactions, moderation actions, tier changes (stored in Xano)

**Performance Targets:**
- **Page Load Time**: <2 seconds (P95) via static site generation + CDN
- **Time to Interactive (TTI)**: <3 seconds
- **Lighthouse Score**: 90+ for Performance, Accessibility, Best Practices
- **Build Performance**: 11ty can handle 1000+ pages; implement incremental builds if needed

**Cost Constraints:**
- **Operational Budget**: <$200/month for MVP (excluding payment processing fees)
- **Service Estimates**:
  - Netlify: $0 (free tier, 100GB bandwidth)
  - Xano: ~$25-50/month (starter plan)
  - Auth0: $0 (free tier, up to 7,000 users)
  - permit.io: $0-50/month (check pricing, may have free tier)
  - Stripe: Pay-per-transaction (0.8% for ACH, 2.9% + $0.30 for cards)
  - Bunny.net: ~$10-30/month (usage-based, very cost-effective)
  - Domain + DNS: ~$15/year
  - **Total estimated**: $50-130/month (well under $200 budget)

---

## Epic List

The following epics are **logically sequential** and each delivers **significant, end-to-end functionality**. Epic 1 establishes foundational infrastructure while delivering initial value (basic storytelling). Each subsequent epic builds upon previous functionality.

### Epic 1: Foundation, Authentication & Public Story Publishing

**Goal:** Establish project infrastructure (11ty, Netlify, Auth0, Xano) and enable basic public storytelling with user registration and authentication.

**Delivered Value:**
- Users can register, log in, and authenticate via Auth0
- Students can write, draft, and publish public stories
- Homepage displays story feed
- Basic user roles (Student, Family, Instructor, Community, Admin)
- Webflow → 11ty design conversion pipeline operational
- GitOps deployment (GitHub → Netlify) functional

---

### Epic 2: Endowment System & Payment Processing

**Goal:** Enable community-driven financial support through family-community endowments, sponsor donations, and corporate contribution infrastructure.

**Delivered Value:**
- Family-community members can set up recurring tuition payments via Stripe ACH
- Sponsors can make one-time or recurring donations
- Corporations can register and create endowment profiles
- Payment processing via Stripe + Plaid (bank verification)
- Endowment tracking and contribution history
- Tax receipts generated automatically
- Public "Endowment Dashboard" shows aggregate funding

---

### Epic 3: Freemium Tiers, Privacy Controls, Corporate Loyalty & Private Groups

**Goal:** Implement the freemium business model with FREE/PREMIUM tiers, corporate loyalty subscription programs, privacy features unlocked by advertising opt-in, and private group infrastructure.

**Delivered Value:**
- FREE tier: Public-only story publishing
- PREMIUM tier: Privacy controls unlocked by corporate loyalty opt-in
- Corporate sponsors create loyalty subscription programs (discount offers)
- Students opt-in to corporate programs → unlock PREMIUM features
- Corporate advertising display (sponsored content, sidebar ads)
- Story visibility controls (public, USC-only, groups, private) for PREMIUM users
- Private group creation and management (classes, families, peer circles)
- permit.io ABAC integration for tier-based access control
- Tier upgrade/downgrade flows

---

### Epic 4: Commenting, Moderation, Personalized Dashboards & Group Community Features

**Goal:** Enable community engagement through threaded commenting, moderation tools, personalized user experiences via role-based dashboards, and complete private group features.

**Delivered Value:**
- Threaded commenting on stories (public for FREE tier, controlled by author for PREMIUM tier)
- Comment moderation tools (flagging, review queue, hide/delete)
- Notifications for comment activity
- Personalized dashboards (FREE vs PREMIUM, role-based)
- Group feeds, discovery, and settings
- Optional group endowment pools

---

### Epic 5: Admin Governance & Platform Management

**Goal:** Provide administrative tools for platform oversight, corporate sponsor approval/blocking, content moderation, and audit logging.

**Delivered Value:**
- Admin moderation dashboard
- Corporate sponsor approval/rejection workflow
- Block or suspend bad actors (corporations, users)
- Platform-wide content moderation (review flagged stories and comments)
- Audit logs for financial transactions, moderation actions, tier changes
- Platform analytics (user counts, story counts, endowment totals)
- Admin controls for allocating general fund to students in Community Support Pool

---

## Epic Details

### Epic 1: Foundation, Authentication & Public Story Publishing

**Expanded Goal:** Establish the complete technical foundation for the USC Story Generator Platform, including project setup (Eleventy, Netlify, Xano, GitHub), user authentication via Auth0 SSO, and basic public storytelling capabilities. This epic delivers a functional MVP where users can register, authenticate, create stories in a rich text editor, save drafts, publish stories publicly, and browse published content via a homepage feed. All foundational infrastructure (build pipeline, deployment, database, authentication) must be operational and ready for subsequent epics to build upon.

**Stories:** 7 stories covering project setup, Auth0 integration, user roles, story editor, publishing, homepage feed, and story detail pages.

*(Full story details available in complete PRD - see Epic Details section)*

---

### Epic 2: Endowment System & Payment Processing

**Expanded Goal:** Build the complete endowment infrastructure that enables community-driven financial support for students facing funding challenges. Implement Stripe + Plaid integration for low-fee payment processing, create workflows for family-community members to set up recurring tuition payments, allow sponsors to make philanthropic donations, enable corporate registration and endowment profile creation, and provide transparent tracking of all contributions via endowment dashboards. This epic operationalizes the core value proposition of addressing federal funding loss through diversified community support.

**Stories:** 8 stories covering Stripe/Plaid setup, family-community endowment flows, recurring payment management, sponsor donations, corporate registration, endowment tracking, tax receipts, and public dashboard.

*(Full story details available in complete PRD - see Epic Details section)*

---

### Epic 3: Freemium Tiers, Privacy Controls, Corporate Loyalty & Private Groups

**Expanded Goal:** Implement the freemium business model that differentiates FREE (public-only) from PREMIUM (privacy-enabled) tiers, integrate permit.io for attribute-based access control (ABAC), enable corporate sponsors to create loyalty subscription programs, and build the tier upgrade mechanism where students opt-in to corporate advertising to unlock PREMIUM features including privacy controls and private group access. Additionally, establish private group infrastructure allowing students, classes, families, and peer groups to create dedicated community spaces with granular privacy controls.

**Stories:** 10 stories covering tier system implementation, permit.io ABAC, corporate loyalty programs, tier upgrades, privacy controls, corporate advertising, group creation, membership management, publishing to groups, and tier downgrades.

*(Full story details available in complete PRD - see Epic Details section)*

---

### Epic 4: Commenting, Moderation, Personalized Dashboards & Group Community Features

**Expanded Goal:** Enable rich community engagement through threaded commenting on stories with tier-based permissions (FREE tier = public commenting only, PREMIUM tier = author-controlled comment permissions), provide moderation tools for flagging and reviewing inappropriate content, build personalized role-based dashboards that adapt to user tier and role (Student, Family, Instructor, Corporate, Admin), and complete the private group experience with group feeds, discovery, settings, and optional group endowment pools.

**Stories:** 11 stories covering threaded commenting, comment permissions, flagging/moderation, notifications, basic/premium dashboards, role-based dashboards, group feeds, discovery, settings, and endowment pools.

*(Full story details available in complete PRD - see Epic Details section)*

---

### Epic 5: Admin Governance & Platform Management

**Expanded Goal:** Provide comprehensive administrative tools for platform oversight, including corporate sponsor approval/blocking workflows, platform-wide content moderation capabilities, user management (suspend/ban bad actors), audit logging for financial transactions and moderation actions, platform analytics dashboard, and Community Support Pool fund allocation to students in need.

**Stories:** 6 stories covering admin dashboard, corporate approval workflows, blocking/suspending users and sponsors, platform-wide moderation, audit logging, and community support pool allocation.

*(Full story details available in complete PRD - see Epic Details section)*

---

## Next Steps

### For UX Expert & Information Architect

Please design the complete user experience, information architecture, and interface specifications based on this PRD. Your deliverables should include:

1. **Information Architecture** - Complete sitemap, navigation hierarchy, content organization
2. **User Flows** - Key journeys (onboarding, story publishing, tier upgrade, endowment contribution, group management, moderation)
3. **Wireframes** - Low-fidelity wireframes for critical screens
4. **Interaction Patterns** - Tier differentiation, privacy controls, group membership, commenting, corporate advertising
5. **Content Strategy** - Microcopy, empty states, error messages, community guidelines

**Critical Design Constraints:**
- Webflow design components (NO Tailwind CSS)
- WCAG 2.1 AA accessibility compliance
- Web responsive (desktop-first, mobile-friendly)
- <2 second page loads (static generation)

**Key UX Challenges:**
- Freemium tier communication without stigmatizing FREE users
- Privacy controls clarity and discoverability
- Group discovery and management
- Endowment transparency vs student privacy
- Corporate advertising integration (tasteful, clearly disclosed)
- Multi-role user experiences

---

### For Technical Architect

Please design the technical architecture, data models, API specifications, and implementation plan based on this PRD. Your deliverables should include:

1. **System Architecture Diagram** - High-level architecture, component diagram, deployment architecture
2. **Data Models & Schema** - Xano database schema for all entities (users, stories, comments, groups, endowments, etc.)
3. **API Specifications** - Xano REST API endpoints and contracts
4. **Authorization & Access Control** - permit.io ABAC policies
5. **Payment Processing Architecture** - Stripe + Plaid integration flows, webhook handling
6. **Build & Deployment Pipeline** - 11ty build process, GitOps workflow, incremental builds
7. **Security & Compliance Architecture** - HTTPS, FERPA, PCI-DSS, CSP, input sanitization
8. **Performance Optimization Plan** - Static generation, CDN strategy, caching, database optimization

**Technology Stack (Locked In):**
- **Frontend**: Eleventy (11ty) v3.1.2, Webflow-exported templates
- **Backend**: Xano (headless CMS/API)
- **Auth**: Auth0 + permit.io
- **Payments**: Stripe + Plaid
- **Hosting**: Netlify (static + serverless functions)
- **CDN**: Bunny.net

**Performance Targets:**
- Page load: <2s (P95)
- Time to Interactive: <3s
- Lighthouse score: 90+
- Operational costs: <$200/month
- Uptime: 99.5%+

**Critical Technical Challenges:**
- Tier upgrade state management across Auth0, Xano, permit.io
- permit.io performance and caching
- Static generation at scale (incremental builds)
- Group content access control (static vs dynamic)
- Payment webhook reliability
- Real-time vs static content balance

---

## Document Status

This PRD is **ready for stakeholder review**. Please provide feedback on:

1. **Business Model Validation** - Is the freemium tier + endowment model aligned with stakeholder expectations?
2. **Corporate Partnership Opportunities** - Are there specific corporations to target for initial loyalty programs?
3. **Endowment Goals** - Is the $50K target realistic for first 6 months?
4. **Feature Prioritization** - Are there any MVP features that should be moved to Phase 2, or Phase 2 features that should be in MVP?
5. **Compliance & Legal** - Are there additional FERPA, tax, or legal considerations for endowment handling?
6. **Timeline Feasibility** - Is the 6-month MVP timeline achievable with available resources?

**Next Steps After Stakeholder Approval:**
1. UX/IA team begins design work
2. Technical Architect creates architecture documentation
3. Development team begins Epic 1 (Foundation)
4. Corporate outreach team begins identifying potential loyalty program partners
5. Legal/Compliance review of endowment handling and tax receipt processes

---

**For questions or clarifications, please contact the Product Owner.**

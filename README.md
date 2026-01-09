# USC Story Generator Platform

**Modern student storytelling platform with community-driven endowments addressing federal funding loss**

[![Status](https://img.shields.io/badge/Status-PRD%20Complete-brightgreen)](docs/prd.md)
[![Timeline](https://img.shields.io/badge/Timeline-6%20Months%20to%20MVP-blue)](docs/prd-presentation.md)
[![Budget](https://img.shields.io/badge/Budget-<$200%2Fmonth-orange)](docs/executive-summary.md)
[![Target](https://img.shields.io/badge/Endowment%20Target-$50K%20in%206mo-success)](docs/prd.md)

---

## 🚀 Live Demo

**Platform Prototype:** [usc-story.netlify.app](https://usc-story.netlify.app/)
**CMS Admin:** [usc-story.netlify.app/admin](https://usc-story.netlify.app/admin)

---

## 📋 Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Key Features](#key-features)
- [Documentation](#documentation)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Roadmap](#roadmap)
- [Success Metrics](#success-metrics)
- [BMad Framework](#bmad-framework)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## Overview

The **USC Story Generator Platform** is a dual-purpose web application that addresses federal funding loss through community-driven endowments while providing students with a modern, long-form storytelling platform to replace the outdated USC website.

### What Makes This Unique

This is the **only platform that combines**:
- ✅ Modern storytelling with privacy controls
- ✅ Community-driven financial support for students
- ✅ Ethical corporate partnerships via freemium model
- ✅ AI-powered development for social good

### AI for Greater Good

This platform demonstrates how **AI and technology can serve a social mission**. The project itself was collaboratively developed with AI assistance (Claude as Product Owner Agent via BMad framework), showcasing how AI can accelerate solutions to real-world social challenges like student financial hardship and institutional inequity.

---

## The Problem

### 1. Federal Funding Crisis
- Federal funding cuts threaten student financial stability at USC
- No modern platform for community-driven tuition support
- Students lack tools to receive grassroots financial assistance from families, churches, and local community groups

### 2. Outdated Communication Infrastructure
- USC website is extremely outdated and cannot be edited by students
- Students resort to fragmented social media (Instagram, Twitter, TikTok) unsuitable for long-form storytelling
- No university-tailored platform with proper access controls and moderation

---

## The Solution

### Three-Pillar Approach

#### 1️⃣ Community-Driven Endowments

Three revenue streams targeting **$50K in first 6 months**:

| Stream | Contributors | Purpose | Target |
|--------|--------------|---------|--------|
| **Family-Community** | Families, friends, churches, community groups | Direct tuition payments to specific students (Stripe ACH, <1% fees) | $20K |
| **Sponsors** | Foundations, alumni, local businesses | Philanthropic donations without advertising requirements | $15K |
| **Corporates** | Companies (Colgate, restaurants, tech) | Endowment contributions in exchange for ethical loyalty advertising | $15K (5+ partners) |

#### 2️⃣ Modern Storytelling Platform

- **JAMstack Architecture:** Eleventy (11ty) + Xano + Netlify for performance (<2s page loads, 99.5%+ uptime)
- **Rich Text Editor:** Webflow-designed components for professional content creation
- **Private Groups:** Classes, families, peer circles with granular privacy controls
- **Sophisticated Moderation:** Flagging, review queues, admin governance tools

#### 3️⃣ Freemium Business Model

**FREE Tier:**
- Public story publishing
- Basic dashboard
- Public commenting
- Browse groups and loyalty marketplace

**PREMIUM Tier** (Unlocked by corporate loyalty opt-in):
- Privacy controls (public, USC-only, groups, private)
- Create and manage private groups
- Enhanced dashboard with moderation tools
- Corporate loyalty discounts (20% off Colgate, local restaurants, etc.)

**Value Exchange:** Students who want privacy features opt-in to receive corporate advertising → unlock PREMIUM features + receive discount codes from sponsor companies.

---

## Key Features

### Collaborative Editing
- 🤝 **Real-time co-authoring** - Multiple writers can edit simultaneously with live cursor presence
- 👀 **Presence awareness** - See who's viewing and editing in real-time
- 🔄 **Conflict-free merging** - Automatic resolution of concurrent edits (CRDT-based)
- 📝 **Inline comments** - Leave feedback and suggestions directly on content
- ✅ **Suggested edits** - Propose changes for author review
- 🕐 **Version history** - Track all changes with ability to view diffs and restore previous versions
- 🔔 **Activity notifications** - Get notified when collaborators make changes

### Document Management
- 📁 **Organized workspace** - Folders, collections, and tags for content organization
- 📋 **Draft management** - Auto-save drafts with manual save points
- 🔍 **Full-text search** - Search across all documents by content, title, or tags
- 📊 **Document status** - Draft → In Review → Published workflow states
- 📥 **Import/Export** - Support for Markdown, HTML, JSON, and PDF formats
- 🗄️ **Archive system** - Soft-delete with restore capability
- 📈 **Analytics** - View counts, read time, and engagement metrics per document

### Privacy Controls
- 🔒 **Granular visibility settings**
  - **Public** - Anyone on the internet can view
  - **USC-only** - Visible to authenticated USC community members
  - **Groups** - Shared with specific groups only
  - **Private** - Only you and invited collaborators
- 🕵️ **Anonymous publishing** - Option to publish without author attribution
- 👥 **Collaborator permissions** - Viewer, Commenter, Editor, Admin roles
- 🔐 **Link-based sharing** - Password-protected links with optional expiration
- 🗑️ **Data ownership** - Export or permanently delete your content anytime
- 📜 **GDPR/FERPA compliant** - Full control over personal and educational data

### Social Sharing
- 🚀 **One-click sharing** - Share to Twitter/X, Facebook, LinkedIn, WhatsApp, Email
- 🖼️ **Rich previews** - Auto-generated Open Graph images for beautiful social cards
- 📎 **Custom share links** - Branded short URLs with click tracking
- 📱 **QR code generation** - Instant QR codes for print and mobile sharing
- 💬 **Reader engagement**
  - Reactions (like, love, insightful, celebrate)
  - Threaded comment discussions
  - Follow authors for updates
  - Bookmark and reading lists
- 📢 **Embed anywhere** - Responsive embed codes for external websites
- 📊 **Share analytics** - Track which platforms drive the most engagement

### Core Publishing
- 📝 Rich text story editor with draft/publish workflow
- 🔒 Privacy controls (PREMIUM: public/USC-only/groups/private)
- 🚀 GitOps deployment (GitHub → Netlify)
- 📱 Responsive reading experience (desktop + mobile)

### Private Groups
- 👥 Create groups for classes, families, peer circles, clubs
- 🔐 Privacy levels: Public, Private, Secret
- 📬 Member invitations and join requests
- 💬 Group-specific story publishing and commenting
- 💰 Optional group endowment pools

### Authentication & Access Control
- 🔑 Auth0 SSO with role assignment (Student, Family, Instructor, Corporate, Admin)
- 🛡️ permit.io fine-grained ABAC policies for tier-based and role-based access
- ⚡ Instant tier upgrades when students opt-in to corporate loyalty programs

### Commenting & Moderation
- 💬 Threaded comments with author-controlled permissions (PREMIUM)
- 🚩 Flagging system and moderation queue
- 👮 Admin governance tools for platform oversight
- 📜 Community guidelines enforcement

### Endowment Infrastructure
- 💳 Stripe + Plaid integration for low-fee payments (ACH: 0.8% capped at $5)
- 🔄 Recurring payment management for contributors
- 🛒 Corporate loyalty marketplace for students
- 🧾 Automated tax receipt generation
- 🎯 Admin tools to allocate Community Support Pool funds

---

## Documentation

### Quick Start Documentation

| Document | Description | Read Time |
|----------|-------------|-----------|
| **[Executive Summary](docs/executive-summary.md)** | One-page overview with AI for Good narrative | 5-10 min |
| **[Stakeholder Presentation](docs/prd-presentation.md)** | 22-slide Swiss Style deck (no purple, non-glowy) | 15-20 min |
| **[Full PRD](docs/prd.md)** | Complete Product Requirements Document | 1-2 hours |
| **[Sitemap](docs/sitemap.md)** | Complete information architecture (100+ pages) | 30-45 min |

### Quick Share Versions

| Document | Description | Best For |
|----------|-------------|----------|
| **[Full Gist](docs/GIST.md)** | Comprehensive shareable overview | GitHub Gist, stakeholder emails |
| **[Short Gist](docs/GIST-SHORT.md)** | Condensed quick-share version | Team Slack, quick emails |
| **[Micro Gist](docs/GIST-MICRO.md)** | Bite-sized snippets for all channels | Social media, elevator pitches |

### Complete PRD Contents

- ✅ **99 Functional Requirements** (FR1-FR99)
- ✅ **22 Non-Functional Requirements** (NFR1-NFR22)
- ✅ **5 Epics** with detailed goals and deliverables
- ✅ **42+ User Stories** with acceptance criteria
- ✅ **Complete User Flows** for all personas
- ✅ **Technical Architecture** specifications
- ✅ **UX/IA Handoff Prompts** for design team
- ✅ **Technical Architect Prompts** for development team

---

## Tech Stack

### Frontend
- **Static Site Generator:** Eleventy (11ty) v3.1.2
- **Design System:** Webflow-exported templates and components
- **Styling:** Webflow-generated CSS (**NO Tailwind dependency**)
- **Build Tool:** Native 11ty build pipeline
- **Client-side JS:** Vanilla JavaScript / Alpine.js (if needed)
- **Rich Text Editor:** [Tiptap](https://tiptap.dev) v2.1.13 (ProseMirror-based WYSIWYG)

### Backend
- **Headless CMS:** Xano (managed database + REST APIs)
- **Real-time:** Xano WebSocket integration for live updates
- **Serverless Functions:** Netlify Functions for webhooks and authorization

### Integrations
- **Authentication:** Auth0 (SSO, identity management)
- **Authorization:** permit.io (ABAC policies for tier-based access control)
- **Payment Processing:** Stripe + Plaid (ACH bank transfers, low fees)
- **File Uploads:** [Uploadcare](https://uploadcare.com) (media uploads + CDN delivery)
- **Media CDN:** Bunny.net (cost-optimized delivery)
- **Hosting:** Netlify (static hosting + serverless + CI/CD)

### Architecture Pattern
**JAMstack:** Static frontend + API backend + Serverless edge functions

```
11ty (Static HTML) + Tiptap (Rich Text Editor)
  ↓
Netlify (Hosting + Functions)
  ↓
Xano (API + Database + Real-time)
  ↓
Auth0 (Authentication) + permit.io (Authorization)
  ↓
Stripe (Payments) + Uploadcare (Media Uploads) + Bunny.net (CDN)
```

---

## Project Structure

```
simple-app/
├── docs/                          # Complete documentation
│   ├── brief.md                   # Original project brief
│   ├── executive-summary.md       # One-page summary
│   ├── prd.md                     # Full PRD (99 FRs, 42+ stories)
│   ├── prd-presentation.md        # 22-slide stakeholder deck
│   ├── sitemap.md                 # Complete information architecture
│   ├── GIST.md                    # Full shareable gist
│   ├── GIST-SHORT.md              # Quick share version
│   └── GIST-MICRO.md              # Bite-sized snippets
│
├── usc-11ty/                      # Eleventy frontend (prototype)
│   ├── src/                       # 11ty source files
│   ├── _includes/                 # Webflow-exported templates
│   ├── styles/                    # Webflow-generated CSS
│   ├── functions/                 # Netlify serverless functions
│   ├── admin/                     # Decap CMS admin interface
│   ├── .env.example               # Environment variables template
│   ├── netlify.toml               # Netlify configuration
│   └── .eleventy.js               # Eleventy config
│
├── .bmad-core/                    # BMad framework core
│   ├── agents/                    # Agent persona definitions
│   ├── tasks/                     # Executable task workflows
│   ├── templates/                 # Document templates (PRD, architecture, etc.)
│   ├── checklists/                # Quality checklists
│   ├── workflows/                 # Pre-built agile workflows
│   ├── data/                      # Knowledge base & references
│   └── core-config.yaml           # Project configuration
│
├── .claude/                       # Claude Code integration
│   └── commands/BMad/             # BMad slash commands (/BMad:agents:po, etc.)
│
├── CLAUDE.md                      # Claude Code instructions
└── README.md                      # This file
```

---

## Getting Started

### Prerequisites

- Node.js >=20.0.0
- npm or yarn
- Git
- Accounts: Netlify, Xano, Auth0, Stripe, permit.io, Bunny.net

### Environment Variables

Copy `.env.example` to `.env` in `usc-11ty/` and configure:

```bash
# Auth0
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret

# Xano
XANO_API_URL=https://your-workspace.xano.io/api:v1
XANO_API_KEY=your-api-key

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plaid
PLAID_CLIENT_ID=your-client-id
PLAID_SECRET=your-secret

# permit.io
PERMIT_IO_API_KEY=your-api-key
PERMIT_IO_PDP_URL=https://cloudpdp.api.permit.io

# Bunny.net
BUNNY_STORAGE_API_KEY=your-api-key
BUNNY_CDN_URL=https://your-cdn.b-cdn.net
```

### Installation (Development)

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/simple-app.git
cd simple-app/usc-11ty

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Run development server
npm run dev

# Open browser to http://localhost:8080
# CMS Admin: http://localhost:8080/admin
```

### Build for Production

```bash
# Build static site
npm run build

# Preview production build
npm run preview

# Deploy to Netlify (via Git push)
git add .
git commit -m "Deploy to production"
git push origin main
```

---

## Roadmap

### 6-Month MVP Timeline

#### 📅 Epic 1: Foundation & Public Publishing (Months 1-2)
- ✅ Project setup (11ty, Netlify, Xano, Auth0)
- ✅ **Sprint 1:** Rich text editor (Tiptap) + media uploads (Uploadcare)
- ⚪ User authentication and role assignment
- ⚪ Homepage feed and story detail pages

#### 📅 Epic 2: Endowment System (Months 2-3)
- ⚪ Stripe + Plaid payment integration
- ⚪ Family-community endowment setup flows
- ⚪ Sponsor donation workflows
- ⚪ Corporate registration and profiles
- ⚪ Tax receipt generation and tracking

#### 📅 Epic 3: Freemium + Privacy + Groups (Months 3-4)
- ⚪ FREE vs PREMIUM tier implementation
- ⚪ Corporate loyalty program creation
- ⚪ permit.io ABAC integration
- ⚪ Story privacy controls
- ⚪ Private group creation and management

#### 📅 Epic 4: Community Engagement (Months 4-5)
- 🟡 **Sprint 2:** Threaded commenting system (Planned)
- ⚪ Moderation tools and flagging
- ⚪ Personalized dashboards (role-based)
- ⚪ Group feeds, discovery, and settings

#### 📅 Epic 5: Admin Governance (Months 5-6)
- ⚪ Corporate sponsor approval workflow
- ⚪ Platform-wide moderation dashboard
- ⚪ Audit logging for transactions and actions
- ⚪ Community Support Pool fund allocation

**Current Status:** ✅ PRD Complete | 🟡 Stakeholder Review Pending | ⚪ Development Not Started

### Future Enhancements

#### Collaborative Editing (Post-MVP)
- [ ] Real-time collaborative editing with Yjs + Hocuspocus
- [ ] Live cursor presence and user avatars
- [ ] Inline commenting and suggested edits
- [ ] Version history with visual diff viewer
- [ ] Conflict resolution UI for offline edits

#### Document Management (Post-MVP)
- [ ] Workspace dashboard with folders and collections
- [ ] Full-text search with filters (date, author, status, tags)
- [ ] Bulk operations (archive, tag, move)
- [ ] Document templates library
- [ ] Import from Google Docs, Notion, Medium

#### Social Sharing (Post-MVP)
- [ ] Auto-generated OG images with story thumbnails
- [ ] Share scheduling for optimal engagement times
- [ ] Reading lists and public bookmarks
- [ ] Author follow system with email digests
- [ ] Embed widget for external websites

---

## Success Metrics

### User Adoption (First 6 Months)
- 🎯 **500+ active students** within first semester
- 🎯 **60%+ PREMIUM tier adoption** (students opt-in to corporate loyalty)
- 🎯 **100+ published stories** in first 3 months
- 🎯 **80%+ student satisfaction** with platform usability

### Financial Goals
- 💰 **$50K+ endowment contributions** ($20K family-community, $15K sponsors, $15K corporate)
- 💰 **5+ corporate partners** with active loyalty programs
- 💰 **Operational costs <$200/month** (excluding payment processing fees)
- 💰 **Revenue neutrality** by end of year two

### Engagement Metrics
- 💬 **Average 5+ comments per story**
- 🔒 **80%+ users customize privacy settings** (PREMIUM)
- 🛡️ **95%+ moderation response** within 24 hours
- 🔄 **60%+ weekly active users** return monthly

### Platform Performance
- ⚡ **<2 second page loads** (P95)
- ⚡ **99.5%+ uptime**
- ⚡ **Lighthouse score 90+** (Performance, Accessibility, Best Practices)

---

## BMad Framework

This project was developed using the **BMad™ (Business Model Agile Development)** framework - an AI-powered multi-agent system for agile product development.

### Key Agents Used

| Agent | Role | Contribution |
|-------|------|--------------|
| **📊 Mary - Analyst** | Business Analysis | Original market research and project brief |
| **📝 Sarah - Product Owner** | Backlog Management | Complete PRD with 99 requirements and 42+ stories |
| **🏗️ Winston - Architect** | System Architecture | Technical architecture design (pending) |
| **🎨 Sally - UX Expert** | User Experience | UI/UX design and wireframes (pending) |
| **💻 James - Developer** | Implementation | Development execution (pending) |

### BMad Commands

Access BMad agents via Claude Code:

```bash
# Activate Product Owner (Sarah)
/BMad:agents:po

# Common PO commands (use * prefix)
*help                      # Show available commands
*create-story              # Create user story
*validate-story-draft      # Validate story against standards
*execute-checklist-po      # Run PO master checklist
```

### BMad Documentation

- **`.bmad-core/user-guide.md`** - Complete BMad user guide
- **`.bmad-core/data/bmad-kb.md`** - BMad knowledge base
- **`.bmad-core/templates/`** - PRD, architecture, and story templates

---

## Contributing

This is currently a **private development project** for USC. Contributions are limited to the core development team.

### For Team Members

1. **Review Documentation:**
   - Read [PRD](docs/prd.md) for complete requirements
   - Review [Sitemap](docs/sitemap.md) for information architecture
   - Check [Epic Details](docs/prd.md#epic-details) for user stories

2. **Development Workflow:**
   - Create feature branch: `git checkout -b feature/story-1.1`
   - Implement user story with acceptance criteria
   - Test locally: `npm run dev`
   - Submit PR with reference to story number
   - Code review by team lead
   - Merge to `main` after approval

3. **Coding Standards:**
   - Follow [CLAUDE.md](CLAUDE.md) guidelines
   - Use Webflow-exported CSS (NO Tailwind)
   - Maintain accessibility (WCAG 2.1 AA)
   - Write semantic HTML
   - Test on last 2 versions of Chrome, Firefox, Safari, Edge

---

## Testing

### Manual Testing (MVP)

```bash
# Run development server with live reload
cd usc-11ty
npm run dev

# Test user flows:
# - Registration and login (Auth0)
# - Story creation and publishing
# - Commenting and moderation
# - Group creation and membership
# - Endowment contribution flow
# - Tier upgrade (corporate loyalty opt-in)
```

### Accessibility Testing

```bash
# Install axe DevTools browser extension
# Run Lighthouse audit (target: 90+ score)
# Test keyboard navigation
# Test screen reader (NVDA/JAWS)
```

---

## Deployment

### Netlify Deployment (Automatic)

```bash
# Push to main branch triggers automatic deployment
git push origin main

# Netlify build settings:
# Build command: npm run build
# Publish directory: _site (or public)
# Node version: 20.x
```

### Environment Variables (Netlify)

Configure in Netlify dashboard:
- Site Settings → Environment Variables
- Add all variables from `.env.example`
- Use production API keys (not test mode)

---

## License

**Proprietary - University of South Carolina**

This project is proprietary software developed for the University of South Carolina. All rights reserved.

**Copyright © 2025 University of South Carolina. All rights reserved.**

---

## Contact

**Project Owner:** Product Owner (Sarah - BMad AI Agent)

**For Questions:**
- **Business Strategy:** Review [Executive Summary](docs/executive-summary.md)
- **Technical Implementation:** Review [Full PRD](docs/prd.md)
- **Corporate Partnerships:** Review [Presentation](docs/prd-presentation.md) (Slide 11)
- **Development:** Check [Sitemap](docs/sitemap.md) for architecture

**Repository Issues:** [GitHub Issues](https://github.com/YOUR-USERNAME/simple-app/issues)

---

## Acknowledgments

**Built with AI Assistance:**
This PRD and documentation were collaboratively developed with Claude (Anthropic) using the BMad framework, demonstrating how AI can accelerate solutions to real social challenges.

**Technology Partners:**
- [Netlify](https://netlify.com) - Hosting & Serverless
- [Xano](https://xano.com) - Headless CMS
- [Auth0](https://auth0.com) - Authentication
- [permit.io](https://permit.io) - Authorization
- [Stripe](https://stripe.com) - Payment Processing
- [Uploadcare](https://uploadcare.com) - Media Uploads & CDN
- [Bunny.net](https://bunny.net) - Media CDN
- [Eleventy](https://11ty.dev) - Static Site Generator
- [Tiptap](https://tiptap.dev) - Rich Text Editor

**Powered by BMad™ Core** - Business Model Agile Development Framework

---

## Status Badges

![PRD Complete](https://img.shields.io/badge/PRD-Complete-brightgreen)
![Timeline](https://img.shields.io/badge/Timeline-6%20Months-blue)
![Budget](https://img.shields.io/badge/Budget-<$200%2Fmo-orange)
![Target Users](https://img.shields.io/badge/Target%20Users-500%2B-success)
![Endowment Goal](https://img.shields.io/badge/Endowment%20Goal-$50K-yellow)
![License](https://img.shields.io/badge/License-Proprietary-red)

---

**USC Story Generator Platform v1.0**
**Built by students, for students, with community support**
**Powered by AI for social good 🌟**

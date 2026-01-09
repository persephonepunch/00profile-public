# USC Story Generator Platform - Project Overview

**Dual-Purpose Platform:** Modern Storytelling + Community-Driven Financial Support

**Status:** PRD Complete | Ready for Stakeholder Review | Version 1.0

---

## 🚀 Live Prototypes

**Platform Prototype:** [usc-story.netlify.app](https://usc-story.netlify.app/)
**CMS Admin:** [usc-story.netlify.app/admin](https://usc-story.netlify.app/admin)

---

## 📚 Complete Documentation

### 📄 Executive Summary (Quick Overview)
**[View Executive Summary](https://github.com/YOUR-USERNAME/simple-app/blob/main/docs/executive-summary.md)**

One-page overview covering:
- Dual-purpose solution (storytelling + endowments)
- AI for Greater Good - technology as social impact enabler
- Freemium business model (FREE vs PREMIUM tiers)
- $50K endowment target in 6 months
- 6-month MVP roadmap
- Success metrics and competitive advantages

**Read Time:** 5-10 minutes

---

### 📊 Stakeholder Presentation (Swiss Style Deck)
**[View Presentation](https://github.com/YOUR-USERNAME/simple-app/blob/main/docs/prd-presentation.md)**

22-slide presentation deck covering:
- Executive summary
- Problem statement (federal funding crisis + outdated platform)
- Solution overview (3-pillar approach)
- Freemium business model
- Endowment model (family-community, sponsors, corporates)
- MVP roadmap (5 epics, 6 months)
- Success metrics & KPIs
- Corporate partnership opportunity
- Cost structure (<$200/month)
- Risks & mitigation
- Next steps

**Design:** Swiss Style (clean typography, USC Garnet + Black, no purple, non-glowy)

**Read Time:** 15-20 minutes | **Present Time:** 30-45 minutes

---

### 📘 Complete Product Requirements Document (PRD)
**[View Full PRD](https://github.com/YOUR-USERNAME/simple-app/blob/main/docs/prd.md)**

Comprehensive technical specification including:
- **Goals & Background Context** - Mission, vision, change log
- **Requirements** - 99 Functional Requirements (FR1-FR99) + 22 Non-Functional Requirements (NFR1-NFR22)
- **User Interface Design Goals** - UX vision, interaction patterns, accessibility (WCAG 2.1 AA)
- **Technical Assumptions** - JAMstack architecture (Eleventy + Xano + Netlify), payment processing (Stripe + Plaid), integrations (Auth0, permit.io, Bunny.net)
- **Epic List** - 5 epics with goals and deliverables
- **Epic Details** - 42+ user stories with detailed acceptance criteria
- **Next Steps** - Handoff prompts for UX/IA and Technical Architect

**Read Time:** 1-2 hours (comprehensive reference document)

---

### 🗺️ Complete Sitemap (Information Architecture)
**[View Sitemap](https://github.com/YOUR-USERNAME/simple-app/blob/main/docs/sitemap.md)**

Full information architecture covering:
- 100+ pages/screens documented
- Public pages (homepage, stories, endowments, sponsors)
- Role-specific dashboards (Student, Family, Instructor, Corporate, Admin)
- Group pages (directory, feeds, settings, endowment pools)
- URL patterns and navigation hierarchy
- Access control matrix (by role and tier)
- Mobile navigation structure
- Search & discovery flows
- Error pages and onboarding flows

**Read Time:** 30-45 minutes

---

## 🎯 Quick Facts

| Metric | Target |
|--------|--------|
| **Timeline** | 6 months to MVP launch |
| **Budget** | <$200/month operational costs (excluding payment fees) |
| **User Goal** | 500+ active students within first semester |
| **Endowment Goal** | $50K+ in first 6 months ($20K family-community, $15K sponsors, $15K corporate) |
| **Tier Adoption** | 60%+ PREMIUM tier (students opt-in to corporate loyalty) |
| **Engagement** | 100+ stories, 5+ comments per story, 80%+ satisfaction |

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Eleventy (11ty) v3.1.2 | Static site generation |
| **Design** | Webflow → 11ty export | Design system (NO Tailwind CSS) |
| **Backend** | Xano | Headless CMS, database, REST APIs, real-time sockets |
| **Hosting** | Netlify | Static hosting + serverless functions |
| **Auth** | Auth0 | SSO and identity management |
| **Authorization** | permit.io | ABAC policies (tier-based, role-based access) |
| **Payments** | Stripe + Plaid | ACH bank transfers (0.8% fees), credit cards (2.9% + $0.30) |
| **CDN** | Bunny.net | Cost-optimized media delivery |

---

## 💡 The Problem We're Solving

### 1. Federal Funding Crisis
- Federal funding cuts threaten student financial stability at USC
- No modern platform for community-driven tuition support
- Students need grassroots financial assistance from families, churches, community groups

### 2. Outdated Communication
- USC website is extremely outdated and not student-editable
- Students resort to fragmented social media (Instagram, Twitter, TikTok) unsuitable for long-form storytelling
- No university-tailored platform with proper access controls and moderation

---

## ✨ The Solution - Three Pillars

### 1. Community-Driven Endowments
**Three Revenue Streams:**

| Stream | Contributors | Purpose | Target |
|--------|--------------|---------|--------|
| **Family-Community** | Families, friends, churches, community groups | Direct tuition support to specific students | $20K in 6 months |
| **Sponsors** | Foundations, alumni, local businesses | Philanthropic donations (no advertising) | $15K in 6 months |
| **Corporates** | Companies (Colgate, restaurants, tech firms) | Endowment + loyalty advertising exchange | $15K in 6 months (5+ partners) |

### 2. Modern Storytelling Platform
- JAMstack architecture for performance (<2s page loads, 99.5%+ uptime)
- Rich text editor with Webflow-designed components
- Private groups for classes, families, peer circles
- Sophisticated commenting and moderation tools

### 3. Freemium Business Model
- **FREE Tier:** Public story publishing, basic dashboard
- **PREMIUM Tier:** Privacy controls (public/USC-only/groups/private), private group creation, enhanced dashboard
- **Unlock Mechanism:** Students opt-in to corporate loyalty programs → receive discount codes + unlock PREMIUM features

---

## 🤝 Corporate Partnership Model

**What Corporations Get:**
- Direct marketing access to 500+ engaged USC students (opt-in only)
- Loyalty subscription program promotion (marketplace listing, in-feed ads)
- Brand alignment with student success and community support
- Performance metrics (views, opt-ins, engagement)

**What Corporations Give:**
- Endowment contribution to USC student fund (e.g., $1,000/month)
- Loyalty discounts/offers to subscribed students (e.g., "20% off all products")

**Example:**
- **Colgate:** $1,000/month endowment → "Colgate Student Rewards" loyalty program (20% off)
- Students opt-in → Unlock PREMIUM features + receive Colgate discounts
- Colgate gets tasteful, clearly-disclosed advertising to opted-in students

**Ethical Advertising:**
- ✅ Clear "Sponsored by [Corporation] Endowment" disclosure
- ✅ Student opt-in required (no forced exposure)
- ✅ Platform admin approval before launch
- ✅ Students control subscriptions (unsubscribe anytime)

---

## 🗓️ MVP Roadmap (6 Months)

### Epic 1: Foundation & Public Publishing (Months 1-2)
- Project setup (11ty, Netlify, Xano, Auth0)
- User authentication and role assignment
- Basic story editor and public publishing
- Homepage feed and story detail pages

### Epic 2: Endowment System (Months 2-3)
- Stripe + Plaid payment integration (ACH bank transfers)
- Family-community endowment setup flows
- Sponsor donation workflows
- Corporate registration and profiles
- Tax receipt generation and tracking

### Epic 3: Freemium + Privacy + Groups (Months 3-4)
- FREE vs PREMIUM tier implementation
- Corporate loyalty program creation
- permit.io ABAC integration
- Story privacy controls (public/USC-only/groups/private)
- Private group creation and management

### Epic 4: Community Engagement (Months 4-5)
- Threaded commenting system
- Moderation tools and flagging
- Personalized dashboards (role-based: Student, Family, Instructor, Corporate, Admin)
- Group feeds, discovery, and settings

### Epic 5: Admin Governance (Months 5-6)
- Corporate sponsor approval workflow
- Platform-wide moderation dashboard
- Audit logging for transactions and actions
- Community Support Pool fund allocation (admin allocates general fund to students in need)

---

## 🎯 Success Metrics

### User Adoption
- ✅ **500+ active students** within first semester
- ✅ **60%+ PREMIUM tier adoption** (students opt-in to corporate loyalty)
- ✅ **100+ published stories** in first 3 months

### Financial Goals
- ✅ **$50K+ endowment contributions** in first 6 months
- ✅ **5+ corporate partners** with active loyalty programs
- ✅ **Revenue neutrality** by end of year two

### Engagement
- ✅ **Average 5+ comments per story**
- ✅ **80%+ users customize privacy settings** (PREMIUM)
- ✅ **95%+ moderation response** within 24 hours

### Platform Performance
- ✅ **<2s page loads** (P95)
- ✅ **99.5%+ uptime**
- ✅ **<$200/month operational costs** (excluding payment fees)
- ✅ **Lighthouse score 90+** (Performance, Accessibility, Best Practices)

---

## 🌟 AI for Greater Good

This platform demonstrates **AI and technology serving a social mission**:

**1. Democratizing Financial Support**
- AI-assisted platform design reduces development costs
- Automated payment processing eliminates administrative burden
- Smart matching algorithms (future) connect students with sponsors

**2. Amplifying Student Voices**
- AI content moderation keeps communities safe while preserving free expression
- NLP (future) helps students craft compelling stories
- Sentiment analysis (future) identifies students in crisis needing urgent help

**3. Transparent, Ethical Technology**
- Open, explainable business model (no hidden algorithms)
- Student-controlled privacy (AI serves students, not advertisers)
- Fair, consent-based corporate partnerships

**4. Scalable Social Impact**
- Platform designed for multiple universities (white-label model)
- Low operational costs (<$200/month) make it sustainable
- Technology enables $50K+ grassroots fundraising impossible to manage manually

**Meta-Narrative:** This PRD was **collaboratively developed with AI assistance** (Claude as Product Owner Agent), demonstrating how AI can accelerate solutions to real social challenges.

---

## 🚦 Project Status

| Phase | Status | Timeline |
|-------|--------|----------|
| **Project Brief** | ✅ Complete | Complete |
| **PRD Development** | ✅ Complete | Complete |
| **Stakeholder Review** | 🟡 Pending | Week 1-2 |
| **UX/IA Design** | ⚪ Not Started | Week 1-4 |
| **Technical Architecture** | ⚪ Not Started | Week 1-4 |
| **Epic 1 Development** | ⚪ Not Started | Month 1-2 |
| **MVP Launch** | ⚪ Not Started | Month 6 |

---

## 📞 Contact & Questions

**Project Owner:** Product Owner (Sarah - AI Agent)

**For Questions About:**
- **Business Strategy:** Review Executive Summary & Presentation
- **Technical Implementation:** Review Full PRD & Sitemap
- **Corporate Partnerships:** Review Presentation (Slide 11: Corporate Partnership Opportunity)
- **Legal/Compliance:** Review Executive Summary (Compliance & Security section)

---

## 🔗 Quick Links Summary

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [Executive Summary](https://github.com/YOUR-USERNAME/simple-app/blob/main/docs/executive-summary.md) | One-page overview with AI for Greater Good narrative | 5-10 min |
| [Stakeholder Presentation](https://github.com/YOUR-USERNAME/simple-app/blob/main/docs/prd-presentation.md) | 22-slide Swiss Style deck for business review | 15-20 min |
| [Full PRD](https://github.com/YOUR-USERNAME/simple-app/blob/main/docs/prd.md) | Complete technical specification (99 FRs, 42+ Stories) | 1-2 hours |
| [Sitemap](https://github.com/YOUR-USERNAME/simple-app/blob/main/docs/sitemap.md) | Complete information architecture (100+ pages) | 30-45 min |
| [Live Prototype](https://usc-story.netlify.app/) | Interactive platform preview | - |
| [CMS Admin](https://usc-story.netlify.app/admin) | Content management system preview | - |

---

## 📋 Next Steps

### For Stakeholders
1. **Review** Executive Summary (5-10 minutes)
2. **Review** Stakeholder Presentation (15-20 minutes)
3. **Provide Feedback** on business model, timeline, and budget
4. **Schedule Review Meeting** with USC administration, IT, legal, finance

### For Development Team
1. **Review** Full PRD for complete requirements
2. **Review** Sitemap for information architecture
3. **Begin** UX/IA design work using handoff prompts in PRD
4. **Begin** Technical architecture using handoff prompts in PRD

### For Corporate Partners
1. **Review** Corporate Partnership Opportunity (Presentation Slide 11)
2. **Review** Freemium Model and Success Metrics
3. **Explore** Live Prototype to understand platform UX
4. **Schedule** Partnership discussion meeting

---

## 🏆 Why This Will Succeed

**vs. Social Media:** Long-form storytelling, university-specific privacy, no algorithm manipulation
**vs. Existing CMS:** Fine-grained access control, integrated endowments, student-editable, cost-optimized
**vs. Traditional Endowments:** Modern UX, direct tuition support, transparent tracking, combines storytelling with financial support

**Unique Differentiator:** Only platform that combines modern storytelling with community-driven financial support for students in need.

---

**USC Story Generator Platform v1.0**
**Powered by AI for Social Good**
**Built by students, for students, with community support**

---

*Last Updated: December 2025*
*PRD Status: Complete & Ready for Stakeholder Review*
*Timeline: 6 Months to MVP | Budget: <$200/month | Target: 500+ Students, $50K+ Endowments*

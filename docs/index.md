---
layout: default
title: USC Story Generator Platform - Documentation
---

# USC Story Generator Platform

**Modern student storytelling platform with community-driven endowments addressing federal funding loss**

[![Status](https://img.shields.io/badge/Status-PRD%20Complete-brightgreen)](prd.md)
[![Timeline](https://img.shields.io/badge/Timeline-6%20Months%20to%20MVP-blue)](prd-presentation.md)
[![Budget](https://img.shields.io/badge/Budget-<$200%2Fmonth-orange)](executive-summary.md)
[![Target](https://img.shields.io/badge/Endowment%20Target-$50K%20in%206mo-success)](prd.md)

---

## 🚀 Live Prototypes

- **Platform Prototype:** [usc-story.netlify.app](https://usc-story.netlify.app/)
- **CMS Admin:** [usc-story.netlify.app/admin](https://usc-story.netlify.app/admin)

---

## 📚 Complete Documentation

### For Business Stakeholders

| Document | Description | Read Time |
|----------|-------------|-----------|
| **[Executive Summary](executive-summary.md)** | One-page overview with AI for Greater Good narrative | 5-10 min |
| **[Stakeholder Presentation](prd-presentation.md)** | 22-slide Swiss Style deck for business review | 15-20 min |
| **[Quick Overview (Short)](GIST-SHORT.md)** | Condensed quick-share version | 3-5 min |

### For Development Team

| Document | Description | Read Time |
|----------|-------------|-----------|
| **[Complete PRD](prd.md)** | 99 functional requirements, 22 NFRs, 5 epics, 42+ user stories | 1-2 hours |
| **[Sitemap](sitemap.md)** | Complete information architecture (100+ pages) | 30-45 min |
| **[Full Overview](GIST.md)** | Comprehensive shareable overview | 10-15 min |

### For Quick Sharing

| Document | Description | Best For |
|----------|-------------|----------|
| **[Micro Snippets](GIST-MICRO.md)** | Tweet, LinkedIn, elevator pitch, FAQ | Social media, emails |
| **[Project README](../README.md)** | Repository homepage | GitHub visitors |

---

## 💡 Project Overview

### The Problem

**Federal Funding Crisis:**
- Federal funding cuts threaten student financial stability at USC
- No modern platform for community-driven tuition support

**Outdated Communication:**
- USC website is outdated and not student-editable
- Social media unsuitable for long-form storytelling

### The Solution: Three-Pillar Approach

#### 1️⃣ Community-Driven Endowments ($50K Target in 6 Months)

| Stream | Contributors | Target |
|--------|--------------|--------|
| **Family-Community** | Families, friends, churches, community groups | $20K |
| **Sponsors** | Foundations, alumni, local businesses | $15K |
| **Corporates** | Companies (loyalty advertising exchange) | $15K |

#### 2️⃣ Modern Storytelling Platform

- **JAMstack Architecture:** Eleventy + Xano + Netlify
- **Performance:** <2s page loads, 99.5%+ uptime
- **Private Groups:** Classes, families, peer circles
- **Moderation:** Sophisticated admin governance tools

#### 3️⃣ Freemium Business Model

- **FREE Tier:** Public story publishing, basic dashboard
- **PREMIUM Tier:** Privacy controls, private groups (unlocked by corporate loyalty opt-in)

**Value Exchange:** Students opt-in to corporate loyalty programs → unlock PREMIUM features + receive discounts

---

## 🏗️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Eleventy (11ty) v3.1.2 | Static site generation |
| **Design** | Webflow → 11ty export | Design system (NO Tailwind) |
| **Backend** | Xano | Headless CMS, REST APIs, real-time sockets |
| **Hosting** | Netlify | Static hosting + serverless functions |
| **Auth** | Auth0 | SSO and identity management |
| **Authorization** | permit.io | ABAC policies (tier + role-based access) |
| **Payments** | Stripe + Plaid | ACH bank transfers (0.8% fees) |
| **CDN** | Bunny.net | Cost-optimized media delivery |

---

## 🗓️ 6-Month MVP Roadmap

1. **Foundation & Public Publishing** (Mo 1-2) - Auth, story editor, public publishing
2. **Endowment System** (Mo 2-3) - Stripe/Plaid, payments, tax receipts
3. **Freemium + Privacy + Groups** (Mo 3-4) - Tiers, corporate loyalty, privacy, groups
4. **Community Engagement** (Mo 4-5) - Commenting, moderation, dashboards
5. **Admin Governance** (Mo 5-6) - Corporate approval, moderation, fund allocation

---

## 🎯 Success Metrics

### User Adoption
- 🎯 **500+ active students** within first semester
- 🎯 **60%+ PREMIUM tier adoption**
- 🎯 **100+ published stories** in first 3 months

### Financial Goals
- 💰 **$50K+ endowment contributions**
- 💰 **5+ corporate partners**
- 💰 **<$200/month operational costs**

### Engagement
- 💬 **Average 5+ comments per story**
- 🔒 **80%+ users customize privacy settings**
- 🛡️ **95%+ moderation response** within 24 hours

### Platform Performance
- ⚡ **<2 second page loads** (P95)
- ⚡ **99.5%+ uptime**
- ⚡ **Lighthouse score 90+**

---

## 🌟 AI for Greater Good

This platform demonstrates **AI and technology serving a social mission**:

- **Democratizing Financial Support** - Automated processing reduces costs
- **Amplifying Student Voices** - AI moderation keeps communities safe
- **Transparent Technology** - Student-controlled, no hidden algorithms
- **Scalable Social Impact** - $50K+ grassroots fundraising enabled by tech

**Meta:** This PRD was collaboratively developed with AI assistance (Claude as Product Owner Agent via BMad framework), demonstrating how AI can accelerate solutions to real social problems.

---

## 🚦 Current Status

| Phase | Status |
|-------|--------|
| **Project Brief** | ✅ Complete |
| **PRD Development** | ✅ Complete |
| **Stakeholder Review** | 🟡 Pending |
| **UX/IA Design** | ⚪ Not Started |
| **Development** | ⚪ Not Started |
| **MVP Launch** | ⚪ Target: Month 6 |

---

## 📞 Get Started

**Choose your role to get started:**

- **👔 Business Stakeholders:** Start with [Executive Summary](executive-summary.md) → [Presentation](prd-presentation.md)
- **💻 Development Team:** Start with [PRD](prd.md) → [Sitemap](sitemap.md)
- **🤝 Corporate Partners:** Review [Presentation Slide 11](prd-presentation.md#slide-11-corporate-partnership-opportunity)
- **🔗 Quick Share:** Use [Micro Snippets](GIST-MICRO.md) for social media, emails, pitches

---

## 🔗 External Links

- **GitHub Repository:** [persephonepunch/school-endowment](https://github.com/persephonepunch/school-endowment)
- **Live Prototype:** [usc-story.netlify.app](https://usc-story.netlify.app/)
- **CMS Admin:** [usc-story.netlify.app/admin](https://usc-story.netlify.app/admin)

---

**USC Story Generator Platform v1.0**
**Powered by AI for Social Good**
**Built by students, for students, with community support**

---

*Last Updated: December 2025*
*PRD Status: Complete & Ready for Stakeholder Review*
*Timeline: 6 Months to MVP | Budget: <$200/month | Target: 500+ Students, $50K+ Endowments*

# USC Story Generator Platform
## Product Requirements Presentation

**Version 1.0 | December 2025**

**Live Prototype:** [usc-story.netlify.app](https://usc-story.netlify.app/)
**CMS Admin:** [usc-story.netlify.app/admin](https://usc-story.netlify.app/admin)

---

## Executive Summary

**Dual-Purpose Platform**

1. **Modern Storytelling**
   Student-editable long-form publishing platform replacing outdated USC website

2. **Community-Driven Financial Support**
   Addresses federal funding loss through diversified endowment model

**Target:** 500+ students, 100+ stories, $50K+ endowments in first 6 months

---

## The Problem

### Federal Funding Crisis

- Federal funding cuts threaten student financial stability
- No modern platform for community-driven tuition support
- Students lack tools to receive grassroots financial assistance

### Outdated Communication

- USC website: Extremely outdated, not student-editable
- Social media: Short-form, algorithm-driven, unsuitable for substantive content
- No university-tailored storytelling platform with proper access controls

---

## The Solution

### Three-Pillar Approach

**1. Community Endowments**
- Family-community direct tuition payments (Stripe ACH, <1% fees)
- Sponsor philanthropic donations (foundations, alumni, local businesses)
- Corporate endowments in exchange for ethical loyalty advertising

**2. Modern Publishing Platform**
- JAMstack architecture (Eleventy + Xano + Netlify)
- Freemium model: FREE (public) vs PREMIUM (privacy + groups)
- Private groups for classes, families, peer circles

**3. Sustainable Business Model**
- Students unlock PREMIUM features by opting into corporate loyalty programs
- Corporate sponsors contribute endowments + gain tasteful advertising access
- Platform operational costs <$200/month (excluding payment fees)

---

## Freemium Business Model

### Two User Tiers

**FREE Tier**
- Public story publishing
- Basic dashboard
- Public commenting
- No privacy controls

**PREMIUM Tier** (Unlocked by corporate loyalty opt-in)
- Privacy controls (public, USC-only, groups, private)
- Create private groups
- Enhanced dashboard
- Corporate loyalty discounts (20% off Colgate, etc.)

### Value Exchange
Students who want privacy → Opt-in to corporate advertising → Unlock features + receive discounts

---

## Endowment Model

### Three Revenue Streams

**1. Family-Community Endowments**
- Direct tuition payments to students
- Recurring via Stripe ACH (0.8% fee, capped at $5)
- Churches, family friends, community groups
- **Target individual students in need**

**2. Sponsor Donations**
- Philanthropic (no advertising)
- One-time or recurring
- General fund or specific students
- Public recognition or anonymous

**3. Corporate Endowments**
- Companies contribute to general student fund
- In exchange: Loyalty advertising access
- Example: Colgate contributes $10K/year, offers "20% off" program to students
- Students opt-in → See tasteful ads, receive discounts

### Transparency & Privacy
- Public dashboard shows aggregate totals
- Individual student finances remain private (FERPA compliant)
- Students opt-in to "Community Support Pool" to receive allocations

---

## Key Features: MVP Scope

### Core Publishing
- Rich text story editor (Webflow-designed)
- Draft/publish workflow
- GitOps deployment (GitHub → Netlify)
- Responsive reading experience

### Authentication & Access
- Auth0 SSO (Student, Family, Instructor, Corporate, Admin roles)
- permit.io fine-grained access control (tier-based, role-based)

### Private Groups
- Classes, families, peer groups, clubs
- Privacy levels: Public, Private, Secret
- Group-specific story publishing
- Member management and invitations

### Commenting & Moderation
- Threaded comments
- Author-controlled permissions (PREMIUM)
- Flagging and moderation queue
- Admin governance tools

### Endowment Infrastructure
- Stripe + Plaid integration (bank verification)
- Recurring payment management
- Tax receipt generation
- Corporate loyalty marketplace
- Admin fund allocation to students in need

---

## Technical Architecture

### JAMstack Foundation

**Frontend**
- Eleventy (11ty) static site generator
- Webflow → 11ty design export
- **NO Tailwind** (Webflow-generated CSS)
- Bunny.net CDN for media

**Backend**
- Xano headless CMS (managed database + REST APIs)
- Real-time sockets for comments/notifications
- Netlify serverless functions (webhooks, authorization)

**Integrations**
- Auth0: Authentication
- permit.io: Authorization (ABAC policies)
- Stripe + Plaid: Payments
- Bunny.net: Media CDN

### Performance Targets
- Page load: <2 seconds (P95)
- Lighthouse score: 90+
- Operational costs: <$200/month
- Uptime: 99.5%+

---

## MVP Roadmap: 5 Epics

### Epic 1: Foundation & Public Publishing (Month 1-2)
- Project setup (11ty, Netlify, Xano, Auth0)
- User registration and authentication
- Basic story editor and publishing
- Homepage feed

### Epic 2: Endowment System (Month 2-3)
- Stripe + Plaid integration
- Family-community payment flows
- Sponsor donations
- Corporate registration
- Tax receipts and tracking

### Epic 3: Freemium + Privacy + Groups (Month 3-4)
- Tier system (FREE vs PREMIUM)
- Corporate loyalty programs
- permit.io integration
- Privacy controls
- Private group creation

### Epic 4: Community Engagement (Month 4-5)
- Commenting system
- Moderation tools
- Personalized dashboards
- Group feeds and discovery

### Epic 5: Admin Governance (Month 5-6)
- Corporate sponsor approval
- Platform-wide moderation
- Audit logging
- Community Support Pool allocation

**Timeline:** 6 months to MVP launch

---

## Success Metrics

### User Adoption
- **500+ active students** within first semester
- **60%+ PREMIUM tier adoption** (corporate loyalty opt-in)
- **100+ published stories** in first 3 months

### Financial Goals
- **$50K+ endowment contributions** in first 6 months
  - Family-community: $20K
  - Sponsors: $15K
  - Corporations: $15K (5+ partners)
- **Revenue neutrality** by end of year two

### Engagement
- **Average 5+ comments per story**
- **80%+ users customize privacy settings** (PREMIUM)
- **95%+ moderation response** within 24 hours

### Platform Performance
- **<2s page loads** (P95)
- **99.5%+ uptime**
- **<$200/month operational costs**

---

## Corporate Partnership Opportunity

### Value Proposition for Corporations

**What You Get:**
- Direct marketing access to 500+ engaged USC students
- Loyalty subscription program promotion (in-feed ads, marketplace listing)
- Brand alignment with student success and community support
- Performance metrics (views, opt-ins, engagement)

**What You Give:**
- Endowment contribution to USC student fund (monthly or annual)
- Loyalty discounts to subscribed students (e.g., "20% off all products")

**Examples:**
- **Colgate:** $1,000/month endowment → "Colgate Student Rewards" (20% off)
- **Local Restaurant:** $500/month → "Campus Eats Discount Club" (15% off meals)
- **Tech Company:** $2,000/month → "Student Tech Program" (student software licenses)

### Ethical Advertising
- Clear "Sponsored by [Corporation] Endowment" disclosure
- Student opt-in required (no forced exposure)
- Platform administrators approve all programs
- Students control their subscriptions

---

## Compliance & Security

### Student Privacy (FERPA)
- Individual financial details remain private
- Student data shared with corporations only with explicit opt-in
- Data export/deletion rights (GDPR-style)

### Payment Security (PCI-DSS)
- Stripe handles all card/bank data
- No sensitive data stored on platform servers
- Secure webhook handling (signature verification)

### Access Control
- permit.io ABAC policies for granular permissions
- Audit logging for all financial transactions and moderation actions
- Admin governance tools

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support

---

## Cost Structure

### Operational Budget: <$200/month

**Service Breakdown:**
- Netlify: $0 (free tier, 100GB bandwidth)
- Xano: $25-50/month (starter plan)
- Auth0: $0 (free tier, up to 7,000 users)
- permit.io: $0-50/month (check pricing)
- Bunny.net: $10-30/month (usage-based CDN)
- Domain/DNS: ~$15/year

**Total:** $50-130/month (well under budget)

**Payment Processing Fees:**
- ACH transfers: 0.8% (capped at $5) - **optimized for large tuition payments**
- Credit cards: 2.9% + $0.30 (fallback for one-time donations)

**Scalability:** Platform can support 1,000+ users without >50% cost increase

---

## Competitive Advantages

### Why USC Story Generator Wins

**vs. Social Media (Instagram, Twitter, TikTok)**
- Long-form storytelling (not limited to 280 chars or short videos)
- University-specific privacy controls
- No algorithm manipulation
- Community-driven, not ad-driven

**vs. Existing CMS Platforms (WordPress, Medium)**
- Fine-grained access control (ABAC via permit.io)
- Integrated endowment system (no platform does this)
- Student-editable (not locked to IT department)
- Cost-optimized for universities (<$200/month)

**vs. Traditional Endowment Platforms**
- Modern, student-friendly UX
- Direct tuition support (not institutional bureaucracy)
- Transparent tracking and tax receipts
- Combines storytelling with financial support (unique dual purpose)

---

## Risks & Mitigation

### Key Risks

**1. Student Adoption**
- **Risk:** Students don't transition from social media to new platform
- **Mitigation:** Partner with student orgs for pilot, create compelling launch content, emphasize unique privacy + endowment features

**2. Corporate Interest**
- **Risk:** Corporations don't see value in loyalty program model
- **Mitigation:** Start with local businesses (lower commitment), demonstrate ROI with pilot metrics, offer tiered pricing

**3. Cost Overruns**
- **Risk:** Media storage and CDN costs exceed budget
- **Mitigation:** Enforce upload limits, use Bunny.net (low-cost CDN), monitor costs weekly

**4. Moderation Scalability**
- **Risk:** Volunteer moderation doesn't scale with growth
- **Mitigation:** Build robust flagging tools, clear guidelines, plan for paid moderators in Phase 2

**5. Access Control Complexity**
- **Risk:** permit.io policies become too complex to manage
- **Mitigation:** Start with simplified policies, extensive testing, clear documentation, dedicated training

---

## Phase 2: Future Enhancements

**Post-MVP (Year 2)**

### Revenue Expansion
- Advanced subscription tiers (ad-free for premium subscribers)
- Alumni endowment programs (legacy giving)
- Institutional subscriptions (multi-university deployment)
- Grant funding from educational foundations

### Enhanced Features
- Real-time collaborative editing
- Advanced analytics and reporting
- Mobile native apps (iOS/Android)
- Email digest automation
- Full-text search with filters
- Personalized content recommendations

### Scale & Reach
- White-label version for other universities
- Multi-institution content sharing
- Integration with learning management systems
- Digital archive of student perspectives

---

## Next Steps

### Immediate Actions (Post-Approval)

**Week 1-2:**
1. ✅ UX/IA team begins design work (sitemap, user flows, wireframes)
2. ✅ Technical Architect creates architecture documentation
3. ✅ Legal/Compliance review of endowment handling and tax receipts
4. ✅ Schedule meeting with USC IT for infrastructure approval

**Week 3-4:**
5. ✅ Corporate outreach: Identify 10-15 potential loyalty program partners
6. ✅ Development team begins Epic 1 (Foundation & Authentication)
7. ✅ Create pilot program with 2-3 student organizations

**Month 2:**
8. ✅ Launch internal beta with 50 students
9. ✅ Onboard first 2-3 corporate partners
10. ✅ Begin Epic 2 (Endowment System)

**Month 6:**
11. ✅ MVP launch to full USC community
12. ✅ Public endowment dashboard goes live
13. ✅ Corporate loyalty marketplace operational

---

## Stakeholder Questions

### Discussion Points for Review

**Business Model:**
- Is the freemium model (privacy unlocked by corporate ads) acceptable to USC administration?
- Are there existing corporate relationships we can leverage for loyalty programs?

**Financial Goals:**
- Is the $50K endowment target realistic for first 6 months?
- What's the acceptable balance between family-community, sponsors, and corporate funding?

**Legal & Compliance:**
- Additional FERPA considerations for student financial data?
- Tax implications for endowment contributions (501(c)(3) status needed?)
- Corporate sponsor vetting criteria and approval process?

**Feature Prioritization:**
- Any MVP features that should move to Phase 2?
- Any Phase 2 features critical enough to pull into MVP?

**Resources:**
- Development team capacity for 6-month timeline?
- Budget for operational costs and corporate outreach?

---

## Links & Resources

### Live Prototype
**🔗 [usc-story.netlify.app](https://usc-story.netlify.app/)**
- Current design mockup
- Sample story feed
- Basic navigation structure

### CMS Admin
**🔗 [usc-story.netlify.app/admin](https://usc-story.netlify.app/admin)**
- Content management system
- Story publishing workflow
- Admin interface preview

### Documentation
**📄 Full PRD:** [docs/prd.md](./prd.md)
- 99 Functional Requirements
- 22 Non-Functional Requirements
- 42+ User Stories with Acceptance Criteria
- Complete Technical Specifications

**🗺️ Sitemap:** [docs/sitemap.md](./sitemap.md)
- Complete information architecture
- All pages and navigation hierarchy
- User role-specific views

---

## Contact & Next Steps

**Project Owner:** Product Owner (Sarah)

**For Questions:**
- **Business Strategy:** Review Goals & Business Model sections
- **Technical Implementation:** Review Technical Assumptions & Architecture
- **Corporate Partnerships:** Review Corporate Partnership Opportunity section
- **Legal/Compliance:** Review Compliance & Security section

**Ready to Proceed?**
1. Schedule stakeholder approval meeting
2. Confirm MVP scope and timeline
3. Allocate development resources
4. Begin UX/IA and Architecture work
5. Initiate corporate partner outreach

---

## Appendix: Design Principles

### Swiss Style Guidelines

**Typography:**
- Clean sans-serif (Helvetica, Akzidenz-Grotesk, or similar)
- Clear hierarchy (48pt headers, 24pt subheaders, 16pt body)
- High contrast for readability

**Color Palette:**
- **USC Garnet:** #73000a (primary accent)
- **Black:** #000000 (headings, emphasis)
- **White:** #ffffff (backgrounds)
- **Gray:** #666666 (secondary text)

**Layout:**
- Grid-based composition
- Asymmetric balance
- Generous white space
- Minimal decorative elements
- Focus on content and hierarchy

**Visual Elements:**
- No gradients or glows
- Flat design
- Simple dividers and rules
- Iconography minimal and functional

---

**End of Presentation**

**USC Story Generator Platform v1.0 | December 2025**

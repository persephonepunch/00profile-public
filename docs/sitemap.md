# USC Story Generator Platform - Sitemap

**Version:** 1.0
**Date:** 2025-12-10
**Purpose:** Complete information architecture and navigation hierarchy

---

## Table of Contents

1. [Public Pages](#public-pages)
2. [Authentication](#authentication)
3. [Student Pages](#student-pages)
4. [Family Member Pages](#family-member-pages)
5. [Instructor Pages](#instructor-pages)
6. [Corporate Sponsor Pages](#corporate-sponsor-pages)
7. [Administrator Pages](#administrator-pages)
8. [Group Pages](#group-pages)
9. [Shared Components](#shared-components)
10. [URL Patterns](#url-patterns)

---

## Public Pages

**Accessible to all visitors (no authentication required)**

```
/
├── / (Homepage)
│   ├── Story Feed (chronological, public stories only)
│   ├── Featured Stories
│   ├── Corporate Sponsor Ads (if PREMIUM logged in)
│   └── CTA: Login/Register
│
├── /stories
│   └── /stories/:slug (Story Detail Page)
│       ├── Story Content
│       ├── Author Info
│       ├── Comments (if allowed)
│       └── Related Stories
│
├── /endowments (Public Endowment Dashboard)
│   ├── Total Contributions Overview
│   ├── Breakdown by Source (Family-Community, Sponsors, Corporations)
│   ├── Top Sponsors (public recognition)
│   ├── Tombstone/Memorial Donors
│   └── CTAs: Contribute, Become Sponsor, Corporate Partner
│
├── /sponsors (Sponsors Recognition Page)
│   ├── Sponsor Directory (public sponsors)
│   ├── Sponsor Profiles (logo, mission, contribution)
│   └── Tombstone/Memorial Section
│
├── /about
│   ├── Platform Mission
│   ├── How It Works
│   ├── Community Guidelines
│   └── FAQ
│
├── /privacy-policy
├── /terms-of-service
└── /contact
```

---

## Authentication

**Login and registration flows**

```
/auth
├── /auth/login (Auth0 Universal Login redirect)
├── /auth/register
│   ├── Email/Password or Social Login
│   ├── Role Selection (Student, Family, Instructor, Community)
│   ├── Tier Information (FREE vs PREMIUM)
│   └── Profile Setup
│
├── /auth/logout
└── /auth/callback (Auth0 callback handler)
```

---

## Student Pages

**Authenticated - Student Role**

```
/dashboard (Student Dashboard)
├── Welcome + Tier Badge (FREE/PREMIUM)
├── Quick Stats (stories, comments, groups)
├── My Stories
│   ├── Published Stories
│   └── Drafts
├── Recent Activity Feed
├── My Groups (PREMIUM only)
├── My Loyalty Subscriptions (PREMIUM only)
├── My Endowments Summary
└── Quick Actions (Write Story, Create Group, Browse Loyalty)

/editor
├── /editor/new (New Story)
│   ├── Rich Text Editor
│   ├── Title Field
│   ├── Privacy Dropdown (PREMIUM: public/USC/groups/private; FREE: public only)
│   ├── Group Selection (PREMIUM)
│   ├── Save Draft
│   └── Publish
│
└── /editor/:story-id (Edit Existing Story)

/profile
├── /profile (Own Profile)
│   ├── Name, Email, Avatar
│   ├── Bio
│   ├── Tier Status
│   ├── Edit Profile
│   └── Privacy Settings
│
└── /profile/:user-id (Other User Profile)
    ├── Public Info
    ├── Published Stories
    └── Groups (public groups only)

/settings
├── /settings/profile (Profile Settings)
├── /settings/privacy (Privacy Settings - PREMIUM)
│   ├── Default Story Visibility
│   ├── Comment Permissions
│   └── Data Export/Deletion
├── /settings/notifications
│   ├── Email Preferences
│   ├── In-App Notifications
│   └── Per-Group Notification Settings
├── /settings/endowments
│   ├── Opt-in to Community Support Pool
│   ├── Endowment Profile (share with supporters)
│   └── Thank Contributors
└── /settings/account
    ├── Change Password
    ├── Connected Accounts
    └── Delete Account

/endowments/personal
├── Total Endowments Received
├── Breakdown by Source
│   ├── Family-Community Contributions
│   ├── Sponsor Allocations
│   └── Corporate General Fund Allocations
├── Contribution History
├── Upcoming Payments
└── Thank You Messages

/loyalty-marketplace (Corporate Loyalty Programs)
├── Browse Active Programs
├── Program Details (corporate logo, discount offer, endowment amount)
├── Subscribe (opt-in → unlock PREMIUM)
└── My Subscriptions
    ├── Active Programs
    ├── Discount Codes
    └── Unsubscribe

/moderation (if story author or group admin)
├── Flagged Comments on My Stories
├── Flagged Posts in My Groups
├── Review Queue
└── Moderation Actions (Hide, Delete, Ban)

/notifications
├── Notification Feed
├── Unread Count
├── Mark as Read
└── Notification Preferences
```

---

## Family Member Pages

**Authenticated - Family Role**

```
/dashboard/family (Family Member Dashboard)
├── My Contributions
│   ├── Active Subscriptions (recurring payments)
│   ├── One-Time Donations
│   └── Total Contributed
├── Student Updates (if students opt-in to share)
├── Contribution History
└── Quick Action: Make a Contribution

/endowments/contribute
├── /endowments/family-community (Family-Community Endowment Setup)
│   ├── Select Student (search by name/email)
│   ├── Payment Amount
│   ├── Recurrence (one-time, monthly, quarterly, annual)
│   ├── Plaid Bank Verification
│   ├── Stripe Payment Setup
│   └── Confirmation & Tax Receipt
│
└── /endowments/manage
    ├── Active Subscriptions
    ├── Pause/Resume/Cancel
    ├── Update Payment Method
    └── Download Tax Receipts

/students (Students I Support)
├── Student List
├── Contribution Summary per Student
└── Thank You Messages from Students
```

---

## Instructor Pages

**Authenticated - Instructor Role**

```
/dashboard/instructor (Instructor Dashboard)
├── My Classes (Class Groups)
├── Class Activity Feed
├── Moderation Queue (flagged content from class groups)
└── Quick Action: Create Class Group

/groups/create
├── Create Class Group
│   ├── Class Name, Description
│   ├── Group Type: Class
│   ├── Privacy Level
│   └── Invite Students
│
└── /groups/:group-slug/settings (Group Management)
    ├── Edit Class Info
    ├── Manage Members (students)
    ├── Assign Moderators
    ├── View/Moderate Flagged Content
    └── Class Announcements

/classes (My Classes Overview)
├── Class List
├── Student Roster per Class
└── Class Activity
```

---

## Corporate Sponsor Pages

**Authenticated - Corporate Role**

```
/dashboard/corporate (Corporate Dashboard)
├── My Loyalty Programs
│   ├── Active Programs
│   ├── Drafts
│   └── Ended Programs
├── Subscriber Metrics
│   ├── Total Subscribers
│   ├── Engagement Rates
│   └── Opt-In/Unsubscribe Trends
├── Endowment Contributions Summary
│   ├── Total Contributed
│   ├── Payment Schedule
│   └── Contribution History
├── Program Performance Analytics
│   ├── Views
│   ├── Opt-Ins
│   └── Click-Through Rates
└── Quick Action: Create New Loyalty Program

/loyalty-programs/create
├── Program Name
├── Description
├── Discount/Offer Details
├── Terms & Conditions
├── Logo Upload
├── Endowment Commitment (monthly amount)
└── Submit for Approval

/loyalty-programs/:program-id/edit
├── Edit Program Details
├── View Subscribers
├── Download Subscriber List (with consent)
├── Send Offers/Discount Codes
└── Pause/End Program

/endowments/corporate
├── Payment Setup (Stripe recurring)
├── Endowment Contributions History
├── Tax Receipts
└── General Fund Allocation Report

/subscribers (My Program Subscribers)
├── Subscriber List (students who opted in)
├── Engagement Metrics per Subscriber
└── Communication Tools (send offers)
```

---

## Administrator Pages

**Authenticated - Admin Role**

```
/admin (Admin Dashboard)
├── Platform Overview
│   ├── Total Users (FREE vs PREMIUM breakdown)
│   ├── Total Stories (public, private, group)
│   ├── Total Groups
│   ├── Total Endowment Contributions
│   └── Pending Approvals
├── Recent Activity Feed
├── System Health Indicators
└── Quick Navigation Tiles

/admin/users
├── User Management
│   ├── User List (search, filter by role/tier)
│   ├── User Profile View
│   ├── Suspend User (duration, reason)
│   ├── Ban User (permanent)
│   └── Delete Account
│
└── /admin/users/:user-id
    ├── User Details
    ├── Activity History
    ├── Stories, Comments, Groups
    └── Moderation Actions

/admin/corporates
├── Corporate Applications (pending approval)
│   ├── Application Details
│   ├── Approve/Deny/Request More Info
│   └── Denial Reason
│
├── Active Corporates
│   ├── Corporate List
│   ├── View Dashboard
│   ├── Suspend Loyalty Programs
│   └── Ban Corporate
│
└── /admin/corporates/:corporate-id
    ├── Corporate Profile
    ├── Loyalty Programs
    ├── Subscriber Counts
    ├── Endowment History
    └── Moderation Actions

/admin/moderation
├── Moderation Queue
│   ├── Flagged Stories
│   ├── Flagged Comments
│   ├── Filter by Status (pending, resolved)
│   └── Bulk Actions
│
├── Review Flagged Content
│   ├── Content Preview
│   ├── Flagger Info & Reason
│   ├── Actions: Approve, Hide, Delete, Ban Author
│   └── Action Reason (required)
│
└── Moderation Statistics
    ├── Total Flags Processed
    ├── Approval Rate
    └── Avg Resolution Time

/admin/analytics
├── User Analytics
│   ├── User Growth (FREE vs PREMIUM)
│   ├── Tier Conversion Rate
│   └── User Engagement Metrics
│
├── Content Analytics
│   ├── Stories Published (timeline)
│   ├── Comment Activity
│   └── Group Activity
│
├── Endowment Analytics
│   ├── Total Raised (by source)
│   ├── Contribution Trends
│   └── Corporate Performance
│
└── Export Reports (CSV/PDF)

/admin/audit-log
├── Audit Log Search
│   ├── Filter by Event Type
│   ├── Filter by Date Range
│   ├── Search by User
│   └── Export to CSV
│
└── Log Entry Details
    ├── Event Type
    ├── Actor (user)
    ├── Timestamp
    ├── Description
    └── Related Records

/admin/community-support-pool
├── Community Support Pool Overview
│   ├── Total Funds Available
│   ├── Breakdown by Source
│   └── Students Opted-In
│
├── Allocate Funds
│   ├── Select Recipients (multi-select)
│   ├── Specify Amounts
│   ├── Allocation Reason/Notes
│   └── Confirm & Transfer
│
└── Allocation History
    ├── Past Allocations
    ├── Recipients & Amounts
    └── Transparency Report

/admin/settings
├── Platform Settings
│   ├── Community Guidelines
│   ├── Corporate Sponsor Criteria
│   ├── Moderation Policies
│   └── Endowment Allocation Criteria
│
└── Admin Role Management
    ├── Assign/Revoke Admin Roles
    └── Admin Activity Log
```

---

## Group Pages

**Authenticated - Group Members**

```
/groups (Group Directory)
├── Browse All Groups (public & private listed, secret excluded)
├── Search Groups
├── Filter by Type (Class, Family, Peer Group, Cohort, Club)
├── Filter by Privacy (Public, Private)
├── Suggested Groups (mutual connections, interests)
└── Create Group Button (PREMIUM only)

/groups/my-groups (My Groups)
├── Groups I'm a Member Of
├── Unread Activity Indicators
└── Group Invitations (pending)

/groups/create (PREMIUM only)
├── Group Name, Description
├── Group Type (Class, Family, Peer Group, Cohort, Club, Custom)
├── Privacy Level (Public, Private, Secret)
├── Avatar & Cover Image Upload
└── Submit

/groups/:group-slug (Group Page)
├── Group Header (name, avatar, cover image, member count)
├── Group Feed
│   ├── Pinned Posts
│   ├── Recent Stories (published to group)
│   ├── Announcements (from admins)
│   └── Activity Stream (new members, comments)
│
├── Navigation Tabs
│   ├── Feed
│   ├── Members
│   ├── About
│   └── Settings (admins only)
│
├── Group Actions
│   ├── Join (public groups)
│   ├── Request to Join (private groups)
│   ├── Leave Group
│   └── Invite Members (admins)
│
└── Group Endowment Pool (if enabled)
    ├── Total Raised
    ├── Fundraising Goal
    ├── Top Contributors
    └── Contribute Button

/groups/:group-slug/members
├── Member List
│   ├── Group Admins
│   ├── Moderators
│   ├── Members
│   └── Join Date
│
└── Pending Join Requests (admins only)
    ├── Request Info
    ├── Approve/Deny
    └── Send Invitation

/groups/:group-slug/about
├── Group Description
├── Group Type
├── Privacy Level
├── Created By & Date
└── Group Rules (if set by admin)

/groups/:group-slug/settings (Admins Only)
├── General Settings
│   ├── Edit Name, Description
│   ├── Change Avatar/Cover
│   ├── Change Group Type
│   └── Delete Group
│
├── Members Management
│   ├── View All Members
│   ├── Assign Roles (Admin, Moderator)
│   ├── Remove Members
│   └── Invite New Members
│
├── Privacy Settings
│   ├── Change Privacy Level
│   ├── Who Can Post (All Members, Admins Only)
│   └── Member Invitations (Enable/Disable)
│
├── Moderation
│   ├── Flagged Posts/Comments
│   ├── Remove Content
│   └── Ban from Group
│
└── Endowment Pool (Optional)
    ├── Enable/Disable Pool
    ├── Set Fundraising Goal
    ├── View Contributions
    └── Allocate Funds to Members

/groups/:group-slug/endowment
├── Group Endowment Pool Dashboard
├── Contribute (family-community, sponsors)
├── Contribution History
└── Fund Allocation (admins)
```

---

## Shared Components

**Components used across multiple pages**

```
Header (Global Navigation)
├── Logo (link to /)
├── Search Bar (stories, groups, users)
├── Navigation Menu
│   ├── Home
│   ├── Stories
│   ├── Groups (authenticated)
│   ├── Endowments
│   └── About
│
└── User Menu (authenticated)
    ├── Dashboard
    ├── Profile
    ├── Settings
    ├── Notifications (with unread count)
    └── Logout

Footer
├── About USC Story Generator
├── Privacy Policy
├── Terms of Service
├── Contact
├── Community Guidelines
└── Social Links

Sidebar (Dashboard Pages)
├── User Avatar & Name
├── Tier Badge (FREE/PREMIUM)
├── Quick Links
│   ├── Write New Story
│   ├── My Groups
│   ├── Loyalty Marketplace
│   └── Endowments
│
└── Corporate Sponsor Ads (PREMIUM users)

Story Card (Reusable Component)
├── Story Title
├── Author Avatar & Name
├── Publish Date
├── Excerpt (200 chars)
├── Comment Count
├── View Count
└── Visibility Badge (public/private/group)

Group Card (Reusable Component)
├── Group Avatar
├── Group Name
├── Privacy Badge (Public/Private)
├── Member Count
├── Description Excerpt
└── Join/Request to Join Button

Endowment Widget (Reusable Component)
├── Total Contributions
├── Progress Bar (if goal set)
├── Contributor Count
└── Contribute Button

Comment Thread (Reusable Component)
├── Commenter Avatar & Name
├── Comment Text
├── Timestamp
├── Reply Button
├── Flag Button
└── Nested Replies (max 3 levels)

Notification Dropdown
├── Notification Icon (with unread badge)
├── Notification List (recent 10)
│   ├── Notification Message
│   ├── Timestamp
│   └── Mark as Read
│
├── View All Notifications
└── Mark All as Read

Moderation Queue Item
├── Content Preview
├── Author Info
├── Flagger & Reason
├── Timestamp
└── Actions (Approve, Hide, Delete, Ban)
```

---

## URL Patterns

**Standardized URL structure**

```
Public Pages
/ (homepage)
/stories (story feed)
/stories/:slug (story detail)
/endowments (public dashboard)
/sponsors (sponsor recognition)
/about
/privacy-policy
/terms-of-service
/contact

Authentication
/auth/login
/auth/register
/auth/logout
/auth/callback

User Pages
/dashboard (main dashboard, role-based routing)
/dashboard/family (family-specific)
/dashboard/instructor (instructor-specific)
/dashboard/corporate (corporate-specific)
/profile (own profile)
/profile/:user-id (other user)
/editor/new
/editor/:story-id
/settings/:section (profile, privacy, notifications, endowments, account)

Endowments
/endowments/personal (student endowment summary)
/endowments/contribute (family-community contribution)
/endowments/family-community (setup flow)
/endowments/sponsor (sponsor donation flow)
/endowments/corporate (corporate setup)
/endowments/manage (manage subscriptions)

Loyalty Programs
/loyalty-marketplace (browse programs)
/loyalty-programs/create (corporate creates program)
/loyalty-programs/:program-id (program details)
/loyalty-programs/:program-id/edit

Groups
/groups (directory)
/groups/my-groups
/groups/create (PREMIUM)
/groups/:group-slug (group page)
/groups/:group-slug/members
/groups/:group-slug/about
/groups/:group-slug/settings (admins)
/groups/:group-slug/endowment

Moderation
/moderation (user moderation queue)
/notifications (notification center)

Admin
/admin (admin dashboard)
/admin/users
/admin/users/:user-id
/admin/corporates
/admin/corporates/:corporate-id
/admin/moderation
/admin/analytics
/admin/audit-log
/admin/community-support-pool
/admin/settings
```

---

## Navigation Hierarchy

**Primary Navigation (Header)**

```
For Unauthenticated Users:
- Home
- Stories
- Endowments
- About
- [Login/Register Button]

For Authenticated FREE Tier Students:
- Home
- Stories
- Endowments
- [Upgrade to PREMIUM Badge]
- [User Menu]
  - Dashboard
  - Profile
  - Settings
  - Notifications
  - Logout

For Authenticated PREMIUM Tier Students:
- Home
- Stories
- Groups (+ My Groups badge with unread count)
- Loyalty Marketplace
- Endowments
- [User Menu]
  - Dashboard
  - Profile
  - Settings
  - Notifications
  - Logout

For Authenticated Family Members:
- Home
- Stories
- My Contributions
- Endowments
- [User Menu]
  - Dashboard (Family)
  - Profile
  - Settings
  - Logout

For Authenticated Instructors:
- Home
- Stories
- My Classes
- Groups
- [User Menu]
  - Dashboard (Instructor)
  - Profile
  - Settings
  - Logout

For Authenticated Corporate Sponsors:
- Home
- My Programs
- Subscribers
- Endowments
- [User Menu]
  - Dashboard (Corporate)
  - Profile
  - Settings
  - Logout

For Authenticated Administrators:
- Home
- Admin Dashboard
- [Admin Menu]
  - Users
  - Corporates
  - Moderation
  - Analytics
  - Audit Log
  - Community Support Pool
  - Settings
- [User Menu]
  - Profile
  - Logout
```

---

## Mobile Navigation

**Responsive navigation for mobile devices**

```
Mobile Menu (Hamburger Icon)
├── Home
├── Stories
├── Groups (authenticated PREMIUM)
├── Endowments
├── About
├── Dashboard
├── Profile
├── Settings
├── Notifications
└── Logout

Bottom Navigation Bar (Mobile)
├── Home
├── Explore (Stories + Groups)
├── Create (New Story)
├── Notifications
└── Profile
```

---

## Access Control Summary

**Page access by role and tier**

| Page/Section | Public | FREE Student | PREMIUM Student | Family | Instructor | Corporate | Admin |
|--------------|--------|--------------|-----------------|--------|------------|-----------|-------|
| Homepage | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Story Detail (Public) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Story Detail (Private) | ✗ | ✗ | ✓ (author) | ✗ | ✗ | ✗ | ✓ |
| Story Detail (Group) | ✗ | ✗ | ✓ (members) | ✗ | ✓ (members) | ✗ | ✓ |
| Create Story | ✗ | ✓ (public only) | ✓ (all privacy) | ✗ | ✓ | ✗ | ✓ |
| Create Group | ✗ | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ |
| Groups Directory | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Loyalty Marketplace | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ |
| Endowment Contribute | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ | ✓ |
| Corporate Dashboard | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Admin Dashboard | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |

---

## Search & Discovery

**Search functionality across the platform**

```
Global Search (Header Search Bar)
├── Stories
│   ├── Search by Title, Content, Author
│   ├── Filter by Visibility (public, my stories, group stories)
│   └── Sort by Relevance, Date, Popularity
│
├── Groups
│   ├── Search by Name, Description
│   ├── Filter by Type, Privacy
│   └── Sort by Members, Activity
│
└── Users (if enabled)
    ├── Search by Name
    └── Filter by Role

Story Feed Filters
├── All Stories (public feed)
├── My Feed (stories from groups I'm in - PREMIUM)
├── Following (authors I follow - future)
└── Trending (most commented/viewed)

Group Directory Filters
├── All Groups
├── My Groups
├── Public Groups
├── Private Groups
├── By Type (Class, Family, Peer, Cohort, Club)
└── Suggested (based on connections)
```

---

## Error Pages

**Standard error handling**

```
/404 (Page Not Found)
├── Message: "Page not found"
├── Suggestion: Search or return home
└── Link to Homepage

/403 (Access Denied)
├── Message: "You don't have permission to view this page"
├── Reason (e.g., "This story is visible to group members only")
└── Action (e.g., "Request to join group" or "Upgrade to PREMIUM")

/500 (Server Error)
├── Message: "Something went wrong"
├── Suggestion: Try again or contact support
└── Link to Homepage

/503 (Service Unavailable)
├── Message: "We're experiencing technical difficulties"
├── Estimated resolution time
└── Status page link
```

---

## Onboarding Flow

**New user onboarding sequence**

```
1. Landing Page (/)
   ↓ Click "Register"

2. Auth0 Registration (/auth/register)
   ↓ Email/Password or Social Login

3. Role Selection
   ↓ Choose: Student, Family, Instructor, Community

4. Tier Introduction (Students Only)
   ↓ Explanation of FREE vs PREMIUM

5. Profile Setup (/profile/setup)
   ↓ Name, Bio, Avatar

6. Welcome to Dashboard
   ↓ Quick tour (tooltips)

7. First Action Prompt
   - Students: "Write your first story"
   - Family: "Support a student"
   - Instructor: "Create a class group"
   - Corporate: "Create loyalty program"

8. Onboarding Complete
   ↓ Redirect to Dashboard
```

---

## Notification Types

**In-app and email notifications**

```
Story Notifications
- New comment on your story
- Reply to your comment
- Your story was published
- Your story was flagged (author)

Group Notifications
- Invitation to join group
- Join request approved
- New post in group
- New member joined group
- You were promoted to admin/moderator

Endowment Notifications
- New contribution received
- Upcoming payment reminder
- Payment succeeded/failed
- Thank you message from student

Loyalty Program Notifications
- New loyalty program available
- Discount code received
- Program you're subscribed to updated

Moderation Notifications
- Content you flagged was reviewed
- Your content was flagged
- Your content was hidden/deleted
- Action taken on your report

Admin Notifications
- New corporate application pending
- New flagged content to review
- User report submitted
- System alert (payment failures, etc.)
```

---

## Breadcrumb Navigation

**Breadcrumb patterns for deep pages**

```
Story Detail:
Home > Stories > [Story Title]

Group Story Detail:
Home > Groups > [Group Name] > [Story Title]

Group Settings:
Home > Groups > [Group Name] > Settings

User Profile:
Home > Users > [Username]

Admin Pages:
Home > Admin > [Section] > [Subsection]

Example:
Home > Admin > Corporates > [Corporate Name]
```

---

## Sitemap.xml Structure

**For SEO and search engines**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Public Pages -->
  <url>
    <loc>https://usc-story-generator.com/</loc>
    <priority>1.0</priority>
    <changefreq>daily</changefreq>
  </url>

  <url>
    <loc>https://usc-story-generator.com/stories</loc>
    <priority>0.9</priority>
    <changefreq>daily</changefreq>
  </url>

  <url>
    <loc>https://usc-story-generator.com/endowments</loc>
    <priority>0.8</priority>
    <changefreq>weekly</changefreq>
  </url>

  <url>
    <loc>https://usc-story-generator.com/sponsors</loc>
    <priority>0.7</priority>
    <changefreq>weekly</changefreq>
  </url>

  <!-- Public Stories (dynamically generated) -->
  <url>
    <loc>https://usc-story-generator.com/stories/[slug]</loc>
    <priority>0.6</priority>
    <changefreq>weekly</changefreq>
  </url>

  <!-- Public Groups (dynamically generated) -->
  <url>
    <loc>https://usc-story-generator.com/groups/[slug]</loc>
    <priority>0.5</priority>
    <changefreq>weekly</changefreq>
  </url>

  <!-- Static Pages -->
  <url>
    <loc>https://usc-story-generator.com/about</loc>
    <priority>0.6</priority>
    <changefreq>monthly</changefreq>
  </url>

  <url>
    <loc>https://usc-story-generator.com/privacy-policy</loc>
    <priority>0.4</priority>
    <changefreq>monthly</changefreq>
  </url>

  <url>
    <loc>https://usc-story-generator.com/terms-of-service</loc>
    <priority>0.4</priority>
    <changefreq>monthly</changefreq>
  </url>

  <!-- Authenticated pages excluded from sitemap -->

</urlset>
```

---

## Meta Navigation

**Special utility pages**

```
/sitemap (Human-Readable Sitemap)
├── Public Pages
├── User Pages
├── Group Pages
└── Admin Pages

/style-guide (Design System Reference)
├── Typography
├── Colors
├── Components
├── Icons
└── Accessibility

/api-docs (API Documentation - if exposed)
├── REST API Endpoints
├── Authentication
├── Rate Limits
└── Examples

/status (Platform Status Page)
├── System Status
├── Uptime History
├── Incident Reports
└── Planned Maintenance
```

---

**End of Sitemap**

**Last Updated:** 2025-12-10
**Maintained By:** Product Owner (Sarah)
**Next Review:** Post-UX/IA Design Phase

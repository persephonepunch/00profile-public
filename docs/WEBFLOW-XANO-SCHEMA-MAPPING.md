# Webflow ↔ Xano Schema Mapping

## Data Location Strategy

| Data Type | Location | Reason |
|-----------|----------|--------|
| **Users/Auth** | Xano only | Sensitive - passwords, tokens |
| **Invites** | Xano only | Security tokens |
| **Family Relationships** | Xano only | Permission logic |
| **Loans/Payments** | Xano only | Financial data |
| **Privacy Settings** | Xano only | User preferences |
| **Stories** | Both | Public content, sync bidirectional |
| **Profiles** | Both | Public profiles, sync bidirectional |
| **Support Cards** | Both | Display in Webflow, manage in Xano |
| **Cohorts/Classes** | Both | Display in Webflow, auth checks in Xano |
| **Instructors** | Both | Public profiles |
| **Majors** | Webflow only | Static reference data |
| **Tags** | Webflow only | Static reference data |

---

## Webflow Collection: Support Cards

Create in Webflow CMS with these fields:

| Field Name | Field Type | Maps to Xano |
|------------|------------|--------------|
| `Name` | Plain Text | `card_title` |
| `Slug` | Slug | auto-generated |
| `Card Subtitle` | Plain Text | `card_subtitle` |
| `Card Type` | Option (one-time, subscription, custom) | `card_type` |
| `Description` | Rich Text | `description` |
| `Price Amount` | Number | `price_amount` |
| `Price Recurring` | Plain Text | `price_recurring` |
| `CTA Text` | Plain Text | `cta_text` |
| `Stripe Embed Code` | Plain Text (long) | `stripe_embed_code` |
| `Stripe Payment Link` | Link | `stripe_payment_link` |
| `Card Images` | Multi-Image | `card_images` (JSON) |
| `Card Color` | Color | `card_color` |
| `Visibility` | Option (public, family_only, private) | `visibility` |
| `Display Order` | Number | `display_order` |
| `Student Profile` | Reference → Profiles | `student_user_id` (via lookup) |
| `Xano ID` | Number | `id` (Xano primary key) |
| `Is Active` | Switch | `is_active` |

---

## Webflow Collection: Cohorts (Classes)

Create/update your **Classes** collection:

| Field Name | Field Type | Maps to Xano |
|------------|------------|--------------|
| `Name` | Plain Text | `name` |
| `Slug` | Slug | auto-generated |
| `Description` | Rich Text | `description` |
| `Academic Year` | Plain Text | `academic_year` |
| `Semester` | Option (fall, spring, summer) | `semester` |
| `Start Date` | Date | `start_date` |
| `End Date` | Date | `end_date` |
| `Status` | Option (upcoming, active, completed, archived) | `status` |
| `Instructor` | Reference → Instructors | `created_by_user_id` |
| `Xano ID` | Number | `id` |

---

## Webflow Collection: Instructors

Update your **Instructors** collection:

| Field Name | Field Type | Maps to Xano |
|------------|------------|--------------|
| `Name` | Plain Text | `first_name` + `last_name` |
| `Slug` | Slug | auto-generated |
| `Email` | Email | `email` |
| `Photo` | Image | `profile_image_url` |
| `Bio` | Rich Text | (add to users table) |
| `Phone` | Phone | `phone` |
| `Xano User ID` | Number | `id` (users table) |

---

## Webflow Collection: Profiles (Students)

Your existing **Profiles** collection - add these fields:

| Field Name | Field Type | Maps to Xano |
|------------|------------|--------------|
| `Xano User ID` | Number | `id` (users table) |
| `Has Support Cards` | Switch | computed from support_cards |
| `Cohort` | Reference → Classes | via user_cohorts |

---

## Sync Endpoints to Create in Xano

### 1. Webflow → Xano Webhook (Support Cards)

When a support card is edited in Webflow:

```
POST /webhooks/webflow/support-cards
```

### 2. Xano → Webflow Sync (Support Cards)

Push support card to Webflow after creation:

```
POST /support-cards/sync/{card_id}
```

### 3. Profile/User Link Sync

When user registers, create/link Webflow profile:

```
POST /users/sync-profile/{user_id}
```

---

## XanoScript: Sync Support Card to Webflow

```json
{
  "type": "endpoint",
  "name": "/support-cards/sync/{card_id}",
  "method": "POST",
  "authentication": "required",
  "function_stack": [
    {
      "method": "requiresAuth"
    },
    {
      "comment": "Get card from Xano"
    },
    {
      "method": "dbGetSingle",
      "table": "support_cards",
      "filter": {"id": "$input.card_id"},
      "output": "card"
    },
    {
      "comment": "Get student's Webflow profile ID"
    },
    {
      "method": "dbGetSingle",
      "table": "users",
      "filter": {"id": "$card.student_user_id"},
      "output": "student"
    },
    {
      "comment": "Build Webflow item payload"
    },
    {
      "method": "var",
      "name": "webflow_data",
      "value": {
        "fieldData": {
          "name": "$card.card_title",
          "slug": "$card.card_title|slugify ~ '-' ~ $card.id",
          "card-subtitle": "$card.card_subtitle",
          "card-type": "$card.card_type",
          "description": "$card.description",
          "price-amount": "$card.price_amount",
          "price-recurring": "$card.price_recurring",
          "cta-text": "$card.cta_text",
          "stripe-embed-code": "$card.stripe_embed_code",
          "stripe-payment-link": "$card.stripe_payment_link",
          "card-color": "$card.card_color",
          "visibility": "$card.visibility",
          "display-order": "$card.display_order",
          "xano-id": "$card.id",
          "is-active": "$card.is_active"
        }
      }
    },
    {
      "comment": "Create or update in Webflow"
    },
    {
      "method": "conditional",
      "condition": "$card.webflow_item_id == null",
      "then": [
        {
          "method": "externalApiRequest",
          "url": "'https://api.webflow.com/v2/collections/' ~ $env.WEBFLOW_SUPPORT_CARDS_COLLECTION ~ '/items'",
          "method_type": "POST",
          "headers": {
            "Authorization": "'Bearer ' ~ $env.WEBFLOW_TOKEN",
            "Content-Type": "application/json"
          },
          "body": "$webflow_data",
          "output": "webflow_response"
        },
        {
          "method": "dbEdit",
          "table": "support_cards",
          "filter": {"id": "$card.id"},
          "data": {"webflow_item_id": "$webflow_response.id"}
        }
      ],
      "else": [
        {
          "method": "externalApiRequest",
          "url": "'https://api.webflow.com/v2/collections/' ~ $env.WEBFLOW_SUPPORT_CARDS_COLLECTION ~ '/items/' ~ $card.webflow_item_id",
          "method_type": "PATCH",
          "headers": {
            "Authorization": "'Bearer ' ~ $env.WEBFLOW_TOKEN",
            "Content-Type": "application/json"
          },
          "body": "$webflow_data",
          "output": "webflow_response"
        }
      ]
    },
    {
      "method": "response",
      "data": {"success": true, "webflow_item_id": "$webflow_response.id"}
    }
  ]
}
```

---

## Environment Variables Needed

Add to Xano environment:

```
WEBFLOW_TOKEN=your-webflow-api-token
WEBFLOW_SITE_ID=your-site-id
WEBFLOW_SUPPORT_CARDS_COLLECTION=collection-id-here
WEBFLOW_PROFILES_COLLECTION=existing-profiles-collection-id
WEBFLOW_CLASSES_COLLECTION=classes-collection-id
```

---

## Sync Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      STUDENT CREATES CARD                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Webflow/11ty) → XanoAuth.createSupportCard()     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Xano: POST /support-cards                                   │
│  → Creates record in support_cards table                     │
│  → Triggers sync to Webflow CMS                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Webflow CMS: Support Cards collection updated               │
│  → Card visible on student's public profile                  │
│  → Visibility filtered by auth (public/family/private)       │
└─────────────────────────────────────────────────────────────┘

─────────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    ADMIN EDITS IN WEBFLOW                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Webflow Webhook → POST /webhooks/webflow/support-cards      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  Xano: Updates support_cards table                           │
│  → Uses xano-id field to match records                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Create Support Cards collection** in Webflow with fields above
2. **Add Xano ID field** to existing Profiles collection
3. **Get Webflow collection IDs** from CMS settings
4. **Add environment variables** to Xano
5. **Create sync endpoints** in Xano
6. **Set up Webflow webhook** for bidirectional sync

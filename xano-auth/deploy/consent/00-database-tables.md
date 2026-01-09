# Consent & Peer Transaction Database Tables

## Xano Setup Instructions

1. Go to your Xano workspace
2. Navigate to **Database** → **Add Table**
3. Create each table below with the specified fields

---

## Table 1: consent_records

Tracks user consent preferences and history.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | int (auto) | Yes | - | Primary key |
| `user_id` | int | Yes | - | FK to `users` table |
| `consent_type` | enum | Yes | - | Values: `peer_offers`, `sponsor_offers`, `marketing` |
| `granted` | bool | Yes | `false` | Current consent status |
| `granted_at` | timestamp | No | - | When consent was given |
| `revoked_at` | timestamp | No | - | When consent was revoked |
| `ip_address` | text | No | - | Audit trail |
| `user_agent` | text | No | - | Browser/device info |
| `created_at` | timestamp | Yes | `now` | Record created |

**Indexes:**
- `user_id` (for lookups)
- `user_id + consent_type` (unique composite)

---

## Table 2: peer_transactions

Tracks peer-to-peer offers, coupons, and requests.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | int (auto) | Yes | - | Primary key |
| `sender_id` | int | Yes | - | FK to `users` (who sent) |
| `recipient_id` | int | Yes | - | FK to `users` (who receives) |
| `offer_id` | int | No | - | FK to `offers` (if sponsor offer) |
| `type` | enum | Yes | - | Values: `coupon`, `offer`, `gift`, `request` |
| `status` | enum | Yes | `pending` | Values: `pending`, `accepted`, `declined`, `expired` |
| `message` | text | No | - | Optional note from sender |
| `value_type` | text | No | - | `fixed`, `percentage`, `item` |
| `value_amount` | decimal | No | - | Dollar amount or percentage |
| `value_description` | text | No | - | What the offer is for |
| `expires_at` | timestamp | No | - | When offer expires |
| `responded_at` | timestamp | No | - | When accepted/declined |
| `created_at` | timestamp | Yes | `now` | When sent |

**Indexes:**
- `sender_id` (for sent history)
- `recipient_id` (for inbox)
- `recipient_id + status` (for pending inbox)

---

## Table 3: offers

Sponsor/business offers that can be shared peer-to-peer.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | int (auto) | Yes | - | Primary key |
| `sponsor_id` | int | Yes | - | FK to `users` (sponsor/business) |
| `title` | text | Yes | - | Offer name |
| `description` | text | No | - | Details |
| `terms` | text | No | - | Legal terms |
| `value_type` | text | Yes | - | `fixed`, `percentage`, `item` |
| `value_amount` | decimal | No | - | Dollar amount or percentage |
| `code` | text | No | - | Redemption code |
| `image_url` | text | No | - | Offer image |
| `expires_at` | timestamp | No | - | Expiration |
| `max_claims` | int | No | - | Total claim limit |
| `claims_count` | int | No | `0` | Current claims |
| `is_active` | bool | Yes | `true` | Available to share |
| `created_at` | timestamp | Yes | `now` | Created |

**Indexes:**
- `sponsor_id` (for sponsor's offers)
- `is_active + expires_at` (for available offers)

---

## Table 4: user_blocks

Users can block other users from sending them offers.

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | int (auto) | Yes | - | Primary key |
| `user_id` | int | Yes | - | User who blocked |
| `blocked_user_id` | int | Yes | - | User who is blocked |
| `created_at` | timestamp | Yes | `now` | When blocked |

**Indexes:**
- `user_id + blocked_user_id` (unique composite)

---

## Add to Existing `users` Table

Add these fields to your existing `users` table:

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `can_receive_peer_offers` | bool | No | `false` | Opt-in for peer offers |
| `can_receive_sponsor_offers` | bool | No | `false` | Opt-in for sponsor offers |
| `profile_visibility` | enum | No | `private` | Values: `private`, `friends`, `public` |
| `show_in_directory` | bool | No | `false` | Appear in peer search |

---

## Relationships Diagram

```
users
  ├── consent_records (1:many)
  ├── peer_transactions as sender (1:many)
  ├── peer_transactions as recipient (1:many)
  ├── offers as sponsor (1:many)
  └── user_blocks (1:many)

offers
  └── peer_transactions (1:many)
```

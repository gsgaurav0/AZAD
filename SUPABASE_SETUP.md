# Mewak Luxury Audio & Hardware — Complete Supabase & Production Backend Guide

This document provides complete, step-by-step instructions for running the production-ready Supabase backend, database schema, authentication, storage buckets, Razorpay payments, and server-side operations for the Mewak luxury e-commerce platform.

---

## 1. Architecture & Security Overview

The platform uses a hardened, modern full-stack architecture built on Next.js 16 (App Router), Supabase PostgreSQL, Supabase SSR Auth, Supabase Storage, and Razorpay payment infrastructure.

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js App Router Frontend               │
│   (Storefront, Luxury Catalog, Cart, Wishlist, Account)     │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
    ┌────────────────────┐          ┌──────────────────────┐
    │  Supabase Client   │          │  Next.js Server APIs │
    │   (SSR Cookies)    │          │  (/api/checkout,     │
    │   - Profile CRUD   │          │   /api/payments,     │
    │   - Addresses CRUD │          │   /api/newsletter)   │
    │   - Storage upload │          └──────────┬───────────┘
    └──────────┬─────────┘                     │
               │ RLS Protected                 │ Service Role
               ▼                               ▼
    ┌─────────────────────────────────────────────────────────┐
    │                 Supabase PostgreSQL                     │
    │   • 14 RLS-protected tables                             │
    │   • Atomic RPCs (place_order_atomic)                    │
    │   • Storage Buckets (products, avatars, reviews, etc.)  │
    └─────────────────────────────────────────────────────────┘
```

### Security & Hardening Highlights
- **Row Level Security (RLS)**: Enforced across all 14 tables. Customers can only read and write their own data (`auth.uid() = user_id`). Administrators verified via `public.is_admin()` or the server-side Service Role key.
- **Server-Side Price & Stock Verification**: `/api/checkout` directly queries Supabase `products` to verify the price and variant stock for every item, independently recalculating subtotal, coupon discounts, taxes, and shipping on the server. Client-submitted prices are never trusted.
- **Razorpay Cryptographic Verification**: Payments are verified using HMAC SHA-256 (`crypto.createHmac('sha256', secret)`) comparing the order ID and payment ID against the client signature.
- **Webhook Idempotency**: Payment webhooks at `/api/payments/razorpay/webhook` verify signatures before updating order status to prevent duplicate processing.
- **Zero Exposed Secrets**: `SUPABASE_SERVICE_ROLE_KEY` and `RAZORPAY_KEY_SECRET` are strictly isolated to server API routes and never exposed to the browser.

---

## 2. Environment Configuration

Copy `.env.example` to `.env.local` for local development:

```bash
cp .env.example .env.local
```

### Environment Variables Reference

| Variable | Description | Location |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL (`https://<project-ref>.supabase.co`) | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key (browser-safe, RLS-enforced) | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Secret Service Role Key (server-only, bypasses RLS) | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay Key ID (`rzp_test_...` or `rzp_live_...`) | Razorpay Dashboard > Settings > API Keys |
| `RAZORPAY_KEY_ID` | Razorpay Key ID for server API requests | Razorpay Dashboard > Settings > API Keys |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key for server signature verification | Razorpay Dashboard > Settings > API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Secret token configured for Razorpay webhooks | Razorpay Dashboard > Webhooks |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL (`http://localhost:3000` or production domain) | Your domain hosting settings |

---

## 3. Database Migration & Schema Setup

### Option A: Using the Supabase Dashboard (Recommended)

1. Open your Supabase project: [https://supabase.com/dashboard/project/plkrmovgjllfyfopqmin](https://supabase.com/dashboard/project/plkrmovgjllfyfopqmin)
2. In the left navigation, click on **SQL Editor**.
3. Click **New query**.
4. Open the migration file in this repository:
   `supabase/migrations/20261115000000_complete_mewak_schema.sql`
5. Copy the entire contents, paste into the SQL Editor, and click **Run**.
6. After the schema completes, open a second query tab.
7. Open `supabase/seed.sql`, paste its contents, and click **Run**.

### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your Supabase project
supabase link --project-ref plkrmovgjllfyfopqmin

# Push migrations to remote database
supabase db push

# Run seed script
supabase db execute --file ./supabase/seed.sql
```

---

## 4. Tables Created by the Schema

| Table Name | Description | RLS Policy |
| :--- | :--- | :--- |
| `categories` | Product departments (headphones, phones, smartwatches, accessories) | Public read, admin write |
| `products` | Flagship hardware catalog, variant inventory, specs, review scores | Public read, admin write |
| `profiles` | Customer profiles, contact details, company, GST, member tier | Owner read/write, admin read |
| `addresses` | Customer delivery addresses with default selection | Owner read/write, admin read |
| `cart_items` | Customer persistent shopping cart synchronized across devices | Owner read/write |
| `wishlist_items` | Customer saved wishlist items | Owner read/write |
| `coupons` | Database-managed discount codes with usage limits and expiry | Public read active, admin write |
| `coupon_redemptions`| Redemption ledger tracking customer usage limits | Owner read, server write |
| `orders` | Completed orders, line items, address snapshots, tracking | Owner read, admin read/write |
| `reviews` | Customer ratings, reviews, verified badges, moderation status | Public read approved, author write |
| `returns` | Return & exchange requests, defect reasons, evidence photos | Owner read/write, admin write |
| `inquiries` | Customer support concierge tickets & warranty requests | Public insert, admin read/write |
| `newsletter_subscribers` | Newsletter subscriptions with email deduplication | Public insert, admin read |
| `cms_settings` | Dynamic store configuration, hero banners, social links, announcements | Public read, admin write |

---

## 5. Supabase Storage Buckets

The migration automatically creates 4 storage buckets in Supabase Storage:

1. **`products`** (Public)
   - Used by the Admin dashboard for product cover images and gallery photos.
   - Size limit: 10MB per file.
   - Allowed types: `image/jpeg`, `image/png`, `image/webp`, `image/avif`.

2. **`avatars`** (Public)
   - Used by customers in `/account` to upload custom profile photos.
   - Size limit: 5MB per file.

3. **`reviews`** (Public)
   - Used by customers to attach product photos to verified reviews.
   - Size limit: 5MB per file.

4. **`returns`** (Private / Authenticated)
   - Used by customers in `/account` to upload return evidence photos (e.g. damaged transit box).
   - Read access restricted to authenticated owners and admins using 7-day signed URLs.

### Verifying Buckets in Dashboard
Navigate to **Storage** in the Supabase Dashboard. You will see all 4 buckets active with their security policies configured.

---

## 6. Authentication Setup

### Email & Password Authentication
- Enabled by default in Supabase.
- When customers sign up, an automatic Postgres trigger (`on_auth_user_created`) provisions a matching row in `public.profiles`.
- Email confirmation and password recovery links route through:
  `https://your-domain.com/auth/callback?next=/account`
- Password reset confirmation is handled at `/auth/reset-password`.

### Phone Number OTP Authentication
1. Go to **Authentication** > **Providers** > **Phone** in your Supabase Dashboard.
2. Enable the **Phone** provider.
3. Select your SMS gateway provider (e.g., **Twilio**, **MessageBird**, or **Vonage**).
4. Enter your Account SID, Auth Token, and Sender Number.
5. In development/testing, you can add Test Phone Numbers under **Authentication** > **Phone Auth** (e.g. `+91 9812345678` with token `8528`).

---

## 7. Razorpay Payment Gateway Integration

### API Keys
1. Sign in to your [Razorpay Dashboard](https://dashboard.razorpay.com/).
2. Navigate to **Settings** > **API Keys**.
3. Generate a Key Pair (**Key ID** and **Key Secret**).
4. Add them to `.env.local`:
   ```env
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_ID=rzp_test_...
   RAZORPAY_KEY_SECRET=...
   ```

### Webhook Configuration
1. In the Razorpay Dashboard, navigate to **Settings** > **Webhooks**.
2. Click **Add New Webhook**.
3. Set the **Webhook URL** to:
   `https://your-domain.com/api/payments/razorpay/webhook`
4. Set a strong **Secret** and add it to `RAZORPAY_WEBHOOK_SECRET` in your environment.
5. Enable the following events:
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
   - `refund.failed`

---

## 8. Customer Journey Testing Checklist

| Step | Action | Expected Result |
| :--- | :--- | :--- |
| 1 | Register new customer at `/login` | Creates Auth user and `profiles` row in Supabase |
| 2 | Log in with email or phone | Session token stored in SSR cookie, navbar shows user name |
| 3 | Browse products at `/shop` | Products loaded dynamically from Supabase `products` table |
| 4 | Add item to cart | Item stored in local state and synchronized with `cart_items` in Supabase |
| 5 | Apply coupon (e.g. `WELCOME10` or `MEWAK20`) | Discount validated against Supabase `coupons` table |
| 6 | Proceed to `/checkout` | Delivery address saved to `addresses`; price and stock checked server-side |
| 7 | Pay via Razorpay or Cash on Delivery | Order created in `orders` table; Razorpay signature verified |
| 8 | View order at `/account` | Live tracking status history displayed from `orders` table |
| 9 | Request Return with photo | Photo uploaded to `returns` bucket; record created in `returns` table |
| 10 | Superadmin at `/admin` | Update order status to `Packed`/`Shipped`/`Refunded`; product CRUD works |

---

## 9. Production Deployment (Vercel)

1. Push your repository to GitHub / GitLab / Bitbucket.
2. In the Vercel dashboard, click **Import Project**.
3. Add all environment variables from `.env.local` to the Vercel Project Settings under **Environment Variables**.
4. In Supabase Dashboard > **Authentication** > **URL Configuration**:
   - Set **Site URL** to your production domain: `https://your-domain.vercel.app`.
   - Add `https://your-domain.vercel.app/**` to **Redirect URLs**.
5. Deploy.

# STRIDE — Premium Footwear E-Commerce Platform

A full-stack e-commerce platform for the Kenyan market built with Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Prisma/PostgreSQL (Neon), and NextAuth. Includes a storefront, customer accounts, M-Pesa STK push + COD checkout, and an admin panel with RBAC and subscription/suspension billing.

## Features

- **Storefront**: product catalog with filters (category, brand, size, colour, price), search, featured/new/best-seller rails, product pages with gallery and reviews
- **Cart & checkout**: guest and signed-in carts (DB-backed, merged at login), multi-step checkout (shipping → payment), M-Pesa STK push and cash on delivery
- **Accounts**: register/login (credentials + Google), order history, wishlist, address book
- **Admin**: product/variant/inventory management, orders, settings, shipping zones, store branding; staff roles with subscription billing and automatic suspension
- **Platform**: Redis caching (Upstash), rate limiting (per-user when authenticated), Sentry error tracking, cookie consent, strict CSP in production, SEO metadata/sitemap/robots

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.5
- **Styling**: Tailwind CSS v4, shadcn-style UI components, Radix primitives
- **Data**: Prisma 6 + PostgreSQL (Neon), Upstash Redis for cache + rate limiting
- **Auth**: NextAuth v4 (JWT sessions) with credentials + Google providers, `@auth/prisma-adapter`
- **Payments**: Safaricom M-Pesa Daraja API (STK push, callback webhook)
- **Quality**: ESLint 9 (flat config), Vitest, Playwright (e2e), Sentry
- **Infra**: Deployed on Vercel; assets on Cloudflare R2 / Cloudinary

## Prerequisites

- Node.js **20.9+** (required by Next.js 16)
- npm (the repo ships `.npmrc` with `legacy-peer-deps=true`)

## Getting Started

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd stride
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

At minimum set:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon recommended) |
| `AUTH_SECRET` | JWT signing secret (generate with `openssl rand -base64 32`) |
| `NEXT_PUBLIC_TAX_RATE` | VAT rate as decimal (e.g. `0.16`) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Cache + rate limiting (optional; features degrade gracefully) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Google OAuth (optional) |
| `MPESA_CONSUMER_KEY` / `MPESA_CONSUMER_SECRET` / `MPESA_PASSKEY` / `MPESA_SHORTCODE` | M-Pesa Daraja (sandbox vars supported) |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Error tracking (optional) |

3. Prepare the database and generate the Prisma client:

```bash
npx prisma generate
npx prisma db push
```

4. Seed catalog data (brands, categories, products, CMS pages):

```bash
npm run prisma:seed
```

> **Note**: the seed creates **no user accounts** — this is intentional. Create customers through the register page and promote staff/admin roles directly in the database (`role` column on `User`, values `CUSTOMER`, `STAFF`, `ADMIN`, `SUPER_ADMIN`).

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev          # development server (Turbopack)
npm run build        # production build
npm run start        # start production build
npm run lint         # ESLint (flat config)
npm run typecheck    # tsc --noEmit
npm test             # Vitest unit tests
npm run test:e2e     # Playwright e2e (requires E2E_* credentials, see below)
npm run prisma:seed  # seed catalog data
```

## E2E Tests

Playwright specs for auth flows skip automatically unless credentials are provided. Set these in the environment to run them:

```bash
export E2E_ADMIN_EMAIL=...
export E2E_ADMIN_PASSWORD=...
export E2E_CUSTOMER_EMAIL=...
export E2E_CUSTOMER_PASSWORD=...
npm run test:e2e
```

## Security Notes

- Passwords are bcrypt-hashed (cost 12); registration enforces 8+ chars with mixed case and a number
- Accounts are locked for 15 minutes after 5 failed login attempts
- All mutations require CSRF tokens; admin APIs are staff-gated; checkout re-verifies totals server-side in integer cents
- Rate limiting is keyed per-user when authenticated, per-IP otherwise
- Production CSP forbids `unsafe-eval`; `frame-ancestors 'none'`, HSTS, and standard security headers are set in `next.config.ts`
- The M-Pesa callback is idempotent (terminal-state guarded) and rejects callbacks from non-whitelisted IPs in production

## Database Migrations

`prisma/migrations/` is gitignored; schema changes are applied to the hosted database with `prisma db push` (or manually managed migrations for production). Always run `npx prisma generate` after schema changes.

## Project Structure

```
src/
├── app/
│   ├── api/            # Route handlers (auth, checkout, mpesa, admin, reviews, ...)
│   ├── admin/          # Admin panel (orders, products, settings, billing)
│   ├── auth/           # Login / register / error pages
│   ├── account/        # Customer dashboard (orders, wishlist, addresses)
│   ├── cart/           # Cart + checkout
│   ├── products/       # Catalog listing + detail
│   └── ...             # Static pages (privacy, terms, cookie policy, about, ...)
├── components/         # UI components (layout, cart, products, ui)
├── hooks/              # Shared React hooks
├── lib/                # Services, validation, auth, cache, money helpers, types
└── e2e/                # Playwright specs (repo root)
prisma/
├── schema.prisma       # Data model
└── migrations/         # Manual SQL migrations (gitignored)
```

## Deployment

Deploy on Vercel. The production build requires all secrets in the Vercel project settings, and a Neon (or equivalent) database. Note `@sentry/nextjs` >= 10 is pinned to match Next.js 16 peer requirements.

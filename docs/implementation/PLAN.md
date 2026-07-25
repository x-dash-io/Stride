# Production Implementation Plan

## Overview
Transform the V0 demo into a production-ready Kenyan footwear e-commerce platform by rewriting the existing codebase with proper backend, database, payments, and compliance.

## Tech Stack (2026 Standards)
- Next.js 15 App Router + React 19
- Prisma ORM 6 + PostgreSQL (Neon) + Prisma Accelerate
- Auth.js v5 (NextAuth) with Prisma Adapter
- M-Pesa Daraja API (STK Push)
- Tailwind CSS 4 + shadcn/ui (Radix primitives)
- Server Actions with Zod validation
- TanStack Query for client state

## Phase Breakdown

### Phase 1: Foundation (Week 1-2)
- Project setup with current dependencies
- Prisma schema (simplified from demo requirements)
- Auth.js v5 configuration (Credentials + Google only)
- Database connection with Accelerate
- CI/CD pipeline

### Phase 2: Core Backend (Week 2-4)
- Server Actions for cart, checkout, orders
- Product/catalog queries (RSC pattern)
- Inventory management
- M-Pesa Daraja integration (STK Push + callbacks)
- Order processing with inventory reservation

### Phase 3: Frontend Rewrite (Week 4-6)
- Convert demo pages to RSC + Client Components
- Product listing with server-side filtering
- Product detail with variants, reviews
- Cart drawer + checkout flow
- M-Pesa payment UI with polling

### Phase 4: Admin Dashboard (Week 6-7)
- Protected admin routes
- Product/brand/category management
- Order management
- Basic analytics

### Phase 5: Infrastructure & Launch (Week 7-8)
- Docker compose for local development
- Vercel + Neon deployment
- Environment configuration
- Load testing
- Go-live checklist

## Simplified Data Model (vs Original 997-line schema)

### Core Entities
- User (Auth.js compatible)
- Address
- Brand
- Category (hierarchical)
- Product
- ProductVariant (size + color combinations)
- ProductImage
- Inventory (per variant, per warehouse)
- Cart + CartItem
- Order + OrderItem
- PaymentTransaction
- Review
- Wishlist
- Collection/Banner (CMS)

### Removed (Not Needed for MVP)
- Loyalty system
- Gift cards
- Coupons (complex rules)
- Compare lists
- Recently viewed
- Activity logs
- Daily snapshots
- Complex permissions/RBAC (use simple role field)
- eTIMS tax compliance (business not registered)

## M-Pesa Integration Requirements
- Sandbox credentials from developer.safaricom.co.ke
- STK Push initiation (CustomerPayBillOnline)
- Callback endpoint with IP whitelisting
- Status polling via STK Push Query
- Phone number normalization (2547XXXXXXXX format)

## Auth Configuration
- Providers: Credentials (email/password) + Google OAuth
- Session: JWT (stateless, edge-compatible)
- Role field on User: "customer" | "admin"
- Middleware protection for /account, /admin, /cart/checkout

## Deployment Targets
- Vercel (Next.js)
- Neon PostgreSQL (with connection pooling)
- Prisma Accelerate (global connection pool + cache)
- Upstash Redis (rate limiting, sessions if needed)

## File Structure (Rewriting Existing)
```
src/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── cart/
│   │   │   ├── page.tsx
│   │   │   └── checkout/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── account/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       └── orders/
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── products/
│   │   └── orders/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── mpesa/callback/route.ts
│   └── actions/
│       ├── cart.ts
│       ├── checkout.ts
│       ├── orders.ts
│       └── admin.ts
├── lib/
│   ├── prisma.ts
│   ├── mpesa.ts
│   ├── auth.ts
│   ├── queries.ts
│   └── validations.ts
├── components/
│   ├── ui/ (shadcn)
│   ├── layout/
│   ├── products/
│   ├── cart/
│   ├── checkout/
│   └── admin/
├── hooks/
├── providers/
└── types/
```

## Success Criteria
- Page loads < 2s on 3G mobile
- M-Pesa payments work end-to-end
- Admin can manage full catalog
- Orders process with inventory accuracy
- WCAG AA accessible
- SEO-ready (metadata, sitemap, structured data)
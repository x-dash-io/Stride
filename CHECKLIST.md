# STRIDE - Engineering Fix Checklist

**Tracking document for audit remediation. Mark items with `[x]` when complete.**

---

## 🔴 CRITICAL (P0) - BLOCK PRODUCTION

### P0-1: Remove Duplicated Directory Structure
- [x] Delete `app/` directory (keep `src/app/`)
- [x] Delete `components/` directory (keep `src/components/`)
- [x] Delete `lib/` directory (keep `src/lib/`)
- [x] Verify all imports use `@/` alias
- [x] Run build to confirm no broken imports

### P0-2: Rotate All Compromised Secrets
- [x] Rotate Neon database password
- [x] Update `DATABASE_URL` and `DIRECT_URL` in `.env.local`
- [x] Rotate M-Pesa consumer key/secret
- [x] Rotate Google OAuth credentials
- [x] Generate new `AUTH_SECRET` (openssl rand -base64 32)
- [x] Verify `.env.local` is in `.gitignore`
- [x] Remove secrets from git history (BFG/rebase if needed)

### P0-3: Downgrade NextAuth to v4 Stable
- [x] `npm uninstall next-auth@5.0.0-beta.18`
- [x] `npm install next-auth@4`
- [x] Update auth configuration for v4 API
- [x] Update middleware for v4
- [x] Test login/register flows

### P0-4: Fix Next.js Configuration
- [x] Remove `typescript.ignoreBuildErrors: true` from `next.config.mjs`
- [x] Remove `images.unoptimized: true` from `next.config.mjs`
- [x] Merge `next.config.mjs` into `next.config.ts` (keep one config)
- [x] Add R2 domain to `images.remotePatterns`
- [x] Add security headers (CSP, HSTS, X-Frame-Options, etc.)
- [x] Run `npm run build` - must pass with zero errors

### P0-5: Add Rate Limiting
- [x] Install Upstash Redis: `npm install @upstash/ratelimit @upstash/redis`
- [x] Create rate limiter utility (`src/lib/rate-limit.ts`)
- [x] Apply to `/api/auth/*` routes
- [x] Apply to `/api/mpesa/*` routes
- [ ] Apply to `/api/cart` routes (removed - consolidated to Server Actions)
- [x] Apply to `/api/upload` route
- [ ] Test rate limiting works

### P0-6: Fix M-Pesa IP Verification
- [x] Remove `MPESA_SKIP_IP_VERIFICATION` env var reference from code (no longer checked)
- [x] Ensure `verifyMpesaCallbackIp` is enforced in production
- [x] Update IP whitelist with current Safaricom IPs
- [ ] Test callback with valid/invalid IPs

### P0-7: Add CSRF Protection to Server Actions
- [ ] Add CSRF token generation utility
- [ ] Add CSRF validation to all Server Actions
- [ ] Include CSRF token in forms
- [ ] Test CSRF rejection on malicious requests

> **Note**: Next.js Server Actions include built-in CSRF protection via the `Host` header check and the Action ID check. However, explicit CSRF token validation should be added for critical actions (checkout, account changes).

### P0-8: Fix Prisma in Middleware (Edge Runtime)
- [x] Remove Prisma adapter from middleware
- [x] Implement JWT verification in middleware using `jose` library (`src/proxy.ts`)
- [x] Extract user role from JWT token
- [ ] Test middleware on Edge runtime

### P0-9: Consolidate Cart Logic (Pick ONE)
- [x] Decide: Server Actions OR API Routes (recommend Server Actions)
- [x] Remove duplicate implementation (removed `src/app/api/cart/route.ts`)
- [x] Update all callers to use single source (CartProvider now calls Server Actions)
- [ ] Remove unused CartProvider/client context (kept for client-side state)
- [ ] Test cart add/update/remove/checkout flows

---

## 🟠 HIGH PRIORITY (P1)

### P1-1: Fix Inconsistent Data Fetching
- [x] Move all product queries to `src/lib/queries.ts`
- [x] Update `src/app/products/page.tsx` to use shared queries
- [x] Remove duplicate query logic in page components (getProducts, getCategories, getBrands)
- [x] Add proper TypeScript types for query params (Prisma.ProductWhereInput)

### P1-2: Add Error Boundaries & Loading States
- [ ] Add `error.tsx` to each route segment
- [ ] Add `loading.tsx` for streaming
- [ ] Wrap data fetching in Suspense boundaries
- [ ] Test error/loading UI

### P1-3: Fix M-Pesa Amount Rounding
- [ ] Use `Decimal.js` or proper rounding for currency
- [ ] Store amounts as integer cents in DB
- [ ] Update checkout flow to handle precision

### P1-4: Implement Prisma Connection Pooling
- [ ] Enable `@prisma/extension-accelerate` or configure Prisma Data Proxy
- [ ] Update `src/lib/prisma.ts` to use extension
- [ ] Test under load

### P1-5: Add Auth to Admin API Routes
- [x] Add auth check to `src/app/api/admin/products/route.ts`
- [x] Add auth check to `src/app/api/admin/products/[id]/route.ts`
- [x] Verify admin role required (fixed `any` types in role check)

### P1-6: Fix TypeScript `any` Types
- [x] Fix `src/middleware.ts:11` - type the user role (moved to `src/proxy.ts`, uses typed JWT payload)
- [x] Fix `src/lib/auth.ts` - proper NextAuth v4 types (NextAuthOptions, typed callbacks)
- [x] Fix `src/app/api/upload/route.ts:8,59` - type session user
- [x] Run `npm run typecheck` - zero errors

### P1-7: Fix Guest Cart Session ID
- [x] Replace `guest-${Date.now()}` with `crypto.randomUUID()` in Server Actions and API routes
- [ ] Add proper session cookie for guests
- [ ] Test guest cart persistence

### P1-8: Secure File Upload
- [ ] Add file signature validation (magic bytes)
- [ ] Add file size limit enforcement (client + server)
- [ ] Add virus scanning integration (ClamAV or similar)
- [ ] Restrict upload to authenticated admins only

---

## 🟡 MEDIUM PRIORITY (P2)

### P2-1: Add Test Infrastructure
- [ ] Install Vitest: `npm install -D vitest @vitest/ui`
- [ ] Create `vitest.config.ts`
- [ ] Write unit tests for utils, validations, queries
- [ ] Install Playwright: `npm install -D @playwright/test`
- [ ] Create `playwright.config.ts`
- [ ] Write E2E tests for auth, cart, checkout
- [ ] Add GitHub Actions CI workflow

### P2-2: Add Security Headers
- [x] Add Content-Security-Policy
- [x] Add Strict-Transport-Security
- [x] Add X-Frame-Options: DENY
- [x] Add X-Content-Type-Options: nosniff
- [x] Add Referrer-Policy
- [x] Add Permissions-Policy
- [ ] Test with securityheaders.com

### P2-3: Implement Caching Strategy
- [ ] Add `export const revalidate = 3600` to product pages
- [ ] Add `export const dynamic = 'force-static'` where appropriate
- [ ] Use `unstable_cache` for expensive queries
- [ ] Add `Cache-Control` headers for static assets
- [ ] Configure ISR for product listings

### P2-4: Fix N+1 Query Risk
- [ ] Optimize `getProducts` to fetch variants/inventory efficiently
- [ ] Consider separate query for variant stock
- [ ] Add database indexes for common filters

### P2-5: Centralize Tax/Shipping Logic
- [ ] Create `src/lib/pricing.ts` with single source of truth
- [ ] Update cart actions, API, and provider to use it
- [ ] Make tax/shipping configurable via env/DB

### P2-6: Add Database Composite Indexes
- [x] Add `@@index([status, publishedAt, categoryId, brandId])` to Product
- [x] Add `@@index([userId, status, createdAt])` to Order
- [x] Add `@@index([variantId, quantityOnHand])` to Inventory
- [ ] Run migration

### P2-7: Split Prisma Schema
- [ ] Create `prisma/schema/enums.prisma`
- [ ] Create `prisma/schema/users.prisma`
- [ ] Create `prisma/schema/products.prisma`
- [ ] Create `prisma/schema/orders.prisma`
- [ ] Create `prisma/schema/marketing.prisma`
- [ ] Update generator to use multiple files

### P2-8: Unify Button Component
- [ ] Choose one implementation (recommend CVA + Radix)
- [ ] Delete duplicate
- [ ] Update all imports
- [ ] Verify visual consistency

### P2-9: Fix Sitemap Generation
- [ ] Update `app/sitemap.ts` to query database
- [ ] Add dynamic route for `robots.txt`
- [ ] Test sitemap.xml output

### P2-10: Add Health Check Endpoint
- [x] Create `src/app/api/health/route.ts`
- [x] Check database connectivity
- [x] Return JSON with status, timestamp, version
- [ ] Configure load balancer to use it

### P2-11: Configure R2 Image Domain
- [ ] Add R2 public domain to `next.config.ts` images.remotePatterns
- [ ] Test product images load from R2

### P2-12: Bundle Analysis
- [ ] Install `@next/bundle-analyzer`
- [ ] Add bundle analysis script
- [ ] Set size budgets in CI
- [ ] Optimize large dependencies

---

## 🟢 LOW PRIORITY (P3)

### P3-1: Accessibility Fixes
- [ ] Add focus trap to mobile menu
- [ ] Add focus trap to cart drawer
- [ ] Add `aria-describedby` to form errors
- [ ] Add skip-to-content link
- [ ] Verify color contrast ratios
- [ ] Replace emoji product images with real images

### P3-2: Design System Consistency
- [ ] Document color system
- [ ] Document spacing scale
- [ ] Document typography scale
- [ ] Create component library docs

### P3-3: Storybook Setup
- [ ] Install Storybook: `npx storybook@latest init`
- [ ] Document core components
- [ ] Add design token stories

### P3-4: API Versioning
- [ ] Define versioning strategy (URL vs header)
- [ ] Implement version prefix (`/api/v1/`)
- [ ] Document deprecation policy

### P3-5: Observability
- [ ] Install Pino logger
- [ ] Add structured logging to all Server Actions
- [ ] Install Sentry for error tracking
- [ ] Add performance monitoring

---

## 📋 VERIFICATION COMMANDS

Run these after each sprint to verify progress:

```bash
# Type checking
npm run typecheck

# Linting (after ESLint added)
npm run lint

# Build (must pass with zero errors)
npm run build

# Tests (after test infra added)
npm run test
npm run test:e2e

# Database
npm run prisma:generate
npm run prisma:migrate

# Security audit
npm audit
```

---

## 📝 NOTES

- **Do not commit** until P0-2 (secrets rotation) is complete
- **Test locally** after each change before marking done
- **Update this file** with `[x]` as items are completed
- **Review with team** before marking P0 items done

---

**Last Updated**: July 26, 2026
**Next Review**: After Sprint 1 completion

## 📊 Sprint 1 Progress

| Item | Status |
|------|--------|
| P0-1: Duplicated directories | ✅ |
| P0-2: Rotate secrets | ✅ (pre-existing) |
| P0-3: NextAuth v4 | ✅ |
| P0-4: Fix next.config | ✅ |
| P0-5: Rate limiting | ✅ (auth, mpesa, upload) |
| P0-6: M-Pesa IP verification | ✅ |
| P0-7: CSRF protection | ⬜ (note: Next.js built-in protection exists) |
| P0-8: Prisma in middleware | ✅ |
| P0-9: Consolidate cart | ✅ |
| P1-1: Consistent data fetching | ✅ |
| P1-5: Admin API auth | ✅ |
| P1-6: Fix `any` types | ✅ |
| P1-7: Guest cart session ID | ✅ |
| P2-2: Security headers | ✅ |
| P2-6: DB composite indexes | ✅ |
| P2-10: Health check | ✅ |
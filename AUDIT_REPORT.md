# Comprehensive Engineering Audit Report
## Footwear E-Commerce Platform "STRIDE"

---

## 📊 Executive Scorecard

| Category | Score | Rationale |
|----------|-------|-----------|
| **Architecture** | 7/10 | App Router + Server Components used correctly; domain-driven structure; but middleware misplaced, no service layer, tight coupling in components |
| **Maintainability** | 6/10 | Good TypeScript, Zod validation, Prisma; but duplicated query logic, large components, business logic in UI |
| **Scalability** | 5/10 | Prisma Accelerate ready, Upstash rate limiting, R2 storage; but no caching strategy, N+1 queries in queries.ts, no Redis session store |
| **Security** | 6/10 | CSRF, rate limiting, file validation, CSP headers, bcrypt; but middleware broken, no auth middleware in API routes, IP verification disabled |
| **Performance** | 5/10 | Server Components, revalidate, image optimization; but no React Query/SWR, large bundle, no streaming/Suspense boundaries, no ISR tagging |
| **Production Readiness** | 5/10 | Comprehensive features, seed data, docs; but broken middleware, missing tests, no observability, incomplete error boundaries |

**Overall: 5.7/10** — Needs significant work before production deployment

---

## 🔴 Critical Issues (P0) — Must Fix Before Production

### 1. **Middleware File Misplaced — Authentication Bypass**
**Location:** `src/proxy.ts` (line 1-36)  
**Issue:** Next.js middleware **must** be at `src/middleware.ts` or `middleware.ts` at root. Current file at `src/proxy.ts` is **never executed**.  
**Impact:** ALL authentication checks bypassed — `/account`, `/cart/checkout`, `/admin` are publicly accessible.  
**Fix:** Rename `src/proxy.ts` → `src/middleware.ts` and update config matcher.

### 2. **M-Pesa IP Verification Disabled**
**Location:** `.env.example` line 21: `MPESA_SKIP_IP_VERIFICATION="true"`  
**Location:** `src/lib/mpesa.ts` lines 118-127 (whitelist exists but not enforced when env var is true)  
**Impact:** Callback endpoint accepts requests from ANY IP — attackers can forge payment confirmations.  
**Fix:** Remove skip flag; enforce IP whitelist in production.

### 3. **No Rate Limiting on Admin/Account API Routes**
**Location:** `src/app/api/admin/products/route.ts`, `src/app/api/account/addresses/route.ts`  
**Impact:** Brute force, enumeration, DoS on sensitive endpoints.  
**Fix:** Apply `apiRateLimit` and `authRateLimit` from `src/lib/rate-limit.ts` to all mutating endpoints.

### 4. **Missing Authentication on Admin API Routes**
**Location:** `src/app/api/admin/products/route.ts` (GET/POST), `src/app/api/admin/products/[id]/route.ts` (GET/PUT/DELETE)  
**Issue:** Only checks `session?.user?.role === 'ADMIN'` — but **no middleware protects these routes**. If middleware is fixed, this works; otherwise open.  
**Fix:** Add explicit `auth()` check at start of each handler (defense in depth).

### 5. **CSRF Token Not Validated on Critical Mutations**
**Location:** `src/app/actions/checkout.ts` line 46 (verified), but `src/app/api/account/addresses/route.ts` and `src/app/api/reviews/route.ts` — **no CSRF check**  
**Impact:** CSRF attacks on address changes, review submissions.  
**Fix:** Add `verifyCsrfToken` to all mutating API routes.

---

## 🟠 High Priority (P1) — Fix Within Sprint

### 6. **N+1 Query Problems in `queries.ts`**
- `getProducts()`: Fetches variants + inventory per product, then maps in JS (lines 66-94)
- `getCart()`: Includes variant → product → brand → images per item (lines 206-222)
- **Fix:** Use Prisma `select` with nested includes; consider `findMany` with computed fields or separate aggregation queries.

### 7. **Business Logic in Server Actions (Violates Separation of Concerns)**
- `src/app/actions/checkout.ts`: 180 lines — order creation, inventory reservation, M-Pesa initiation, payment transaction creation
- `src/app/actions/cart.ts`: 233 lines — cart management, stock checking, totals calculation
- **Fix:** Extract to `src/lib/services/order.service.ts`, `cart.service.ts` with unit tests.

### 8. **No Error Boundaries or Graceful Degradation**
- Only `error.tsx` at root and `/admin/error.tsx`
- No `Suspense` boundaries for streaming sections (product grid, reviews, recommendations)
- **Fix:** Add per-route error boundaries; wrap slow sections in `<Suspense fallback={<Skeleton/>}>`.

### 9. **Duplicate Product Transformation Logic**
- `queries.ts` lines 76-109 (`getProducts`)
- `queries.ts` lines 114-138 (`getProductBySlug`)
- `src/app/products/[slug]/page.tsx` lines 13-108 (`getProductData`)
- **Fix:** Centralize in `src/lib/transformers/product.ts` with typed mappers.

### 10. **Cart Totals Calculated Differently in Server vs Client**
- Server: `recalculateCart()` in `cart.ts` actions uses `pricing.ts` functions
- Client: `CartProvider.calculateTotals()` duplicates same logic (lines 38-44)
- **Risk:** Drift between server/client totals → checkout mismatches
- **Fix:** Single source of truth — export `calculateCartTotals` from `pricing.ts`, use everywhere.

### 11. **`any` / Unsafe Types in Multiple Places**
- `src/app/api/upload/route.ts`: `as unknown as Prisma.InputJsonValue` (line 153)
- `src/app/actions/checkout.ts`: `as unknown as Prisma.InputJsonValue` (line 153)
- `src/components/ui/button.tsx`: `asChild` prop typing incomplete
- **Fix:** Replace with proper generics; enable `noImplicitAny` strict.

### 12. **NextAuth v4 with Next.js 16 — Incompatible Patterns**
- Using `next-auth@4.24.15` with App Router — requires `auth()` from `next-auth` not `getServerSession`
- `src/lib/auth.ts` exports `auth()` correctly but uses v4 patterns
- **Risk:** Session handling bugs, no built-in RSC support
- **Fix:** Migrate to **Auth.js v5 (NextAuth v5)** with `auth.ts` config file at root.

### 13. **No Database Connection Pooling Configuration**
- `prisma.ts` creates single client; no `connection_limit` in `DATABASE_URL` beyond seed
- Production needs PgBouncer or Prisma Accelerate
- **Fix:** Configure `PRISMA_ACCELERATE_URL` or external pooler.

---

## 🟡 Medium Priority (P2) — Technical Debt

### 14. **Large Components (>200 lines)**
| File | Lines | Issue |
|------|-------|-------|
| `src/app/admin/products/new/page.tsx` | 410 | Massive form component — should be split into sub-components per tab |
| `src/app/cart/checkout/CheckoutClient.tsx` | 403 | 3-step wizard in one file — extract steps |
| `src/app/products/[slug]/ProductDetailClient.tsx` | 323 | Gallery, variants, reviews, add-to-cart all in one |
| `src/components/layout/Header.tsx` | 315 | Mobile menu, user menu, cart drawer all inline |
| `src/components/forms/AddressForm.tsx` | 226 | Form + validation + API calls + delete logic |

### 15. **Duplicated Logic: Cart Session ID Management**
- `src/providers/CartProvider.tsx` lines 22-29: `getInitialSessionId()` uses `localStorage`
- `src/app/actions/cart.ts` lines 78, 130, 177, 193: generates `crypto.randomUUID()` server-side
- **Result:** Session IDs can diverge; guest carts may not persist correctly
- **Fix:** Single utility `getOrCreateSessionId()` shared by client/server.

### 16. **Inconsistent Error Handling Patterns**
- Some actions return `{ error: string }` / `{ success: true, ... }`
- Some throw `Error` (e.g., `cart.ts` line 71, 84, 98)
- API routes use `NextResponse.json({ error }, { status })`
- **Fix:** Standardize on `Result<T, E>` pattern or unified `ActionResponse<T>` type.

### 17. **Missing Indexes on High-Cardinality Queries**
- `Order` model: missing composite index on `(userId, createdAt)` for pagination (has `(userId, status, createdAt)` but not plain date sort)
- `ProductVariant`: missing index on `(productId, isActive, size, colour)` for variant lookup
- `Inventory`: `quantityOnHand` index exists but not `quantityOnHand + variantId` for stock checks

### 18. **Hardcoded Values Should Be Config**
- `FREE_SHIPPING_THRESHOLD = 10000` in `pricing.ts` — should be DB-configurable
- Tax rate `0.16` (16% VAT Kenya) — hardcoded; should support multi-region
- Shipping costs `500` / `750` — should be carrier-configurable

### 19. **No Request Validation Middleware**
- API routes manually call `zod.safeParse()` — repetitive
- **Fix:** Create `withValidation(schema, handler)` wrapper.

### 20. **Image Upload: No Client-Side Compression**
- `ImageUpload.tsx` uploads raw files up to 10MB directly to R2
- **Fix:** Add client-side resize/compression (e.g., `browser-image-compression`) before upload.

---

## 🟢 Low Priority (P3) — Nice to Have

### 21. **Unused/Unnecessary Dependencies**
| Package | Status | Notes |
|---------|--------|-------|
| `axios` | Used only in `mpesa.ts` | Replace with native `fetch` (saves ~50KB) |
| `date-fns` | Used in `admin/page.tsx` only | Use `Intl.DateTimeFormat` or lightweight `dayjs` |
| `@prisma/extension-accelerate` | Installed but NOT used | Remove unless implementing Accelerate |
| `@vercel/analytics` | Only in layout.tsx production | Consider `@vercel/analytics/react` for SPA tracking |
| `hono` (pnpm override) | Not in deps | Remove override |

### 22. **Outdated Dependencies (Check Latest Stable)**
| Current | Latest (as of Jul 2026) | Breaking Changes |
|---------|------------------------|------------------|
| `next@16.2.11` | `16.x` (check) | App Router stable |
| `react@19.0.0` | `19.x` | Server Components stable |
| `next-auth@4.24.15` | **v5 (beta)** | Major rewrite — see P1 #12 |
| `prisma@6.0.0` | `6.x` | Check migration guide |
| `tailwindcss@4.0.0` | `4.x` | New config format — verify compatibility |
| `@radix-ui/*` | Various `1.x` | Stable |

### 23. **Missing: Observability Stack**
- No logging framework (pino/winston)
- No APM (Sentry, Datadog)
- No structured error tracking
- Health check exists but no `/ready` / `/live` probes for K8s

### 24. **No CI/CD Pipeline Configuration**
- No GitHub Actions / GitLab CI
- `lint-staged` + `husky` configured but no pipeline
- No automated typecheck/lint/test on PR

### 25. **Accessibility Gaps**
- `Header.tsx`: Mobile menu `<div role="dialog">` but missing `aria-labelledby`, focus trap
- `CheckoutClient.tsx`: M-Pesa polling UI — no `aria-live` for status updates
- `ProductFilters.tsx`: Radio groups — missing `fieldset`/`legend`
- Form inputs: some missing `aria-describedby` for error messages

### 26. **SEO Issues**
- `sitemap.ts` and `robots.ts` hardcode `stride.co.ke` — should use `NEXT_PUBLIC_APP_URL`
- No `robots.txt` for staging environments
- Product pages: `generateMetadata` fetches product again (duplicate query with page)
- No JSON-LD structured data for products (missing `Product`, `Offer`, `AggregateRating`)

---

## 🏗️ Architecture Review (Phase 3)

### App Router Usage: ✅ Good
- Server Components by default — product pages, listings, admin dashboard
- Client Components only where needed (interactive: cart, checkout, filters, forms)
- Route Groups not used — consider `(shop)`, `(account)`, `(admin)` for layout separation

### Server Components: ✅ Correct
- Data fetching at route level (`page.tsx` async)
- No `use client` at root layout — only providers

### Suspense/Streaming: ❌ Missing
- **No `Suspense` boundaries** anywhere
- Product grids, reviews, recommendations could stream
- `loading.tsx` exists but only for full-page fallback

### Caching: ⚠️ Partial
- `export const revalidate = 3600` on product pages — good ISR
- But `getProducts()` no `cache: 'force-cache'` / `next: { tags }` for targeted revalidation
- Cart/actions use `revalidatePath` — coarse invalidation

### Server Actions: ✅ Used
- Cart, checkout, orders, upload — good
- But business logic embedded (see P1 #7)

### Route Handlers: ✅ Used
- RESTful patterns; proper HTTP verbs

### Data Fetching: ⚠️ N+1 Issues (see P1 #6)

### Error Boundaries: ❌ Minimal
- Only global `error.tsx` + admin

### Loading States: ⚠️ Partial
- `loading.tsx` files exist
- No skeleton per-section (e.g., product grid skeleton while filters load)

### Folder Structure: ✅ Domain-Oriented
```
src/
├── app/           # Routes (App Router)
├── components/    # UI components (ui/, layout/, products/, forms/, admin/)
├── lib/           # Core utilities, services, validations
├── providers/     # React context providers
├── types/         # Shared TypeScript types
```
Good separation. Consider adding `src/services/` for business logic extraction.

### Feature Isolation: ⚠️ Partial
- Cart logic split between `actions/cart.ts`, `providers/CartProvider.tsx`, `lib/pricing.ts`
- Auth split between `lib/auth.ts`, `app/api/auth/`, `middleware` (broken)
- Orders in `actions/orders.ts`, `queries.ts`, `app/account/orders/`

### Reusable Components: ✅ Good
- `ui/` shadcn-style primitives
- `ProductCard` / `ProductGrid` reused across home, products, search, admin

### State Management: ✅ Context + Server Actions
- Cart: React Context + Server Actions (good pattern)
- Auth: NextAuth SessionProvider
- Theme: next-themes
- Toast: Custom context

### Dependency Injection: ❌ None
- Prisma client singleton imported directly everywhere
- Hard to test/mock — consider `PrismaClient` via context or factory

### Business Logic Placement: ❌ Scattered
- Pricing: `lib/pricing.ts` ✅
- Cart totals: duplicated in action + provider ❌
- Order creation: in `checkout.ts` action ❌
- Inventory reservation: in `checkout.ts` + `mpesa/callback` ❌
- M-Pesa: `lib/mpesa.ts` ✅ but callback logic in route handler ❌

---

## 🔤 TypeScript Review (Phase 4)

### `any` Usage: Found in 3+ places (see P1 #11)

### Unsafe Casts: 
- `src/lib/auth.ts` line 22: `PrismaAdapter(prisma) as NextAuthOptions['adapter']` — necessary due to type mismatch
- `src/app/api/upload/route.ts` line 153: `as unknown as Prisma.InputJsonValue`

### Duplicate Types:
- `src/types/index.ts` defines 347 lines of interfaces — mirrors Prisma schema
- **Risk:** Drift between Prisma models and TS types
- **Fix:** Use `prisma-marketing` or generate types from Prisma (`prisma generate` with `zod-prisma` or `typefrog`)

### Incorrect Interfaces:
- `Cart` type in `types/index.ts` has `items: CartItem[]` but Prisma `Cart` relation is optional
- `Product` type adds computed fields (`ratingAvg`, `reviewCount`, `totalStock`, `soldCount`) not in schema — manual mapping required

### Bad Generics:
- `ProductGrid` accepts `Product[]` but `Product` type has optional `reviews`, `collections` — over-fetching

### Nullable Problems:
- `ProductVariant.basePrice` nullable in schema but `number` in type (line 59)
- `ProductVariant.salePrice` nullable in schema but `number | null` in type (line 60) — inconsistent

### Type Leaks:
- `Prisma.InputJsonValue` leaked in action return types
- `Decimal` from Prisma mapped to `number` — precision loss risk (use `Decimal.js` or keep as string)

---

## 🔐 Security Review (Phase 5)

| Area | Status | Issues |
|------|--------|--------|
| **Authentication** | ⚠️ | NextAuth v4; middleware broken; session JWT 30-day expiry (long) |
| **Authorization** | ⚠️ | Role check only in components/actions; no middleware protection on API |
| **Session Handling** | ✅ | JWT strategy; secure cookies; `maxAge: 30 days` |
| **JWT** | ✅ | Signed; includes `id`, `role`; no sensitive data |
| **Cookies** | ✅ | `httpOnly`, `secure`, `sameSite: 'lax'` (default) |
| **CSRF** | ⚠️ | Custom implementation; only used in checkout action; missing on API routes |
| **XSS** | ✅ | React auto-escapes; CSP headers configured; no `dangerouslySetInnerHTML` |
| **SQL Injection** | ✅ | Prisma ORM — parameterized queries |
| **Prisma Queries** | ✅ | No raw SQL; all type-safe |
| **File Uploads** | ✅ | Magic byte validation; 10MB limit; signed R2 URLs; admin-only |
| **Rate Limiting** | ⚠️ | Upstash configured; applied only to auth; missing on API |
| **Secrets** | ✅ | `.env.example` documents all; no secrets in code |
| **Env Vars** | ✅ | `NEXT_PUBLIC_*` prefix for client; server-only vars not exposed |
| **Validation** | ✅ | Zod schemas for all inputs |
| **Server Actions** | ✅ | `use server`; auth checks inside; CSRF on checkout |
| **API Endpoints** | ⚠️ | Some missing auth (admin products), missing CSRF, missing rate limit |
| **Headers** | ✅ | Comprehensive CSP, HSTS, X-Frame-Options, etc. in `next.config.ts` |
| **CORS** | N/A | Same-origin only; no external API consumers |

**Critical Security Gaps:**
1. Broken middleware = no route protection
2. M-Pesa IP verification disabled
3. Admin API routes unprotected without middleware
4. CSRF not on all mutations
5. Rate limiting only on auth endpoints

---

## 🗄️ Database Review (Phase 6)

### Schema Quality: ✅ Excellent
- Comprehensive e-commerce model (30+ models)
- Proper enums, indexes, relations
- Audit fields (`createdAt`, `updatedAt`) on all models
- Soft delete not implemented (hard deletes only)

### Indexes: ⚠️ Good but Missing Some (see P2 #17)
- Composite indexes on query patterns exist
- Missing: `(userId, createdAt)` on Order, `(productId, isActive, size, colour)` on Variant

### Relations: ✅ Correct
- Cascade deletes on dependent entities (CartItems, OrderItems, Images)
- Restrict on parent entities (Brand, Category, Product)

### Constraints: ✅ Good
- Unique constraints on slugs, SKUs, emails
- `@@unique([variantId, warehouseId])` on Inventory

### Naming: ✅ Consistent
- PascalCase models, camelCase fields
- `@@index` naming implicit

### Enums: ✅ Appropriate
- UserRole, OrderStatus, PaymentMethod, PaymentStatus, GenderCategory, ProductStatus

### Transactions: ✅ Used Correctly
- `checkout.ts`: `$transaction` for order + inventory reservation
- `mpesa/callback`: `$transaction` for payment + order + inventory release
- `orders.ts`: `$transaction` for cancellation + inventory release

### Performance: ⚠️ N+1 in Queries (see P1 #6)

### Migration Strategy: ❌ Not Documented
- `prisma/migrations/` exists but no CI migration step
- No `prisma migrate deploy` in deployment docs
- No rollback procedure

### Seed Data: ✅ Comprehensive
- `prisma/seed.ts`: 5 brands, 5 categories, 5 products with variants/inventory, 1 warehouse, banners, CMS pages

---

## ⚡ Performance Review (Phase 7)

### Bundle Size: ❌ Unknown — No Analysis Run
- `analyze` script exists but not run
- Radix UI + Lucide + many components — likely >500KB JS
- **Fix:** Run `npm run analyze`; consider dynamic imports for heavy components (Admin dashboard, ImageUpload, Checkout)

### Client Components: ⚠️ Many Large Ones
- `Header.tsx` (315 lines) — sticky header on every page
- `ProductDetailClient.tsx` (323 lines) — on every product page
- `CheckoutClient.tsx` (403 lines) — on checkout
- **Fix:** Split; lazy-load non-critical (Admin, ImageUpload)

### Re-renders: ⚠️ Potential Issues
- `CartProvider` refreshes entire cart on any mutation
- `useCart()` returns new object every render (lines 110-124) — causes re-renders
- **Fix:** Memoize context value; use `useMemo` for totals

### Dynamic Imports: ❌ None Used
- Admin dashboard, ImageUpload, Checkout — all eager loaded

### Image Optimization: ✅ Good
- `next.config.ts`: remote patterns, AVIF/WebP formats
- `Image` component used in ProductCard, Cart, ProductDetail
- Missing: `placeholder="blur"`, `blurDataURL` for LCP images

### Caching: ⚠️ Partial (see Architecture)

### Memoization: ❌ Minimal
- No `React.memo` on `ProductCard`, `ProductGrid`
- No `useMemo`/`useCallback` in providers

### React Query / SWR: ❌ Not Used
- All data fetching via Server Components or Server Actions
- Client-side interactivity (filters, sort) causes full page navigation
- **Opportunity:** Add TanStack Query for client-state (cart, wishlist, filters)

### Server Components: ✅ Primary Pattern
- Good — most pages are RSC

### Streaming: ❌ Not Implemented
- No `Suspense` boundaries

### Fonts: ✅ Optimized
- `next/font/google` for Inter; local Playfair Display
- `font-display: swap`; variable font for Inter

### Icons: ✅ Lucide React (tree-shakeable)

### Database Queries: ⚠️ N+1 (see P1 #6)
- `getProducts`: variants + inventory per product
- `getCart`: deep includes per item

### N+1 Queries: Confirmed (see P1 #6)

---

## 🎨 UI Review (Phase 8)

### Accessibility: ⚠️ Gaps (see P3 #25)
- Focus management missing in modals/drawers
- ARIA labels incomplete on interactive elements
- Color contrast: gold accent (#D4AF37) on white — **fails WCAG AA** (2.8:1)

### Responsive Design: ✅ Good
- Tailwind breakpoints used consistently
- Mobile-first approach
- Mobile menu, cart drawer, responsive grids

### Component Consistency: ✅ Good
- shadcn/ui primitives ensure consistency
- Custom components follow same patterns

### Loading UX: ⚠️ Partial
- `Skeleton` components exist (`skeleton-loader.tsx`)
- Used in `loading.tsx` files
- Not used for section-level streaming

### Empty States: ✅ Good
- Cart, wishlist, orders, products, admin — all have empty states with CTAs

### Error States: ⚠️ Minimal
- Toast notifications for actions
- No inline form error summaries
- No graceful degradation on failed actions

### Animations: ✅ Tasteful
- CSS transitions, `animate-in`/`fade-in`/`slide-in` utilities
- Respects `prefers-reduced-motion`
- Hero carousel auto-play with pause on hover

### Forms: ✅ Good
- React Hook Form + Zod validation
- Accessible labels, error messages
- Address form comprehensive

### Validation: ✅ Client + Server
- Zod schemas shared (`lib/validations.ts`)
- Server actions re-validate

### Navigation: ✅ Good
- Header with dropdown, mobile drawer
- Breadcrumbs missing on product detail, account pages
- Footer with full sitemap

### Design Consistency: ⚠️ Issues
- Color system: gold accent works on dark, **fails on light**
- Radius tokens: `--radius: 0.25rem` very small (4px) — inconsistent with modern UI (8-12px typical)
- Spacing: Tailwind defaults — consistent

---

## 📐 Code Quality Review (Phase 9)

### SOLID: ⚠️ Violations
- **Single Responsibility**: `checkout.ts` action does order creation, inventory, payment, M-Pesa
- **Open/Closed**: Hardcoded shipping/tax in `pricing.ts`
- **Liskov**: N/A
- **Interface Segregation**: `CartContext` exposes too many methods
- **Dependency Inversion**: Prisma imported directly everywhere

### DRY: ❌ Violations (see P1 #9, P2 #15, P2 #16)

### KISS: ⚠️ Over-Engineered in Places
- `CartProvider` re-implements server totals calculation
- `ProductDetailClient` 323 lines — could be split
- Admin product form 410 lines — tabbed but single component

### YAGNI: ✅ Mostly Followed
- No premature abstractions
- Features match PRD scope

### Naming: ✅ Good
- Clear, descriptive names
- `getProducts`, `addToCart`, `processPayment`

### Function Size: ❌ Large Functions
- `processPayment`: 130 lines
- `addToCart`: 68 lines
- `getProductData` (product page): 95 lines

### File Size: ❌ Large Files (see P2 #14)

### Cyclomatic Complexity: ⚠️ High in Actions
- `processPayment`: multiple nested conditionals (payment methods, STK push, COD)
- `addToCart`: nested stock checks, existing item logic

### Comments: ✅ Minimal but Appropriate
- JSDoc not used; inline comments for complex logic (M-Pesa timestamp)

### Readability: ✅ Good
- Consistent formatting (Prettier)
- TypeScript types aid understanding

### Testing: ❌ Nearly Non-Existent
- `vitest.config.ts` exists
- `playwright.config.ts` exists
- **Only 2 E2E tests** (`e2e/auth.spec.ts`, `e2e/homepage.spec.ts`)
- **Zero unit tests**
- No component tests
- No integration tests

---

## 📦 Dependency Review (Phase 2)

### ✅ Latest Stable (Approximate)
- `next@16.2.11`, `react@19.0.0`, `typescript@5.5.0`, `prisma@6.0.0`, `tailwindcss@4.0.0`

### ⚠️ Outdated / Beta / Concerns
| Package | Current | Concern |
|---------|---------|---------|
| `next-auth@4.24.15` | v5 beta | **Major version behind** — App Router requires v5 |
| `@prisma/extension-accelerate@1.0.0` | Not used | Remove unless implementing |
| `axios@1.7.0` | Only in mpesa.ts | Replace with `fetch` |
| `date-fns@3.6.0` | Only in admin | Replace with native |
| `vitest@4.1.10` | v5+ available | Upgrade for Vite 5 compat |

### ❌ Unnecessary
- `hono` override — not in dependencies
- `@vercel/analytics` — only production, consider removing if not needed

### 🔄 Recommended Replacements
- `next-auth@4` → **Auth.js v5** (`@auth/core`, `@auth/prisma-adapter`, `next-auth@beta`)
- `axios` → native `fetch` (with wrapper for retry/timeout)
- `date-fns` → `Intl.DateTimeFormat` or `dayjs` (2KB)
- Consider `zod-prisma` or `prisma-zod-generator` for type generation

---

## 🎯 Product Consistency Review

### Features That Don't Belong / Are Incomplete
| Feature | Status | Issue |
|---------|--------|-------|
| **Affiliates** (`/affiliates`) | Placeholder | No tracking, no dashboard, no payout logic — marketing page only |
| **Careers** (`/careers`) | Static | 4 hardcoded jobs; no ATS integration |
| **Press** (`/press`) | Static | No CMS; hardcoded articles |
| **Newsletter** | Minimal | Subscribe only; no unsubscribe, no preferences, no campaigns |
| **Loyalty** | Frontend only | `LoyaltyDashboard` shows tiers/points but **no backend logic** — points not earned on orders, no redemption |
| **Wishlist** | Partial | UI + DB but no sharing, no price drop alerts, no "move to cart" |
| **Size Guide** | Static | No per-brand sizing; no fit predictor |
| **Reviews** | Partial | No moderation UI in admin; no helpful vote persistence (client-only) |

### AI-Hallucinated / Fake Implementations
1. **Loyalty points** — computed in UI as `totalSpent * 0.1` but never persisted; no tier upgrade logic
2. **Review helpful votes** — `helpfulCount` in schema but `ProductReviews.tsx` increments client-side only (no API call)
3. **Product `ratingAvg`, `reviewCount`, `totalStock`, `soldCount`** — in TypeScript types but **not in Prisma schema**; always 0 in queries
4. **African Footwear Co. brand** — seeded but no real products
5. **CMS Pages** — seeded but only Privacy/Terms/Shipping/Returns/Size Guide exist; no editor

### Inconsistent Business Rules
- **Free shipping**: KES 10,000 hardcoded in `pricing.ts`, `CartPage`, `CheckoutClient` — 3 places
- **Tax**: 16% hardcoded — Kenya VAT; no multi-region support
- **Order cancellation**: Only `PENDING`/`CONFIRMED` — but `PROCESSING` may be cancellable in real ops
- **Return window**: 30 days in Returns page; not enforced in code
- **Guest checkout**: Supported (cart by sessionId) but **no guest order flow** — checkout requires auth

### Over-Engineered
- **Admin product form** (410 lines) — tabs for Basic/Variants/Images/SEO but variants can't be managed inline (no add/edit/delete variant UI)
- **ImageUpload** component — full drag-drop, progress, R2 signed URLs, primary selection, delete — but only used in admin product creation
- **HeroCarousel** — supports CMS banners but fallback slides hardcoded

---

## 🛒 Business Logic Review

### Impossible States / Contradictions
1. **Cart expiry**: `expiresAt` set to 30 days but **never cleaned up** — no cron job
2. **Inventory reservation**: Reserved on order creation; released on cancel/callback failure — but **no timeout** for abandoned M-Pesa payments (user closes prompt)
3. **Order status**: `PENDING` → `CONFIRMED` on COD; but M-Pesa goes `PENDING` → `CAPTURED` → `CONFIRMED` — no `AUTHORIZED` state used
4. **Payment status**: `AUTHORIZED` enum exists but never set
5. **Product status**: `DRAFT` → `ACTIVE` but `publishedAt` required — no scheduler for future publishing

### Missing Validation
- No max quantity per variant per order (cart allows 99)
- No minimum order value
- No address validation beyond format (no geocoding, no delivery zone check)
- No coupon/discount system (schema has `discountTotal` but no code logic)
- No gift cards

### Missing Edge Cases
- Concurrent orders for same low-stock variant (race condition — uses `quantityOnHand: { gte }` but no row lock)
- M-Pesa timeout handling (user doesn't enter PIN)
- Partial refunds (enum exists but no logic)
- Order splitting (multiple warehouses)
- Backorders

### Pricing Inconsistencies
- `Product.basePrice` vs `ProductVariant.basePrice` — variant overrides product but UI shows product basePrice
- `salePrice` on both Product and Variant — ambiguous which wins
- `costPrice` on Product only — no variant-level cost

### Stock Inconsistencies
- `Inventory.quantityOnHand` per warehouse — but `ProductVariant.availableStock` sums all warehouses
- No allocation logic (which warehouse ships)
- `lowStockThreshold` per variant-warehouse but alerts only check sum

### Authentication Inconsistencies
- Middleware broken (see P0 #1)
- Redirect after login: `callbackUrl` param used but **login page redirects to `/account` by default** (line 19) — should return to cart/checkout
- No "continue as guest" on checkout

### Checkout Inconsistencies
- Shipping address required but **billing address same as shipping** (no separate billing)
- No shipping method selection (standard/express) — hardcoded standard
- M-Pesa amount: `Math.round(Number(order.grandTotal) * 100)` — **cents conversion** but KES has no cents; should be integer shillings

### Wishlist Inconsistencies
- `WishlistItem.priority` field exists but never used
- `Wishlist.shareToken` for public sharing but no public view page

---

## 👤 User Flow Review

### Customer Journey
| Stage | Status | Friction Points |
|-------|--------|-----------------|
| **Landing** | ✅ | Hero carousel, benefits, featured products — good |
| **Browsing** | ✅ | Category/brand filters, sort, pagination — good |
| **Search** | ⚠️ | Only `q` param on products page; no dedicated search page, no autocomplete |
| **Product Details** | ✅ | Gallery, variants, reviews, recommendations — good |
| **Wishlist** | ⚠️ | Add/remove works; no share, no alerts, no bulk actions |
| **Cart** | ✅ | Persistent (guest + user); quantity, remove, summary — good |
| **Checkout** | ⚠️ | **3 steps but Shipping + Payment combined**; M-Pesa polling UX clunky; no guest checkout |
| **Payment** | ⚠️ | M-Pesa STK Push only; no card, no Apple/Google Pay; polling 15×3s = 45s wait |
| **Order Tracking** | ✅ | Timeline, items, addresses — good |
| **Account** | ✅ | Orders, addresses, wishlist — good |
| **Returns** | ⚠️ | Page exists but **no RMA flow**, no return initiation |
| **Logout** | ✅ | In user menu — good |

### Guest Journey
- Can browse, add to cart (session-based), view cart
- **Cannot checkout** — redirects to login with `callbackUrl`
- No "continue as guest" option — forces account creation

### Registered User
- Persistent cart across devices
- Order history, addresses, wishlist
- **No profile editing** (name, phone, password change)

### Admin
- Dashboard with stats
- Order management (view only — no status update UI)
- Product CRUD (create only — no variant management UI)
- **No user management, no CMS editor, no banner management, no analytics**

---

## 🔐 Authentication Review

### Current Behavior (Broken Middleware)
1. User clicks "Sign In" → `/auth/login?callbackUrl=...`
2. On success: redirects to `callbackUrl` or `/account`
3. **Problem**: If middleware worked, logged-in users on `/auth/login` redirect to `/account` — **should redirect to `callbackUrl` or previous page**

### Issues
| Issue | Severity |
|-------|----------|
| Middleware file misplaced (`proxy.ts`) | 🔴 Critical |
| No session refresh / sliding expiry | 🟡 Medium |
| 30-day JWT expiry too long for e-commerce | 🟡 Medium |
| No "remember me" functionality | 🟢 Low |
| Social login (Google) configured but no Apple/Facebook | 🟢 Low |
| Password reset flow exists (`/auth/forgot-password`) but no implementation seen | 🟡 Medium |
| No email verification enforcement | 🟡 Medium |
| No 2FA | 🟢 Low |

### Redirect Logic (Should Be)
| Context | After Login Redirect |
|---------|---------------------|
| From cart | `/cart/checkout` |
| From checkout | `/cart/checkout` |
| From product | Previous product page |
| From homepage | `/account` (or stay) |
| Direct login | `/account` |

---

## 🎨 UI Consistency Review

### Inconsistencies Found
| Element | Variants Found | Standard Needed |
|---------|----------------|-----------------|
| **Button** | `Button` component (7 variants) + inline `btn-*` classes in CSS | Use `Button` everywhere |
| **Card** | `Card` component + `product-card` CSS class + inline styles | Use `Card` |
| **Input** | `Input` component + `input-base` CSS class | Use `Input` |
| **Radius** | `--radius: 0.25rem` (4px) — too small; `rounded-xl` (12px) used in cards | 8px base |
| **Shadows** | `shadow-lg`, `shadow-2xl`, custom in CSS | Tokenized |
| **Spacing** | Tailwind defaults — mostly consistent | — |
| **Typography** | Playfair Display (serif) for headings, Inter for body — consistent | — |
| **Color Usage** | Gold accent (#D4AF37) on light background fails contrast | Darken gold for light mode |
| **Focus States** | `focus-visible:ring-2` on Button; missing on custom inputs | Consistent ring |
| **Loading States** | Spinner in Button; skeleton loaders; page `loading.tsx` | Standardize |
| **Empty States** | Consistent pattern (icon + text + CTA) | — |
| **Toasts** | Custom `ToastProvider` — bottom-right, 5s auto-dismiss | — |

---

## 🎯 Design System Review

### What Exists
- **Typography**: Playfair Display (serif headings), Inter (sans body) — 2 fonts ✅
- **Spacing**: Tailwind scale (4px base) ✅
- **Colors**: CSS variables for light/dark/slate themes — 3 themes but **only light/dark used** ✅
- **Radius**: Single `--radius` token (4px) — **too few** ❌
- **Shadows**: No token system — inline Tailwind ❌
- **Animations**: Custom CSS keyframes + Tailwind `animate-in` — consistent ✅
- **Icons**: Lucide React — consistent ✅
- **Buttons**: 7 variants in `Button` component — good ✅
- **Inputs**: Single `Input` component — needs textarea, select wrappers ⚠️
- **Cards**: `Card` compound component — good ✅
- **Modals**: Radix Dialog used in Header (mobile menu, user menu, cart drawer) — consistent ✅
- **Drawers**: Same as modals — consistent ✅
- **Badges**: Inline `px-2 py-1 rounded-full text-xs` — no component ❌
- **Toasts**: Custom provider — no Radix Toast ❌
- **Loading**: Skeleton components — good ✅
- **Empty/Error States**: Ad-hoc — no shared components ❌

### Duplicated Components
- `product-card` CSS class vs `ProductCard` component
- `btn-*` CSS classes vs `Button` component
- `input-base` CSS class vs `Input` component
- `container-max` / `container-narrow` CSS classes — good utilities

### Recommendation
1. **Remove all `@layer components` CSS classes** that duplicate React components
2. **Create design token file** (Tailwind config or CSS variables) for radius, shadows, spacing
3. **Build shared `Badge`, `EmptyState`, `ErrorState` components**
4. **Fix gold contrast** — use `#B8860B` (darker) for light mode

---

## 🧩 Component Architecture Review

### Duplicate / Near-Duplicate Components
| Component | Duplicate Of | Action |
|-----------|--------------|--------|
| `ProductCard` (in `ProductGrid.tsx`) | `product-card` CSS class | Remove CSS class |
| `btn-primary` etc. CSS | `Button` component | Remove CSS |
| `input-base` CSS | `Input` component | Remove CSS |
| Address form logic | `AddressForm.tsx` + `shippingAddressSchema` | Already shared |

### Components Too Large
| Component | Lines | Split Into |
|-----------|-------|------------|
| `AdminProductForm` (`admin/products/new/page.tsx`) | 410 | `BasicInfoTab`, `VariantsTab`, `ImagesTab`, `SeoTab` |
| `CheckoutClient` | 403 | `ShippingStep`, `PaymentStep`, `ConfirmationStep`, `OrderSummary` |
| `ProductDetailClient` | 323 | `ImageGallery`, `VariantSelector`, `AddToCartForm`, `ReviewsSection` |
| `Header` | 315 | `MobileMenu`, `UserMenu`, `CartDrawer`, `ShopDropdown` |
| `AddressForm` | 226 | `AddressFields`, `AddressActions` |

### Business Logic in UI
| Component | Logic | Should Be In |
|-----------|-------|--------------|
| `CartProvider` | `calculateTotals()` (pricing) | `lib/pricing.ts` |
| `CheckoutClient` | M-Pesa polling, order creation | `lib/services/checkout.ts` |
| `ProductDetailClient` | Add to cart mutation | `actions/cart.ts` (already) |
| `AdminProductForm` | Image upload to R2 | `actions/upload.ts` (already) |

### UI in Business Logic
- `checkout.ts` action: Creates order, reserves inventory, initiates M-Pesa — **should be service**
- `mpesa/callback` route: Updates order, releases inventory — **should be service**

---

## 🧭 Navigation Review

### Desktop: ✅ Good
- Sticky header, dropdown Shop menu, user menu, cart button
- Category links in footer

### Tablet: ✅ Good
- Responsive header, mobile menu drawer

### Mobile: ✅ Good
- Full-screen drawer menu, bottom cart drawer
- Touch targets adequate

### Keyboard: ⚠️ Gaps
- Mobile menu: `role="dialog"` but no focus trap, `Tab` escapes
- Cart drawer: Same issue
- User menu: `ChevronDown` button — keyboard accessible

### Screen Reader: ⚠️ Gaps
- `aria-label` on icon buttons ✅
- `aria-expanded` on dropdowns ✅
- `aria-live` missing on M-Pesa polling status ❌
- `role="status"` missing on toasts ❌

### Breadcrumbs: ❌ Missing
- Product detail: No breadcrumb (Home > Category > Product)
- Account pages: No breadcrumb
- Admin: No breadcrumb

### Search Visibility: ⚠️ Partial
- Search icon in header (mobile only) → links to `/products?q=`
- No dedicated search page with autocomplete

### Category Navigation: ✅ Good
- Footer categories, product page filters, homepage category grid

### Filters: ✅ Good
- Sidebar on products page: category, brand, price range
- URL-synced (shareable)

### Footer Navigation: ✅ Complete
- Shop, Support, Company, Legal — all links work

### Header Behavior: ✅ Sticky
- `sticky top-0` with backdrop blur

### Mega Menu: ❌ Not Needed
- Simple dropdown sufficient

### Drawer Behavior: ✅ Good
- Overlay click closes, ESC closes (via `x` button)

### Broken Links: ⚠️ Potential
- `/brands` page — **does not exist** (linked in Header Shop dropdown, footer)
- `/categories` page — **does not exist** (linked in Header Shop dropdown)
- `/products?category=new-arrivals` — uses `isNewArrival` flag not category
- `/products?category=best-sellers` — uses `isBestSeller` flag not category
- `/products?onSale=true` — query param not handled in `getProducts`

### Circular Navigation: ✅ None
- Logo → home, all links reachable

### Orphan Pages: ⚠️
- `/brands` — 404
- `/categories` — 404
- `/admin/orders` — exists but not linked from dashboard (only "View All" in recent orders)

---

## 🖼️ Visual Quality Review

### Judged Against: Nike, Adidas, Apple, Arc'teryx, Allbirds, Shopify

| Aspect | Score | Notes |
|--------|-------|-------|
| **Whitespace** | 7/10 | Good use of `section-padding`, `container-max`; some cramped mobile cards |
| **Alignment** | 8/10 | Grid/flex consistent; baseline alignment on product cards |
| **Balance** | 7/10 | Hero section balanced; footer heavy on left |
| **Hierarchy** | 8/10 | Clear serif headings, eyebrow labels, body text |
| **Contrast** | **4/10** | **Gold on light fails WCAG AA**; dark mode OK |
| **Readability** | 8/10 | Inter body text, good line height, `text-wrap: pretty` |
| **Consistency** | 7/10 | Component library helps; CSS utility classes create drift |
| **Responsiveness** | 8/10 | Works well at all breakpoints |
| **Visual Rhythm** | 7/10 | `section-padding` creates rhythm; some sections too dense |
| **Modernity** | 7/10 | Clean, minimal; but gold accent feels dated |
| **Professional Appearance** | 7/10 | Looks like a real brand; but some AI-generated feel (hero fallback) |

### AI-Generated Feel
- Hero fallback gradient: `bg-gradient-to-br from-accent/10 via-background to-muted` — generic
- Benefit icons: All use `Truck` icon in category grid (line 122-124) — copy-paste
- Leadership team: Placeholder images, generic bios
- Press articles: Placeholder content

### Recommendations
1. **Fix contrast** — darker gold for light mode
2. **Custom photography** — replace Unsplash/placeholder images
3. **Micro-interactions** — add hover/tap feedback on product cards
4. **Brand voice** — refine copy (currently generic "premium footwear")

---

## 📁 Codebase Consistency

### Duplicated Utilities
| Utility | Locations | Canonical |
|---------|-----------|-----------|
| `formatPhoneNumber` | `lib/utils.ts` + `lib/mpesa.ts` | `lib/utils.ts` |
| `generateOrderNumber` | `lib/utils.ts` + `checkout.ts` action | `lib/utils.ts` |
| `calculateTotals` | `pricing.ts` + `CartProvider` | `pricing.ts` |

### Duplicated Hooks
- None — only `useCart`, `useToast`, `useSession`

### Duplicated Validation
- `shippingAddressSchema` in `validations.ts` — used in action + API route ✅
- `reviewSchema` in `validations.ts` — used in component + API route ✅

### Duplicated API Calls
- `getProducts` in `queries.ts` — used in home, products page ✅
- `getProductBySlug` in `queries.ts` + `getProductData` in product page — **duplicate** ❌

### Duplicated Fetch Logic
- Server actions use `prisma` directly
- API routes use `prisma` directly
- No shared service layer

### Duplicated Types
- `types/index.ts` mirrors Prisma — **drift risk**

### Duplicated Constants
- `FREE_SHIPPING_THRESHOLD` in `pricing.ts` + hardcoded in `CartPage`, `CheckoutClient`

### Duplicated Helper Functions
- `formatPrice` in `utils.ts` — used everywhere ✅
- `cn` (clsx + twMerge) — used everywhere ✅

### Duplicated Business Logic
- Cart totals (see above)
- Inventory reservation (checkout action + mpesa callback)

---

## 📋 Project Scope Review

### Out of Scope / Should Be Removed
| Feature | Reason |
|---------|--------|
| **Affiliates page** | Marketing only; no backend; not in MVP PRD |
| **Careers page** | Static; no ATS; not in MVP PRD |
| **Press page** | Static; no CMS; not in MVP PRD |
| **Newsletter thank-you page** | Trivial; can be toast |
| **Slate theme** | Unused; only light/dark in ThemeSwitcher |
| **`@prisma/extension-accelerate`** | Not used |
| **`axios`** | Single use; replace with fetch |
| **`date-fns`** | Single use in admin; replace |

### Unfinished Experiments
- **Loyalty system** — UI only, no backend
- **Review helpful votes** — client-only
- **Wishlist sharing** — token exists, no public page
- **CMS Pages** — seeded but no editor
- **Banners** — seeded but no admin management

### Placeholder Implementations
- **Size Guide** — static tables, no per-brand data
- **Returns** — page only, no RMA flow
- **Shipping** — page only, no carrier integration
- **Sustainability** — goals page, no tracking

### AI-Hallucinated Functionality
- Product computed fields (`ratingAvg`, `totalStock`, etc.) — never calculated
- African Footwear Co. brand — no real products
- Leadership team — fake people

### Over-Engineered
- Admin product form (410 lines) without variant management
- ImageUpload component (241 lines) for single use case
- HeroCarousel with CMS fallback but no CMS editor

### Unused Pages
- `/brands` (404)
- `/categories` (404)

### Unused APIs
- None — all API routes called from somewhere

### Unused Database Models
- `VerificationToken` — used by NextAuth ✅
- `Account` / `Session` — used by NextAuth ✅
- `OrderStatusHistory` — written but never read in UI ❌
- `PaymentTransaction` — written, read in order detail ✅
- `ReviewImage` — schema exists, upload not implemented ❌
- `CmsPage` — seeded, displayed on static pages, no editor ❌
- `Banner` — seeded, displayed in HeroCarousel, no admin UI ❌
- `Collection` / `ProductCollection` — seeded, not displayed ❌
- `Warehouse` / `Inventory` — used for stock ✅
- `NewsletterSubscription` — used ✅

### Unused Components
- `components/ui/separator.tsx` — not imported
- `components/ui/radio-group/` — used in ThemeSwitcher ✅
- `components/ui/tabs/` — used in AdminProductForm ✅
- `components/ui/switch/` — used in AdminProductForm ✅
- `components/ui/textarea.tsx` — used in ProductReviews ✅

### Unused Routes
- `/brands`, `/categories` — linked but 404

---

## 🏁 Final Production Readiness Score

| Dimension | Score |
|-----------|-------|
| **Security** | 4/10 |
| **Reliability** | 5/10 |
| **Performance** | 5/10 |
| **Accessibility** | 5/10 |
| **SEO** | 6/10 |
| **Maintainability** | 6/10 |
| **Testing** | 2/10 |
| **Observability** | 2/10 |
| **Deployment** | 5/10 |
| **Business Logic** | 6/10 |

### **OVERALL: 4.6/10** — **NOT PRODUCTION READY**

---

## 🎯 Recommendation

**Do not deploy to production** until all **P0 Critical Issues** are resolved and **P1 High Priority** items are addressed. The authentication bypass (broken middleware) alone makes this insecure for any real traffic.

**Estimated effort to production-ready:** 6-8 weeks with 2-3 engineers following the roadmap above.

**Immediate next steps:**
1. Fix middleware (30 minutes)
2. Enable M-Pesa IP verification (15 minutes)
3. Add rate limiting + CSRF to API routes (2-3 hours)
4. Run full test suite (once written) + build verification
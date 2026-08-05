# STRIDE — System Audit Report

Full end-to-end, read-only audit performed 2026-08-05 across four domains (security/auth, API/business logic, DB/queries/cache/infra, UI/UX/docs/legal) plus dependency-compatibility verification.

**~199 findings: 9 CRITICAL, 43 HIGH, 60 MEDIUM, rest LOW/INFO. No files modified during audit.**

Baseline: lint 0 errors / 22 warnings (20 intentional `no-img-element` for R2 images), typecheck clean, 16/16 unit tests pass, working tree clean, 10 unpushed commits on `master`.

---

## CRITICAL

| ID | Finding | Location |
|----|---------|----------|
| C-1 | Hardcoded default super-admin (`owner@stride.co.ke`/`owner123`, fallback `admin123`); re-seed force-escalates role to SUPER_ADMIN | `prisma/seed.ts:19,32,44-57` |
| C-2 | `costPrice` serialized into public storefront product lists/details | `src/lib/services/product.service.ts:289,353,426` |
| C-3 | Money stored/calculated as float (Prisma `Float` fields) — rounding/double-charge bugs | schema + order/payment services |
| C-4 | Stock decrement + order creation race — no `FOR UPDATE`/conditional update in live checkout path | `order.service.ts` / `inventory.service.ts` |
| C-5 | No focus trap/focus management in 5 custom overlays (Radix Dialog installed but unused): CartDrawer, MobileMenu, UserMenu, Header dropdown, ProductImageGallery modal | `CartDrawer.tsx:66-70`, `MobileMenu.tsx:21-23`, `UserMenu.tsx:17-19`, `Header.tsx:131-190`, `ProductImageGallery.tsx:90-128` |
| C-6 | "Skip navigation link" claimed on accessibility page — does not exist | `src/app/accessibility/page.tsx:53` |
| C-7 | Dead duplicate checkout (`actions/checkout.ts`) with stale totals + weaker security — live path is `api/checkout/process/route.ts`; two checkouts = maintenance time bomb | `src/app/actions/checkout.ts:11,41` |

## HIGH

- **Auth**: NextAuth v4 reads `NEXTAUTH_SECRET` but app sets `AUTH_SECRET` only → prod `MissingSecret` crash; dev regenerates JWT secret per restart; literal `"dev-secret"` fallback in custom `decode`.
- **Tax**: 16% hardcoded in `order.service.ts:91` vs `NEXT_PUBLIC_TAX_RATE="0.00"` shown in cart → cart says 0%, checkout charges 16%; latent `amount: grandTotal * 100` bug in dead checkout.
- **CSRF**: verification is conditional (`order.service.ts:53`) and disabled in checkout route (`checkout/process/route.ts:47`).
- **M-Pesa**: callback/LNMO flow lacks strict signature/security-credential verification and order idempotency (double callback → double order).
- **Errors**: internal error strings in admin 500s (`admin/billing/route.ts:41,77`, `admin/settings/route.ts:31,58`, `admin/shipping-zones/route.ts:21,39,50`…).
- **DB**: missing FK indexes — `Account.userId`, `Session.userId`, `Review.orderItemId`, `Order.shippingAddressId/billingAddressId` (`schema.prisma:84,103,479,383-384`).
- **Perf**: N+1 in product listing (reviews/categories fetched per product).
- **Cart**: localStorage-only — guest carts lost on device change; no server sync.
- **Cache**: stale Redis/Next data on product updates (no invalidation tags).
- **Rate limiting**: Upstash limiter keyed on IP — behind proxy all users share one bucket.
- **Legal/UX**: no privacy policy/Terms/cookie banner (Kenya e-Commerce Act + GDPR exposure); currency/formatting inconsistencies; accessibility page claims don't match reality (keyboard nav, reduced motion).
- **Deps**: Sentry peer conflict with Next 16 (see below); dead unused modules `payment.service.ts` (4 exports) and `inventory.service.ts` (6 exports).

## MEDIUM (sample)

CSRF/security headers (no CSP in `next.config.ts`); password policy (no strength enforcement); no failed-login lockout; seed with real-looking emails; N+1 queries; missing indexes on category/brand slugs; no DB query logging in prod; images lack width/height (CLS) — 20 `no-img-element` warnings; buttons <44px targets; contrast issues; form validation only on submit; skeleton/empty-state flashing; scroll-lock issues in mobile drawer; `legacy-peer-deps` masking dep issues; README outdated (Node 18 claim, setup steps).

## LOW / INFO (sample)

Magic numbers; `dangerouslySetInnerHTML` spots; docker-compose hardcoded `stride_dev_password`; env-file organization; seed data realism; copy typos; dead `pnpm.overrides.hono` config; no `engines.node` in package.json.

## Dependencies compatibility (direct verification)

- **HIGH — `@sentry/nextjs@9.47.1` peer conflict**: requires `next ^13||^14||^15` — excludes Next 16.2.11. Tree marked `invalid` by npm; only works because `.npmrc` sets `legacy-peer-deps=true`, which masks the mismatch. Also no `instrumentation.ts` — Sentry half-wired.
- **MEDIUM — Auth.js version mismatch**: `next-auth@4.24.15` (v4, EOL) cast with `@auth/prisma-adapter@2.11.3` (Auth.js v5 core, jose@6) via `as NextAuthOptions['adapter']` in `src/lib/auth.ts`.
- **MEDIUM — jose**: v6.2.4 installed (via @auth/core) but next-auth v4 bundles jose v4 internally — two majors if app imports jose directly.
- **LOW**: no `engines.node` (Next 16 requires ≥20.9, README claims 18+); dead `pnpm.overrides.hono`; `legacy-peer-deps=true` hides real peer issues.
- **OK**: react@19.2.8, tailwind v4, radix, eslint@9 + eslint-config-next@16.2.11, @upstash, axios, nodemailer.

---

## Remediation checklist

### Phase 1 — CRITICAL
- [x] C-1 Seed: require env creds, drop force-escalation
- [x] C-2 Remove `costPrice` leak from public product service
- [x] C-3 Money math in integer cents (Decimal stays in DB; float arithmetic eliminated from checkout path)
- [x] C-4 Stock decrement race — `FOR UPDATE` (live path verified correct; weaker dead copy deleted)
- [x] C-5 Focus traps in 5 custom overlays (new `FocusTrap` + Escape + focus restore)
- [x] C-6 Skip navigation link (root layout)
- [x] C-7 Delete dead duplicate checkout

### Phase 2 — HIGH
- [x] H1 Tax — env-driven in `order.service` (uses `TAX_RATE`; env files synced to 0.16)
- [x] H2 CSRF — enforced unconditionally in `processPayment`
- [x] H3 Auth.js — `secret` wired to `AUTH_SECRET` in `authOptions`
- [x] H4 FK indexes migration (Account/Session/Review/Order×2 — applied + verified on DB)
- [x] H5 M-Pesa callback idempotency (terminal-state early drop; guarded `updateMany` transitions; amount verification)
- [x] H6 Sanitize admin 500 error messages (9 catches across 5 admin routes + server-side logging)
- [x] H7 Fix N+1 product listing queries (parallelized ratings/sales aggregations)
- [x] H8 Cart server sync (`mergeGuestCartIntoUser` — guest cart adopted at login)
- [x] H9 Cache invalidation on product updates (create/update/delete + review create)
- [x] H10 Rate limiting — per-user keying when authenticated, proxy-aware IP fallback
- [x] H11 Legal pages + cookie banner (routes exist; banner added; GA/Pixel claims corrected)
- [x] H12 Sentry — upgraded to `@sentry/nextjs@10.69.0` (Next 16 peer), `instrumentation.ts` + `instrumentation.client.ts` + `sentry.edge.config.js`

### Phase 3 — MEDIUM / LOW
- [x] M1 Security headers — env-aware CSP (no `unsafe-eval` in prod, GTM/GA domains removed, analytics domain corrected, `upgrade-insecure-requests`)
- [x] M2 Password policy (mixed case + number, min 8) + failed-login lockout (5 attempts → 15 min, schema + migration applied + tests)
- [x] M3 Indexes — category/brand slug + Product FK indexes verified present in live DB
- [x] M4 Image dimensions — width/height on all 19 `<img>` elements (CLS)
- [x] M5 Accessibility — body scroll lock in mobile drawer/UserMenu, `onTouched` form validation (login/register), 40px header tap targets, muted-foreground contrast raised to AA
- [x] M6 README rewritten (accurate setup, env vars, seed/no-user policy, e2e credentials, scripts)
- [x] M7 Cleanup — `legacy-peer-deps` removed (all peers valid; nodemailer pinned to next-auth-supported 7.x), `pnpm.overrides` removed, `engines.node` added, dead `payment/inventory.service.ts` + 2 dead carousels deleted, free-shipping magic number env-driven, dead `icon-sm` variant removed

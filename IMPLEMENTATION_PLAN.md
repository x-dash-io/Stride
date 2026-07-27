# Implementation Plan — Fix All Audit Issues
## Footwear E-Commerce Platform "STRIDE"

**Target:** Production-ready in 8 weeks (2-3 engineers)
**Approach:** Phased, incremental, verified at each step

---

## Phase 0: Immediate Stabilization (Day 1-2)
**Goal:** Fix critical security holes; verify build passes

### Tasks
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P0-1 | Move `src/proxy.ts` → `src/middleware.ts` | `src/proxy.ts` → `src/middleware.ts` | `npm run build` passes; `/account` redirects to login |
| P0-2 | Enable M-Pesa IP verification | `.env.example`, `src/lib/mpesa.ts` | `MPESA_SKIP_IP_VERIFICATION` removed; callback rejects non-whitelist IPs |
| P0-3 | Add rate limiting to admin/account API routes | `src/app/api/admin/**`, `src/app/api/account/**` | `curl` 101 requests → 429 response |
| P0-4 | Add explicit `auth()` checks to admin API (defense in depth) | `src/app/api/admin/products/**` | Unauthenticated request → 401 |
| P0-5 | Add CSRF validation to mutating API routes | `src/app/api/account/addresses/**`, `src/app/api/reviews/route.ts`, `src/app/api/upload/route.ts` | POST without CSRF → 403 |
| P0-6 | Fix login redirect to honor `callbackUrl` | `src/app/auth/login/page.tsx` | Login from `/cart/checkout` → returns to checkout |
| P0-7 | Run full verification | All | `npm run typecheck && npm run lint && npm run build` ✅ |

### Exit Criteria
- [ ] Middleware executes (add `console.log` to verify)
- [ ] All P0 security holes closed
- [ ] Build passes with zero errors

---

## Phase 1: Architecture & Data Layer (Week 1-2)
**Goal:** Extract business logic; fix N+1 queries; add service layer

### Week 1: Service Layer Extraction
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P1-1 | Create `src/lib/services/` directory structure | New files | Directory exists |
| P1-2 | Extract cart logic → `src/lib/services/cart.service.ts` | `src/app/actions/cart.ts`, `src/providers/CartProvider.tsx` | Unit tests pass; `npm run build` |
| P1-3 | Extract order logic → `src/lib/services/order.service.ts` | `src/app/actions/checkout.ts`, `src/app/actions/orders.ts` | Unit tests pass |
| P1-4 | Extract payment/M-Pesa logic → `src/lib/services/payment.service.ts` | `src/lib/mpesa.ts`, `src/app/api/mpesa/**` | Unit tests pass |
| P1-5 | Extract inventory logic → `src/lib/services/inventory.service.ts` | `src/app/actions/checkout.ts`, `src/app/api/mpesa/callback/route.ts` | Unit tests pass |
| P1-6 | Create unified `calculateCartTotals` in `src/lib/pricing.ts` | `src/lib/pricing.ts`, `src/providers/CartProvider.tsx` | Server/client totals match exactly |
| P1-7 | Add `Result<T, E>` type + `ActionResponse<T>` standard | `src/lib/types/result.ts` (new) | All actions use consistent return type |

### Week 2: Query Optimization & Caching
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P1-8 | Fix N+1 in `getProducts()` — use Prisma `select` with aggregates | `src/lib/queries.ts` | Query count reduced; `EXPLAIN ANALYZE` shows single query |
| P1-9 | Fix N+1 in `getCart()` — optimize includes | `src/lib/queries.ts` | Same |
| P1-10 | Create `src/lib/transformers/product.ts` — centralize product mapping | `src/lib/queries.ts`, `src/app/products/[slug]/page.tsx` | Single source of truth; no duplicate mapping |
| P1-11 | Add cache tags + targeted revalidation | `src/lib/queries.ts`, `src/app/actions/*.ts` | `revalidateTag('products')` works |
| P1-12 | Add missing DB indexes (migration) | `prisma/schema.prisma` | `prisma migrate dev` creates indexes |
| P1-13 | Configure Prisma Accelerate or PgBouncer | `.env`, `src/lib/prisma.ts` | Connection pool works under load |

### Exit Criteria
- [ ] All business logic in `src/lib/services/`
- [ ] Zero N+1 queries in main paths
- [ ] Unit tests for all services (`npm run test` passes)
- [ ] Build + typecheck + lint clean

---

## Phase 2: Frontend Architecture (Week 3-4)
**Goal:** Split large components; add streaming; improve performance

### Week 3: Component Decomposition
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P2-1 | Split `AdminProductForm` → 4 tab components | `src/app/admin/products/new/page.tsx` | Each tab <150 lines; form works |
| P2-2 | Split `CheckoutClient` → 4 step components | `src/app/cart/checkout/CheckoutClient.tsx` | Each step <150 lines; flow works |
| P2-3 | Split `ProductDetailClient` → 4 section components | `src/app/products/[slug]/ProductDetailClient.tsx` | Each section <150 lines; page works |
| P2-4 | Split `Header` → 4 sub-components | `src/components/layout/Header.tsx` | Each <100 lines; all menus work |
| P2-5 | Split `AddressForm` → fields + actions | `src/components/forms/AddressForm.tsx` | Each <100 lines; form works |
| P2-6 | Remove duplicate CSS utility classes (`btn-*`, `input-base`, `product-card`) | `src/app/globals.css` | Only `Button`, `Input`, `Card` components used |

### Week 4: Streaming & Performance
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P2-7 | Add `Suspense` boundaries to product pages | `src/app/products/page.tsx`, `src/app/products/[slug]/page.tsx` | Streaming works; `loading.tsx` shows skeleton |
| P2-8 | Add `Suspense` to cart, checkout, account pages | `src/app/cart/page.tsx`, `src/app/cart/checkout/page.tsx`, `src/app/account/**` | Per-section loading |
| P2-9 | Add dynamic imports for heavy components | `src/app/admin/**`, `src/components/admin/ImageUpload.tsx`, `src/app/cart/checkout/CheckoutClient.tsx` | Bundle analyzer shows reduced main chunk |
| P2-10 | Memoize `CartProvider` context value | `src/providers/CartProvider.tsx` | No unnecessary re-renders (React DevTools) |
| P2-11 | Add `React.memo` to `ProductCard`, `ProductGrid` | `src/components/products/ProductGrid.tsx` | Reduced renders on filter/sort |
| P2-12 | Run bundle analyzer; optimize | `npm run analyze` | Main JS < 200KB gzipped |

### Exit Criteria
- [ ] All large components split (<200 lines each)
- [ ] Streaming works on all major pages
- [ ] Bundle size targets met
- [ ] No performance regressions (Lighthouse CI)

---

## Phase 3: TypeScript & Code Quality (Week 5)
**Goal:** Eliminate `any`; generate types from Prisma; strict mode clean

### Tasks
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P3-1 | Replace all `any` / unsafe casts with proper types | `src/app/api/upload/route.ts`, `src/app/actions/checkout.ts`, `src/components/ui/button.tsx` | `tsc --noEmit` zero errors |
| P3-2 | Enable `noImplicitAny: true` in `tsconfig.json` | `tsconfig.json` | Build passes |
| P3-3 | Generate types from Prisma (remove manual `types/index.ts`) | `package.json` (add `prisma-zod-generator`), `prisma/schema.prisma` | Types auto-generated; `types/index.ts` deleted |
| P3-4 | Fix nullable mismatches (Decimal → string/number) | Generated types, `src/lib/transformers/product.ts` | No precision loss |
| P3-5 | Standardize error handling — `Result<T, E>` everywhere | `src/lib/types/result.ts`, all actions/routes | Consistent pattern |
| P3-6 | Add missing indexes migration | `prisma/migrations/` | `prisma migrate deploy` works |

### Exit Criteria
- [ ] TypeScript strict mode clean
- [ ] Types generated from Prisma (single source)
- [ ] Zero `any` in codebase
- [ ] All actions use `Result<T, E>`

---

## Phase 4: Auth Migration & Security Hardening (Week 6)
**Goal:** Migrate to Auth.js v5; add session refresh; harden security

### Tasks
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P4-1 | Migrate to Auth.js v5 (`@auth/core`, `next-auth@beta`) | `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/providers/Providers.tsx` | Auth works; sessions persist |
| P4-2 | Add session refresh / sliding expiry | `src/lib/auth.ts` (v5 config) | Session extends on activity |
| P4-3 | Reduce JWT expiry to 24h + refresh token | `src/lib/auth.ts` | Tokens rotate |
| P4-4 | Add email verification enforcement | `src/lib/auth.ts`, `src/app/auth/**` | Unverified users blocked from checkout |
| P4-5 | Implement password reset flow | `src/app/auth/forgot-password/**`, `src/app/api/auth/**` | End-to-end works |
| P4-6 | Add 2FA option (TOTP) | New files in `src/lib/auth/` | Optional for users |
| P4-7 | Security audit: CSP, headers, rate limits all verified | `next.config.ts`, `src/lib/rate-limit.ts` | `npm run test:security` (new script) |

### Exit Criteria
- [ ] Auth.js v5 running
- [ ] Session refresh works
- [ ] Password reset functional
- [ ] Security scan passes

---

## Phase 5: Accessibility, SEO & Polish (Week 7)
**Goal:** WCAG 2.1 AA; JSON-LD; fix contrast; remove dead code

### Accessibility
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P5-1 | Fix gold contrast on light mode (`#D4AF37` → `#B8860B`) | `src/app/globals.css` | WCAG AA pass (axe-core) |
| P5-2 | Add focus trap to mobile menu, cart drawer, user menu | `src/components/layout/Header.tsx` | Tab navigation trapped |
| P5-3 | Add `aria-live` to M-Pesa polling status | `src/app/cart/checkout/CheckoutClient.tsx` | Screen reader announces updates |
| P5-4 | Add `role="status"` to toasts | `src/providers/ToastProvider.tsx` | Announced |
| P5-5 | Add `fieldset`/`legend` to radio groups | `src/components/products/ProductFilters.tsx`, `src/components/theme-switcher.tsx` | Valid HTML |
| P5-6 | Add `aria-describedby` to form errors | All forms | Errors announced |

### SEO
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P5-7 | Make sitemap/robots use `NEXT_PUBLIC_APP_URL` | `src/app/sitemap.ts`, `src/app/api/robots/route.ts`, `src/app/api/sitemap/route.ts` | No hardcoded domains |
| P5-8 | Add JSON-LD Product/Offer/AggregateRating to product pages | `src/app/products/[slug]/page.tsx` | Google Rich Results test passes |
| P5-9 | Fix `/brands` and `/categories` pages (or remove links) | New pages or `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx` | No 404s |
| P5-10 | Fix `onSale` query param in `getProducts` | `src/lib/queries.ts` | Sale filter works |
| P5-11 | Remove duplicate `generateMetadata` fetch on product page | `src/app/products/[slug]/page.tsx` | Single product query |

### Dead Code Removal
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P5-12 | Remove unused dependencies | `package.json` | `npm ls` clean |
| P5-13 | Remove slate theme CSS | `src/app/globals.css` | Only light/dark |
| P5-14 | Remove `@prisma/extension-accelerate` | `package.json` | Not imported |
| P5-15 | Replace `axios` with `fetch` | `src/lib/mpesa.ts` | Works; bundle smaller |
| P5-16 | Replace `date-fns` with `Intl` | `src/app/admin/page.tsx` | Works |
| P5-17 | Remove `hono` pnpm override | `package.json` | Clean |
| P5-18 | Remove unused components | `components/ui/separator.tsx` | Not imported |

### Exit Criteria
- [ ] WCAG 2.1 AA (automated + manual)
- [ ] JSON-LD validates
- [ ] No 404 links
- [ ] Bundle size reduced
- [ ] `npm run lint && npm run typecheck && npm run build` clean

---

## Phase 6: Testing, Observability & CI/CD (Week 8)
**Goal:** Test coverage; monitoring; automated pipeline

### Testing
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P6-1 | Add unit tests for all services (Vitest) | `src/lib/services/**/*.test.ts` | Coverage > 80% |
| P6-2 | Add component tests for critical UI (React Testing Library) | `src/components/**/*.test.tsx` | Coverage > 60% |
| P6-3 | Add E2E tests for critical paths (Playwright) | `e2e/**/*.spec.ts` | Auth, cart, checkout, order flow |
| P6-4 | Add integration tests for API routes | `src/app/api/**/*.test.ts` | Coverage > 70% |

### Observability
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P6-5 | Add structured logging (pino) | `src/lib/logger.ts` (new), all services | JSON logs in stdout |
| P6-6 | Add Sentry for error tracking | `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` | Errors appear in Sentry |
| P6-7 | Add `/ready` and `/live` probes | `src/app/api/health/route.ts`, new `src/app/api/ready/route.ts` | K8s probes work |
| P6-8 | Add custom metrics (orders, revenue, errors) | `src/lib/metrics.ts` (new) | Prometheus/Grafana ready |

### CI/CD
| ID | Task | Files | Verification |
|----|------|-------|--------------|
| P6-9 | Create GitHub Actions workflow | `.github/workflows/ci.yml` | Runs on PR |
| P6-10 | Workflow: lint, typecheck, test, build | `.github/workflows/ci.yml` | All pass |
| P6-11 | Workflow: database migration on deploy | `.github/workflows/deploy.yml` | `prisma migrate deploy` |
| P6-12 | Workflow: bundle size check | `.github/workflows/ci.yml` | Fails if > threshold |

### Exit Criteria
- [ ] CI pipeline runs on every PR
- [ ] Test coverage targets met
- [ ] Sentry capturing errors
- [ ] Health/readiness probes respond
- [ ] Deploy workflow works

---

## Phase 7: Business Logic Completion (Week 9+)
**Goal:** Complete placeholder features; fix business rule inconsistencies

### Tasks (Prioritized)
| ID | Task | Effort |
|----|------|--------|
| P7-1 | Implement guest checkout flow | Medium |
| P7-2 | Add coupon/discount system | Medium |
| P7-3 | Implement loyalty points backend (earn on order, tier upgrade) | Medium |
| P7-4 | Add review moderation UI in admin | Low |
| P7-5 | Implement review helpful votes (API + UI) | Low |
| P7-6 | Add wishlist sharing (public page) | Low |
| P7-7 | Implement returns/RMA flow | High |
| P7-8 | Add M-Pesa timeout handling (cron to release abandoned reservations) | Medium |
| P7-9 | Add inventory race condition protection (row locks / optimistic locking) | High |
| P7-10 | Add profile editing (name, phone, password) | Low |
| P7-11 | Implement CMS page editor (admin) | Medium |
| P7-12 | Implement banner management (admin) | Low |
| P7-13 | Add per-brand size guides | Medium |
| P7-14 | Add shipping method selection (standard/express) | Medium |
| P7-15 | Fix M-Pesa amount calculation (KES integer, not cents) | Low |

### Exit Criteria
- [ ] All MVP features complete per PRD
- [ ] No placeholder implementations remain
- [ ] Business rules consistent across codebase

---

## Verification Checklist Per Phase

### Every Phase Must Pass:
```bash
npm run lint          # ESLint clean
npm run typecheck     # TypeScript strict clean
npm run build         # Next.js build succeeds
npm run test          # All tests pass (when added)
```

### Phase Gates:
| Phase | Gate |
|-------|------|
| 0 | Security audit passes (no P0 issues) |
| 1 | Service layer extracted; N+1 fixed; unit tests > 80% |
| 2 | Components < 200 lines; streaming works; bundle < 200KB |
| 3 | TypeScript strict clean; types generated from Prisma |
| 4 | Auth.js v5 running; session refresh works |
| 5 | WCAG AA; JSON-LD valid; no dead code |
| 6 | CI/CD pipeline green; test coverage targets; observability live |
| 7 | All PRD features complete; business rules consistent |

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Auth.js v5 migration breaks existing sessions | Medium | High | Feature flag; run both in parallel; migrate gradually |
| Prisma type generation changes APIs | Medium | Medium | Run in branch; fix incrementally; CI catches breaks |
| Bundle size doesn't meet target | Low | Medium | Dynamic imports; tree-shake Radix; analyze per component |
| M-Pesa integration breaks in sandbox | Low | High | Comprehensive mock tests; contract tests with Daraja |
| Database migration fails in prod | Low | Critical | Test on staging; backup before; rollback procedure documented |

---

## Resource Allocation (2-3 Engineers)

| Engineer | Phase 0-1 | Phase 2-3 | Phase 4-5 | Phase 6-7 |
|----------|-----------|-----------|-----------|-----------|
| **Backend/Fullstack** | Service layer, queries, Prisma | API optimization, migrations | Auth migration, security | Testing, observability, CI/CD |
| **Frontend/Fullstack** | Component splitting, streaming | Component splitting, performance | Accessibility, SEO, polish | E2E tests, component tests |
| **DevOps/Fullstack** (part-time) | — | — | — | CI/CD, Sentry, logging, probes |

---

## Definition of Done — Production Ready

- [ ] All P0-P2 issues resolved
- [ ] WCAG 2.1 AA compliant
- [ ] Test coverage: unit > 80%, integration > 70%, E2E critical paths
- [ ] CI/CD pipeline: lint, typecheck, test, build, deploy
- [ ] Observability: logging, errors, metrics, health probes
- [ ] Bundle size: < 200KB main JS gzipped
- [ ] Lighthouse: Performance > 90, Accessibility > 95, SEO > 90
- [ ] Security scan: no critical/high vulnerabilities
- [ ] Load test: 1000 concurrent users, p95 < 500ms
- [ ] All PRD features implemented and verified
- [ ] Rollback procedure documented and tested
- [ ] Runbook for common incidents written

---

## Timeline Summary

| Week | Phase | Focus |
|------|-------|-------|
| 1 | 0-1 | Critical security + service layer |
| 2 | 1 | Query optimization, caching |
| 3 | 2 | Component decomposition |
| 4 | 2 | Streaming, performance |
| 5 | 3 | TypeScript strict, generated types |
| 6 | 4 | Auth.js v5 migration |
| 7 | 5 | Accessibility, SEO, dead code |
| 8 | 6 | Testing, observability, CI/CD |
| 9+ | 7 | Business logic completion |

**Total: 8-9 weeks to production-ready**
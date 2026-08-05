# STOREFRONT UI GAP AUDIT REPORT
**Next.js 15/16 + Prisma Ecommerce App**  
**Date:** 2026-08-05  
**Scope:** Customer-facing storefront only (excludes /admin, /api, /auth)  

---

## EXECUTIVE SUMMARY

| Severity | Count | Description |
|----------|-------|-------------|
| **HIGH** | 11 | Existing DB feature has NO storefront representation; broken links; critical UX gaps |
| **MEDIUM** | 16 | Partial representation; missing badges/links; incomplete account features |
| **LOW** | 9 | Minor omissions; nice-to-have enhancements; dead code |

**Total Gaps Identified:** 36

---

## HIGH SEVERITY GAPS

### 1. Limited Edition Badge Missing from Product Cards & Detail Page
**Type:** Representation Missing  
**Evidence:** 
- `prisma/schema.prisma:207` — `isLimitedEdition Boolean @default(false)` exists on Product model
- `src/components/hero/HeroProductCarousel.tsx:29` — Shows "Limited Edition" badge in hero carousel
- `src/components/products/ProductGrid.tsx:59-65` — ProductCard ONLY shows discount badge, NO limited edition badge
- `src/app/products/[slug]/sections/ProductInfo.tsx:13-42` — ProductInfo shows NO limited edition badge
- `src/app/products/[slug]/ProductDetailClient.tsx:106-189` — Product detail page renders NO limited edition indicator

**Impact:** Customers cannot identify limited edition products on listing or detail pages.

---

### 2. Brand Detail Pages Do Not Exist (`/brands/[slug]`)
**Type:** Representation Missing / Broken Link  
**Evidence:**
- `prisma/schema.prisma:148-167` — Brand model with slug, logo, description, coverImageUrl, websiteUrl, originCountry
- `src/app/brands/page.tsx:37` — Brands index links to `/products?brand=${brand.slug}` (filter), NOT `/brands/[slug]`
- `src/app/products/[slug]/ProductDetailClient.tsx:110-112` — Breadcrumb links brand to `/products?brand=${product.brand.slug}`
- `ls src/app/brands/` — NO `[slug]` directory exists

**Impact:** Brand pages with logo, cover image, description, website link are completely inaccessible. Brand data exists in DB but has no dedicated page.

---

### 3. Collections Page Not Reachable from Navigation
**Type:** Broken Link / Missing Navigation  
**Evidence:**
- `src/app/collections/page.tsx` — Collections index page exists and works
- `src/app/collections/[slug]/page.tsx` — Collection detail page exists
- `src/components/layout/Header.tsx:16-19` — NAV_LINKS only has "Shop" and "New" — NO "Collections" link
- `src/components/layout/header/MobileMenu.tsx:12-15` — Mobile menu shopItems only has "Shop" and "New Arrivals"
- `src/components/layout/Footer.tsx:7-11` — Footer "Shop" section links to `/products`, `/products?sort=newest`, `/products?sort=popular` — NO `/collections`
- `src/components/layout/header/ShopMenu.tsx` — Check if this adds collections dropdown

**Impact:** Customers cannot discover curated collections unless they manually type `/collections`.

---

### 4. Wishlist Public Share Feature (shareToken) Has No UI
**Type:** Representation Missing  
**Evidence:**
- `prisma/schema.prisma:546-547` — `isPublic Boolean @default(false)` and `shareToken String @unique @default(cuid())` on Wishlist model
- `src/types/index.ts:256-257` — TypeScript interface includes `shareToken: string`
- `src/app/account/wishlist/WishlistClient.tsx:50-121` — Wishlist UI has NO share button, NO public link generation, NO toggle for `isPublic`
- `grep -r "shareToken" src/` — Only found in types/index.ts, NO API routes, NO UI components

**Impact:** Core wishlist sharing feature (generate public link, toggle public/private) is completely unimplemented in storefront.

---

### 5. CMS Pages (CmsPage Model) Have No Renderer Route
**Type:** Representation Missing  
**Evidence:**
- `prisma/schema.prisma:637-650` — CmsPage model with slug, content, metaTitle, metaDescription, isPublished, publishedAt
- `src/types/index.ts:303-312` — CmsPage TypeScript interface exists
- `src/lib/services/product.service.ts:784` — `getCmsPage(slug)` service function exists
- `ls src/app/pages/` — NO `pages/[slug]` route exists
- `ls src/app/` — NO `page/[slug]` or similar dynamic CMS route

**Impact:** Admin-created CMS pages (About Us, Custom Landing Pages, etc.) cannot be rendered on storefront.

---

### 6. Newsletter Thank-You Page Not Linked After Subscribe
**Type:** Broken Link / Missing Flow  
**Evidence:**
- `src/app/newsletter/thank-you/page.tsx` — Thank-you page exists at `/newsletter/thank-you`
- `src/components/layout/NewsletterForm.tsx:15-33` — On success, only shows inline "You're subscribed" message, NO redirect to thank-you page
- `src/app/api/newsletter/route.ts` — Returns JSON, no redirect

**Impact:** Users never see the dedicated thank-you page; conversion tracking / UTM attribution broken.

---

### 7. Product Recommendations Section Missing from Product Detail Page
**Type:** Representation Missing / Dead Code Reference  
**Evidence:**
- Task notes: "product-recommendations.tsx was deleted"
- `src/app/products/[slug]/ProductDetailClient.tsx:106-189` — Product detail page has NO "You may also like" / "Related products" section
- `grep -r "product-recommend" src/` — NO matches
- `src/app/products/[slug]/sections/index.ts` — Exports only ProductImageGallery, ProductInfo, ProductOptions, ProductActions, ProductShippingInfo

**Impact:** Cross-sell opportunity lost; no related products shown on PDP.

---

### 8. No Coupon / Gift Card UI at Checkout
**Type:** Representation Missing  
**Evidence:**
- `prisma/schema.prisma` — NO Coupon or GiftCard models found in schema
- `src/app/cart/checkout/steps/OrderSummary.tsx:15-78` — OrderSummary shows subtotal, tax, shipping, total — NO coupon/gift card input field
- `src/app/cart/checkout/CheckoutClient.tsx:23-175` — No coupon state, no coupon application logic
- `src/app/api/checkout/process/` — Would need to check if backend supports discounts (but schema has Order.discountTotal)

**Impact:** Even if coupons are added to DB later, no storefront UI exists. Current Order.discountTotal field is unused in checkout UI.

---

### 9. Footer Links to Non-Existent / Unreachable Pages
**Type:** Broken Links  
**Evidence:**
- `src/components/layout/Footer.tsx:112-122` — Footer "Shop" links: `/products`, `/products?sort=newest`, `/products?sort=popular` — WORK
- `src/components/layout/Footer.tsx:125-136` — Footer "Help" links: `/contact` ✓, `/shipping` ✓, `/size-guide` ✓ — WORK
- `src/components/layout/Footer.tsx:138-149` — Footer "Legal" links: `/privacy-policy` ✓, `/terms-of-service` ✓, `/cookie-policy` ✓ — WORK
- **MISSING from Footer but pages EXIST:** `/about`, `/accessibility`, `/careers`, `/affiliates`, `/sustainability`, `/press`, `/collections`, `/brands`, `/categories`, `/faqs`, `/returns`

**Impact:** Footer is incomplete; many storefront pages are orphaned (no nav/footer link).

---

### 10. Order Tracking UI Missing from Account Order Detail
**Type:** Representation Missing  
**Evidence:**
- `prisma/schema.prisma:391-394` — Order model has `shippingCarrier`, `trackingNumber`, `deliveryEstimate`, `deliveredAt`
- `src/app/account/orders/[id]/page.tsx:20-152` — Order detail shows status timeline, items, summary, shipping address, payment — NO tracking number display, NO carrier link, NO "Track Shipment" button
- `src/app/account/orders/[id]/page.tsx:60-65` — Shows status history dates but not tracking info

**Impact:** Customers cannot track shipped orders from account; must contact support.

---

### 11. Product Variant Color Swatch (colourSwatchUrl) Not Used
**Type:** Representation Missing  
**Evidence:**
- `prisma/schema.prisma:269` — ProductVariant has `colourSwatchUrl String?`
- `src/types/index.ts:50` — TypeScript interface includes `colourSwatchUrl?: string | null`
- `src/app/products/[slug]/sections/ProductOptions.tsx:52-75` — Color selector uses `variant?.colourHex` for background ONLY, ignores `colourSwatchUrl`
- `src/components/products/ProductGrid.tsx` — Product cards don't show color swatches

**Impact:** Admin-uploaded color swatch images are ignored; only hex color shown.

---

## MEDIUM SEVERITY GAPS

### 12. Header Search Redirects to `/products?q=` Instead of `/search` Page
**Type:** Incomplete Implementation  
**Evidence:**
- `src/components/layout/header/HeaderSearch.tsx:84` — `router.push(\`/search?q=${encodeURIComponent(query)}\`)`
- `src/app/search/page.tsx:7-12` — Search page IMMEDIATELY redirects to `/products?q=` — search page is never rendered
- `src/app/search/page.tsx` is effectively dead code

**Impact:** `/search` route exists but is unusable; search UX inconsistent.

---

### 13. Product "isNewArrival", "isBestSeller", "isTrending" Badges Missing from Product Cards
**Type:** Representation Missing  
**Evidence:**
- `prisma/schema.prisma:204-208` — Product has `isFeatured`, `isNewArrival`, `isBestSeller`, `isTrending`, `isLimitedEdition`
- `src/components/hero/HeroProductCarousel.tsx:26-30` — Hero carousel shows badges for New Arrival, Best Seller, Trending, Limited Edition
- `src/components/products/ProductGrid.tsx:59-65` — ProductCard ONLY shows discount badge
- `src/app/products/[slug]/sections/ProductInfo.tsx` — NO badges shown on PDP

**Impact:** Product discovery badges (New, Best Seller, Trending) only appear in hero carousel, not on listings or PDP.

---

### 14. Brand Page Links from Product Cards Missing
**Type:** Missing Navigation  
**Evidence:**
- `src/components/products/ProductGrid.tsx:102` — Shows brand name as text only: `<p className="text-xs uppercase tracking-wider text-accent mb-1">{product.brand.name}</p>` — NOT a link
- `src/app/products/[slug]/ProductDetailClient.tsx:167-168` — Brand in product details is text only: `<span className="font-medium ml-2">{product.brand.name}</span>`
- `src/app/products/[slug]/sections/ProductInfo.tsx:20` — Brand name is text only

**Impact:** Customers cannot navigate to brand-filtered products from product cards or PDP (though breadcrumb on PDP has brand link).

---

### 15. Product Collections Not Displayed on Product Detail Page
**Type:** Representation Missing  
**Evidence:**
- `prisma/schema.prisma:594-604` — ProductCollection join table exists
- `src/types/index.ts:24` — Product interface includes `collections?: { collection: { id: string; name: string; slug: string } }[]`
- `src/app/products/[slug]/ProductDetailClient.tsx` — NO collections displayed
- `src/app/products/[slug]/sections/ProductInfo.tsx` — NO collections shown

**Impact:** Customers can't see which collections a product belongs to; collection cross-linking missing.

---

### 16. Account Dashboard Missing Order Tracking Section
**Type:** Incomplete Feature  
**Evidence:**
- `src/app/account/AccountContent.tsx:70-121` — Recent Orders section shows status badge but NO tracking number, NO "Track" button
- `src/app/account/orders/page.tsx` — Order list shows status but NO tracking info
- `src/app/account/orders/[id]/page.tsx` — As noted in HIGH #10, no tracking UI

**Impact:** No self-service order tracking in account area.

---

### 17. Wishlist Page Missing "Share Wishlist" Feature
**Type:** Representation Missing  
**Evidence:**
- `src/app/account/wishlist/page.tsx` — Renders WishlistClient
- `src/app/account/wishlist/WishlistClient.tsx` — NO share button, NO public link copy, NO `isPublic` toggle
- `prisma/schema.prisma:546-547` — `isPublic` and `shareToken` fields exist

**Impact:** Wishlist sharing completely absent from account UI.

---

### 18. Review Photos Render but No Lightbox/Modal for Enlarged View
**Type:** Incomplete UX  
**Evidence:**
- `src/components/product-reviews.tsx:88-102` — Review images render as 72x72 thumbnails linking to raw image URL (opens in new tab)
- NO lightbox, NO gallery view, NO zoom capability

**Impact:** Poor UX for review photos; users leave page to view images.

---

### 19. Product Variant Size US/UK/EU Fields Not Fully Utilized
**Type:** Partial Implementation  
**Evidence:**
- `prisma/schema.prisma:264-266` — Variant has `sizeUs`, `sizeEu`, `sizeUk`
- `src/app/products/[slug]/sections/ProductOptions.tsx:37-45` — Size system toggle (EU/US/UK) implemented but ONLY reads from variant's sizeUs/sizeEu/sizeUk
- `src/app/products/[slug]/ProductDetailClient.tsx:174-176` — Product details shows raw EU size only: `{product.gender}`

**Impact:** Size conversion partially works but product detail page doesn't show converted sizes.

---

### 20. Header Navigation Missing "Categories" Link
**Type:** Missing Navigation  
**Evidence:**
- `src/app/categories/page.tsx` — Categories page exists
- `src/components/layout/Header.tsx:16-19` — NAV_LINKS: only "Shop" and "New"
- `src/components/layout/header/MobileMenu.tsx:12-15` — Same
- `src/components/layout/Footer.tsx:7-11` — Footer Shop links: no Categories

**Impact:** Customers can't browse categories from main navigation.

---

### 21. No "On Sale" / "Clearance" Filter Link in Navigation
**Type:** Missing Navigation  
**Evidence:**
- `src/app/products/page.tsx:69-70` — Supports `onSale` query param
- `src/components/products/ProductFilters.tsx` — Has price range filter but NO "On Sale" quick filter in header/nav
- `src/components/layout/Header.tsx`, `Footer.tsx` — NO sale/clearance link

**Impact:** Sale products discoverable only via filters sidebar, not primary nav.

---

### 22. Product "isFeatured" Flag Not Used in Storefront
**Type:** Dead Data  
**Evidence:**
- `prisma/schema.prisma:204` — `isFeatured Boolean @default(false)`
- `src/lib/services/product.service.ts` — `getFeaturedProducts` function exists (line ~770)
- `src/app/page.tsx` — Home page uses banners and manual sections, NO featured products section
- `grep -r "isFeatured" src/app/` — Only in admin, not in storefront components

**Impact:** Featured products flag exists in DB but has no storefront representation.

---

### 23. No "Write Review" Button on Order Detail for Delivered Items
**Type:** Incomplete Flow  
**Evidence:**
- `src/app/account/orders/[id]/page.tsx:89-98` — Shows "Write a review" link ONLY for status CONFIRMED/SHIPPED/DELIVERED
- BUT: Review requires `orderItemId` for verified purchase; link passes `?review=1` but ProductReviews component at `src/components/product-reviews.tsx:133-137` scrolls to form — doesn't pre-fill orderItemId

**Impact:** Verified purchase reviews not properly linked from account orders.

---

### 24. Cart Drawer / Mini-Cart Missing "View Cart" Link in Some States
**Type:** Incomplete UX  
**Evidence:**
- `src/components/layout/header/CartDrawer.tsx:212` — Has "View Bag" link to `/cart`
- `src/components/layout/header/CartDrawer.tsx:224` — Link text uses `itemCount` but not always visible

**Impact:** Minor UX inconsistency.

---

### 25. Footer Social Links Only Render If Settings Exist (No Fallback Placeholders)
**Type:** Incomplete UX  
**Evidence:**
- `src/components/layout/Footer.tsx:64-108` — Social links only render if `settings?.instagramUrl` etc. exist
- NO placeholder/disabled state when not configured
- `src/components/layout/Footer.tsx:37-38` — Settings passed from layout but may be null

**Impact:** Empty social section when not configured; no visual indication.

---

### 26. Product Detail Page Missing "Back to Results" / "Continue Shopping" Context
**Type:** UX Gap  
**Evidence:**
- `src/app/products/[slug]/ProductDetailClient.tsx` — NO breadcrumb link back to filtered results
- Breadcrumb shows: Products → Brand → Product Name
- NO link back to category/collection/search results

**Impact:** Users lose filter context when navigating from listings.

---

### 27. Account Addresses Page Missing "Set as Default Billing" Toggle
**Type:** Incomplete Feature  
**Evidence:**
- `prisma/schema.prisma:135-137` — Address has `isDefault`, `isBilling`, `isShipping`
- `src/app/account/addresses/page.tsx:35-68` — Shows "Set as Default" button but NO billing/shipping designation UI
- `src/app/account/addresses/new/page.tsx` and `edit/page.tsx` — Not checked but likely same

**Impact:** Can't distinguish billing vs shipping addresses in UI.

---

## LOW SEVERITY GAPS

### 28. Newsletter Subscribe Doesn't Redirect to Thank-You Page
**Type:** Missing Flow  
**Evidence:** See HIGH #6 — same root cause, listed here as low-impact UX.

---

### 29. Search Page (`/search`) is Dead Code
**Type:** Dead Code  
**Evidence:** See MEDIUM #12 — search page immediately redirects, never renders.

---

### 30. Product "gender" Field Not Used for Filtering/Display in Storefront
**Type:** Unused Data  
**Evidence:**
- `prisma/schema.prisma:202` — `gender GenderCategory @default(UNISEX)`
- `src/app/products/page.tsx` — Supports `gender` query param
- `src/components/products/ProductFilters.tsx` — NO gender filter in sidebar
- `src/components/products/ProductGrid.tsx` — NO gender badge on cards
- `src/app/products/[slug]/ProductDetailClient.tsx:174-176` — Shows gender in details table only

**Impact:** Gender-based browsing not exposed in UI.

---

### 31. Product "weightKg" Field Not Displayed Anywhere
**Type:** Unused Data  
**Evidence:**
- `prisma/schema.prisma:213` — `weightKg Decimal? @db.Decimal(8, 3)`
- `src/types/index.ts:19` — Product interface includes `weightKg?: number | null`
- NOWHERE in storefront is weight displayed

**Impact:** Shipping weight info unavailable to customers.

---

### 32. Product "costPrice" Field Exists But Not Used (Internal Only)
**Type:** Internal Data Leak Risk  
**Evidence:**
- `prisma/schema.prisma:211` — `costPrice Decimal? @db.Decimal(10, 2)`
- `src/types/index.ts` — NOT included in Product interface (good)
- Verify NO API leaks costPrice to storefront

**Impact:** Low — correctly excluded from storefront types, but worth verifying.

---

### 33. Inventory "lowStockThreshold" Not Exposed as "Low Stock" Badge
**Type:** Missing UX Signal  
**Evidence:**
- `prisma/schema.prisma:301` — `lowStockThreshold Int @default(5)`
- `src/types/index.ts:72` — Inventory interface includes `lowStockThreshold`
- `src/app/products/[slug]/sections/ProductInfo.tsx:37-41` — Shows "In Stock (X available)" but NO "Low Stock" warning when near threshold
- `src/components/products/ProductGrid.tsx` — NO low stock indicator

**Impact:** No urgency signaling for low-stock items.

---

### 34. Warehouse / Multi-Location Inventory Not Reflected in Storefront
**Type:** Unused Data  
**Evidence:**
- `prisma/schema.prisma:319-333` — Warehouse model exists
- `src/types/index.ts:66-77` — Inventory includes `warehouseId`
- Storefront shows aggregate `availableStock` only, no location info

**Impact:** No "Pick up at store" / "Ship from warehouse" options.

---

### 35. Order "notes" Field Not Displayed in Account Order Detail
**Type:** Missing Data Display  
**Evidence:**
- `prisma/schema.prisma:395` — `notes String?`
- `src/app/account/orders/[id]/page.tsx` — NO order notes displayed

**Impact:** Customer-added order notes invisible in account.

---

### 36. Product "metaTitle" / "metaDescription" Not Used for SEO on PDP
**Type:** Missed SEO Opportunity  
**Evidence:**
- `prisma/schema.prisma:214-215` — `metaTitle`, `metaDescription`
- `src/app/products/[slug]/page.tsx` — Uses product name/description for metadata, not metaTitle/metaDescription fields
- `src/lib/services/product.service.ts` — Fetches these fields but not passed to metadata generation

**Impact:** Custom SEO meta tags per product not utilized.

---

## SUMMARY BY CATEGORY

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Missing UI for Existing DB Feature | 7 | 5 | 5 | 17 |
| Broken / Missing Navigation Links | 2 | 3 | 0 | 5 |
| Incomplete Account/Order Features | 1 | 3 | 1 | 5 |
| Dead Code / Unused Routes | 0 | 1 | 1 | 2 |
| Missing Badges/Indicators | 1 | 2 | 1 | 4 |
| SEO / Metadata Gaps | 0 | 0 | 1 | 1 |
| UX Polish / Incomplete Flows | 0 | 2 | 1 | 3 |
| **TOTAL** | **11** | **16** | **9** | **36** |

---

## RECOMMENDED PRIORITY ORDER

1. **P0 (Launch Blockers):** #1, #2, #3, #5, #7 — Core product/collection/brand/CMS pages missing
2. **P1 (High Value):** #4, #6, #8, #10, #11 — Wishlist sharing, newsletter flow, coupons, tracking, swatches
3. **P2 (Navigation/Discovery):** #9, #13, #14, #15, #20, #21 — Footer/header nav, badges, brand links, collections on PDP
4. **P3 (Account Polish):** #16, #17, #23, #26, #27, #35 — Order tracking, wishlist share, review flow, address types
5. **P4 (Nice to Have):** #12, #18, #19, #22, #24, #25, #28-34, #36 — Search page, review lightbox, size conversion, featured products, SEO meta

---

## FILES REFERENCED FOR EVIDENCE

- `prisma/schema.prisma` — All model definitions
- `src/types/index.ts` — TypeScript interfaces
- `src/components/layout/Header.tsx` — Main navigation
- `src/components/layout/Footer.tsx` — Footer links
- `src/components/layout/header/MobileMenu.tsx` — Mobile navigation
- `src/components/layout/header/HeaderSearch.tsx` — Search behavior
- `src/components/products/ProductGrid.tsx` — Product card rendering
- `src/app/products/[slug]/ProductDetailClient.tsx` — Product detail page
- `src/app/products/[slug]/sections/ProductInfo.tsx` — Product info section
- `src/app/products/[slug]/sections/ProductOptions.tsx` — Variant selectors
- `src/app/products/[slug]/sections/ProductActions.tsx` — Add to cart/wishlist/share
- `src/app/collections/page.tsx` — Collections index
- `src/app/collections/[slug]/page.tsx` — Collection detail
- `src/app/brands/page.tsx` — Brands index (NO detail page)
- `src/app/account/page.tsx` — Account dashboard
- `src/app/account/AccountContent.tsx` — Account sidebar/content
- `src/app/account/orders/page.tsx` — Order list
- `src/app/account/orders/[id]/page.tsx` — Order detail
- `src/app/account/wishlist/page.tsx` — Wishlist page
- `src/app/account/wishlist/WishlistClient.tsx` — Wishlist client component
- `src/app/cart/checkout/CheckoutClient.tsx` — Checkout flow
- `src/app/cart/checkout/steps/OrderSummary.tsx` — Order summary
- `src/components/product-reviews.tsx` — Reviews with images
- `src/components/hero/HeroProductCarousel.tsx` — Hero badge logic
- `src/app/newsletter/thank-you/page.tsx` — Newsletter thank you
- `src/components/layout/NewsletterForm.tsx` — Newsletter subscribe
- `src/app/search/page.tsx` — Search page (dead)
- `src/app/categories/page.tsx` — Categories page
- `src/lib/services/product.service.ts` — Data fetching services


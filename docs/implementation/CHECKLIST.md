# Implementation Checklist

## Phase 1: Foundation (Week 1-2)

### Project Setup
- [ ] Update package.json with production dependencies
- [ ] Configure TypeScript strict mode
- [ ] Set up ESLint + Prettier + Husky
- [ ] Configure Tailwind CSS 4
- [ ] Set up shadcn/ui component library
- [ ] Create Prisma schema (from SCHEMA.md)
- [ ] Run initial migration
- [ ] Set up Prisma Accelerate connection

### Auth.js v5 Configuration
- [ ] Create auth.ts with Credentials + Google providers
- [ ] Configure Prisma Adapter
- [ ] Set up JWT session strategy
- [ ] Add role field to User model
- [ ] Create API route: /api/auth/[...nextauth]
- [ ] Create middleware.ts for route protection
- [ ] Create types/next-auth.d.ts for type extensions
- [ ] Build login/register pages
- [ ] Add SessionProvider to root layout

### Database
- [ ] Provision Neon PostgreSQL database
- [ ] Configure DATABASE_URL and DIRECT_URL
- [ ] Run prisma migrate dev
- [ ] Seed with sample brands, categories, products
- [ ] Verify Prisma Accelerate connection

## Phase 2: Core Backend (Week 2-4)

### Server Actions - Cart
- [ ] addToCart (variantId, quantity)
- [ ] updateCartQuantity (variantId, quantity)
- [ ] removeFromCart (variantId)
- [ ] getCart (server-side for RSC)
- [ ] clearCart
- [ ] mergeGuestCart (on login)

### Server Actions - Checkout
- [ ] submitShippingAddress (form validation with Zod)
- [ ] processPayment (M-Pesa STK Push initiation)
- [ ] handleCashOnDelivery
- [ ] createOrder (transaction with inventory reservation)
- [ ] clearCartAfterOrder

### Server Actions - Orders
- [ ] getUserOrders (paginated)
- [ ] getOrderDetails (with items, status history)
- [ ] cancelOrder (release inventory)

### M-Pesa Integration
- [ ] mpesa.ts service (token caching, STK Push, Query)
- [ ] Callback endpoint: /api/mpesa/callback
- [ ] IP whitelisting for Safaricom IPs
- [ ] Phone number normalization (2547XXXXXXXX)
- [ ] Polling UI component for payment status
- [ ] Handle success/failed/cancelled callbacks
- [ ] Update order status on callback

### Data Queries (RSC)
- [ ] getProducts (filters: category, brand, price, sort, pagination)
- [ ] getProductBySlug (with variants, images, reviews)
- [ ] getCategories (hierarchical)
- [ ] getBrands
- [ ] getCollections
- [ ] getBanners (by placement)
- [ ] searchProducts (full-text)

## Phase 3: Frontend Rewrite (Week 4-6)

### Layout & Navigation
- [ ] Root layout with providers (Session, Cart, Toast)
- [ ] Header: logo, nav, search, cart drawer, user menu
- [ ] Footer: links, newsletter, social
- [ ] Mobile navigation drawer

### Homepage
- [ ] Hero section (banner from CMS)
- [ ] Featured products carousel
- [ ] Category grid
- [ ] Brand showcase
- [ ] Newsletter signup

### Product Listing (/products)
- [ ] Server-side filtering via searchParams
- [ ] Sidebar filters (category, brand, price range)
- [ ] Sort dropdown
- [ ] Product grid (RSC)
- [ ] Pagination
- [ ] Loading skeletons
- [ ] Empty state

### Product Detail (/products/[id])
- [ ] Image gallery with thumbnails
- [ ] Variant selection (color swatches, size grid)
- [ ] Real-time stock indicator
- [ ] Price display (sale/original)
- [ ] Add to cart (Server Action)
- [ ] Wishlist toggle
- [ ] Product tabs: Description, Details, Reviews
- [ ] Reviews with pagination
- [ ] Related products carousel

### Cart
- [ ] Cart drawer (client component)
- [ ] Cart page with quantity updates
- [ ] Order summary (subtotal, tax, shipping, total)
- [ ] Promo code input (placeholder)
- [ ] Checkout button

### Checkout (/cart/checkout)
- [ ] Step 1: Shipping address form
- [ ] Step 2: Payment method selection
  - [ ] M-Pesa STK Push (phone input, polling UI)
  - [ ] Cash on Delivery
- [ ] Step 3: Order confirmation
- [ ] Order summary sidebar (sticky)

### Account Pages
- [ ] Dashboard (order summary, wishlist count)
- [ ] Orders list with status badges
- [ ] Order detail with timeline
- [ ] Address management
- [ ] Profile settings

### Auth Pages
- [ ] Login form (Server Action)
- [ ] Register form (Server Action)
- [ ] Error page

## Phase 4: Admin Dashboard (Week 6-7)

### Layout & Auth
- [ ] Admin layout with sidebar navigation
- [ ] Role-based access (middleware check for ADMIN)
- [ ] Protected routes

### Product Management
- [ ] Product list (table with search, filters, pagination)
- [ ] Create/Edit product form
  - [ ] Basic info (name, slug, brand, category, gender)
  - [ ] Pricing (base, sale, cost)
  - [ ] Variants (size/color matrix)
  - [ ] Images upload (multiple, drag-drop)
  - [ ] SEO fields
  - [ ] Status flags (featured, new, bestseller, etc.)

### Order Management
- [ ] Order list with status filters
- [ ] Order detail view
- [ ] Status update dropdown (with history)
- [ ] Print packing slip

### Brand/Category Management
- [ ] CRUD for brands
- [ ] CRUD for categories (hierarchical)

### Content Management
- [ ] Banner management (hero, promo bars)
- [ ] Collection management
- [ ] CMS pages (shipping, returns, privacy, terms)

### Analytics (Basic)
- [ ] Sales overview (revenue, orders, AOV)
- [ ] Top products
- [ ] Low stock alerts

## Phase 5: Infrastructure & Launch (Week 7-8)

### Local Development
- [ ] docker-compose.yml (PostgreSQL, Redis)
- [ ] .env.example with all required variables
- [ ] Seed script for development data

### Deployment
- [ ] Vercel project configuration
- [ ] Neon database branch for preview deployments
- [ ] Environment variables in Vercel
- [ ] Prisma Accelerate configuration
- [ ] Custom domain setup

### Monitoring & Quality
- [ ] Error tracking (Sentry or similar)
- [ ] Analytics (Vercel Analytics + custom events)
- [ ] Lighthouse CI in GitHub Actions
- [ ] Playwright E2E tests for critical flows
- [ ] Load testing (k6 or Artillery)

### Pre-Launch Checklist
- [ ] M-Pesa production credentials configured
- [ ] Callback URL registered in Daraja portal
- [ ] SSL/TLS verified
- [ ] Email transactional (order confirmations)
- [ ] Sitemap.xml generation
- [ ] Robots.txt
- [ ] Structured data (Product, Organization, Breadcrumb)
- [ ] 404/500 error pages
- [ ] Cookie consent banner
- [ ] Accessibility audit (WCAG AA)

## File Creation Order

1. prisma/schema.prisma
2. lib/prisma.ts
3. lib/auth.ts
4. app/api/auth/[...nextauth]/route.ts
5. middleware.ts
6. types/next-auth.d.ts
7. lib/mpesa.ts
8. app/api/mpesa/callback/route.ts
9. lib/queries.ts
10. lib/validations.ts
11. app/actions/cart.ts
12. app/actions/checkout.ts
13. app/actions/orders.ts
14. Components (UI, Layout, Products, Cart, Checkout, Admin)
15. App Router pages
16. Admin pages
17. Seed script
18. Docker compose
19. CI/CD workflows
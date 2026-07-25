# STRIDE - Premium Footwear E-Commerce Platform

A modern, feature-rich e-commerce platform built with Next.js, React, and Tailwind CSS. STRIDE offers a premium shopping experience with authentication, shopping cart, checkout, and loyalty rewards.

## Features

### Core Features
- **Product Catalog**: Browse and search through a curated collection of premium shoes
- **Advanced Filtering**: Filter by category, brand, price range, and more
- **Product Details**: Comprehensive product pages with images, specifications, and customer reviews
- **Shopping Cart**: Add, remove, and manage items with persistent storage
- **Checkout Flow**: Multi-step checkout process with shipping and payment options

### User Features
- **Authentication**: Secure login and registration system
- **User Dashboard**: View orders, favorites, and account settings
- **Order History**: Track past purchases and order status
- **Favorites/Wishlist**: Save products for later
- **Address Management**: Store and manage multiple shipping addresses
- **Profile Settings**: Update personal information and preferences

### Social Features
- **Product Reviews**: Read and write product reviews with ratings
- **Helpful Votes**: Mark reviews as helpful or not helpful
- **Product Recommendations**: Get personalized product suggestions
- **Loyalty Program**: Earn and redeem reward points
- **Tier System**: Bronze, Silver, Gold, and Platinum membership tiers

### Business Features
- **Promotional Codes**: Apply discount codes at checkout
- **Free Shipping**: Automatic free shipping on orders over $200
- **Tax Calculation**: Automatic tax calculation (9% default)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Performance Optimized**: Fast loading times and smooth interactions

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4 with custom design system
- **State Management**: React Context API
- **Persistence**: localStorage for cart and auth state
- **Icons**: Lucide React
- **SEO**: Next.js metadata, sitemap, and robots.txt

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx              # Root layout with providers
│   ├── page.tsx                # Homepage
│   ├── products/
│   │   ├── page.tsx            # Products listing page
│   │   └── [id]/
│   │       └── page.tsx        # Product detail page
│   ├── cart/
│   │   ├── page.tsx            # Shopping cart
│   │   └── checkout/
│   │       └── page.tsx        # Checkout flow
│   ├── auth/
│   │   ├── login/page.tsx      # Login page
│   │   └── register/page.tsx   # Registration page
│   ├── account/
│   │   └── page.tsx            # User dashboard
│   ├── error.tsx               # Error boundary
│   ├── not-found.tsx           # 404 page
│   ├── sitemap.ts             # SEO sitemap
│   └── globals.css             # Global styles
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # Navigation header
│   │   └── Footer.tsx          # Footer
│   ├── product-card.tsx        # Product card component
│   ├── product-reviews.tsx     # Reviews component
│   ├── product-recommendations.tsx # Recommendations
│   ├── loyalty-dashboard.tsx   # Loyalty rewards
│   ├── skeleton-loader.tsx     # Loading skeletons
│   └── meta-tags.tsx           # SEO meta tags
│
├── lib/
│   ├── contexts/
│   │   ├── auth-context.tsx    # Authentication context
│   │   └── cart-context.tsx    # Shopping cart context
│   ├── data/
│   │   ├── products.ts         # Product data & helpers
│   │   ├── reviews.ts          # Review data
│   │   └── orders.ts           # Order data & functions
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   └── utils.ts                # Utility functions
│
├── public/
│   └── robots.txt             # SEO robots file
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── next.config.mjs
```

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd v0-project
```

2. Install dependencies
```bash
pnpm install
```

3. Run the development server
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Demo Account
For testing purposes, use these credentials:
- **Email**: demo@example.com
- **Password**: demo

## Authentication

The app uses a Context-based authentication system with localStorage persistence:
- Users can register with name, email, and password
- Login with email and password
- Session persists across page refreshes
- Demo account available for testing

## Shopping Cart

- Add/remove products with color and size selection
- Persistent cart (saved to localStorage)
- Real-time price calculations
- Quantity adjustments
- Free shipping on orders over $200
- Tax calculation (9%)
- Promo code support

## Checkout Process

Multi-step checkout flow:
1. **Shipping**: Enter delivery address
2. **Payment**: Card payment information
3. **Confirmation**: Order confirmation with number

## Loyalty Program

Four-tier membership system:
- **Bronze**: 1x points multiplier, free shipping over $200
- **Silver**: 2x points multiplier, free shipping on all orders, 10% discount
- **Gold**: 3x points multiplier, express shipping, 15% discount
- **Platinum**: 4x points multiplier, white glove delivery, 20% discount, personal stylist

Earn 1 point per $10 spent, redeem for exclusive rewards.

## Performance Optimizations

- Component-level code splitting
- Image optimization with Next.js Image component
- CSS-in-JS for critical styles
- Lazy loading for product recommendations
- Efficient filtering with memoization
- LocalStorage caching for cart and auth

## SEO Features

- Dynamic metadata for all pages
- XML sitemap auto-generation
- robots.txt configuration
- Open Graph tags
- Canonical URLs
- Structured data support

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Styling Guide

### Design System

**Colors**:
- Primary: #E8A97C (Accent)
- Background: #F9F7F4 (Light), #0F0F0F (Dark)
- Foreground: #1A1A1A (Light), #F9F7F4 (Dark)
- Muted: #E8E6E4 (Light), #2A2A2A (Dark)

**Typography**:
- Headings: Geist font-family
- Body: Geist font-family

**Spacing**: Tailwind default scale (4px base unit)

### Tailwind Classes

Common patterns used throughout:
- `.btn-primary`: Primary action button
- `.btn-secondary`: Secondary action button
- `.input-base`: Standard input field
- `.container-max`: Content container with max-width
- `.card`: Card component styling

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check existing documentation
2. Review the code comments
3. Test with the demo account
4. Create an issue with detailed information

## Deployment

Deploy to Vercel with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/stride)

Or deploy manually:

```bash
pnpm build
# Deployment to Vercel or your preferred hosting
```

## Future Enhancements

- [ ] Product inventory management
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Real payment processing
- [ ] Advanced analytics
- [ ] AI-powered recommendations
- [ ] Social sharing
- [ ] AR product preview
- [ ] Multiple languages
- [ ] Mobile app

---

Built with ❤️ using Next.js and Tailwind CSS

-- ============================================================
-- EXTENSION ENABLEMENT (optional but recommended)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- DOMAINS & ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('customer', 'admin', 'manager', 'editor', 'support');
CREATE TYPE order_status AS ENUM (
    'pending', 'confirmed', 'processing', 'shipped', 'in_transit',
    'delivered', 'cancelled', 'returned', 'refunded', 'on_hold'
);
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');
CREATE TYPE gender_category AS ENUM ('men', 'women', 'kids', 'unisex');
CREATE TYPE product_status AS ENUM ('draft', 'active', 'inactive', 'discontinued');
CREATE TYPE inventory_action AS ENUM ('received', 'sold', 'returned', 'adjusted', 'transferred');
CREATE TYPE payment_method AS ENUM (
    'credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay',
    'klarna', 'afterpay', 'gift_card', 'bank_transfer', 'cod'
);
CREATE TYPE payment_status AS ENUM ('pending', 'authorized', 'captured', 'failed', 'refunded', 'partially_refunded');

-- ============================================================
-- CORE: USERS & AUTH
-- ============================================================

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(30),
    avatar_url      TEXT,
    date_of_birth   DATE,
    gender          VARCHAR(20),
    is_verified     BOOLEAN NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    email_verified_at TIMESTAMPTZ,
    last_login_at   TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_name ON users (last_name, first_name);
CREATE INDEX idx_users_created ON users (created_at);

-- -----------------------------------------------------------
-- ADDRESSES
-- -----------------------------------------------------------

CREATE TABLE addresses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label           VARCHAR(50) DEFAULT 'Home',
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(30),
    address_line1   VARCHAR(255) NOT NULL,
    address_line2   VARCHAR(255),
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100),
    postal_code     VARCHAR(20) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    is_billing      BOOLEAN NOT NULL DEFAULT FALSE,
    is_shipping     BOOLEAN NOT NULL DEFAULT TRUE,
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_addresses_user ON addresses (user_id);

-- ============================================================
-- BRANDS (global & local, treated equally)
-- ============================================================

CREATE TABLE brands (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(150) NOT NULL UNIQUE,
    slug            VARCHAR(180) NOT NULL UNIQUE,
    description     TEXT,
    logo_url        TEXT,
    cover_image_url TEXT,
    website_url     VARCHAR(255),
    origin_country  VARCHAR(100),
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    is_global_brand BOOLEAN NOT NULL DEFAULT TRUE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INT NOT NULL DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_brands_slug ON brands (slug);
CREATE INDEX idx_brands_featured ON brands (is_featured, sort_order);

-- ============================================================
-- CATEGORIES (hierarchical — self-referencing)
-- ============================================================

CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id       UUID REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(150) NOT NULL,
    slug            VARCHAR(180) NOT NULL UNIQUE,
    description     TEXT,
    image_url       TEXT,
    icon            VARCHAR(100),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      INT NOT NULL DEFAULT 0,
    level           INT NOT NULL DEFAULT 0,
    path            LTREE,          -- requires ltree extension; fallback: TEXT
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories (slug);
CREATE INDEX idx_categories_parent ON categories (parent_id);
CREATE INDEX idx_categories_path ON categories USING GIST (path);

-- ============================================================
-- PRODUCTS
-- ============================================================

CREATE TABLE products (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_id        UUID NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
    category_id     UUID REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(255) NOT NULL,
    slug            VARCHAR(280) NOT NULL UNIQUE,
    short_description VARCHAR(500),
    description     TEXT,
    gender          gender_category NOT NULL DEFAULT 'unisex',
    product_status  product_status NOT NULL DEFAULT 'draft',
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    is_new_arrival  BOOLEAN NOT NULL DEFAULT FALSE,
    is_best_seller  BOOLEAN NOT NULL DEFAULT FALSE,
    is_limited_edition BOOLEAN NOT NULL DEFAULT FALSE,
    is_trending     BOOLEAN NOT NULL DEFAULT FALSE,
    tax_class       VARCHAR(50) DEFAULT 'standard',
    base_price      DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
    sale_price      DECIMAL(10,2) CHECK (sale_price IS NULL OR sale_price >= 0),
    cost_price      DECIMAL(10,2) CHECK (cost_price IS NULL OR cost_price >= 0),
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    discount_percent DECIMAL(5,2) CHECK (discount_percent IS NULL OR discount_percent BETWEEN 0 AND 100),
    rating_avg      DECIMAL(3,2) DEFAULT 0 CHECK (rating_avg BETWEEN 0 AND 5),
    review_count    INT NOT NULL DEFAULT 0,
    total_stock     INT NOT NULL DEFAULT 0 CHECK (total_stock >= 0),
    sold_count      INT NOT NULL DEFAULT 0 CHECK (sold_count >= 0),
    weight_kg       DECIMAL(8,3),
    meta_title      VARCHAR(255),
    meta_description TEXT,
    meta_keywords   TEXT,
    published_at    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_brand ON products (brand_id);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_status ON products (product_status);
CREATE INDEX idx_products_price ON products (base_price, sale_price);
CREATE INDEX idx_products_gender ON products (gender);
CREATE INDEX idx_products_featured ON products (is_featured, is_new_arrival, is_best_seller, is_trending);
CREATE INDEX idx_products_rating ON products (rating_avg DESC);
CREATE INDEX idx_products_created ON products (created_at DESC);

-- Full-text search index
CREATE INDEX idx_products_fts ON products USING GIN (
    to_tsvector('english', coalesce(name, '') || ' ' || coalesce(short_description, '') || ' ' || coalesce(description, ''))
);

-- -----------------------------------------------------------
-- PRODUCT IMAGES (gallery with ordering)
-- -----------------------------------------------------------

CREATE TABLE product_images (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id      UUID,              -- nullable; if set, image is specific to a variant (colour)
    url             TEXT NOT NULL,
    alt_text        VARCHAR(255),
    width           INT,
    height          INT,
    file_size_bytes BIGINT,
    is_primary      BOOLEAN NOT NULL DEFAULT FALSE,
    is_360_view     BOOLEAN NOT NULL DEFAULT FALSE,
    is_video        BOOLEAN NOT NULL DEFAULT FALSE,
    video_url       TEXT,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prodimg_product ON product_images (product_id);
CREATE INDEX idx_prodimg_primary ON product_images (product_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_prodimg_variant ON product_images (variant_id);

-- -----------------------------------------------------------
-- PRODUCT VARIANTS (size + colour combinations)
-- -----------------------------------------------------------

CREATE TABLE product_variants (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    sku             VARCHAR(100) NOT NULL UNIQUE,
    ean             VARCHAR(13),
    upc             VARCHAR(12),
    size            VARCHAR(50) NOT NULL,        -- e.g. "US 9", "EU 42", "One Size"
    size_us         VARCHAR(20),
    size_eu         VARCHAR(20),
    size_uk         VARCHAR(20),
    colour          VARCHAR(100) NOT NULL,
    colour_hex      VARCHAR(7),                  -- e.g. "#1A1A1A"
    colour_swatch_url TEXT,
    material        VARCHAR(100),
    gender          gender_category,
    base_price      DECIMAL(10,2) CHECK (base_price IS NULL OR base_price >= 0),
    sale_price      DECIMAL(10,2) CHECK (sale_price IS NULL OR sale_price >= 0),
    weight_kg       DECIMAL(8,3),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_default      BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_var_product ON product_variants (product_id);
CREATE INDEX idx_var_sku ON product_variants (sku);
CREATE INDEX idx_var_size_colour ON product_variants (product_id, size, colour);
CREATE INDEX idx_var_active ON product_variants (product_id, is_active);

-- -----------------------------------------------------------
-- INVENTORY (per variant, per warehouse)
-- -----------------------------------------------------------

CREATE TABLE warehouses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(150) NOT NULL,
    code            VARCHAR(50) NOT NULL UNIQUE,
    address_line1   VARCHAR(255),
    city            VARCHAR(100),
    state           VARCHAR(100),
    country         VARCHAR(100),
    postal_code     VARCHAR(20),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE inventory (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id      UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    warehouse_id    UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    quantity_on_hand INT NOT NULL DEFAULT 0 CHECK (quantity_on_hand >= 0),
    quantity_reserved INT NOT NULL DEFAULT 0 CHECK (quantity_reserved >= 0),
    quantity_available INT GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
    low_stock_threshold INT NOT NULL DEFAULT 5,
    reorder_point   INT DEFAULT 10,
    reorder_quantity INT DEFAULT 50,
    location_aisle  VARCHAR(50),
    location_shelf  VARCHAR(50),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (variant_id, warehouse_id)
);

CREATE INDEX idx_inv_variant ON inventory (variant_id);
CREATE INDEX idx_inv_warehouse ON inventory (warehouse_id);
CREATE INDEX idx_inv_low_stock ON inventory (warehouse_id, quantity_on_hand) WHERE quantity_on_hand <= low_stock_threshold;

-- -----------------------------------------------------------
-- INVENTORY TRANSACTIONS (audit trail)
-- -----------------------------------------------------------

CREATE TABLE inventory_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variant_id      UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    warehouse_id    UUID NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
    action          inventory_action NOT NULL,
    quantity        INT NOT NULL CHECK (quantity != 0),
    reference_type  VARCHAR(50),     -- 'order', 'purchase_order', 'return', 'adjustment'
    reference_id    UUID,            -- polymorphic FK
    note            TEXT,
    performed_by    UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invtxn_variant ON inventory_transactions (variant_id);
CREATE INDEX idx_invtxn_warehouse ON inventory_transactions (warehouse_id);
CREATE INDEX idx_invtxn_created ON inventory_transactions (created_at DESC);

-- ============================================================
-- COLLECTIONS (featured / seasonal / curated)
-- ============================================================

CREATE TABLE collections (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    slug            VARCHAR(230) NOT NULL UNIQUE,
    description     TEXT,
    banner_url      TEXT,
    banner_mobile_url TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    start_date      TIMESTAMPTZ,
    end_date        TIMESTAMPTZ,
    sort_order      INT NOT NULL DEFAULT 0,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_collections_slug ON collections (slug);
CREATE INDEX idx_collections_active ON collections (is_active, start_date, end_date);

CREATE TABLE product_collections (
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    collection_id   UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (product_id, collection_id)
);

-- ============================================================
-- PRODUCT SPECIFICATIONS (dynamic key-value)
-- ============================================================

CREATE TABLE product_specifications (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    group_name      VARCHAR(100) DEFAULT 'General',
    key             VARCHAR(150) NOT NULL,
    value           TEXT NOT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, group_name, key)
);

CREATE INDEX idx_prodspec_product ON product_specifications (product_id);

-- ============================================================
-- COUPONS & PROMOTIONS
-- ============================================================

CREATE TABLE coupons (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    description     TEXT,
    discount_type   discount_type NOT NULL,
    discount_value  DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
    min_order_amount DECIMAL(10,2) CHECK (min_order_amount IS NULL OR min_order_amount >= 0),
    max_discount_cap DECIMAL(10,2) CHECK (max_discount_cap IS NULL OR max_discount_cap >= 0),
    usage_limit     INT CHECK (usage_limit IS NULL OR usage_limit > 0),
    usage_limit_per_user INT CHECK (usage_limit_per_user IS NULL OR usage_limit_per_user > 0),
    times_used      INT NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    applies_to      VARCHAR(50) DEFAULT 'all',  -- 'all', 'brands', 'categories', 'products'
    applicable_ids  UUID[],                     -- brand / category / product IDs
    starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_coupons_code ON coupons (code);
CREATE INDEX idx_coupons_active ON coupons (is_active, starts_at, expires_at);

-- -----------------------------------------------------------
-- GIFT CARDS
-- -----------------------------------------------------------

CREATE TABLE gift_cards (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code            VARCHAR(50) NOT NULL UNIQUE,
    buyer_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    recipient_email VARCHAR(255),
    initial_balance DECIMAL(10,2) NOT NULL CHECK (initial_balance > 0),
    current_balance DECIMAL(10,2) NOT NULL CHECK (current_balance >= 0),
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_digital      BOOLEAN NOT NULL DEFAULT TRUE,
    message         TEXT,
    expires_at      TIMESTAMPTZ,
    redeemed_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_giftcards_code ON gift_cards (code);
CREATE INDEX idx_giftcards_balance ON gift_cards (current_balance, is_active);

-- ============================================================
-- LOYALTY & REWARDS
-- ============================================================

CREATE TABLE loyalty_tiers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    min_points      INT NOT NULL DEFAULT 0,
    multiplier      DECIMAL(4,2) NOT NULL DEFAULT 1.00,  -- points earning multiplier
    benefits        JSONB DEFAULT '[]',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE loyalty_accounts (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    tier_id         UUID REFERENCES loyalty_tiers(id) ON DELETE SET NULL,
    points_balance  INT NOT NULL DEFAULT 0 CHECK (points_balance >= 0),
    lifetime_points INT NOT NULL DEFAULT 0 CHECK (lifetime_points >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyalty_user ON loyalty_accounts (user_id);

CREATE TABLE loyalty_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id      UUID NOT NULL REFERENCES loyalty_accounts(id) ON DELETE CASCADE,
    points          INT NOT NULL CHECK (points != 0),
    balance_after   INT NOT NULL,
    reason          VARCHAR(100) NOT NULL,  -- 'purchase', 'purchase_bonus', 'signup', 'referral', 'redeem', 'expiry', 'adjustment'
    reference_type  VARCHAR(50),
    reference_id    UUID,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_loyaltxn_account ON loyalty_transactions (account_id);
CREATE INDEX idx_loyaltxn_created ON loyalty_transactions (created_at DESC);

-- ============================================================
-- SHOPPING CART
-- ============================================================

CREATE TABLE cart (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id      VARCHAR(255),                -- for guest users
    coupon_id       UUID REFERENCES coupons(id) ON DELETE SET NULL,
    gift_card_id    UUID REFERENCES gift_cards(id) ON DELETE SET NULL,
    notes           TEXT,
    subtotal        DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount_total  DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_total       DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_total  DECIMAL(10,2) NOT NULL DEFAULT 0,
    grand_total     DECIMAL(10,2) NOT NULL DEFAULT 0,
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    expires_at      TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id)  -- one active cart per logged-in user
);

CREATE INDEX idx_cart_user ON cart (user_id);
CREATE INDEX idx_cart_session ON cart (session_id) WHERE session_id IS NOT NULL;

CREATE TABLE cart_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id         UUID NOT NULL REFERENCES cart(id) ON DELETE CASCADE,
    variant_id      UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    quantity        INT NOT NULL CHECK (quantity > 0),
    unit_price      DECIMAL(10,2) NOT NULL,
    total_price     DECIMAL(10,2) NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (cart_id, variant_id)
);

CREATE INDEX idx_cartitem_cart ON cart_items (cart_id);

-- ============================================================
-- ORDERS
-- ============================================================

CREATE TABLE orders (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number      VARCHAR(50) NOT NULL UNIQUE,
    user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
    email             VARCHAR(255) NOT NULL,
    status            order_status NOT NULL DEFAULT 'pending',
    payment_status    payment_status NOT NULL DEFAULT 'pending',
    payment_method    payment_method,
    currency          CHAR(3) NOT NULL DEFAULT 'USD',
    subtotal          DECIMAL(10,2) NOT NULL,
    discount_total    DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_total         DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_total    DECIMAL(10,2) NOT NULL DEFAULT 0,
    grand_total       DECIMAL(10,2) NOT NULL,
    amount_paid       DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_due        DECIMAL(10,2) GENERATED ALWAYS AS (grand_total - amount_paid) STORED,
    coupon_id         UUID REFERENCES coupons(id) ON DELETE SET NULL,
    coupon_code       VARCHAR(50),
    discount_details  JSONB DEFAULT '{}',
    shipping_address_id UUID REFERENCES addresses(id) ON DELETE SET NULL,
    billing_address_id  UUID REFERENCES addresses(id) ON DELETE SET NULL,
    shipping_method   VARCHAR(100),
    shipping_carrier  VARCHAR(100),
    tracking_number   VARCHAR(255),
    delivery_estimate DATE,
    delivered_at      TIMESTAMPTZ,
    notes             TEXT,
    ip_address        INET,
    user_agent        TEXT,
    is_gift           BOOLEAN NOT NULL DEFAULT FALSE,
    gift_message      TEXT,
    source            VARCHAR(50) DEFAULT 'web',  -- 'web', 'mobile', 'admin', 'api'
    metadata          JSONB DEFAULT '{}',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_user ON orders (user_id);
CREATE INDEX idx_orders_number ON orders (order_number);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_payment ON orders (payment_status);
CREATE INDEX idx_orders_created ON orders (created_at DESC);
CREATE INDEX idx_orders_email ON orders (email);

-- -----------------------------------------------------------
-- ORDER ITEMS
-- -----------------------------------------------------------

CREATE TABLE order_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    variant_id      UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    product_name    VARCHAR(255) NOT NULL,
    variant_sku     VARCHAR(100) NOT NULL,
    size            VARCHAR(50),
    colour          VARCHAR(100),
    quantity        INT NOT NULL CHECK (quantity > 0),
    unit_price      DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate        DECIMAL(5,3) DEFAULT 0,
    total_price     DECIMAL(10,2) NOT NULL,
    product_image   TEXT,
    is_returned     BOOLEAN NOT NULL DEFAULT FALSE,
    returned_qty    INT DEFAULT 0 CHECK (returned_qty >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orderitems_order ON order_items (order_id);
CREATE INDEX idx_orderitems_product ON order_items (product_id);
CREATE INDEX idx_orderitems_variant ON order_items (variant_id);

-- -----------------------------------------------------------
-- ORDER STATUS HISTORY (audit trail)
-- -----------------------------------------------------------

CREATE TABLE order_status_history (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status     order_status,
    to_status       order_status NOT NULL,
    changed_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    note            TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ordhist_order ON order_status_history (order_id);
CREATE INDEX idx_ordhist_created ON order_status_history (created_at DESC);

-- -----------------------------------------------------------
-- PAYMENT TRANSACTIONS
-- -----------------------------------------------------------

CREATE TABLE payment_transactions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    transaction_id  VARCHAR(255),          -- gateway transaction ID
    payment_method  payment_method NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    currency        CHAR(3) NOT NULL DEFAULT 'USD',
    status          VARCHAR(50) NOT NULL,  -- 'success', 'failed', 'pending', 'refunded'
    gateway_response JSONB,
    is_refund       BOOLEAN NOT NULL DEFAULT FALSE,
    refund_of       UUID REFERENCES payment_transactions(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_paytxn_order ON payment_transactions (order_id);
CREATE INDEX idx_paytxn_txnid ON payment_transactions (transaction_id);

-- ============================================================
-- REVIEWS & RATINGS
-- ============================================================

CREATE TABLE reviews (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_item_id   UUID REFERENCES order_items(id) ON DELETE SET NULL,
    title           VARCHAR(255),
    body            TEXT,
    rating          INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    is_verified_purchase BOOLEAN NOT NULL DEFAULT FALSE,
    is_featured     BOOLEAN NOT NULL DEFAULT FALSE,
    is_approved     BOOLEAN NOT NULL DEFAULT FALSE,
    helpful_count   INT NOT NULL DEFAULT 0,
    size_rating     INT CHECK (size_rating IS NULL OR size_rating BETWEEN 1 AND 5),  -- 1=small, 5=large
    comfort_rating  INT CHECK (comfort_rating IS NULL OR comfort_rating BETWEEN 1 AND 5),
    quality_rating  INT CHECK (quality_rating IS NULL OR quality_rating BETWEEN 1 AND 5),
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (product_id, user_id, order_item_id)
);

CREATE INDEX idx_reviews_product ON reviews (product_id, is_approved);
CREATE INDEX idx_reviews_user ON reviews (user_id);
CREATE INDEX idx_reviews_rating ON reviews (rating DESC);
CREATE INDEX idx_reviews_created ON reviews (created_at DESC);

CREATE TABLE review_images (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    review_id       UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    alt_text        VARCHAR(255),
    sort_order      INT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revimg_review ON review_images (review_id);

-- ============================================================
-- WISHLISTS
-- ============================================================

CREATE TABLE wishlists (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL DEFAULT 'My Wishlist',
    is_public       BOOLEAN NOT NULL DEFAULT FALSE,
    share_token     UUID DEFAULT uuid_generate_v4(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wishlist_user ON wishlists (user_id);
CREATE UNIQUE INDEX idx_wishlist_share ON wishlists (share_token);

CREATE TABLE wishlist_items (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wishlist_id     UUID NOT NULL REFERENCES wishlists(id) ON DELETE CASCADE,
    variant_id      UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
    note            TEXT,
    priority        INT DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (wishlist_id, variant_id)
);

CREATE INDEX idx_wishitem_wishlist ON wishlist_items (wishlist_id);

-- ============================================================
-- COMPARE LISTS
-- ============================================================

CREATE TABLE compare_lists (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id      VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE compare_list_items (
    compare_list_id UUID NOT NULL REFERENCES compare_lists(id) ON DELETE CASCADE,
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (compare_list_id, product_id)
);

-- ============================================================
-- RECENTLY VIEWED
-- ============================================================

CREATE TABLE recently_viewed (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id      VARCHAR(255),
    product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    viewed_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_recview_user ON recently_viewed (user_id, viewed_at DESC);
CREATE INDEX idx_recview_session ON recently_viewed (session_id, viewed_at DESC);
CREATE INDEX idx_recview_product ON recently_viewed (product_id);

-- ============================================================
-- NEWSLETTER / SUBSCRIPTIONS
-- ============================================================

CREATE TABLE newsletter_subscribers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    subscribed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    unsubscribed_at TIMESTAMPTZ,
    source          VARCHAR(50) DEFAULT 'footer',
    metadata        JSONB DEFAULT '{}'
);

CREATE INDEX idx_newsletter_email ON newsletter_subscribers (email);

-- ============================================================
-- CMS: BANNERS & CONTENT PAGES
-- ============================================================

CREATE TABLE banners (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(200),
    subtitle        VARCHAR(300),
    cta_text        VARCHAR(100),
    cta_url         VARCHAR(500),
    desktop_image_url TEXT NOT NULL,
    mobile_image_url  TEXT,
    bg_color        VARCHAR(7),
    text_color      VARCHAR(7),
    placement       VARCHAR(50) NOT NULL DEFAULT 'hero',  -- 'hero', 'promo_bar', 'sidebar', 'footer'
    is_active       BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order      INT NOT NULL DEFAULT 0,
    starts_at       TIMESTAMPTZ,
    ends_at         TIMESTAMPTZ,
    metadata        JSONB DEFAULT '{}',
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_banners_placement ON banners (placement, is_active, sort_order);

CREATE TABLE cms_pages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title           VARCHAR(255) NOT NULL,
    slug            VARCHAR(280) NOT NULL UNIQUE,
    content         TEXT NOT NULL,
    meta_title      VARCHAR(255),
    meta_description TEXT,
    is_published    BOOLEAN NOT NULL DEFAULT FALSE,
    published_at    TIMESTAMPTZ,
    created_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cms_slug ON cms_pages (slug);

-- ============================================================
-- ACCESS CONTROL: ROLES & PERMISSIONS
-- ============================================================

CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    slug            VARCHAR(120) NOT NULL UNIQUE,
    description     TEXT,
    is_system       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(150) NOT NULL UNIQUE,
    slug            VARCHAR(180) NOT NULL UNIQUE,
    group_name      VARCHAR(100),
    description     TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE role_permissions (
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id   UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id         UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_by      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- ============================================================
-- ACTIVITY / AUDIT LOG
-- ============================================================

CREATE TABLE activity_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    ip_address      INET,
    user_agent      TEXT,
    action          VARCHAR(100) NOT NULL,      -- 'product.viewed', 'order.placed', 'user.login', etc.
    resource_type   VARCHAR(50),                -- 'product', 'order', 'user', 'coupon'
    resource_id     UUID,
    details         JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_actlog_user ON activity_logs (user_id);
CREATE INDEX idx_actlog_action ON activity_logs (action);
CREATE INDEX idx_actlog_resource ON activity_logs (resource_type, resource_id);
CREATE INDEX idx_actlog_created ON activity_logs (created_at DESC);

-- ============================================================
-- ANALYTICS / SNAPSHOT TABLES (optional)
-- ============================================================

CREATE TABLE daily_sales_snapshots (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    snapshot_date   DATE NOT NULL UNIQUE,
    total_revenue   DECIMAL(14,2) NOT NULL DEFAULT 0,
    total_orders    INT NOT NULL DEFAULT 0,
    total_products_sold INT NOT NULL DEFAULT 0,
    avg_order_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    new_users       INT NOT NULL DEFAULT 0,
    new_subscribers INT NOT NULL DEFAULT 0,
    top_product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
    top_brand_id    UUID REFERENCES brands(id) ON DELETE SET NULL,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TRIGGER: auto-update updated_at columns
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables that have an updated_at column
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON addresses
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_brands_updated_at BEFORE UPDATE ON brands
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_product_variants_updated_at BEFORE UPDATE ON product_variants
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_collections_updated_at BEFORE UPDATE ON collections
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_coupons_updated_at BEFORE UPDATE ON coupons
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_loyalty_accounts_updated_at BEFORE UPDATE ON loyalty_accounts
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_cart_updated_at BEFORE UPDATE ON cart
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_cart_items_updated_at BEFORE UPDATE ON cart_items
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_wishlists_updated_at BEFORE UPDATE ON wishlists
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_banners_updated_at BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();
CREATE TRIGGER trg_cms_pages_updated_at BEFORE UPDATE ON cms_pages
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

-- ============================================================
-- TRIGGER: update product review aggregates
-- ============================================================

CREATE OR REPLACE FUNCTION update_product_review_aggregates()
RETURNS TRIGGER AS $$
DECLARE
    target_product_id UUID;
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        target_product_id := NEW.product_id;
    ELSIF TG_OP = 'DELETE' THEN
        target_product_id := OLD.product_id;
    END IF;

    UPDATE products
    SET
        rating_avg   = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE product_id = target_product_id AND is_approved = TRUE),
        review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = target_product_id AND is_approved = TRUE)
    WHERE id = target_product_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_review_aggregates
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_product_review_aggregates();

-- ============================================================
-- TRIGGER: update inventory on order placement / cancellation
-- ============================================================

CREATE OR REPLACE FUNCTION update_inventory_on_order_change()
RETURNS TRIGGER AS $$
BEGIN
    -- When order is confirmed, reserve stock
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status = 'pending') THEN
        UPDATE inventory i
        SET quantity_reserved = quantity_reserved + oi.quantity
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND i.variant_id = oi.variant_id;

    -- When order is cancelled/returned, release stock
    ELSIF NEW.status IN ('cancelled', 'returned') AND OLD.status NOT IN ('cancelled', 'returned') THEN
        UPDATE inventory i
        SET quantity_reserved = GREATEST(quantity_reserved - oi.quantity, 0),
            quantity_on_hand = CASE WHEN NEW.status = 'returned' THEN quantity_on_hand + oi.quantity ELSE quantity_on_hand END
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND i.variant_id = oi.variant_id;

    -- When order is delivered, reduce on-hand and reserved
    ELSIF NEW.status = 'delivered' AND OLD.status NOT IN ('delivered') THEN
        UPDATE inventory i
        SET quantity_on_hand = GREATEST(quantity_on_hand - oi.quantity, 0),
            quantity_reserved = GREATEST(quantity_reserved - oi.quantity, 0)
        FROM order_items oi
        WHERE oi.order_id = NEW.id AND i.variant_id = oi.variant_id;

        -- Log inventory transactions
        INSERT INTO inventory_transactions (variant_id, warehouse_id, action, quantity, reference_type, reference_id)
        SELECT oi.variant_id, i.warehouse_id, 'sold', -oi.quantity, 'order', NEW.id
        FROM order_items oi
        JOIN inventory i ON i.variant_id = oi.variant_id
        WHERE oi.order_id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_order_inventory
    AFTER UPDATE OF status ON orders
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_inventory_on_order_change();

-- ============================================================
-- INDEXES FOR QUERY PERFORMANCE (covering / partial)
-- ============================================================

-- Covering index for product listing queries
CREATE INDEX idx_products_listing ON products (product_status, is_featured, created_at DESC)
    INCLUDE (name, slug, base_price, sale_price, rating_avg, review_count);

-- Partial index for active variants
CREATE INDEX idx_variants_active_listing ON product_variants (product_id, is_active)
    INCLUDE (sku, size, colour, base_price, sale_price)
    WHERE is_active = TRUE;

-- Partial index for available inventory
CREATE INDEX idx_inventory_available ON inventory (variant_id, warehouse_id)
    WHERE quantity_on_hand - quantity_reserved > 0;

-- Index for order lookup by date range
CREATE INDEX idx_orders_date_range ON orders (created_at)
    WHERE status NOT IN ('cancelled', 'returned');

-- ============================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================

COMMENT ON TABLE products IS 'Core product catalogue. Each product belongs to one brand and one category. Pricing supports base, sale, and cost for margin analytics.';
COMMENT ON TABLE product_variants IS 'Every size + colour combination is a distinct variant with its own SKU and pricing overrides.';
COMMENT ON TABLE inventory IS 'Stock tracking per variant per warehouse. quantity_available is a generated column.';
COMMENT ON TABLE orders IS 'Order header. Supports guest checkout via the email field. Includes delivery estimates, tracking, and gift options.';
COMMENT ON TABLE reviews IS 'Customer reviews with verified purchase flag and dimensional ratings (size/comfort/quality).';
COMMENT ON TABLE loyalty_accounts IS 'One account per user. Tracks current and lifetime points for tier progression.';
COMMENT ON TABLE activity_logs IS 'Central audit log for all significant user and admin actions across the platform.';

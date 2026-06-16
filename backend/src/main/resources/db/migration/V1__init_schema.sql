-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- USERS & AUTH
-- ============================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    email VARCHAR(150) UNIQUE,
    mobile VARCHAR(15) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'CUSTOMER',
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    is_blocked BOOLEAN DEFAULT false,
    loyalty_points INTEGER DEFAULT 0,
    loyalty_tier VARCHAR(20) DEFAULT 'SILVER',
    profile_image_url TEXT,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES users(id),
    failed_login_attempts INTEGER DEFAULT 0,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_users_mobile ON users(mobile);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_referral ON users(referral_code);

CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    order_updates_email BOOLEAN DEFAULT true,
    order_updates_sms BOOLEAN DEFAULT true,
    order_updates_whatsapp BOOLEAN DEFAULT true,
    sale_alerts_email BOOLEAN DEFAULT true,
    sale_alerts_sms BOOLEAN DEFAULT false,
    new_arrivals_email BOOLEAN DEFAULT true,
    price_drop_email BOOLEAN DEFAULT true,
    back_in_stock_email BOOLEAN DEFAULT true
);

-- ============================================================
-- ADDRESSES
-- ============================================================
CREATE TABLE addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(20) DEFAULT 'Home',
    full_name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    address_line TEXT NOT NULL,
    landmark VARCHAR(150),
    city VARCHAR(80) NOT NULL,
    state VARCHAR(80) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SELLERS
-- ============================================================
CREATE TABLE sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id),
    business_name VARCHAR(150) NOT NULL,
    business_type VARCHAR(50),
    gst_number VARCHAR(20),
    pan_number VARCHAR(15),
    bank_account_number VARCHAR(30),
    bank_ifsc VARCHAR(15),
    bank_name VARCHAR(100),
    account_holder_name VARCHAR(100),
    razorpay_contact_id VARCHAR(100),
    razorpay_fund_account_id VARCHAR(100),
    commission_rate DECIMAL(5,2) DEFAULT 10.00,
    status VARCHAR(20) DEFAULT 'PENDING',
    kyc_verified BOOLEAN DEFAULT false,
    total_sales DECIMAL(12,2) DEFAULT 0,
    pending_payout DECIMAL(12,2) DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    fulfillment_rate DECIMAL(5,2) DEFAULT 100,
    return_rate DECIMAL(5,2) DEFAULT 0,
    response_time_hours INTEGER DEFAULT 24,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE seller_payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id),
    amount DECIMAL(10,2) NOT NULL,
    period_from DATE,
    period_to DATE,
    razorpay_payout_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING',
    processed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    image_url TEXT,
    icon_name VARCHAR(60),
    gst_percent DECIMAL(5,2) DEFAULT 5.00,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    meta_title VARCHAR(200),
    meta_description TEXT
);

-- ============================================================
-- SIZE GUIDES
-- ============================================================
CREATE TABLE size_guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(100) NOT NULL,
    guide_type VARCHAR(30) NOT NULL,
    content JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id),
    category_id UUID REFERENCES categories(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    description TEXT,
    fabric VARCHAR(100),
    occasion VARCHAR(150),
    care_instructions TEXT,
    country_of_origin VARCHAR(60) DEFAULT 'India',
    hsn_code VARCHAR(20),
    base_price DECIMAL(10,2) NOT NULL,
    mrp DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    gst_percent DECIMAL(5,2) DEFAULT 5.00,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    is_featured BOOLEAN DEFAULT false,
    is_cod_available BOOLEAN DEFAULT true,
    is_returnable BOOLEAN DEFAULT true,
    return_window_days INTEGER DEFAULT 7,
    total_sold INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    question_count INTEGER DEFAULT 0,
    search_vector TSVECTOR,
    meta_title VARCHAR(200),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_search ON products USING GIN(search_vector);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE INDEX idx_products_created ON products(created_at DESC);

CREATE OR REPLACE FUNCTION update_product_search() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name,'')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.fabric,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.occasion,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description,'')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER product_search_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_product_search();

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    size VARCHAR(30),
    color VARCHAR(60),
    color_hex VARCHAR(10),
    material VARCHAR(80),
    stock_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    additional_price DECIMAL(10,2) DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    weight_grams INTEGER,
    is_active BOOLEAN DEFAULT true
);
CREATE INDEX idx_variants_product ON product_variants(product_id);

CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR(200),
    is_primary BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE product_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    question TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE product_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES product_questions(id) ON DELETE CASCADE,
    answered_by UUID REFERENCES users(id),
    answer TEXT NOT NULL,
    is_seller_answer BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- COMPLETE THE LOOK
-- ============================================================
CREATE TABLE complete_the_look (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    primary_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    suggested_product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(30),
    sort_order INTEGER DEFAULT 0,
    UNIQUE(primary_product_id, suggested_product_id)
);

-- ============================================================
-- STOCK RESERVATIONS (holds stock for 10 min on cart add)
-- ============================================================
CREATE TABLE stock_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES product_variants(id),
    user_id UUID REFERENCES users(id),
    quantity INTEGER NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    order_id UUID,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_reservations_expires ON stock_reservations(expires_at);

-- ============================================================
-- CART
-- ============================================================
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cart_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE abandoned_carts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    cart_snapshot JSONB,
    reminder_1h_sent BOOLEAN DEFAULT false,
    reminder_24h_sent BOOLEAN DEFAULT false,
    recovered BOOLEAN DEFAULT false,
    abandoned_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    address_id UUID REFERENCES addresses(id),
    address_snapshot JSONB,
    status VARCHAR(30) DEFAULT 'PLACED',
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    gst_amount DECIMAL(10,2) NOT NULL,
    delivery_charge DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    coupon_code VARCHAR(30),
    gift_card_code VARCHAR(30),
    gift_card_discount DECIMAL(10,2) DEFAULT 0,
    payment_method VARCHAR(30),
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    is_cod BOOLEAN DEFAULT false,
    cod_otp VARCHAR(10),
    cod_otp_verified BOOLEAN DEFAULT false,
    loyalty_points_used INTEGER DEFAULT 0,
    loyalty_points_earned INTEGER DEFAULT 0,
    notes TEXT,
    placed_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_placed ON orders(placed_at DESC);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    seller_id UUID REFERENCES sellers(id),
    product_name VARCHAR(255),
    product_image TEXT,
    variant_info VARCHAR(100),
    hsn_code VARCHAR(20),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    gst_percent DECIMAL(5,2),
    gst_amount DECIMAL(10,2),
    total_price DECIMAL(10,2) NOT NULL,
    seller_amount DECIMAL(10,2),
    commission_amount DECIMAL(10,2),
    status VARCHAR(30) DEFAULT 'PLACED',
    is_reviewed BOOLEAN DEFAULT false,
    return_window_until DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- PAYMENTS & REFUNDS
-- ============================================================
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    razorpay_order_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_signature VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(5) DEFAULT 'INR',
    status VARCHAR(20) DEFAULT 'PENDING',
    payment_method VARCHAR(30),
    bank VARCHAR(50),
    card_last4 VARCHAR(4),
    error_code VARCHAR(50),
    error_description TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    order_item_id UUID REFERENCES order_items(id),
    payment_id UUID REFERENCES payments(id),
    razorpay_refund_id VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    method VARCHAR(20) DEFAULT 'ORIGINAL',
    gift_card_code VARCHAR(30),
    status VARCHAR(20) DEFAULT 'PENDING',
    reason TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SHIPMENTS & RETURNS
-- ============================================================
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    order_item_id UUID REFERENCES order_items(id),
    shiprocket_order_id VARCHAR(100),
    shiprocket_shipment_id VARCHAR(100),
    awb_number VARCHAR(100),
    courier_name VARCHAR(100),
    courier_id INTEGER,
    tracking_url TEXT,
    label_url TEXT,
    status VARCHAR(50) DEFAULT 'PENDING',
    estimated_delivery DATE,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE return_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    order_item_id UUID REFERENCES order_items(id),
    user_id UUID REFERENCES users(id),
    return_type VARCHAR(20) DEFAULT 'RETURN',
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    images JSONB,
    exchange_size VARCHAR(30),
    exchange_color VARCHAR(50),
    status VARCHAR(30) DEFAULT 'REQUESTED',
    reverse_shiprocket_order_id VARCHAR(100),
    reverse_awb VARCHAR(100),
    pickup_date DATE,
    refund_id UUID REFERENCES refunds(id),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    user_id UUID REFERENCES users(id),
    order_item_id UUID REFERENCES order_items(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(150),
    body TEXT,
    images JSONB,
    is_verified_purchase BOOLEAN DEFAULT false,
    helpful_count INTEGER DEFAULT 0,
    is_approved BOOLEAN DEFAULT true,
    seller_reply TEXT,
    seller_replied_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- ============================================================
-- WISHLIST & STOCK ALERTS
-- ============================================================
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE wishlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    collection_name VARCHAR(80) DEFAULT 'All',
    price_at_add DECIMAL(10,2),
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(wishlist_id, product_id)
);

CREATE TABLE stock_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    product_id UUID REFERENCES products(id),
    variant_id UUID REFERENCES product_variants(id),
    notified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, variant_id)
);

-- ============================================================
-- COUPONS & GIFT CARDS
-- ============================================================
CREATE TABLE coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) UNIQUE NOT NULL,
    description VARCHAR(200),
    type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2),
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    per_user_limit INTEGER DEFAULT 1,
    applicable_category_id UUID REFERENCES categories(id),
    applicable_seller_id UUID REFERENCES sellers(id),
    is_first_order_only BOOLEAN DEFAULT false,
    is_referral_coupon BOOLEAN DEFAULT false,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    coupon_id UUID REFERENCES coupons(id),
    user_id UUID REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    discount_given DECIMAL(10,2),
    used_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE gift_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    initial_amount DECIMAL(10,2) NOT NULL,
    remaining_amount DECIMAL(10,2) NOT NULL,
    issued_to_user_id UUID REFERENCES users(id),
    issued_by_order_id UUID REFERENCES orders(id),
    is_active BOOLEAN DEFAULT true,
    expires_at DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE gift_card_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gift_card_id UUID REFERENCES gift_cards(id),
    order_id UUID REFERENCES orders(id),
    amount DECIMAL(10,2) NOT NULL,
    type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- REFERRALS
-- ============================================================
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID REFERENCES users(id),
    referee_id UUID REFERENCES users(id),
    coupon_code VARCHAR(30),
    status VARCHAR(20) DEFAULT 'PENDING',
    referrer_credit DECIMAL(10,2) DEFAULT 100,
    referee_discount DECIMAL(10,2) DEFAULT 100,
    credited_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- LOYALTY
-- ============================================================
CREATE TABLE loyalty_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    points INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,
    description VARCHAR(200),
    expires_at DATE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- SUPPORT TICKETS
-- ============================================================
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    category VARCHAR(50),
    subject VARCHAR(200) NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN',
    priority VARCHAR(20) DEFAULT 'NORMAL',
    assigned_to VARCHAR(100),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE support_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id),
    is_staff BOOLEAN DEFAULT false,
    message TEXT NOT NULL,
    attachments JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- BANNERS & MARKETING
-- ============================================================
CREATE TABLE banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150),
    subtitle TEXT,
    image_url TEXT NOT NULL,
    mobile_image_url TEXT,
    link_url TEXT,
    position VARCHAR(30) DEFAULT 'HOME_HERO',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- LEGAL PAGES (content managed by admin)
-- ============================================================
CREATE TABLE legal_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(60) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);

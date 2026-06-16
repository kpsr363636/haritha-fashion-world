-- ============================================================
-- V5: Demo seed data — users, seller, products, coupons, banners
-- Demo password for all accounts: password
-- BCrypt hash below is for literal string "password"
-- ============================================================

INSERT INTO users (id, name, email, mobile, password_hash, role, is_verified, referral_code, loyalty_points, loyalty_tier)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'Admin User', 'admin@harithafashion.com', '9000000001',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', true, 'HFADM1', 0, 'SILVER'),
  ('22222222-2222-4222-8222-222222222222', 'Priya Boutique', 'seller@harithafashion.com', '9000000002',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'SELLER', true, 'HFSEL1', 0, 'SILVER'),
  ('33333333-3333-4333-8333-333333333333', 'Demo Customer', 'customer@harithafashion.com', '9000000003',
   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'CUSTOMER', true, 'HFCUS1', 500, 'SILVER')
ON CONFLICT (id) DO NOTHING;

INSERT INTO sellers (id, user_id, business_name, business_type, status, kyc_verified, commission_rate, avg_rating, fulfillment_rate)
VALUES ('44444444-4444-4444-8444-444444444444', '22222222-2222-4222-8222-222222222222',
        'Priya Ethnic Collections', 'Individual', 'APPROVED', true, 10.00, 4.50, 98.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO carts (id, user_id) VALUES ('55555555-5555-4555-8555-555555555555', '33333333-3333-4333-8333-333333333333') ON CONFLICT DO NOTHING;
INSERT INTO wishlists (id, user_id) VALUES ('66666666-6666-4666-8666-666666666666', '33333333-3333-4333-8333-333333333333') ON CONFLICT DO NOTHING;
INSERT INTO notification_preferences (user_id) VALUES ('33333333-3333-4333-8333-333333333333') ON CONFLICT DO NOTHING;

INSERT INTO addresses (id, user_id, label, full_name, mobile, address_line, city, state, pincode, is_default)
VALUES ('77777777-7777-4777-8777-777777777777', '33333333-3333-4333-8333-333333333333',
        'Home', 'Demo Customer', '9000000003', '12 MG Road, Banjara Hills', 'Hyderabad', 'Telangana', '500034', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO coupons (id, code, description, type, discount_value, min_order_amount, max_discount_amount, per_user_limit, is_first_order_only, is_active, valid_until)
VALUES ('88888888-8888-4888-8888-888888888888', 'WELCOME10', '10% off first order', 'PERCENTAGE', 10.00, 499.00, 500.00, 1, true, true, NOW() + INTERVAL '1 year')
ON CONFLICT (id) DO NOTHING;

INSERT INTO gift_cards (id, code, initial_amount, remaining_amount, is_active, expires_at)
VALUES ('99999999-9999-4999-8999-999999999999', 'HFDEMO500', 500.00, 500.00, true, CURRENT_DATE + INTERVAL '1 year')
ON CONFLICT (id) DO NOTHING;

INSERT INTO banners (id, title, subtitle, image_url, link_url, position, is_active, sort_order)
VALUES
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'Summer Saree Collection', 'Up to 40% off on silk sarees',
   '/images/banners/banner-saree-collection.jpg', '/products?category=sarees-ethnic-wear', 'HOME_HERO', true, 1),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Jewellery Fest', 'Fine jewellery starting ₹999',
   '/images/banners/banner-jewellery-fest.jpg', '/products?category=fine-jewellery', 'HOME_HERO', true, 2)
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000001-0001-4000-8000-000000000001'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Banarasi Silk Saree — Royal Maroon', 'banarasi-silk-saree-royal-maroon',
       'Exquisite Banarasi silk saree with zari work. Perfect for weddings and festive occasions.',
       'Silk', 'Wedding', 2499.00, 4999.00, 50.00, 5.00, 'ACTIVE', true, true, 120, 4.70, 45
FROM categories c WHERE c.slug = 'sarees-ethnic-wear'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000002-0002-4000-8000-000000000002'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Floral Cotton Kurti Set', 'floral-cotton-kurti-set',
       'Breathable cotton kurti with palazzo. Daily wear comfort with ethnic charm.',
       'Cotton', 'Casual', 799.00, 1299.00, 38.00, 5.00, 'ACTIVE', true, true, 85, 4.50, 32
FROM categories c WHERE c.slug = 'sarees-ethnic-wear'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000003-0003-4000-8000-000000000003'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Indigo Block Print Dress', 'indigo-block-print-dress',
       'Western midi dress with hand block print. Sustainable fashion statement.',
       'Cotton', 'Party', 1299.00, 1999.00, 35.00, 12.00, 'ACTIVE', true, true, 60, 4.60, 28
FROM categories c WHERE c.slug = 'western-clothing'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000004-0004-4000-8000-000000000004'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Silver Oxidised Jhumka Earrings', 'silver-oxidised-jhumka-earrings',
       'Traditional oxidised silver jhumkas with pearl drops. Lightweight and elegant.',
       'Silver', 'Festive', 599.00, 999.00, 40.00, 3.00, 'ACTIVE', true, true, 200, 4.80, 90
FROM categories c WHERE c.slug = 'fine-jewellery'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000005-0005-4000-8000-000000000005'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Vitamin C Glow Serum', 'vitamin-c-glow-serum',
       'Brightening face serum with 20% Vitamin C. Dermatologically tested for Indian skin.',
       'Serum', 'Daily', 449.00, 699.00, 36.00, 18.00, 'ACTIVE', false, true, 150, 4.40, 55
FROM categories c WHERE c.slug = 'beauty-skincare'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000006-0006-4000-8000-000000000006'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Tan Leather Tote Bag', 'tan-leather-tote-bag',
       'Spacious tote bag with inner compartments. Perfect for work and travel.',
       'Leather', 'Work', 1899.00, 2999.00, 37.00, 18.00, 'ACTIVE', true, true, 45, 4.55, 20
FROM categories c WHERE c.slug = 'bags-handbags'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000007-0007-4000-8000-000000000007'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Embroidered Mojari Flats', 'embroidered-mojari-flats',
       'Handcrafted mojari with mirror work. Comfortable cushioned sole.',
       'Fabric', 'Festive', 699.00, 1199.00, 42.00, 5.00, 'ACTIVE', false, true, 75, 4.30, 18
FROM categories c WHERE c.slug = 'footwear'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000008-0008-4000-8000-000000000008'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Pearl Hair Pin Set', 'pearl-hair-pin-set',
       'Set of 6 pearl hair pins for buns and braids. Gold-plated finish.',
       'Metal', 'Wedding', 299.00, 499.00, 40.00, 12.00, 'ACTIVE', false, true, 110, 4.65, 40
FROM categories c WHERE c.slug = 'hair-accessories'
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_variants (id, product_id, size, color, color_hex, stock_quantity, sku, is_active) VALUES
  ('f0010001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000001', 'Free Size', 'Maroon', '#800020', 25, 'HF-SAR-001-MRN', true),
  ('f0010002-0001-4000-8000-000000000001', 'f0000002-0002-4000-8000-000000000002', 'M', 'Pink', '#FFC0CB', 30, 'HF-KUR-002-PNK', true),
  ('f0010002-0002-4000-8000-000000000002', 'f0000002-0002-4000-8000-000000000002', 'L', 'Pink', '#FFC0CB', 20, 'HF-KUR-002-PNK-L', true),
  ('f0010003-0001-4000-8000-000000000001', 'f0000003-0003-4000-8000-000000000003', 'S', 'Indigo', '#3F51B5', 15, 'HF-WES-003-IND-S', true),
  ('f0010003-0002-4000-8000-000000000002', 'f0000003-0003-4000-8000-000000000003', 'M', 'Indigo', '#3F51B5', 18, 'HF-WES-003-IND-M', true),
  ('f0010004-0001-4000-8000-000000000001', 'f0000004-0004-4000-8000-000000000004', 'One Size', 'Silver', '#C0C0C0', 50, 'HF-JWL-004-SLV', true),
  ('f0010005-0001-4000-8000-000000000001', 'f0000005-0005-4000-8000-000000000005', '30ml', 'Clear', '#FFFFFF', 40, 'HF-BTY-005-30', true),
  ('f0010006-0001-4000-8000-000000000001', 'f0000006-0006-4000-8000-000000000006', 'One Size', 'Tan', '#D2B48C', 12, 'HF-BAG-006-TAN', true),
  ('f0010007-0001-4000-8000-000000000001', 'f0000007-0007-4000-8000-000000000007', '6', 'Gold', '#FFD700', 22, 'HF-FTW-007-6', true),
  ('f0010007-0002-4000-8000-000000000002', 'f0000007-0007-4000-8000-000000000007', '7', 'Gold', '#FFD700', 18, 'HF-FTW-007-7', true),
  ('f0010008-0001-4000-8000-000000000001', 'f0000008-0008-4000-8000-000000000008', 'One Size', 'Pearl White', '#FDEEF4', 35, 'HF-HAR-008-PRL', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, sort_order) VALUES
  ('f0020001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000001', '/images/products/banarasi-silk-saree.jpg', 'Banarasi Silk Saree Maroon', true, 0),
  ('f0020002-0001-4000-8000-000000000001', 'f0000002-0002-4000-8000-000000000002', '/images/products/floral-cotton-kurti.jpg', 'Floral Cotton Kurti', true, 0),
  ('f0020003-0001-4000-8000-000000000001', 'f0000003-0003-4000-8000-000000000003', '/images/products/indigo-block-print-dress.jpg', 'Indigo Block Print Dress', true, 0),
  ('f0020004-0001-4000-8000-000000000001', 'f0000004-0004-4000-8000-000000000004', '/images/products/silver-jhumka-earrings.jpg', 'Silver Jhumka Earrings', true, 0),
  ('f0020005-0001-4000-8000-000000000001', 'f0000005-0005-4000-8000-000000000005', '/images/products/vitamin-c-serum.jpg', 'Vitamin C Serum', true, 0),
  ('f0020006-0001-4000-8000-000000000001', 'f0000006-0006-4000-8000-000000000006', '/images/products/tan-leather-tote.jpg', 'Tan Leather Tote', true, 0),
  ('f0020007-0001-4000-8000-000000000001', 'f0000007-0007-4000-8000-000000000007', '/images/products/embroidered-mojari.jpg', 'Embroidered Mojari', true, 0),
  ('f0020008-0001-4000-8000-000000000001', 'f0000008-0008-4000-8000-000000000008', '/images/products/pearl-hair-pins.jpg', 'Pearl Hair Pin Set', true, 0)
ON CONFLICT (id) DO NOTHING;

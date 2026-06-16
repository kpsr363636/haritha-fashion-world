-- ============================================================
-- V7: Extended demo data — reviews, Q&A, orders, wishlist, cart
-- Safe to re-run: uses fixed UUIDs + ON CONFLICT DO NOTHING
-- ============================================================

-- Extra products
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000009-0009-4000-8000-000000000009'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Kanjivaram Silk Saree — Temple Gold', 'kanjivaram-silk-saree-temple-gold',
       'Authentic Kanjivaram with temple border zari. Heirloom quality for weddings.',
       'Silk', 'Wedding', 3499.00, 6999.00, 50.00, 5.00, 'ACTIVE', true, true, 95, 4.85, 38
FROM categories c WHERE c.slug = 'sarees-ethnic-wear'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000010-0010-4000-8000-000000000010'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Anarkali Kurta — Emerald Green', 'anarkali-kurta-emerald-green',
       'Floor-length Anarkali with gold embroidery. Festive elegance redefined.',
       'Georgette', 'Festive', 1599.00, 2499.00, 36.00, 5.00, 'ACTIVE', true, true, 70, 4.55, 25
FROM categories c WHERE c.slug = 'sarees-ethnic-wear'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000011-0011-4000-8000-000000000011'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Gold Plated Necklace Set', 'gold-plated-necklace-set',
       'Traditional necklace with matching earrings. Anti-tarnish coating.',
       'Gold Plated', 'Wedding', 1299.00, 2199.00, 41.00, 3.00, 'ACTIVE', true, true, 140, 4.70, 52
FROM categories c WHERE c.slug = 'fine-jewellery'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000012-0012-4000-8000-000000000012'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Chiffon Dupatta — Rose Pink', 'chiffon-dupatta-rose-pink',
       'Lightweight chiffon dupatta with tassel border. Pairs with any kurta.',
       'Chiffon', 'Casual', 399.00, 699.00, 43.00, 5.00, 'ACTIVE', false, true, 88, 4.40, 19
FROM categories c WHERE c.slug = 'scarves-dupattas'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000013-0013-4000-8000-000000000013'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Hydrating Face Moisturizer', 'hydrating-face-moisturizer',
       'SPF 30 daily moisturizer with hyaluronic acid. Non-greasy formula.',
       'Cream', 'Daily', 549.00, 849.00, 35.00, 18.00, 'ACTIVE', false, true, 95, 4.35, 30
FROM categories c WHERE c.slug = 'beauty-skincare'
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000014-0014-4000-8000-000000000014'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
       'Block Heel Sandals — Nude', 'block-heel-sandals-nude',
       'Comfortable 2-inch block heels. All-day wear for office and parties.',
       'PU Leather', 'Work', 899.00, 1499.00, 40.00, 5.00, 'ACTIVE', true, true, 55, 4.50, 22
FROM categories c WHERE c.slug = 'footwear'
ON CONFLICT (id) DO NOTHING;

-- Variants for new products
INSERT INTO product_variants (id, product_id, size, color, color_hex, stock_quantity, sku, is_active) VALUES
  ('f0010009-0001-4000-8000-000000000001', 'f0000009-0009-4000-8000-000000000009', 'Free Size', 'Gold', '#FFD700', 20, 'HF-SAR-009-GLD', true),
  ('f0010010-0001-4000-8000-000000000001', 'f0000010-0010-4000-8000-000000000010', 'M', 'Emerald', '#50C878', 25, 'HF-KUR-010-EMR-M', true),
  ('f0010010-0002-4000-8000-000000000002', 'f0000010-0010-4000-8000-000000000010', 'L', 'Emerald', '#50C878', 18, 'HF-KUR-010-EMR-L', true),
  ('f0010011-0001-4000-8000-000000000001', 'f0000011-0011-4000-8000-000000000011', 'One Size', 'Gold', '#FFD700', 40, 'HF-JWL-011-GLD', true),
  ('f0010012-0001-4000-8000-000000000001', 'f0000012-0012-4000-8000-000000000012', 'Free Size', 'Rose Pink', '#FF69B4', 35, 'HF-SCF-012-RS', true),
  ('f0010013-0001-4000-8000-000000000001', 'f0000013-0013-4000-8000-000000000013', '50ml', 'White', '#FFFFFF', 45, 'HF-BTY-013-50', true),
  ('f0010014-0001-4000-8000-000000000001', 'f0000014-0014-4000-8000-000000000014', '6', 'Nude', '#E3BC9A', 20, 'HF-FTW-014-6', true),
  ('f0010014-0002-4000-8000-000000000002', 'f0000014-0014-4000-8000-000000000014', '7', 'Nude', '#E3BC9A', 22, 'HF-FTW-014-7', true)
ON CONFLICT (id) DO NOTHING;

-- Images for new products
INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, sort_order) VALUES
  ('f0020009-0001-4000-8000-000000000001', 'f0000009-0009-4000-8000-000000000009', '/images/products/kanjivaram-silk-saree.jpg', 'Kanjivaram Silk Saree Gold', true, 0),
  ('f0020010-0001-4000-8000-000000000001', 'f0000010-0010-4000-8000-000000000010', '/images/products/anarkali-kurta.jpg', 'Anarkali Kurta Green', true, 0),
  ('f0020011-0001-4000-8000-000000000001', 'f0000011-0011-4000-8000-000000000011', '/images/products/gold-necklace-set.jpg', 'Gold Necklace Set', true, 0),
  ('f0020012-0001-4000-8000-000000000001', 'f0000012-0012-4000-8000-000000000012', '/images/products/chiffon-dupatta.jpg', 'Chiffon Dupatta Pink', true, 0),
  ('f0020013-0001-4000-8000-000000000001', 'f0000013-0013-4000-8000-000000000013', '/images/products/face-moisturizer.jpg', 'Face Moisturizer', true, 0),
  ('f0020014-0001-4000-8000-000000000001', 'f0000014-0014-4000-8000-000000000014', '/images/products/block-heel-sandals.jpg', 'Block Heel Sandals', true, 0)
ON CONFLICT (id) DO NOTHING;

-- Complete the look suggestions
INSERT INTO complete_the_look (id, primary_product_id, suggested_product_id, suggestion_type, sort_order) VALUES
  ('c0000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000001', 'f0000004-0004-4000-8000-000000000004', 'ACCESSORY', 1),
  ('c0000002-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000001', 'f0000008-0008-4000-8000-000000000008', 'ACCESSORY', 2),
  ('c0000003-0001-4000-8000-000000000001', 'f0000002-0002-4000-8000-000000000002', 'f0000012-0012-4000-8000-000000000012', 'ACCESSORY', 1),
  ('c0000004-0001-4000-8000-000000000001', 'f0000009-0009-4000-8000-000000000009', 'f0000011-0011-4000-8000-000000000011', 'ACCESSORY', 1)
ON CONFLICT (primary_product_id, suggested_product_id) DO NOTHING;

-- Demo orders (delivered + shipped + placed)
INSERT INTO orders (id, order_number, user_id, address_id, address_snapshot, status, subtotal, discount_amount, gst_amount, delivery_charge, total_amount, payment_method, payment_status, is_cod, cod_otp_verified, loyalty_points_earned, placed_at)
VALUES
  ('e0000001-0001-4000-8000-000000000001', 'HF-DEMO-1001', '33333333-3333-4333-8333-333333333333', '77777777-7777-4777-8777-777777777777',
   '{"fullName":"Demo Customer","mobile":"9000000003","addressLine":"12 MG Road, Banjara Hills","city":"Hyderabad","state":"Telangana","pincode":"500034"}'::jsonb,
   'DELIVERED', 2499.00, 0, 125.00, 0, 2624.00, 'COD', 'PAID', true, true, 262, NOW() - INTERVAL '10 days'),
  ('e0000002-0002-4000-8000-000000000002', 'HF-DEMO-1002', '33333333-3333-4333-8333-333333333333', '77777777-7777-4777-8777-777777777777',
   '{"fullName":"Demo Customer","mobile":"9000000003","addressLine":"12 MG Road, Banjara Hills","city":"Hyderabad","state":"Telangana","pincode":"500034"}'::jsonb,
   'SHIPPED', 1398.00, 0, 70.00, 0, 1468.00, 'ONLINE', 'PAID', false, false, 146, NOW() - INTERVAL '3 days'),
  ('e0000003-0003-4000-8000-000000000003', 'HF-DEMO-1003', '33333333-3333-4333-8333-333333333333', '77777777-7777-4777-8777-777777777777',
   '{"fullName":"Demo Customer","mobile":"9000000003","addressLine":"12 MG Road, Banjara Hills","city":"Hyderabad","state":"Telangana","pincode":"500034"}'::jsonb,
   'PLACED', 599.00, 0, 18.00, 49.00, 666.00, 'COD', 'PENDING', true, false, 0, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO order_items (id, order_id, product_id, variant_id, seller_id, product_name, product_image, variant_info, quantity, unit_price, gst_percent, gst_amount, total_price, seller_amount, commission_amount, status, is_reviewed, return_window_until)
VALUES
  ('e0010001-0001-4000-8000-000000000001', 'e0000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000001', 'f0010001-0001-4000-8000-000000000001', '44444444-4444-4444-8444-444444444444',
   'Banarasi Silk Saree — Royal Maroon', '/images/products/banarasi-silk-saree.jpg', 'Free Size / Maroon', 1, 2499.00, 5.00, 125.00, 2499.00, 2249.10, 249.90, 'DELIVERED', true, CURRENT_DATE + INTERVAL '7 days'),
  ('e0010002-0001-4000-8000-000000000001', 'e0000002-0002-4000-8000-000000000002', 'f0000002-0002-4000-8000-000000000002', 'f0010002-0001-4000-8000-000000000001', '44444444-4444-4444-8444-444444444444',
   'Floral Cotton Kurti Set', '/images/products/floral-cotton-kurti.jpg', 'M / Pink', 1, 799.00, 5.00, 40.00, 799.00, 719.10, 79.90, 'SHIPPED', false, CURRENT_DATE + INTERVAL '14 days'),
  ('e0010002-0002-4000-8000-000000000002', 'e0000002-0002-4000-8000-000000000002', 'f0000004-0004-4000-8000-000000000004', 'f0010004-0001-4000-8000-000000000001', '44444444-4444-4444-8444-444444444444',
   'Silver Oxidised Jhumka Earrings', '/images/products/silver-jhumka-earrings.jpg', 'One Size / Silver', 1, 599.00, 3.00, 18.00, 599.00, 539.10, 59.90, 'SHIPPED', false, CURRENT_DATE + INTERVAL '14 days'),
  ('e0010003-0001-4000-8000-000000000001', 'e0000003-0003-4000-8000-000000000003', 'f0000004-0004-4000-8000-000000000004', 'f0010004-0001-4000-8000-000000000001', '44444444-4444-4444-8444-444444444444',
   'Silver Oxidised Jhumka Earrings', '/images/products/silver-jhumka-earrings.jpg', 'One Size / Silver', 1, 599.00, 3.00, 18.00, 599.00, 539.10, 59.90, 'PLACED', false, CURRENT_DATE + INTERVAL '14 days')
ON CONFLICT (id) DO NOTHING;

INSERT INTO shipments (id, order_id, order_item_id, shiprocket_order_id, awb_number, courier_name, tracking_url, status, estimated_delivery)
VALUES
  ('e0020001-0001-4000-8000-000000000001', 'e0000001-0001-4000-8000-000000000001', 'e0010001-0001-4000-8000-000000000001', 'SR-ORD-HF-DEMO-1001', 'SR100001', 'Delhivery', 'https://track.shiprocket.in/SR100001', 'DELIVERED', CURRENT_DATE - INTERVAL '5 days'),
  ('e0020002-0001-4000-8000-000000000001', 'e0000002-0002-4000-8000-000000000002', 'e0010002-0001-4000-8000-000000000001', 'SR-ORD-HF-DEMO-1002', 'SR100002', 'Delhivery', 'https://track.shiprocket.in/SR100002', 'SHIPPED', CURRENT_DATE + INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Reviews
INSERT INTO reviews (id, product_id, user_id, order_item_id, rating, title, body, is_verified_purchase, helpful_count, is_approved, seller_reply, created_at) VALUES
  ('a1000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'e0010001-0001-4000-8000-000000000001', 5, 'Stunning saree!', 'The zari work is exquisite. Got so many compliments at the wedding.', true, 12, true, 'Thank you! We are glad you loved it.', NOW() - INTERVAL '8 days'),
  ('a1000002-0001-4000-8000-000000000001', 'f0000004-0004-4000-8000-000000000004', '33333333-3333-4333-8333-333333333333', NULL, 5, 'Beautiful jhumkas', 'Lightweight and elegant. Perfect for daily wear too.', true, 8, true, NULL, NOW() - INTERVAL '15 days'),
  ('a1000003-0001-4000-8000-000000000001', 'f0000002-0002-4000-8000-000000000002', '33333333-3333-4333-8333-333333333333', NULL, 4, 'Comfortable kurti', 'Soft cotton, true to size. Color is slightly lighter than photo.', true, 5, true, 'Thanks for the feedback!', NOW() - INTERVAL '20 days'),
  ('a1000004-0001-4000-8000-000000000001', 'f0000003-0003-4000-8000-000000000003', '33333333-3333-4333-8333-333333333333', NULL, 5, 'Love the print', 'Unique block print. Fits perfectly.', true, 3, true, NULL, NOW() - INTERVAL '12 days'),
  ('a1000005-0001-4000-8000-000000000001', 'f0000006-0006-4000-8000-000000000006', '33333333-3333-4333-8333-333333333333', NULL, 4, 'Good quality bag', 'Spacious and sturdy. Straps could be softer.', true, 2, true, NULL, NOW() - INTERVAL '25 days')
ON CONFLICT (id) DO NOTHING;

-- Product Q&A
INSERT INTO product_questions (id, product_id, user_id, question, is_approved, created_at) VALUES
  ('b1000001-0001-4000-8000-000000000001', 'f0000001-0001-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'Does this saree come with a blouse piece?', true, NOW() - INTERVAL '5 days'),
  ('b1000002-0001-4000-8000-000000000001', 'f0000004-0004-4000-8000-000000000004', '33333333-3333-4333-8333-333333333333', 'Are these suitable for sensitive ears?', true, NOW() - INTERVAL '3 days'),
  ('b1000003-0001-4000-8000-000000000001', 'f0000009-0009-4000-8000-000000000009', '33333333-3333-4333-8333-333333333333', 'What is the saree length in metres?', false, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_answers (id, question_id, answered_by, answer, is_seller_answer, created_at) VALUES
  ('b2000001-0001-4000-8000-000000000001', 'b1000001-0001-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Yes, an unstitched blouse piece is included with every saree.', true, NOW() - INTERVAL '4 days'),
  ('b2000002-0001-4000-8000-000000000001', 'b1000002-0001-4000-8000-000000000001', '22222222-2222-4222-8222-222222222222', 'Yes, they are nickel-free and hypoallergenic.', true, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Wishlist items for demo customer
INSERT INTO wishlist_items (id, wishlist_id, product_id, collection_name, price_at_add) VALUES
  ('d1000001-0001-4000-8000-000000000001', '66666666-6666-4666-8666-666666666666', 'f0000009-0009-4000-8000-000000000009', 'Wedding', 3499.00),
  ('d1000002-0001-4000-8000-000000000001', '66666666-6666-4666-8666-666666666666', 'f0000011-0011-4000-8000-000000000011', 'Jewellery', 1299.00),
  ('d1000003-0001-4000-8000-000000000001', '66666666-6666-4666-8666-666666666666', 'f0000014-0014-4000-8000-000000000014', 'Footwear', 899.00)
ON CONFLICT (wishlist_id, product_id) DO NOTHING;

-- Cart item for demo customer
INSERT INTO cart_items (id, cart_id, product_id, variant_id, quantity) VALUES
  ('d2000001-0001-4000-8000-000000000001', '55555555-5555-4555-8555-555555555555', 'f0000003-0003-4000-8000-000000000003', 'f0010003-0001-4000-8000-000000000001', 1)
ON CONFLICT (id) DO NOTHING;

-- Loyalty transactions
INSERT INTO loyalty_transactions (id, user_id, order_id, points, type, description, created_at) VALUES
  ('d3000001-0001-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', 'e0000001-0001-4000-8000-000000000001', 262, 'EARNED', 'Order HF-DEMO-1001', NOW() - INTERVAL '10 days'),
  ('d3000002-0001-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', NULL, 100, 'EARNED', 'Welcome bonus', NOW() - INTERVAL '30 days'),
  ('d3000003-0001-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', NULL, -50, 'REDEEMED', 'Checkout discount', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Support ticket
INSERT INTO support_tickets (id, ticket_number, user_id, order_id, category, subject, status, priority, created_at) VALUES
  ('d4000001-0001-4000-8000-000000000001', 'HF-TKT-001', '33333333-3333-4333-8333-333333333333', 'e0000002-0002-4000-8000-000000000002', 'SHIPPING', 'Where is my order HF-DEMO-1002?', 'OPEN', 'NORMAL', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

INSERT INTO support_messages (id, ticket_id, sender_id, is_staff, message, created_at) VALUES
  ('d4000002-0001-4000-8000-000000000001', 'd4000001-0001-4000-8000-000000000001', '33333333-3333-4333-8333-333333333333', false, 'I placed order HF-DEMO-1002 three days ago. When will it arrive?', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Extra coupon
INSERT INTO coupons (id, code, description, type, discount_value, min_order_amount, max_discount_amount, per_user_limit, is_first_order_only, is_active, valid_until)
VALUES ('88888888-8888-4888-8888-888888888889', 'FLAT200', 'Flat ₹200 off orders above ₹1499', 'FLAT', 200.00, 1499.00, 200.00, 3, false, true, NOW() + INTERVAL '6 months')
ON CONFLICT (id) DO NOTHING;

-- Third banner
INSERT INTO banners (id, title, subtitle, image_url, link_url, position, is_active, sort_order)
VALUES ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'New Arrivals', 'Fresh styles added weekly',
        '/images/banners/banner-new-arrivals.jpg', '/products?sort=NEWEST', 'HOME_HERO', true, 3)
ON CONFLICT (id) DO NOTHING;

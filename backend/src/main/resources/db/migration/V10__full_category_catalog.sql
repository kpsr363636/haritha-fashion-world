-- V10: Full catalog — 3+ products per category, descriptions, extra banners
-- Safe to re-run: fixed UUIDs + ON CONFLICT DO NOTHING

UPDATE categories SET description = CASE slug
  WHEN 'sarees-ethnic-wear' THEN 'Silk sarees, kurtas, lehengas & festive ethnic wear'
  WHEN 'western-clothing' THEN 'Dresses, co-ords, tops & contemporary western styles'
  WHEN 'fine-jewellery' THEN 'Earrings, necklaces, bangles & bridal jewellery'
  WHEN 'beauty-skincare' THEN 'Serums, moisturizers, toners & daily skincare'
  WHEN 'bags-handbags' THEN 'Totes, slings, clutches & everyday handbags'
  WHEN 'footwear' THEN 'Heels, flats, mojaris & kolhapuris'
  WHEN 'hair-accessories' THEN 'Pins, scrunchies, maang tikkas & hair jewels'
  WHEN 'scarves-dupattas' THEN 'Dupattas, stoles, bandhani & silk scarves'
  WHEN 'watches-eyewear' THEN 'Watches, sunglasses & blue-light glasses'
  WHEN 'fashion-accessories' THEN 'Belts, bracelets, rings & finishing touches'
  ELSE description END
WHERE slug IN (
  'sarees-ethnic-wear', 'western-clothing', 'fine-jewellery', 'beauty-skincare',
  'bags-handbags', 'footwear', 'hair-accessories', 'scarves-dupattas',
  'watches-eyewear', 'fashion-accessories'
);

-- ── Sarees & Ethnic ──
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000015-0015-4000-8000-000000000015'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Designer Lehenga Choli — Blush Pink', 'designer-lehenga-choli-blush-pink',
  'Embroidered lehenga with net dupatta. Perfect for sangeet and reception.',
  'Net', 'Wedding', 4999.00, 8999.00, 44.00, 5.00, 'ACTIVE', true, true, 42, 4.72, 31
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000016-0016-4000-8000-000000000016'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Cotton Palazzo Set — Ivory', 'cotton-palazzo-set-ivory',
  'Three-piece kurta palazzo set with soft cotton fabric for daily elegance.',
  'Cotton', 'Casual', 999.00, 1599.00, 38.00, 5.00, 'ACTIVE', false, true, 67, 4.48, 24
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;

-- ── Western ──
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000017-0017-4000-8000-000000000017'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'High Waist Wide Leg Jeans', 'high-waist-wide-leg-jeans',
  'Stretch denim with flattering wide leg cut. Office to weekend ready.',
  'Denim', 'Casual', 1499.00, 2299.00, 35.00, 12.00, 'ACTIVE', true, true, 88, 4.52, 36
FROM categories c WHERE c.slug = 'western-clothing' ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000018-0018-4000-8000-000000000018'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Linen Co-ord Set — Sage Green', 'linen-coord-set-sage-green',
  'Relaxed linen shirt and trousers set. Breathable summer essential.',
  'Linen', 'Work', 1799.00, 2799.00, 36.00, 12.00, 'ACTIVE', true, true, 54, 4.61, 19
FROM categories c WHERE c.slug = 'western-clothing' ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000019-0019-4000-8000-000000000019'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Floral Wrap Top — Coral', 'floral-wrap-top-coral',
  'Lightweight wrap top with tropical print. Pairs with jeans or skirts.',
  'Viscose', 'Party', 699.00, 1099.00, 36.00, 12.00, 'ACTIVE', false, true, 73, 4.38, 27
FROM categories c WHERE c.slug = 'western-clothing' ON CONFLICT (id) DO NOTHING;

-- ── Jewellery ──
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000020-0020-4000-8000-000000000020'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Kundan Choker Necklace Set', 'kundan-choker-necklace-set',
  'Bridal kundan choker with matching earrings. Gold-tone finish.',
  'Kundan', 'Wedding', 1899.00, 3299.00, 42.00, 3.00, 'ACTIVE', true, true, 98, 4.76, 41
FROM categories c WHERE c.slug = 'fine-jewellery' ON CONFLICT (id) DO NOTHING;

-- ── Beauty ──
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000021-0021-4000-8000-000000000021'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Rose Water Hydrating Toner', 'rose-water-hydrating-toner',
  'Alcohol-free rose toner for refreshed, balanced skin. 200ml.',
  'Liquid', 'Daily', 349.00, 549.00, 36.00, 18.00, 'ACTIVE', false, true, 112, 4.42, 44
FROM categories c WHERE c.slug = 'beauty-skincare' ON CONFLICT (id) DO NOTHING;

-- ── Bags ──
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000022-0022-4000-8000-000000000022'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Quilted Crossbody Sling Bag', 'quilted-crossbody-sling-bag',
  'Compact sling with adjustable strap and multiple pockets.',
  'PU Leather', 'Casual', 899.00, 1499.00, 40.00, 18.00, 'ACTIVE', true, true, 63, 4.55, 22
FROM categories c WHERE c.slug = 'bags-handbags' ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000023-0023-4000-8000-000000000023'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Embroidered Evening Clutch', 'embroidered-evening-clutch',
  'Hand-embroidered clutch with chain strap. Wedding & party ready.',
  'Silk', 'Party', 699.00, 1199.00, 42.00, 18.00, 'ACTIVE', false, true, 38, 4.50, 15
FROM categories c WHERE c.slug = 'bags-handbags' ON CONFLICT (id) DO NOTHING;

-- ── Footwear ──
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000024-0024-4000-8000-000000000024'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Handcrafted Kolhapuri Chappals', 'handcrafted-kolhapuri-chappals',
  'Authentic leather kolhapuris with cushioned sole.',
  'Leather', 'Casual', 799.00, 1299.00, 38.00, 5.00, 'ACTIVE', true, true, 91, 4.44, 33
FROM categories c WHERE c.slug = 'footwear' ON CONFLICT (id) DO NOTHING;

-- ── Hair Accessories ──
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000025-0025-4000-8000-000000000025'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Velvet Scrunchie Set — 6 Pack', 'velvet-scrunchie-set-6-pack',
  'Assorted velvet scrunchies in jewel tones. Gentle on hair.',
  'Velvet', 'Daily', 249.00, 399.00, 38.00, 12.00, 'ACTIVE', false, true, 156, 4.68, 58
FROM categories c WHERE c.slug = 'hair-accessories' ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000026-0026-4000-8000-000000000026'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Gold Plated Maang Tikka', 'gold-plated-maang-tikka',
  'Traditional maang tikka with pearl drops. Bridal & festive wear.',
  'Metal', 'Wedding', 449.00, 749.00, 40.00, 12.00, 'ACTIVE', true, true, 84, 4.58, 29
FROM categories c WHERE c.slug = 'hair-accessories' ON CONFLICT (id) DO NOTHING;

-- ── Scarves & Dupattas ──
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000027-0027-4000-8000-000000000027'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Banarasi Silk Stole — Wine', 'banarasi-silk-stole-wine',
  'Rich Banarasi weave stole with zari border. Versatile layering piece.',
  'Silk', 'Festive', 899.00, 1499.00, 40.00, 5.00, 'ACTIVE', true, true, 52, 4.63, 21
FROM categories c WHERE c.slug = 'scarves-dupattas' ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000028-0028-4000-8000-000000000028'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Bandhani Cotton Dupatta — Multicolor', 'bandhani-cotton-dupatta-multicolor',
  'Hand tie-dye bandhani dupatta from Rajasthan. Lightweight cotton.',
  'Cotton', 'Casual', 499.00, 799.00, 38.00, 5.00, 'ACTIVE', false, true, 76, 4.41, 26
FROM categories c WHERE c.slug = 'scarves-dupattas' ON CONFLICT (id) DO NOTHING;

-- ── Watches & Eyewear ──
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000029-0029-4000-8000-000000000029'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Rose Gold Minimalist Watch', 'rose-gold-minimalist-watch',
  'Slim rose gold watch with mesh strap. Water resistant 3ATM.',
  'Stainless Steel', 'Work', 1299.00, 2199.00, 41.00, 18.00, 'ACTIVE', true, true, 47, 4.54, 18
FROM categories c WHERE c.slug = 'watches-eyewear' ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000030-0030-4000-8000-000000000030'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Cat-Eye UV Sunglasses', 'cat-eye-uv-sunglasses',
  'Polarized cat-eye frames with UV400 protection. Includes case.',
  'Acetate', 'Casual', 599.00, 999.00, 40.00, 18.00, 'ACTIVE', true, true, 102, 4.49, 37
FROM categories c WHERE c.slug = 'watches-eyewear' ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000031-0031-4000-8000-000000000031'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Blue Light Blocking Glasses', 'blue-light-blocking-glasses',
  'Clear lens glasses for screen time. Lightweight TR90 frame.',
  'TR90', 'Work', 449.00, 749.00, 40.00, 18.00, 'ACTIVE', false, true, 68, 4.36, 24
FROM categories c WHERE c.slug = 'watches-eyewear' ON CONFLICT (id) DO NOTHING;

-- ── Fashion Accessories ──
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000032-0032-4000-8000-000000000032'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Gold Buckle Statement Belt', 'gold-buckle-statement-belt',
  'Wide belt with antique gold buckle. One size adjustable.',
  'Faux Leather', 'Party', 399.00, 649.00, 38.00, 12.00, 'ACTIVE', false, true, 59, 4.33, 17
FROM categories c WHERE c.slug = 'fashion-accessories' ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000033-0033-4000-8000-000000000033'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Layered Pearl Bracelet Set', 'layered-pearl-bracelet-set',
  'Set of 3 stackable pearl bracelets. Gold-tone clasps.',
  'Pearl', 'Festive', 549.00, 899.00, 39.00, 12.00, 'ACTIVE', true, true, 71, 4.57, 28
FROM categories c WHERE c.slug = 'fashion-accessories' ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000034-0034-4000-8000-000000000034'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Silk Scarf Ring Set — 3 Pack', 'silk-scarf-ring-set-3-pack',
  'Scarf rings in gold, silver & rose gold. Keep dupattas in place.',
  'Metal', 'Daily', 199.00, 349.00, 43.00, 12.00, 'ACTIVE', false, true, 134, 4.62, 46
FROM categories c WHERE c.slug = 'fashion-accessories' ON CONFLICT (id) DO NOTHING;

-- Variants
INSERT INTO product_variants (id, product_id, size, color, color_hex, stock_quantity, sku, is_active) VALUES
  ('f0010015-0001-4000-8000-000000000001', 'f0000015-0015-4000-8000-000000000015', 'Free Size', 'Blush', '#FFB6C1', 18, 'HF-LEH-015-BLS', true),
  ('f0010016-0001-4000-8000-000000000001', 'f0000016-0016-4000-8000-000000000016', 'M', 'Ivory', '#FFFFF0', 28, 'HF-PAL-016-IV-M', true),
  ('f0010016-0002-4000-8000-000000000002', 'f0000016-0016-4000-8000-000000000016', 'L', 'Ivory', '#FFFFF0', 22, 'HF-PAL-016-IV-L', true),
  ('f0010017-0001-4000-8000-000000000001', 'f0000017-0017-4000-8000-000000000017', '28', 'Indigo', '#3F51B5', 20, 'HF-JNS-017-28', true),
  ('f0010017-0002-4000-8000-000000000002', 'f0000017-0017-4000-8000-000000000017', '30', 'Indigo', '#3F51B5', 24, 'HF-JNS-017-30', true),
  ('f0010018-0001-4000-8000-000000000001', 'f0000018-0018-4000-8000-000000000018', 'M', 'Sage', '#9CAF88', 16, 'HF-CRD-018-M', true),
  ('f0010019-0001-4000-8000-000000000001', 'f0000019-0019-4000-8000-000000000019', 'S', 'Coral', '#FF7F50', 30, 'HF-WRP-019-S', true),
  ('f0010020-0001-4000-8000-000000000001', 'f0000020-0020-4000-8000-000000000020', 'One Size', 'Gold', '#FFD700', 35, 'HF-KUN-020-GLD', true),
  ('f0010021-0001-4000-8000-000000000001', 'f0000021-0021-4000-8000-000000000021', '200ml', 'Clear', '#FFFFFF', 55, 'HF-TON-021-200', true),
  ('f0010022-0001-4000-8000-000000000001', 'f0000022-0022-4000-8000-000000000022', 'One Size', 'Black', '#000000', 40, 'HF-SLG-022-BLK', true),
  ('f0010023-0001-4000-8000-000000000001', 'f0000023-0023-4000-8000-000000000023', 'One Size', 'Gold', '#FFD700', 25, 'HF-CLT-023-GLD', true),
  ('f0010024-0001-4000-8000-000000000001', 'f0000024-0024-4000-8000-000000000024', '7', 'Tan', '#D2B48C', 28, 'HF-KOL-024-7', true),
  ('f0010025-0001-4000-8000-000000000001', 'f0000025-0025-4000-8000-000000000025', 'One Size', 'Assorted', '#800080', 80, 'HF-SCR-025-AST', true),
  ('f0010026-0001-4000-8000-000000000001', 'f0000026-0026-4000-8000-000000000026', 'One Size', 'Gold', '#FFD700', 45, 'HF-MNG-026-GLD', true),
  ('f0010027-0001-4000-8000-000000000001', 'f0000027-0027-4000-8000-000000000027', 'Free Size', 'Wine', '#722F37', 30, 'HF-STL-027-WIN', true),
  ('f0010028-0001-4000-8000-000000000001', 'f0000028-0028-4000-8000-000000000028', 'Free Size', 'Multicolor', '#FF6347', 42, 'HF-BND-028-MUL', true),
  ('f0010029-0001-4000-8000-000000000001', 'f0000029-0029-4000-8000-000000000029', 'One Size', 'Rose Gold', '#B76E79', 32, 'HF-WCH-029-RG', true),
  ('f0010030-0001-4000-8000-000000000001', 'f0000030-0030-4000-8000-000000000030', 'One Size', 'Tortoise', '#8B4513', 50, 'HF-SUN-030-TRT', true),
  ('f0010031-0001-4000-8000-000000000001', 'f0000031-0031-4000-8000-000000000031', 'One Size', 'Clear', '#FFFFFF', 60, 'HF-BLU-031-CLR', true),
  ('f0010032-0001-4000-8000-000000000001', 'f0000032-0032-4000-8000-000000000032', 'Adjustable', 'Black', '#000000', 38, 'HF-BLT-032-BLK', true),
  ('f0010033-0001-4000-8000-000000000001', 'f0000033-0033-4000-8000-000000000033', 'One Size', 'Pearl', '#FDEEF4', 48, 'HF-BRC-033-PRL', true),
  ('f0010034-0001-4000-8000-000000000001', 'f0000034-0034-4000-8000-000000000034', 'One Size', 'Mixed', '#C0C0C0', 90, 'HF-RNG-034-MIX', true)
ON CONFLICT (id) DO NOTHING;

-- Images
INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, sort_order) VALUES
  ('f0020015-0001-4000-8000-000000000001', 'f0000015-0015-4000-8000-000000000015', '/images/products/lehenga-choli.jpg', 'Lehenga Choli', true, 0),
  ('f0020016-0001-4000-8000-000000000001', 'f0000016-0016-4000-8000-000000000016', '/images/products/palazzo-set.jpg', 'Palazzo Set', true, 0),
  ('f0020017-0001-4000-8000-000000000001', 'f0000017-0017-4000-8000-000000000017', '/images/products/wide-leg-jeans.jpg', 'Wide Leg Jeans', true, 0),
  ('f0020018-0001-4000-8000-000000000001', 'f0000018-0018-4000-8000-000000000018', '/images/products/linen-coord.jpg', 'Linen Co-ord', true, 0),
  ('f0020019-0001-4000-8000-000000000001', 'f0000019-0019-4000-8000-000000000019', '/images/products/wrap-top.jpg', 'Wrap Top', true, 0),
  ('f0020020-0001-4000-8000-000000000001', 'f0000020-0020-4000-8000-000000000020', '/images/products/kundan-choker.jpg', 'Kundan Choker', true, 0),
  ('f0020021-0001-4000-8000-000000000001', 'f0000021-0021-4000-8000-000000000021', '/images/products/rose-toner.jpg', 'Rose Toner', true, 0),
  ('f0020022-0001-4000-8000-000000000001', 'f0000022-0022-4000-8000-000000000022', '/images/products/sling-bag.jpg', 'Sling Bag', true, 0),
  ('f0020023-0001-4000-8000-000000000001', 'f0000023-0023-4000-8000-000000000023', '/images/products/clutch.jpg', 'Clutch', true, 0),
  ('f0020024-0001-4000-8000-000000000001', 'f0000024-0024-4000-8000-000000000024', '/images/products/kolhapuri.jpg', 'Kolhapuri', true, 0),
  ('f0020025-0001-4000-8000-000000000001', 'f0000025-0025-4000-8000-000000000025', '/images/products/scrunchie-set.jpg', 'Scrunchie Set', true, 0),
  ('f0020026-0001-4000-8000-000000000001', 'f0000026-0026-4000-8000-000000000026', '/images/products/maang-tikka.jpg', 'Maang Tikka', true, 0),
  ('f0020027-0001-4000-8000-000000000001', 'f0000027-0027-4000-8000-000000000027', '/images/products/silk-stole.jpg', 'Silk Stole', true, 0),
  ('f0020028-0001-4000-8000-000000000001', 'f0000028-0028-4000-8000-000000000028', '/images/products/bandhani-dupatta.jpg', 'Bandhani Dupatta', true, 0),
  ('f0020029-0001-4000-8000-000000000001', 'f0000029-0029-4000-8000-000000000029', '/images/products/rose-gold-watch.jpg', 'Rose Gold Watch', true, 0),
  ('f0020030-0001-4000-8000-000000000001', 'f0000030-0030-4000-8000-000000000030', '/images/products/cat-eye-sunglasses.jpg', 'Cat Eye Sunglasses', true, 0),
  ('f0020031-0001-4000-8000-000000000001', 'f0000031-0031-4000-8000-000000000031', '/images/products/blue-light-glasses.jpg', 'Blue Light Glasses', true, 0),
  ('f0020032-0001-4000-8000-000000000001', 'f0000032-0032-4000-8000-000000000032', '/images/products/statement-belt.jpg', 'Statement Belt', true, 0),
  ('f0020033-0001-4000-8000-000000000001', 'f0000033-0033-4000-8000-000000000033', '/images/products/bracelet-set.jpg', 'Bracelet Set', true, 0),
  ('f0020034-0001-4000-8000-000000000001', 'f0000034-0034-4000-8000-000000000034', '/images/products/scarf-ring.jpg', 'Scarf Ring Set', true, 0)
ON CONFLICT (id) DO NOTHING;

-- Extra home banners
INSERT INTO banners (id, title, subtitle, image_url, link_url, position, is_active, sort_order) VALUES
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd', 'Western Edit', 'Fresh co-ords & denim starting ₹699',
   '/images/banners/banner-western-edit.jpg', '/products?category=western-clothing', 'HOME_HERO', true, 3),
  ('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', 'Beauty Essentials', 'Skincare bestsellers up to 40% off',
   '/images/banners/banner-beauty.jpg', '/products?category=beauty-skincare', 'HOME_HERO', true, 4)
ON CONFLICT (id) DO NOTHING;

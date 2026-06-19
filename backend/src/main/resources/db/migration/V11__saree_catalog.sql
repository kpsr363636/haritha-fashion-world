-- V11: Sarees & Ethnic Wear — 40 saree-only catalog with real image paths
-- Safe to re-run: fixed UUIDs + ON CONFLICT DO NOTHING

UPDATE categories SET description = 'Premium silk, cotton & designer sarees for every occasion'
WHERE slug = 'sarees-ethnic-wear';

-- Move non-saree items out of this category
UPDATE products SET category_id = c.id
FROM categories c
WHERE c.slug = 'western-clothing'
  AND products.slug IN (
    'floral-cotton-kurti-set',
    'anarkali-kurta-emerald-green',
    'designer-lehenga-choli-blush-pink',
    'cotton-palazzo-set-ivory'
  );

INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000035-0035-4000-8000-000000000035'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Kanchipuram Silk Saree — Emerald Border', 'kanchipuram-silk-saree-emerald-border',
  'Handpicked silk saree — elegant drape, rich finish, perfect for wedding.',
  'Silk', 'Wedding', 3299.00, 6499.00, 49.00, 5.00, 'ACTIVE', true, true, 88, 4.78, 41
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000036-0036-4000-8000-000000000036'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Banarasi Tissue Saree — Champagne Gold', 'banarasi-tissue-saree-champagne-gold',
  'Handpicked tissue silk saree — elegant drape, rich finish, perfect for reception.',
  'Tissue Silk', 'Reception', 2799.00, 5499.00, 49.00, 5.00, 'ACTIVE', true, true, 76, 4.72, 33
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000037-0037-4000-8000-000000000037'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Paithani Silk Saree — Peacock Green', 'paithani-silk-saree-peacock-green',
  'Handpicked silk saree — elegant drape, rich finish, perfect for festive.',
  'Silk', 'Festive', 3999.00, 7999.00, 50.00, 5.00, 'ACTIVE', true, true, 64, 4.81, 29
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000038-0038-4000-8000-000000000038'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Chiffon Saree — Blush Pink Ombre', 'chiffon-saree-blush-pink-ombre',
  'Handpicked chiffon saree — elegant drape, rich finish, perfect for party.',
  'Chiffon', 'Party', 1299.00, 2199.00, 41.00, 5.00, 'ACTIVE', false, true, 102, 4.55, 27
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000039-0039-4000-8000-000000000039'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Georgette Saree — Navy Blue Floral', 'georgette-saree-navy-blue-floral',
  'Handpicked georgette saree — elegant drape, rich finish, perfect for party.',
  'Georgette', 'Party', 1499.00, 2499.00, 40.00, 5.00, 'ACTIVE', true, true, 91, 4.58, 24
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000040-0040-4000-8000-000000000040'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Cotton Handloom Saree — Indigo Block Print', 'cotton-handloom-saree-indigo-block-print',
  'Handpicked cotton saree — elegant drape, rich finish, perfect for daily.',
  'Cotton', 'Daily', 899.00, 1499.00, 40.00, 5.00, 'ACTIVE', false, true, 115, 4.46, 31
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000041-0041-4000-8000-000000000041'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Tussar Silk Saree — Natural Beige', 'tussar-silk-saree-natural-beige',
  'Handpicked tussar silk saree — elegant drape, rich finish, perfect for work.',
  'Tussar Silk', 'Work', 1899.00, 3199.00, 41.00, 5.00, 'ACTIVE', false, true, 58, 4.52, 19
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000042-0042-4000-8000-000000000042'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Organza Saree — Ivory Pearl Work', 'organza-saree-ivory-pearl-work',
  'Handpicked organza saree — elegant drape, rich finish, perfect for wedding.',
  'Organza', 'Wedding', 2199.00, 3999.00, 45.00, 5.00, 'ACTIVE', true, true, 72, 4.74, 36
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000043-0043-4000-8000-000000000043'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Bandhani Saree — Rajasthani Red', 'bandhani-saree-rajasthani-red',
  'Handpicked cotton silk saree — elegant drape, rich finish, perfect for festive.',
  'Cotton Silk', 'Festive', 1199.00, 1999.00, 40.00, 5.00, 'ACTIVE', true, true, 83, 4.61, 22
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000044-0044-4000-8000-000000000044'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Kalamkari Saree — Temple Narrative', 'kalamkari-saree-temple-narrative',
  'Handpicked cotton saree — elegant drape, rich finish, perfect for festive.',
  'Cotton', 'Festive', 1599.00, 2699.00, 41.00, 5.00, 'ACTIVE', false, true, 67, 4.57, 18
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000045-0045-4000-8000-000000000045'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Mysore Silk Saree — Royal Purple', 'mysore-silk-saree-royal-purple',
  'Handpicked silk saree — elegant drape, rich finish, perfect for wedding.',
  'Silk', 'Wedding', 2999.00, 5999.00, 50.00, 5.00, 'ACTIVE', true, true, 54, 4.79, 26
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000046-0046-4000-8000-000000000046'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Linen Saree — Sage Green Stripe', 'linen-saree-sage-green-stripe',
  'Handpicked linen saree — elegant drape, rich finish, perfect for casual.',
  'Linen', 'Casual', 1099.00, 1799.00, 39.00, 5.00, 'ACTIVE', false, true, 94, 4.44, 21
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000047-0047-4000-8000-000000000047'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Crepe Silk Saree — Wine Maroon', 'crepe-silk-saree-wine-maroon',
  'Handpicked crepe silk saree — elegant drape, rich finish, perfect for party.',
  'Crepe Silk', 'Party', 1699.00, 2899.00, 41.00, 5.00, 'ACTIVE', false, true, 61, 4.53, 17
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000048-0048-4000-8000-000000000048'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Net Saree — Silver Sequin', 'net-saree-silver-sequin',
  'Handpicked net saree — elegant drape, rich finish, perfect for party.',
  'Net', 'Party', 1999.00, 3499.00, 43.00, 5.00, 'ACTIVE', true, true, 79, 4.66, 28
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000049-0049-4000-8000-000000000049'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Satin Saree — Ruby Red', 'satin-saree-ruby-red',
  'Handpicked satin saree — elegant drape, rich finish, perfect for reception.',
  'Satin', 'Reception', 1399.00, 2299.00, 39.00, 5.00, 'ACTIVE', false, true, 86, 4.49, 23
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000050-0050-4000-8000-000000000050'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Khadi Saree — Earth Brown', 'khadi-saree-earth-brown',
  'Handpicked khadi saree — elegant drape, rich finish, perfect for daily.',
  'Khadi', 'Daily', 799.00, 1299.00, 38.00, 5.00, 'ACTIVE', false, true, 108, 4.41, 20
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000051-0051-4000-8000-000000000051'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Jamdani Saree — Off White Weave', 'jamdani-saree-off-white-weave',
  'Handpicked cotton saree — elegant drape, rich finish, perfect for festive.',
  'Cotton', 'Festive', 1799.00, 2999.00, 40.00, 5.00, 'ACTIVE', true, true, 49, 4.62, 16
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000052-0052-4000-8000-000000000052'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Ikat Saree — Telia Rumal', 'ikat-saree-telia-rumal',
  'Handpicked cotton silk saree — elegant drape, rich finish, perfect for festive.',
  'Cotton Silk', 'Festive', 1499.00, 2499.00, 40.00, 5.00, 'ACTIVE', false, true, 57, 4.56, 15
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000053-0053-4000-8000-000000000053'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Chanderi Silk Saree — Mint Green', 'chanderi-silk-saree-mint-green',
  'Handpicked chanderi saree — elegant drape, rich finish, perfect for party.',
  'Chanderi', 'Party', 2099.00, 3599.00, 42.00, 5.00, 'ACTIVE', true, true, 63, 4.68, 19
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000054-0054-4000-8000-000000000054'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Maheshwari Silk Saree — Dual Tone', 'maheshwari-silk-saree-dual-tone',
  'Handpicked silk cotton saree — elegant drape, rich finish, perfect for work.',
  'Silk Cotton', 'Work', 1299.00, 2199.00, 41.00, 5.00, 'ACTIVE', false, true, 71, 4.5, 14
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000055-0055-4000-8000-000000000055'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Bhagalpuri Tussar — Copper Zari', 'bhagalpuri-tussar-copper-zari',
  'Handpicked tussar saree — elegant drape, rich finish, perfect for festive.',
  'Tussar', 'Festive', 1699.00, 2799.00, 39.00, 5.00, 'ACTIVE', false, true, 52, 4.59, 13
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000056-0056-4000-8000-000000000056'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Gadwal Cotton Silk — Mustard Yellow', 'gadwal-cotton-silk-mustard-yellow',
  'Handpicked cotton silk saree — elegant drape, rich finish, perfect for festive.',
  'Cotton Silk', 'Festive', 1899.00, 3099.00, 39.00, 5.00, 'ACTIVE', false, true, 46, 4.54, 12
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000057-0057-4000-8000-000000000057'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Uppada Jamdani — Coral Pink', 'uppada-jamdani-coral-pink',
  'Handpicked silk saree — elegant drape, rich finish, perfect for wedding.',
  'Silk', 'Wedding', 3599.00, 6999.00, 49.00, 5.00, 'ACTIVE', true, true, 41, 4.77, 11
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000058-0058-4000-8000-000000000058'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Mangalgiri Cotton — Classic White', 'mangalgiri-cotton-classic-white',
  'Handpicked cotton saree — elegant drape, rich finish, perfect for daily.',
  'Cotton', 'Daily', 699.00, 1199.00, 42.00, 5.00, 'ACTIVE', false, true, 99, 4.43, 18
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000059-0059-4000-8000-000000000059'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Venkatagiri Silk — Sky Blue', 'venkatagiri-silk-sky-blue',
  'Handpicked silk saree — elegant drape, rich finish, perfect for party.',
  'Silk', 'Party', 2399.00, 4199.00, 43.00, 5.00, 'ACTIVE', true, true, 44, 4.65, 10
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000060-0060-4000-8000-000000000060'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Pochampally Ikat — Black & Gold', 'pochampally-ikat-black-gold',
  'Handpicked silk saree — elegant drape, rich finish, perfect for festive.',
  'Silk', 'Festive', 2599.00, 4499.00, 42.00, 5.00, 'ACTIVE', true, true, 38, 4.71, 9
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000061-0061-4000-8000-000000000061'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Kota Doria — Lemon Yellow', 'kota-doria-lemon-yellow',
  'Handpicked cotton saree — elegant drape, rich finish, perfect for summer.',
  'Cotton', 'Summer', 999.00, 1699.00, 41.00, 5.00, 'ACTIVE', false, true, 87, 4.47, 16
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000062-0062-4000-8000-000000000062'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Banarasi Georgette — Teal Green', 'banarasi-georgette-teal-green',
  'Handpicked georgette saree — elegant drape, rich finish, perfect for reception.',
  'Georgette', 'Reception', 2499.00, 4299.00, 42.00, 5.00, 'ACTIVE', true, true, 55, 4.69, 14
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000063-0063-4000-8000-000000000063'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Silk Cotton Saree — Rust Orange', 'silk-cotton-saree-rust-orange',
  'Handpicked silk cotton saree — elegant drape, rich finish, perfect for festive.',
  'Silk Cotton', 'Festive', 1399.00, 2299.00, 39.00, 5.00, 'ACTIVE', false, true, 62, 4.51, 11
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000064-0064-4000-8000-000000000064'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Digital Print Saree — Abstract Art', 'digital-print-saree-abstract-art',
  'Handpicked georgette saree — elegant drape, rich finish, perfect for party.',
  'Georgette', 'Party', 999.00, 1699.00, 41.00, 5.00, 'ACTIVE', false, true, 78, 4.48, 13
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000065-0065-4000-8000-000000000065'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Embroidered Net — Pastel Lavender', 'embroidered-net-pastel-lavender',
  'Handpicked net saree — elegant drape, rich finish, perfect for reception.',
  'Net', 'Reception', 2299.00, 3899.00, 41.00, 5.00, 'ACTIVE', true, true, 47, 4.64, 10
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000066-0066-4000-8000-000000000066'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Handwoven Silk — Classic Black', 'handwoven-silk-classic-black',
  'Handpicked silk saree — elegant drape, rich finish, perfect for wedding.',
  'Silk', 'Wedding', 3199.00, 6299.00, 49.00, 5.00, 'ACTIVE', true, true, 36, 4.76, 8
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000067-0067-4000-8000-000000000067'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Floral Chiffon — Peach Blossom', 'floral-chiffon-peach-blossom',
  'Handpicked chiffon saree — elegant drape, rich finish, perfect for party.',
  'Chiffon', 'Party', 1199.00, 1999.00, 40.00, 5.00, 'ACTIVE', false, true, 69, 4.52, 12
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000068-0068-4000-8000-000000000068'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Zari Work Saree — Royal Blue', 'zari-work-saree-royal-blue',
  'Handpicked silk saree — elegant drape, rich finish, perfect for wedding.',
  'Silk', 'Wedding', 2899.00, 5499.00, 47.00, 5.00, 'ACTIVE', true, true, 51, 4.73, 15
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000069-0069-4000-8000-000000000069'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Temple Border Saree — Classic Red', 'temple-border-saree-classic-red',
  'Handpicked silk saree — elegant drape, rich finish, perfect for festive.',
  'Silk', 'Festive', 2699.00, 4999.00, 46.00, 5.00, 'ACTIVE', true, true, 43, 4.67, 11
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000070-0070-4000-8000-000000000070'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Soft Silk Saree — Dusty Rose', 'soft-silk-saree-dusty-rose',
  'Handpicked silk saree — elegant drape, rich finish, perfect for party.',
  'Silk', 'Party', 1799.00, 2999.00, 40.00, 5.00, 'ACTIVE', false, true, 58, 4.58, 10
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000071-0071-4000-8000-000000000071'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Party Wear Saree — Midnight Blue', 'party-wear-saree-midnight-blue',
  'Handpicked georgette saree — elegant drape, rich finish, perfect for party.',
  'Georgette', 'Party', 1599.00, 2699.00, 41.00, 5.00, 'ACTIVE', false, true, 65, 4.55, 9
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;
INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)
SELECT 'f0000072-0072-4000-8000-000000000072'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,
  'Bridal Silk Saree — Crimson Red', 'bridal-silk-saree-crimson-red',
  'Handpicked silk saree — elegant drape, rich finish, perfect for wedding.',
  'Silk', 'Wedding', 4499.00, 8999.00, 50.00, 5.00, 'ACTIVE', true, true, 92, 4.82, 34
FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;

INSERT INTO product_variants (id, product_id, size, color, color_hex, stock_quantity, sku, is_active) VALUES
  ('f0010035-0001-4000-8000-000000000001', 'f0000035-0035-4000-8000-000000000035', 'Free Size', 'Emerald', '#50C878', 22, 'HF-SAR-035-EME', true),
  ('f0010036-0001-4000-8000-000000000001', 'f0000036-0036-4000-8000-000000000036', 'Free Size', 'Champagne', '#F7E7CE', 18, 'HF-SAR-036-CHA', true),
  ('f0010037-0001-4000-8000-000000000001', 'f0000037-0037-4000-8000-000000000037', 'Free Size', 'Peacock Green', '#006A4E', 15, 'HF-SAR-037-PEA', true),
  ('f0010038-0001-4000-8000-000000000001', 'f0000038-0038-4000-8000-000000000038', 'Free Size', 'Blush Pink', '#FFB6C1', 30, 'HF-SAR-038-BLU', true),
  ('f0010039-0001-4000-8000-000000000001', 'f0000039-0039-4000-8000-000000000039', 'Free Size', 'Navy Blue', '#000080', 28, 'HF-SAR-039-NAV', true),
  ('f0010040-0001-4000-8000-000000000001', 'f0000040-0040-4000-8000-000000000040', 'Free Size', 'Indigo', '#3F51B5', 35, 'HF-SAR-040-IND', true),
  ('f0010041-0001-4000-8000-000000000001', 'f0000041-0041-4000-8000-000000000041', 'Free Size', 'Beige', '#F5F5DC', 24, 'HF-SAR-041-BEI', true),
  ('f0010042-0001-4000-8000-000000000001', 'f0000042-0042-4000-8000-000000000042', 'Free Size', 'Ivory', '#FFFFF0', 20, 'HF-SAR-042-IVO', true),
  ('f0010043-0001-4000-8000-000000000001', 'f0000043-0043-4000-8000-000000000043', 'Free Size', 'Red', '#C41E3A', 32, 'HF-SAR-043-RED', true),
  ('f0010044-0001-4000-8000-000000000001', 'f0000044-0044-4000-8000-000000000044', 'Free Size', 'Multicolor', '#FF6347', 26, 'HF-SAR-044-MUL', true),
  ('f0010045-0001-4000-8000-000000000001', 'f0000045-0045-4000-8000-000000000045', 'Free Size', 'Purple', '#6A0DAD', 16, 'HF-SAR-045-PUR', true),
  ('f0010046-0001-4000-8000-000000000001', 'f0000046-0046-4000-8000-000000000046', 'Free Size', 'Sage Green', '#9CAF88', 29, 'HF-SAR-046-SAG', true),
  ('f0010047-0001-4000-8000-000000000001', 'f0000047-0047-4000-8000-000000000047', 'Free Size', 'Wine', '#722F37', 23, 'HF-SAR-047-WIN', true),
  ('f0010048-0001-4000-8000-000000000001', 'f0000048-0048-4000-8000-000000000048', 'Free Size', 'Silver', '#C0C0C0', 21, 'HF-SAR-048-SIL', true),
  ('f0010049-0001-4000-8000-000000000001', 'f0000049-0049-4000-8000-000000000049', 'Free Size', 'Ruby Red', '#E0115F', 27, 'HF-SAR-049-RUB', true),
  ('f0010050-0001-4000-8000-000000000001', 'f0000050-0050-4000-8000-000000000050', 'Free Size', 'Brown', '#8B4513', 40, 'HF-SAR-050-BRO', true),
  ('f0010051-0001-4000-8000-000000000001', 'f0000051-0051-4000-8000-000000000051', 'Free Size', 'Off White', '#FAF9F6', 19, 'HF-SAR-051-OFF', true),
  ('f0010052-0001-4000-8000-000000000001', 'f0000052-0052-4000-8000-000000000052', 'Free Size', 'Olive', '#808000', 25, 'HF-SAR-052-OLI', true),
  ('f0010053-0001-4000-8000-000000000001', 'f0000053-0053-4000-8000-000000000053', 'Free Size', 'Mint Green', '#98FF98', 18, 'HF-SAR-053-MIN', true),
  ('f0010054-0001-4000-8000-000000000001', 'f0000054-0054-4000-8000-000000000054', 'Free Size', 'Dual Tone', '#4682B4', 22, 'HF-SAR-054-DUA', true),
  ('f0010055-0001-4000-8000-000000000001', 'f0000055-0055-4000-8000-000000000055', 'Free Size', 'Copper', '#B87333', 20, 'HF-SAR-055-COP', true),
  ('f0010056-0001-4000-8000-000000000001', 'f0000056-0056-4000-8000-000000000056', 'Free Size', 'Mustard', '#FFDB58', 17, 'HF-SAR-056-MUS', true),
  ('f0010057-0001-4000-8000-000000000001', 'f0000057-0057-4000-8000-000000000057', 'Free Size', 'Coral Pink', '#FF7F50', 14, 'HF-SAR-057-COR', true),
  ('f0010058-0001-4000-8000-000000000001', 'f0000058-0058-4000-8000-000000000058', 'Free Size', 'White', '#FFFFFF', 38, 'HF-SAR-058-WHI', true),
  ('f0010059-0001-4000-8000-000000000001', 'f0000059-0059-4000-8000-000000000059', 'Free Size', 'Sky Blue', '#87CEEB', 16, 'HF-SAR-059-SKY', true),
  ('f0010060-0001-4000-8000-000000000001', 'f0000060-0060-4000-8000-000000000060', 'Free Size', 'Black Gold', '#1C1C1C', 13, 'HF-SAR-060-BLA', true),
  ('f0010061-0001-4000-8000-000000000001', 'f0000061-0061-4000-8000-000000000061', 'Free Size', 'Lemon', '#FFF44F', 31, 'HF-SAR-061-LEM', true),
  ('f0010062-0001-4000-8000-000000000001', 'f0000062-0062-4000-8000-000000000062', 'Free Size', 'Teal', '#008080', 19, 'HF-SAR-062-TEA', true),
  ('f0010063-0001-4000-8000-000000000001', 'f0000063-0063-4000-8000-000000000063', 'Free Size', 'Rust', '#B7410E', 24, 'HF-SAR-063-RUS', true),
  ('f0010064-0001-4000-8000-000000000001', 'f0000064-0064-4000-8000-000000000064', 'Free Size', 'Abstract', '#9370DB', 33, 'HF-SAR-064-ABS', true),
  ('f0010065-0001-4000-8000-000000000001', 'f0000065-0065-4000-8000-000000000065', 'Free Size', 'Lavender', '#E6E6FA', 15, 'HF-SAR-065-LAV', true),
  ('f0010066-0001-4000-8000-000000000001', 'f0000066-0066-4000-8000-000000000066', 'Free Size', 'Black', '#000000', 12, 'HF-SAR-066-BLA', true),
  ('f0010067-0001-4000-8000-000000000001', 'f0000067-0067-4000-8000-000000000067', 'Free Size', 'Peach', '#FFDAB9', 28, 'HF-SAR-067-PEA', true),
  ('f0010068-0001-4000-8000-000000000001', 'f0000068-0068-4000-8000-000000000068', 'Free Size', 'Royal Blue', '#4169E1', 17, 'HF-SAR-068-ROY', true),
  ('f0010069-0001-4000-8000-000000000001', 'f0000069-0069-4000-8000-000000000069', 'Free Size', 'Classic Red', '#DC143C', 18, 'HF-SAR-069-CLA', true),
  ('f0010070-0001-4000-8000-000000000001', 'f0000070-0070-4000-8000-000000000070', 'Free Size', 'Dusty Rose', '#DCAE96', 21, 'HF-SAR-070-DUS', true),
  ('f0010071-0001-4000-8000-000000000001', 'f0000071-0071-4000-8000-000000000071', 'Free Size', 'Midnight Blue', '#191970', 20, 'HF-SAR-071-MID', true),
  ('f0010072-0001-4000-8000-000000000001', 'f0000072-0072-4000-8000-000000000072', 'Free Size', 'Crimson', '#990000', 11, 'HF-SAR-072-CRI', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, sort_order) VALUES
  ('f0020035-0001-4000-8000-000000000001', 'f0000035-0035-4000-8000-000000000035', '/images/products/saree-03.jpg', 'Kanchipuram Silk Saree — Emerald Border', true, 0),
  ('f0020036-0001-4000-8000-000000000001', 'f0000036-0036-4000-8000-000000000036', '/images/products/saree-04.jpg', 'Banarasi Tissue Saree — Champagne Gold', true, 0),
  ('f0020037-0001-4000-8000-000000000001', 'f0000037-0037-4000-8000-000000000037', '/images/products/saree-05.jpg', 'Paithani Silk Saree — Peacock Green', true, 0),
  ('f0020038-0001-4000-8000-000000000001', 'f0000038-0038-4000-8000-000000000038', '/images/products/saree-06.jpg', 'Chiffon Saree — Blush Pink Ombre', true, 0),
  ('f0020039-0001-4000-8000-000000000001', 'f0000039-0039-4000-8000-000000000039', '/images/products/saree-07.jpg', 'Georgette Saree — Navy Blue Floral', true, 0),
  ('f0020040-0001-4000-8000-000000000001', 'f0000040-0040-4000-8000-000000000040', '/images/products/saree-08.jpg', 'Cotton Handloom Saree — Indigo Block Print', true, 0),
  ('f0020041-0001-4000-8000-000000000001', 'f0000041-0041-4000-8000-000000000041', '/images/products/saree-09.jpg', 'Tussar Silk Saree — Natural Beige', true, 0),
  ('f0020042-0001-4000-8000-000000000001', 'f0000042-0042-4000-8000-000000000042', '/images/products/saree-10.jpg', 'Organza Saree — Ivory Pearl Work', true, 0),
  ('f0020043-0001-4000-8000-000000000001', 'f0000043-0043-4000-8000-000000000043', '/images/products/saree-11.jpg', 'Bandhani Saree — Rajasthani Red', true, 0),
  ('f0020044-0001-4000-8000-000000000001', 'f0000044-0044-4000-8000-000000000044', '/images/products/saree-12.jpg', 'Kalamkari Saree — Temple Narrative', true, 0),
  ('f0020045-0001-4000-8000-000000000001', 'f0000045-0045-4000-8000-000000000045', '/images/products/saree-13.jpg', 'Mysore Silk Saree — Royal Purple', true, 0),
  ('f0020046-0001-4000-8000-000000000001', 'f0000046-0046-4000-8000-000000000046', '/images/products/saree-14.jpg', 'Linen Saree — Sage Green Stripe', true, 0),
  ('f0020047-0001-4000-8000-000000000001', 'f0000047-0047-4000-8000-000000000047', '/images/products/saree-15.jpg', 'Crepe Silk Saree — Wine Maroon', true, 0),
  ('f0020048-0001-4000-8000-000000000001', 'f0000048-0048-4000-8000-000000000048', '/images/products/saree-16.jpg', 'Net Saree — Silver Sequin', true, 0),
  ('f0020049-0001-4000-8000-000000000001', 'f0000049-0049-4000-8000-000000000049', '/images/products/saree-17.jpg', 'Satin Saree — Ruby Red', true, 0),
  ('f0020050-0001-4000-8000-000000000001', 'f0000050-0050-4000-8000-000000000050', '/images/products/saree-18.jpg', 'Khadi Saree — Earth Brown', true, 0),
  ('f0020051-0001-4000-8000-000000000001', 'f0000051-0051-4000-8000-000000000051', '/images/products/saree-19.jpg', 'Jamdani Saree — Off White Weave', true, 0),
  ('f0020052-0001-4000-8000-000000000001', 'f0000052-0052-4000-8000-000000000052', '/images/products/saree-20.jpg', 'Ikat Saree — Telia Rumal', true, 0),
  ('f0020053-0001-4000-8000-000000000001', 'f0000053-0053-4000-8000-000000000053', '/images/products/saree-21.jpg', 'Chanderi Silk Saree — Mint Green', true, 0),
  ('f0020054-0001-4000-8000-000000000001', 'f0000054-0054-4000-8000-000000000054', '/images/products/saree-22.jpg', 'Maheshwari Silk Saree — Dual Tone', true, 0),
  ('f0020055-0001-4000-8000-000000000001', 'f0000055-0055-4000-8000-000000000055', '/images/products/saree-23.jpg', 'Bhagalpuri Tussar — Copper Zari', true, 0),
  ('f0020056-0001-4000-8000-000000000001', 'f0000056-0056-4000-8000-000000000056', '/images/products/saree-24.jpg', 'Gadwal Cotton Silk — Mustard Yellow', true, 0),
  ('f0020057-0001-4000-8000-000000000001', 'f0000057-0057-4000-8000-000000000057', '/images/products/saree-25.jpg', 'Uppada Jamdani — Coral Pink', true, 0),
  ('f0020058-0001-4000-8000-000000000001', 'f0000058-0058-4000-8000-000000000058', '/images/products/saree-26.jpg', 'Mangalgiri Cotton — Classic White', true, 0),
  ('f0020059-0001-4000-8000-000000000001', 'f0000059-0059-4000-8000-000000000059', '/images/products/saree-27.jpg', 'Venkatagiri Silk — Sky Blue', true, 0),
  ('f0020060-0001-4000-8000-000000000001', 'f0000060-0060-4000-8000-000000000060', '/images/products/saree-28.jpg', 'Pochampally Ikat — Black & Gold', true, 0),
  ('f0020061-0001-4000-8000-000000000001', 'f0000061-0061-4000-8000-000000000061', '/images/products/saree-29.jpg', 'Kota Doria — Lemon Yellow', true, 0),
  ('f0020062-0001-4000-8000-000000000001', 'f0000062-0062-4000-8000-000000000062', '/images/products/saree-30.jpg', 'Banarasi Georgette — Teal Green', true, 0),
  ('f0020063-0001-4000-8000-000000000001', 'f0000063-0063-4000-8000-000000000063', '/images/products/saree-31.jpg', 'Silk Cotton Saree — Rust Orange', true, 0),
  ('f0020064-0001-4000-8000-000000000001', 'f0000064-0064-4000-8000-000000000064', '/images/products/saree-32.jpg', 'Digital Print Saree — Abstract Art', true, 0),
  ('f0020065-0001-4000-8000-000000000001', 'f0000065-0065-4000-8000-000000000065', '/images/products/saree-33.jpg', 'Embroidered Net — Pastel Lavender', true, 0),
  ('f0020066-0001-4000-8000-000000000001', 'f0000066-0066-4000-8000-000000000066', '/images/products/saree-34.jpg', 'Handwoven Silk — Classic Black', true, 0),
  ('f0020067-0001-4000-8000-000000000001', 'f0000067-0067-4000-8000-000000000067', '/images/products/saree-35.jpg', 'Floral Chiffon — Peach Blossom', true, 0),
  ('f0020068-0001-4000-8000-000000000001', 'f0000068-0068-4000-8000-000000000068', '/images/products/saree-36.jpg', 'Zari Work Saree — Royal Blue', true, 0),
  ('f0020069-0001-4000-8000-000000000001', 'f0000069-0069-4000-8000-000000000069', '/images/products/saree-37.jpg', 'Temple Border Saree — Classic Red', true, 0),
  ('f0020070-0001-4000-8000-000000000001', 'f0000070-0070-4000-8000-000000000070', '/images/products/saree-38.jpg', 'Soft Silk Saree — Dusty Rose', true, 0),
  ('f0020071-0001-4000-8000-000000000001', 'f0000071-0071-4000-8000-000000000071', '/images/products/saree-39.jpg', 'Party Wear Saree — Midnight Blue', true, 0),
  ('f0020072-0001-4000-8000-000000000001', 'f0000072-0072-4000-8000-000000000072', '/images/products/saree-40.jpg', 'Bridal Silk Saree — Crimson Red', true, 0)
ON CONFLICT (id) DO NOTHING;

UPDATE product_images SET image_url = '/images/products/saree-01.jpg', alt_text = 'Banarasi Silk Saree — Royal Maroon' WHERE product_id = 'f0000001-0001-4000-8000-000000000001' AND is_primary = true;
UPDATE product_images SET image_url = '/images/products/saree-02.jpg', alt_text = 'Kanjivaram Silk Saree — Temple Gold' WHERE product_id = 'f0000009-0009-4000-8000-000000000009' AND is_primary = true;

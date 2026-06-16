-- Point all demo images to local frontend static assets (/images/...)
-- Served by Vite from frontend/public/images/

UPDATE product_images SET image_url = '/images/products/banarasi-silk-saree.jpg'
WHERE product_id = 'f0000001-0001-4000-8000-000000000001';
UPDATE product_images SET image_url = '/images/products/floral-cotton-kurti.jpg'
WHERE product_id = 'f0000002-0002-4000-8000-000000000002';
UPDATE product_images SET image_url = '/images/products/indigo-block-print-dress.jpg'
WHERE product_id = 'f0000003-0003-4000-8000-000000000003';
UPDATE product_images SET image_url = '/images/products/silver-jhumka-earrings.jpg'
WHERE product_id = 'f0000004-0004-4000-8000-000000000004';
UPDATE product_images SET image_url = '/images/products/vitamin-c-serum.jpg'
WHERE product_id = 'f0000005-0005-4000-8000-000000000005';
UPDATE product_images SET image_url = '/images/products/tan-leather-tote.jpg'
WHERE product_id = 'f0000006-0006-4000-8000-000000000006';
UPDATE product_images SET image_url = '/images/products/embroidered-mojari.jpg'
WHERE product_id = 'f0000007-0007-4000-8000-000000000007';
UPDATE product_images SET image_url = '/images/products/pearl-hair-pins.jpg'
WHERE product_id = 'f0000008-0008-4000-8000-000000000008';
UPDATE product_images SET image_url = '/images/products/kanjivaram-silk-saree.jpg'
WHERE product_id = 'f0000009-0009-4000-8000-000000000009';
UPDATE product_images SET image_url = '/images/products/anarkali-kurta.jpg'
WHERE product_id = 'f0000010-0010-4000-8000-000000000010';
UPDATE product_images SET image_url = '/images/products/gold-necklace-set.jpg'
WHERE product_id = 'f0000011-0011-4000-8000-000000000011';
UPDATE product_images SET image_url = '/images/products/chiffon-dupatta.jpg'
WHERE product_id = 'f0000012-0012-4000-8000-000000000012';
UPDATE product_images SET image_url = '/images/products/face-moisturizer.jpg'
WHERE product_id = 'f0000013-0013-4000-8000-000000000013';
UPDATE product_images SET image_url = '/images/products/block-heel-sandals.jpg'
WHERE product_id = 'f0000014-0014-4000-8000-000000000014';

UPDATE banners SET image_url = '/images/banners/banner-saree-collection.jpg'
WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
UPDATE banners SET image_url = '/images/banners/banner-jewellery-fest.jpg'
WHERE id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
UPDATE banners SET image_url = '/images/banners/banner-new-arrivals.jpg'
WHERE id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

UPDATE categories SET image_url = '/images/categories/' || slug || '.jpg'
WHERE slug IN (
  'sarees-ethnic-wear', 'western-clothing', 'fine-jewellery', 'beauty-skincare',
  'bags-handbags', 'footwear', 'hair-accessories', 'scarves-dupattas',
  'watches-eyewear', 'fashion-accessories'
);

UPDATE order_items SET product_image = '/images/products/banarasi-silk-saree.jpg'
WHERE id = 'e0010001-0001-4000-8000-000000000001';
UPDATE order_items SET product_image = '/images/products/floral-cotton-kurti.jpg'
WHERE id = 'e0010002-0001-4000-8000-000000000001';
UPDATE order_items SET product_image = '/images/products/silver-jhumka-earrings.jpg'
WHERE id IN ('e0010002-0002-4000-8000-000000000002', 'e0010003-0001-4000-8000-000000000001');

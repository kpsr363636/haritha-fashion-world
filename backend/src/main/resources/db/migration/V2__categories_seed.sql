-- Top-level categories with correct GST rates
INSERT INTO categories (name, slug, gst_percent, sort_order, icon_name) VALUES
('Sarees & Ethnic Wear', 'sarees-ethnic-wear', 5.00, 1, 'ti-hanger'),
('Western Clothing', 'western-clothing', 12.00, 2, 'ti-shirt'),
('Fine Jewellery', 'fine-jewellery', 3.00, 3, 'ti-diamond'),
('Beauty & Skincare', 'beauty-skincare', 18.00, 4, 'ti-sparkles'),
('Bags & Handbags', 'bags-handbags', 18.00, 5, 'ti-briefcase'),
('Footwear', 'footwear', 5.00, 6, 'ti-shoe'),
('Hair Accessories', 'hair-accessories', 12.00, 7, 'ti-scissors'),
('Scarves & Dupattas', 'scarves-dupattas', 5.00, 8, 'ti-scarf'),
('Watches & Eyewear', 'watches-eyewear', 18.00, 9, 'ti-watch'),
('Fashion Accessories', 'fashion-accessories', 12.00, 10, 'ti-rosette');

-- Legal pages seed (placeholder content — expanded in V4)
INSERT INTO legal_pages (slug, title, content) VALUES
('privacy-policy', 'Privacy Policy', '<p>Privacy policy content will be updated shortly.</p>'),
('terms-and-conditions', 'Terms & Conditions', '<p>Terms and conditions content will be updated shortly.</p>'),
('return-policy', 'Return & Refund Policy', '<p>Return policy content will be updated shortly.</p>'),
('shipping-policy', 'Shipping Policy', '<p>Shipping policy content will be updated shortly.</p>'),
('seller-agreement', 'Seller Agreement', '<p>Seller agreement content will be updated shortly.</p>');

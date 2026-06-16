-- Update legal pages with complete HTML content

UPDATE legal_pages SET content = $html$
<div class="legal-content">
  <p><strong>Last updated:</strong> 15 June 2026</p>
  <p>Haritha Fashion World ("we", "us", "our") operates the website <a href="https://www.harithafashion.com">www.harithafashion.com</a> and the Haritha Fashion mobile application. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our platform or make a purchase.</p>

  <h2>1. Information We Collect</h2>
  <h3>1.1 Personal Information</h3>
  <p>We may collect the following personal information when you register, place an order, or contact us:</p>
  <ul>
    <li>Full name, email address, and mobile number</li>
    <li>Delivery and billing addresses (including pincode, city, and state)</li>
    <li>Payment information (processed securely via Razorpay — we do not store full card details)</li>
    <li>Government-issued ID details (for seller KYC verification only)</li>
    <li>Profile photograph (optional)</li>
  </ul>

  <h3>1.2 Automatically Collected Information</h3>
  <ul>
    <li>IP address, browser type, device identifiers, and operating system</li>
    <li>Pages visited, products viewed, search queries, and click behaviour</li>
    <li>Referral source and session duration via Google Analytics 4 and Meta Pixel</li>
    <li>Location data (approximate, based on IP or pincode entered)</li>
  </ul>

  <h3>1.3 Information from Third Parties</h3>
  <ul>
    <li>Google OAuth profile data (name, email, profile picture) when you sign in with Google</li>
    <li>Payment confirmation data from Razorpay</li>
    <li>Shipment tracking data from Shiprocket</li>
    <li>SMS/WhatsApp delivery status from MSG91</li>
  </ul>

  <h2>2. How We Use Your Information</h2>
  <p>We use collected information to:</p>
  <ul>
    <li>Process and fulfil your orders, including payment, shipping, and returns</li>
    <li>Send transactional communications (order confirmations, shipping updates, OTPs)</li>
    <li>Send marketing communications (with your consent) about sales, new arrivals, and price drops</li>
    <li>Manage your account, wishlist, loyalty points, and referral programme</li>
    <li>Detect and prevent fraud, abuse, and unauthorised transactions</li>
    <li>Improve our platform, product recommendations, and search relevance</li>
    <li>Comply with legal obligations including GST reporting and tax compliance</li>
    <li>Resolve customer support tickets and disputes</li>
  </ul>

  <h2>3. Sharing Your Information</h2>
  <p>We do not sell your personal data. We may share information with:</p>
  <ul>
    <li><strong>Sellers on our marketplace</strong> — only order fulfilment details (name, address, product ordered)</li>
    <li><strong>Payment processors</strong> — Razorpay for payment processing and refunds</li>
    <li><strong>Logistics partners</strong> — Shiprocket and courier partners for delivery and reverse pickup</li>
    <li><strong>Communication providers</strong> — AWS SES (email), MSG91 (SMS and WhatsApp)</li>
    <li><strong>Cloud infrastructure</strong> — AWS (S3, RDS, ElastiCache) hosted in ap-south-1 (Mumbai)</li>
    <li><strong>Legal authorities</strong> — when required by law, court order, or government request</li>
  </ul>

  <h2>4. Data Retention</h2>
  <p>We retain your account data for as long as your account is active. Order and transaction records are retained for 7 years to comply with Indian tax and accounting laws. OTP codes are stored in Redis with a 10-minute TTL and are never persisted to our database.</p>

  <h2>5. Cookies and Tracking</h2>
  <p>We use essential cookies for authentication and cart functionality. Analytics cookies (GA4, Meta Pixel) are used to understand user behaviour. You can disable non-essential cookies via your browser settings. Disabling cookies may affect certain features such as recently viewed products.</p>

  <h2>6. Your Rights</h2>
  <p>Under applicable Indian data protection laws, you have the right to:</p>
  <ul>
    <li>Access and receive a copy of your personal data</li>
    <li>Correct inaccurate or incomplete information via your Profile page</li>
    <li>Delete your account and associated data (subject to legal retention requirements)</li>
    <li>Opt out of marketing emails, SMS, and WhatsApp via Notification Preferences</li>
    <li>Withdraw consent for data processing where consent is the legal basis</li>
  </ul>
  <p>To exercise these rights, email us at <a href="mailto:privacy@harithafashion.com">privacy@harithafashion.com</a> or raise a support ticket on our platform.</p>

  <h2>7. Data Security</h2>
  <p>We implement industry-standard security measures including TLS encryption in transit, bcrypt password hashing, JWT-based authentication, rate limiting on OTP requests, and AWS security groups restricting database access. Despite our efforts, no method of transmission over the internet is 100% secure.</p>

  <h2>8. Children's Privacy</h2>
  <p>Our platform is not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors. If you believe we have collected data from a minor, contact us immediately.</p>

  <h2>9. Changes to This Policy</h2>
  <p>We may update this Privacy Policy from time to time. We will notify you of material changes via email or a prominent notice on our website. Continued use of the platform after changes constitutes acceptance.</p>

  <h2>10. Contact Us</h2>
  <p>
    <strong>Haritha Fashion World</strong><br>
    Email: <a href="mailto:privacy@harithafashion.com">privacy@harithafashion.com</a><br>
    Support: <a href="mailto:support@harithafashion.com">support@harithafashion.com</a><br>
    Grievance Officer: grievance@harithafashion.com
  </p>
</div>
$html$, updated_at = NOW()
WHERE slug = 'privacy-policy';

UPDATE legal_pages SET content = $html$
<div class="legal-content">
  <p><strong>Last updated:</strong> 15 June 2026</p>
  <p>Welcome to Haritha Fashion World. By accessing or using our website, mobile application, or services, you agree to be bound by these Terms and Conditions. Please read them carefully before making a purchase or registering as a seller.</p>

  <h2>1. Definitions</h2>
  <ul>
    <li><strong>"Platform"</strong> means the Haritha Fashion World website and mobile application.</li>
    <li><strong>"User" / "Customer"</strong> means any person who browses, registers, or purchases on the Platform.</li>
    <li><strong>"Seller"</strong> means a registered vendor who lists and sells products on the Platform.</li>
    <li><strong>"We" / "Us"</strong> means Haritha Fashion World, the marketplace operator.</li>
  </ul>

  <h2>2. Account Registration</h2>
  <ul>
    <li>You must provide accurate and complete information during registration.</li>
    <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
    <li>One mobile number may be associated with only one account.</li>
    <li>We reserve the right to suspend or terminate accounts that violate these terms or engage in fraudulent activity.</li>
    <li>Accounts with 5 or more failed login attempts will be temporarily locked for security.</li>
  </ul>

  <h2>3. Products and Pricing</h2>
  <ul>
    <li>All prices are listed in Indian Rupees (INR) and are inclusive of applicable GST unless stated otherwise.</li>
    <li>Product images are for illustrative purposes; actual colours may vary slightly due to screen settings.</li>
    <li>We and our Sellers reserve the right to change prices without prior notice. The price at the time of order placement is final.</li>
    <li>We strive to display accurate product information, but do not warrant that descriptions, fabric details, or sizes are error-free.</li>
    <li>Discounts, coupons, and promotional offers are subject to their specific terms and cannot be combined unless explicitly stated.</li>
  </ul>

  <h2>4. Orders and Payment</h2>
  <ul>
    <li>Placing an order constitutes an offer to purchase. Order confirmation via email/SMS constitutes acceptance.</li>
    <li>We accept UPI, credit/debit cards, net banking via Razorpay, and Cash on Delivery (COD) where available.</li>
    <li>COD orders require OTP verification at the time of delivery.</li>
    <li>We reserve the right to cancel orders suspected of fraud, with full refund where payment has been collected.</li>
    <li>Stock is reserved for 10 minutes upon adding to cart. Unpaid reservations expire automatically.</li>
  </ul>

  <h2>5. Shipping and Delivery</h2>
  <ul>
    <li>Delivery timelines are estimates and vary by pincode and courier partner.</li>
    <li>Free delivery is available on orders above ₹499 (subject to change).</li>
    <li>Risk of loss passes to you upon delivery to the address provided.</li>
    <li>Refer to our <a href="/legal/shipping-policy">Shipping Policy</a> for detailed information.</li>
  </ul>

  <h2>6. Returns and Refunds</h2>
  <ul>
    <li>Return eligibility depends on the product's returnable flag and return window (default 7 days from delivery).</li>
    <li>Items must be unused, unwashed, with original tags and packaging intact.</li>
    <li>Refunds are processed to the original payment method within 5-7 business days after return receipt.</li>
    <li>Refer to our <a href="/legal/return-policy">Return &amp; Refund Policy</a> for complete details.</li>
  </ul>

  <h2>7. Seller Terms</h2>
  <ul>
    <li>Sellers must comply with our <a href="/legal/seller-agreement">Seller Agreement</a> and applicable Indian laws.</li>
    <li>Sellers are responsible for product quality, accurate listings, and timely fulfilment.</li>
    <li>Haritha Fashion World charges a commission (default 10%) on each sale, deducted before seller payout.</li>
    <li>Seller payouts are processed monthly via Razorpay X for approved sellers with pending balance above ₹100.</li>
  </ul>

  <h2>8. Intellectual Property</h2>
  <p>All content on the Platform — including logos, text, graphics, images, and software — is owned by Haritha Fashion World or its licensors. You may not reproduce, distribute, or create derivative works without written permission. Seller-uploaded product images remain the property of the respective Seller, with a licence granted to us for display on the Platform.</p>

  <h2>9. User Conduct</h2>
  <p>You agree not to:</p>
  <ul>
    <li>Use the Platform for any unlawful purpose</li>
    <li>Post false, misleading, or defamatory reviews or product questions</li>
    <li>Attempt to gain unauthorised access to our systems or other users' accounts</li>
    <li>Use automated bots, scrapers, or scripts to access the Platform</li>
    <li>Manipulate prices, abuse coupon codes, or exploit referral programme loopholes</li>
    <li>Harass sellers, customer support staff, or other users</li>
  </ul>

  <h2>10. Limitation of Liability</h2>
  <p>To the maximum extent permitted by law, Haritha Fashion World shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the Platform. Our total liability for any claim shall not exceed the amount you paid for the specific order giving rise to the claim.</p>

  <h2>11. Dispute Resolution</h2>
  <p>These terms are governed by the laws of India. Any disputes shall first be attempted to be resolved through our support team. Unresolved disputes shall be subject to the exclusive jurisdiction of courts in Hyderabad, Telangana.</p>

  <h2>12. Contact</h2>
  <p>
    Email: <a href="mailto:legal@harithafashion.com">legal@harithafashion.com</a><br>
    Support: <a href="mailto:support@harithafashion.com">support@harithafashion.com</a>
  </p>
</div>
$html$, updated_at = NOW()
WHERE slug = 'terms-and-conditions';

UPDATE legal_pages SET content = $html$
<div class="legal-content">
  <p><strong>Last updated:</strong> 15 June 2026</p>
  <p>At Haritha Fashion World, we want you to love every purchase. If something isn't right, our hassle-free return and exchange policy ensures you can shop with confidence.</p>

  <h2>1. Return Eligibility</h2>
  <p>You may return or exchange a product if <strong>all</strong> of the following conditions are met:</p>
  <ul>
    <li>The product is marked as <strong>returnable</strong> on the product page</li>
    <li>The return request is initiated within the <strong>return window</strong> (default 7 days from delivery; some products may offer 14 or 30 days — check the product page)</li>
    <li>The item is <strong>unused, unwashed, and unworn</strong> with all original tags attached</li>
    <li>The item is in its <strong>original packaging</strong> with no damage to the product or packaging</li>
    <li>You have a valid <strong>proof of purchase</strong> (order number)</li>
  </ul>

  <h2>2. Non-Returnable Items</h2>
  <p>The following items cannot be returned or exchanged:</p>
  <ul>
    <li>Innerwear, lingerie, swimwear, and personal care products (hygiene reasons)</li>
    <li>Customised, altered, or made-to-order products</li>
    <li>Products marked "Final Sale" or "Non-Returnable" on the product page</li>
    <li>Gift cards and digital products</li>
    <li>Products with missing tags, damaged packaging, or signs of use</li>
    <li>Beauty and skincare products where the seal has been broken</li>
    <li>Heavy jewellery items that have been worn or resized</li>
  </ul>

  <h2>3. How to Initiate a Return</h2>
  <ol>
    <li>Go to <strong>My Orders</strong> and select the delivered order</li>
    <li>Click <strong>Return / Exchange</strong> on the eligible item</li>
    <li>Choose return type: <strong>Return for Refund</strong> or <strong>Exchange</strong></li>
    <li>Select a reason from the dropdown and add a description</li>
    <li>Upload up to 4 photos showing the product condition</li>
    <li>For exchanges, select the desired size and/or colour</li>
    <li>Submit the request — our team will review within 24 hours</li>
  </ol>

  <h2>4. Pickup and Reverse Logistics</h2>
  <ul>
    <li>Once approved, we schedule a <strong>free reverse pickup</strong> via Shiprocket at your delivery address</li>
    <li>Pack the item securely in its original packaging</li>
    <li>Hand over the package to the courier partner on the scheduled pickup date</li>
    <li>You will receive the reverse AWB number and tracking link via SMS/WhatsApp</li>
    <li>Pickup is attempted up to 2 times; failure to hand over may result in return cancellation</li>
  </ul>

  <h2>5. Refund Process</h2>
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:600px;">
    <thead>
      <tr><th>Payment Method</th><th>Refund Method</th><th>Timeline</th></tr>
    </thead>
    <tbody>
      <tr><td>UPI / Card / Net Banking</td><td>Original payment method via Razorpay</td><td>5-7 business days after item receipt</td></tr>
      <tr><td>Cash on Delivery</td><td>Bank transfer or gift card</td><td>5-7 business days after item receipt</td></tr>
      <tr><td>Gift Card</td><td>Re-credited to gift card balance</td><td>1-2 business days after item receipt</td></tr>
      <tr><td>Loyalty Points</td><td>Points re-credited to account</td><td>1-2 business days after item receipt</td></tr>
    </tbody>
  </table>
  <p>Refund amount = item price paid (excluding delivery charges, unless the return is due to our error or a defective product). Coupon discounts are adjusted proportionally.</p>

  <h2>6. Exchange Process</h2>
  <ul>
    <li>Exchanges are subject to availability of the requested size/colour</li>
    <li>If the exchange variant is unavailable, we offer a full refund instead</li>
    <li>Exchange orders are shipped at no additional delivery charge</li>
    <li>Only one exchange per order item is permitted</li>
    <li>Price difference (if exchange item costs more) must be paid; surplus is refunded if exchange item costs less</li>
  </ul>

  <h2>7. Defective or Wrong Items</h2>
  <p>If you receive a defective, damaged, or wrong item:</p>
  <ul>
    <li>Report within 48 hours of delivery with photos</li>
    <li>We arrange immediate reverse pickup at no cost</li>
    <li>Choose a full refund or free replacement — your preference</li>
    <li>Delivery charges are fully refunded for our errors</li>
  </ul>

  <h2>8. Cancellations</h2>
  <ul>
    <li>Orders can be cancelled before shipping (status: Placed or Confirmed)</li>
    <li>Full refund including delivery charges for pre-shipment cancellations</li>
    <li>COD orders cancelled before dispatch incur no charges</li>
    <li>Once shipped, cancellation is not possible — please initiate a return after delivery</li>
  </ul>

  <h2>9. Contact</h2>
  <p>For return-related queries: <a href="mailto:returns@harithafashion.com">returns@harithafashion.com</a> or raise a support ticket with category "Returns &amp; Refunds".</p>
</div>
$html$, updated_at = NOW()
WHERE slug = 'return-policy';

UPDATE legal_pages SET content = $html$
<div class="legal-content">
  <p><strong>Last updated:</strong> 15 June 2026</p>
  <p>Haritha Fashion World delivers across India through trusted courier partners. This policy outlines our shipping methods, timelines, charges, and tracking process.</p>

  <h2>1. Delivery Coverage</h2>
  <p>We deliver to all serviceable pincodes across India through our logistics partner <strong>Shiprocket</strong> and affiliated courier networks including Delhivery, BlueDart, XpressBees, Ecom Express, and India Post. Enter your pincode on any product page to check serviceability and estimated delivery time.</p>

  <h2>2. Shipping Charges</h2>
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:600px;">
    <thead>
      <tr><th>Order Value</th><th>Delivery Charge</th></tr>
    </thead>
    <tbody>
      <tr><td>Above ₹499</td><td><strong>FREE</strong> standard delivery</td></tr>
      <tr><td>₹299 – ₹499</td><td>₹49</td></tr>
      <tr><td>Below ₹299</td><td>₹79</td></tr>
    </tbody>
  </table>
  <p>Express delivery (1-3 business days) is available in select metros for an additional ₹99. Delivery charges are shown at checkout before payment.</p>

  <h2>3. Estimated Delivery Timelines</h2>
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:700px;">
    <thead>
      <tr><th>Region</th><th>Standard Delivery</th><th>Express Delivery</th></tr>
    </thead>
    <tbody>
      <tr><td>Metro cities (Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune)</td><td>3-5 business days</td><td>1-3 business days</td></tr>
      <tr><td>Tier 2 cities</td><td>5-7 business days</td><td>3-5 business days</td></tr>
      <tr><td>Tier 3 / remote areas</td><td>7-10 business days</td><td>Not available</td></tr>
      <tr><td>North-East &amp; J&amp;K</td><td>8-12 business days</td><td>Not available</td></tr>
    </tbody>
  </table>
  <p><em>Business days exclude Sundays and public holidays. Timelines begin after order confirmation and seller dispatch.</em></p>

  <h2>4. Order Processing</h2>
  <ol>
    <li><strong>Order Placed</strong> — You receive confirmation via email, SMS, and WhatsApp</li>
    <li><strong>Order Confirmed</strong> — Payment verified (or COD accepted); seller notified</li>
    <li><strong>Packed</strong> — Seller prepares and packs your item (1-2 business days)</li>
    <li><strong>Shipped</strong> — Handed to courier; AWB number and tracking link shared</li>
    <li><strong>Out for Delivery</strong> — Courier attempts delivery at your address</li>
    <li><strong>Delivered</strong> — Order complete; return window begins</li>
  </ol>

  <h2>5. Tracking Your Order</h2>
  <ul>
    <li>Track via <strong>My Orders</strong> on our website or app</li>
    <li>Click the AWB tracking link to track on the courier's website</li>
    <li>Receive SMS and WhatsApp updates at each shipping milestone</li>
    <li>Estimated delivery date is shown on the order tracking page</li>
  </ul>

  <h2>6. Cash on Delivery (COD)</h2>
  <ul>
    <li>COD is available on orders up to ₹5,000 in most serviceable pincodes</li>
    <li>A COD handling fee of ₹29 may apply on orders below ₹499</li>
    <li>Please keep exact change ready; couriers may not carry change above ₹500</li>
    <li>Verify your order with the 6-digit OTP sent to your registered mobile at delivery</li>
    <li>Refuse delivery if the package appears tampered — contact support immediately</li>
  </ul>

  <h2>7. Delivery Attempts</h2>
  <ul>
    <li>Couriers attempt delivery up to <strong>3 times</strong> over 5 business days</li>
    <li>If undeliverable, the package returns to the seller and a refund is initiated</li>
    <li>Ensure someone is available at the delivery address or provide an alternate contact number</li>
    <li>For gated communities and offices, please share access instructions in the address</li>
  </ul>

  <h2>8. Multi-Seller Orders</h2>
  <p>Orders containing items from multiple sellers may arrive in separate packages with different tracking numbers. Each package is shipped independently as the respective seller dispatches. You are not charged extra delivery fees for split shipments.</p>

  <h2>9. Delays and Force Majeure</h2>
  <p>While we strive to meet estimated timelines, delays may occur due to weather conditions, festivals, courier capacity, or government restrictions. We will proactively notify you of significant delays and offer the option to cancel with a full refund.</p>

  <h2>10. Contact</h2>
  <p>Shipping queries: <a href="mailto:shipping@harithafashion.com">shipping@harithafashion.com</a> or WhatsApp us at your order tracking page.</p>
</div>
$html$, updated_at = NOW()
WHERE slug = 'shipping-policy';

UPDATE legal_pages SET content = $html$
<div class="legal-content">
  <p><strong>Last updated:</strong> 15 June 2026</p>
  <p>This Seller Agreement ("Agreement") governs the relationship between Haritha Fashion World ("Platform", "we", "us") and you ("Seller", "you") when you register as a seller on our marketplace. By registering and listing products, you agree to all terms below.</p>

  <h2>1. Seller Registration and KYC</h2>
  <ul>
    <li>You must be a legally registered business entity or individual sole proprietor operating in India</li>
    <li>Provide accurate business name, GST number (if applicable), PAN number, and bank account details</li>
    <li>Complete KYC verification including identity proof and address proof</li>
    <li>Bank account must be in the name of the registered business or sole proprietor</li>
    <li>We verify details via Razorpay X fund account creation; payouts are only processed to verified accounts</li>
    <li>We reserve the right to reject applications that fail KYC or do not meet our quality standards</li>
  </ul>

  <h2>2. Product Listings</h2>
  <ul>
    <li>All product information must be accurate — including fabric, size, colour, care instructions, and country of origin</li>
    <li>Product images must be original or licensed; no watermarked images from other platforms</li>
    <li>HSN codes and GST percentages must be correctly assigned per Indian tax regulations</li>
    <li>MRP must not exceed the maximum retail price printed on the product (where applicable)</li>
    <li>Prohibited items (counterfeit goods, banned substances, weapons, adult content) are strictly forbidden</li>
    <li>We reserve the right to delist products that violate our quality guidelines or receive consistent negative reviews</li>
  </ul>

  <h2>3. Pricing and Commission</h2>
  <ul>
    <li>Sellers set their own selling price; the Platform displays the final customer price inclusive of GST</li>
    <li>Haritha Fashion World charges a <strong>commission of 10%</strong> on the item sale price (configurable per seller category)</li>
    <li>Commission is calculated on the pre-GST selling price and deducted before payout</li>
    <li>Payment gateway charges (approximately 2%) are borne by the Platform for standard payment methods</li>
    <li>COD orders: commission is deducted upon successful delivery and payment collection</li>
  </ul>

  <h2>4. Order Fulfilment</h2>
  <ul>
    <li>Orders must be <strong>packed within 2 business days</strong> of order confirmation</li>
    <li>Ship via Platform-generated Shiprocket labels — do not use personal courier accounts</li>
    <li>Ensure correct item, size, colour, and quantity are packed with proper packaging to prevent damage</li>
    <li>Include a packing slip with order number inside the package</li>
    <li>Mark orders as "Packed" and "Shipped" in the Seller Portal within the stipulated timelines</li>
    <li>Failure to dispatch within 3 business days may result in automatic cancellation and penalty</li>
    <li>Maintain a fulfilment rate of at least 95% to remain in good standing</li>
  </ul>

  <h2>5. Inventory Management</h2>
  <ul>
    <li>Keep stock quantities accurate and updated in real time</li>
    <li>Delist or mark out-of-stock items promptly to avoid order cancellations</li>
    <li>The Platform reserves stock for 10 minutes when a customer adds to cart — do not manually override reservations</li>
    <li>Repeated stock-related cancellations (more than 5% of orders) may result in account suspension</li>
  </ul>

  <h2>6. Returns and Seller Responsibilities</h2>
  <ul>
    <li>Sellers must accept returns for returnable products within the specified return window</li>
    <li>Returned items are shipped back to the seller's registered pickup address via reverse logistics</li>
    <li>Inspect returned items within 48 hours of receipt and report disputes to the Platform</li>
    <li>Refund amount (seller's portion) is deducted from pending payout upon return approval</li>
    <li>Sellers are responsible for the quality of products — high return rates (above 15%) trigger a quality review</li>
    <li>Defective or misrepresented products: full refund including forward and reverse shipping costs borne by seller</li>
  </ul>

  <h2>7. Payouts</h2>
  <ul>
    <li>Seller payouts are processed on the <strong>1st of each month</strong> for the previous month's delivered orders</li>
    <li>Minimum payout threshold: ₹100 pending balance</li>
    <li>Payout = (Item sale price − Commission − Returns/refunds) for all delivered and non-disputed orders</li>
    <li>Payouts are transferred via Razorpay X NEFT to the verified bank account</li>
    <li>Payout confirmation is sent via email; view payout history in the Seller Portal</li>
    <li>Disputed orders are held from payout until resolution</li>
  </ul>

  <h2>8. Seller Performance Metrics</h2>
  <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;max-width:700px;">
    <thead>
      <tr><th>Metric</th><th>Target</th><th>Action if Below Target</th></tr>
    </thead>
    <tbody>
      <tr><td>Fulfilment Rate</td><td>≥ 95%</td><td>Warning → Suspension after 30 days</td></tr>
      <tr><td>Return Rate</td><td>≤ 15%</td><td>Quality review → Delisting repeat offenders</td></tr>
      <tr><td>Response Time (Q&amp;A)</td><td>≤ 24 hours</td><td>Reduced visibility in search results</td></tr>
      <tr><td>Average Rating</td><td>≥ 3.5 stars</td><td>Below 3.0: account review and possible suspension</td></tr>
      <tr><td>Dispatch Time</td><td>≤ 2 business days</td><td>Penalty on late dispatches after 3 warnings</td></tr>
    </tbody>
  </table>

  <h2>9. Intellectual Property</h2>
  <ul>
    <li>Sellers retain ownership of their product images and descriptions</li>
    <li>By listing on the Platform, you grant us a non-exclusive, royalty-free licence to display, promote, and distribute your content</li>
    <li>You warrant that your listings do not infringe any third-party intellectual property rights</li>
    <li>We may feature seller products in marketing campaigns, emails, and social media with attribution</li>
  </ul>

  <h2>10. Account Suspension and Termination</h2>
  <p>We may suspend or terminate your seller account for:</p>
  <ul>
    <li>Repeated failure to meet fulfilment or quality standards</li>
    <li>Listing prohibited, counterfeit, or misrepresented products</li>
    <li>Fraudulent activity or manipulation of reviews/ratings</li>
    <li>Violation of Indian consumer protection or e-commerce laws</li>
    <li>Non-compliance with GST filing or tax obligations</li>
  </ul>
  <p>Upon termination, pending payouts for delivered orders (minus returns and penalties) will be processed in the next payout cycle. You must fulfil all pending orders before account closure.</p>

  <h2>11. Liability</h2>
  <p>Sellers are solely responsible for the products they list, including product safety, labelling, and regulatory compliance. The Platform acts as a marketplace intermediary and is not the seller of record. Sellers indemnify the Platform against claims arising from their products or conduct.</p>

  <h2>12. Amendments</h2>
  <p>We may update this Agreement with 15 days' notice via email. Continued listing after the notice period constitutes acceptance. Material changes to commission rates require explicit seller consent.</p>

  <h2>13. Contact</h2>
  <p>
    Seller Support: <a href="mailto:sellers@harithafashion.com">sellers@harithafashion.com</a><br>
    Onboarding: <a href="mailto:onboarding@harithafashion.com">onboarding@harithafashion.com</a><br>
    Payout Queries: <a href="mailto:payouts@harithafashion.com">payouts@harithafashion.com</a>
  </p>
</div>
$html$, updated_at = NOW()
WHERE slug = 'seller-agreement';

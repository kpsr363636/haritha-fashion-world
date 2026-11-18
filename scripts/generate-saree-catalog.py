#!/usr/bin/env python3
"""Generate V11 saree catalog migration + download script."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MIGRATION = ROOT / "backend/src/main/resources/db/migration/V11__saree_catalog.sql"
DOWNLOAD = ROOT / "scripts/download-saree-images.sh"

PEXELS_IDS = [
    2679416, 1183266, 1536619, 1598505, 2681751, 2739792, 2892637, 2915289,
    3052361, 3222145, 3259340, 1181396, 1036623, 169190, 1005638, 242236,
    769579, 1926769, 1450363, 1462637, 1570807, 1040945, 1126993, 996512,
    267391, 2983468, 336372, 985635, 1542090, 996329, 298863, 1478442,
    1464625, 6474485, 9857007, 1191531, 3787923, 1152077, 3998379, 4041392,
]

SAREE_NAMES = [
    ("Banarasi Silk Saree — Royal Maroon", "banarasi-silk-saree-royal-maroon", "Silk", "Wedding", 2499, 4999, 50, True, 120, 4.70, 45, "f0000001-0001-4000-8000-000000000001", True),
    ("Kanjivaram Silk Saree — Temple Gold", "kanjivaram-silk-saree-temple-gold", "Silk", "Wedding", 3499, 6999, 50, True, 95, 4.85, 38, "f0000009-0009-4000-8000-000000000009", True),
    ("Kanchipuram Silk Saree — Emerald Border", "kanchipuram-silk-saree-emerald-border", "Silk", "Wedding", 3299, 6499, 49, True, 88, 4.78, 41, None, False),
    ("Banarasi Tissue Saree — Champagne Gold", "banarasi-tissue-saree-champagne-gold", "Tissue Silk", "Reception", 2799, 5499, 49, True, 76, 4.72, 33, None, False),
    ("Paithani Silk Saree — Peacock Green", "paithani-silk-saree-peacock-green", "Silk", "Festive", 3999, 7999, 50, True, 64, 4.81, 29, None, False),
    ("Chiffon Saree — Blush Pink Ombre", "chiffon-saree-blush-pink-ombre", "Chiffon", "Party", 1299, 2199, 41, False, 102, 4.55, 27, None, False),
    ("Georgette Saree — Navy Blue Floral", "georgette-saree-navy-blue-floral", "Georgette", "Party", 1499, 2499, 40, True, 91, 4.58, 24, None, False),
    ("Cotton Handloom Saree — Indigo Block Print", "cotton-handloom-saree-indigo-block-print", "Cotton", "Daily", 899, 1499, 40, False, 115, 4.46, 31, None, False),
    ("Tussar Silk Saree — Natural Beige", "tussar-silk-saree-natural-beige", "Tussar Silk", "Work", 1899, 3199, 41, False, 58, 4.52, 19, None, False),
    ("Organza Saree — Ivory Pearl Work", "organza-saree-ivory-pearl-work", "Organza", "Wedding", 2199, 3999, 45, True, 72, 4.74, 36, None, False),
    ("Bandhani Saree — Rajasthani Red", "bandhani-saree-rajasthani-red", "Cotton Silk", "Festive", 1199, 1999, 40, True, 83, 4.61, 22, None, False),
    ("Kalamkari Saree — Temple Narrative", "kalamkari-saree-temple-narrative", "Cotton", "Festive", 1599, 2699, 41, False, 67, 4.57, 18, None, False),
    ("Mysore Silk Saree — Royal Purple", "mysore-silk-saree-royal-purple", "Silk", "Wedding", 2999, 5999, 50, True, 54, 4.79, 26, None, False),
    ("Linen Saree — Sage Green Stripe", "linen-saree-sage-green-stripe", "Linen", "Casual", 1099, 1799, 39, False, 94, 4.44, 21, None, False),
    ("Crepe Silk Saree — Wine Maroon", "crepe-silk-saree-wine-maroon", "Crepe Silk", "Party", 1699, 2899, 41, False, 61, 4.53, 17, None, False),
    ("Net Saree — Silver Sequin", "net-saree-silver-sequin", "Net", "Party", 1999, 3499, 43, True, 79, 4.66, 28, None, False),
    ("Satin Saree — Ruby Red", "satin-saree-ruby-red", "Satin", "Reception", 1399, 2299, 39, False, 86, 4.49, 23, None, False),
    ("Khadi Saree — Earth Brown", "khadi-saree-earth-brown", "Khadi", "Daily", 799, 1299, 38, False, 108, 4.41, 20, None, False),
    ("Jamdani Saree — Off White Weave", "jamdani-saree-off-white-weave", "Cotton", "Festive", 1799, 2999, 40, True, 49, 4.62, 16, None, False),
    ("Ikat Saree — Telia Rumal", "ikat-saree-telia-rumal", "Cotton Silk", "Festive", 1499, 2499, 40, False, 57, 4.56, 15, None, False),
    ("Chanderi Silk Saree — Mint Green", "chanderi-silk-saree-mint-green", "Chanderi", "Party", 2099, 3599, 42, True, 63, 4.68, 19, None, False),
    ("Maheshwari Silk Saree — Dual Tone", "maheshwari-silk-saree-dual-tone", "Silk Cotton", "Work", 1299, 2199, 41, False, 71, 4.50, 14, None, False),
    ("Bhagalpuri Tussar — Copper Zari", "bhagalpuri-tussar-copper-zari", "Tussar", "Festive", 1699, 2799, 39, False, 52, 4.59, 13, None, False),
    ("Gadwal Cotton Silk — Mustard Yellow", "gadwal-cotton-silk-mustard-yellow", "Cotton Silk", "Festive", 1899, 3099, 39, False, 46, 4.54, 12, None, False),
    ("Uppada Jamdani — Coral Pink", "uppada-jamdani-coral-pink", "Silk", "Wedding", 3599, 6999, 49, True, 41, 4.77, 11, None, False),
    ("Mangalgiri Cotton — Classic White", "mangalgiri-cotton-classic-white", "Cotton", "Daily", 699, 1199, 42, False, 99, 4.43, 18, None, False),
    ("Venkatagiri Silk — Sky Blue", "venkatagiri-silk-sky-blue", "Silk", "Party", 2399, 4199, 43, True, 44, 4.65, 10, None, False),
    ("Pochampally Ikat — Black & Gold", "pochampally-ikat-black-gold", "Silk", "Festive", 2599, 4499, 42, True, 38, 4.71, 9, None, False),
    ("Kota Doria — Lemon Yellow", "kota-doria-lemon-yellow", "Cotton", "Summer", 999, 1699, 41, False, 87, 4.47, 16, None, False),
    ("Banarasi Georgette — Teal Green", "banarasi-georgette-teal-green", "Georgette", "Reception", 2499, 4299, 42, True, 55, 4.69, 14, None, False),
    ("Silk Cotton Saree — Rust Orange", "silk-cotton-saree-rust-orange", "Silk Cotton", "Festive", 1399, 2299, 39, False, 62, 4.51, 11, None, False),
    ("Digital Print Saree — Abstract Art", "digital-print-saree-abstract-art", "Georgette", "Party", 999, 1699, 41, False, 78, 4.48, 13, None, False),
    ("Embroidered Net — Pastel Lavender", "embroidered-net-pastel-lavender", "Net", "Reception", 2299, 3899, 41, True, 47, 4.64, 10, None, False),
    ("Handwoven Silk — Classic Black", "handwoven-silk-classic-black", "Silk", "Wedding", 3199, 6299, 49, True, 36, 4.76, 8, None, False),
    ("Floral Chiffon — Peach Blossom", "floral-chiffon-peach-blossom", "Chiffon", "Party", 1199, 1999, 40, False, 69, 4.52, 12, None, False),
    ("Zari Work Saree — Royal Blue", "zari-work-saree-royal-blue", "Silk", "Wedding", 2899, 5499, 47, True, 51, 4.73, 15, None, False),
    ("Temple Border Saree — Classic Red", "temple-border-saree-classic-red", "Silk", "Festive", 2699, 4999, 46, True, 43, 4.67, 11, None, False),
    ("Soft Silk Saree — Dusty Rose", "soft-silk-saree-dusty-rose", "Silk", "Party", 1799, 2999, 40, False, 58, 4.58, 10, None, False),
    ("Party Wear Saree — Midnight Blue", "party-wear-saree-midnight-blue", "Georgette", "Party", 1599, 2699, 41, False, 65, 4.55, 9, None, False),
    ("Bridal Silk Saree — Crimson Red", "bridal-silk-saree-crimson-red", "Silk", "Wedding", 4499, 8999, 50, True, 92, 4.82, 34, None, False),
]

COLORS = [
    ("Maroon", "#800020", 25), ("Gold", "#FFD700", 20), ("Emerald", "#50C878", 22),
    ("Champagne", "#F7E7CE", 18), ("Peacock Green", "#006A4E", 15), ("Blush Pink", "#FFB6C1", 30),
    ("Navy Blue", "#000080", 28), ("Indigo", "#3F51B5", 35), ("Beige", "#F5F5DC", 24),
    ("Ivory", "#FFFFF0", 20), ("Red", "#C41E3A", 32), ("Multicolor", "#FF6347", 26),
    ("Purple", "#6A0DAD", 16), ("Sage Green", "#9CAF88", 29), ("Wine", "#722F37", 23),
    ("Silver", "#C0C0C0", 21), ("Ruby Red", "#E0115F", 27), ("Brown", "#8B4513", 40),
    ("Off White", "#FAF9F6", 19), ("Olive", "#808000", 25), ("Mint Green", "#98FF98", 18),
    ("Dual Tone", "#4682B4", 22), ("Copper", "#B87333", 20), ("Mustard", "#FFDB58", 17),
    ("Coral Pink", "#FF7F50", 14), ("White", "#FFFFFF", 38), ("Sky Blue", "#87CEEB", 16),
    ("Black Gold", "#1C1C1C", 13), ("Lemon", "#FFF44F", 31), ("Teal", "#008080", 19),
    ("Rust", "#B7410E", 24), ("Abstract", "#9370DB", 33), ("Lavender", "#E6E6FA", 15),
    ("Black", "#000000", 12), ("Peach", "#FFDAB9", 28), ("Royal Blue", "#4169E1", 17),
    ("Classic Red", "#DC143C", 18), ("Dusty Rose", "#DCAE96", 21), ("Midnight Blue", "#191970", 20),
    ("Crimson", "#990000", 11),
]

assert len(SAREE_NAMES) == 40 and len(PEXELS_IDS) == 40 and len(COLORS) == 40

lines = [
    "-- V11: Sarees & Ethnic Wear — 40 saree-only catalog with real image paths",
    "-- Safe to re-run: fixed UUIDs + ON CONFLICT DO NOTHING",
    "",
    "UPDATE categories SET description = 'Premium silk, cotton & designer sarees for every occasion'",
    "WHERE slug = 'sarees-ethnic-wear';",
    "",
    "-- Move non-saree items out of this category",
    "UPDATE products SET category_id = c.id",
    "FROM categories c",
    "WHERE c.slug = 'western-clothing'",
    "  AND products.slug IN (",
    "    'floral-cotton-kurti-set',",
    "    'anarkali-kurta-emerald-green',",
    "    'designer-lehenga-choli-blush-pink',",
    "    'cotton-palazzo-set-ivory'",
    "  );",
    "",
]

product_inserts = []
variant_inserts = []
image_inserts = []
image_updates = []
new_idx = 35

for i, (row, (color, hex_c, stock)) in enumerate(zip(SAREE_NAMES, COLORS), start=1):
    name, slug, fabric, occasion, price, mrp, disc, featured, sold, rating, reviews, pid, _ = row
    img_url = f"/images/products/saree-{i:02d}.jpg"
    esc = name.replace("'", "''")

    if pid:
        image_updates.append(
            f"UPDATE product_images SET image_url = '{img_url}', alt_text = '{esc}' "
            f"WHERE product_id = '{pid}' AND is_primary = true;"
        )
    else:
        num = new_idx
        new_idx += 1
        pid = f"f00000{num:02d}-{num:04d}-4000-8000-0000000000{num:02d}"
        var_id = f"f00100{num:02d}-0001-4000-8000-000000000001"
        img_id = f"f00200{num:02d}-0001-4000-8000-000000000001"
        sku = f"HF-SAR-{num:03d}-{color[:3].upper().replace(' ', '')}"
        product_inserts.append(
            f"INSERT INTO products (id, seller_id, category_id, name, slug, description, fabric, occasion, "
            f"base_price, mrp, discount_percent, gst_percent, status, is_featured, is_cod_available, total_sold, avg_rating, review_count)\n"
            f"SELECT '{pid}'::uuid, '44444444-4444-4444-8444-444444444444'::uuid, c.id,\n"
            f"  '{esc}', '{slug}',\n"
            f"  'Handpicked {fabric.lower()} saree — elegant drape, rich finish, perfect for {occasion.lower()}.',\n"
            f"  '{fabric}', '{occasion}', {price}.00, {mrp}.00, {disc}.00, 5.00, 'ACTIVE', "
            f"{'true' if featured else 'false'}, true, {sold}, {rating}, {reviews}\n"
            f"FROM categories c WHERE c.slug = 'sarees-ethnic-wear' ON CONFLICT (id) DO NOTHING;"
        )
        variant_inserts.append(
            f"  ('{var_id}', '{pid}', 'Free Size', '{color}', '{hex_c}', {stock}, '{sku}', true)"
        )
        image_inserts.append(
            f"  ('{img_id}', '{pid}', '{img_url}', '{esc}', true, 0)"
        )

lines.extend(product_inserts)
lines.append("")
if variant_inserts:
    lines.append("INSERT INTO product_variants (id, product_id, size, color, color_hex, stock_quantity, sku, is_active) VALUES")
    lines.append(",\n".join(variant_inserts))
    lines.append("ON CONFLICT (id) DO NOTHING;")
    lines.append("")
if image_inserts:
    lines.append("INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, sort_order) VALUES")
    lines.append(",\n".join(image_inserts))
    lines.append("ON CONFLICT (id) DO NOTHING;")
    lines.append("")
lines.extend(image_updates)

MIGRATION.write_text("\n".join(lines) + "\n")

download_lines = [
    "#!/usr/bin/env bash",
    "# Download 40 saree product images (Pexels) for Sarees & Ethnic Wear category",
    "set -euo pipefail",
    'ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"',
    'OUT="$ROOT/frontend/public/images/products"',
    'mkdir -p "$OUT"',
    'FORCE=false',
    '[[ "${1:-}" == "--force" ]] && FORCE=true',
    "",
    "p() { echo \"https://images.pexels.com/photos/$1/pexels-photo-$1.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop\"; }",
    "",
    "download() {",
    '  local url="$1" out="$2"',
    '  if [[ "$FORCE" != true && -f "$out" && -s "$out" ]]; then echo "  skip: $(basename "$out")"; return 0; fi',
    '  echo "  download: $(basename "$out")"',
    '  curl -fsSL "$url" -o "$out" || { echo "  WARN: failed $(basename "$out")"; return 1; }',
    "}",
    "",
    'echo "Downloading 40 saree images..."',
]
for i, pid in enumerate(PEXELS_IDS, start=1):
    download_lines.append(f'download "$(p {pid})" "$OUT/saree-{i:02d}.jpg"')
download_lines.extend(["", 'echo "Done. 40 saree images ready."'])

DOWNLOAD.write_text("\n".join(download_lines) + "\n")
print(f"Wrote {MIGRATION}")
print(f"Wrote {DOWNLOAD}")

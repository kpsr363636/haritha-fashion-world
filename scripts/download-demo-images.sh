#!/usr/bin/env bash
# Download real fashion demo images into frontend/public/images/
# Sources: Pexels (free to use) — category-appropriate photos per product/category.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMG="$ROOT/frontend/public/images"
PRODUCTS="$IMG/products"
BANNERS="$IMG/banners"
CATEGORIES="$IMG/categories"

FORCE=false
[[ "${1:-}" == "--force" ]] && FORCE=true

mkdir -p "$PRODUCTS" "$BANNERS" "$CATEGORIES"

# Pexels CDN helper: photo ID, width, height
p() {
  local id="$1" w="$2" h="$3"
  echo "https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop"
}

FAILED=0

download() {
  local url="$1"
  local out="$2"
  if [[ "$FORCE" != true && -f "$out" && -s "$out" ]]; then
    echo "  skip (exists): $(basename "$out")"
    return 0
  fi
  echo "  download: $(basename "$out")"
  if curl -fsSL "$url" -o "$out"; then
    return 0
  fi
  echo "  WARN: failed $(basename "$out")"
  FAILED=$((FAILED + 1))
  return 0
}

echo "Downloading product images (Pexels — real fashion photos)..."
download "$(p 2679416 800 1000)" "$PRODUCTS/banarasi-silk-saree.jpg"
download "$(p 1598505 800 1000)" "$PRODUCTS/floral-cotton-kurti.jpg"
download "$(p 985635 800 1000)" "$PRODUCTS/indigo-block-print-dress.jpg"
download "$(p 1191531 800 1000)" "$PRODUCTS/silver-jhumka-earrings.jpg"
download "$(p 3787923 800 1000)" "$PRODUCTS/vitamin-c-serum.jpg"
download "$(p 1152077 800 1000)" "$PRODUCTS/tan-leather-tote.jpg"
download "$(p 6474485 800 1000)" "$PRODUCTS/embroidered-mojari.jpg"
download "$(p 3998379 800 1000)" "$PRODUCTS/pearl-hair-pins.jpg"
download "$(p 1183266 800 1000)" "$PRODUCTS/kanjivaram-silk-saree.jpg"
download "$(p 1536619 800 1000)" "$PRODUCTS/anarkali-kurta.jpg"
download "$(p 9857007 800 1000)" "$PRODUCTS/gold-necklace-set.jpg"
download "$(p 1926769 800 1000)" "$PRODUCTS/chiffon-dupatta.jpg"
download "$(p 4041392 800 1000)" "$PRODUCTS/face-moisturizer.jpg"
download "$(p 2983468 800 1000)" "$PRODUCTS/block-heel-sandals.jpg"
download "$(p 2679416 800 1000)" "$PRODUCTS/lehenga-choli.jpg"
download "$(p 1598505 800 1000)" "$PRODUCTS/palazzo-set.jpg"
download "$(p 1542090 800 1000)" "$PRODUCTS/wide-leg-jeans.jpg"
download "$(p 769579 800 1000)" "$PRODUCTS/linen-coord.jpg"
download "$(p 985635 800 1000)" "$PRODUCTS/wrap-top.jpg"
download "$(p 1191531 800 1000)" "$PRODUCTS/kundan-choker.jpg"
download "$(p 3787923 800 1000)" "$PRODUCTS/rose-toner.jpg"
download "$(p 1152077 800 1000)" "$PRODUCTS/sling-bag.jpg"
download "$(p 996329 800 1000)" "$PRODUCTS/clutch.jpg"
download "$(p 336372 800 1000)" "$PRODUCTS/kolhapuri.jpg"
download "$(p 3998379 800 1000)" "$PRODUCTS/scrunchie-set.jpg"
download "$(p 9857007 800 1000)" "$PRODUCTS/maang-tikka.jpg"
download "$(p 1926769 800 1000)" "$PRODUCTS/silk-stole.jpg"
download "$(p 1183266 800 1000)" "$PRODUCTS/bandhani-dupatta.jpg"
download "$(p 997910 800 1000)" "$PRODUCTS/rose-gold-watch.jpg"
download "$(p 1464625 800 1000)" "$PRODUCTS/cat-eye-sunglasses.jpg"
download "$(p 1478442 800 1000)" "$PRODUCTS/blue-light-glasses.jpg"
download "$(p 996329 800 1000)" "$PRODUCTS/statement-belt.jpg"
download "$(p 9857007 800 1000)" "$PRODUCTS/bracelet-set.jpg"
download "$(p 996329 800 1000)" "$PRODUCTS/scarf-ring.jpg"

echo "Downloading banner images..."
download "$(p 2679416 1400 500)" "$BANNERS/banner-saree-collection.jpg"
download "$(p 1191531 1400 500)" "$BANNERS/banner-jewellery-fest.jpg"
download "$(p 985635 1400 500)" "$BANNERS/banner-new-arrivals.jpg"
download "$(p 769579 1400 500)" "$BANNERS/banner-western-edit.jpg"
download "$(p 3787923 1400 500)" "$BANNERS/banner-beauty.jpg"

echo "Downloading category images..."
download "$(p 2679416 600 600)" "$CATEGORIES/sarees-ethnic-wear.jpg"
download "$(p 985635 600 600)" "$CATEGORIES/western-clothing.jpg"
download "$(p 1191531 600 600)" "$CATEGORIES/fine-jewellery.jpg"
download "$(p 3787923 600 600)" "$CATEGORIES/beauty-skincare.jpg"
download "$(p 1152077 600 600)" "$CATEGORIES/bags-handbags.jpg"
download "$(p 6474485 600 600)" "$CATEGORIES/footwear.jpg"
download "$(p 3998379 600 600)" "$CATEGORIES/hair-accessories.jpg"
download "$(p 1926769 600 600)" "$CATEGORIES/scarves-dupattas.jpg"
download "$(p 997910 600 600)" "$CATEGORIES/watches-eyewear.jpg"
download "$(p 996329 600 600)" "$CATEGORIES/fashion-accessories.jpg"

count="$(find "$IMG" -type f \( -name '*.jpg' -o -name '*.svg' \) | wc -l | tr -d ' ')"
echo "Done. ${count} image files under frontend/public/images/"
if [[ "$FAILED" -gt 0 ]]; then
  echo "WARNING: ${FAILED} download(s) failed."
  exit 1
fi

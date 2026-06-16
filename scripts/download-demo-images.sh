#!/usr/bin/env bash
# Download demo product & banner images into frontend/public/images/
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMG="$ROOT/frontend/public/images"
PRODUCTS="$IMG/products"
BANNERS="$IMG/banners"
CATEGORIES="$IMG/categories"

mkdir -p "$PRODUCTS" "$BANNERS" "$CATEGORIES"

download() {
  local url="$1"
  local out="$2"
  if [[ -f "$out" && -s "$out" ]]; then
    echo "  skip (exists): $(basename "$out")"
    return 0
  fi
  echo "  download: $(basename "$out")"
  curl -fsSL "$url" -o "$out" || {
    echo "  WARN: failed $(basename "$out")"
    return 1
  }
}

echo "Downloading product images (picsum.photos)..."
download "https://picsum.photos/seed/hf-banarasi/800/1000" "$PRODUCTS/banarasi-silk-saree.jpg"
download "https://picsum.photos/seed/hf-kurti/800/1000" "$PRODUCTS/floral-cotton-kurti.jpg"
download "https://picsum.photos/seed/hf-dress/800/1000" "$PRODUCTS/indigo-block-print-dress.jpg"
download "https://picsum.photos/seed/hf-jhumka/800/1000" "$PRODUCTS/silver-jhumka-earrings.jpg"
download "https://picsum.photos/seed/hf-serum/800/1000" "$PRODUCTS/vitamin-c-serum.jpg"
download "https://picsum.photos/seed/hf-tote/800/1000" "$PRODUCTS/tan-leather-tote.jpg"
download "https://picsum.photos/seed/hf-mojari/800/1000" "$PRODUCTS/embroidered-mojari.jpg"
download "https://picsum.photos/seed/hf-hairpins/800/1000" "$PRODUCTS/pearl-hair-pins.jpg"
download "https://picsum.photos/seed/hf-kanjivaram/800/1000" "$PRODUCTS/kanjivaram-silk-saree.jpg"
download "https://picsum.photos/seed/hf-anarkali/800/1000" "$PRODUCTS/anarkali-kurta.jpg"
download "https://picsum.photos/seed/hf-necklace/800/1000" "$PRODUCTS/gold-necklace-set.jpg"
download "https://picsum.photos/seed/hf-dupatta/800/1000" "$PRODUCTS/chiffon-dupatta.jpg"
download "https://picsum.photos/seed/hf-moisturizer/800/1000" "$PRODUCTS/face-moisturizer.jpg"
download "https://picsum.photos/seed/hf-sandals/800/1000" "$PRODUCTS/block-heel-sandals.jpg"

echo "Downloading banner images..."
download "https://picsum.photos/seed/hf-banner-saree/1400/500" "$BANNERS/banner-saree-collection.jpg"
download "https://picsum.photos/seed/hf-banner-jewellery/1400/500" "$BANNERS/banner-jewellery-fest.jpg"
download "https://picsum.photos/seed/hf-banner-new/1400/500" "$BANNERS/banner-new-arrivals.jpg"

echo "Downloading category images..."
download "https://picsum.photos/seed/hf-cat-sarees/400/400" "$CATEGORIES/sarees-ethnic-wear.jpg"
download "https://picsum.photos/seed/hf-cat-western/400/400" "$CATEGORIES/western-clothing.jpg"
download "https://picsum.photos/seed/hf-cat-jewellery/400/400" "$CATEGORIES/fine-jewellery.jpg"
download "https://picsum.photos/seed/hf-cat-beauty/400/400" "$CATEGORIES/beauty-skincare.jpg"
download "https://picsum.photos/seed/hf-cat-bags/400/400" "$CATEGORIES/bags-handbags.jpg"
download "https://picsum.photos/seed/hf-cat-footwear/400/400" "$CATEGORIES/footwear.jpg"
download "https://picsum.photos/seed/hf-cat-hair/400/400" "$CATEGORIES/hair-accessories.jpg"
download "https://picsum.photos/seed/hf-cat-scarves/400/400" "$CATEGORIES/scarves-dupattas.jpg"
download "https://picsum.photos/seed/hf-cat-watches/400/400" "$CATEGORIES/watches-eyewear.jpg"
download "https://picsum.photos/seed/hf-cat-accessories/400/400" "$CATEGORIES/fashion-accessories.jpg"

echo "Done. $(find "$IMG" -type f \( -name '*.jpg' -o -name '*.svg' \) | wc -l | tr -d ' ') image files under frontend/public/images/"

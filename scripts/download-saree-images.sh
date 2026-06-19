#!/usr/bin/env bash
# Download 40 saree product images (Pexels) for Sarees & Ethnic Wear category
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT="$ROOT/frontend/public/images/products"
mkdir -p "$OUT"
FORCE=false
[[ "${1:-}" == "--force" ]] && FORCE=true

p() { echo "https://images.pexels.com/photos/$1/pexels-photo-$1.jpeg?auto=compress&cs=tinysrgb&w=800&h=1000&fit=crop"; }

download() {
  local url="$1" out="$2"
  if [[ "$FORCE" != true && -f "$out" && -s "$out" ]]; then echo "  skip: $(basename "$out")"; return 0; fi
  echo "  download: $(basename "$out")"
  curl -fsSL "$url" -o "$out" || { echo "  WARN: failed $(basename "$out")"; return 1; }
}

echo "Downloading 40 saree images..."
download "$(p 2679416)" "$OUT/saree-01.jpg"
download "$(p 1183266)" "$OUT/saree-02.jpg"
download "$(p 1536619)" "$OUT/saree-03.jpg"
download "$(p 1598505)" "$OUT/saree-04.jpg"
download "$(p 2681751)" "$OUT/saree-05.jpg"
download "$(p 2739792)" "$OUT/saree-06.jpg"
download "$(p 2892637)" "$OUT/saree-07.jpg"
download "$(p 2915289)" "$OUT/saree-08.jpg"
download "$(p 3052361)" "$OUT/saree-09.jpg"
download "$(p 3222145)" "$OUT/saree-10.jpg"
download "$(p 3259340)" "$OUT/saree-11.jpg"
download "$(p 1181396)" "$OUT/saree-12.jpg"
download "$(p 1036623)" "$OUT/saree-13.jpg"
download "$(p 169190)" "$OUT/saree-14.jpg"
download "$(p 1005638)" "$OUT/saree-15.jpg"
download "$(p 242236)" "$OUT/saree-16.jpg"
download "$(p 769579)" "$OUT/saree-17.jpg"
download "$(p 1926769)" "$OUT/saree-18.jpg"
download "$(p 1450363)" "$OUT/saree-19.jpg"
download "$(p 1462637)" "$OUT/saree-20.jpg"
download "$(p 1570807)" "$OUT/saree-21.jpg"
download "$(p 1040945)" "$OUT/saree-22.jpg"
download "$(p 1126993)" "$OUT/saree-23.jpg"
download "$(p 996512)" "$OUT/saree-24.jpg"
download "$(p 267391)" "$OUT/saree-25.jpg"
download "$(p 2983468)" "$OUT/saree-26.jpg"
download "$(p 336372)" "$OUT/saree-27.jpg"
download "$(p 985635)" "$OUT/saree-28.jpg"
download "$(p 1542090)" "$OUT/saree-29.jpg"
download "$(p 996329)" "$OUT/saree-30.jpg"
download "$(p 298863)" "$OUT/saree-31.jpg"
download "$(p 1478442)" "$OUT/saree-32.jpg"
download "$(p 1464625)" "$OUT/saree-33.jpg"
download "$(p 6474485)" "$OUT/saree-34.jpg"
download "$(p 9857007)" "$OUT/saree-35.jpg"
download "$(p 1191531)" "$OUT/saree-36.jpg"
download "$(p 3787923)" "$OUT/saree-37.jpg"
download "$(p 1152077)" "$OUT/saree-38.jpg"
download "$(p 3998379)" "$OUT/saree-39.jpg"
download "$(p 996329)" "$OUT/saree-40.jpg"

cp "$OUT/saree-01.jpg" "$ROOT/frontend/public/images/categories/sarees-ethnic-wear.jpg"

echo "Done. 40 saree images ready."

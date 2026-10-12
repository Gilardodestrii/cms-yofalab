#!/usr/bin/env bash
# Uji asap (smoke test) setelah deploy.
#
# Pemakaian:
#   BASE_URL=https://yofalab.com ./scripts/smoke.sh
#   ./scripts/smoke.sh http://127.0.0.1:3000
#
# Memeriksa rute publik, halaman login admin, sitemap/robots, dan header keamanan.
# Keluar dengan kode 1 bila ada pemeriksaan gagal.

set -uo pipefail

BASE="${1:-${BASE_URL:-http://127.0.0.1:3000}}"
BASE="${BASE%/}"
FAILED=0

check() {
  local path="$1" expect="$2" label="$3"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$BASE$path")"
  if [[ "$code" == "$expect" ]]; then
    echo "OK   $label ($path -> $code)"
  else
    echo "FAIL $label ($path -> $code, harap $expect)"
    FAILED=$((FAILED + 1))
  fi
}

check "/" 200 "Home"
check "/product" 200 "Katalog produk"
check "/blog" 200 "Daftar artikel"
check "/about" 200 "About Us"
check "/contact" 200 "Contact Us"
check "/sitemap.xml" 200 "Sitemap"
check "/robots.txt" 200 "Robots"
check "/admin/login" 200 "Login admin"
check "/admin" 307 "Admin tanpa sesi dialihkan"
check "/product/tidak-ada-slug" 404 "Produk tidak ditemukan"

echo
echo "==> Header keamanan"
HEADERS="$(curl -sI --max-time 15 "$BASE/")"
for h in "x-content-type-options" "x-frame-options" "referrer-policy" "content-security-policy"; do
  if grep -qi "^$h:" <<<"$HEADERS"; then
    echo "OK   header $h"
  else
    echo "FAIL header $h tidak ada"
    FAILED=$((FAILED + 1))
  fi
done

echo
echo "==> Tolak POST lintas situs (/api/contact)"
CSRF_CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
  -X POST -H 'Content-Type: application/json' -H 'Origin: https://jahat.example' \
  -d '{"name":"uji","email":"uji@example.com","message":"uji"}' \
  "$BASE/api/contact")"
if [[ "$CSRF_CODE" == "403" ]]; then
  echo "OK   POST lintas situs ditolak (403)"
else
  echo "FAIL POST lintas situs -> $CSRF_CODE (harap 403)"
  FAILED=$((FAILED + 1))
fi

echo
if [[ "$FAILED" -gt 0 ]]; then
  echo "$FAILED pemeriksaan gagal."
  exit 1
fi
echo "Semua pemeriksaan lolos."

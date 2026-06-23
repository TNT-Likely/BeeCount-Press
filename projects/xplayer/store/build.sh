#!/usr/bin/env bash
# XPlayer 商店截图出图:headless Chrome 按精确像素尺寸截图 render.html。
# 产物:
#   output/apple        App Store iPhone 6.5"  1284×2778(ASC 接受 1242×2688 / 1284×2778)
#   output/ipad         App Store iPad 12.9"   2732×2048(横版,12.9"/13" 槽都接受)
#   output/mac          App Store macOS        1440×900
#   output/google-play  Play 手机 1080×2400 + feature 1024×500
# Chrome 直出不带 alpha 通道的 PNG,满足 App Store Connect「不能有透明度」的要求。
set -euo pipefail

STORE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TPL="file://$STORE_DIR/templates/render.html"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
APPLE="$STORE_DIR/output/apple"
IPAD="$STORE_DIR/output/ipad"
MAC="$STORE_DIR/output/mac"
GP="$STORE_DIR/output/google-play"
mkdir -p "$APPLE" "$IPAD" "$MAC" "$GP"

shoot() { # url width height outfile
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --allow-file-access-from-files --virtual-time-budget=4000 \
    --window-size="$2,$3" --screenshot="$4" "$1" >/dev/null 2>&1
}

N=0
for lang in en zh; do
  for n in 1 2 3 4 5; do
    nn=$(printf '%02d' "$n")
    shoot "$TPL?store=apple&lang=$lang&n=$n"   1284 2778 "$APPLE/6.5-$lang-$nn.png";  N=$((N + 1))
    shoot "$TPL?store=android&lang=$lang&n=$n" 1080 2400 "$GP/android-$lang-$nn.png";  N=$((N + 1))
  done
  for n in 1 2 3 4; do
    nn=$(printf '%02d' "$n")
    shoot "$TPL?store=ipad&lang=$lang&n=$n"     2732 2048 "$IPAD/ipad-$lang-$nn.png";  N=$((N + 1))
  done
  for n in 1 2 3; do
    nn=$(printf '%02d' "$n")
    shoot "$TPL?store=mac&lang=$lang&n=$n"      1440 900  "$MAC/mac-$lang-$nn.png";    N=$((N + 1))
  done
  shoot "$TPL?n=feature&lang=$lang" 1024 500 "$GP/feature-$lang.png";                  N=$((N + 1))
done
echo "generated $N images:"
echo "  iPhone 6.5\" → $APPLE"
echo "  iPad 12.9\"  → $IPAD"
echo "  Mac         → $MAC"
echo "  Google Play → $GP"

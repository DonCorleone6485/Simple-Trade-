#!/bin/bash
# Paylaşım kartı üretir.
# Kullanım: scripts/brand/post.sh <ig|sq|x> "Başlık" "Altın vurgu" "Alt metin" [1/5] [çıktı.png]
# Örnek:    scripts/brand/post.sh ig "Risk" "1% per trade." "Size the position, not the hope." 1/5 ~/Desktop/kart1.png
set -e
F=$1; T=$2; G=$3; S=$4; N=$5; OUT=${6:-"$HOME/Desktop/stj-kart.png"}
case $F in ig) W=1080;H=1350;; sq) W=1080;H=1080;; x) W=1600;H=900;; *) echo "f: ig|sq|x"; exit 1;; esac
D="$(cd "$(dirname "$0")/../.." && pwd)"
enc(){ python3 -c 'import sys,urllib.parse;print(urllib.parse.quote(sys.argv[1]))' "$1"; }
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars \
  --allow-file-access-from-files --force-device-scale-factor=1 --virtual-time-budget=6000 --window-size=$W,$H \
  --screenshot="$OUT" "file://$D/scripts/brand/post.html?f=$F&t=$(enc "$T")&g=$(enc "$G")&s=$(enc "$S")&n=$(enc "$N")" >/dev/null 2>&1
echo "$OUT"

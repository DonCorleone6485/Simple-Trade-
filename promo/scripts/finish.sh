#!/bin/bash
# Kullanım: scripts/finish.sh girdi.mp4 çıktı.mp4 [hedef LUFS]
# İki geçişli ses normalizasyonu: önce ölç, sonra doğrusal olarak düzelt.
# Tek geçişli loudnorm müziği "pompalatır" — yükselip alçalan bir ses
# yaratır; iki geçişli ve doğrusal olan parçanın dinamiğine dokunmuyor.
set -e
IN="$1"; OUT="$2"; TARGET="${3:--14}"
M=$(ffmpeg -hide_banner -i "$IN" -af loudnorm=I=$TARGET:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
get() { echo "$M" | grep "\"$1\"" | grep -oE '[-0-9.]+' | head -1; }
ffmpeg -hide_banner -loglevel error -y -i "$IN" -c:v copy \
  -af "loudnorm=I=$TARGET:TP=-1.5:LRA=11:measured_I=$(get input_i):measured_TP=$(get input_tp):measured_LRA=$(get input_lra):measured_thresh=$(get input_thresh):offset=$(get target_offset):linear=true,aresample=48000" \
  -c:a aac -b:a 256k -movflags +faststart "$OUT"
ffmpeg -hide_banner -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I|Peak):" | tr -s ' ' | tr '\n' ' '; echo " ← $OUT"

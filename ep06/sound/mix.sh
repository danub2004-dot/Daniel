#!/bin/bash
# Сведение: голос −13 LUFS (стерео), фон −32 (на 19 дБ тише), эффекты −29; итог −14 LUFS, TP −1.5
set -e
VOICE=$1; END=$2
ffmpeg -v error -y -i "$VOICE" -af "aresample=48000,pan=stereo|c0=c0|c1=c0" v_st.wav
meas(){ ffmpeg -hide_banner -i "$1" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}'; }
gv=$(python3 -c "print(-13-($(meas v_st.wav)))"); gb=$(python3 -c "print(-32-($(meas bed.wav)))"); gs=$(python3 -c "print(-29-($(meas sfx.wav)))")
ffmpeg -v error -y -i v_st.wav -i bed.wav -i sfx.wav -filter_complex "[0]volume=${gv}dB,apad[v];[1]volume=${gb}dB[b];[2]volume=${gs}dB[s];[v][b][s]amix=inputs=3:normalize=0:duration=longest,atrim=0:$END[m]" -map "[m]" mix_pre.wav
J=$(ffmpeg -hide_banner -i mix_pre.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i mix_pre.wav -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true,aresample=48000" mix_final.wav
rm -f v_st.wav mix_pre.wav
ffmpeg -hide_banner -i mix_final.wav -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2

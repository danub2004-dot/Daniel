#!/bin/bash
# Сведение звука серии 1: голос + фон (−19 дБ к голосу) + редкие эффекты. Результат: audio/mix.wav (−14 LUFS)
cd "$(dirname "$0")"
S=sfx
# [файл | старт в ролике, с | начало в файле | длительность | усиление дБ | доп. фильтр]
ffmpeg -y -loglevel error \
 -i audio/voice.mp3 -i $S/drone.mp3 -i $S/rain.mp3 -i $S/rain.mp3 -i $S/sneeze.mp3 -i $S/flicker.mp3 -i $S/flicker.mp3 \
 -i $S/steps.mp3 -i $S/steps.mp3 -i $S/key.mp3 -i $S/creak.mp3 -i $S/phone.mp3 -i $S/knock.mp3 -i $S/latch.mp3 -i $S/wind.mp3 -i $S/wind.mp3 \
 -filter_complex "
 [0:a]aresample=48000,apad=whole_dur=90[v];
 [1:a]atrim=10:100,asetpts=PTS-STARTPTS,lowpass=f=3500,volume=-22.2dB,afade=t=in:d=2,afade=t=out:st=87.5:d=2.5[drone];
 [2:a]atrim=5:15.3,asetpts=PTS-STARTPTS,volume=-10dB,afade=t=in:d=0.4,afade=t=out:st=9.6:d=0.7,adelay=4200:all=1[rain1];
 [3:a]atrim=30:40.6,asetpts=PTS-STARTPTS,volume=-11dB,afade=t=in:d=0.3,afade=t=out:st=9.8:d=0.8,adelay=19400:all=1[rain2];
 [4:a]atrim=1.3:2.56,asetpts=PTS-STARTPTS,volume=-12dB,adelay=1700:all=1[sneeze];
 [5:a]atrim=0:3,asetpts=PTS-STARTPTS,volume=-12dB,afade=t=out:st=2.4:d=0.6[fl1];
 [6:a]atrim=5:9.7,asetpts=PTS-STARTPTS,volume=-13dB,afade=t=in:d=0.3,afade=t=out:st=4:d=0.7,adelay=39800:all=1[fl2];
 [7:a]atrim=2:6,asetpts=PTS-STARTPTS,volume=-1dB,afade=t=in:d=0.3,afade=t=out:st=3.3:d=0.7,adelay=40200:all=1[st1];
 [8:a]atrim=8:10,asetpts=PTS-STARTPTS,lowpass=f=700,volume=-2dB,afade=t=in:d=0.3,afade=t=out:st=1.5:d=0.5,adelay=52200:all=1[st2];
 [9:a]volume=6dB,afade=t=out:st=4.3:d=0.6,adelay=44100:all=1[key];
 [10:a]atrim=0:3,asetpts=PTS-STARTPTS,volume=5dB,afade=t=out:st=2.3:d=0.7,adelay=46900:all=1[creak];
 [11:a]volume=-12dB,adelay=57700:all=1[phone];
 [12:a]volume=-7dB,adelay=78500:all=1[knock];
 [13:a]volume=-8dB,adelay=80550:all=1[latch];
 [14:a]atrim=0:9.6,asetpts=PTS-STARTPTS,volume=-12dB,afade=t=in:d=1,afade=t=out:st=8.6:d=1,adelay=19400:all=1[wind1];
 [15:a]atrim=12:16,asetpts=PTS-STARTPTS,volume=-9dB,afade=t=in:d=0.8,afade=t=out:st=3:d=1,adelay=86500:all=1[wind2];
 [v][drone][rain1][rain2][sneeze][fl1][fl2][st1][st2][key][creak][phone][knock][latch][wind1][wind2]amix=inputs=16:normalize=0:duration=first,atrim=0:90[m]" \
 -map "[m]" -ar 48000 -ac 2 audio/premix.wav
# двухпроходная нормализация громкости до −14 LUFS, пик −1 dBTP
J=$(ffmpeg -hide_banner -i audio/premix.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null - 2>&1 | sed -n '/{/,/}/p')
g(){ echo "$J" | python3 -c "import json,sys;print(json.load(sys.stdin)['$1'])"; }
ffmpeg -y -loglevel error -i audio/premix.wav -af "loudnorm=I=-14:TP=-1:LRA=11:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 audio/mix.wav

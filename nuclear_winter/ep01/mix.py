# Сведение звука серии: голос + фон + редкие эффекты. Все звуки CC0 (см. ИСТОЧНИКИ.txt)
import json, subprocess
W = json.load(open('words.json', encoding='utf-8'))
lines = {}
for w in W: lines.setdefault(w['line'], []).append(w)
L = lambda i: lines[i][0]['s']; Le = lambda i: lines[i][-1]['e']
def Wt(i, pre):
    for w in lines[i]:
        if w['w'].lower().strip('«»,.:!?…—').startswith(pre): return w['s']
    raise KeyError(pre)
DUR = 80.5
inputs, filters, labels = [], [], []
def src(path):
    inputs.extend(['-i', path]); return len(inputs) // 2 - 1
def add(path, start, gain_db, dur=None, offset=0, fade_in=0.02, fade_out=0.05, extra=''):
    i = src(path); lab = f'a{len(labels)}'
    chain = f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,atrim=start={offset}' + (f':duration={dur}' if dur else '') + ',asetpts=PTS-STARTPTS'
    if extra: chain += ',' + extra
    chain += f',afade=t=in:d={fade_in}'
    if dur: chain += f',afade=t=out:st={max(0, dur - fade_out)}:d={fade_out}'
    chain += f',volume={gain_db}dB,adelay={int(start * 1000)}:all=1[{lab}]'
    filters.append(chain); labels.append(lab)

# голос: −18 LUFS → −15 (финальная нормализация доведёт всё до −14)
add('voice_full.mp3', 0, 3, fade_in=0.001)
# мрачный фон: −22 LUFS → −34 LUFS (на 19 LU тише голоса)
add('sfx/dark_ambient_drone_loop.flac', 0, -12, dur=DUR, offset=20, fade_in=1.5, fade_out=2.5)
# ветер: на улице тихо, в подвале — едва слышно, обрывается лязгом двери
clang = Le(12) + 0.05
add('sfx/windy_ambiance.ogg', 0, -36, dur=L(1) - 0.25, offset=5, fade_in=1.0, fade_out=0.3)
add('sfx/windy_ambiance.ogg', L(1) - 0.25, -27, dur=L(2) - L(1) + 0.05, offset=30, fade_in=0.2, fade_out=0.3)
add('sfx/windy_ambiance.ogg', L(2) - 0.2, -37, dur=L(4) - L(2), offset=50, fade_in=0.3, fade_out=0.4)
add('sfx/windy_ambiance.ogg', L(4) - 0.2, -27, dur=clang - L(4) + 0.2, offset=70, fade_in=0.4, fade_out=0.03)
# сирена: от «Сирена» до «Сирена стихает»
add('sfx/siren_0.mp3', L(5) - 0.2, -21, dur=L(12) + 0.9 - L(5), offset=0, fade_in=0.3, fade_out=1.2)
# щелчок фонаря
add('sfx/lock_open_01.ogg', 0.08, -9, dur=0.25)
# шаги бегом по снегу
t = L(6) - 0.1; n = 0
while t < Wt(7, 'падает') - 0.1:
    add('sfx/SnowWalk.ogg' if n % 2 else 'sfx/SnowWalk2.ogg', t, -9, dur=0.3, extra='atempo=1.6'); t += 0.31; n += 1
# Вера падает в снег
add('sfx/SnowWalk.ogg', Wt(7, 'падает') + 0.35, -2, extra='asetrate=44100*0.7,aresample=44100')
# шаги Савельева мимо очереди
ts = Wt(11, 'проходит') - 0.6
for j in range(6): add('sfx/SnowWalk2.ogg', ts + 0.25 + j * 0.5, -14, dur=0.35)
# тяжёлая дверь скрипит, потом лязг
add('sfx/tree_creak.ogg', L(12) + 0.1, 2, dur=3.2, offset=0.5, extra='asetrate=44100*0.75,aresample=44100', fade_out=0.6)
add('sfx/metal_slam_01.ogg', clang, -1, extra='asetrate=44100*0.8,aresample=44100,aecho=0.8:0.6:120|260:0.35|0.2')
# ночной скрип в убежище
add('sfx/tree_creak.ogg', L(14) - 0.3, -2, dur=2.0, offset=2.0, fade_out=0.6)
# Лишний: низкий металлический гул
te = Wt(19, 'одного') - 0.5
add('sfx/metal_sheet_03.ogg', te, 0, extra='asetrate=44100*0.45,aresample=44100,aecho=0.8:0.7:300|600:0.4|0.25', fade_in=0.3)

mix = ''.join(f'[{l}]' for l in labels)
filters.append(f'{mix}amix=inputs={len(labels)}:normalize=0:duration=longest,atrim=duration={DUR},'
               f'loudnorm=I=-14:TP=-1.5:LRA=11:linear=true[out]')
open('mix_filter.txt', 'w').write(';\n'.join(filters))
cmd = ['ffmpeg', '-y', '-loglevel', 'error', *inputs, '-filter_complex_script', 'mix_filter.txt', '-map', '[out]', '-ar', '48000', '-c:a', 'pcm_s16le', 'mix.wav']
subprocess.run(cmd, check=True)
print('ok', len(labels), 'layers')

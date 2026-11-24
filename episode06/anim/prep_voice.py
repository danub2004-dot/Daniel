"""Укорачивает паузы в озвучке и строит тайминг слов (words.json).

Вход: narr.wav (48 кГц моно, декодированная озвучка), sil.txt (вывод silencedetect),
      ../alignment.json (посимвольный тайминг ElevenLabs), ../voice_elevenlabs.txt.
Выход: voice_edit.wav, words.json
"""
import json, re, sys, wave
import numpy as np

narr, sil_txt, out_dir = sys.argv[1], sys.argv[2], sys.argv[3]
KEEP = 0.24  # сколько тишины оставить с каждой стороны паузы (с)

w = wave.open(narr)
sr = w.getframerate()
x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16)
dur = len(x) / sr

vals = [float(l.split(': ')[1]) for l in open(sil_txt)]
sil = [(vals[i], vals[i + 1]) for i in range(0, len(vals) - 1, 2)]

# оставляем: всё, кроме середины длинных пауз
cuts = []
for s, e in sil:
    if s < 0.05 or e > dur - 0.05:
        continue
    if e - s > 2 * KEEP + 0.05:
        cuts.append((s + KEEP, e - KEEP))

def remap(t):
    shift = 0.0
    for a, b in cuts:
        if t >= b:
            shift += b - a
        elif t > a:
            return a - shift
    return t - shift

parts, pos = [], 0.0
fade = int(0.01 * sr)
for a, b in cuts:
    seg = x[int(pos * sr):int(a * sr)].astype(np.float32)
    parts.append(seg)
    pos = b
parts.append(x[int(pos * sr):].astype(np.float32))
y = np.concatenate(parts)
# короткий хвост тишины в конце не нужен — анимация сама держит финал
y = np.clip(y, -32768, 32767).astype(np.int16)
o = wave.open(f'{out_dir}/voice_edit.wav', 'wb')
o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes(y.tobytes()); o.close()

# слова из посимвольного тайминга, без тегов [..]
a = json.load(open(f'{out_dir}/../alignment.json'))
ch, st, en = a['characters'], a['character_start_times_seconds'], a['character_end_times_seconds']
text = ''.join(ch)
words, line = [], 0
i = 0
mask = [False] * len(text)
for m in re.finditer(r'\[[a-z ]+\]', text):
    for k in range(m.start(), m.end()):
        mask[k] = True
cur = None
for i, c in enumerate(text):
    if c == '\n':
        if cur: words.append(cur); cur = None
        line += 1
        continue
    if mask[i] or c == ' ':
        if cur: words.append(cur); cur = None
        continue
    if cur is None:
        cur = {'w': '', 's': None, 'e': None, 'line': line}
    cur['w'] += c
    if re.match(r'[\w]', c):
        if cur['s'] is None: cur['s'] = st[i]
        cur['e'] = en[i]
if cur: words.append(cur)
# убрать «слова» из одной пунктуации (тире) — приклеить к соседям
clean = []
for wd in words:
    if wd['s'] is None:
        if clean and wd['w'] not in ('—', '–'):
            clean[-1]['w'] += wd['w']
        continue
    clean.append(wd)
for wd in clean:
    wd['s'] = round(remap(wd['s']), 3)
    wd['e'] = round(remap(wd['e']), 3)
json.dump({'duration': round(len(y) / sr, 3), 'words': clean}, open(f'{out_dir}/words.json', 'w'), ensure_ascii=False, indent=0)
print('orig', round(dur, 2), 'edit', round(len(y) / sr, 2), 'cuts', len(cuts), 'words', len(clean))

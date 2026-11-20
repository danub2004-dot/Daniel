"""Звуковая дорожка: голос + фон CC0 (Freesound). python3 sound/mix.py -> audio/mix.wav
Фон и эффекты подгоняются по громкости относительно голоса (LUFS),
весь звук, кроме голоса, жёстко обрывается перед фразой «А потом — так же резко замолчат»."""
import json, re, subprocess, numpy as np, os
os.chdir(os.path.dirname(os.path.abspath(__file__)) + '/..')
SR = 48000
TL = json.load(open('timeline.json'))
W = TL['words']
TOTAL = TL['voiceEnd'] + 0.7 + 3.6
CUT = next(w['s'] for w in W[140:] if w['w'] == 'А') - 0.04   # обрыв перед «А потом…»
def word(prefix, after=0):
    return next(w for w in W if w['s'] >= after and w['w'].lower().startswith(prefix))

def load(path, ss=0, dur=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(ss), '-i', path] + (['-t', str(dur)] if dur else []) + ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).reshape(-1, 2).copy()

def lufs(x):
    p = subprocess.run(['ffmpeg', '-hide_banner', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-af', 'ebur128', '-f', 'null', '-'],
                       input=x.astype(np.float32).tobytes(), capture_output=True).stderr.decode()
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', p)[-1])

def fade(x, fin=0.0, fout=0.0):
    n = len(x)
    if fin:  k = min(n, int(fin * SR)); x[:k] *= np.linspace(0, 1, k)[:, None]
    if fout: k = min(n, int(fout * SR)); x[n - k:] *= np.linspace(1, 0, k)[:, None]
    return x

N = int(TOTAL * SR)
voice = load('audio/voice.mp3'); VL = lufs(voice)
bed = np.zeros((N, 2), np.float32)

def put(x, at, rel_db, ref=None):
    """rel_db — насколько тише голоса (по LUFS этого куска или ref)."""
    g = 10 ** ((VL - rel_db - (ref if ref is not None else lufs(x))) / 20)
    i = int(at * SR); x = x[:max(0, N - i)]
    bed[i:i + len(x)] += x * g

# 1. Ровный мрачный дрон на ~19 дБ тише голоса, всё время до обрыва
drone = load('sound/src/20705.mp3', 8, 66)
dl = lufs(drone)
drone = np.concatenate([drone, drone[::-1]])[:int(CUT * SR)]
put(fade(drone, fin=2.0), 0, 19, ref=dl)

# 2. Ветер — два редких тихих наката: начало (город) и «Ночью…»
wind = load('sound/src/159509.mp3', 12, 30); wl = lufs(wind)
put(fade(wind[:int(9 * SR)].copy(), 3, 3), 5.0, 21, ref=wl)
t_night = word('ночью')['s']
put(fade(wind[int(10 * SR):int(19 * SR)].copy(), 2.5, 3), t_night - 1.5, 20, ref=wl)

# 3. Скрип ворот — после «Закройте ворота» и тише после «Не открывайте ворота»
gate = load('sound/src/389646.mp3', 3.8, 3.4); gl = lufs(gate)
put(fade(gate.copy(), 0.05, 0.6), word('ворота')['e'] + 0.1, 16, ref=gl)
put(fade(gate[:int(2.2 * SR)].copy(), 0.05, 0.8), word('ворота', after=55)['e'] + 0.2, 20, ref=gl)

# 4. Гуси: тихо вдали на «Гуси и собаки…», громко на «гуси закричат» — и резко тишина
put(fade(load('sound/src/149192.mp3', 0, 2.6), 0.3, 0.8), word('гуси')['s'] + 0.2, 20)
t_scream = word('гуси', after=60)['s']
honk = load('sound/src/423346.mp3', 2.5, 8); hl = lufs(honk)
honk = fade(honk[:int((CUT - t_scream + 0.25) * SR)].copy(), 0.15, 0)
put(honk, t_scream - 0.25, 7, ref=hl)

bed[int(CUT * SR):] = 0                     # резкий обрыв: дальше только голос и тишина
k = int(0.012 * SR); i = int(CUT * SR)
bed[i - k:i] *= np.linspace(1, 0, k)[:, None]  # 12 мс, чтобы не было щелчка

mix = bed.copy(); mix[:len(voice)] += voice[:N]
mix.astype(np.float32).tofile('/tmp/mix.f32')
print(f'голос {VL:.1f} LUFS, обрыв {CUT:.2f} c, длина {TOTAL:.2f} c, фон до обрыва {lufs(bed[:i]):.1f} LUFS')
# громкость −14 LUFS, true peak −1 dBTP (двухпроходный loudnorm)
m = subprocess.run(['ffmpeg', '-hide_banner', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '/tmp/mix.f32', '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True).stderr.decode()
j = json.loads(m[m.rindex('{'):])
subprocess.run(['ffmpeg', '-y', '-v', 'error', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '/tmp/mix.f32', '-af',
                f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true",
                '-ar', str(SR), 'audio/mix.wav'], check=True)
os.remove('/tmp/mix.f32')

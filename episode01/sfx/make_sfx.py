"""Звуковой дизайн серии 1: синтез эффектов (numpy) и сведение с озвучкой.

python3 make_sfx.py  →  sfx/mix.wav (48 кГц, стерео): озвучка + атмосфера + эффекты.
Тайминг берётся из anim/words.json, границы сцен — как в anim/anim.js.
"""
import json, os, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
SR = 48000
T_END = 87.5
N = int(T_END * SR)
rng = np.random.default_rng(7)

# ── тайминг
W = json.load(open(f'{HERE}/../anim/words.json'))['words']
LINES = {}
for w in W: LINES.setdefault(w['line'], []).append(w)
ls = lambda i: LINES[i][0]['s']
le = lambda i: LINES[i][-1]['e']
def wt(line, sub, k=0):
    c = [w for w in LINES[line] if sub.lower() in w['w'].lower()]
    return c[k]['s']
B = [0, ls(1) - .2, ls(2) - .25, ls(3) - .2, ls(5) - .3, ls(8) - .3, ls(9) - .2, ls(10) - .3, ls(11) - .3,
     ls(13) - .3, ls(15) - .3, ls(16) - .2, ls(17) - .3, ls(18) - .3, T_END]

# шум как в anim.js (для мигания фонаря)
def jhash(n):
    n = np.sin(n * 127.1 + 311.7) * 43758.5453
    return n - np.floor(n)
def jnoise(t, sp):
    i = np.floor(t * sp); f = t * sp - i
    return jhash(i) * (1 - f) + jhash(i + 1) * f

# ── DSP
def band(x, lo=None, hi=None):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); m = np.ones_like(f)
    if lo: m *= 1 / (1 + (lo / np.maximum(f, 1e-3)) ** 4)
    if hi: m *= 1 / (1 + (f / hi) ** 4)
    return np.fft.irfft(X * m, len(x))
def norm(x, peak=1.0):
    p = np.max(np.abs(x)); return x * (peak / p) if p > 0 else x
def tt(d): return np.arange(int(d * SR)) / SR
def env_ad(d, a=0.005, r=None):
    t = tt(d); e = np.minimum(1, t / max(a, 1e-4))
    return e * (np.exp(-t / r) if r else 1)
def fade(x, fi=0.05, fo=0.05):
    n = len(x); a, b = int(fi * SR), int(fo * SR)
    if a: x[:a] *= np.linspace(0, 1, a)
    if b: x[-b:] *= np.linspace(1, 0, b)
    return x
_IR = None
def reverb(x, wet=0.35, dec=1.4):
    global _IR
    if _IR is None:
        t = tt(dec * 1.6); _IR = band(rng.standard_normal(len(t)), 200, 7000) * np.exp(-t / (dec / 4)); _IR /= np.sqrt(np.sum(_IR ** 2))
    n = len(x) + len(_IR)
    y = np.fft.irfft(np.fft.rfft(x, n) * np.fft.rfft(_IR, n), n)
    out = np.zeros(n); out[:len(x)] += x * (1 - wet); out += y * wet
    return out

# ── звуки
def ping():
    t = tt(0.9)
    s = 0.6 * np.sin(2 * np.pi * 1318.5 * t) * np.exp(-t / 0.12)
    t2 = t[:-int(0.09 * SR)]; s2 = np.zeros_like(t); s2[int(0.09 * SR):] = 0.7 * np.sin(2 * np.pi * 1975.5 * t2) * np.exp(-t2 / 0.18)
    return reverb((s + s2) * env_ad(0.9, 0.003), 0.25)
def vibrate(d):
    t = tt(d); on = ((t % 0.6) < 0.4).astype(float)
    on = band(on, None, 40)
    s = np.sign(np.sin(2 * np.pi * 172 * t)) * 0.5 + 0.5 * np.sin(2 * np.pi * 344 * t)
    return band(s * on, 80, 2500) * 0.5
def breath_track(d, period=1.7, phone=False, seed=1):
    r = np.random.default_rng(seed); t = tt(d)
    n = r.standard_normal(len(t))
    ph = (t % period) / period
    inh = np.where(ph < 0.42, np.sin(np.pi * ph / 0.42) ** 2 * 0.55, 0)
    exh = np.where(ph >= 0.48, np.abs(np.sin(np.pi * (ph - 0.48) / 0.52)) ** 1.5, 0)
    s = band(n, 350, 1800) * inh + band(n, 180, 1100) * exh
    if phone: s = band(s, 300, 3400); s = np.tanh(s * 3) / 3
    return s
def boom(d=3.5):
    t = tt(d); f = 35 + 55 * np.exp(-t / 0.25)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 1.0)
    s += band(rng.standard_normal(len(t)), None, 220) * np.exp(-t / 0.15) * 0.8
    return reverb(np.tanh(s * 1.6), 0.3, 2.0)
def sting(d=3.0, base=233.0):
    t = tt(d); s = np.zeros_like(t)
    for k, r in enumerate([1, 1.059, 1.414, 1.498, 2.0, 2.12, 2.83]):
        s += np.sin(2 * np.pi * base * r * t + k) * (0.5 + 0.5 * np.sin(2 * np.pi * (4 + k) * t))
    s *= np.exp(-t / 0.9) * env_ad(d, 0.01)
    s += band(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-t / 0.25) * 2
    return reverb(s / 6, 0.5, 2.2)
def whoosh(d=2.0, lo=200, hi=3000):
    t = tt(d); e = np.sin(np.pi * t / d) ** 3
    return band(rng.standard_normal(len(t)), lo, hi) * e
def car_pass(d=4.5):
    t = tt(d); c = d * 0.55; e = np.exp(-((t - c) / 0.7) ** 2)
    eng = np.sin(2 * np.pi * np.cumsum(np.where(t < c, 70, 52)) / SR)
    return (band(rng.standard_normal(len(t)), 60, 1500) * 1.2 + eng * 0.6) * e
def thunder(d=5.0):
    t = tt(d); s = band(rng.standard_normal(len(t)), 25, 300)
    e = env_ad(d, 0.15, 1.4) * (0.6 + 0.4 * jnoise(t, 6))
    return s * e
def step():
    t = tt(0.12); return band(rng.standard_normal(len(t)), 300, 4500) * np.exp(-t / 0.03)
def beep(f=880, d=0.12):
    t = tt(d); return np.sin(2 * np.pi * f * t) * fade(np.ones_like(t), 0.005, 0.03) * 0.5
def click():
    t = tt(0.05); return band(rng.standard_normal(len(t)), 1500, 8000) * np.exp(-t / 0.006)
def powerdown(d=0.9):
    t = tt(d); f = 900 * np.exp(-t / 0.22) + 40
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * (1 - t / d) * 0.6
def whispers(d=6.0):
    t = tt(d); s = np.zeros_like(t)
    for v in range(9):
        r = np.random.default_rng(100 + v)
        g = band((r.random(len(t)) < 0.0001).astype(float), None, 6) * 3000
        s += band(r.standard_normal(len(t)), 1800 + 300 * v, 7000) * np.clip(g, 0, 1)
    return s * np.sin(np.pi * t / d) ** 0.7

# ── дорожки (стерео)
L = np.zeros(N); R = np.zeros(N)
def put(x, t0, g=1.0, pan=0.0):
    i = int(t0 * SR); x = x[:max(0, N - i)]
    if i < 0: x = x[-i:]; i = 0
    L[i:i + len(x)] += x * g * (1 - pan) ** 0.5 * 1.4142 / 2 ** 0.5 * (0.5 ** 0.5)
    R[i:i + len(x)] += x * g * (1 + pan) ** 0.5 * 1.4142 / 2 ** 0.5 * (0.5 ** 0.5)
T = np.arange(N) / SR
def envelope(points):
    xs, ys = zip(*points); return np.interp(T, xs, ys)

# атмосфера: дрон
dr = np.zeros(N)
for f, a in [(55, .5), (55.4, .4), (82.4, .25), (110.3, .12), (164.8, .05)]:
    dr += a * np.sin(2 * np.pi * f * T + f)
dr *= 0.7 + 0.3 * np.sin(2 * np.pi * T / 9)
dr += band(rng.standard_normal(N), 40, 260) * 0.6
dr_env = envelope([(0, .4), (20, .5), (40, .6), (44, .9), (68, .8), (74, 1.0), (81, 1.2), (85.0, 1.3), (85.1, 0), (T_END, 0)])
put(norm(dr) * dr_env, 0, 0.07)

# комната: тиканье часов в спальне
for k in np.arange(0.2, B[4], 1.0): put(click() * 0.7, k, 0.05, -0.3)

# дождь
rain_env = envelope([(0, 0), (wt(5, 'гудит'), 0), (wt(5, 'гудит') + 2, 1), (B[5], 1), (B[5] + .1, .3), (B[6], .3), (B[6] + .1, .65),
                     (B[7], .65), (B[7] + .1, 0), (B[8], 0), (B[8] + .1, .9), (B[9], .9), (B[9] + .1, .35), (B[10], .35), (B[10] + .1, 0),
                     (B[11], 0), (B[11] + .1, 1), (B[13], 1), (B[13] + .1, .15), (T_END, 0)])
for ch, sd in ((L, 11), (R, 12)):
    r = band(np.random.default_rng(sd).standard_normal(N), 900, 9000)
    drops = band((np.random.default_rng(sd + 5).random(N) < 0.0009).astype(float) * np.random.default_rng(sd + 6).standard_normal(N), 1500, 9000) * 6
    ch += norm(r * 0.8 + drops) * rain_env * 0.06

# трасса: гул + жужжание фонарей
hw_env = envelope([(0, 0), (B[4], 0), (B[4] + .5, 1), (B[5], 1), (B[5] + .1, .5), (B[6], .5), (B[6] + .1, .6), (B[7], .6), (B[7] + .1, 0),
                   (B[8], 0), (B[8] + .1, 1), (B[9], 1), (B[9] + .1, .4), (B[10], .4), (B[10] + .1, 0), (T_END, 0)])
brown = np.cumsum(rng.standard_normal(N)); brown = band(brown - np.mean(brown), 30, 400)
hum = 0.4 * np.sin(2 * np.pi * 100 * T) + 0.2 * np.sin(2 * np.pi * 200 * T)
put(norm(brown) * hw_env, 0, 0.09); put(hum * hw_env, 0, 0.015)
for k in [B[4] + 1.5, B[4] + 9.5, B[6] + 1.0, B[8] + 2.5, B[9] + 4.0]: put(car_pass(), k, 0.06, rng.uniform(-.6, .6))

# — сцена A/B: уведомления и удар
put(ping(), wt(0, 'сообщение'), 0.25)
put(ping(), wt(1, 'выйди'), 0.16); put(ping(), wt(1, 'или'), 0.16)
put(boom(), wt(1, 'один'), 0.35)
# — C: вибрация, дыхание в трубке
put(vibrate(wt(2, 'трубке') - B[2] - 0.1), B[2] + 0.05, 0.22)
br = breath_track(B[3] - wt(2, 'трубке') + 0.4, phone=True, seed=2); put(fade(br, .2, .3), wt(2, 'трубке'), 0.5)
# — D: шорох одеяла при пробуждении
put(whoosh(0.6, 300, 4000), wt(3, 'разбудил') - 0.25, 0.08)
# — E: шаги по гравию, грузовик, вспышка/гром, уведомление, стингер
tStop = wt(6, 'ты')
for k, t0 in enumerate(np.arange(B[4] + 0.15, tStop, np.pi / 5.2)):
    put(step(), t0, 0.12, -0.3 if k % 2 else 0.3); put(step() * 0.7, t0 + 0.27, 0.08, -0.5)
put(car_pass(5.0), wt(5, 'трасса') + 0.5, 0.18, 0.5)
put(thunder(), ls(6) - 0.25, 0.35)
put(ping(), ls(6) + 0.6, 0.22)
put(sting(), wt(6, 'оборачивайся'), 0.3)
# — F: заряд
for k in range(3): put(beep(440, 0.1), wt(8, 'два') + k * 0.25, 0.12)
put(click(), wt(8, 'пауэрбанке') - 0.2, 0.25)
put(beep(660, .08), wt(8, 'наушникам') - 0.1, 0.1); put(beep(990, .1), wt(8, 'наушникам'), 0.1)
# — G: дыхание ближе
tNear = wt(9, 'ближе')
gb = breath_track(B[7] - B[6], seed=3) * np.interp(tt(B[7] - B[6]), [0, tNear - 0.4 - B[6], tNear + 0.5 - B[6], B[7] - B[6]], [.35, .55, 1, 1])
put(fade(gb, .2, .2), B[6], 0.55, 0.35)
put(sting(2.5, 155), tNear, 0.18)
# — H: маршрут по кругу
put(whoosh(2.2, 150, 2500), wt(10, 'кругу') - 0.4, 0.14)
# — I: фонарь мигает и гаснет на «не знаю»
tDont = wt(12, 'знаю') - 0.15
tI = np.arange(int((B[9] - B[8]) * SR)) / SR + B[8]
on = (jnoise(tI, 10) <= 0.86).astype(float); on[(tI > tDont) & (tI < tDont + 0.55)] = 0
buzz = (np.sign(np.sin(2 * np.pi * 120 * tI)) * 0.3 + np.sin(2 * np.pi * 240 * tI)) * band(on, None, 60)
put(band(buzz, 100, 3000), B[8], 0.025, -0.4)
put(click(), tDont, 0.3); put(boom(2.0), tDont, 0.25)
# — J: сообщения на экране Тёмы
for k in [wt(13, 'показал'), wt(13, 'пишут') - 0.2, wt(13, 'начала') - 0.3]: put(ping(), k, 0.16)
put(sting(3, 196), ls(14), 0.12)
# — K: дом
put(boom(), wt(15, 'дома') - 0.2, 0.32)
# — L: пауэрбанк погас, наушники молчат, дыхание остаётся
put(powerdown(), wt(16, 'пауэрбанк') + 0.1, 0.25)
put(click(), wt(16, 'наушники') + 0.3, 0.2)
lb = breath_track(B[12] - wt(16, 'дыхание') + 0.6, seed=4); put(fade(lb, .4, .3), wt(16, 'дыхание') - 0.2, 0.7, 0.6)
# — M: соседи
put(whispers(B[13] - wt(17, 'соседи') + 0.8), wt(17, 'соседи') - 0.3, 0.35)
put(sting(3.5, 207), wt(17, 'смотрели'), 0.3)
# — N: последнее сообщение, экран гаснет, титр
put(ping(), wt(18, 'теперь') - 0.1, 0.26)
tOff = le(18) + 0.35
put(powerdown(0.5), tOff - 0.2, 0.2)
put(boom(4.0), tOff + 0.3, 0.3); put(sting(3.5, 233), tOff + 0.3, 0.25)

# ── сведение с озвучкой (лёгкий даккинг эффектов под голос)
w = wave.open(f'{HERE}/../anim/voice_edit.wav'); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
assert w.getframerate() == SR
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
ve = np.sqrt(np.maximum(band(voice ** 2, None, 4), 0)); ve = np.clip(ve / (np.max(ve) + 1e-9) * 3, 0, 1)
duck = 1 - 0.35 * ve
voice = norm(voice, 0.75)
mixL = voice + L * duck * 1.4; mixR = voice + R * duck * 1.4
peak = max(np.max(np.abs(mixL)), np.max(np.abs(mixR)))
if peak > 0.97: mixL, mixR = mixL * 0.97 / peak, mixR * 0.97 / peak
out = (np.stack([mixL, mixR], 1) * 32767).astype(np.int16)
o = wave.open(f'{HERE}/mix.wav', 'wb'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes(out.tobytes()); o.close()
print('mix.wav', round(N / SR, 2), 's, peak', round(peak, 3))

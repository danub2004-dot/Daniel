# Все звуки серии синтезируются этим скриптом (numpy). Никаких чужих записей.
# Выход: bed.wav (фон: гул + дождь + ветер) и sfx.wav (эффекты), 48 кГц, стерео.
import json, sys, numpy as np, wave
SR = 48000
tm = json.load(open(sys.argv[1]))
T, B, END = tm['T'], tm['B'], tm['END']
N = int((END + 0.5) * SR)
rng = np.random.default_rng(7)
t = np.arange(N) / SR

def band(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    m = ((f >= lo) & (f <= hi)).astype(float)
    # мягкие края
    m = np.convolve(m, np.hanning(401) / np.hanning(401).sum(), 'same')
    return np.fft.irfft(X * m, len(x))
def env_ar(n, a, r):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    e *= np.exp(-np.arange(n) / SR / max(r, 1e-3)); return e
def place(buf, x, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    x = x[:len(buf) - i]
    l, r = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    buf[i:i + len(x), 0] += x * gain * l * 1.41; buf[i:i + len(x), 1] += x * gain * r * 1.41
def seg_mask(a, b, fade=0.4):
    m = np.clip(np.minimum((t - a) / fade, (b - t) / fade), 0, 1); return m

# ---------- фон ----------
bed = np.zeros((N, 2))
# мрачный гул: ре-минор, медленные биения
drone = np.zeros(N)
for f, a in [(36.7, 1.0), (55.0, 0.6), (73.4, 0.45), (87.3, 0.25), (110.0, 0.12)]:
    drone += a * np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.07 * t * (1 + f / 200)))
    drone += a * 0.5 * np.sin(2 * np.pi * (f * 1.004) * t)
brown = np.cumsum(rng.standard_normal(N)); brown -= np.convolve(brown, np.ones(4801) / 4801, 'same')
drone += band(brown, 20, 180) / (np.abs(band(brown, 20, 180)).max() + 1e-9) * 0.6
# нарастание к финалу
rise = np.clip((t - B[15]) / (T['pzd'] - B[15]), 0, 1) * (t < T['pzd'])
drone += 0.35 * rise * np.sin(2 * np.pi * (220 + 60 * rise) * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 5 * t))
drone *= np.where(t > T['last'] + 0.3, np.exp(-(t - T['last'] - 0.3) * 3), 1)
drone /= np.abs(drone).max()
bed[:, 0] += drone * 0.9; bed[:, 1] += drone * 0.9

# дождь (уличные сцены громче, в доме — за окном, в баре — глухо)
rainL = band(rng.standard_normal(N), 900, 9000); rainR = band(rng.standard_normal(N), 900, 9000)
drops = (rng.random(N) < 0.0009) * rng.random(N)
dr = np.convolve(drops, np.exp(-np.arange(200) / 25), 'same')
rainL = rainL / np.abs(rainL).max() + band(dr, 1500, 7000) * 3; rainR = rainR / np.abs(rainR).max() + band(np.roll(dr, 997), 1500, 7000) * 3
street = [(B[8], B[9]), (T['vynes'], B[14])]
home = [(B[0], B[3]), (B[7], B[8]), (B[9], B[12])]
bar = [(B[3], B[7]), (B[12], T['vynes']), (B[14], B[15])]
rm = np.zeros(N)
for a, b in street: rm = np.maximum(rm, seg_mask(a, b, 0.25) * 1.0)
for a, b in home: rm = np.maximum(rm, seg_mask(a, b, 0.25) * 0.4)
for a, b in bar: rm = np.maximum(rm, seg_mask(a, b, 0.25) * 0.22)
bed[:, 0] += rainL * rm * 0.5; bed[:, 1] += rainR * rm * 0.5
# ветер: полосовой шум с медленно плавающей громкостью
wind = band(rng.standard_normal(N), 150, 900); wind /= np.abs(wind).max()
gust = 0.4 + 0.6 * np.clip(np.sin(2 * np.pi * 0.09 * t) * np.sin(2 * np.pi * 0.031 * t + 1), 0, 1)
wm = np.maximum(rm, 0.25) * (t < T['last'])
bed[:, 0] += wind * gust * wm * 0.35; bed[:, 1] += np.roll(wind, 4000) * gust * wm * 0.35
bed[int((END - 0.3) * SR):] *= np.linspace(1, 0, N - int((END - 0.3) * SR))[:, None]

# ---------- эффекты ----------
fx = np.zeros((N, 2))
def buzz(d, f=420):
    n = int(d * SR); x = np.arange(n) / SR
    s = np.sign(np.sin(2 * np.pi * f * x)) * 0.5 + np.sin(2 * np.pi * f * 2 * x) * 0.3
    s = band(s, 300, 3000); e = np.minimum(1, np.minimum(x / 0.01, (d - x) / 0.02)); return s * e / (np.abs(s).max() + 1e-9)
def click(f=3000, d=0.05):
    n = int(d * SR); x = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * x) * 0.6 + rng.standard_normal(n) * 0.4) * np.exp(-x / 0.008)
def thud(f0=90, f1=35, d=0.6, noise=0.3):
    n = int(d * SR); x = np.arange(n) / SR; f = f1 + (f0 - f1) * np.exp(-x / 0.08)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) + noise * band(rng.standard_normal(n), 40, 600) / 3
    return s * env_ar(n, 0.003, d / 3)
def noiseburst(d, lo, hi, a=0.005, r=0.2):
    n = int(d * SR); s = band(rng.standard_normal(n), lo, hi); s /= np.abs(s).max() + 1e-9; return s * env_ar(n, a, r)
def creak(d=0.9, f0=180, f1=260):
    n = int(d * SR); x = np.arange(n) / SR
    f = f0 + (f1 - f0) * x / d + 25 * np.sin(2 * np.pi * 7 * x)
    ph = np.cumsum(f) / SR
    pulses = (np.sin(2 * np.pi * ph) > 0.92).astype(float)
    s = band(pulses, 150, 4000); s /= np.abs(s).max() + 1e-9
    return s * np.sin(np.pi * x / d) ** 0.7
def swoosh(d=0.5, lo=300, hi=3000):
    n = int(d * SR); x = np.arange(n) / SR; s = band(rng.standard_normal(n), lo, hi); s /= np.abs(s).max() + 1e-9
    return s * np.sin(np.pi * x / d) ** 2
def step():
    a = thud(120, 60, 0.18, 0.8) * 0.7; b = noiseburst(0.12, 200, 2000, 0.002, 0.03) * 0.3; a[:len(b)] += b; return a

def water_loop(a, b, gain, lo=100, hi=4000):
    n = int((b - a) * SR); x = band(rng.standard_normal(n), lo, hi); x /= np.abs(x).max() + 1e-9
    x *= np.minimum(1, np.minimum(np.arange(n) / SR / 0.3, (n - np.arange(n)) / SR / 0.3)); place(fx, x, a, gain)
def smash(at, g=0.8):
    for k in range(9): place(fx, click(3000 + rng.uniform(0, 4000), 0.07), at + k * 0.03 + rng.uniform(0, 0.04), g * 0.6, rng.uniform(-0.7, 0.7))
    place(fx, noiseburst(0.7, 2500, 11000, 0.002, 0.18), at, g); place(fx, thud(140, 80, 0.2, 0.6), at, g * 0.5)
# вода в доме
water_loop(0, B[3], 0.12, 200, 1500)
for k in range(5): place(fx, noiseburst(0.2, 200, 1500, 0.02, 0.07), 0.6 + k * 0.9, 0.2, rng.uniform(-0.6, 0.6))
# гей забирает биток
place(fx, swoosh(0.5), T['zabral'] - 0.2, 0.4, 0.5); place(fx, click(1600, 0.05), T['zabral'] + 0.3, 0.4)
for k in range(2): place(fx, click(2600 + k * 500, 0.15) * 0.6, T['andr'] + 0.3 + k * 0.15, 0.3)
# фонтан из толчка до «остановилась», чпок
water_loop(B[3], T['ostan'] + 0.1, 0.45, 300, 7000)
place(fx, thud(120, 60, 0.4, 0.8), T['vlez'] + 0.6, 0.6)
place(fx, thud(90, 50, 0.4, 0.6), T['sel'] + 0.2, 0.6)
n = int(0.2 * SR); x = np.arange(n) / SR; pop = np.sin(2 * np.pi * (250 + 900 * x / 0.2) * x) * np.exp(-x / 0.05)
place(fx, pop, T['ostan'], 0.8)
# засасывает
n = int(1.6 * SR); x = np.arange(n) / SR
suck = band(rng.standard_normal(n), 100, 900) * np.sin(np.pi * x / 1.6) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * x))
place(fx, suck / np.abs(suck).max(), T['zasos'], 0.5)
# телефон: гудки
for k in range(2): place(fx, buzz(0.5, 425) * 0.5, T['sm2'] + 0.9 + k * 1.0, 0.35)
# стёкла села (флешбэк), окно, плафон, домофон, бокал
for k in range(4): smash(T['vlad'] + 0.8 + k * 0.35, 0.45)
smash(T['tolko'] + 0.3, 0.9); place(fx, thud(110, 60, 0.4, 0.8), T['tolko'] + 0.9, 0.5)
smash(T['plafon'] + 0.1, 0.7); smash(T['ekran'] + 0.1, 0.7); smash(T['bokal'] + 0.15, 0.8)
# удар лбом
place(fx, thud(130, 50, 0.6, 1.0), T['lbom'], 1.0); smash(T['lbom'] + 0.02, 0.6)
for k in range(3): place(fx, click(1300, 0.06), T['lbom'] + 0.3 + k * 0.12, 0.3)
# выбило: рёв воды и вынос
place(fx, thud(70, 30, 1.2, 1.0), T['vybilo'] - 0.1, 1.0)
water_loop(T['probku'], B[15], 0.7, 80, 8000)
# поток → бар: плеск
for k in range(10): place(fx, noiseburst(0.3, 200, 2000, 0.02, 0.1), B[14] + 0.3 + k * 0.65, 0.25, rng.uniform(-0.6, 0.6))
# рассвет: колокол вдали
n = int(3.0 * SR); x = np.arange(n) / SR
bell = sum(a * np.sin(2 * np.pi * f * x) for f, a in [(220, 1), (440, 0.5), (563, 0.4), (880, 0.2)]) * np.exp(-x / 1.1)
place(fx, bell / np.abs(bell).max(), T['svet'] + 0.2, 0.25); place(fx, bell / np.abs(bell).max(), T['vitr'] + 0.1, 0.2)
# облизнулся
for k in range(2): place(fx, noiseburst(0.18, 300, 2000, 0.01, 0.06), T['obliz'] + 0.1 + k * 0.35, 0.4)
# пиздец: удар и все витражи вдребезги
place(fx, thud(80, 25, 1.8, 1.0), T['pzd'], 1.0); smash(T['pzd'] + 0.05, 1.0)

def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    y = (x * 32767).astype('<i2')
    with wave.open(name, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
save('bed.wav', bed); save('sfx.wav', fx)
print('ok', END)

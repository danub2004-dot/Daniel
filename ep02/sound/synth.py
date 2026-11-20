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
rise = np.clip((t - B[13]) / (T['voda'] - B[13]), 0, 1) * (t < T['voda'])
drone += 0.35 * rise * np.sin(2 * np.pi * (220 + 60 * rise) * t) * (0.5 + 0.5 * np.sin(2 * np.pi * 5 * t))
drone *= np.where(t > T['last'] + 0.3, np.exp(-(t - T['last'] - 0.3) * 3), 1)
drone /= np.abs(drone).max()
bed[:, 0] += drone * 0.9; bed[:, 1] += drone * 0.9

# дождь (уличные сцены громче, в доме — за окном, в баре — глухо)
rainL = band(rng.standard_normal(N), 900, 9000); rainR = band(rng.standard_normal(N), 900, 9000)
drops = (rng.random(N) < 0.0009) * rng.random(N)
dr = np.convolve(drops, np.exp(-np.arange(200) / 25), 'same')
rainL = rainL / np.abs(rainL).max() + band(dr, 1500, 7000) * 3; rainR = rainR / np.abs(rainR).max() + band(np.roll(dr, 997), 1500, 7000) * 3
street = [(B[4], B[6])]
home = [(B[0], B[4]), (B[6], B[11])]
bar = [(B[11], B[15])]
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

# 1. Виорел: шорох халата, бигуди
place(fx, swoosh(0.8, 300, 3000), 0.3, 0.3, -0.3)
place(fx, thud(140, 80, 0.3, 0.6), T['suka'], 0.3)
# 2. «мамочка» — дзинь сердечек
for k in range(3): place(fx, click(2400 + k * 500, 0.15) * 0.6, T['teper'] + 1.0 + k * 0.12, 0.35, -0.4 + k * 0.4)
# 4. биток в рот — «чпок»
n = int(0.18 * SR); x = np.arange(n) / SR
pop = np.sin(2 * np.pi * (300 + 900 * x / 0.18) * x) * np.exp(-x / 0.05)
place(fx, pop, T['rot'], 0.6)
# 5. застрял: стук, возня
place(fx, thud(110, 60, 0.4, 0.8), T['zastr'], 0.6)
for k in range(6): place(fx, noiseburst(0.15, 150, 1500, 0.01, 0.05), T['zastr'] + 0.4 + k * 0.33, 0.3, rng.uniform(-0.5, 0.5))
# 6. фитиль
place(fx, noiseburst(B[6] - T['petard'], 3000, 9000, 0.1, 50) * 0.5, T['petard'], 0.4, 0.3)
# 7. взрыв, полёт, грохот вешалки, шторы, двери
a7 = B[6] + 0.05
place(fx, thud(110, 28, 1.6, 1.2), a7, 1.0); place(fx, noiseburst(1.2, 100, 5000, 0.003, 0.35), a7, 0.7)
place(fx, swoosh(1.2, 200, 2500), a7 + 0.1, 0.5, 0.6)
place(fx, thud(160, 90, 0.3, 0.8), T['vesh'] + 0.2, 0.5, -0.3)
place(fx, swoosh(0.7, 150, 2000), T['shtor'], 0.4, -0.5)
place(fx, thud(90, 40, 0.6, 1.0), T['dver'] + 0.3, 0.8)
# 8. счётчики
for key in ['dva', 'pyat', 'dve', 'krug']: place(fx, click(1500, 0.05), T[key], 0.35)
# 10. хлопок по спине и вылет битка
n = int(0.12 * SR); slap = band(rng.standard_normal(n), 500, 6000) * np.exp(-np.arange(n) / SR / 0.02)
place(fx, slap / np.abs(slap).max(), T['hlop'], 0.9)
place(fx, pop, T['hlop'] + 0.12, 0.6)
place(fx, swoosh(0.6, 800, 5000), T['bitok'], 0.4, -0.4)
# 11. дзынь о фаянс
n = int(1.2 * SR); x = np.arange(n) / SR
ding = (np.sin(2 * np.pi * 1850 * x) + 0.5 * np.sin(2 * np.pi * 2770 * x) + 0.3 * np.sin(2 * np.pi * 4100 * x)) * np.exp(-x / 0.35)
place(fx, ding / np.abs(ding).max(), T['unitaz'] + 0.2, 0.55)
place(fx, click(2000, 0.05), T['unitaz'] + 0.45, 0.3); place(fx, click(1900, 0.05), T['unitaz'] + 0.6, 0.2)
# 12. смыв без воды: щелчок и пустое шипение
place(fx, click(900, 0.08), T['najal'], 0.7); place(fx, noiseburst(0.6, 2000, 6000, 0.05, 0.2), T['najal'] + 0.1, 0.15)
# 14. рука в унитаз — хлюп
for k in range(3): place(fx, noiseburst(0.2, 150, 1200, 0.02, 0.08), T['sunul'] + 0.2 + k * 0.45, 0.45)
# 15. бульк
n = int(0.5 * SR); x = np.arange(n) / SR
blub = np.sin(2 * np.pi * np.cumsum(150 + 500 * x / 0.5) / SR) * np.exp(-x / 0.12)
place(fx, blub, T['bulk'] - 0.05, 0.9)
# 16. потоп: рёв воды
place(fx, thud(70, 30, 1.2, 1.0), T['voda'] - 0.1, 0.9)
fl = noiseburst(B[16] - T['voda'] + 1.0, 100, 8000, 0.3, 30); fl *= np.linspace(1, 0.7, len(fl))
place(fx, fl, T['voda'] - 0.1, 0.8)
# 17. капли и «П*здец»
for k in range(14): place(fx, click(1600 + rng.uniform(0, 1500), 0.06), B[16] + 0.2 + k * 0.38 + rng.uniform(0, 0.2), 0.2, rng.uniform(-0.7, 0.7))
place(fx, thud(90, 40, 0.8, 0.5), T['pzd'], 0.5)

def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    y = (x * 32767).astype('<i2')
    with wave.open(name, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
save('bed.wav', bed); save('sfx.wav', fx)
print('ok', END)

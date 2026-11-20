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
drone *= np.where(t > T['pzd'] + 0.05, np.exp(-(t - T['pzd']) * 3), 1)  # обрыв на «П*здец»
drone /= np.abs(drone).max()
bed[:, 0] += drone * 0.9; bed[:, 1] += drone * 0.9

# дождь (уличные сцены громче, в доме — за окном, в баре — глухо)
rainL = band(rng.standard_normal(N), 900, 9000); rainR = band(rng.standard_normal(N), 900, 9000)
drops = (rng.random(N) < 0.0009) * rng.random(N)
dr = np.convolve(drops, np.exp(-np.arange(200) / 25), 'same')
rainL = rainL / np.abs(rainL).max() + band(dr, 1500, 7000) * 3; rainR = rainR / np.abs(rainR).max() + band(np.roll(dr, 997), 1500, 7000) * 3
street = [(B[2], B[3]), (B[3], B[4]), (B[5], B[6]), (T['derev'] - 0.7, B[8]), (B[8], B[9])]
home = [(B[0], B[2]), (B[11], B[12]), (B[14], B[15]), (B[15], B[16])]
bar = [(B[4], B[5]), (B[6], T['derev'] - 0.7), (B[9], B[11])]
rm = np.zeros(N)
for a, b in street: rm = np.maximum(rm, seg_mask(a, b, 0.25) * 1.0)
for a, b in home: rm = np.maximum(rm, seg_mask(a, b, 0.25) * 0.4)
for a, b in bar: rm = np.maximum(rm, seg_mask(a, b, 0.25) * 0.22)
bed[:, 0] += rainL * rm * 0.5; bed[:, 1] += rainR * rm * 0.5
# ветер: полосовой шум с медленно плавающей громкостью
wind = band(rng.standard_normal(N), 150, 900); wind /= np.abs(wind).max()
gust = 0.4 + 0.6 * np.clip(np.sin(2 * np.pi * 0.09 * t) * np.sin(2 * np.pi * 0.031 * t + 1), 0, 1)
wm = np.maximum(rm, 0.25) * (t < T['pzd'])
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

# 1. домофон звонит (тот же ритм, что мигание на экране)
for k in range(3): place(fx, buzz(0.9), k * 1.4, 0.5, 0.3)
place(fx, buzz(0.7), T['domof2'] - 0.05, 0.5, 0.3)
# 2. шаги рассказчика к стене
for k in range(3): place(fx, step(), B[1] + 0.05 + k * 0.42, 0.5, -0.2 + k * 0.1)
# 3. капля из крана
place(fx, click(1800, 0.12) * np.hanning(int(0.12 * SR)), T['voda'] - 0.6 + 0.9, 0.5)
# 4. труба лопнула: удар + шипение воды
place(fx, thud(70, 30, 0.8, 0.6), T['lop'], 0.9)
place(fx, noiseburst(2.6, 800, 7000, 0.02, 1.4), T['lop'] + 0.05, 0.6, -0.3)
# 5. наливают коньяк (бульканье)
n = int(1.4 * SR); x = np.arange(n) / SR
glug = band(rng.standard_normal(n), 200, 1200) * (0.5 + 0.5 * np.sin(2 * np.pi * 9 * x) ** 8) * np.sin(np.pi * x / 1.4)
place(fx, glug / np.abs(glug).max(), T['pyut'] - 0.2, 0.45)
for k, key in enumerate(['utrom', 'dnem', 'noch']): place(fx, click(2400 + k * 300, 0.04), T[key], 0.4)
# 6. фитиль шипит → взрыв → ворона
bt = T['tual'] + 0.5
place(fx, noiseburst(bt - B[5], 3000, 9000, 0.3, 50) * 0.5, B[5] + 0.1, 0.35, 0.4)
place(fx, thud(110, 28, 1.6, 1.2), bt, 1.0)
place(fx, noiseburst(1.4, 100, 5000, 0.003, 0.4), bt, 0.7)
n = int(0.35 * SR); x = np.arange(n) / SR
caw = band(np.sign(np.sin(2 * np.pi * (700 - 300 * x) * x)) * np.sin(np.pi * x / 0.35), 400, 3000)
place(fx, caw / np.abs(caw).max(), bt + 0.3, 0.3, -0.6); place(fx, caw / np.abs(caw).max(), bt + 0.75, 0.25, 0.6)
# 7. счётчики Виорела — сухие щелчки
for key in ['malch', 'but', 'shary']: place(fx, click(1500, 0.05), T[key], 0.35)
# 8. разбой в бильярде
place(fx, click(2600, 0.06), T['bil'] - 0.02, 0.8)
for k in range(7): place(fx, click(2000 + k * 260, 0.05), T['bil'] + 0.04 + k * 0.05 + rng.uniform(0, 0.03), 0.45, rng.uniform(-0.6, 0.6))
place(fx, thud(140, 80, 0.3, 0.4), T['bil'] + 0.9, 0.3)
# 9. штамп «ОТМЕНА?»
place(fx, thud(160, 70, 0.35, 0.8), T['ne_bud'], 0.7)
# 10. рука хватает биток
place(fx, swoosh(0.45), T['ukral'] - 0.3, 0.45, 0.3); place(fx, click(2200, 0.05), T['ukral'] + 0.4, 0.5)
place(fx, swoosh(0.5), T['ukral'] + 0.6, 0.35, 0.5)
# 11. кепку забирают
place(fx, swoosh(0.6, 200, 2000), T['kepku'] - 0.1, 0.4, -0.4)
# 12. замок, штора, скрип кладовки
place(fx, click(1200, 0.08), T['zaper'] + 0.1, 0.8); place(fx, click(900, 0.08), T['zaper'] + 0.17, 0.6)
place(fx, swoosh(0.9, 150, 2500), T['zad'], 0.5, -0.5)
place(fx, creak(1.6, 140, 210), T['tolko'] + 1.2, 0.35, 0.6)
# 13. Юра облизывает камеру — мокрые чавки
for k in range(5): place(fx, noiseburst(0.16, 200, 1800, 0.01, 0.05), T['lick'] + 0.05 + k * 0.28, 0.45)
place(fx, click(700, 0.12), T['sid'], 0.35)  # стук сиденья
# 15-16. свет гаснет, шаги и скрип половицы за спиной
place(fx, click(900, 0.06), T['za'], 0.6)
for k in range(2): place(fx, step(), T['za'] + 0.4 + k * 0.5, 0.35, -0.5)
place(fx, creak(1.1, 120, 170), T['polov'] - 0.1, 0.6, -0.4)
# 19. «П*здец» — удар
place(fx, thud(80, 25, 1.8, 1.0), T['pzd'], 1.0)
place(fx, noiseburst(0.8, 60, 3000, 0.002, 0.25), T['pzd'], 0.6)

def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    y = (x * 32767).astype('<i2')
    with wave.open(name, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes())
save('bed.wav', bed); save('sfx.wav', fx)
print('ok', END)

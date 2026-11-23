"""Синтез звуковых эффектов для «Странного сигнала» (numpy → wav 48 кГц моно).
python3 synth.py <out_dir>"""
import sys, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)
OUT = sys.argv[1] if len(sys.argv) > 1 else '.'


def save(name, x, peak=0.9):
    x = np.asarray(x, dtype=np.float64)
    m = np.max(np.abs(x)) or 1
    y = (x / m * peak * 32767).astype(np.int16)
    w = wave.open(f'{OUT}/{name}.wav', 'wb')
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes()); w.close()


def t_(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.standard_normal(int(d * SR))


def onepole_lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y


def lp(x, fc):  # быстрый ФНЧ через FFT
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))


def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    H = 1 / np.sqrt(1 + (f / hi) ** 4) * (1 - 1 / np.sqrt(1 + (f / max(lo, 1)) ** 4))
    return np.fft.irfft(X * H, len(x))


def env(d, a, r, curve=2.0):
    t = t_(d); e = np.minimum(1, t / max(a, 1e-4)) * np.clip((d - t) / max(r, 1e-4), 0, 1) ** curve
    return e


def reverb(x, d=1.8, mix=0.35):
    ir = noise(d) * np.exp(-t_(d) * 4.5); ir = lp(ir, 5000)
    y = np.convolve(x, ir)[:len(x) + int(d * SR)] if len(x) < SR * 4 else fftconv(x, ir)
    y = y / (np.max(np.abs(y)) or 1) * np.max(np.abs(x))
    out = np.zeros(len(y)); out[:len(x)] += x * (1 - mix); out += y * mix
    return out


def fftconv(a, b):
    n = len(a) + len(b) - 1; N = 1 << (n - 1).bit_length()
    return np.fft.irfft(np.fft.rfft(a, N) * np.fft.rfft(b, N), N)[:n]


# ── дождь (24 с, бесшовно)
d = 24; r = bp(noise(d), 400, 7000) * 0.6 + lp(noise(d), 900) * 0.5
drops = np.zeros(int(d * SR))
for _ in range(2600):
    i = rng.integers(0, len(drops) - 2000); a = rng.uniform(0.1, 0.6)
    drops[i:i + 600] += a * np.exp(-np.arange(600) / 80) * rng.standard_normal(600)
r += bp(drops, 1500, 9000)
f = int(1.0 * SR); r[:f] *= np.linspace(0, 1, f); r[-f:] *= np.linspace(1, 0, f)
save('rain', r, 0.5)

# ── гул: низкие расстроенные синусы + шорох
t = t_(24)
dr = sum(np.sin(2 * np.pi * fr * t + ph) * a for fr, ph, a in [(55, 0, 1), (55.6, 1, 0.8), (82.4, 2, 0.35), (110.7, 0.5, 0.2), (164.3, 3, 0.08)])
dr *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.07 * t)
dr += lp(noise(24), 300) * 0.4
f = int(2 * SR); dr[:f] *= np.linspace(0, 1, f); dr[-f:] *= np.linspace(1, 0, f)
save('drone', dr, 0.6)

# ── уведомление: жутковатый колокольчик (две ноты, расстроены)
d = 2.0; t = t_(d); x = np.zeros(len(t))
for st, fr in [(0, 1318.5), (0.13, 987.8)]:
    tt = np.clip(t - st, 0, None); e = (t >= st) * np.exp(-tt * 5)
    x += e * (np.sin(2 * np.pi * fr * tt) + 0.4 * np.sin(2 * np.pi * fr * 2.01 * tt) + 0.3 * np.sin(2 * np.pi * (fr * 1.012) * tt))
save('notify', reverb(x, 1.5, 0.4), 0.7)

# ── вибрация телефона: две серии гула 160 Гц
d = 1.4; t = t_(d); g = ((t > 0.05) & (t < 0.5)) | ((t > 0.75) & (t < 1.2))
v = np.sign(np.sin(2 * np.pi * 160 * t)) * 0.6 + np.sin(2 * np.pi * 320 * t) * 0.3
v = lp(v * g, 2500) * (0.8 + 0.2 * np.sin(2 * np.pi * 23 * t))
save('vibrate', v, 0.6)

# ── стингер: диссонансный удар
d = 3.5; t = t_(d); e = np.exp(-t * 1.6) * np.minimum(1, t / 0.008)
s = sum(np.sign(np.sin(2 * np.pi * fr * t)) * 0.25 + np.sin(2 * np.pi * fr * t) for fr in [233.1, 246.9, 349.2, 370.0, 493.9])
s = lp(s, 4000) * e + lp(noise(d), 1500) * np.exp(-t * 8) * 1.5
s += np.sin(2 * np.pi * 45 * t) * np.exp(-t * 3) * 3
save('stinger', reverb(s, 2.2, 0.35), 0.9)

# ── дыхание: медленный вдох/выдох
d = 6.4; t = t_(d); ph = (t % 3.2) / 3.2
e = np.where(ph < 0.45, np.sin(ph / 0.45 * np.pi) * 0.7, np.where(ph < 0.95, np.sin((ph - 0.45) / 0.5 * np.pi), 0)) ** 1.5
b = bp(noise(d), 300, 2500) * e + bp(noise(d), 80, 400) * e * 0.6
save('breath', b, 0.7)

# ── сердцебиение (≈ 60 уд/мин)
d = 6; t = t_(d); h = np.zeros(len(t))
for beat in np.arange(0.1, d, 1.0):
    for off, a in [(0, 1), (0.28, 0.7)]:
        tt = t - beat - off; m = tt >= 0
        h += m * a * np.sin(2 * np.pi * 52 * np.clip(tt, 0, None)) * np.exp(-np.clip(tt, 0, None) * 18)
save('heartbeat', lp(h, 200), 0.9)

# ── глитч
d = 0.7; x = noise(d); t = t_(d)
x = np.round(x * 3) / 3 * (np.sin(2 * np.pi * 37 * t) > 0) + np.sign(np.sin(2 * np.pi * 900 * t)) * ((t * 20).astype(int) % 3 == 0) * 0.5
x *= env(d, 0.005, 0.2)
save('glitch', bp(x, 200, 9000), 0.6)

# ── скрип двери (FM с плавающим тоном)
d = 2.6; t = t_(d); f0 = 180 + 120 * np.sin(2 * np.pi * 0.35 * t) + 40 * rng.standard_normal(1)[0]
phs = 2 * np.pi * np.cumsum(f0) / SR
c = np.sin(phs + 2.5 * np.sin(phs * 3.01)) * (0.6 + 0.4 * (np.sin(2 * np.pi * 13 * t) > 0.3))
c = bp(c, 300, 3500) * env(d, 0.15, 0.6)
save('creak', reverb(c, 1.2, 0.3), 0.7)

# ── свист/вжух (переход)
d = 1.6; t = t_(d); x = noise(d); X = np.zeros(len(x))
seg = 4096
for i in range(0, len(x) - seg, seg // 2):
    c0 = 200 + 2200 * np.sin(np.pi * i / len(x)) ** 2
    X[i:i + seg] += bp(x[i:i + seg], c0 * 0.6, c0 * 1.4) * np.hanning(seg)
save('whoosh', X * env(d, 0.6, 0.8), 0.7)

# ── двигатель автобуса: дизельный рокот
def engine(d, rpm0, rpm1, amp0=1, amp1=1):
    t = t_(d); rpm = np.linspace(rpm0, rpm1, len(t)); f = rpm / 60 * 3
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = sum(np.sin(ph * k + k) / k for k in range(1, 9)) + 0.35 * lp(noise(d), 600)
    x *= (0.8 + 0.2 * np.sign(np.sin(ph * 0.5)))
    return lp(x, 900) * np.linspace(amp0, amp1, len(t))

def hiss(d, a=0.01, r=0.4):
    return bp(noise(d), 2500, 12000) * env(d, a, r)

arr = engine(6, 1400, 650, 0.3, 1.0)
h = hiss(1.6, 0.02, 1.0); arr[int(4.2 * SR):int(4.2 * SR) + len(h)] += h * 1.2
save('bus_arrive', arr, 0.85)
lv = engine(6, 650, 1900, 1.0, 0.15) * np.linspace(1, 0.2, int(6 * SR))
save('bus_leave', lv, 0.85)
do = hiss(1.2, 0.01, 0.9) + np.concatenate([np.zeros(int(0.9 * SR)), lp(noise(0.3), 300) * env(0.3, 0.005, 0.2) * 2])
save('bus_door_open', do, 0.7)
dc = hiss(1.2, 0.01, 0.7) + np.concatenate([np.zeros(int(0.7 * SR)), lp(noise(0.5), 250) * env(0.5, 0.003, 0.3) * 3])
save('bus_door_close', dc, 0.8)
save('bus_idle', engine(12, 650, 650, 1, 1), 0.6)

# ── будильник/цифровой писк
d = 0.9; t = t_(d); x = np.sin(2 * np.pi * 2000 * t) * (((t > 0) & (t < 0.12)) | ((t > 0.25) & (t < 0.37)))
save('clock', x * 0.8, 0.5)
print('ok')

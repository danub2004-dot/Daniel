"""Общая библиотека звукового дизайна серии «Странный сигнал» (только numpy).

Синтез эффектов, фильтры, ревербератор и сведение с озвучкой.
"""
import wave
import numpy as np

SR = 48000
rng = np.random.default_rng(7)

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

def chirp():
    """Короткое птичье «чирик» (утро)."""
    t = tt(0.16); f = 3200 + 1800 * np.sin(np.pi * t / 0.16)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / 0.16) ** 2 * 0.4
def door_hiss(d=0.9):
    """Пневматика автобусной двери: шипение + стук в конце."""
    t = tt(d); s = band(rng.standard_normal(len(t)), 2500, 11000) * np.exp(-t / (d * 0.5)) * env_ad(d, 0.02)
    th = thud(); out = np.zeros(len(t) + len(th)); out[:len(t)] += s; out[len(t) - int(0.05 * SR):len(t) - int(0.05 * SR) + len(th)] += th * 0.8
    return out
def thud():
    t = tt(0.5); f = 60 + 80 * np.exp(-t / 0.03)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.09)
    s += band(rng.standard_normal(len(t)), 80, 1500) * np.exp(-t / 0.02) * 0.6
    return reverb(s, 0.2, 0.8)
def lights_on():
    """Щелчок рубильника и вспыхнувшие лампы."""
    c = thud() * 0.6; t = tt(0.25); c[:len(t)] += band(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-t / 0.01)
    return c
def digital_beep2():
    return np.concatenate([beep(1760, .09), np.zeros(int(.08 * SR)), beep(1760, .09)])
def engine(n, rpm):
    """Дизель: rpm — огибающая оборотов (0..1) длины n."""
    t = np.arange(n) / SR; f0 = 32 + 18 * rpm
    ph = 2 * np.pi * np.cumsum(f0) / SR
    s = 0.6 * np.sin(ph) + 0.3 * np.sin(2 * ph) + 0.15 * np.sign(np.sin(3 * ph))
    br = np.cumsum(rng.standard_normal(n)); br = band(br - br.mean(), 30, 300); br = br / (np.max(np.abs(br)) + 1e-9)
    return band(s, 25, 500) * 0.5 + br * 0.5

def mix_with_voice(L, R, voice_path, out_path, sfx_gain=1.4):
    """Озвучка по центру + эффекты с лёгким даккингом под голос → стерео wav."""
    N = len(L)
    w = wave.open(voice_path); assert w.getframerate() == SR
    v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
    voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
    ve = np.sqrt(np.maximum(band(voice ** 2, None, 4), 0)); ve = np.clip(ve / (np.max(ve) + 1e-9) * 3, 0, 1)
    duck = 1 - 0.35 * ve
    voice = norm(voice, 0.75)
    mL = voice + L * duck * sfx_gain; mR = voice + R * duck * sfx_gain
    peak = max(np.max(np.abs(mL)), np.max(np.abs(mR)))
    if peak > 0.97: mL, mR = mL * 0.97 / peak, mR * 0.97 / peak
    out = (np.stack([mL, mR], 1) * 32767).astype(np.int16)
    o = wave.open(out_path, 'wb'); o.setnchannels(2); o.setsampwidth(2); o.setframerate(SR); o.writeframes(out.tobytes()); o.close()
    return peak

class Track:
    """Стерео-дорожка эффектов длины d секунд."""
    def __init__(self, d):
        self.N = int(d * SR); self.L = np.zeros(self.N); self.R = np.zeros(self.N); self.T = np.arange(self.N) / SR
    def put(self, x, t0, g=1.0, pan=0.0):
        i = int(t0 * SR)
        if i < 0: x = x[-i:]; i = 0
        x = x[:max(0, self.N - i)]
        self.L[i:i + len(x)] += x * g * (1 - pan) ** 0.5 * 0.7071
        self.R[i:i + len(x)] += x * g * (1 + pan) ** 0.5 * 0.7071
    def envelope(self, points):
        xs, ys = zip(*points); return np.interp(self.T, xs, ys)
    def rain(self, env, gain=0.06, muffled=None):
        for ch, sd in ((self.L, 11), (self.R, 12)):
            r = band(np.random.default_rng(sd).standard_normal(self.N), 900, 9000)
            drops = band((np.random.default_rng(sd + 5).random(self.N) < 0.0009).astype(float) * np.random.default_rng(sd + 6).standard_normal(self.N), 1500, 9000) * 6
            x = norm(r * 0.8 + drops)
            ch += x * env * gain
            if muffled is not None: ch += norm(band(x, None, 700)) * muffled * gain * 1.2
    def drone(self, env, gain=0.07):
        T = self.T; dr = np.zeros(self.N)
        for f, a in [(55, .5), (55.4, .4), (82.4, .25), (110.3, .12), (164.8, .05)]:
            dr += a * np.sin(2 * np.pi * f * T + f)
        dr *= 0.7 + 0.3 * np.sin(2 * np.pi * T / 9)
        dr += band(rng.standard_normal(self.N), 40, 260) * 0.6
        self.put(norm(dr) * env, 0, gain)

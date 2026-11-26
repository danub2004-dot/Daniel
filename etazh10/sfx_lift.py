"""Звуки лифта для «Десятого этажа»: python3 sfx_lift.py <out_dir>"""
import sys, wave
import numpy as np
SR = 48000; rng = np.random.default_rng(3); OUT = sys.argv[1]
def save(n, x, pk=0.9):
    x = np.asarray(x, float); x = x / (np.max(np.abs(x)) or 1) * pk
    w = wave.open(f'{OUT}/{n}.wav', 'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
t_ = lambda d: np.arange(int(d * SR)) / SR
def lp(x, fc):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); return np.fft.irfft(X / np.sqrt(1 + (f / fc) ** 4), len(x))
def bp(x, lo, hi):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR)
    return np.fft.irfft(X / np.sqrt(1 + (f / hi) ** 4) * (1 - 1 / np.sqrt(1 + (f / lo) ** 4)), len(x))
# гул мотора лифта (бесшовно, 10 с)
d = 10; t = t_(d)
h = sum(np.sin(2 * np.pi * f * t) * a for f, a in [(50, 1), (100, .5), (150, .25), (300, .08)]) * (0.85 + 0.15 * np.sin(2 * np.pi * 0.4 * t))
h += lp(rng.standard_normal(len(t)), 400) * 0.5 + bp(rng.standard_normal(len(t)), 1500, 4000) * 0.05
f = SR; h[:f] *= np.linspace(0, 1, f); h[-f:] *= np.linspace(1, 0, f); save('lift_hum', h, 0.6)
# «дзынь» прибытия
d = 2.2; t = t_(d); e = np.exp(-t * 2.6)
x = e * (np.sin(2 * np.pi * 880 * t) + 0.5 * np.sin(2 * np.pi * 1760 * t) + 0.3 * np.sin(2 * np.pi * 2645 * t)); save('lift_ding', x, 0.6)
# двери: скольжение + удар
d = 1.6; t = t_(d); env = np.clip(t / 0.1, 0, 1) * np.clip((1.2 - t) / 0.3, 0, 1)
x = bp(rng.standard_normal(len(t)), 300, 2500) * env * 0.6 + lp(rng.standard_normal(len(t)), 200) * env
k = int(1.2 * SR); x[k:k + 9600] += lp(rng.standard_normal(9600), 180) * np.exp(-np.arange(9600) / 1500) * 4
x[k:k + 9600] += np.sin(2 * np.pi * 420 * np.arange(9600) / SR) * np.exp(-np.arange(9600) / 2500) * 0.6; save('lift_doors', x, 0.8)
# щелчок кнопки
d = 0.25; t = t_(d); x = np.exp(-t * 90) * bp(rng.standard_normal(len(t)), 1500, 8000) + np.exp(-t * 60) * np.sin(2 * np.pi * 1900 * t) * 0.3; save('button', x, 0.7)
# жужжание лампы
d = 8; t = t_(d); x = np.sign(np.sin(2 * np.pi * 100 * t)) * 0.3 + np.sin(2 * np.pi * 200 * t) * 0.2
x = bp(x, 80, 3000) * (0.6 + 0.4 * (rng.random(len(t)) > 0.002)); f = SR // 2; x[:f] *= np.linspace(0, 1, f); x[-f:] *= np.linspace(1, 0, f); save('bulb_buzz', x, 0.4)
# шаги (кеды по плитке), 6 шагов
d = 3.2; x = np.zeros(int(d * SR))
for i in range(6):
    k = int((0.1 + i * 0.5) * SR); n = 4000
    x[k:k + n] += lp(rng.standard_normal(n), 900) * np.exp(-np.arange(n) / 500)
save('steps', x, 0.6)
print('ok')

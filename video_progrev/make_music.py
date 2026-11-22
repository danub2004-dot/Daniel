#!/usr/bin/env python3
"""Генерирует оригинальный бодрый поп-бит (без авторских прав) в build/music.wav."""
import os, sys, wave
import numpy as np

SR = 44100
BPM = 120
BEAT = 60 / BPM
LENGTH = float(sys.argv[1]) if len(sys.argv) > 1 else 32.0
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "build", "music.wav")

n = int(LENGTH * SR) + SR
mix = np.zeros((n, 2))
rng = np.random.default_rng(7)


def add(sig, t, pan=0.0, gain=1.0):
    i = int(t * SR)
    if i >= n:
        return
    sig = sig[: n - i] * gain
    mix[i:i + len(sig), 0] += sig * (1 - pan) ** 0.5 if pan > 0 else sig
    mix[i:i + len(sig), 1] += sig * (1 + pan) ** 0.5 if pan < 0 else sig


def env(length, a=0.005, d=0.2):
    t = np.arange(int(length * SR)) / SR
    return np.minimum(t / a, 1) * np.exp(-t / d)


def kick():
    t = np.arange(int(0.35 * SR)) / SR
    f = 50 + 110 * np.exp(-t * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def clap():
    l = int(0.25 * SR)
    noise = rng.standard_normal(l)
    noise = np.diff(noise, prepend=0)  # высокочастотный оттенок
    return noise * env(0.25, 0.001, 0.07) * 0.5


def hat(open_=False):
    l = 0.18 if open_ else 0.05
    x = np.diff(rng.standard_normal(int(l * SR)), prepend=0)
    return x * env(l, 0.001, 0.06 if open_ else 0.012) * 0.25


def saw(freq, length, cutoff_decay=0.25):
    t = np.arange(int(length * SR)) / SR
    s = sum(np.sin(2 * np.pi * freq * k * t) / k * np.exp(-k * 0.12 - t * k / (cutoff_decay * 40))
            for k in range(1, 12))
    return s


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


# Прогрессия: C - G - Am - F (по такту)
CHORDS = [[60, 64, 67], [55, 59, 62, 67], [57, 60, 64], [53, 57, 60, 65]]
BASS = [36, 43, 45, 41]
MELODY = [  # (доля, нота) в рамках 4 тактов — 16 долей
    (0, 72), (0.5, 74), (1, 76), (2, 79), (2.5, 76), (3, 74),
    (4, 74), (4.5, 76), (5, 79), (6, 81), (7, 79),
    (8, 76), (8.5, 74), (9, 72), (10, 76), (11, 74),
    (12, 72), (12.5, 74), (13, 77), (14, 76), (15, 72),
]

bars = int(LENGTH / (4 * BEAT)) + 1
for bar in range(bars):
    t0 = bar * 4 * BEAT
    ch = bar % 4
    intro = bar < 1
    for b in range(4):
        tb = t0 + b * BEAT
        if not intro:
            add(kick(), tb, gain=0.9)
        if b in (1, 3):
            add(clap(), tb, gain=0.8)
        for e in range(2):
            add(hat(open_=(e == 1 and b == 3)), tb + e * BEAT / 2, pan=0.3)
        # пульсирующие аккорды на восьмых
        for e in range(2):
            ts = tb + e * BEAT / 2
            for m in CHORDS[ch]:
                add(saw(note(m), BEAT / 2) * env(BEAT / 2, 0.01, 0.15), ts, pan=-0.2, gain=0.05)
        # бас на восьмых (с офф-битом)
        if not intro:
            for e in range(2):
                ts = tb + e * BEAT / 2
                add(np.sin(2 * np.pi * note(BASS[ch]) * np.arange(int(BEAT / 2 * SR)) / SR)
                    * env(BEAT / 2, 0.005, 0.12), ts, gain=0.45)
    # мелодия во второй половине каждых 8 тактов
    if not intro and (bar // 4) % 2 == 1 or bar >= 4:
        for beat, m in MELODY:
            if int(beat // 4) == bar % 4:
                tb = t0 + (beat % 4) * BEAT
                add(saw(note(m), BEAT * 0.5, 0.15) * env(BEAT * 0.5, 0.005, 0.18), tb, pan=0.15, gain=0.07)

mix = mix[: int(LENGTH * SR)]
# мягкий фейд и нормализация
fade = int(1.5 * SR)
mix[-fade:] *= np.linspace(1, 0, fade)[:, None]
mix = np.tanh(mix / np.max(np.abs(mix)) * 1.4) * 0.9
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print(OUT)

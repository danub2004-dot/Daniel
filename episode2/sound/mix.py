#!/usr/bin/env python3
"""Сведение звука серии 2 «Две спички»: голос + тихий мрачный фон (≈19 дБ тише голоса) + редкие эффекты.
Все эффекты привязаны к словам озвучки (words.json). Итог: mix.wav (48 кГц, стерео), без финальной нормализации.
Запуск: python3 mix.py  (из папки episode1/sound)"""
import json, subprocess, re, numpy as np, os

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
EP = os.path.dirname(HERE)
WORDS = json.load(open(os.path.join(EP, 'words.json')))
W = lambda i: WORDS[i]['s']
END_VOICE = WORDS[-1]['e']
DUR = 86.8
N = int(DUR * SR)


def load(path, af=None):
    cmd = ['ffmpeg', '-v', 'error', '-i', path]
    if af: cmd += ['-af', af]
    cmd += ['-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32)
    return x.reshape(-1, 2).astype(np.float64)


def lufs(x):
    p = os.path.join('/tmp', 'm_%d.wav' % os.getpid())
    write(p, x)
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', p, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1])


def write(p, x):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f64le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', p],
                   input=np.ascontiguousarray(x).tobytes(), check=True)


def db(g): return 10 ** (g / 20)


def env(points):
    """Огибающая громкости: [(время, дБ), …] — линейно в дБ между точками; -90 = тишина."""
    t = np.arange(N) / SR
    ts, gs = zip(*points)
    g = np.interp(t, ts, gs)
    a = db(g); a[g <= -89] = 0
    return a[:, None]


def bed(x, gain_env):
    """Длинная подложка: зацикливаем с перекрёстным переходом до длины ролика."""
    out = np.zeros((N, 2)); pos = 0; fade = SR * 2
    while pos < N:
        seg = x[: min(len(x), N - pos)].copy()
        if pos > 0:
            k = min(fade, len(seg)); ramp = np.linspace(0, 1, k)[:, None]
            seg[:k] *= ramp; out[pos:pos + k] *= (1 - ramp)
        out[pos:pos + len(seg)] += seg
        pos += len(seg) - fade if len(seg) == len(x) else len(seg)
    return out * gain_env


def place(track, x, at, gain_db=0.0):
    i = int(at * SR)
    if i >= N: return
    seg = x[: N - i] * db(gain_db)
    track[i:i + len(seg)] += seg


S = lambda n: os.path.join(EP, '..', 'episode1', 'sound', 'src', n)  # те же CC0-звуки, что в серии 1

# --- голос ---
voice = np.zeros((N, 2)); v = load(os.path.join(EP, 'voice.mp3')); voice[:len(v)] = v[:N]
LV = lufs(voice[: int(END_VOICE * SR)])

# --- фон: дрон + ночной лес + ветер + треск факела ---
drone = load(S('drone.mp3'), 'lowpass=f=1800,highpass=f=35')
forest = load(S('forest.mp3'), 'highpass=f=120,lowpass=f=6000')
wind = load(S('wind.mp3'), 'highpass=f=80,lowpass=f=1500')
fire = load(S('fire.mp3'), 'highpass=f=60')
T_END = END_VOICE + .4
IN, OUT = W(6), W(62)          # внутри палатки (лес глуше)
TORCH0, TORCH1 = W(73) + .1, W(135)
drone_t = bed(drone, env([(0, -40), (1.5, 0), (W(40), 0), (W(42), 2), (W(55), 2), (W(56), 0), (W(117), 0), (W(127), 2), (W(134), 3), (T_END, 3), (T_END + .3, -6), (DUR - 2, -6), (DUR, -40)]))
forest_t = bed(forest, env([(0, -40), (1, 0), (IN, 0), (IN + .4, -10), (OUT, -10), (OUT + .4, 0), (W(134), 0), (W(136), -6), (T_END, -6), (T_END + .3, -90), (DUR, -90)]))
wind_t = bed(wind, env([(0, -90), (.1, -3), (IN, -3), (IN + .4, -14), (OUT, -14), (OUT + .5, -3), (T_END, -1), (T_END + .3, -90), (DUR, -90)]))
fire_t = bed(fire, env([(0, -90), (TORCH0, -90), (TORCH0 + .3, 0), (W(78), 0), (W(78) + .2, -3), (W(117), -3), (W(127), -6), (TORCH1 - .2, -6), (TORCH1 + .5, -90), (DUR, -90)]))
bedmix = drone_t * db(-6) + forest_t + wind_t * db(-3) + fire_t * db(-4)
LB = lufs(bedmix[: int(END_VOICE * SR)])
bedmix *= db((LV - 19) - LB)

# --- редкие эффекты ---
fx = np.zeros((N, 2))
bird = load(S('bird2.mp3'), 'atrim=0:2.2,asetrate=11520,aresample=48000,highpass=f=200,aecho=0.8:0.6:180|420:0.35|0.18,afade=t=out:st=2.4:d=0.6')
match = load(S('match.mp3'), 'atrim=0:1.4')
steps = load(S('steps.mp3'), 'lowpass=f=4000')
scrape = load(S('steps.mp3'), 'asetrate=33075,aresample=48000,lowpass=f=2500')
creak = load(S('creak.mp3'), 'asetrate=37485,aresample=48000,lowpass=f=3500')
tentfx = load(S('tent.mp3'))
boom = load(S('boom.mp3'), 'atrim=6.0:11.9,asetpts=PTS-STARTPTS,lowpass=f=900')
burst = load(S('fire.mp3'), 'atrim=3:5,asetpts=PTS-STARTPTS,afade=t=in:d=0.15,afade=t=out:st=1.4:d=0.6')
place(fx, tentfx, W(5) + .2, -10)           # входит в палатку
place(fx, bird, W(16) + .5, -18)             # далёкий крик после «ржавый»
place(fx, match, W(40) + .05, -4)           # «Чиркаю спичкой»
place(fx, boom, W(61) - .05, -14)           # «одна»
place(fx, scrape[: int(2.0 * SR)], W(69), -12)  # разгребает пепел
place(fx, burst, W(73) + .05, -6)           # факел вспыхивает
place(fx, steps[: int(3.0 * SR)], W(86) - .2, -14)  # шаги по тропе
place(fx, bird, W(92) + .3, -14)            # птица летит
place(fx, bird, W(97) - .15, -2)             # «И кричит»
place(fx, creak, W(101), -20)                # «к забору»
place(fx, bird, W(112) - .2, -12)           # садится на плечо
place(fx, steps[int(1.0 * SR): int(3.0 * SR)], W(117), -16)
place(fx, boom, W(132) - .05, -10)          # «На второй год»
place(fx, boom, END_VOICE + .25, -6)        # обрыв в темноту
place(fx, bird, END_VOICE + 1.9, -14)
LF = lufs(fx)
fx *= db((LV - 16) - LF)

mix = voice + bedmix + fx
write(os.path.join(HERE, 'mix.wav'), mix)
print('voice LUFS %.1f | bed LUFS %.1f (target %.1f) | fx LUFS %.1f' % (LV, lufs(bedmix[: int(END_VOICE * SR)]), LV - 19, lufs(fx)))
print('mix LUFS %.1f, peak %.2f' % (lufs(mix), np.abs(mix).max()))

#!/usr/bin/env python3
"""Сведение звука серии 1: голос + тихий мрачный фон (≈19 дБ тише голоса) + редкие эффекты.
Все эффекты привязаны к словам озвучки (words.json). Итог: mix.wav (48 кГц, стерео), без финальной нормализации.
Запуск: python3 mix.py  (из папки episode1/sound)"""
import json, subprocess, re, numpy as np, os

SR = 48000
HERE = os.path.dirname(os.path.abspath(__file__))
EP = os.path.dirname(HERE)
WORDS = json.load(open(os.path.join(EP, 'words.json')))
W = lambda i: WORDS[i]['s']
END_VOICE = WORDS[-1]['e']
DUR = 78.5
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


S = lambda n: os.path.join(HERE, 'src', n)

# --- голос ---
voice = np.zeros((N, 2)); v = load(os.path.join(EP, 'voice.mp3')); voice[:len(v)] = v[:N]
LV = lufs(voice[: int(END_VOICE * SR)])

# --- фон: дрон + ночной лес + ветер (всё приглушено и затемнено фильтрами) ---
drone = load(S('drone.mp3'), 'lowpass=f=1800,highpass=f=35')
forest = load(S('forest.mp3'), 'highpass=f=120,lowpass=f=6000')
wind = load(S('wind.mp3'), 'highpass=f=80,lowpass=f=1500')
rain = load(S('rain.mp3'), 'highpass=f=300')
fire = load(S('fire.mp3'), 'highpass=f=60')
T_END = END_VOICE + .4
drone_t = bed(drone, env([(0, -40), (1.5, 0), (W(10), 0), (W(10) + .5, 2), (W(23), 2), (W(23) + .5, 0), (W(109), 0), (W(114), 2), (T_END, 3), (T_END + .3, -6), (DUR - 2, -6), (DUR, -40)]))
forest_t = bed(forest, env([(0, -40), (1, 0), (W(10) - .2, 0), (W(10), -90), (W(23), -90), (W(23) + .3, 0), (W(57), 0), (W(57) + 1, -4), (T_END, -4), (T_END + .3, -90), (DUR, -90)]))
wind_t = bed(wind, env([(0, -90), (.1, -4), (W(10) - .2, -4), (W(10), -90), (W(42), -90), (W(42) + .5, -2), (W(57), -2), (W(57) + .5, -90), (W(109), -90), (W(109) + .5, -4), (T_END, -2), (T_END + .3, -90), (DUR, -90)]))
rain_t = bed(rain, env([(0, -90), (W(81), -90), (W(81) + 1, 0), (W(99), 0), (W(99) + 1, -90), (DUR, -90)]))
fire_t = bed(fire, env([(0, -90), (W(10), -90), (W(10) + .2, 4), (W(23) - .2, 4), (W(23), -90),
                        (W(68), -90), (W(68) + 1, 2), (W(81), 2), (W(81) + .3, -6), (W(86), -6), (W(86) + .2, -90),
                        (W(99), -90), (W(99) + .3, -10), (W(109), -10), (W(109) + .2, -90), (DUR, -90)]))
bedmix = drone_t * db(-6) + forest_t + wind_t * db(-3) + rain_t + fire_t * db(-4)
# фон ровно на 19 дБ тише голоса (по интегральной громкости на участке с голосом)
LB = lufs(bedmix[: int(END_VOICE * SR)])
bedmix *= db((LV - 19) - LB)

# --- редкие эффекты ---
fx = np.zeros((N, 2))
bird = load(S('bird2.mp3'), 'atrim=0:2.2,asetrate=11520,aresample=48000,highpass=f=200,aecho=0.8:0.6:180|420:0.35|0.18,afade=t=out:st=2.4:d=0.6')
match = load(S('match.mp3'), 'atrim=0:1.4')
steps = load(S('steps.mp3'), 'lowpass=f=4000')
creak = load(S('creak.mp3'), 'asetrate=37485,aresample=48000,lowpass=f=3500')
tentfx = load(S('tent.mp3'))
boom = load(S('boom.mp3'), 'atrim=6.0:11.9,asetpts=PTS-STARTPTS,lowpass=f=900')
place(fx, bird, W(51) - .15, -2)            # «кричит птица»
place(fx, bird, W(88), -16)                  # далёкий крик на дороге
place(fx, bird, W(125) - .2, -6)            # «сгорела»
place(fx, bird, END_VOICE + 1.9, -12)       # на титре
place(fx, match, W(67) + .02, -4)          # «развожу» — чирк
place(fx, match, W(92) + .15, -4)          # «Чиркаю спичкой»
place(fx, steps[: int(2.4 * SR)], W(86) - .4, -14)  # шаги по дороге
place(fx, creak, W(43), -20)                 # «у забора»
place(fx, creak, W(85) - .1, -18)          # «за забором» — калитка
place(fx, creak, W(118), -22)                # верёвки палатки
place(fx, tentfx, W(118) + .3, -12)
place(fx, tentfx, W(120), -12)
place(fx, boom, W(108) - .05, -10)         # «С братом»
place(fx, boom, END_VOICE + .25, -6)       # обрыв в темноту
# эффекты держим заметно тише голоса
LF = lufs(fx)
fx *= db((LV - 16) - LF)

mix = voice + bedmix + fx
write(os.path.join(HERE, 'mix.wav'), mix)
write(os.path.join(HERE, 'bed_only.wav'), bedmix + fx)
print('voice LUFS %.1f | bed LUFS %.1f (target %.1f) | fx LUFS %.1f' % (LV, lufs(bedmix[: int(END_VOICE * SR)]), LV - 19, lufs(fx)))
print('mix LUFS %.1f, peak %.2f' % (lufs(mix), np.abs(mix).max()))

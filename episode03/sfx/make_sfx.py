"""Звуковой дизайн серии 3 «Черновики»: эффекты по таймингу слов + сведение с озвучкой.

python3 make_sfx.py  →  sfx/mix.wav (48 кГц, стерео). Границы сцен — как в anim/anim.js.
"""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, f'{HERE}/../../common')
from sfxlib import *

T_END = 78.0
W = json.load(open(f'{HERE}/../anim/words.json'))['words']
LINES = {}
for w in W: LINES.setdefault(w['line'], []).append(w)
ls = lambda i: LINES[i][0]['s']
le = lambda i: LINES[i][-1]['e']
def wt(line, sub, k=0):
    return [w for w in LINES[line] if sub.lower() in w['w'].lower()][k]['s']
B = [0] + [ls(i) - 0.3 for i in range(1, len(LINES))] + [T_END]
tEnd = le(16) + 0.5

tr = Track(T_END); put = tr.put; T = tr.T
def scenes(vals, ramp=0.1):
    pts = []
    for i, v in enumerate(vals):
        pts += [(B[i] + (ramp if i else 0), v), (B[i + 1], v)]
    return tr.envelope(pts)

def creak(d=0.9):
    t = tt(d); f = 38 + 20 * np.sin(np.pi * t / d)
    pulses = (np.sin(2 * np.pi * np.cumsum(f) / SR) > 0.97).astype(float)
    return band(pulses, 300, 2200) * np.sin(np.pi * t / d) * 3
def tap():
    t = tt(0.04); return band(rng.standard_normal(len(t)), 2000, 9000) * np.exp(-t / 0.004)

#           0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16
DRONE   = [.6, .3, .35, .4, .6, .9, .8, .9, 1, 1, .9, .3, 1, 1, 1.1, 1.2, 1.2]
BREATH  = [0,  0,  0,  0,  0,  0, .25, 0, .5, .8, .5, .4, 0,  0, .3,  0, .35]   # тот, под одеялом
tr.drone(scenes(DRONE) * (T < tEnd), 0.07)
tr.rain(scenes([.2] + [0] * 16), 0.06)

# дыхание спящего (ритм 1.7 с, как анимация одеяла); после «сел» — тишина
br = breath_track(T_END, seed=5) * scenes(BREATH)
br *= np.interp(T, [0, wt(9, 'моим') - 0.3, wt(9, 'моим') + 0.6, T_END], [1, 1, 1.6, 1.6])
put(norm(br), 0, 0.18, 0.45)

# 0 · кабина: салон, двери, поехали
put(norm(engine(int(B[1] * SR), np.interp(tt(B[1]), [0, wt(0, 'поехал'), B[1]], [0.2, 0.2, 1]))) * fade(np.ones(int(B[1] * SR)), .1, 1.2), 0, 0.12)
put(whispers(B[1]), 0, 0.12)
put(door_hiss(0.9), wt(0, 'закрыл'), 0.3, 0.5)
# 1 · утро: птицы, часы, ботинки
for k in [0.3, 0.5, 1.6, 1.8, 2.9, 3.6, 4.4]: put(chirp(), B[1] + k, 0.05, 0.5)
for i in (1, 2, 3):
    for k in np.arange(B[i], B[i + 1], 1.0): put(click(), k, 0.035, -0.3)
put(whoosh(0.6, 300, 4000), wt(1, 'проснулся'), 0.08)
put(sting(2.5, 247), wt(1, 'ботинках') - 0.2, 0.12)
# 2 · Тёма листает телефон
for k in [0.4, 0.9, 1.3, 2.2, 2.6]: put(tap(), B[2] + k, 0.12)
# 4 · «Отправленные»: сообщения всплывают
put(tap(), wt(4, 'открыл'), 0.15)
for s in ('окно', 'остановку', 'ключи'): put(beep(1320, 0.07), wt(4, s) - 0.2, 0.08)
# 5 · Отправитель — я
put(boom(), wt(5, 'я.') - 0.1, 0.4)
# 6 · 02:47, каждую ночь
put(digital_beep2(), B[6] + 0.2, 0.1)
for k in range(4): put(click(), wt(6, 'каждую') - 0.2 + k * 0.18, 0.12)
# 7 · черновики: печатает курсор, «кровать»
for k in np.arange(wt(7, '«не') - 0.1, wt(7, 'кровать') + 0.4, 0.13): put(tap(), k, 0.08)
put(sting(3, 196), wt(7, 'кровать'), 0.18)
# 8 · рывок к кровати
put(whoosh(0.7, 200, 5000), B[8] + 0.05, 0.2)
# 9 · «моим дыханием»
put(sting(3, 155), wt(9, 'моим') - 0.2, 0.15)
# 11 · молчание: только мигание лампы
for t0 in np.arange(B[11], B[12], 0.1):
    if np.random.default_rng(int(t0 * 10) + 3).random() > 0.85: put(click(), t0, 0.07)
# 12 · тот садится: скрип, телефон, печать
put(creak(1.1), wt(12, 'сел') - 0.5, 0.25, 0.4)
put(click(), wt(12, 'телефон') - 0.1, 0.2, 0.4)
for k in np.arange(wt(12, 'печатать') - 0.4, B[13] + 0.6, 0.11): put(tap(), k + 0.03 * np.sin(k * 17), 0.1, 0.4)
# 13 · вибрация и сообщение
put(vibrate(1.2), wt(13, 'завибрировал'), 0.25)
put(ping(), wt(13, 'ложись') - 0.2, 0.22)
# 14 · часы: 07:40 → 02:47
for k in np.arange(B[14] + 0.2, wt(14, 'два') - 0.15, 1 / 3): put(beep(1760, 0.04), k, 0.04)
put(boom(), wt(14, 'два') - 0.15, 0.35)
# 15 · дыхание в наушниках — моё
bb = breath_track(B[16] - B[15], phone=True, seed=6); put(fade(bb, .3, .6), B[15], 0.45)
put(sting(3.5, 175), wt(15, 'моё') - 0.2, 0.22)
put(boom(3), wt(15, 'сне'), 0.2)
# 16 · сообщение Тёме, окно, титр
put(ping(), wt(16, 'тёме'), 0.24)
put(whoosh(1.2, 150, 2000), wt(16, 'окно') - 0.3, 0.12)
put(boom(4), tEnd + 0.2, 0.3); put(sting(3.5, 233), tEnd + 0.2, 0.25)

peak = mix_with_voice(tr.L, tr.R, f'{HERE}/../anim/voice_edit.wav', f'{HERE}/mix.wav')
print('mix.wav', T_END, 's, peak', round(peak, 3))

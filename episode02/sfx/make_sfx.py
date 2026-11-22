"""Звуковой дизайн серии 2 «Правила»: эффекты по таймингу слов + сведение с озвучкой.

python3 make_sfx.py  →  sfx/mix.wav (48 кГц, стерео). Границы сцен — как в anim/anim.js.
"""
import json, os, sys
import numpy as np
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, f'{HERE}/../../common')
from sfxlib import *

T_END = 91.0
W = json.load(open(f'{HERE}/../anim/words.json'))['words']
LINES = {}
for w in W: LINES.setdefault(w['line'], []).append(w)
ls = lambda i: LINES[i][0]['s']
le = lambda i: LINES[i][-1]['e']
def wt(line, sub, k=0):
    return [w for w in LINES[line] if sub.lower() in w['w'].lower()][k]['s']
B = [0] + [ls(i) - 0.3 for i in range(1, len(LINES))] + [T_END]

tr = Track(T_END); put = tr.put; T = tr.T
def scenes(vals, ramp=0.1):
    """Огибающая по сценам: vals[i] — уровень в сцене i."""
    pts = []
    for i, v in enumerate(vals):
        pts += [(B[i] + (ramp if i else 0), v), (B[i + 1], v)]
    return tr.envelope(pts)

#            0   1   2   3   4   5   6   7   8   9   10  11  12  13  14  15  16  17
BUS     = [0,  0,  1,  .25, 1, .25, .8, 0, .25, .5, .6, .2, .5, .4, .6, .5, .6, .25]  # дизель
RAIN    = [0,  0, .3,  0, .2,  0,  0, .7,  0, .8,  0,  0, .9, .9,  0, .45, 0,  0]
ROOF    = [0,  0,  0,  0,  0,  0, .5,  0,  0,  0, .5,  0,  0,  0, .5, .25, .5, 0]   # дождь по крыше салона
DRONE   = [.5, .5, .5, .9, .7, .9, 1, .6, 1, .7, 1, .9, .8, 1, 1.1, 1.2, 1.1, 1.3]

# дрон (глохнет перед титром), дождь, двигатель
tEnd = le(17) + 0.5
tr.drone(scenes(DRONE) * (T < tEnd), 0.07)
tr.rain(scenes(RAIN), 0.06, muffled=scenes(ROOF))
rpm = np.interp(T, [0, B[9], B[9] + 1.5, T_END], [1, 1, 0.15, 0.15]) + 0.05 * np.sin(T * 0.7)
put(norm(engine(tr.N, rpm)) * scenes(BUS), 0, 0.10)
# жужжание красной лампы на карточках правил
for i in (3, 5, 8, 17):
    t0, t1 = B[i], min(B[i + 1], tEnd); tt_ = np.arange(int((t1 - t0) * SR)) / SR
    put(fade(np.sign(np.sin(2 * np.pi * 50 * tt_)) * 0.2 + np.sin(2 * np.pi * 100 * tt_), .1, .1), t0, 0.012)
    put(whoosh(0.5, 400, 5000), t0 - 0.1, 0.10)   # лист «влетает»

# 0 · «Теперь твоя очередь» → утро
put(ping(), 0.0, 0.18); put(boom(), 0.6, 0.25)
tM = wt(0, 'утром') - 0.15
for k in [0.3, 0.55, 1.4, 1.6, 2.1]: put(chirp(), tM + k, 0.05, 0.5)
for k in np.arange(tM, B[1], 1.0): put(click(), k, 0.035, -0.3)
# 1 · файл
put(ping(), wt(1, 'файл') - 0.2, 0.2)
put(whoosh(0.35, 800, 6000), wt(1, 'правила') - 0.1, 0.08)
put(sting(2.5, 155), wt(1, 'ночная') - 0.1, 0.12)
# 3 · правило 1
put(sting(2.5, 196), wt(3, 'зеркало'), 0.14)
# 4 · полночь, двери, кто-то сел
put(digital_beep2(), wt(4, 'полночь'), 0.12)
put(door_hiss(), wt(4, 'двери'), 0.30, 0.6)
put(step(), wt(4, 'кто-то') - 0.7, 0.10, 0.3); put(step(), wt(4, 'кто-то') - 0.35, 0.10, 0.1)
put(thud(), wt(4, 'кто-то') + 0.05, 0.12)
put(sting(3, 233), wt(4, 'смотрел') - 0.25, 0.2)
# 5 · правило 2
put(boom(3), wt(5, 'отвечай') - 0.1, 0.22)
# салонные лампы: мигание (по тем же правилам, что анимация) — короткие щелчки
for t0 in np.arange(B[6], B[7], 0.1):
    if np.random.default_rng(int(t0 * 10)).random() > 0.86: put(click(), t0, 0.08)
put(sting(3, 175), wt(6, 'голосом'), 0.18)
put(whoosh(1.4, 150, 1200), wt(6, 'марк') - 0.6, 0.08)
# 7 · дом: дверь, замок
put(thud(), wt(7, 'закрыл') + 0.1, 0.25, 0.3)
put(thud(), wt(7, 'закрыл', 1), 0.45, 0.3); put(click(), wt(7, 'закрыл', 1) + 0.15, 0.35, 0.3)
# 8 · правило 3
put(thud(), wt(8, 'двое'), 0.15)
put(boom(), wt(8, 'спал'), 0.35)
# 9 · конечная
put(whoosh(2.0, 150, 2500), B[9] + 0.3, 0.12)
put(door_hiss(0.6), wt(9, 'дом') - 1.0, 0.1)        # тормоза
put(boom(), wt(9, 'дом') - 0.2, 0.3)
put(sting(3, 262), wt(9, 'босиком'), 0.1)
# 10 · «Марк, не открывай»
put(sting(2.5, 185), wt(10, 'марк'), 0.12)
# 11 · 1 %
for k in range(3): put(beep(440, 0.1), wt(11, 'процент') - 0.2 + k * 0.25, 0.12)
put(ping(), wt(11, 'сообщение') + 0.3, 0.22)
# 12 · двери открываются
put(door_hiss(1.0), wt(12, 'открыл') - 0.1, 0.35, 0.4)
# 13 · улыбка
put(sting(3, 294), wt(13, 'улыбнулся'), 0.12)
# 14 · сзади, свет разгорается
put(whoosh(1.6, 100, 900), wt(14, 'прошептал'), 0.08)
put(sting(3, 220), wt(14, 'марк'), 0.2)
# 15 · двое — красная черта
put(whoosh(0.5, 600, 6000), B[15], 0.15); put(thud(), B[15] + 0.45, 0.2)
put(boom(4), wt(15, 'кого') - 0.1, 0.22)
# 16 · экран погас → свет, полный салон
put(powerdown(), wt(16, 'погас') - 0.1, 0.25)
tL = wt(16, 'зажёгся') - 0.1
put(lights_on(), tL, 0.5); put(boom(), tL, 0.35)
for k in [0.1, 0.25, 0.4]: put(click(), tL + k, 0.15)
put(whispers(B[17] - tL + 0.5), tL + 0.1, 0.35)
put(sting(3.5, 207), tL + 0.05, 0.25)
# 17 · правило 4 и титр
put(door_hiss(0.8), wt(17, 'задерживать') + 0.4, 0.25, 0.5)   # двери закрываются
put(boom(4), tEnd + 0.2, 0.3); put(sting(3.5, 233), tEnd + 0.2, 0.25)

peak = mix_with_voice(tr.L, tr.R, f'{HERE}/../anim/voice_edit.wav', f'{HERE}/mix.wav')
print('mix.wav', T_END, 's, peak', round(peak, 3))

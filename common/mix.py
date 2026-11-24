"""Сведение звука: озвучка + фон + эффекты по таймингу слов.
python3 common/mix.py episode02   →  episode02/anim/mix.wav (стерео 48 кГц)"""
import json, sys, wave
import numpy as np

EP = sys.argv[1]
SR = 48000
SFX = 'common/sfx'
W = json.load(open(f'{EP}/anim/words.json'))
LINES = {}
for w in W['words']: LINES.setdefault(w['line'], []).append(w)
ls = lambda i: LINES[i][0]['s']
le = lambda i: LINES[i][-1]['e']
def wt(line, sub, k=0):
    c = [w for w in LINES[line] if sub.lower() in w['w'].lower()]
    return c[k]['s']

def load(path):
    w = wave.open(path); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    assert w.getframerate() == SR
    return x

voice = load(f'{EP}/anim/voice_edit.wav')
if EP == 'episode02':
    T_END = le(11) + 4.4
elif EP == 'episode03':
    T_END = le(12) + 4.4
elif EP == 'episode04':
    T_END = le(10) + 4.4
elif EP == 'episode05':
    T_END = le(9) + 4.4
elif EP == 'episode06':
    T_END = le(10) + 4.4
N = int((T_END + 0.5) * SR)
L = np.zeros(N); R = np.zeros(N)

def put(name, t, gain=1.0, pan=0.0, dur=None, fade=0.05):
    x = load(f'{SFX}/{name}.wav') * gain
    if dur: x = x[:int(dur * SR)]
    f = int(fade * SR)
    if f and len(x) > 2 * f: x[-f:] *= np.linspace(1, 0, f)
    i = int(max(0, t) * SR); x = x[:max(0, N - i)]
    gl, gr = np.sqrt((1 - pan) / 2), np.sqrt((1 + pan) / 2)
    L[i:i + len(x)] += x * gl * 1.41; R[i:i + len(x)] += x * gr * 1.41

def bed(name, t0, t1, gain, fade=1.0, pan=0.0):
    x = load(f'{SFX}/{name}.wav')
    n = int((t1 - t0) * SR)
    reps = int(np.ceil(n / len(x))) + 1
    y = np.tile(x, reps)[:n] * gain
    f = min(int(fade * SR), n // 2)
    if f: y[:f] *= np.linspace(0, 1, f); y[-f:] *= np.linspace(1, 0, f)
    i = int(t0 * SR); y = y[:N - i]
    L[i:i + len(y)] += y; R[i:i + len(y)] += y * (0.85 if pan else 1)

if EP == 'episode02':
    TT = le(11) + 0.7
    bed('drone', 0, TT + 0.5, 0.22, 2.0)
    bed('rain', 0, ls(2) - 0.3, 0.06); bed('rain', ls(2) - 0.5, ls(3) - 0.1, 0.38, 0.4); bed('rain', ls(3) - 0.3, TT, 0.09, 1.0)
    put('notify', wt(0, 'не') - 0.12, 0.5)
    put('heartbeat', 0.0, 0.35)
    put('glitch', wt(1, 'ноль') - 0.1, 0.35)
    put('creak', wt(2, 'открыта') - 0.4, 0.4, pan=0.5)
    put('whoosh', ls(3) - 0.55, 0.4)
    put('heartbeat', ls(4) - 0.2, 0.45)
    put('whoosh', ls(5) - 0.5, 0.25)
    put('breath', wt(6, 'дышит') - 0.25, 0.55, pan=-0.3)
    put('notify', wt(7, 'встань') - 0.15, 0.5)
    put('glitch', wt(7, 'все') - 0.05, 0.3)
    put('whoosh', ls(8) - 0.45, 0.35)
    put('heartbeat', ls(9) - 0.2, 0.55)
    put('stinger', wt(9, 'здесь') + 0.1, 0.45)
    put('breath', ls(10) + 0.2, 0.3)
    put('stinger', ls(11) - 0.25, 0.75)
    put('glitch', TT, 0.45)
elif EP == 'episode04':
    TT = le(10) + 0.7
    tBus = ls(8) - 0.3
    bed('drone', 0, TT + 0.5, 0.22, 2.0)
    bed('rain', 0, ls(7) - 0.3, 0.05); bed('rain', ls(7) - 0.5, ls(10) - 0.2, 0.34, 0.4)
    put('vibrate', 0.0, 0.35)
    put('stinger', wt(0, 'какого') - 0.05, 0.55)
    put('whoosh', ls(1) - 0.45, 0.3)
    put('clock', ls(1) + 0.2, 0.25)
    put('glitch', wt(1, 'кеды') + 0.45, 0.3)
    put('whoosh', ls(2) - 0.45, 0.25)
    put('heartbeat', ls(2), 0.35)
    put('glitch', wt(3, 'нет') - 0.05, 0.4)
    put('glitch', wt(3, 'кольца'), 0.3)
    put('whoosh', ls(4) - 0.45, 0.3)
    put('heartbeat', ls(4), 0.4)
    put('notify', wt(5, 'сообщение') - 0.1, 0.5)
    put('whoosh', ls(6) - 0.45, 0.3)
    put('whoosh', wt(7, 'фары') - 0.6, 0.45)
    put('bus_arrive', tBus - 1.5, 0.6, pan=0.4)
    put('bus_door_open', wt(8, 'двери') - 0.05, 0.55)
    bed('bus_idle', tBus + 3.5, ls(10) - 0.2, 0.22, 0.6)
    put('breath', ls(8) + 2.0, 0.25)
    put('stinger', wt(9, 'пустым') - 0.1, 0.5)
    put('notify', wt(10, 'садись') - 0.15, 0.5)
    put('glitch', wt(10, 'смена') - 0.05, 0.3)
    put('stinger', TT, 0.7)
elif EP == 'episode05':
    TT = le(9) + 0.7
    bed('drone', 0, TT + 0.5, 0.22, 2.0)
    bed('bus_idle', 0, ls(4) - 0.3, 0.3, 0.8)
    bed('bus_idle', ls(7) - 0.3, ls(9) - 0.3, 0.32, 0.4)
    put('bus_door_close', 0.0, 0.45)
    put('stinger', wt(0, 'понял') - 0.05, 0.4)
    for w in ['трасса', 'рынок', 'школа']: put('clock', wt(1, w) - 0.05, 0.2)
    put('whoosh', ls(2) - 0.45, 0.3)
    put('heartbeat', ls(2), 0.4)
    put('whoosh', ls(3) - 0.3, 0.35)
    put('stinger', wt(3, 'зеркале') - 0.3, 0.5)
    put('glitch', wt(4, 'загорелся') - 0.1, 0.3)
    put('notify', wt(4, 'чат') - 0.2, 0.35)
    import numpy as _np
    t0, t1 = wt(5, 'набрали'), le(5) - 0.1
    for k in _np.linspace(t0, t1, 17): put('clock', k, 0.08, dur=0.05)
    put('notify', t1 + 0.2, 0.5)
    put('glitch', ls(6) - 0.3, 0.45)
    bed('rain', ls(6) - 0.3, ls(7) - 0.3, 0.12, 0.3)
    put('heartbeat', ls(6), 0.45)
    put('whoosh', ls(7) - 0.45, 0.3)
    bed('rain', wt(7, 'стоял') - 0.5, ls(8) - 0.3, 0.3, 0.3)
    put('bus_door_close', wt(8, 'тормоз') - 0.1, 0.5)
    put('bus_leave', wt(8, 'не') - 0.2, 0.55)
    put('stinger', wt(8, 'остановился'), 0.5)
    put('notify', wt(9, 'круг') - 0.15, 0.5)
    put('glitch', wt(9, 'сигнал') - 0.05, 0.35)
    put('stinger', TT, 0.7)
elif EP == 'episode06':
    TT = le(10) + 0.7
    bed('drone', 0, TT + 0.5, 0.22, 2.0)
    bed('rain', 0, TT, 0.08, 1.0)
    bed('rain', ls(4) - 0.3, ls(5) - 0.3, 0.3, 0.3)
    put('clock', 0.3, 0.3)
    put('heartbeat', 0.0, 0.35)
    put('glitch', wt(0, 'снова') - 0.05, 0.3)
    put('whoosh', ls(1) - 0.45, 0.25)
    put('breath', wt(1, 'тёма'), 0.2)
    put('vibrate', wt(2, 'завибрировал') - 0.05, 0.6)
    put('notify', wt(2, 'не') - 0.15, 0.45)
    put('heartbeat', ls(3) - 0.2, 0.45)
    put('whoosh', wt(3, 'посмотрел') - 0.3, 0.45)
    put('bus_idle', ls(4) - 0.3, 0.25, dur=7.0, fade=0.6)
    put('stinger', wt(4, 'рулём') - 0.2, 0.5)
    t0, t1 = wt(5, 'сообщение') + 0.1, le(5)
    for k in __import__('numpy').linspace(t0, t1, 7): put('clock', k, 0.08, dur=0.05)
    put('notify', wt(6, 'ты') - 0.2, 0.5)
    put('glitch', wt(6, 'ночь'), 0.3)
    put('creak', ls(7) - 0.1, 0.4, pan=-0.4)
    put('stinger', wt(7, 'глаза') - 0.1, 0.45)
    put('breath', ls(8) - 0.3, 0.3)
    put('glitch', ls(9) - 0.3, 0.4)
    put('heartbeat', ls(9), 0.4)
    put('notify', wt(10, 'выйдешь') - 0.2, 0.5)
    put('stinger', le(10) - 0.4, 0.55)
    put('stinger', TT, 0.7)
else:
    TT = le(12) + 0.7
    tBus, tGo = wt(4, 'подъехал') - 0.25, wt(9, 'автобус') - 0.1
    bed('drone', 0, TT + 0.5, 0.22, 2.0)
    bed('rain', 0, tBus, 0.08); bed('rain', tBus - 0.2, ls(10) - 0.2, 0.32, 0.4); bed('rain', ls(10) - 0.3, ls(12) - 0.3, 0.06); bed('rain', ls(12) - 0.4, TT, 0.36, 0.4)
    put('heartbeat', 0.0, 0.45)
    put('stinger', wt(0, 'посмотрел') - 0.05, 0.4)
    put('glitch', wt(1, 'моргнуло') + 0.33, 0.35)
    put('whoosh', wt(1, 'а', 1) - 0.35, 0.3)
    put('vibrate', wt(2, 'мой') - 0.05, 0.6)
    put('notify', wt(2, 'спасибо') - 0.35, 0.5)
    put('whoosh', ls(3) - 0.4, 0.3)
    put('heartbeat', ls(3), 0.4)
    put('whoosh', wt(4, 'свет') - 0.3, 0.45)
    put('clock', wt(4, 'ровно') - 0.05, 0.35)
    put('bus_arrive', tBus - 0.3, 0.6, pan=0.4)
    bed('bus_idle', tBus + 5.4, tGo + 0.3, 0.22, 0.6)
    put('bus_door_open', wt(7, 'открыл') - 0.05, 0.55)
    put('stinger', wt(7, 'улыбнулся') - 0.1, 0.6)
    put('breath', ls(8), 0.25)
    put('bus_door_close', wt(9, 'закрылись') - 0.1, 0.6)
    put('bus_leave', tGo, 0.6, pan=-0.4)
    put('notify', wt(10, 'следующий') - 0.15, 0.5)
    put('glitch', wt(10, 'опаздывай') - 0.05, 0.3)
    put('whoosh', ls(11) - 0.45, 0.3)
    put('heartbeat', ls(12) - 0.2, 0.45)
    put('stinger', TT, 0.7)

# голос по центру, лёгкий «компрессор» фона под голосом
vv = np.zeros(N); vv[:len(voice)] = voice[:N]
envv = np.convolve(np.abs(vv), np.ones(2400) / 2400, mode='same')
duck = 1 - 0.35 * np.clip(envv / (np.max(envv) * 0.25), 0, 1)
L = L * duck + vv * 1.0; R = R * duck + vv * 1.0
m = max(np.max(np.abs(L)), np.max(np.abs(R)))
L, R = L / m * 0.95, R / m * 0.95
y = (np.stack([L, R], 1) * 32767).astype(np.int16)
w = wave.open(f'{EP}/anim/mix.wav', 'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes()); w.close()
print(EP, 'mix', round(N / SR, 2), 's')

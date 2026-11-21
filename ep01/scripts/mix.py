# Сведение: голос + тихий мрачный фон (~19 дБ тише голоса) + редкие эффекты. Мастер −14 LUFS.
import json, subprocess, re, numpy as np
SR = 48000
TL = json.load(open('timeline.json')); DUR = TL['duration']; N = int(DUR * SR)
seg = {}
for w in TL['words']: seg.setdefault(w['seg'], []).append(w)
W = lambda s, i=0: seg[s][i]['start']; WE = lambda s, i: seg[s][i]['end']
SEL = json.load(open('sound/selected.json'))
def load(path, ss=0, to=None):
    cmd = ['ffmpeg', '-v', 'error', '-ss', str(ss)] + (['-to', str(to)] if to else []) + ['-i', path, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
def lufs(path):
    o = subprocess.run(['ffmpeg', '-nostats', '-i', path, '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    return float(re.findall(r'I:\s+(-?[\d.]+) LUFS', o)[-1])
def save(a, p): subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', '-c:a', 'pcm_s24le', p], input=a.astype(np.float32).tobytes())
def fade(a, fi=0.01, fo=0.05):
    n = len(a); i = min(n, int(fi * SR)); o = min(n, int(fo * SR))
    if i: a[:i] *= np.linspace(0, 1, i)[:, None]
    if o: a[-o:] *= np.linspace(1, 0, o)[:, None]
    return a
def norm_rms(a, target_db=-20):
    r = np.sqrt((a ** 2).mean()) + 1e-9; return a * (10 ** (target_db / 20) / r)
def place(buf, a, t, gain_db=0):
    s = int(t * SR); e = min(len(buf), s + len(a))
    if e > s: buf[s:e] += a[:e - s] * 10 ** (gain_db / 20)
F = lambda k: SEL[k]['file']

# ---- голос ----
voice = load('voice_master.wav'); voice = np.pad(voice, ((0, max(0, N - len(voice))), (0, 0)))[:N]

# ---- фон: дрон + дождь + ветер ----
bed = np.zeros((N, 2), np.float32)
dr = load(F('music_drone_alt'), 30, 30 + DUR + 1)[:N]; dr = fade(norm_rms(dr), 2.5, 3.0); place(bed, dr, 0, 0)
dr2 = load(F('music_drone'), 60, 60 + DUR + 1)[:N]; dr2 = fade(norm_rms(dr2), 4, 3); place(bed, dr2, 0, -9)
rain = load(F('rain'), 5, 5 + DUR + 1)[:N]; rain = fade(norm_rms(rain), 1.0, 3.0); place(bed, rain, 0, -6)
wind = load(F('wind'), 0, 67); wind = np.concatenate([wind, wind[::-1]])[:N]; wind = fade(norm_rms(wind), 3, 3); place(bed, wind, 0, -9)
# в финале (темнота) фон стихает, остаётся только сердце и стук
env = np.ones(N); a, b = int(W('19a', 3) * SR), int(W('19b', 0) * SR); env[a:b] = np.linspace(1, 0.35, b - a); env[b:] = 0.35
end = int((WE('20', 8) + 0.3) * SR); env[end:] = np.linspace(0.35, 0, N - end) if N > end else env[end:]
bed *= env[:, None]

# ---- эффекты (редкие, тихие) ----
sfx = np.zeros((N, 2), np.float32)
def ev(k, t, ss, to, g, fi=0.01, fo=0.08):
    a = load(F(k), ss, to); place(sfx, fade(norm_rms(a), fi, fo), t, g)
ev('shutter', 0.35, 5.5, 8.4, -8, 0.3, 0.3)                    # ставни опускаются
ev('spray', W('04', 0), 0.1, 0.9, -12, 0.02, 0.2)              # свежая краска
ev('siren', W('05', 0) - 0.4, 0, 9.5, -5, 0.4, 3.5)            # сирена Ночи
ev('creak', W('11', 1), 0, 1.0, -6)                            # скрипнула половица
ev('steps_creak', W('11', 3) - 0.1, 0.4, 3.0, -9)              # шаги наверху
ev('flash_click', W('12', 1) - 0.05, 0, 0.2, -7)               # щелчок фонарика
ev('fob', W('17', 2), 5.6, 6.3, -9)                            # брелок
ev('car_alarm', W('17', 5), 0, 3.6, -11, 0.05, 1.0)            # сигнализация такси
ev('slam', W('18', 2) + 0.05, 1.25, 2.7, -4)                   # ставня захлопнулась
ev('flash_click', W('19a', 1) + 0.15, 0, 0.2, -9)              # фонарик погас
for i in range(3): ev('knock', WE('19b', 6) + 0.35 + i * 0.45, 0.08, 0.32, -2, 0.002, 0.05)   # три удара (как в кадре)
hb = norm_rms(load(F('heartbeat'), 0, 1.8))
t = W('19b', 0) - 0.5
while t < WE('20', 8): place(sfx, fade(hb.copy(), 0.01, 0.2), t, -16); t += 1.15

save(voice, 'sound/stem_voice.wav'); save(bed, 'sound/stem_bed.wav'); save(sfx, 'sound/stem_sfx.wav')
Lv, Lb = lufs('sound/stem_voice.wav'), lufs('sound/stem_bed.wav')
gb = (Lv - 19) - Lb                         # фон ровно на 19 дБ тише голоса
Ls = lufs('sound/stem_sfx.wav'); gs = (Lv - 15) - Ls   # эффекты тихие
mix = voice + bed * 10 ** (gb / 20) + sfx * 10 ** (gs / 20)
save(mix, 'sound/mix_pre.wav')
print(f'голос {Lv:.1f} LUFS, фон {Lb + gb:.1f} LUFS (разница {Lv - Lb - gb:.1f} дБ), эффекты {Ls + gs:.1f} LUFS')
# мастер: двухпроходный loudnorm до −14 LUFS, true peak −1 dBTP
o = subprocess.run(['ffmpeg', '-i', 'sound/mix_pre.wav', '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(o[o.rindex('{'):o.rindex('}') + 1])
flt = f"loudnorm=I=-14:TP=-1:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'sound/mix_pre.wav', '-af', flt, '-ar', '48000', '-c:a', 'pcm_s24le', 'sound/mix_master.wav'])
print('мастер', lufs('sound/mix_master.wav'), 'LUFS')

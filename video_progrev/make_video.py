#!/usr/bin/env python3
"""Собирает вертикальный ролик (1080x1920) «Как прогреть аккаунт» с озвучкой ElevenLabs."""
import json, os, subprocess, urllib.request
from PIL import Image, ImageDraw, ImageFont

OUT = os.path.dirname(os.path.abspath(__file__))
WORK = os.path.join(OUT, "build")
os.makedirs(WORK, exist_ok=True)

VOICE_ID = "ouyTiWqmHA5WI5bbX7zj"  # Mikhail — мужской русский голос
W, H = 1080, 1920
BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
REG = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
ACCENT = (37, 244, 238)   # бирюзовый
ACCENT2 = (254, 44, 85)   # розовый

# (метка, крупный текст, мелкий текст, озвучка)
SCENES = [
    ("", "200 просмотров?", "ТикТок думает,\nчто ты бот",
     "Стабильно двести просмотров? Возможно, ТикТок думает, что ты бот."),
    ("", "Почему так", "Нет живой активности —\nалгоритм не даёт охваты",
     "У нового аккаунта нет живой активности, поэтому алгоритм пока не доверяет ему охваты."),
    ("ШАГ 1", "Листай ленту", "3–5 дней по 20–30 минут\nв своей нише",
     "Вот как прогреть аккаунт по-настоящему. Первое: три-пять дней по двадцать-тридцать минут листай рекомендации в своей нише."),
    ("ШАГ 2", "Будь живым", "Досматривай до конца,\nлайкай и комментируй\nто, что интересно",
     "Второе: досматривай видео до конца, лайкай и комментируй то, что тебе правда интересно."),
    ("ШАГ 3", "Заполни профиль", "Аватар, имя, описание",
     "Третье: заполни профиль — аватар, имя и описание."),
    ("ШАГ 4", "Без VPN", "И не меняй часто\nустройство",
     "Четвёртое: не пользуйся VPN и не меняй часто устройство."),
    ("", "Пиши «готово»", "Поддержим друг друга\n\nСохрани, чтобы\nне потерять шаги",
     "Новичкам проще расти вместе. Напиши в комментариях «готово» — и давай поддержим друг друга. Сохрани, чтобы не потерять шаги!"),
]


def tts(text, path):
    if os.path.exists(path):
        return
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}?output_format=mp3_44100_128",
        data=json.dumps({"text": text, "model_id": "eleven_multilingual_v2",
                         "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35}}).encode(),
        headers={"xi-api-key": "dummy", "Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r, open(path, "wb") as f:
        f.write(r.read())


def duration(path):
    return float(subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path]).strip())


def centered(d, y, text, font, fill, spacing=18):
    for line in text.split("\n"):
        w = d.textlength(line, font=font)
        d.text(((W - w) / 2, y), line, font=font, fill=fill)
        y += font.size + spacing
    return y


def slide(i, tag, big, small, path):
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):  # тёмный вертикальный градиент
        t = y / H
        c = (int(12 + 18 * t), int(10 + 6 * t), int(28 + 30 * t))
        for x in range(W):
            px[x, y] = c
    d = ImageDraw.Draw(img)
    # декоративные круги
    d.ellipse((-260, -260, 520, 520), outline=ACCENT, width=6)
    d.ellipse((W - 420, H - 420, W + 300, H + 300), outline=ACCENT2, width=6)

    y = 640
    if tag:
        f = ImageFont.truetype(BOLD, 56)
        tw = d.textlength(tag, font=f)
        d.rounded_rectangle(((W - tw) / 2 - 36, y - 18, (W + tw) / 2 + 36, y + 80), 40, fill=ACCENT2)
        d.text(((W - tw) / 2, y), tag, font=f, fill="white")
        y += 150
    fb = ImageFont.truetype(BOLD, 104 if len(big) < 14 else 88)
    # тень + текст
    centered(d, y + 5, big, fb, (0, 0, 0))
    y = centered(d, y, big, fb, ACCENT) + 50
    centered(d, y, small, ImageFont.truetype(REG, 64), "white", 22)

    # прогресс-бар
    total = len(SCENES)
    seg = (W - 160) / total
    for k in range(total):
        x0 = 80 + k * seg
        d.rounded_rectangle((x0 + 6, 120, x0 + seg - 6, 134), 7,
                            fill=ACCENT if k <= i else (70, 70, 95))
    img.save(path)


clips = []
for i, (tag, big, small, voice) in enumerate(SCENES):
    mp3 = os.path.join(WORK, f"s{i}.mp3")
    png = os.path.join(WORK, f"s{i}.png")
    mp4 = os.path.join(WORK, f"s{i}.mp4")
    tts(voice, mp3)
    slide(i, tag, big, small, png)
    dur = duration(mp3) + 0.35
    fr = int(dur * 30)
    # лёгкий зум + появление
    vf = (f"scale=1296:2304,zoompan=z='1+0.04*on/{fr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
          f":d={fr}:s={W}x{H}:fps=30,fade=t=in:st=0:d=0.25,format=yuv420p")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", png, "-i", mp3,
                    "-vf", vf, "-af", f"apad=pad_dur=0.35", "-t", f"{dur:.2f}",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-c:a", "aac", "-ar", "44100",
                    "-b:a", "160k", mp4], check=True)
    clips.append(mp4)

lst = os.path.join(WORK, "list.txt")
with open(lst, "w") as f:
    f.writelines(f"file '{c}'\n" for c in clips)
final = os.path.join(OUT, "progrev_akkaunta.mp4")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst,
                "-c", "copy", "-movflags", "+faststart", final], check=True)
print(final, duration(final))

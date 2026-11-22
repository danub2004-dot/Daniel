# Странный сигнал · серия 2 «Правила»

Продолжение серии 1. Марк получает файл «Правила для водителя седьмого маршрута» и выходит в ночную смену.
На конечной (Садовая, 7) его ждут два Тёмы: один стоит у подъезда, второй сидит в салоне.

- `voice_clean.txt` — чистый текст; `voice_elevenlabs.txt` — текст с тегами для eleven_v3 (голос Brian)
- `narration_brian.mp3`, `alignment.json` — озвучка и посимвольный тайминг
- `art/art2.js` — новая графика (салон, кабина, двери, правила); базовая графика берётся из `../episode01/art/art.js`
- `anim/` — `prep_voice.py` (укорачивает паузы, строит words.json), `anim.js` (сцены), `render.js`

Звук: `python3 sfx/make_sfx.py` → `sfx/mix.wav` (эффекты синтезируются, библиотека в `../common/sfxlib.py`).

Рендер: `cd anim && node render.js out.mp4`, затем звук:
`ffmpeg -i out.mp4 -i ../sfx/mix.wav -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k -shortest preview.mp4`

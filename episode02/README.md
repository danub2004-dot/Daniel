# Странный сигнал · серия 2 «Правила»

Продолжение серии 1. Марк получает файл «Правила для водителя седьмого маршрута» и выходит в ночную смену.
На конечной (Садовая, 7) его ждут два Тёмы: один стоит у подъезда, второй сидит в салоне.

- `voice_clean.txt` — чистый текст; `voice_elevenlabs.txt` — текст с тегами для eleven_v3 (голос Brian)
- `narration_brian.mp3`, `alignment.json` — озвучка и посимвольный тайминг
- `art/art2.js` — новая графика (салон, кабина, двери, правила); базовая графика берётся из `../episode01/art/art.js`
- `anim/` — `prep_voice.py` (укорачивает паузы, строит words.json), `anim.js` (сцены), `render.js`

Рендер: `cd anim && node render.js out.mp4`, затем звук:
`ffmpeg -i out.mp4 -i voice_edit.wav -c:v copy -c:a aac -b:a 192k -af apad -shortest preview.mp4`

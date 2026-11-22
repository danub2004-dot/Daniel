# Странный сигнал · серия 3 «Черновики»

Продолжение серии 2. Марк просыпается дома в ботинках. Тёма находит в его телефоне «Отправленные»:
все сообщения «Неизвестного» отправлял сам Марк, в 02:47, во сне. А под одеялом в кровати Марка кто-то дышит его дыханием.

- `voice_clean.txt`, `voice_elevenlabs.txt` — текст (голос Brian, eleven_v3); `narration_brian.mp3`, `alignment.json`
- `art/art3.js` — кровать с тем, кто под одеялом, «тёмный» Марк, Тёма на полу (поверх графики серий 1 и 2)
- `anim/` — сцены (`anim.js`), тайминг слов, рендер
- `sfx/make_sfx.py` — звуки (библиотека `../common/sfxlib.py`)

Сборка: `python3 anim/prep_voice.py …` → `cd anim && node render.js out.mp4` → `python3 sfx/make_sfx.py` →
`ffmpeg -i anim/out.mp4 -i sfx/mix.wav -c:v copy -af loudnorm=I=-14:TP=-1.5 -c:a aac -b:a 192k -shortest preview_ep03.mp4`

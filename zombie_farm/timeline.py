#!/usr/bin/env python3
"""Тайминг слов -> timeline.json.

  python3 timeline.py estimate                 # расчётный тайминг (пока нет озвучки)
  python3 timeline.py elevenlabs alignment.json  # точный тайминг из ответа ElevenLabs /with-timestamps

Абзацы текста = секции ролика: 0 хук, 1 город, 2..7 советы 1–6, 8 «главное», 9 финал.
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).parent
SRC = (ROOT / 'voiceover_elevenlabs.txt').read_text(encoding='utf-8').strip()


def sections():
    out = []
    for para in re.split(r'\n\s*\n', SRC):
        toks = []
        for m in re.finditer(r'\[([^\]]+)\]|(\S+)', para):
            if m.group(1):
                tag = m.group(1)
                if 'pause' in tag:
                    toks.append(('pause', 1.4 if 'long' in tag else 0.45))
            else:
                w = m.group(2)
                if w in ('—', '-'):
                    toks.append(('pause', 0.12))
                    continue
                toks.append(('word', w))
        out.append(toks)
    return out


def estimate():
    t, words = 0.35, []
    cps = 19.0  # символов в секунду
    for si, toks in enumerate(sections()):
        for kind, v in toks:
            if kind == 'pause':
                t += v
                continue
            d = (len(v) + 1) / cps
            words.append({'w': v, 's': round(t, 3), 'e': round(t + d * 0.92, 3), 'sec': si})
            t += d
            if v[-1] in '.!?':
                t += 0.28
            elif v[-1] in ',:':
                t += 0.12
        t += 0.35
    return words, round(t, 3)


def from_elevenlabs(path):
    al = json.load(open(path, encoding='utf-8'))
    al = al.get('alignment', al)
    chars, st, en = al['characters'], al['character_start_times_seconds'], al['character_end_times_seconds']
    spoken = ''.join(chars)
    words, pos = [], 0
    for si, toks in enumerate(sections()):
        for kind, v in toks:
            if kind != 'word':
                continue
            i = spoken.find(v, pos)
            if i < 0:  # на всякий случай — ищем без пунктуации
                core = re.sub(r'[^\wё-]', '', v, flags=re.I)
                i = spoken.find(core, pos)
                L = len(core)
            else:
                L = len(v)
            if i < 0:
                raise SystemExit(f'слово не найдено в выравнивании: {v}')
            words.append({'w': v, 's': round(st[i], 3), 'e': round(en[i + L - 1], 3), 'sec': si})
            pos = i + L
    return words, round(en[-1], 3)


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'estimate'
    words, dur = estimate() if mode == 'estimate' else from_elevenlabs(sys.argv[2])
    (ROOT / 'timeline.json').write_text(json.dumps({'source': mode, 'voiceEnd': dur, 'words': words}, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{mode}: {len(words)} слов, голос до {dur:.1f} c')
    for si in range(10):
        ws = [w for w in words if w['sec'] == si]
        print(f'  секция {si}: {ws[0]["s"]:.1f}–{ws[-1]["e"]:.1f}  «{ws[0]["w"]} …»')

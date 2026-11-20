// Анимация серии 1. Все события привязаны к словам озвучки: W(i) — начало i-го слова, WE(i) — конец.
// Номера слов — из words.json (0:«На» … 126:«вчера»).
const W = i => WORDS[i].s, WE = i => WORDS[i].e;
const END_VOICE = WE(WORDS.length - 1);
const DURATION = Math.ceil((END_VOICE + 4.3) * 30) / 30; // + титр «Продолжение следует»
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ramp = (t, a, b) => clamp((t - a) / (b - a));
const ease = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const er = (t, a, b) => ease(ramp(t, a, b));
const lerp = (a, b, k) => a + (b - a) * k;
const pulse = (t, at, len = .5) => t < at || t > at + len ? 0 : Math.sin(Math.PI * (t - at) / len);
const blinkAt = (t, period = 3.7, off = 0) => { const ph = (t + off) % period; return ph < .13 ? Math.sin(ph / .13 * Math.PI) : 0; };
const talk = (t, i0, i1) => { for (let i = i0; i <= i1; i++) if (t >= W(i) && t <= WE(i)) return .45 + .45 * Math.sin(t * 28); return 0; };
const noise = (t, k = 1) => Math.sin(t * 13.1 * k) * .5 + Math.sin(t * 7.3 * k + 1.7) * .3 + Math.sin(t * 29.7 * k + .4) * .2;

const EXTRA_DEFS = `<defs>
<filter id="sil" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 .025  0 0 0 0 .04  0 0 0 0 .05  0 0 0 1 0"/></filter>
<radialGradient id="hole"><stop offset="0" stop-color="#000"/><stop offset=".55" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#fff"/></radialGradient>
<radialGradient id="redVig" cx=".5" cy=".5" r=".7"><stop offset=".4" stop-color="#6a1408" stop-opacity="0"/><stop offset="1" stop-color="#3a0804" stop-opacity=".8"/></radialGradient>
</defs>`;

// камера: зум z вокруг точки (cx,cy) кадра, плюс тряска
function cam(inner, z = 1, cx = 540, cy = 960, sh = 0, t = 0) {
  if (z >= 1) { cx = clamp(cx, 540 / z + 12, 1080 - 540 / z - 12); cy = clamp(cy, 960 / z + 12, 1920 - 960 / z - 12); }
  const dx = sh * noise(t, 1.3) * 14, dy = sh * noise(t + 3, 1.1) * 14;
  return `<g transform="translate(${f(540 + dx)},${f(960 + dy)}) scale(${f(z * 1000) / 1000}) translate(${f(-cx)},${f(-cy)})">${inner}</g>`;
}
const sil = s => `<g filter="url(#sil)">${s}</g>`;
function rain(t, n = 70, op = .25) { const r = rng(5); let s = `<g stroke="#9fb4bc" stroke-width="2" opacity="${op}">`; for (let i = 0; i < n; i++) { const x = r() * 1180 - 50, sp = 1300 + r() * 600, y = ((r() * 1920 + t * sp) % 2100) - 100; s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x - 10)}" y2="${f(y + 46)}"/>`; } return s + `</g>`; }
const flicker = (t, a = .07) => `<rect width="1080" height="1920" fill="#000" opacity="${f(clamp(a * (1 + noise(t, 1.7))) * 1000) / 1000}"/>`;
const shade = (op, c = '#000') => `<rect x="-2000" y="-2000" width="6000" height="6000" fill="${c}" opacity="${f(op * 1000) / 1000}"/>`;

// ---------- СЦЕНЫ ----------
const SCENES = [
  { // 1. Карта: «На карте здесь ничего нет.»
    from: 0, to: () => W(5), draw(t) {
      let s = bgDawnVillage(t, { reveal: 0 }) + shade(.55);
      const sw = Math.sin(t * 1.4) * 1.5;
      let m = burntMap({ x: 540, y: 960, s: 2.3, rot: -3 + sw });
      m += `<ellipse cx="60" cy="1060" rx="70" ry="90" fill="${P.skin}" transform="rotate(${-20 + sw} 60 1060)"/><ellipse cx="1010" cy="840" rx="70" ry="90" fill="${P.skinSh}"/>`;
      const fin = er(t, W(2) - .2, W(2) + .3); // палец указывает на пустое место
      m += `<g transform="translate(${f(lerp(-200, 420, fin))},${f(lerp(1400, 990, fin))}) rotate(-35)"><rect x="-22" y="0" width="44" height="190" rx="22" fill="${P.skin}"/><rect x="-46" y="120" width="92" height="160" rx="40" fill="${P.skin}"/></g>`;
      const p = pulse(t, W(4), .9);
      m += `<ellipse cx="450" cy="960" rx="${f(260 + p * 30)}" ry="${f(170 + p * 20)}" fill="none" stroke="${P.red}" stroke-width="${f(6 + p * 8)}" opacity="${f(er(t, W(3), W(4)) * .9)}" stroke-dasharray="20 14"/>`;
      return cam(s, 1.25, 540, 1300) + cam(m, 1 + t * .025, 520, 960, .25, t) + rain(t, 20, .1);
    }
  },
  { // 2. Деревня выходит из тумана
    from: () => W(5), to: () => W(10), draw(t) {
      const k = er(t, W(5), W(10) - .3);
      let s = bgDawnVillage(t, { reveal: er(t, W(7), W(9) + .6), lit: er(t, W(9), W(9) + .8) * .9 });
      s += sil(misha({ x: 430, y: 1900, s: 1.25 }) + tyoma({ x: 640, y: 1910, s: 1.2 }));
      return cam(s, lerp(1.45, 1.05, k), 540, lerp(1500, 1150, k), .15, t);
    }
  },
  { // 3. Флешбэк: «Вчера мой костёр сжёг наш лагерь. Я пожарный…»
    from: () => W(10), to: () => W(23), draw(t) {
      const grow = er(t, W(10), W(15));
      let s = bgFlashback(t) + tent({ x: 560, y: 1560, s: 1.3, up: 1 - .35 * er(t, W(13), W(16)) });
      s += fire({ x: 560, y: 1560, t, size: 1.2 + grow * 1.1 });
      s += misha({ x: 230, y: 1830, s: 1.1, worry: 1, head: .5, armL: 8 * Math.sin(t), blink: blinkAt(t, 3.1) });
      const z = 1 + .35 * er(t, W(16), W(18)) - .25 * er(t, W(20), W(22) + .4);
      const fl = pulse(t, W(12), .5) + pulse(t, W(13), .5);
      return cam(s, z, lerp(540, 260, er(t, W(16), W(18))), lerp(1300, 1420, er(t, W(16), W(18))), .5 + fl, t) +
        `<rect width="1080" height="1920" fill="url(#redVig)"/>` + `<rect width="1080" height="1920" fill="#ff6a2a" opacity="${f(fl * .25 * 100) / 100}"/>` +
        `<text x="70" y="200" font-family="Inter" font-weight="900" font-size="54" fill="#ffb07a" opacity=".8" letter-spacing="10">ВЧЕРА</text>`;
    }
  },
  { // 4. «Я обещал маме вернуть Тёму домой.»
    from: () => W(23), to: () => W(29), draw(t) {
      let s = bgDawnVillage(t, { reveal: 1, lit: .9 });
      s += misha({ x: 430, y: 1800, s: 1.05, worry: .6, head: .4, armR: 62 * er(t, W(24), W(26)), blink: blinkAt(t, 3.3, 1) });
      s += tyoma({ x: 650, y: 1810, s: 1, head: -.5, blink: blinkAt(t, 2.9) });
      return cam(s, lerp(1.25, 1.55, er(t, W(23), W(29))), 540, 1450, .12, t);
    }
  },
  { // 5a. Тёма спрашивает
    from: () => W(29), to: () => W(38), draw(t) {
      let s = bgDawnVillage(t, { reveal: 1, lit: .9 });
      s += tyoma({ x: 560, y: 1820, s: 1.05, curious: 1, head: .4 * Math.sin(t * 1.5), mouth: talk(t, 31, 37), blink: blinkAt(t, 2.6) });
      return cam(s, lerp(1.9, 2.3, er(t, W(29), W(38))), 560, 1500, .1, t);
    }
  },
  { // 5b. «Местные улыбаются… будто ждали.»
    from: () => W(38), to: () => W(42), draw(t) {
      let s = bgDawnVillage(t, { reveal: 1, lit: .9 });
      const xs = [150, 340, 540, 740, 930], hd = .35 * Math.sin(t * .8);
      xs.forEach((x, i) => {
        const op = er(t, W(38) + i * .18, W(38) + i * .18 + .5);
        s += i === 2 ? oldman({ x, y: 1720, s: .95, head: hd, op }) : local({ x, y: 1720 + (i % 2) * 20, s: .95, v: [0, 1, 0, 2, 3][i], head: hd, op });
      });
      return cam(s, lerp(1.05, 1.45, er(t, W(40), W(42))), 540, lerp(1480, 1360, er(t, W(40), W(42))), .1, t);
    }
  },
  { // 6. Рюкзаки у забора
    from: () => W(42), to: () => W(50), draw(t) {
      let s = bgFence(t);
      const at = [W(45), W(46), W(47), W(48)];
      [0, 1, 2, 3].forEach(v => { const k = er(t, at[v] - .15, at[v] + .25); s += backpack({ v, x: 200 + v * 190, y: 1680 + v * 30 - (1 - k) * 60, s: 1.35, op: k }); });
      const pan = er(t, W(43), W(48) + .3), back = er(t, W(49), W(49) + .7);
      return cam(s, lerp(1.6, 1.05, back), lerp(lerp(220, 790, er(t, W(45) - .4, W(48) + .1)), 540, back), lerp(1640, 1250, back), .1, t) +
        `<rect width="1080" height="1920" fill="#8fb4c8" opacity="${f(pulse(t, W(49), .8) * .18 * 100) / 100}"/>`;
    }
  },
  { // 7. Незнакомая птица кричит
    from: () => W(50), to: () => W(57), draw(t) {
      let s = bgFence(t);
      const cry = pulse(t, W(51) - .05, 1.1);
      s += bird({ x: 830, y: 485, s: .8, flip: true, neck: .4 + cry * .6, beak: cry, eye: .6 + .4 * cry + .2 * Math.sin(t * 3) });
      const out = er(t, W(53), W(57));
      return cam(s, lerp(3.2, 2.2, out), lerp(740, 800, out), lerp(330, 420, out), cry * 1.2, t);
    }
  },
  { // 8. «К вечеру Тёма перестаёт задавать вопросы. Это страшнее всего.»
    from: () => W(57), to: () => W(66), draw(t) {
      let s = bgNight(t, { lit: .7 });
      const bl = er(t, W(60), W(62) + .4);
      s += local({ x: 260, y: 1690, s: 1, v: 2, glow: bl > .8 }) + local({ x: 830, y: 1700, s: 1, v: 0, glow: bl > .8, flip: true });
      s += tyoma({ x: 545, y: 1720, s: 1.05, blank: bl, curious: 1 - bl, mouth: bl < .2 ? .3 : 0, blink: bl < .5 ? blinkAt(t, 2.5) : 0 });
      s += sil(misha({ x: 950, y: 2150, s: 1.8, flip: true }));
      const z = lerp(1.15, 2.3, er(t, W(63), W(66) - .2));
      return cam(s, z, lerp(560, 545, er(t, W(63), W(66))), lerp(1450, 1380, er(t, W(63), W(66))), .08, t) + flicker(t);
    }
  },
  { // 9. Спичка → сигнальный костёр → «Сухих спичек — три.»
    from: () => W(66), to: () => W(73), draw(t) {
      let s;
      if (t < W(68)) { // крупный план спички
        s = bgNight(t) + shade(.6);
        const lit = t > W(67) + .1;
        s += lit ? matchFlame({ x: 540, y: 980, s: 3, t }) : `<rect x="528" y="950" width="24" height="360" rx="9" fill="#d8c08a"/><rect x="525" y="950" width="30" height="78" rx="12" fill="#8e2b22"/>`;
        s += `<ellipse cx="470" cy="1330" rx="110" ry="80" fill="${P.skin}"/><ellipse cx="600" cy="1350" rx="70" ry="60" fill="${P.skinSh}"/>`;
        if (lit) s += `<rect width="1080" height="1920" fill="#ffb060" opacity="${f(pulse(t, W(67) + .1, .35) * .35 * 100) / 100}"/>`;
        return cam(s, 1.1, 540, 1060, .2, t);
      }
      const g0 = er(t, W(68), W(70));
      s = bgNight(t) + fire({ x: 540, y: 1580, t, size: .3 + g0 * 1.1 }) + sil(misha({ x: 300, y: 1900, s: 1.3, armL: 10 }));
      let out = cam(s, lerp(1.3, 1.05, g0), 540, lerp(1500, 1250, g0), .1, t) + flicker(t, .05);
      const mb = er(t, W(70) - .1, W(70) + .3), tri = pulse(t, W(72), .7);
      out += `<g opacity="${mb}">` + shade(.5) + `<circle cx="540" cy="930" r="${f(330 + tri * 40)}" fill="url(#fireGlow)" opacity="${f(.4 + tri * .6)}"/>` + matchbox({ x: 540, y: 960, s: lerp(1.4, 2.4, mb) + tri * .15, n: 3, rot: -6 }) + `</g>`;
      return out;
    }
  },
  { // 10. Местные смотрят на огонь
    from: () => W(73), to: () => W(81), draw(t) {
      let s = bgNight(t);
      const ring = [[160, 1500, .7, 1], [380, 1470, .62, 3], [700, 1470, .62, 0], [920, 1500, .7, 2]];
      ring.forEach(([x, y, sc, v]) => s += local({ x, y, s: sc, v, glow: true, flip: x > 540 }));
      s += fire({ x: 540, y: 1620, t, size: 1.3 });
      s += local({ x: 120, y: 1860, s: 1.05, v: 1, glow: true }) + local({ x: 980, y: 1870, s: 1.05, v: 3, glow: true, flip: true });
      const k = er(t, W(73), W(81));
      return cam(s, lerp(1.25, 1.5, k), lerp(430, 650, k), 1420, .06, t) + flicker(t, .06);
    }
  },
  { // 11. Старик: «Дорога — за забором».
    from: () => W(81), to: () => W(86), draw(t) {
      let s = bgNight(t) + fence(1500, 1560, -80, 420, 9, P.woodDark, 17, 1.3);
      s += `<rect x="150" y="1330" width="120" height="230" fill="#050808"/>`; // калитка открыта
      s += fire({ x: 1020, y: 1650, t, size: .9 });
      s += oldman({ x: 560, y: 1780, s: 1.25, point: er(t, W(83) - .25, W(83) + .3), head: -.3, blink: 0 });
      const pan = er(t, W(84), W(85) + .4);
      return cam(s, lerp(1.6, 1.3, pan), lerp(600, 330, pan), lerp(1400, 1420, pan), .08, t) + flicker(t, .06) + rain(t, 40, .15);
    }
  },
  { // 12. Дорога обрывается
    from: () => W(86), to: () => W(92), draw(t) {
      let s = bgRoad(t);
      const walk = er(t, W(86) - .3, W(87) + .5), bob = Math.abs(Math.sin(t * 7)) * 10 * (1 - walk);
      const y = lerp(1950, 1330, walk), sc = lerp(1.1, .42, walk);
      s += sil(misha({ x: 495, y: y - bob, s: sc }) + tyoma({ x: 495 + 150 * sc, y: y + 10 * sc - bob * .8, s: sc * .95 }));
      const push = er(t, W(88), W(91) + .5);
      return cam(s, lerp(1.05, 1.7, push), 540, lerp(1350, 1230, push), .1, t) + rain(t, 70, .2) + flicker(t, .05);
    }
  },
  { // 13. «Чиркаю спичкой. Под ногами — десятки пустых коробков.»
    from: () => W(92), to: () => W(99), draw(t) {
      const lit = t > W(92) + .25, fl = 1 + .06 * noise(t, 2);
      let s = bgRoad(t);
      const r = rng(77), cols = [['#4a3c2c', '#6a5236'], ['#3c4630', '#566240'], ['#4a2c28', '#6a3e36'], ['#3a3a40', '#565662'], ['#504030', '#7a6040']];
      let boxes = '';
      for (let i = 0; i < 40; i++) {
        const a = r() * 6.28, d = Math.sqrt(r()) * 460, x = 540 + Math.cos(a) * d, y = 1380 + Math.sin(a) * d * .55, c = cols[i % 5];
        const appear = i < 9 ? 1 : er(t, W(96) + (i - 9) * .02, W(96) + (i - 9) * .02 + .3);
        boxes += oldBox({ x, y, s: 1.6 + (y - 1130) / 400, rot: r() * 180, c: c[0], c2: c[1], op: appear });
      }
      s = cam(s + boxes, 2.1, 540, lerp(1330, 1390, er(t, W(92), W(99))), .05, t);
      const R = lit ? 520 * fl * er(t, W(92) + .25, W(92) + .6) : 0;
      s += `<mask id="lm"><rect width="1080" height="1920" fill="#fff"/><circle cx="600" cy="1000" r="${f(Math.max(R, 1))}" fill="url(#hole)"/></mask><rect width="1080" height="1920" fill="#020303" mask="url(#lm)"/>`;
      if (lit) s += matchFlame({ x: 640, y: 760, s: 1.5, t, rot: 8 }) + `<ellipse cx="700" cy="930" rx="70" ry="56" fill="${P.skin}" opacity=".9"/>`;
      if (lit) s += `<rect width="1080" height="1920" fill="#ffb060" opacity="${f(pulse(t, W(92) + .25, .3) * .3 * 100) / 100}"/>`;
      return s;
    }
  },
  { // 14. «Спрашиваю старика… "Как ты. С братом."»
    from: () => W(99), to: () => W(109), draw(t) {
      let s = bgNight(t) + shade(.35);
      const back = er(t, W(106), W(109));
      [[200, 1500, 0], [400, 1470, 2], [700, 1470, 3], [900, 1500, 1]].forEach(([x, y, v]) => s += `<g opacity="${back}">${local({ x, y, s: .7, v, glow: true })}</g>`);
      s += oldman({ x: 520, y: 2150, s: 2.5, head: lerp(.7, 0, er(t, W(104), W(105))), glow: t > W(108) - .05 });
      s += `<circle cx="1000" cy="1700" r="500" fill="url(#fireGlow)" opacity="${f(.5 + .1 * noise(t))}"/>`;
      const z = lerp(1, 1.25, er(t, W(105), W(109)));
      return cam(s, z, 560, lerp(1250, 1200, er(t, W(105), W(109))), .05 + pulse(t, W(108), .6), t) + flicker(t, .06);
    }
  },
  { // 15. «Все они когда-то пришли сами.»
    from: () => W(109), to: () => W(114), draw(t) {
      let s = bgEdge(t, { lit: .3 });
      const row = [[130, 0], [300, 2], [470, -1], [640, 3], [810, 1], [980, 0]];
      const k = er(t, W(109), W(114));
      row.forEach(([x, v], i) => s += v < 0 ? oldman({ x, y: 1700 + (i % 2) * 14, s: .95, glow: true }) : local({ x, y: 1700 + (i % 2) * 14, s: .95, v, glow: true, flip: x > 540 }));
      const red = pulse(t, W(113), .8);
      return cam(s, lerp(1.6, 1.1, k), 540, lerp(1380, 1300, k), .06, t) + `<rect width="1080" height="1920" fill="#8e2b22" opacity="${f(red * .3 * 100) / 100}"/>` + flicker(t, .05);
    }
  },
  { // 16. Финал: новая палатка. «Оранжевую. Нашу. Ту, что сгорела вчера.»
    from: () => W(114), to: () => DURATION, draw(t) {
      if (t > END_VOICE + .7) { // титр
        const k = er(t, END_VOICE + .9, END_VOICE + 1.6);
        return `<rect width="1080" height="1920" fill="#030505"/>` + `<g opacity="${k}"><text x="540" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="88" fill="#e8742e" letter-spacing="6">ПРОДОЛЖЕНИЕ</text><text x="540" y="1000" text-anchor="middle" font-family="Inter" font-weight="900" font-size="88" fill="#e8742e" letter-spacing="6">СЛЕДУЕТ</text><text x="540" y="1110" text-anchor="middle" font-family="Inter" font-weight="600" font-size="44" fill="#9fb0aa">Серия 2</text></g>` +
          `<g opacity="${f(er(t, END_VOICE + 1.8, END_VOICE + 2.6) * 100) / 100}">${bird({ x: 540, y: 1650, s: .5, eye: 1, neck: .5 })}</g>` + flicker(t, .1);
      }
      let s = bgEdge(t, { lit: .5 });
      const up = er(t, W(118) - .2, W(120) + .2);
      s += tent({ x: 660, y: 1600, s: 1.05, up: .05 + .95 * up });
      s += local({ x: 380, y: 1650, s: .9, v: 3, armL: 40 + 30 * (1 - up) + 10 * Math.sin(t * 4) }) + local({ x: 950, y: 1650, s: .9, v: 1, flip: true, armL: 50 + 20 * (1 - up) });
      s += sil(misha({ x: 80, y: 2100, s: 1.6 }));
      const z1 = er(t, W(121) - .1, W(121) + .5), z2 = er(t, W(122) - .1, W(122) + .4);
      const z = lerp(lerp(1.1, 1.8, z1), 3.4, z2);
      const cx = lerp(lerp(620, 660, z1), 545, z2), cy = lerp(lerp(1450, 1500, z1), 1530, z2);
      let out = cam(s, z, cx, cy, .06 + pulse(t, W(125), 1) * .8, t) + flicker(t, .06);
      out += `<rect width="1080" height="1920" fill="#000" opacity="${f(er(t, END_VOICE + .2, END_VOICE + .7) * 100) / 100}"/>`;
      return out;
    }
  },
];

// ---------- СУБТИТРЫ ----------
const KEY = new Set(['карте', 'ничего', 'деревня', 'костёр', 'сжёг', 'пожарный', 'Тёму', 'домой', 'удивляются', 'ждали', 'рюкзаки', 'Ничьи', 'птица', 'вопросы', 'страшнее', 'три', 'огонь', 'забыли', 'Дорога', 'обрывается', 'траве', 'спичкой', 'десятки', 'коробков', 'братом', 'сами', 'палатку', 'Оранжевую', 'Нашу', 'сгорела', 'вчера']);
const GROUPS = (() => {
  const gs = []; let cur = [];
  WORDS.forEach((w, i) => {
    cur.push(i);
    const len = cur.map(j => WORDS[j].w).join(' ').length;
    const next = WORDS[i + 1];
    if (w.p || cur.length >= 3 || len > 12 || (next && len + next.w.length > 14)) { gs.push(cur); cur = []; }
  });
  if (cur.length) gs.push(cur);
  return gs.map((ids, k) => {
    const s = W(ids[0]) - .05, last = WE(ids[ids.length - 1]);
    const nx = gs[k + 1] ? W(gs[k + 1][0]) - .05 : last + .8;
    return { ids, s, e: Math.min(nx, last + .7) };
  });
})();
function subtitles(t) {
  const gr = GROUPS.find(g => t >= g.s && t < g.e); if (!gr) return '';
  const pop = er(t, gr.s, gr.s + .12);
  const spans = gr.ids.map(i => {
    const w = WORDS[i], on = t >= w.s - .03, cur = t >= w.s - .03 && t <= w.e + .08;
    const col = KEY.has(w.w) ? '#ff7a3a' : (cur ? '#ffe9a8' : '#ffffff');
    return `<tspan fill="${col}" fill-opacity="${on ? 1 : .45}" font-size="${cur ? 96 : 86}">${w.w.toUpperCase()}</tspan>`;
  }).join('<tspan font-size="86"> </tspan>');
  const chars = gr.ids.map(i => WORDS[i].w).join(' ').length, fit = Math.min(1, 940 / (chars * 64 + 20));
  return `<g transform="translate(540,1430) scale(${f((.9 + .1 * pop) * fit * 1000) / 1000})" opacity="${f(pop * 100) / 100}"><text x="0" y="0" xml:space="preserve" text-anchor="middle" font-family="Inter" font-weight="900" stroke="#000" stroke-width="16" stroke-linejoin="round" paint-order="stroke" letter-spacing="1">${spans}</text></g>`;
}

// ---------- КАДР ----------
const sceneAt = t => SCENES.findIndex(sc => { const a = typeof sc.from === 'function' ? sc.from() : sc.from, b = typeof sc.to === 'function' ? sc.to() : sc.to; return t >= a && t < b; });
function frameSVG(t) {
  let i = sceneAt(t); if (i < 0) i = SCENES.length - 1;
  let body = SCENES[i].draw(t);
  const a = typeof SCENES[i].from === 'function' ? SCENES[i].from() : SCENES[i].from;
  const XF = .22; // короткий наплыв между сценами
  if (i > 0 && t - a < XF) body = SCENES[i - 1].draw(t) + `<g opacity="${f((t - a) / XF * 100) / 100}">${body}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">${DEFS}${EXTRA_DEFS}<rect width="1080" height="1920" fill="#000"/>${body}${overlay(t, { n: 30 })}${subtitles(t)}</svg>`;
}
function renderFrame(t) { document.getElementById('stage').innerHTML = frameSVG(t); }

// Серия 2 — собрано из общей части серии 1 (камера, субтитры, кадр) и scenes.js
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

// Серия 2 «Две спички» — сцены, привязанные к словам озвучки (номера слов — episode2/words.json).
const lyingTyoma = (o) => tyoma({ rot: -90, ...o });
let _mid = 0;
const torchLight = (t, x, y, r, extra = '') => { const id = 'tm' + (_mid++); return `<mask id="${id}"><rect x="-3000" y="-3000" width="8000" height="8000" fill="#fff"/><circle cx="${f(x)}" cy="${f(y)}" r="${f(Math.max(1, r * (1 + .04 * noise(t, 2))))}" fill="url(#hole)"/>${extra}</mask><rect x="-3000" y="-3000" width="8000" height="8000" fill="#020303" mask="url(#${id})"/>`; };

const SCENES = [
  { // 1. «В нашей палатке спит мой брат.»
    from: 0, to: () => W(6), draw(t) {
      let s = bgEdge(t, { lit: .4 }) + tent({ x: 600, y: 1600, s: 1.15 }) + sil(misha({ x: 260, y: 1900, s: 1.4 }));
      s += `<path d="M560,1600 L600,1470 L640,1600Z" fill="#c98a3e" opacity="${f((.15 + .05 * Math.sin(t * 3)) * 100) / 100}"/>`;
      const k = er(t, 0, W(6));
      return cam(s, lerp(1.05, 2.6, k), lerp(560, 600, k), lerp(1400, 1520, k), .06, t) + flicker(t, .06);
    }
  },
  { // 2. Вещи целые, фонарик ржавый
    from: () => W(6), to: () => W(17), draw(t) {
      let s = bgTentInside(t, { light: .25 });
      s += lyingTyoma({ x: 760, y: 1640, s: .95, blank: .7, blink: 1 });
      s += backpack({ x: 200, y: 1720, s: 1.2, v: 0 }) + backpack({ x: 330, y: 1740, s: 1, v: 2 });
      s += flashlight({ x: 460, y: 1800, s: .9, rot: -8 });
      const fz = er(t, W(14) - .2, W(15) + .3);
      let out = cam(s, lerp(lerp(1.05, 1.2, er(t, W(6), W(13))), 2.6, fz), lerp(540, 460, fz), lerp(1560, 1790, fz), .05, t);
      const burn = pulse(t, W(13) - .05, .8);
      out += `<rect width="1080" height="1920" fill="#d9552a" opacity="${f(burn * .35 * 100) / 100}"/>`;
      return out + flicker(t, .05);
    }
  },
  { // 3. Карта с деревней и подписью «Миша. Тёма.»
    from: () => W(17), to: () => W(28), draw(t) {
      let s = bgTentInside(t, { light: .3 }) + shade(.4);
      s += pencilMap({ x: 540, y: 960, s: 2.3, rot: 2, draw: er(t, W(21) - .2, W(22) + .5), names: er(t, W(26) - .1, W(26) + .4) + er(t, W(27) - .1, W(27) + .4) });
      s += `<ellipse cx="80" cy="1220" rx="70" ry="90" fill="${P.skin}"/><ellipse cx="1000" cy="720" rx="70" ry="90" fill="${P.skinSh}"/>`;
      const nz = er(t, W(25), W(27) + .3);
      return cam(s, lerp(1.05, 1.9, nz), lerp(540, 520, nz), lerp(960, 1090, nz), .1, t) + flicker(t, .04);
    }
  },
  { // 4. «Нас здесь ждут насовсем. Уходим сегодня.»
    from: () => W(28), to: () => W(34), draw(t) {
      let s = bgTentInside(t, { light: .3 }) + misha({ x: 540, y: 1960, s: 1.6, worry: lerp(.9, .1, er(t, W(31), W(33))), blink: blinkAt(t, 3), head: .1 });
      return cam(s, lerp(1.4, 1.75, er(t, W(28), W(34))), 540, 1360, .05 + pulse(t, W(32), .4) * .6, t) + flicker(t, .05);
    }
  },
  { // 5. «Тёма не просыпается. Улыбается — как они.»
    from: () => W(34), to: () => W(40), draw(t) {
      let s = bgTentInside(t, { light: .2 }) + lyingTyoma({ x: 760, y: 1640, s: .95, blank: .7, blink: 1 });
      return cam(s, lerp(2.2, 3, er(t, W(34), W(40))), 380, 1600, .04, t) + flicker(t, .05);
    }
  },
  { // 6. Предпоследняя спичка: «Миш?..»
    from: () => W(40), to: () => W(50), draw(t) {
      const lit = t > W(40) + .2, L = lit ? .45 + .5 * er(t, W(40) + .2, W(41)) : .1;
      const back = er(t, W(45), W(47) + .3);
      let s = bgTentInside(t, { light: L, lx: 300, ly: 1500 }) + lyingTyoma({ x: 760, y: 1640, s: .95, blank: lerp(.7, 0, back), blink: back > .6 ? blinkAt(t, 2.2) : 1, mouth: talk(t, 49, 49), curious: back });
      if (lit) s += matchFlame({ x: 300, y: 1480, s: 1.4, t });
      s += `<ellipse cx="300" cy="1640" rx="60" ry="50" fill="${P.skin}"/>`;
      let out = cam(s, lerp(1.9, 2.6, er(t, W(41), W(49))), 360, 1580, .05, t);
      if (lit) out += `<rect width="1080" height="1920" fill="#ffb060" opacity="${f(pulse(t, W(40) + .2, .35) * .3 * 100) / 100}"/>`;
      return out;
    }
  },
  { // 7. «Спичка гаснет. Он снова улыбается.»
    from: () => W(50), to: () => W(55), draw(t) {
      const out = er(t, W(51) - .1, W(51) + .3), L = lerp(.9, .05, out);
      const bl = er(t, W(53), W(54));
      let s = bgTentInside(t, { light: L, lx: 300, ly: 1500 }) + lyingTyoma({ x: 760, y: 1640, s: .95, blank: lerp(0, .7, bl), blink: bl > .3 ? 1 : 0 });
      if (out < 1) s += matchFlame({ x: 300, y: 1480, s: 1.4 * (1 - out), t });
      s += `<path d="M300,1440 q-20,-60 10,-120 q30,-60 0,-140" stroke="#9aa" stroke-width="6" fill="none" opacity="${f(out * .4 * 100) / 100}" filter="url(#blur4)"/>`;
      return cam(s, 2.6, 380, 1580, .03, t);
    }
  },
  { // 8. «Огонь возвращает брата. Но спичка осталась одна.»
    from: () => W(55), to: () => W(62), draw(t) {
      let s = bgTentInside(t, { light: .12 }) + shade(.4);
      const one = pulse(t, W(61), .8);
      s += `<circle cx="540" cy="930" r="${f(300 + one * 50)}" fill="url(#fireGlow)" opacity="${f(.25 + one * .7)}"/>`;
      s += matchbox({ x: 540, y: 960, s: lerp(1.6, 2.5, er(t, W(58), W(61))) + one * .15, n: 1, rot: -6 });
      return cam(s, 1, 540, 960, .05 + one * .4, t) + flicker(t, .05);
    }
  },
  { // 9. «Я пожарный. Угли под пеплом живут часами.»
    from: () => W(62), to: () => W(69), draw(t) {
      let s = bgNight(t, { lit: .3 }) + ashPile({ x: 540, y: 1640, s: 1.4, t, glow: .25 + .15 * er(t, W(64), W(68)) });
      s += misha({ x: 260, y: 1800, s: 1.1, worry: .3, head: .5, blink: blinkAt(t, 3.2) });
      const pz = er(t, W(62) + .1, W(63) + .4), az = er(t, W(65), W(68));
      return cam(s, lerp(lerp(1.1, 2, pz), 1.8, az), lerp(lerp(540, 260, pz), 540, az), lerp(lerp(1450, 1330, pz), 1600, az), .06, t) + flicker(t, .07) + rain(t, 20, .1);
    }
  },
  { // 10. «Разгребаю костёр… Живой уголь.»
    from: () => W(69), to: () => W(73), draw(t) {
      const dig = er(t, W(69), W(70) + .4), gl = .3 + .7 * er(t, W(71), W(72) + .3);
      let s = bgNight(t) + ashPile({ x: 540, y: 1640, s: 1.6, t, glow: gl, dig });
      s += `<line x1="${f(900 - 120 * Math.sin(t * 6) * (1 - er(t, W(71), W(71) + .3)))}" y1="1200" x2="${f(620 - 60 * Math.sin(t * 6) * (1 - er(t, W(71), W(71) + .3)))}" y2="1610" stroke="${P.woodLight}" stroke-width="16" stroke-linecap="round"/>`;
      s += `<ellipse cx="900" cy="1200" rx="60" ry="50" fill="${P.skin}"/>`;
      return cam(s, lerp(1.9, 2.5, er(t, W(69), W(73))), 560, 1600, .05, t) + flicker(t, .05);
    }
  },
  { // 11. Факел; Тёма открывает глаза
    from: () => W(73), to: () => W(81), draw(t) {
      if (t < W(78)) {
        const lit = er(t, W(73) + .1, W(74) + .2);
        let s = bgNight(t) + ashPile({ x: 540, y: 1700, s: 1.4, t, glow: .7 }) + torch({ x: 560, y: 1300, s: 1.6, t, lit, rot: 8 });
        s += `<ellipse cx="590" cy="1560" rx="60" ry="55" fill="${P.skin}"/>`;
        return cam(s, lerp(1.2, 1.45, er(t, W(73), W(78))), 560, 1250, .08, t) + flicker(t, .04);
      }
      const wake = er(t, W(79), W(80) + .3);
      let s = bgTentInside(t, { light: .9, lx: 220, ly: 1300 }) + lyingTyoma({ x: 760, y: 1640, s: .95, blank: lerp(.7, 0, wake), blink: wake > .5 ? blinkAt(t, 2) : 1, curious: wake });
      s += torch({ x: 200, y: 1500, s: 1.1, t, rot: 12 });
      return cam(s, lerp(2.2, 2.7, wake), 380, 1580, .05, t);
    }
  },
  { // 12. «Где мы? Сколько мы тут?»
    from: () => W(81), to: () => W(86), draw(t) {
      let s = bgEdge(t, { lit: .3 }) + tyoma({ x: 560, y: 1820, s: 1.1, curious: 1, mouth: talk(t, 81, 85), head: .3 * Math.sin(t * 2), blink: blinkAt(t, 2.4) });
      s += torch({ x: 850, y: 1600, s: 1.2, t, rot: -6 });
      return cam(s, lerp(2.1, 2.4, er(t, W(81), W(86))), 600, 1420, .06, t) + torchLight(t, 560, 1420, 1400 / 2.2 * 1.2);
    }
  },
  { // 13. «В свете огня тропа идёт дальше.»
    from: () => W(86), to: () => W(92), draw(t) {
      const walk = er(t, W(86) - .3, W(92)), bob = Math.abs(Math.sin(t * 7)) * 8;
      const y = lerp(1900, 1420, walk), sc = lerp(1.05, .55, walk);
      let s = bgRoad(t) + `<g opacity="${f(er(t, W(89) - .3, W(89) + .4) * 100) / 100}">${trailBeyond({})}</g>`;
      s += sil(misha({ x: 470, y: y - bob, s: sc }) + tyoma({ x: 470 + 150 * sc, y: y + 10 * sc - bob, s: sc * .95 }));
      s += torch({ x: 470 - 70 * sc, y: y - 330 * sc - bob, s: sc * .9, t, rot: -10 });
      const lx = 470 - 70 * sc, ly = y - 360 * sc;
      return cam(s + torchLight(t, lx + 60, ly - 250 * sc, lerp(900, 760, walk)), lerp(1.05, 1.35, walk), 540, lerp(1500, 1250, walk), .06, t);
    }
  },
  { // 14. «Птица летит за нами. И кричит.»
    from: () => W(92), to: () => W(98), draw(t) {
      let s = bgRoad(t);
      const k = ramp(t, W(92) - .2, W(97) + .4), cry = pulse(t, W(97) - .05, 1);
      s += sil(misha({ x: 520, y: 2050, s: 1.5 }) + tyoma({ x: 760, y: 2060, s: 1.4 }));
      s += torch({ x: 380, y: 1640, s: 1.4, t, rot: -12 });
      return cam(s, 1.05, 540, 1000, .05 + cry * 1.2, t) + torchLight(t, 380, 1440, 900) + cam(`<rect x="-500" y="0" width="2100" height="1100" fill="#1a2a33" opacity=".35"/>` + birdFly({ x: lerp(-200, 760, k), y: 520 + 60 * Math.sin(k * 7), s: 1.4, flap: t * 9, beak: cry, rot: -6 }), 1.05, 540, 1000, .05 + cry * 1.2, t) + flicker(t, .05);
    }
  },
  { // 15. «Местные выходят к забору. Молча. Без огня.»
    from: () => W(98), to: () => W(105), draw(t) {
      let s = bgNight(t) + shade(.3);
      const xs = [[150, 0], [330, 2], [520, 3], [700, 1], [890, 0]];
      xs.forEach(([x, v], i) => { const op = er(t, W(98) + i * .25, W(98) + i * .25 + .6); s += local({ x, y: 1560, s: .95, v, glow: true, op, flip: x > 540 }); });
      s += fence(1600, 1600, -60, 1140, 30, P.woodDark, 21, 1.1);
      const z = lerp(1.05, 1.35, er(t, W(102), W(105)));
      return cam(s, z, 540, 1350, .04, t) + torchLight(t, 540, 2000, 1300) + flicker(t, .06);
    }
  },
  { // 16. Старик: «Мой брат тоже ушёл с огнём». Птица садится ему на плечо.
    from: () => W(105), to: () => W(117), draw(t) {
      let s = bgNight(t) + shade(.3);
      s += oldman({ x: 520, y: 2150, s: 2.4, head: -.2, glow: true });
      const fly = er(t, W(112) - .3, W(114) + .3), perched = fly >= 1;
      const bx = lerp(1300, 700, fly), by = lerp(500, 1210, fly);
      s += perched ? bird({ x: 690, y: 1300, s: .8, neck: .3, eye: 1, flip: false }) : birdFly({ x: bx, y: by, s: .9, flap: t * 10, rot: 10, flip: true });
      s += fence(1700, 1700, -60, 1140, 22, P.woodDark, 23, 1.6);
      const z = lerp(1.1, 1.4, er(t, W(105), W(112))) - .15 * er(t, W(112), W(114));
      return cam(s, z, 580, 1200, .04 + pulse(t, W(111), .5) * .4, t) + torchLight(t, 520, 1500, 1000) + flicker(t, .05);
    }
  },
  { // 17. Вчерашний лагерь: пепел холодный, гарь заросла иван-чаем
    from: () => W(117), to: () => W(127), draw(t) {
      let s = bgBurnt(t, { bloom: er(t, W(124), W(126) + .6) });
      s += sil(misha({ x: 380, y: 2000, s: 1.4 }) + tyoma({ x: 600, y: 2010, s: 1.3 })) + torch({ x: 250, y: 1720, s: 1.3, t, rot: -8 });
      const ash = er(t, W(122), W(123) + .4), out = er(t, W(124), W(126) + .5);
      return cam(s, lerp(lerp(1.05, 1.7, ash), 1.15, out), lerp(540, 540, ash), lerp(lerp(1300, 1560, ash), 1400, out), .05, t) + torchLight(t, 420, 1380, 1500) + flicker(t, .04);
    }
  },
  { // 18. «Иван-чай растёт на гарях. На второй год.»
    from: () => W(127), to: () => W(134), draw(t) {
      let s = bgBurnt(t, { bloom: 1 });
      const red = pulse(t, W(132), .9);
      return cam(s, lerp(2, 2.8, er(t, W(127), W(134))), 640, 1650, .04 + red * .5, t) + torchLight(t, 540, 1500, 1100) +
        `<rect width="1080" height="1920" fill="#8e2b22" opacity="${f(red * .3 * 100) / 100}"/>` + flicker(t, .05);
    }
  },
  { // 19. Факел гаснет. «Миш… а почему ты думаешь, что пожар был вчера?»
    from: () => W(134), to: () => DURATION, draw(t) {
      if (t > END_VOICE + .7) {
        const k = er(t, END_VOICE + .9, END_VOICE + 1.6);
        return `<rect width="1080" height="1920" fill="#030505"/>` + `<g opacity="${k}"><text x="540" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="88" fill="#e8742e" letter-spacing="6">ПРОДОЛЖЕНИЕ</text><text x="540" y="1000" text-anchor="middle" font-family="Inter" font-weight="900" font-size="88" fill="#e8742e" letter-spacing="6">СЛЕДУЕТ</text><text x="540" y="1110" text-anchor="middle" font-family="Inter" font-weight="600" font-size="44" fill="#9fb0aa">Серия 3</text></g>` +
          `<g opacity="${f(er(t, END_VOICE + 1.8, END_VOICE + 2.6) * 100) / 100}">${matchbox({ x: 540, y: 1500, s: .9, n: 1 })}</g>` + flicker(t, .1);
      }
      const off = er(t, W(135) - .2, W(135) + .5);
      let s = bgBurnt(t, { bloom: 1 }) + tyoma({ x: 560, y: 1840, s: 1.1, mouth: talk(t, 138, 146) * .5, blink: blinkAt(t, 2.6), curious: .3 });
      s += torch({ x: 860, y: 1650, s: 1.2, t, lit: 1 - off, rot: -6 });
      if (off > .9) s += `<ellipse cx="860" cy="1440" rx="14" ry="8" fill="${P.ember}" opacity="${f((.5 + .5 * Math.sin(t * 5)) * 100) / 100}"/>`;
      const r = lerp(1300, 380, off);
      let out = cam(s + torchLight(t, lerp(700, 600, off), 1420, r), lerp(2, 2.6, er(t, W(136), W(146))), 590, 1420, .03, t);
      out += `<rect width="1080" height="1920" fill="#8e2b22" opacity="${f(pulse(t, W(144), .6) * .25 * 100) / 100}"/>`;
      out += `<rect width="1080" height="1920" fill="#000" opacity="${f(er(t, END_VOICE + .1, END_VOICE + .7) * 100) / 100}"/>`;
      return out;
    }
  },
];
// ---------- СУБТИТРЫ ----------
const KEY = new Set(['палатке', 'брат', 'Целые', 'сгорели', 'ржавый', 'карандашом', 'деревня', 'Миша', 'Тёма', 'насовсем', 'сегодня', 'как', 'они', 'Предпоследней', 'Миш', 'улыбается', 'Огонь', 'брата', 'одна', 'пожарный', 'Угли', 'часами', 'уголь', 'Факел', 'Где', 'Сколько', 'дальше', 'Птица', 'кричит', 'Молча', 'огня', 'огнём', 'плечо', 'лагерю', 'холодный', 'иван-чаем', 'Иван-чай', 'второй', 'год', 'гаснет', 'пожар', 'вчера']);
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

// СТРАННЫЙ СИГНАЛ · серия 2 «Правила» — покадровая анимация. render(t) → SVG-строка 1080×1920.
// Требует ../../episode01/art/art.js, ../art/art2.js и WORDS (words.js).

const FPS = 30;
const T_END = 91.0;
const WL = WORDS.words;
const LINES = []; WL.forEach((w, i) => { w.i = i; (LINES[w.line] = LINES[w.line] || []).push(w); });
const ls = i => LINES[i][0].s, le = i => LINES[i][LINES[i].length - 1].e;
// время начала слова в строке по подстроке
function wt(line, sub, k = 0) {
  const c = LINES[line].filter(w => w.w.toLowerCase().includes(sub.toLowerCase()));
  if (!c[k]) throw new Error('word not found: ' + line + ' ' + sub);
  return c[k].s;
}
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const ramp = (t, a, d = 0.25) => ease((t - a) / d);           // 0→1, начиная с a
const pulse = (t, a, d = 0.4) => (t < a || t > a + d) ? 0 : Math.sin((t - a) / d * Math.PI);
function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
const noise = (t, sp = 8) => { const i = Math.floor(t * sp), f = t * sp - i; return hash(i) * (1 - f) + hash(i + 1) * f; };

// ── камера: центр (cx,cy) кадра-источника, масштаб s, лёгкая «ручная» тряска
function cam(cx, cy, s, inner, t, shake = 1) {
  const dx = (noise(t, 0.7) - 0.5) * 14 * shake, dy = (noise(t + 40, 0.6) - 0.5) * 12 * shake;
  return `<g transform="translate(${540 + dx} ${960 + dy}) scale(${s}) translate(${-cx} ${-cy})">${inner}</g>`;
}
const at = (x, y, s, inner, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">${inner}</g>`;

// ── оверлеи
function rain(t, k) {
  if (k <= 0) return '';
  let s = '';
  for (let i = 0; i < 150; i++) {
    const sp = 2300 + hash(i) * 900, len = 40 + hash(i + 7) * 50;
    const x0 = hash(i + 3) * 1300 - 100, y = ((hash(i + 11) * 2200 + t * sp) % 2200) - 140;
    const x = x0 - y * 0.12;
    s += `<line x1="${x}" y1="${y}" x2="${x - len * 0.12}" y2="${y + len}" stroke="#b9d3ff" stroke-width="2" opacity="${(0.12 + hash(i + 5) * 0.22) * k}"/>`;
  }
  return s;
}
function dust(t, k = 1) {
  let s = '';
  for (let i = 0; i < 40; i++) {
    const x = (hash(i) * 1080 + Math.sin(t * 0.3 + i) * 40), y = (hash(i + 9) * 1920 - t * (8 + hash(i + 2) * 14) + 1920 * 4) % 1920;
    s += `<circle cx="${x}" cy="${y}" r="${1 + hash(i + 4) * 2.2}" fill="#cfd8ff" opacity="${(0.05 + hash(i + 6) * 0.12) * k}"/>`;
  }
  return s;
}
function banner(text, t0, t, o = {}) {
  if (t < t0) return '';
  const y = -230 + 330 * ease((t - t0) / 0.28);
  const lines = wrapText(text, 26);
  const h = 96 + lines.length * 52;
  const shake = pulse(t, t0, 0.3) * 8 * Math.sin(t * 90);
  return `<g transform="translate(${60 + shake} ${y})"><rect width="960" height="${h}" rx="34" fill="#121a28" opacity=".94" stroke="#2c3a52" stroke-width="2"/>
    <circle cx="62" cy="58" r="26" fill="#1f2a3a"/><text x="62" y="68" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="30" fill="${P.cyan}">?</text>
    <text x="106" y="68" font-family="Inter Display" font-weight="800" font-size="30" fill="#9fb0c6">${o.title || 'НЕИЗВЕСТНЫЙ'} · сейчас</text>
    ${lines.map((l, i) => `<text x="40" y="${140 + i * 52}" font-family="Inter Display" font-weight="800" font-size="44" fill="#f1f5fa">${l}</text>`).join('')}</g>`;
}
function bubble(x, y, text, t0, t, flip = false) {
  if (t < t0) return '';
  const k = ease((t - t0) / 0.18), w = 40 + text.length * 25;
  const bx = flip ? -w + 40 : -40;
  return `<g transform="translate(${x} ${y}) scale(${0.6 + 0.4 * k})" opacity="${k}">
    <rect x="${bx}" y="-74" width="${w}" height="86" rx="40" fill="#e9eef5"/>
    <polygon points="${flip ? '10,8 40,8 30,40' : '-10,8 -40,8 -30,40'}" fill="#e9eef5"/>
    <text x="${bx + w / 2}" y="-16" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="44" fill="#141820">${text}</text></g>`;
}
function vignette(k = 1, color = '#000') {
  return `<rect width="1080" height="1920" fill="url(#gVig)" opacity="${k}"/>`;
}

// ── субтитры по словам
const KEY = [
  [/^(зеркал|сообщен|экран|салон|свет|телефон)/i, P.cyan],
  [/^(тём|седьм|маршрут|правил|марк|садов|ключи)/i, P.amber],
  [/^(очередь|полночь|нет|двое|настоящий|второй|спал|босиком|процент|один|пустить|погас|задерживать|отвечай|закрыл)/i, P.red]
];
const keyColor = w => { const c = w.replace(/[«»„“"—.,!?:…]/g, ''); for (const [re, col] of KEY) if (re.test(c)) return col; return null; };
const CHUNKS = [];
LINES.forEach(line => {
  let cur = [];
  line.forEach(w => {
    const len = cur.map(x => x.w).join(' ').length + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 19 || /[.?!…»]$/.test(cur[cur.length - 1].w))) { CHUNKS.push(cur); cur = []; }
    cur.push(w);
  });
  if (cur.length) CHUNKS.push(cur);
});
function subs(t) {
  let ch = null;
  for (let i = 0; i < CHUNKS.length; i++) {
    const c = CHUNKS[i], a = c[0].s - 0.08, nx = CHUNKS[i + 1] ? CHUNKS[i + 1][0].s - 0.08 : 1e9;
    const end = Math.min(nx, c[c.length - 1].e + 0.6);
    if (t >= a && t < end) { ch = c; break; }
  }
  if (!ch) return '';
  const k = ease((t - (ch[0].s - 0.08)) / 0.1);
  const spans = ch.map(w => {
    const txt = w.w.replace(/[«»„“"]/g, '');
    const kc = keyColor(w.w), on = t >= w.s, now = t >= w.s && t < w.e + 0.05;
    const fill = kc || '#ffffff';
    return `<tspan fill="${fill}" opacity="${on ? 1 : 0.5}" font-size="${now ? 98 : 88}">${txt}</tspan>`;
  }).join('<tspan font-size="88">\u00A0</tspan>');
  return `<g opacity="${k}" transform="translate(540 ${1660 + (1 - k) * 18})"><text x="0" y="0" text-anchor="middle" font-family="Inter Display" font-weight="900"
    stroke="#05070d" stroke-width="16" stroke-linejoin="round" paint-order="stroke" letter-spacing="1">${spans}</text></g>`;
}

// ── границы сцен: по одной на строку озвучки
const B = [0]; for (let i = 1; i < LINES.length; i++) B.push(ls(i) - 0.3); B.push(T_END);

// кто сидит в салоне
const backKid = (lit = 0, eyesK = 1, head = 0) => (row, side, x) => {
  if (row !== 5) return null;
  const xx = 540;
  const body = sitTema(xx, (lit > 0 ? tema({ torch: false, mouth: 'smile', head, look: -2 }) : '') +
    `<g opacity="${1 - lit}">${temaShadow({ torch: false, head })}</g>`);
  return { body, glow: sitTema(xx, `<g transform="rotate(${head} 0 -222)">${kidEyes(eyesK * (1 - lit))}</g>`) };
};
const fullBus = (lit) => (row, side, x) => {
  if (row === 5) return { body: sitTema(540, tema({ torch: false, mouth: 'smile', look: -2 })) + sitNeighbor(240, 1) + sitNeighbor(840, 3) };
  return { body: sitNeighbor(x, row * 2 + side, lit) };
};
const doorTema = (o = {}, grin = false) => { const [x, y, s] = TEMA_AT_DOOR; let g = temaBare(Object.assign({ torch: false, mouth: 'smile' }, o)); if (grin) g = temaGrin(g); return at(x, y, s, g); };
const wave = t => [-150 + 18 * Math.sin(t * 9), -25];

const S = [];
// 0 · «Теперь твоя очередь» → утро
S.push((t, u) => {
  const tM = wt(0, 'утром') - 0.15;
  if (t < tM) {
    const fl = (Math.floor(t * 12) % 6 === 0) ? 0.45 : 1;
    const ph = phoneScreen({ msgs: t > 0.05 ? ['Теперь твоя очередь.'] : [], battery: 1 });
    return cam(540, 960, 1.0 + 0.05 * u, `<rect width="1080" height="1920" fill="#05070d"/><g opacity="${fl}">${at(214, 170, 1.55, ph)}</g>`, t, 0.6) +
      `<rect width="1080" height="1920" fill="url(#gRedVig)" opacity="${pulse(t, 0.6, 1.2)}"/>`;
  }
  const room = bgBedroom({ clock: '07:12', curtain: 0.2 + Math.sin(t) * 0.2 }) + `<rect width="1080" height="1920" fill="#ffcf8a" opacity=".10"/>` + dust(t, 1.4) +
    at(780, 1500, 1.2, mark({ phone: true, glow: 0.5, armR: [-12, 158], look: 3, brow: -3 }));
  return cam(640, 1150, 1.1 + 0.08 * ramp(t, tM, 3), room, t);
});
// 1 · новый файл: правила
S.push((t, u) => {
  const sc = rulesScreen({ file: ramp(t, wt(1, 'файл') - 0.2, 0.3), open: ramp(t, wt(1, 'правила') - 0.1, 0.35), sub: ramp(t, wt(1, 'ночная') - 0.1, 0.3) });
  const bg = `<g opacity=".3">${bgBedroom({ clock: '07:12' })}</g>`;
  return cam(540, 960 + 120 * ramp(t, wt(1, 'правила'), 0.6), 1.02 + 0.12 * u, bg + at(214, 170, 1.55, sc), t, 0.6);
});
// 2 · кабина, вечер: «таких правил у нас нет»
S.push((t, u) => cam(540, 960, 1.0 + 0.06 * u, bgCab({ t, clock: '23:41', mirror: { lights: 0.9 } }), t, 0.5) + rain(t, 0.3));
// 3 · ПРАВИЛО 1
S.push((t, u) => cam(540, 960, 1.0 + 0.04 * u, ruleCard(1, [['После полуночи пассажиров нет.', wt(3, 'после')], ['Если кто-то сел — не смотри в зеркало.', wt(3, 'если')]], t, B[3]), t, 0.4));
// 4 · полночь: двери сами, кто-то сел, «я не смотрел»
S.push((t, u) => {
  const tMid = wt(4, 'полночь'), tDoor = wt(4, 'двери'), tSat = wt(4, 'кто-то'), tNo = wt(4, 'смотрел') - 0.25;
  const clock = t < tMid ? '23:59' : '00:00', blink = t > tMid && Math.floor(t * 4) % 2 ? 0.35 : 1;
  const door = t > tDoor && t < tSat + 0.6 ? 1 : 0;
  const mirLights = 0.15 + (noise(t, 12) > 0.8 ? 0.4 : 0);
  const inner = bgCab({ t, clock, blink, door, mirror: { lights: mirLights + 0.25, occ: t > tSat ? backKid(0, ramp(t, tSat, 0.5)) : null }, mirrorDark: ramp(t, tNo, 0.15) * 0.92 });
  const zIn = ramp(t, tSat - 0.2, 0.9) * (1 - ramp(t, tNo, 0.12));
  return cam(540, 960 - 660 * zIn, 1.0 + 1.6 * zIn, inner, t, 0.5 + zIn) + rain(t, 0.2) + `<rect width="1080" height="1920" fill="url(#gRedVig)" opacity="${pulse(t, tDoor, 0.7)}"/>`;
});
// 5 · ПРАВИЛО 2
S.push((t, u) => cam(540, 960, 1.0 + 0.04 * u, ruleCard(2, [['Если тебя позовут по имени —', wt(5, 'если')], ['не отвечай.', wt(5, 'отвечай') - 0.1]], t, B[5]), t, 0.4));
// 6 · салон: «Марк…» голосом Тёмы
S.push((t, u) => {
  const tName = wt(6, 'марк'), tV = wt(6, 'голосом');
  const L = 0.2 + (noise(t, 10) > 0.85 ? 0.25 : 0);
  const inner = bgSalon({ t, lights: L, occ: backKid(0, 0.6 + 0.4 * ramp(t, tV, 0.5)) });
  return cam(540, 1000, 1.25 + 0.6 * ease(u), inner, t, 0.6) + bubble(600, 760, 'Марк…', tName, t);
});
// 7 · дом: Тёма дома, дверь закрыта
S.push((t, u) => {
  const tShut = wt(7, 'закрыл', 1);
  let s = bgHouse({ neighbors: false, door: 0, lamp: 1 });
  s += `<clipPath id="wTema"><rect x="190" y="980" width="520" height="380"/></clipPath><g clip-path="url(#wTema)">${at(330, 1460, 1.0, tema({ torch: false, mouth: 'smile', eyes: 'closed', head: -8 }))}</g>`;
  const kk = pulse(t, tShut, 0.3);
  s += `<g transform="translate(835 1290)" opacity="${ramp(t, tShut, 0.15)}"><rect x="-30" y="-10" width="60" height="50" rx="8" fill="${P.amber}"/><path d="M-18,-10 v-18 a18,18 0 0 1 36,0 v18" stroke="${P.amber}" stroke-width="9" fill="none"/></g>`;
  return cam(540 + 140 * ramp(t, tShut - 0.8, 1), 1200, 1.05 + 0.25 * ramp(t, tShut - 0.8, 1), s, t, 1 + kk * 6) + rain(t, 0.7);
});
// 8 · ПРАВИЛО 3
S.push((t, u) => cam(540, 960, 1.0 + 0.04 * u, ruleCard(3, [['Их всегда двое.', wt(8, 'всегда') - 0.2], ['Один настоящий.', wt(8, 'один') - 0.1], ['Второй учился у него, пока ты спал.', wt(8, 'второй') - 0.1]], t, B[8]), t, 0.4) +
  `<rect width="1080" height="1920" fill="url(#gRedVig)" opacity="${pulse(t, wt(8, 'спал'), 0.9)}"/>`);
// 9 · конечная — дом; Тёма у подъезда, босиком, машет
S.push((t, u) => {
  const tHome = wt(9, 'дом'), tT = wt(9, 'тёма') - 0.2, tBare = wt(9, 'босиком'), tWave = wt(9, 'машет') - 0.2;
  if (t < tT) {
    const k = clamp((t - B[9]) / (tHome - B[9]));
    let s = bgRoute({ dot: 0.05 + 0.45 * ease(k) });
    const p = pulse(t, tHome - 0.2, 0.9);
    s += `<circle cx="540" cy="610" r="${40 + 120 * p}" fill="url(#gRed)" opacity="${p}"/>`;
    return cam(540, 900, 1.0 + 0.1 * u, s, t, 0.5);
  }
  const waving = t > tWave;
  const s = bgDoor({ open: 0, tema: doorTema(waving ? { armR: wave(t), look: -2 } : { look: -2 }) });
  const zb = ramp(t, tBare - 0.2, 0.6) * (1 - ramp(t, tWave - 0.1, 0.5));
  return cam(600 + 200 * zb, 1250 + 200 * zb, 1.0 + 1.0 * zb + 0.3 * ramp(t, tWave, 1.5), s, t, 0.6) + rain(t, 0.8);
});
// 10 · салон: «Марк, не открывай. Это не я»
S.push((t, u) => {
  const inner = bgSalon({ t, lights: 0.2 + (noise(t, 11) > 0.86 ? 0.25 : 0), occ: backKid(0, 1), outside: 0.3 });
  return cam(540, 1000, 1.8 + 0.4 * ease(u), inner, t, 0.7) +
    bubble(470, 640, 'Марк, не открывай.', wt(10, 'марк'), t) + bubble(560, 760, 'Это не я.', wt(10, 'это'), t);
});
// 11 · 1 % · «Спроси про ключи»
S.push((t, u) => {
  const tMsg = wt(11, 'сообщение');
  const fl = (Math.floor(t * 10) % 7 === 0) ? 0.5 : 1;
  const ph = phoneScreen({ msgs: t > tMsg + 0.3 ? ['Спроси про ключи.'] : [], battery: 1 });
  return cam(540, 960, 1.02 + 0.08 * u, `<rect width="1080" height="1920" fill="#05070d"/><g opacity="${fl}">${at(214, 170, 1.55, ph)}</g>`, t, 0.6) +
    `<rect width="1080" height="1920" fill="url(#gRedVig)" opacity="${pulse(t, wt(11, 'процент') - 0.2, 0.9)}"/>`;
});
// 12 · двери открываются: «Тём… а ключи взял?»
S.push((t, u) => {
  const tOpen = wt(12, 'открыл') - 0.1;
  const s = bgDoor({ open: ramp(t, tOpen, 0.9), tema: doorTema({ look: -2 }) });
  return cam(560, 1150, 1.0 + 0.15 * u, s, t, 0.6) + rain(t, 0.9) + bubble(300, 1460, 'Тём… а ключи взял?', wt(12, 'тём') - 0.1, t);
});
// 13 · тот, что у подъезда: «Ты же сам их взял»
S.push((t, u) => {
  const tSm = wt(13, 'улыбнулся') - 0.1;
  const s = bgDoor({ open: 1, tema: doorTema({ look: 0, head: 3 * ramp(t, tSm, 0.5) }, t > tSm) });
  return cam(800, 1260, 2.0 + 0.4 * ease(u), s, t, 0.6) + rain(t, 0.9) + bubble(560, 760, 'Ты же сам их взял.', wt(13, 'ты') - 0.1, t, true);
});
// 14 · тот, что сзади: «Какие ключи, Марк?»
S.push((t, u) => {
  const lit = ramp(t, wt(14, 'прошептал'), 1.4) * 0.85;
  const inner = bgSalon({ t, lights: 0.12 + 0.2 * lit, occ: backKid(lit, 1), outside: 0.2 });
  return cam(540, 1020, 2.0 + 0.5 * ease(u), inner, t, 0.6) + bubble(720, 600, 'Какие ключи, Марк?', wt(14, 'какие') - 0.1, t, true);
});
// 15 · двое: кого пустить
S.push((t, u) => {
  const hd = 12 * ramp(t, wt(15, 'кого') - 0.1, 0.6);
  const left = cam(800, 1260, 2.0, bgDoor({ open: 1, tema: doorTema({ head: hd, look: 2 }, true) }), t, 0.5);
  const right = cam(540, 1010, 2.4, bgSalon({ t, lights: 0.35, occ: backKid(0.85, 1, hd) }), t + 30, 0.5);
  const sl = 1 - ramp(t, B[15], 0.5);
  return `<clipPath id="cL"><rect width="540" height="1920"/></clipPath><clipPath id="cR"><rect x="540" width="540" height="1920"/></clipPath>
    <g clip-path="url(#cL)"><g transform="translate(-270 0)">${left}</g></g><g clip-path="url(#cR)"><g transform="translate(270 0)">${right}</g></g>
    <rect x="534" width="12" height="1920" fill="${P.red}" transform="translate(0 ${-1920 * sl})"/>`;
});
// 16 · экран погас → в салоне зажёгся свет: полный автобус
S.push((t, u) => {
  const tOff = wt(16, 'погас') - 0.1, tLight = wt(16, 'зажёгся') - 0.1;
  if (t < tLight) {
    const off = ramp(t, tOff, 0.15);
    const ph = phoneScreen({ msgs: ['Спроси про ключи.'], battery: 1 }) + `<rect width="420" height="860" rx="44" fill="#000" opacity="${off}"/>`;
    return `<rect width="1080" height="1920" fill="#030408"/>` + (off < 1 ? at(214, 170, 1.55, ph) : at(214, 170, 1.55, `<rect x="-14" y="-14" width="448" height="888" rx="56" fill="#05070c"/><rect width="420" height="860" rx="44" fill="#000"/>`));
  }
  const L = ramp(t, tLight, 0.2);
  const fl = t < tLight + 0.6 && Math.floor(t * 20) % 3 === 0 ? 0.4 : 1;
  const inner = bgSalon({ t, lights: L * fl, occ: fullBus(1), outside: 0.2 });
  return cam(540, 1000, 1.0 + 0.12 * ease((t - tLight) / 3), inner, t, 0.4) + `<rect width="1080" height="1920" fill="#fff" opacity="${pulse(t, tLight, 0.3) * 0.6}"/>`;
});
// 17 · ПРАВИЛО 4 и титр
S.push((t, u) => {
  const tEnd = le(17) + 0.5;
  if (t < tEnd) return cam(540, 960, 1.0 + 0.05 * u, ruleCard(4, [['Посадку не задерживать.', wt(17, 'посадку') - 0.1]], t, B[17]), t, 0.4);
  let out = `<rect width="1080" height="1920" fill="#000"/>`;
  const tTitle = tEnd + 0.2, k = ramp(t, tTitle, 0.6), gl = pulse(t, tTitle, 0.3) * 18;
  out += `<g opacity="${k}"><text x="${540 + gl}" y="900" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="118" fill="${P.amber}" letter-spacing="4">СТРАННЫЙ</text>
    <text x="${540 - gl}" y="1030" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="118" fill="${P.amber}" letter-spacing="4">СИГНАЛ</text>
    <text x="540" y="1120" text-anchor="middle" font-family="Inter Display" font-weight="700" font-size="44" fill="#9fb0c6">серия 2 · «Правила»</text>
    <text x="540" y="1250" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="40" fill="${P.cyan}" opacity="${ramp(t, tTitle + 0.8, 0.5)}">продолжение следует…</text></g>`;
  return out;
});

const EXTRA_DEFS = `<defs><radialGradient id="gVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
  <radialGradient id="gRedVig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="${P.red}" stop-opacity="0"/><stop offset="1" stop-color="${P.red}" stop-opacity=".55"/></radialGradient></defs>`;

function render(t) {
  let si = 0; while (si < S.length - 1 && t >= B[si + 1]) si++;
  const u = clamp((t - B[si]) / (B[si + 1] - B[si]));
  const s = S[si](t, u);
  const dB = Math.min(...B.slice(1, -1).map(b => Math.abs(t - b)));
  const cut = dB < 0.1 ? (1 - dB / 0.1) * 0.85 : 0;
  const flick = noise(t, 14) * 0.07;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">${defs()}${EXTRA_DEFS}${ART2_DEFS}
    <rect width="1080" height="1920" fill="#000"/>${s}${vignette(0.9)}
    <rect width="1080" height="1920" fill="#000" opacity="${flick + cut}"/>${subs(t)}</svg>`;
}
if (typeof module !== 'undefined') module.exports = { render, T_END, FPS, B };

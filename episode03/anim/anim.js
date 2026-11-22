// СТРАННЫЙ СИГНАЛ · серия 3 «Черновики» — покадровая анимация. render(t) → SVG-строка 1080×1920.
// Требует ../../episode01/art/art.js, ../../episode02/art/art2.js, ../art/art3.js и WORDS (words.js).

const FPS = 30;
const T_END = 78.0;
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
  [/^(сообщен|телефон|черновик|отправлен|экран|наушник|окно)/i, P.cyan],
  [/^(тём|марк|неизвестн|ботинк|кровать|одеял)/i, P.amber],
  [/^(я\.|сплю|два|сорок|семь|кончилась|дыхани|моё|моим|оттуда|сне|там|промолчал|ложись|посмотрел)/i, P.red]
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

const BR = t => 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / 1.7);       // ритм дыхания, как в серии 1
const night = k => `<rect width="1080" height="1920" fill="#050816" opacity="${0.55 * k}"/>`;
const morning = `<rect width="1080" height="1920" fill="#ffcf8a" opacity=".09"/>`;
function room(o = {}) {
  const q = Object.assign({ clock: '07:40', sleeper: null, breath: 0, bootsOn: false, sit: -1, sitO: {}, night: 0 }, o);
  let s = bgBedroom({ clock: q.clock, curtain: 0.3 });
  if (q.sit >= 0) s += doubleSitting(q.sit, q.sitO);
  if (q.sleeper) s += headOnPillow(q.sleeper);
  s += blanket({ breath: q.breath });
  if (q.bootsOn) s += boots();
  s += q.night ? night(q.night) : morning;
  return s;
}
const phone = (o, t, shake = 0) => at(214 + shake, 170, 1.55, phoneScreen(Object.assign({ battery: 63 }, o)).replace('02:47', o.time || '07:41'));
const dark = `<rect width="1080" height="1920" fill="#05070d"/>`;
const fullBus = (row, side, x) => row === 5 ? { body: sitTema(540, tema({ torch: false, mouth: 'smile', look: -2 })) + sitNeighbor(240, 1) + sitNeighbor(840, 3) } : { body: sitNeighbor(x, row * 2 + side, 1) };

const S = [];
// 0 · двери закрыты, едем
S.push((t, u) => {
  const fo = ramp(t, wt(0, 'поехал') + 0.2, 0.8);
  const inner = bgCab({ t, clock: '00:03', door: t < wt(0, 'закрыл') + 0.3 ? 1 : 0, mirror: { lights: 1, occ: fullBus, outside: 0.2 } });
  return cam(540, 700 - 300 * ramp(t, wt(0, 'закрыл'), 1.5), 1.0 + 0.9 * ramp(t, wt(0, 'закрыл'), 1.5), inner, t, 0.6) + rain(t, 0.2) + `<rect width="1080" height="1920" fill="#000" opacity="${fo}"/>`;
});
// 1 · утро, в своей кровати, в ботинках
S.push((t, u) => {
  const tB = wt(1, 'ботинках') - 0.3;
  const s = room({ sleeper: { eyes: t > wt(1, 'проснулся') ? 'open' : 'closed' }, bootsOn: true }) + dust(t, 1.4);
  const zb = ramp(t, tB, 0.5);
  return cam(700 + 120 * zb, 1310, 1.6 + 0.6 * zb + 0.05 * u, s, t, 0.5) + `<rect width="1080" height="1920" fill="#000" opacity="${1 - ramp(t, B[1], 0.8)}"/>`;
});
// 2 · Тёма на полу с моим телефоном
S.push((t, u) => {
  const s = room({ bootsOn: false }) + temaSitting(330, 1800, 1.25, { phone: true, glow: 1, armR: [-30, 120], armL: [30, -60], look: 3, head: 8 }) + dust(t, 1.2);
  return cam(420, 1450, 1.35 + 0.15 * u, s, t);
});
// 3 · «Марк, а кто такой Неизвестный?»
S.push((t, u) => {
  const s = room({}) + temaSitting(330, 1800, 1.25, { phone: true, glow: 0.8, armR: [-30, 120], armL: [30, -60], look: 4, head: -4, mouth: t > ls(3) && t < le(3) ? 'o' : 'smile' });
  return cam(360, 1450, 2.0 + 0.2 * u, s, t) + bubble(400, 1240, 'Марк, а кто такой', ls(3) - 0.1, t) + bubble(420, 1350, '«Неизвестный»?', wt(3, 'неизвестный') - 0.1, t);
});
// 4 · «Отправленные»
S.push((t, u) => {
  const m = [];
  if (t >= wt(4, 'окно') - 0.2) m.push('Не смотри в окно.');
  if (t >= wt(4, 'остановку') - 0.2) m.push('Ты у остановки «Трасса».');
  if (t >= wt(4, 'ключи') - 0.2) m.push('Спроси, взял ли он ключи.');
  return cam(540, 960, 1.02 + 0.05 * u, dark + phone({ msgs: m, title: 'Отправленные', done: true }, t), t, 0.5);
});
// 5 · Отправитель — я
S.push((t, u) => {
  const k = ramp(t, wt(5, 'я.') - 0.1, 0.2);
  const ph = phone({ msgs: ['Не смотри в окно.', 'Ты у остановки «Трасса».', 'Спроси, взял ли он ключи.'], title: k > 0.5 ? 'Отправитель: Марк' : 'Отправленные', done: true }, t);
  return cam(540, 300, 1.0 + 0.9 * ease(u), dark + ph, t, 0.6) + `<rect width="1080" height="1920" fill="url(#gRedVig)" opacity="${pulse(t, wt(5, 'я.') - 0.1, 1.0)}"/>`;
});
// 6 · 02:47 каждую ночь — часы, потом календарь
S.push((t, u) => {
  const tC = wt(6, 'каждую') - 0.2, tS = wt(6, 'сплю') - 0.3;
  const s = bgBedroom({ clock: '02:47' }) + night(0.6) + `<ellipse cx="486" cy="1282" rx="130" ry="60" fill="url(#gRed)" opacity="${0.6 + 0.3 * Math.sin(t * 6)}"/>`;
  const p = ramp(t, tC, 0.6), q = ramp(t, tS, 0.7);
  const cx = 486 + (885 - 486) * p - (885 - 600) * q, cy = 1282 + (575 - 1282) * p + (1300 - 575) * q;
  return cam(cx, cy, 3.0 - 1.0 * q, s + headOnPillow({}) + blanket({ breath: BR(t) }), t, 0.6);
});
// 7 · черновики: «Не смотри на кровать»
S.push((t, u) => {
  const tD = wt(7, '«не') - 0.1;
  const txt = t < tD ? [] : ['Не смотри на кровать.' + (Math.floor(t * 3) % 2 ? '|' : '')];
  return cam(540, 960, 1.02 + 0.05 * u, dark + phone({ msgs: txt, title: 'Черновики' }, t), t, 0.5) + `<rect width="1080" height="1920" fill="url(#gRedVig)" opacity="${pulse(t, wt(7, 'кровать'), 0.8)}"/>`;
});
// 8 · «Я посмотрел» — рывок камеры к кровати
S.push((t, u) => {
  const p = ease(u * 1.6);
  const s = room({ sleeper: { face: false }, breath: BR(t), night: 0.3 });
  return cam(300 + 560 * p, 1500 - 200 * p, 1.3 + 0.6 * p, s, t, 1.2);
});
// 9 · кто-то лежит, дышит моим дыханием
S.push((t, u) => {
  const b = BR(t);
  let s = room({ sleeper: { face: false }, breath: b, night: 0.3 });
  const k = ramp(t, wt(9, 'моим') - 0.2, 0.6);
  for (let i = 0; i < 3; i++) s += `<path d="M${640 - i * 30},${1200 - i * 26} q-40,-60 0,-120" stroke="${P.cyan}" stroke-width="5" fill="none" opacity="${k * b * (0.8 - i * 0.2)}"/>`;
  return cam(820, 1300, 2.4 + 0.3 * u, s, t, 0.5);
});
// 10 · «Марк, ты же здесь. А кто там?»
S.push((t, u) => {
  const s = room({ sleeper: { face: false }, breath: BR(t), night: 0.3 }) +
    at(470, 1800, 1.15, mark({ look: 4, head: 4, brow: -3, armR: [-30, 20] })) +
    at(250, 1820, 1.2, tema({ torch: false, look: 4, head: -6, armR: [-40, -10], mouth: t > ls(10) + 1.5 ? 'o' : 'smile' }));
  return cam(560, 1450, 1.25 + 0.1 * u, s, t) + bubble(260, 1170, 'Марк, ты же здесь.', wt(10, 'марк') - 0.1, t) + bubble(330, 1060, 'А кто там?', wt(10, 'кто') - 0.15, t);
});
// 11 · молчание
S.push((t, u) => {
  const s = room({ sleeper: { face: false }, breath: BR(t), night: 0.4 }) + at(470, 1800, 1.15, mark({ look: 3, eyes: t > wt(11, 'промолчал') - 0.2 ? 'wide' : 'open', brow: -4 }));
  const fl = noise(t, 12) > 0.85 ? 0.35 : 0;
  return cam(470, 1330, 3.0 + 0.3 * u, s, t, 0.4) + `<rect width="1080" height="1920" fill="#000" opacity="${fl}"/>`;
});
// 12 · тот садится, берёт телефон, печатает
S.push((t, u) => {
  const k = ramp(t, wt(12, 'сел') - 0.4, 0.9), tP = wt(12, 'телефон') - 0.1;
  const glow = t > tP ? 0.7 + 0.3 * noise(t, 15) : 0;
  const s = room({ sit: k, sitO: { phone: t > tP, glow, armR: t > tP ? [-12, 158] : [-10, 6] }, breath: 0, night: 0.45 }) +
    (t > tP ? `<ellipse cx="720" cy="1100" rx="90" ry="100" fill="url(#gCyan)" opacity="${glow * 0.8}"/>` : '');
  return cam(760, 1250, 1.9 + 0.2 * u, s, t, 0.5);
});
// 13 · мой телефон: «Ложись. Твоя смена кончилась»
S.push((t, u) => {
  const tV = wt(13, 'завибрировал'), sh = t > tV && t < tV + 1.2 ? Math.sin(t * 80) * 8 : 0;
  const s = room({ sit: 1, sitO: { phone: true, glow: 0.9, armR: [-12, 158] }, night: 0.45 }) +
    at(470, 1800, 1.15, mark({ phone: true, glow: 0.9, armR: [-12, 158], look: 4, brow: -4 }));
  return cam(560 + sh, 1350, 1.3, s, t, 0.5) + banner('Ложись. Твоя смена кончилась.', wt(13, 'ложись') - 0.2, t, { title: 'МАРК' });
});
// 14 · часы: 07:40 → 02:47, комната гаснет в ночь
S.push((t, u) => {
  const tF = wt(14, 'два') - 0.15, k = ramp(t, tF, 0.4);
  const s = bgBedroom({ clock: t < tF ? (Math.floor(t * 6) % 2 ? '07:40' : '--:--') : '02:47' }) + night(0.2 + 0.6 * k) + headOnPillow({}) + blanket({ breath: BR(t) }) +
    `<ellipse cx="486" cy="1282" rx="130" ry="60" fill="url(#gRed)" opacity="${0.3 + 0.6 * k}"/>`;
  return cam(486, 1285, 3.4 - 0.3 * u, s, t, 0.5) + `<rect width="1080" height="1920" fill="#fff" opacity="${pulse(t, tF, 0.25) * 0.4}"/>`;
});
// 15 · дыхание в наушниках было моим
S.push((t, u) => {
  const b = BR(t), tM = wt(15, 'моё') - 0.2;
  let s = `<g opacity=".45">${room({ sleeper: {}, breath: b, night: 0.8 })}</g><rect width="1080" height="1920" fill="#05070d" opacity=".5"/>`;
  s += at(600, 2150, 3.1, mark({ eyes: t > tM ? 'wide' : 'open', look: t > tM ? 3 : 0, brow: t > tM ? -4 : 0, head: -3 }));
  for (let i = 0; i < 3; i++) s += `<path d="M${740 + i * 34},${840 - i * 14} q${40 + i * 10},${70 + i * 14} 0,${140 + i * 28}" stroke="${P.cyan}" stroke-width="7" fill="none" opacity="${b * (0.8 - i * 0.2)}"/>`;
  const fo = ramp(t, wt(15, 'сне'), 0.6) * 0.85;
  return cam(540, 960, 1.0 + 0.12 * u, s, t, 0.7) + `<rect width="1080" height="1920" fill="#000" opacity="${fo}"/>`;
});
// 16 · сообщение Тёме: «Не смотри в окно» + титр
S.push((t, u) => {
  const tEnd = le(16) + 0.5;
  if (t < tEnd) {
    const tW = wt(16, 'окно') - 0.2;
    let s = bgBedroom({ clock: '02:47', curtain: Math.sin(t * 1.3) * 0.6 + 0.4 }) + night(0.5) + headOnPillow({}) + blanket({ breath: BR(t) }) +
      `<rect x="${150}" y="1572" width="260" height="124" rx="22" fill="#5a2c38"/>` +
      at(392, 1622, 0.9, tema({ eyes: 'open', torch: false, phone: true, glow: 1, armR: [-12, 158], look: -3 }), -90) +
      `<rect x="290" y="820" width="80" height="90" fill="${P.cyan}" opacity="${0.6 * pulse(t, tW, 0.6)}"/>`;
    return cam(420, 1250 - 250 * ramp(t, tW, 1), 1.2 + 0.2 * u, s, t) + banner('Не смотри в окно.', wt(16, 'тёме'), t, { title: 'МАРК' });
  }
  let out = `<rect width="1080" height="1920" fill="#000"/>`;
  const tTitle = tEnd + 0.2, k = ramp(t, tTitle, 0.6), gl = pulse(t, tTitle, 0.3) * 18;
  out += `<g opacity="${k}"><text x="${540 + gl}" y="900" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="118" fill="${P.amber}" letter-spacing="4">СТРАННЫЙ</text>
    <text x="${540 - gl}" y="1030" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="118" fill="${P.amber}" letter-spacing="4">СИГНАЛ</text>
    <text x="540" y="1120" text-anchor="middle" font-family="Inter Display" font-weight="700" font-size="44" fill="#9fb0c6">серия 3 · «Черновики»</text>
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

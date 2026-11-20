// СТРАННЫЙ СИГНАЛ · серия 1 — покадровая анимация. render(t) → SVG-строка 1080×1920.
// Требует art.js (графика) и WORDS (тайминг слов из words.json).

const FPS = 30;
const T_END = 87.5;
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

// ── границы сцен (по началу строк озвучки)
const B = [0, ls(1) - 0.2, ls(2) - 0.25, ls(3) - 0.2, ls(5) - 0.3, ls(8) - 0.3, ls(9) - 0.2, ls(10) - 0.3, ls(11) - 0.3,
  ls(13) - 0.3, ls(15) - 0.3, ls(16) - 0.2, ls(17) - 0.3, ls(18) - 0.3, T_END];

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

// ── HUD: таймер наушников (10 минут пауэрбанка)
const T_TIMER0 = wt(8, 'наушникам'), T_TIMER1 = wt(16, 'пауэрбанк');
function hud(t) {
  if (t < T_TIMER0 || t > T_TIMER1 + 0.8) return '';
  const left = Math.max(0, 600 * (1 - (t - T_TIMER0) / (T_TIMER1 - T_TIMER0)));
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(Math.floor(left % 60)).padStart(2, '0');
  const red = left < 120, blink = t > T_TIMER1 ? (Math.floor(t * 8) % 2) : 1;
  const c = red ? P.red : P.amber;
  return `<g transform="translate(700 120)" opacity="${blink * ramp(t, T_TIMER0, 0.3)}"><rect width="320" height="86" rx="43" fill="#0a0e18" opacity=".85" stroke="${c}" stroke-width="3"/>
    <path d="M44,58 v-14 a26,26 0 0 1 52,0 v14" stroke="${c}" stroke-width="6" fill="none"/><rect x="36" y="48" width="16" height="22" rx="5" fill="${c}"/><rect x="88" y="48" width="16" height="22" rx="5" fill="${c}"/>
    <text x="210" y="60" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="46" fill="${c}">${mm}:${ss}</text></g>`;
}

// ── субтитры по словам
const KEY = [
  [/^(окн|окне|дыш|дыхан|сообщен|соседи|телефонами|экран)/i, P.cyan],
  [/^(тём|трасс|седьм|маршрут|кругу)/i, P.amber],
  [/^(сейчас|один|два|процент|десять|ближе|оборачив|знаю|дверь|домой|дома|погас|нет|очередь|меня)/i, P.red]
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

// ── сцены
const S = [];
// A · спальня, первое сообщение
S.push((t, u) => {
  const tMsg = wt(0, 'сообщение'), tWin = wt(0, 'окно');
  const room = bgBedroom({ curtain: Math.sin(t * 1.3) * 0.6 + 0.4 }) + dust(t) +
    `<rect x="290" y="820" width="80" height="90" fill="${P.cyan}" opacity="${0.6 * pulse(t, tWin, 0.5)}"/>` +
    at(780, 1500, 1.2, mark({ phone: true, glow: 0.8 + 0.2 * noise(t, 5), armR: [-12, 158], look: 3, eyes: 'open' }));
  return cam(600, 1100, 1.05 + 0.1 * u, room, t) + banner('Не смотри в окно.', tMsg, t);
});
// B · экран телефона: сообщения появляются по словам
S.push((t, u) => {
  const m = ['Не смотри в окно.'];
  if (t >= wt(1, 'выйди')) m.push('Выйди из дома. Сейчас.');
  if (t >= wt(1, 'или')) m.push('Или он проснётся не один.');
  const bg = `<g opacity=".35">${bgBedroom({ curtain: Math.sin(t * 1.3) })}</g>`;
  const sh = (noise(t, 3) - 0.5) * 10;
  const ph = at(214 + sh, 170 + sh * 0.6, 1.55, phoneScreen({ msgs: m, battery: 3 }), (noise(t + 9, 1) - 0.5) * 2);
  const red = pulse(t, wt(1, 'один'), 0.9);
  return cam(540, 960, 1.02 + 0.04 * u, bg + ph, t, 0.6) + `<rect width="1080" height="1920" fill="url(#gRedVig)" opacity="${red}"/>`;
});
// C · звонок, дыхание
S.push((t, u) => {
  const br = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / 1.7);
  const ring = t < wt(2, 'трубке') ? Math.sin(t * 70) * 6 : 0;
  const bg = `<rect width="1080" height="1920" fill="#06080f"/><circle cx="540" cy="900" r="${520 + br * 80}" fill="url(#gCyan)" opacity="${0.15 + 0.15 * br}"/>`;
  const ph = at(214 + ring, 170, 1.55, phoneScreen({ call: true, wave: t > wt(2, 'трубке') ? 0.3 + 0.7 * br : 0.15, battery: 3 }));
  return cam(540, 960, 1 + 0.05 * u, bg + ph, t, 0.5);
});
// D · будим Тёму; вопросы
S.push((t, u) => {
  const tWake = wt(3, 'разбудил') + 0.25, tQ = ls(4);
  let inner = bgBedroom({ curtain: Math.sin(t * 1.3) * 0.5 }) + dust(t);
  if (t < tWake) {
    const jig = pulse(t, tWake - 0.5, 0.5) * Math.sin(t * 60) * 6;
    inner += at(392 + jig, 1622, 0.9, tema({ eyes: 'closed', torch: false, mouth: 'smile' }), -90);
    inner += `<rect x="${150 + jig}" y="1572" width="260" height="124" rx="22" fill="#5a2c38"/><rect x="${150 + jig}" y="1572" width="260" height="20" rx="10" fill="#6d3846"/>`;
    inner += at(800, 1720, 1.15, mark({ phone: true, glow: 0.7, armL: [-25, -40], armR: [-12, 158], look: -4 }));
  } else {
    const look = t > wt(4, 'ключи') ? -5 : 4;
    const mouth = (t > tQ && t < le(4) + 0.2) ? 'o' : 'smile';
    inner += at(330, 1790, 1.25, tema({ eyes: t < tWake + 0.35 ? 'closed' : 'open', torch: true, look, mouth, head: t > wt(4, 'ключи') ? -6 : 4, armL: [16, -20] }));
    inner += at(780, 1730, 1.15, mark({ phone: true, glow: 0.7, armR: [-12, 158], look: -4, brow: -2 }));
    inner += bubble(420, 1280, 'Кто пишет?', wt(4, 'кто'), t);
    inner += bubble(360, 1170, 'Куда мы?', wt(4, 'куда'), t);
    inner += bubble(440, 1060, 'А ключи взял?', wt(4, 'ключи') - 0.15, t);
  }
  return cam(520, 1420, 1.12 + 0.06 * u, inner, t);
});
// E · трасса: идём по обочине → остановка → «не оборачивайся» → Тёма смотрит в телефон
S.push((t, u) => {
  const tStop = wt(6, 'ты'), tTurn = wt(6, 'оборачивайся'), tKnow = wt(7, 'откуда');
  const walking = t < tStop;
  const ph = t * 5.2, sw = walking ? Math.sin(ph) * 16 : 0, bob = walking ? Math.abs(Math.sin(ph)) * -8 : 0;
  const truck = clamp((t - wt(5, 'трасса')) / 3.5, 0, 1);
  const lamps = [0, 1, 2, 3].map(i => (noise(t + i * 13, 11) > 0.83 ? 0.25 : 1));
  let inner = bgHighway({ lamps, truck: truck < 1 ? truck * truck : 0 });
  inner += at(360, 1800 + bob, 1.05, mark({ back: true, legL: sw, legR: -sw, armL: [-sw * 0.6, 0], armR: [sw * 0.6, 0] }));
  if (t < tKnow + 0.3) inner += at(190, 1830 + bob, 1.1, tema({ back: true, torch: true, legL: -sw, legR: sw, armL: [10, 0], armR: [-10, 0] }));
  else inner += at(190, 1830, 1.1, tema({ torch: false, phone: true, glow: 1, armR: [-8, 160], look: 3, mouth: 'smile', head: 6 }));
  const z = t < tStop ? 1.0 + 0.05 * clamp((t - B[4]) / (tStop - B[4])) : 1.05 + 0.2 * ease((t - tStop) / 1.4) - 0.2 * ease((t - (ls(7) + 0.2)) / 0.8);
  const cx = t < tStop ? 540 : 540 + 220 * ease((t - tStop) / 1.4) - 220 * ease((t - (ls(7) + 0.2)) / 0.8);
  const flash = pulse(t, ls(6) - 0.25, 0.35) * 0.35;
  const red = pulse(t, tTurn, 0.8);
  return cam(cx, 1200, z, inner, t) + rain(t, ramp(t, wt(5, 'гудит'), 2)) +
    `<rect width="1080" height="1920" fill="#dfe8ff" opacity="${flash}"/>` + `<rect width="1080" height="1920" fill="url(#gRedVig)" opacity="${red}"/>` +
    banner('Ты у остановки «Трасса». Не оборачивайся.', ls(6) + 0.6, t);
});
// F · заряд: телефон 2%, пауэрбанк 10%, наушники 10 минут
S.push((t, u) => {
  const tPB = wt(8, 'пауэрбанке'), tHP = wt(8, 'наушникам');
  const blink = Math.floor(t * 4) % 2 ? 1 : 0.55;
  let s = `<rect width="1080" height="1920" fill="#070a12"/>` + dust(t, 0.6);
  // телефон
  s += `<g transform="translate(120 420)"><rect width="330" height="640" rx="40" fill="#0b1018" stroke="#2a3348" stroke-width="6"/>
    <rect x="95" y="200" width="140" height="240" rx="18" fill="none" stroke="${P.red}" stroke-width="10" opacity="${blink}"/><rect x="140" y="182" width="50" height="22" rx="6" fill="${P.red}" opacity="${blink}"/>
    <rect x="110" y="404" width="110" height="22" rx="4" fill="${P.red}" opacity="${blink}"/>
    <text x="165" y="540" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="72" fill="${P.red}">2%</text></g>`;
  // кабель + пауэрбанк
  const c = ramp(t, tPB - 0.2, 0.5);
  s += `<path d="M285,1060 C285,1250 760,1150 760,${1300 - 200 * (1 - c)}" stroke="#d8dde6" stroke-width="10" fill="none" opacity="${c}" stroke-linecap="round"/>`;
  s += `<g transform="translate(600 ${1300 + 260 * (1 - c)})" opacity="${c}"><rect width="320" height="200" rx="26" fill="#22283a"/>
    ${[0, 1, 2, 3].map(i => `<rect x="${40 + i * 40}" y="150" width="26" height="12" rx="4" fill="${i === 0 ? P.red : '#3a4052'}" opacity="${i === 0 ? blink : 1}"/>`).join('')}
    <text x="200" y="110" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="70" fill="${P.amber}">10%</text></g>`;
  // наушники
  const h = ramp(t, tHP - 0.1, 0.4);
  s += `<g transform="translate(560 560) scale(${0.7 + 0.3 * h})" opacity="${h}"><path d="M40,200 v-60 a150,150 0 0 1 300,0 v60" stroke="${P.white}" stroke-width="18" fill="none"/>
    <rect x="10" y="170" width="70" height="120" rx="22" fill="${P.white}"/><rect x="300" y="170" width="70" height="120" rx="22" fill="${P.white}"/>
    ${[0, 1, 2].map(i => `<path d="M${400 + i * 26},${150 + i * -10} q30,80 0,160" stroke="${P.cyan}" stroke-width="6" fill="none" opacity="${0.3 + 0.7 * pulse((t * 1.4 + i * 0.2) % 1, 0, 1)}"/>`).join('')}</g>`;
  return cam(540, 960, 1.0 + 0.05 * u, s, t, 0.7) + rain(t, 0.25);
});
// G · крупно: лицо Марка, наушник, дыхание ближе
S.push((t, u) => {
  const tNear = wt(9, 'ближе');
  const br = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / 1.7);
  let s = `<g opacity=".45">${bgHighway({ lamps: [noise(t, 9) > 0.8 ? 0.2 : 1, 1, 1, 1] })}</g><rect width="1080" height="1920" fill="#05070d" opacity=".5"/>`;
  const near = ramp(t, tNear - 0.4, 0.9);
  s += at(250 + 60 * near, 1500 + 200 * near, 1.0 + 0.6 * near, breather({ breath: br, op: 0.35 + 0.6 * near }));
  s += at(600, 2150, 3.1, mark({ eyes: t > tNear ? 'wide' : 'open', look: t > tNear ? -3 : 2, brow: t > tNear ? -4 : 0, head: -3 }));
  // волны дыхания из наушника
  for (let i = 0; i < 3; i++) s += `<path d="M${740 + i * 34},${840 - i * 14} q${40 + i * 10},${70 + i * 14} 0,${140 + i * 28}" stroke="${P.cyan}" stroke-width="7" fill="none" opacity="${br * (0.8 - i * 0.2)}"/>`;
  return cam(540, 960, 1.0 + 0.12 * u, s, t, 0.8) + rain(t, 0.6);
});
// H · маршрут №7, по кругу
S.push((t, u) => {
  const tLoop = wt(10, 'кругу');
  let s = bgRoute({ dot: 0.36 * ease(u * 1.1) });
  const lp = pulse(t, tLoop - 0.1, 1.0);
  s += `<ellipse cx="540" cy="1040" rx="330" ry="430" fill="none" stroke="${P.amber}" stroke-width="${14 + 20 * lp}" opacity="${lp * 0.6}"/>`;
  return cam(540, 1000, 0.98 + 0.06 * u, s + dust(t, 0.5), t, 0.5);
});
// I · под фонарём: «А если не выполнить?» — «Не знаю»
S.push((t, u) => {
  const tAsk = wt(11, 'если'), tDont = wt(12, 'знаю') - 0.15;
  let l0 = noise(t, 10) > 0.86 ? 0.35 : 1;
  if (t > tDont && t < tDont + 0.55) l0 = 0.05;
  let s = bgHighway({ lamps: [l0, 1, 1, 1] });
  s += `<rect width="1080" height="1920" fill="#000" opacity="${(1 - l0) * 0.55}"/>`;
  const speak = t > tAsk - 0.1 && t < le(11);
  s += at(260, 1830, 1.0, tema({ torch: true, head: 10, look: 4, mouth: speak ? 'o' : 'smile', eyes: 'open', armL: [10, -10] }));
  s += at(520, 1810, 1.0, mark({ head: -6, look: -3, brow: t > ls(12) ? -4 : -1, eyes: 'open', armR: [-6, 4] }));
  return cam(330, 1400, 1.55 + 0.08 * u, s, t) + rain(t, 0.9);
});
// J · экран Тёмы, затем Тёма крупно
S.push((t, u) => {
  if (t < ls(14) - 0.2) {
    const m = [];
    if (t >= wt(13, 'показал')) m.push('Спроси, взял ли он ключи.');
    if (t >= wt(13, 'пишут') - 0.2) m.push('Оставь дверь открытой.');
    if (t >= wt(13, 'начала') - 0.3) m.push('Приведи его домой.');
    const bg = `<rect width="1080" height="1920" fill="#06080f"/><circle cx="540" cy="800" r="700" fill="url(#gCyan)" opacity=".12"/>`;
    return cam(540, 960, 1.02 + 0.05 * u, bg + at(214, 170, 1.55, phoneScreen({ msgs: m, battery: 61, done: true, title: 'НЕИЗВЕСТНЫЙ' })), t, 0.6) + rain(t, 0.15);
  }
  const k = clamp((t - ls(14)) / 3.5);
  const s = `<g opacity=".35">${bgHighway({})}</g><rect width="1080" height="1920" fill="#05070d" opacity=".55"/>` +
    at(540, 1680, 3.4, tema({ torch: false, phone: true, glow: 1, armR: [-8, 160], mouth: 'smile', look: 0, eyes: 'open', head: 4 }));
  return cam(540, 900, 1.0 + 0.08 * k, s, t, 0.6) + rain(t, 0.5);
});
// K · маршрут доходит до дома
S.push((t, u) => {
  const tHome = wt(15, 'дома');
  let s = bgRoute({ dot: 0.36 + 0.14 * ease(clamp((t - B[10]) / (tHome - B[10]))) });
  const p = pulse(t, tHome - 0.2, 0.9);
  s += `<circle cx="540" cy="610" r="${40 + 120 * p}" fill="url(#gRed)" opacity="${p}"/>`;
  return cam(540, 900, 1.0 + 0.15 * u, s, t, 0.5) + `<rect width="1080" height="1920" fill="url(#gRedVig)" opacity="${p * 0.8}"/>`;
});
// L · дом: заряд кончился, наушники молчат, дыхание — нет
S.push((t, u) => {
  const tOff = wt(16, 'пауэрбанк'), tBr = wt(16, 'дыхание');
  let s = bgHouse({ neighbors: false, lamp: noise(t, 9) > 0.85 ? 0.3 : 1 });
  const glitch = pulse(t, tOff + 0.1, 0.25);
  s += at(380, 2120, 1.55, mark({ back: true }));
  s += at(170, 2150, 1.55, tema({ back: true, torch: true }));
  const b = ramp(t, tBr - 0.2, 0.7);
  s += at(980, 2250, 1.5, breather({ breath: 0.5 + 0.5 * Math.sin(t * 3.7), op: 0.92 * b, tilt: -16 }));
  return cam(540, 1250, 1.0 + 0.05 * u, s, t) + rain(t, 1) + `<rect width="1080" height="1920" fill="#fff" opacity="${glitch * 0.5}"/>`;
});
// M · окно: все соседи смотрят
S.push((t, u) => {
  const tN = wt(17, 'соседи'), tLook = wt(17, 'смотрели');
  const g = ramp(t, tN - 0.3, 0.8);
  let s = bgHouse({ neighbors: true, glow: g * (0.85 + 0.15 * noise(t, 6)), lamp: 1 });
  const z = 1.0 + 1.0 * ease(u) + 0.25 * ramp(t, tLook, 1.5);
  return cam(450, 1180 - 30 * ease(u), z, s, t, 0.5) + rain(t, 1);
});
// N · последнее сообщение и титр
S.push((t, u) => {
  const tMsg = wt(18, 'теперь') - 0.1, tOff = le(18) + 0.35, tTitle = tOff + 0.3;
  let out = '';
  if (t < tOff) {
    const fl = (Math.floor(t * 12) % 5 === 0) ? 0.4 : 1;
    const ph = phoneScreen({ msgs: t >= tMsg ? ['Теперь твоя очередь.'] : [], battery: 1 });
    out += cam(540, 960, 1.0 + 0.06 * u, `<rect width="1080" height="1920" fill="#05070d"/><g opacity="${fl}">${at(214, 170, 1.55, ph)}</g>`, t, 0.6);
  } else {
    out += `<rect width="1080" height="1920" fill="#000"/>`;
    const k = ramp(t, tTitle, 0.6), gl = pulse(t, tTitle, 0.3) * 18;
    out += `<g opacity="${k}"><text x="${540 + gl}" y="900" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="118" fill="${P.amber}" letter-spacing="4">СТРАННЫЙ</text>
      <text x="${540 - gl}" y="1030" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="118" fill="${P.amber}" letter-spacing="4">СИГНАЛ</text>
      <text x="540" y="1120" text-anchor="middle" font-family="Inter Display" font-weight="700" font-size="44" fill="#9fb0c6">серия 1 · «Сообщения»</text>
      <text x="540" y="1250" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="40" fill="${P.cyan}" opacity="${ramp(t, tTitle + 0.8, 0.5)}">продолжение следует…</text></g>`;
  }
  return out;
});

const EXTRA_DEFS = `<defs><radialGradient id="gVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
  <radialGradient id="gRedVig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="${P.red}" stop-opacity="0"/><stop offset="1" stop-color="${P.red}" stop-opacity=".55"/></radialGradient></defs>`;

function render(t) {
  let si = 0; while (si < S.length - 1 && t >= B[si + 1]) si++;
  const u = clamp((t - B[si]) / (B[si + 1] - B[si]));
  let s = S[si](t, u);
  // короткая «склейка» через тьму на границах сцен
  const dB = Math.min(...B.slice(1, -1).map(b => Math.abs(t - b)));
  const cut = dB < 0.1 ? (1 - dB / 0.1) * 0.85 : 0;
  const flick = noise(t, 14) * 0.07;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">${defs()}${EXTRA_DEFS}
    <rect width="1080" height="1920" fill="#000"/>${s}${vignette(0.9)}${hud(t)}
    <rect width="1080" height="1920" fill="#000" opacity="${flick + cut}"/>${subs(t)}</svg>`;
}
if (typeof module !== 'undefined') module.exports = { render, T_END, FPS, B };

// СТРАННЫЙ СИГНАЛ — дополнительная графика для серий 2–3 (поверх episode01/art/art.js).

function defs2() {
  return `<defs>
  <linearGradient id="gBeamL" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#fff4d8" stop-opacity=".55"/><stop offset="1" stop-color="#fff4d8" stop-opacity="0"/></linearGradient>
  <linearGradient id="gSheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#bfe6ff" stop-opacity="0"/><stop offset=".5" stop-color="#bfe6ff" stop-opacity=".07"/><stop offset="1" stop-color="#bfe6ff" stop-opacity="0"/></linearGradient>
  <linearGradient id="gBusIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe9ff" stop-opacity=".55"/><stop offset="1" stop-color="#2a6a86" stop-opacity=".25"/></linearGradient>
  </defs>`;
}

// экран телефона с другим контактом/временем
function phoneScreen2(p = {}) {
  let s = phoneScreen(p);
  if (p.avatar) s = s.replace('>?</text>', `>${p.avatar}</text>`);
  if (p.clock) s = s.replace('>02:47</text>', `>${p.clock}</text>`);
  return s;
}

// Марк + варианты: двойник (голубые зрачки), ухмылка, открытый рот
function mark2(p = {}) {
  let s = mark(p);
  const mouth = `<path d="M-8,-393 L8,-393" stroke="${P.skinSh}" stroke-width="3" stroke-linecap="round"/>`;
  if (p.grin) s = s.replace(mouth, `<path d="M-24,-400 Q0,-372 24,-400 Q0,-390 -24,-400Z" fill="${P.ink}"/><path d="M-17,-396 Q0,-386 17,-396" stroke="${P.white}" stroke-width="3" fill="none"/>`);
  else if (p.mouthO) s = s.replace(mouth, `<ellipse cx="0" cy="-392" rx="7" ry="9" fill="${P.ink}"/>`);
  if (p.double) s = s.split(`r="1.6" fill="${P.white}" opacity=".8"`).join(`r="3" fill="${P.cyan}" opacity="1"`);
  return s;
}

// Тёма + жуткая улыбка
function tema2(p = {}) {
  let s = tema(p);
  if (p.creepy) s = s.replace(/<path d="M-6,-234 Q0,-230 6,-234"[^>]*\/>/, `<path d="M-14,-238 Q0,-222 14,-238" stroke="${P.pjB}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`);
  return s;
}

// СОСЕД со спины: лицо и телефон спереди, видно только свечение по краям
function neighborBack(v = 0, p = {}) {
  const q = Object.assign({ glow: 1, walk: 0 }, p);
  const H = [410, 370, 440, 380, 330][v % 5], sh = H - 160, hy = H - 205, hr = [34, 31, 36, 32, 30][v % 5];
  const lh = H * 0.47;
  let s = `<ellipse cx="0" cy="${-sh + 70}" rx="135" ry="160" fill="url(#gCyan)" opacity="${0.7 * q.glow}"/>`;
  s += `<g transform="rotate(${q.walk} -21 ${-lh})"><rect x="-36" y="${-lh}" width="30" height="${lh}" rx="12" fill="${P.body}"/></g>`;
  s += `<g transform="rotate(${-q.walk} 21 ${-lh})"><rect x="6" y="${-lh}" width="30" height="${lh}" rx="12" fill="${P.body}"/></g>`;
  s += `<path d="M-56,${-sh} Q0,${-sh - 12} 56,${-sh} L48,${-H * 0.45} L-48,${-H * 0.45} Z" fill="${P.body}"/>`;
  s += `<rect x="-64" y="${-sh + 4}" width="22" height="96" rx="11" fill="#1a2138"/><rect x="42" y="${-sh + 4}" width="22" height="96" rx="11" fill="#1a2138"/>`;
  s += `<path d="M-56,${-sh} Q0,${-sh - 12} 56,${-sh}" stroke="${P.cyanDim}" stroke-width="3" fill="none" opacity="${0.8 * q.glow}"/>`;
  s += `<rect x="-10" y="${-hy - 6}" width="20" height="20" fill="${P.body}"/>`;
  s += `<ellipse cx="0" cy="${-hy - hr}" rx="${hr}" ry="${hr * 1.15}" fill="${P.sil}" stroke="${P.cyanDim}" stroke-width="2.5" stroke-opacity="${0.7 * q.glow}"/>`;
  const ey = -hy - hr - 2, top = -hy - hr * 2.15;
  s += [
    `<path d="M${-hr + 2},${ey + 8} Q0,${ey + 24} ${hr - 2},${ey + 8}" stroke="#3a4256" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M${-hr - 6},${ey} h8 M${hr - 2},${ey} h8" stroke="#6aa9c2" stroke-width="2.5"/>`,
    `<ellipse cx="0" cy="${-hy - hr}" rx="${hr + 2}" ry="${hr * 1.15 + 2}" fill="${P.sil}"/><circle cx="0" cy="${top - 14}" r="16" fill="${P.sil}"/>`,
    `<path d="M-38,${ey - 12} Q0,${top - 18} 38,${ey - 12}Z" fill="${P.sil}"/><rect x="-14" y="${ey - 8}" width="28" height="9" rx="3" fill="#1d2540"/>`,
    `<path d="M-34,${ey + 40} Q-44,${top - 8} 0,${top - 2} Q44,${top - 8} 34,${ey + 40}Z" fill="${P.sil}"/><circle cx="-14" cy="${top + 6}" r="9" fill="#2a2f45"/><circle cx="6" cy="${top + 2}" r="9" fill="#2a2f45"/><circle cx="24" cy="${top + 10}" r="9" fill="#2a2f45"/>`,
    `<path d="M-42,${ey + 48} Q-48,${top - 16} 0,${top - 12} Q48,${top - 16} 42,${ey + 48}Z" fill="#141a2e"/>`
  ][v % 5];
  return `<g class="nb">${s}</g>`;
}

// КОМНАТА Марка: большое окно в глубине, вид от двери
const WIN = { x: 150, y: 470, w: 780, h: 820 };
function bgRoom(p = {}) {
  const q = Object.assign({ lamp: 1, reflect: '', flash: 0, curtain: 0, door: false }, p);
  const { x: wx, y: wy, w: ww, h: wh } = WIN;
  let s = `<rect width="1080" height="1920" fill="url(#gWall)"/>`;
  for (let x = 0; x < 1080; x += 90) s += `<rect x="${x}" y="0" width="2" height="1400" fill="#fff" opacity=".025"/>`;
  // улица за окном
  s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="url(#gSkyHouse)"/>`;
  let seed = 5; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 30; i++) s += `<circle cx="${wx + rnd() * ww}" cy="${wy + rnd() * 380}" r="${rnd() * 1.5 + 0.4}" fill="#cfd6ff" opacity="${rnd() * 0.45}"/>`;
  s += `<path d="M${wx},${wy + 600} L${wx + 130},${wy + 500} L${wx + 260},${wy + 600} L${wx + 260},${wy + wh} L${wx},${wy + wh}Z" fill="#0a0c14"/>
    <path d="M${wx + 300},${wy + 640} L${wx + 440},${wy + 540} L${wx + 580},${wy + 640} L${wx + 580},${wy + wh} L${wx + 300},${wy + wh}Z" fill="#0b0e17"/>
    <rect x="${wx + 60}" y="${wy + 660}" width="40" height="44" fill="${P.amber}" opacity=".45"/><rect x="${wx + 420}" y="${wy + 690}" width="40" height="44" fill="${P.cyan}" opacity=".35"/>
    <rect x="${wx}" y="${wy + 760}" width="${ww}" height="${wh - 760}" fill="#07080e"/>`;
  s += `<rect x="${wx + 660}" y="${wy + 260}" width="10" height="560" fill="#05060b"/><rect x="${wx + 630}" y="${wy + 254}" width="44" height="14" rx="4" fill="${q.lamp > 0.3 ? '#ffd9a0' : '#3a2f22'}"/>
    <circle cx="${wx + 652}" cy="${wy + 270}" r="140" fill="url(#gAmber)" opacity="${q.lamp}"/>`;
  if (q.flash) s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#fff4d8" opacity="${q.flash}"/>`;
  // отражение в стекле
  s += `<clipPath id="glassClip"><rect x="${wx}" y="${wy}" width="${ww}" height="${wh}"/></clipPath><g clip-path="url(#glassClip)">${q.reflect}
    <polygon points="${wx + 80},${wy} ${wx + 260},${wy} ${wx + 40},${wy + wh} ${wx - 140},${wy + wh}" fill="url(#gSheen)"/>
    <polygon points="${wx + 480},${wy} ${wx + 560},${wy} ${wx + 360},${wy + wh} ${wx + 280},${wy + wh}" fill="url(#gSheen)"/></g>`;
  // рама
  const fr = '#2a3150';
  s += `<rect x="${wx - 18}" y="${wy - 18}" width="${ww + 36}" height="18" fill="${fr}"/><rect x="${wx - 18}" y="${wy + wh}" width="${ww + 36}" height="26" fill="${fr}"/>
    <rect x="${wx - 18}" y="${wy - 18}" width="18" height="${wh + 44}" fill="${fr}"/><rect x="${wx + ww}" y="${wy - 18}" width="18" height="${wh + 44}" fill="${fr}"/>
    <rect x="${wx + ww / 2 - 8}" y="${wy}" width="16" height="${wh}" fill="${fr}"/><rect x="${wx}" y="${wy + 300}" width="${ww}" height="14" fill="${fr}"/>
    <rect x="${wx - 40}" y="${wy + wh + 20}" width="${ww + 80}" height="22" rx="4" fill="#323a5a"/>`;
  // шторы
  s += `<path d="M${wx - 70},${wy - 70} Q${wx - 40 + q.curtain * 20},${wy + 400} ${wx - 60 + q.curtain * 30},${wy + wh + 120} L${wx + 30},${wy + wh + 120} Q${wx + 40},${wy + 400} ${wx + 20},${wy - 70}Z" fill="#33284a"/>
    <path d="M${wx + ww + 70},${wy - 70} Q${wx + ww + 40 - q.curtain * 20},${wy + 400} ${wx + ww + 60 - q.curtain * 30},${wy + wh + 120} L${wx + ww - 30},${wy + wh + 120} Q${wx + ww - 40},${wy + 400} ${wx + ww - 20},${wy - 70}Z" fill="#33284a"/>
    <rect x="${wx - 110}" y="${wy - 92}" width="${ww + 220}" height="16" rx="8" fill="#3a3350"/>`;
  // батарея, пол
  s += `<rect x="${wx + 200}" y="${wy + wh + 60}" width="${ww - 400}" height="70" rx="8" fill="#1a2034"/>`;
  for (let x = wx + 214; x < wx + ww - 210; x += 26) s += `<rect x="${x}" y="${wy + wh + 66}" width="12" height="58" rx="5" fill="#222a42"/>`;
  s += `<rect y="1420" width="1080" height="500" fill="#0e1320"/>`;
  for (let y = 1450; y < 1920; y += 60) s += `<rect y="${y}" width="1080" height="3" fill="#000" opacity=".35"/>`;
  // дверной проём слева (вид «от двери»)
  if (q.door) s += `<rect x="0" y="0" width="120" height="1920" fill="#06080d"/><rect x="104" y="0" width="22" height="1920" fill="#232a40"/>`;
  return s;
}

// отражение: фигуры повёрнуты к нам, полупрозрачные, голубоватые
function reflection(inner, op = 0.5) {
  return `<g opacity="${op}">${inner}</g><rect x="${WIN.x}" y="${WIN.y}" width="${WIN.w}" height="${WIN.h}" fill="${P.cyanDim}" opacity="${op * 0.25}"/>`;
}

// АВТОБУС №7, вид сбоку, едет влево. Колёса стоят на (0,0)…(1100,0)
function bus(p = {}) {
  const q = Object.assign({ door: 0, lights: 1, driver: '', inner: 1, tail: 1, sign: '7 · САДОВАЯ, 7' }, p);
  const L = 1100, H = 400;
  let s = '';
  if (q.lights) s += `<polygon points="8,-100 -900,-300 -900,90" fill="url(#gBeamL)" opacity="${0.75 * q.lights}"/>`;
  s += `<ellipse cx="${L / 2}" cy="6" rx="${L / 2 + 40}" ry="22" fill="#000" opacity=".55"/>`;
  s += `<path d="M44,-${H} L${L - 22},-${H} Q${L},-${H} ${L},-${H - 22} L${L},-46 L0,-46 L0,-${H - 70} Q0,-${H} 44,-${H}Z" fill="#5d6574"/>`;
  s += `<rect x="0" y="-122" width="${L}" height="76" fill="#3e4452"/><rect x="0" y="-156" width="${L}" height="14" fill="${P.amber}" opacity=".8"/>`;
  // окна салона
  [[170, 300], [312, 452], [632, 762], [774, 904], [916, 1068]].forEach(([a, b]) => {
    s += `<rect x="${a}" y="-352" width="${b - a}" height="150" rx="10" fill="#0d1a26"/><rect x="${a}" y="-352" width="${b - a}" height="150" rx="10" fill="url(#gBusIn)" opacity="${0.55 * q.inner}"/>`;
  });
  // лобовое стекло + водитель
  s += `<clipPath id="busWin"><path d="M14,-360 L150,-360 L150,-176 L8,-176Z"/></clipPath><path d="M14,-360 L150,-360 L150,-176 L8,-176Z" fill="#0d1a26"/>
    <g clip-path="url(#busWin)"><rect x="0" y="-360" width="160" height="190" fill="url(#gBusIn)" opacity="${0.5 * q.inner}"/>${q.driver}</g>
    <polygon points="30,-360 70,-360 30,-176 -10,-176" fill="#fff" opacity=".06"/>`;
  // табло маршрута
  s += `<rect x="36" y="-394" width="330" height="34" rx="4" fill="#0a0a0a"/><text x="201" y="-368" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="24" fill="${P.amber}">${q.sign}</text>`;
  // двери
  const d = q.door;
  s += `<rect x="470" y="-352" width="140" height="306" fill="#0a1018"/><rect x="470" y="-352" width="140" height="306" fill="url(#gBusIn)" opacity="${0.9 * d}"/>`;
  s += `<rect x="474" y="-112" width="132" height="22" fill="#2a3040" opacity="${d}"/><rect x="474" y="-80" width="132" height="22" fill="#232838" opacity="${d}"/>`;
  [[470 - 64 * d, 1], [540 + 64 * d, 1]].forEach(([x]) => s += `<rect x="${x}" y="-350" width="70" height="302" fill="#4b5262" stroke="#2c313c" stroke-width="4"/><rect x="${x + 10}" y="-336" width="50" height="190" rx="6" fill="#0d1a26"/><rect x="${x + 10}" y="-336" width="50" height="190" rx="6" fill="url(#gBusIn)" opacity="${0.4 * q.inner}"/>`);
  // номер на борту
  s += `<circle cx="1010" cy="-262" r="34" fill="${P.amber}"/><text x="1010" y="-248" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="40" fill="#141820">7</text>`;
  // колёса
  [230, 880].forEach(x => s += `<path d="M${x - 78},-46 A78,78 0 0 1 ${x + 78},-46Z" fill="#2a2f3a"/><circle cx="${x}" cy="-38" r="58" fill="#0a0b10"/><circle cx="${x}" cy="-38" r="24" fill="#2a2f3a"/>`);
  // фары / стоп-огни
  s += `<rect x="-4" y="-116" width="18" height="30" rx="5" fill="${q.lights ? '#fff4d8' : '#4a4a40'}"/>${q.lights ? `<circle cx="6" cy="-100" r="90" fill="url(#gAmber)" opacity="${q.lights}"/>` : ''}`;
  s += `<rect x="${L - 12}" y="-120" width="16" height="40" rx="5" fill="${P.red}" opacity="${0.4 + 0.6 * q.tail}"/><circle cx="${L}" cy="-100" r="80" fill="url(#gRed)" opacity="${q.tail}"/>`;
  return s;
}

// УЛИЦА: вид с крыльца Марка — забор, калитка, дорога, дома напротив. Автобус стоит у калитки.
const BUS_AT = { x: 70, y: 1440, s: 0.85 };   // двери автобуса ≈ x 529 при busX = 0
function bgStreet(p = {}) {
  const q = Object.assign({ lamp: 1, bus: '', busX: 0, flash: 0, walkers: '' }, p);
  let s = `<rect width="1080" height="1920" fill="url(#gSkyHouse)"/>`;
  let seed = 11; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 50; i++) s += `<circle cx="${rnd() * 1080}" cy="${rnd() * 700}" r="${rnd() * 1.6 + 0.4}" fill="#cfd6ff" opacity="${rnd() * 0.5}"/>`;
  // дома напротив
  s += `<path d="M-20,1150 L-20,860 L120,760 L260,860 L260,1150Z M300,1150 L300,900 L430,800 L560,900 L560,1150Z M620,1150 L620,870 L780,760 L940,870 L940,1150Z M960,1150 L960,900 L1100,820 L1100,1150Z" fill="#0a0c15"/>`;
  [[60, 950, P.amber], [180, 1000, null], [380, 980, null], [470, 1010, P.amber], [690, 960, P.cyan], [840, 1000, null]].forEach(([x, y, c]) =>
    s += `<rect x="${x}" y="${y}" width="44" height="50" fill="${c || '#141a2a'}" opacity="${c ? 0.45 : 1}"/>`);
  s += `<path d="M260,1150 Q300,980 280,900 Q330,950 340,880 Q380,980 380,1150Z" fill="#06080f"/>`;
  // дорога
  s += `<rect y="1150" width="1080" height="340" fill="#10131c"/><rect y="1150" width="1080" height="8" fill="#232838"/>`;
  for (let x = -40; x < 1080; x += 160) s += `<rect x="${x}" y="1300" width="90" height="8" fill="#c9c2a8" opacity=".18"/>`;
  // фонарь
  s += `<rect x="930" y="560" width="14" height="930" fill="#05060b"/><path d="M937,566 q-50,-40 -100,0" stroke="#05060b" stroke-width="12" fill="none"/>
    <rect x="810" y="560" width="52" height="18" rx="5" fill="${q.lamp > 0.3 ? '#ffd9a0' : '#3a2f22'}"/><circle cx="836" cy="576" r="150" fill="url(#gAmber)" opacity="${q.lamp}"/>
    <ellipse cx="836" cy="1420" rx="260" ry="50" fill="${P.amber}" opacity="${0.12 * q.lamp}"/>`;
  // автобус
  if (q.bus) s += `<g transform="translate(${BUS_AT.x + q.busX} ${BUS_AT.y}) scale(${BUS_AT.s})">${q.bus}</g>`;
  // двор
  s += `<rect y="1490" width="1080" height="430" fill="#0b0d14"/>`;
  s += `<polygon points="380,1920 700,1920 640,1650 440,1650" fill="#1a1e2a"/>`;
  s += q.walkers;
  // забор с открытой калиткой
  for (let x = -10; x < 1080; x += 52) { if (x > 410 && x < 650) continue; s += `<rect x="${x}" y="1520" width="30" height="170" fill="#121624"/><polygon points="${x},1520 ${x + 15},1495 ${x + 30},1520" fill="#121624"/>`; }
  s += `<rect x="0" y="1560" width="420" height="14" fill="#121624"/><rect x="650" y="1560" width="430" height="14" fill="#121624"/><rect x="0" y="1640" width="420" height="14" fill="#121624"/><rect x="650" y="1640" width="430" height="14" fill="#121624"/>`;
  s += `<polygon points="650,1500 760,1560 760,1730 650,1690" fill="#161b2b"/>`;
  // крыльцо (мы стоим на нём)
  s += `<rect y="1850" width="1080" height="70" fill="#232838"/><rect y="1850" width="1080" height="8" fill="#2c3246"/>`;
  if (q.flash) s += `<rect width="1080" height="1920" fill="#fff4d8" opacity="${q.flash}"/>`;
  return s;
}

if (typeof module !== 'undefined') module.exports = { defs2, phoneScreen2, mark2, tema2, neighborBack, bgRoom, reflection, bus, bgStreet, WIN, BUS_AT };

// ДЕСЯТЫЙ ЭТАЖ — графика сериала (плоский 2D). Требует episode01/art/art.js (P, limb, eyes, hand, defs).
const L = {
  wallTop: '#262b31', wallTop2: '#2e343b', green: '#1d3b34', greenDk: '#163029', greenLine: '#2c5a4c',
  floorA: '#242428', floorB: '#1d1d21', metal: '#6b717b', metalDk: '#4b5058', metalLt: '#8d939c', frame: '#3a3f47',
  bulb: '#f2cf6b', cab: '#5a4632', cabDk: '#45351f', cabLt: '#6e5840', mirror: '#2a3a44',
  hood: '#5b4a7a', hoodDk: '#45385e', hair: '#2a1c16', jeans: '#1b2232', shoe: '#d8dbe2', door: '#4a2e24', doorDk: '#3a2219',
  ten: '#e2463f'
};
function defsLift() {
  return `<defs>
  <radialGradient id="gBulb"><stop offset="0" stop-color="${L.bulb}" stop-opacity=".6"/><stop offset="1" stop-color="${L.bulb}" stop-opacity="0"/></radialGradient>
  <radialGradient id="gTen"><stop offset="0" stop-color="${L.ten}" stop-opacity=".8"/><stop offset="1" stop-color="${L.ten}" stop-opacity="0"/></radialGradient>
  <linearGradient id="gWet" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9fd0e6" stop-opacity="0"/><stop offset=".5" stop-color="#9fd0e6" stop-opacity=".35"/><stop offset="1" stop-color="#9fd0e6" stop-opacity="0"/></linearGradient>
  <linearGradient id="gCabLight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".45"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></linearGradient>
  <linearGradient id="gSkyN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070e"/><stop offset="1" stop-color="#1a1f33"/></linearGradient>
  </defs>`;
}

// ───────── ЛИЗА, 15: худи, длинные тёмные волосы, телефон
function liza(p = {}) {
  const q = Object.assign({ armL: [8, -4], armR: [-8, 4], legL: 0, legR: 0, head: 0, eyes: 'open', look: 0, mouth: 'line',
    phone: false, glow: 0, back: false, brow: 0, bag: true }, p);
  const shoe = (x, y) => `<rect x="${x - 18}" y="${y - 6}" width="38" height="16" rx="7" fill="${L.shoe}"/>`;
  let s = '';
  // волосы сзади (длинные)
  if (!q.back) s += `<g transform="rotate(${q.head} 0 -340)"><path d="M-40,-392 Q-48,-330 -40,-292 L40,-292 Q48,-330 40,-392Z" fill="${L.hair}"/></g>`;
  if (q.bag && !q.back) s += `<rect x="-52" y="-318" width="104" height="120" rx="20" fill="#2b2f3a"/>`;
  s += limb(-16, -176, 86, 82, q.legL, 0, 28, L.jeans, shoe);
  s += limb(16, -176, 86, 82, q.legR, 0, 28, '#161c2a', shoe);
  s += `<path d="M-48,-316 Q0,-328 48,-316 L48,-168 Q0,-160 -48,-168 Z" fill="${L.hood}"/>`;
  if (!q.back) {
    s += `<path d="M-30,-322 Q0,-300 30,-322 Q20,-306 0,-304 Q-20,-306 -30,-322Z" fill="${L.hoodDk}"/>
      <line x1="-8" y1="-306" x2="-10" y2="-270" stroke="#d8d2e6" stroke-width="3"/><line x1="8" y1="-306" x2="10" y2="-270" stroke="#d8d2e6" stroke-width="3"/>
      <rect x="-32" y="-224" width="64" height="40" rx="10" fill="${L.hoodDk}"/>`;
  } else {
    s += `<path d="M-34,-322 Q0,-290 34,-322 Q30,-280 0,-276 Q-30,-280 -34,-322Z" fill="${L.hoodDk}"/>`;
    if (q.bag) s += `<rect x="-44" y="-300" width="88" height="112" rx="18" fill="#2b2f3a"/><rect x="-36" y="-260" width="72" height="30" rx="8" fill="#363b48"/>`;
  }
  const endR = q.phone ? (x, y) => phoneInHand(x, y, q.glow) : hand(P.skin);
  s += limb(-50, -308, 74, 68, q.armL[0], q.armL[1], 23, L.hood, hand(P.skin));
  s += limb(50, -308, 74, 68, q.armR[0], q.armR[1], 23, L.hoodDk, endR);
  s += `<rect x="-9" y="-344" width="18" height="26" fill="${P.skinSh}"/>`;
  s += `<g transform="rotate(${q.head} 0 -340)">`;
  if (q.back) {
    s += `<ellipse cx="0" cy="-374" rx="35" ry="41" fill="${L.hair}"/><path d="M-36,-380 Q-44,-320 -38,-286 L38,-286 Q44,-320 36,-380Z" fill="${L.hair}"/>`;
  } else {
    s += `<ellipse cx="0" cy="-372" rx="31" ry="38" fill="${P.skin}"/>
      <path d="M-35,-372 Q-40,-418 0,-416 Q40,-418 35,-372 Q30,-396 12,-398 Q-6,-388 -20,-396 Q-30,-392 -35,-372Z" fill="${L.hair}"/>
      ${eyes(-12, 12, -368, q.eyes, q.look, 5)}
      <path d="M-19,${-382 + q.brow} L-6,-380 M19,${-382 + q.brow} L6,-380" stroke="${L.hair}" stroke-width="3" stroke-linecap="round"/>
      ${q.mouth === 'o' ? `<ellipse cx="0" cy="-347" rx="5" ry="6" fill="${P.pjB}"/>` : `<path d="M-6,-348 L6,-348" stroke="${P.skinSh}" stroke-width="3" stroke-linecap="round"/>`}`;
    if (q.glow) s += `<ellipse cx="0" cy="-360" rx="46" ry="52" fill="url(#gCyan)" opacity="${q.glow * 0.8}"/>`;
  }
  s += `</g>`;
  return `<g class="liza">${s}</g>`;
}

// ───────── ДОМ снаружи: панельная девятиэтажка
function bgBuilding(p = {}) {
  const q = Object.assign({ ghost: 0, lamp: 1 }, p);
  let s = `<rect width="1080" height="1920" fill="url(#gSkyN)"/>`;
  let seed = 9; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 70; i++) s += `<circle cx="${rnd() * 1080}" cy="${rnd() * 900}" r="${rnd() * 1.6 + 0.4}" fill="#cfd6ff" opacity="${rnd() * 0.5}"/>`;
  const x0 = 150, w = 780, fh = 120, top = 1640 - 9 * fh;
  // призрачный 10-й этаж
  if (q.ghost > 0) {
    s += `<g opacity="${q.ghost}"><rect x="${x0}" y="${top - fh}" width="${w}" height="${fh}" fill="#141a24" opacity=".7"/>`;
    for (let c = 0; c < 6; c++) s += `<rect x="${x0 + 40 + c * 125}" y="${top - fh + 30}" width="70" height="60" fill="${c === 3 ? L.ten : '#2a3240'}" opacity="${c === 3 ? 0.9 : 0.6}"/>`;
    s += `<circle cx="${x0 + 40 + 3 * 125 + 35}" cy="${top - fh + 60}" r="90" fill="url(#gTen)"/></g>`;
  }
  s += `<rect x="${x0}" y="${top}" width="${w}" height="${9 * fh}" fill="#20262f"/><rect x="${x0 - 10}" y="${top - 14}" width="${w + 20}" height="14" fill="#151a21"/>`;
  for (let r = 0; r < 9; r++) {
    s += `<rect x="${x0}" y="${top + r * fh}" width="${w}" height="3" fill="#000" opacity=".35"/>`;
    for (let c = 0; c < 6; c++) {
      const lit = rnd() > 0.84, col = lit ? (rnd() > 0.5 ? P.amber : P.cyan) : '#11151c';
      s += `<rect x="${x0 + 40 + c * 125}" y="${top + r * fh + 30}" width="70" height="60" fill="${col}" opacity="${lit ? 0.55 : 1}"/>`;
    }
  }
  // подъезд
  s += `<rect x="470" y="1520" width="140" height="120" fill="#0c0f14"/><rect x="455" y="1500" width="170" height="16" fill="#151a21"/>
    <rect x="525" y="1470" width="30" height="16" rx="4" fill="${q.lamp > 0.3 ? '#ffd9a0' : '#3a2f22'}"/><circle cx="540" cy="1480" r="120" fill="url(#gBulb)" opacity="${q.lamp}"/>`;
  s += `<rect y="1640" width="1080" height="280" fill="#0b0d12"/><path d="M0,1700 Q200,1660 380,1690" stroke="#14171f" stroke-width="30" fill="none"/>`;
  s += `<path d="M0,1640 L0,1400 Q60,1300 40,1200 Q110,1260 120,1160 Q170,1300 150,1640Z" fill="#06080c"/><path d="M1080,1640 L1080,1380 Q1020,1300 1040,1220 Q960,1260 950,1180 Q900,1320 930,1640Z" fill="#06080c"/>`;
  return s;
}

// ───────── КАБИНА лифта (видна через открытые двери): рисуется в проёме x 340..740, y 760..1500
function cabin(p = {}) {
  const q = Object.assign({ wet: 1, light: 1, prints: 0, dirt: 1 }, p);
  const X0 = 340, X1 = 740, Y0 = 760, Y1 = 1500, bx0 = 410, bx1 = 670, by0 = 810, by1 = 1400;
  let s = `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="${L.cabDk}"/>`;
  s += `<polygon points="${X0},${Y0} ${bx0},${by0} ${bx0},${by1} ${X0},${Y1}" fill="${L.cab}"/><polygon points="${X1},${Y0} ${bx1},${by0} ${bx1},${by1} ${X1},${Y1}" fill="${L.cabLt}"/>`;
  s += `<rect x="${bx0}" y="${by0}" width="${bx1 - bx0}" height="${by1 - by0}" fill="${L.cab}"/>`;
  // зеркало на задней стене
  s += `<rect x="${bx0 + 40}" y="${by0 + 80}" width="${bx1 - bx0 - 80}" height="330" rx="6" fill="${L.mirror}"/><polygon points="${bx0 + 60},${by0 + 80} ${bx0 + 110},${by0 + 80} ${bx0 + 60},${by0 + 410}" fill="#fff" opacity=".07"/>`;
  // потолок со светом
  s += `<polygon points="${X0},${Y0} ${X1},${Y0} ${bx1},${by0} ${bx0},${by0}" fill="#1b1610"/><rect x="${bx0 + 60}" y="${by0 - 14}" width="${bx1 - bx0 - 120}" height="10" fill="#ffe9b0" opacity="${0.4 + 0.6 * q.light}"/>`;
  s += `<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="url(#gCabLight)" opacity="${q.light}"/>`;
  // пол
  s += `<polygon points="${bx0},${by1} ${bx1},${by1} ${X1},${Y1} ${X0},${Y1}" fill="#2a241c"/>`;
  if (q.wet) s += `<ellipse cx="540" cy="${by1 + 60}" rx="150" ry="30" fill="url(#gWet)" opacity="${q.wet}"/><ellipse cx="470" cy="${by1 + 80}" rx="60" ry="10" fill="#9fd0e6" opacity="${0.18 * q.wet}"/>`;
  if (q.dirt) { let seed = 3; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280; for (let i = 0; i < 26; i++) s += `<circle cx="${bx0 + rnd() * (bx1 - bx0)}" cy="${by1 + 10 + rnd() * 85}" r="${2 + rnd() * 4}" fill="#3b2a18" opacity="${0.8 * q.dirt}"/>`; }
  if (q.prints) for (let i = 0; i < 4; i++) s += `<ellipse cx="${520 + (i % 2) * 40}" cy="${by1 + 20 + i * 20}" rx="12" ry="7" fill="#9fd0e6" opacity="${0.25 * clampA(q.prints * 4 - i)}"/>`;
  // панель сбоку
  s += `<polygon points="${X1 - 24},${by0 + 200} ${X1 - 6},${by0 + 180} ${X1 - 6},${by0 + 470} ${X1 - 24},${by0 + 440}" fill="${L.metalDk}"/>`;
  return s;
}
const clampA = v => Math.max(0, Math.min(1, v));

// ───────── ПОДЪЕЗД: двери лифта по центру, табло, кнопка вызова, лампочка
function bgLobby(p = {}) {
  const q = Object.assign({ bulb: 1, ind: '1', indOn: 1, arrow: '', doors: 0, call: 0, cabin: '', floor: '1', mail: true, flats: false }, p);
  let s = `<rect width="1080" height="1920" fill="${L.wallTop}"/>`;
  for (let i = 0; i < 18; i++) s += `<rect x="${(i * 67) % 1080}" y="${(i * 137) % 760}" width="${30 + (i * 13) % 50}" height="${8 + (i * 7) % 14}" fill="#000" opacity=".12"/>`;
  s += `<rect y="900" width="1080" height="600" fill="${L.green}"/><rect y="896" width="1080" height="10" fill="${L.greenLine}"/>`;
  s += `<text x="120" y="1400" font-family="Inter Display" font-weight="800" font-size="40" fill="#cfe0d8" opacity=".14" transform="rotate(-6 120 1400)">НЕ ВХОДИ</text>`;
  s += `<text x="905" y="980" font-family="Inter Display" font-weight="900" font-size="80" fill="#cfe0d8" opacity=".35">${q.floor}</text>`;
  // почтовые ящики / двери квартир
  if (q.mail) {
    s += `<rect x="50" y="960" width="250" height="250" fill="#2e3a3a"/>`;
    for (let i = 0; i < 12; i++) s += `<rect x="${60 + (i % 4) * 60}" y="${972 + Math.floor(i / 4) * 78}" width="50" height="66" fill="#3a4848"/><rect x="${66 + (i % 4) * 60}" y="${988 + Math.floor(i / 4) * 78}" width="38" height="6" fill="#1f2828"/>`;
  }
  if (q.flats) {
    [[20, '35'], [880, '36']].forEach(([x, n]) => s += `<rect x="${x}" y="700" width="180" height="800" fill="${L.door}"/>${Array.from({ length: 24 }, (_, i) => `<circle cx="${x + 25 + (i % 4) * 43}" cy="${740 + Math.floor(i / 4) * 125}" r="5" fill="${L.doorDk}"/>`).join('')}
      <rect x="${x + 70}" y="760" width="40" height="30" rx="4" fill="#c9b27a"/><text x="${x + 90}" y="784" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="22" fill="#2a2012">${n}</text><circle cx="${x + 150}" cy="1110" r="10" fill="#c9b27a"/>`);
  }
  // проём и кабина
  const dX0 = 340, dX1 = 740, dY0 = 760, dY1 = 1500, d = q.doors;
  s += `<rect x="${dX0 - 30}" y="${dY0 - 30}" width="${dX1 - dX0 + 60}" height="${dY1 - dY0 + 30}" fill="${L.frame}"/>`;
  s += `<clipPath id="doorClip"><rect x="${dX0}" y="${dY0}" width="${dX1 - dX0}" height="${dY1 - dY0}"/></clipPath><g clip-path="url(#doorClip)">`;
  s += d > 0 ? (q.cabin || cabin({})) : '';
  const lw = (dX1 - dX0) / 2;
  s += `<rect x="${dX0 - lw * d}" y="${dY0}" width="${lw}" height="${dY1 - dY0}" fill="${L.metal}"/><rect x="${dX0 + lw + lw * d}" y="${dY0}" width="${lw}" height="${dY1 - dY0}" fill="${L.metalLt}"/>
    <rect x="${dX0 + lw - 2 - lw * d}" y="${dY0}" width="4" height="${dY1 - dY0}" fill="${L.metalDk}"/></g>`;
  // табло
  s += `<rect x="470" y="640" width="140" height="84" rx="8" fill="#08090c" stroke="#2a2d33" stroke-width="4"/>`;
  if (q.indOn) s += `<text x="${q.arrow ? 560 : 540}" y="704" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="60" fill="${L.ten}" opacity="${q.indOn}">${q.ind}</text>${q.arrow ? `<text x="496" y="700" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="36" fill="${L.ten}">${q.arrow}</text>` : ''}
    <circle cx="540" cy="682" r="90" fill="url(#gTen)" opacity="${0.35 * q.indOn}"/>`;
  // кнопка вызова
  s += `<rect x="790" y="1080" width="70" height="120" rx="10" fill="${L.metalDk}"/><circle cx="825" cy="1140" r="22" fill="${q.call ? P.amber : '#2a2d33'}"/>${q.call ? `<circle cx="825" cy="1140" r="70" fill="url(#gAmber)" opacity="${q.call}"/>` : ''}`;
  // пол
  s += `<rect y="1500" width="1080" height="420" fill="${L.floorA}"/>`;
  for (let y = 1500, r = 0; y < 1920; y += 70, r++) for (let x = (r % 2) * 70; x < 1080; x += 140) s += `<rect x="${x}" y="${y}" width="70" height="70" fill="${L.floorB}"/>`;
  s += `<rect y="1500" width="1080" height="8" fill="#000" opacity=".4"/>`;
  // лампочка
  s += `<line x1="540" y1="0" x2="540" y2="210" stroke="#0b0c10" stroke-width="4"/><rect x="528" y="200" width="24" height="22" fill="#2a2d33"/>
    <circle cx="540" cy="244" r="26" fill="${q.bulb > 0.3 ? '#fff0c0' : '#4a4334'}"/><circle cx="540" cy="244" r="520" fill="url(#gBulb)" opacity="${q.bulb}"/>`;
  s += `<rect width="1080" height="1920" fill="#000" opacity="${0.45 * (1 - q.bulb)}"/>`;
  return s;
}

// ───────── ПАНЕЛЬ кнопок крупно
function panelClose(p = {}) {
  const q = Object.assign({ lit: 0, ten: 0, tenLit: 0, press: 0, light: 1 }, p);
  let s = `<rect width="1080" height="1920" fill="${L.cab}"/>`;
  for (let x = 0; x < 1080; x += 46) s += `<rect x="${x}" y="0" width="2" height="1920" fill="#000" opacity=".12"/>`;
  s += `<rect x="330" y="180" width="420" height="1560" rx="18" fill="${L.metalDk}"/><rect x="342" y="192" width="396" height="1536" rx="14" fill="${L.metal}"/>`;
  for (let i = 0; i < 30; i++) s += `<rect x="342" y="${192 + i * 51}" width="396" height="1" fill="#fff" opacity=".05"/>`;
  const by = n => 1560 - (n - 1) * 135;
  for (let n = 1; n <= 9; n++) {
    const on = q.lit === n;
    s += `<text x="470" y="${by(n) + 22}" text-anchor="end" font-family="Inter Display" font-weight="900" font-size="64" fill="#1b1d22">${n}</text>
      <circle cx="590" cy="${by(n)}" r="52" fill="#2a2d33"/><circle cx="590" cy="${by(n)}" r="40" fill="${on ? P.amber : '#3e434c'}"/>${on ? `<circle cx="590" cy="${by(n)}" r="120" fill="url(#gAmber)"/>` : ''}`;
  }
  if (q.ten > 0) {
    const y = by(10);
    s += `<g opacity="${q.ten}"><text x="470" y="${y + 22}" text-anchor="end" font-family="Inter Display" font-weight="900" font-size="64" fill="${q.tenLit > 0.5 ? L.ten : '#1b1d22'}">10</text>
      <circle cx="590" cy="${y}" r="52" fill="#2a2d33"/><circle cx="590" cy="${y}" r="40" fill="${q.tenLit > 0.5 ? L.ten : '#3e434c'}"/>
      <circle cx="590" cy="${y}" r="180" fill="url(#gTen)" opacity="${q.tenLit}"/></g>`;
  }
  if (q.press) s += `<g transform="translate(${640 + 80 * (1 - q.press)} ${by(9) + 30 + 40 * (1 - q.press)}) rotate(-30)"><rect x="-26" y="0" width="52" height="300" rx="26" fill="${P.skin}"/><rect x="-60" y="200" width="120" height="400" rx="40" fill="${L.hood}"/></g>`;
  s += `<rect width="1080" height="1920" fill="#000" opacity="${0.6 * (1 - q.light)}"/>`;
  return s;
}

// ───────── ТАБЛО крупно
function indicatorClose(n, p = {}) {
  const q = Object.assign({ arrow: '▼', glow: 1 }, p);
  return `<rect width="1080" height="1920" fill="${L.wallTop}"/><rect x="190" y="640" width="700" height="440" rx="30" fill="#08090c" stroke="#2a2d33" stroke-width="14"/>
    <circle cx="540" cy="860" r="520" fill="url(#gTen)" opacity="${0.3 * q.glow}"/>
    <text x="300" y="930" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="150" fill="${L.ten}" opacity=".9">${q.arrow}</text>
    <text x="620" y="990" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="330" fill="${L.ten}">${n}</text>`;
}
if (typeof module !== 'undefined') module.exports = { L, liza, bgBuilding, bgLobby, cabin, panelClose, indicatorClose, defsLift };

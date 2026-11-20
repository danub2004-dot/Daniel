// СТРАННЫЙ СИГНАЛ — общая графика серии (плоский 2D, SVG-строки).
// Каждая функция возвращает SVG-фрагмент; персонажи стоят «ногами» в (0,0).

const P = {
  night: '#090c16', night2: '#10162a', wall: '#141a2c', wall2: '#1b2338',
  ink: '#05070d', amber: '#e8a33d', amberDim: '#7a4f1f', cyan: '#7fdcff', cyanDim: '#2a6a86',
  red: '#e2463f', skin: '#b38c78', skinSh: '#86675b', hair: '#16120f',
  jacket: '#2b4555', jacketDk: '#1d303c', jeans: '#1b2232', jeansDk: '#121827',
  shirt: '#8b9db1', white: '#e6ecf3', pjA: '#6a2e39', pjB: '#3b1b25', sil: '#0d1120', body: '#161c30'
};

const rot = (a, x, y) => `rotate(${a} ${x} ${y})`;

function defs() {
  return `<defs>
  <radialGradient id="gCyan"><stop offset="0" stop-color="${P.cyan}" stop-opacity=".55"/><stop offset="1" stop-color="${P.cyan}" stop-opacity="0"/></radialGradient>
  <radialGradient id="gAmber"><stop offset="0" stop-color="${P.amber}" stop-opacity=".55"/><stop offset="1" stop-color="${P.amber}" stop-opacity="0"/></radialGradient>
  <radialGradient id="gRed"><stop offset="0" stop-color="${P.red}" stop-opacity=".6"/><stop offset="1" stop-color="${P.red}" stop-opacity="0"/></radialGradient>
  <linearGradient id="gCone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.amber}" stop-opacity=".42"/><stop offset="1" stop-color="${P.amber}" stop-opacity="0"/></linearGradient>
  <linearGradient id="gFaceLit" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#9fe6ff"/><stop offset=".55" stop-color="#3f7f9a"/><stop offset="1" stop-color="${P.sil}"/></linearGradient>
  <linearGradient id="gBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ffd58a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd58a" stop-opacity="0"/></linearGradient>
  <linearGradient id="gSkyHwy" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0d1c"/><stop offset=".6" stop-color="#22203a"/><stop offset="1" stop-color="#3b2834"/></linearGradient>
  <linearGradient id="gSkyHouse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070912"/><stop offset="1" stop-color="#1c1d33"/></linearGradient>
  <linearGradient id="gWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.wall}"/><stop offset="1" stop-color="${P.wall2}"/></linearGradient>
  <linearGradient id="gOutside" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1528"/><stop offset="1" stop-color="#5a3a24"/></linearGradient>
  <linearGradient id="gWindowLit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1824"/><stop offset="1" stop-color="#16384a"/></linearGradient>
  </defs>`;
}

// Конечность из двух сегментов. a1 — угол от вертикали вниз, a2 — сгиб.
function limb(x, y, l1, l2, a1, a2, w, color, end) {
  return `<g transform="${rot(a1, x, y)}">
    <rect x="${x - w / 2}" y="${y - w / 2}" width="${w}" height="${l1 + w / 2}" rx="${w / 2}" fill="${color}"/>
    <g transform="${rot(a2, x, y + l1)}">
      <rect x="${x - w * 0.46}" y="${y + l1 - w / 2}" width="${w * 0.92}" height="${l2 + w / 2}" rx="${w * 0.46}" fill="${color}"/>
      ${end ? end(x, y + l1 + l2) : ''}
    </g></g>`;
}

function eyes(x1, x2, y, kind, look = 0, r = 5) {
  if (kind === 'closed') return `<path d="M${x1 - r},${y} q${r},${r * 0.8} ${2 * r},0 M${x2 - r},${y} q${r},${r * 0.8} ${2 * r},0" stroke="${P.ink}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  if (kind === 'wide') return [x1, x2].map(x => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.55}" ry="${r * 1.6}" fill="${P.white}"/><circle cx="${x + look}" cy="${y}" r="${r * 0.75}" fill="${P.ink}"/>`).join('');
  return [x1, x2].map(x => `<ellipse cx="${x + look}" cy="${y}" rx="${r}" ry="${r * 1.2}" fill="${P.ink}"/><circle cx="${x + look + r * 0.35}" cy="${y - r * 0.4}" r="${r * 0.32}" fill="${P.white}" opacity=".8"/>`).join('');
}

function phoneInHand(x, y, glow = 1, skin = P.skin) {
  return `<g>${glow ? `<circle cx="${x}" cy="${y + 6}" r="70" fill="url(#gCyan)" opacity="${glow}"/>` : ''}
    <rect x="${x - 13}" y="${y - 6}" width="26" height="44" rx="5" fill="#0b0f18"/>
    <rect x="${x - 10}" y="${y - 2}" width="20" height="35" rx="3" fill="${P.cyan}" opacity="${0.35 + 0.65 * glow}"/>
    <circle cx="${x}" cy="${y + 4}" r="13" fill="${skin}"/></g>`;
}
const hand = (skin) => (x, y) => `<circle cx="${x}" cy="${y + 4}" r="12" fill="${skin}"/>`;

// ───────────────────────── МАРК, 28, водитель автобуса
function mark(p = {}) {
  const q = Object.assign({ armL: [10, -6], armR: [-10, 6], legL: 0, legR: 0, head: 0, eyes: 'open', look: 0,
    phone: false, glow: 0, back: false, brow: 0, buds: true }, p);
  const legEnd = (x, y) => `<rect x="${x - 21}" y="${y - 6}" width="44" height="17" rx="8" fill="${P.ink}"/>`;
  let s = '';
  s += limb(-20, -200, 98, 92, q.legL, 0, 34, P.jeans, legEnd);
  s += limb(20, -200, 98, 92, q.legR, 0, 34, P.jeansDk, legEnd);
  // торс
  s += `<path d="M-60,-352 Q0,-364 60,-352 L52,-188 L-52,-188 Z" fill="${P.jacket}"/>`;
  if (!q.back) {
    s += `<path d="M-15,-356 L0,-318 L15,-356 Z" fill="${P.shirt}"/>
      <line x1="0" y1="-318" x2="0" y2="-190" stroke="${P.jacketDk}" stroke-width="3"/>
      <rect x="-56" y="-262" width="112" height="9" fill="${P.amber}" opacity=".85"/>
      <rect x="-44" y="-240" width="22" height="26" rx="3" fill="${P.jacketDk}"/>
      <rect x="18" y="-236" width="27" height="31" rx="3" fill="${P.jacketDk}"/>
      <rect x="22" y="-248" width="19" height="16" rx="2" fill="#2a2f3a"/>
      <circle cx="36" cy="-242" r="2.6" fill="${P.red}" class="pbLed"/>`;
  } else {
    s += `<rect x="-56" y="-262" width="112" height="9" fill="${P.amber}" opacity=".85"/>
      <text x="0" y="-300" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="17" fill="${P.jacketDk}">АВТОПАРК</text>`;
  }
  // руки
  const endR = q.phone ? (x, y) => phoneInHand(x, y, q.glow) : hand(P.skin);
  s += limb(-58, -344, 82, 76, q.armL[0], q.armL[1], 27, P.jacket, hand(P.skin));
  s += limb(58, -344, 82, 76, q.armR[0], q.armR[1], 27, P.jacketDk, endR);
  // голова
  s += `<rect x="-11" y="-382" width="22" height="34" fill="${P.skinSh}"/>`;
  s += `<g transform="${rot(q.head, 0, -380)}">`;
  s += `<ellipse cx="-38" cy="-414" rx="7" ry="10" fill="${P.skinSh}"/><ellipse cx="38" cy="-414" rx="7" ry="10" fill="${P.skinSh}"/>`;
  if (q.back) {
    s += `<ellipse cx="0" cy="-420" rx="39" ry="46" fill="${P.hair}"/>
      <path d="M-30,-392 Q0,-380 30,-392 L28,-380 Q0,-372 -28,-380Z" fill="${P.skinSh}"/>`;
  } else {
    s += `<ellipse cx="0" cy="-418" rx="38" ry="45" fill="${P.skin}"/>
      <path d="M-34,-404 Q-30,-376 0,-373 Q30,-376 34,-404 Q20,-388 0,-388 Q-20,-388 -34,-404Z" fill="${P.hair}" opacity=".28"/>
      <path d="M-41,-424 Q-46,-470 -4,-470 Q36,-476 44,-436 Q42,-446 30,-450 Q34,-438 20,-446 Q4,-452 -8,-446 Q-26,-440 -41,-424Z" fill="${P.hair}"/>
      ${eyes(-14, 14, -416, q.eyes, q.look)}
      <path d="M-23,${-431 + q.brow} L-7,-428 M23,${-431 + q.brow} L7,-428" stroke="${P.hair}" stroke-width="4" stroke-linecap="round"/>
      <path d="M-8,-393 L8,-393" stroke="${P.skinSh}" stroke-width="3" stroke-linecap="round"/>
      <path d="M-2,-412 L-5,-401 L1,-401" stroke="${P.skinSh}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    if (q.glow) s += `<ellipse cx="0" cy="-400" rx="52" ry="58" fill="url(#gCyan)" opacity="${q.glow * 0.9}"/>`;
  }
  if (q.buds) s += `<circle cx="39" cy="-411" r="5.5" fill="${P.white}"/>`;
  s += `</g>`;
  if (q.buds && !q.back) s += `<path d="M40,-405 Q52,-360 44,-320 Q36,-280 32,-248" stroke="${P.white}" stroke-width="2" fill="none" opacity=".8"/>`;
  return `<g class="mark">${s}</g>`;
}

// ───────────────────────── ТЁМА, 10, младший брат
function tema(p = {}) {
  const q = Object.assign({ armL: [14, -10], armR: [-14, 8], legL: 0, legR: 0, head: 0, eyes: 'open', look: 0,
    phone: false, glow: 0, torch: true, beam: false, back: false, mouth: 'o' }, p);
  const legEnd = (x, y) => `<rect x="${x - 17}" y="${y - 5}" width="35" height="15" rx="7" fill="#c9ccd4"/><rect x="${x - 17}" y="${y + 5}" width="35" height="5" rx="2" fill="#7b7f8a"/>`;
  let s = '';
  s += `<clipPath id="pjClip"><rect x="-60" y="-210" width="120" height="210"/></clipPath>`;
  s += limb(-15, -118, 58, 54, q.legL, 0, 26, P.pjB, legEnd);
  s += limb(15, -118, 58, 54, q.legR, 0, 26, P.pjB, legEnd);
  // пижама с полосками
  s += `<path d="M-44,-206 Q0,-214 44,-206 L40,-112 L-40,-112 Z" fill="${P.pjA}"/>`;
  for (let y = -198; y < -114; y += 16) s += `<rect x="-44" y="${y}" width="88" height="5" fill="${P.pjB}" opacity=".9"/>`;
  if (!q.back) s += `<circle cx="0" cy="-185" r="3" fill="${P.pjB}"/><circle cx="0" cy="-160" r="3" fill="${P.pjB}"/><circle cx="0" cy="-135" r="3" fill="${P.pjB}"/>`;
  const torchEnd = (x, y) => `<g>${q.beam ? `<polygon points="${x},${y + 4} ${x - 260},${y + 140} ${x - 260},${y - 60}" fill="url(#gBeam)" transform="scale(1,1)"/>` : ''}
     <rect x="${x - 7}" y="${y - 4}" width="14" height="34" rx="3" fill="#3a3f4b"/><rect x="${x - 9}" y="${y + 26}" width="18" height="9" rx="2" fill="${P.amber}"/>
     <circle cx="${x}" cy="${y + 4}" r="10" fill="${P.skin}"/></g>`;
  const endL = q.torch ? torchEnd : hand(P.skin);
  const endR = q.phone ? (x, y) => phoneInHand(x, y, q.glow) : hand(P.skin);
  s += limb(-42, -200, 50, 46, q.armL[0], q.armL[1], 20, P.pjA, (x, y) => endL(x, y).replace(/r="12"/, 'r="10"'));
  s += limb(42, -200, 50, 46, q.armR[0], q.armR[1], 20, P.pjA, endR);
  // голова — крупная, детская
  s += `<rect x="-9" y="-222" width="18" height="20" fill="${P.skinSh}"/>`;
  s += `<g transform="${rot(q.head, 0, -222)}">`;
  s += `<ellipse cx="-33" cy="-252" rx="7" ry="9" fill="${P.skinSh}"/><ellipse cx="33" cy="-252" rx="7" ry="9" fill="${P.skinSh}"/>`;
  if (q.back) {
    s += `<ellipse cx="0" cy="-258" rx="34" ry="37" fill="#3a2a1e"/>`;
  } else {
    s += `<ellipse cx="0" cy="-256" rx="33" ry="35" fill="${P.skin}"/>
      <path d="M-35,-262 Q-38,-298 0,-298 Q36,-298 36,-262 Q30,-282 12,-278 Q0,-286 -10,-276 Q-24,-282 -35,-262Z" fill="#3a2a1e"/>
      <path d="M2,-296 Q-4,-318 12,-322 Q4,-310 10,-298Z" fill="#3a2a1e"/>
      ${eyes(-12, 12, -254, q.eyes, q.look, 6)}
      ${q.mouth === 'o' ? `<ellipse cx="0" cy="-234" rx="4.5" ry="5.5" fill="${P.pjB}"/>` : `<path d="M-6,-234 Q0,-230 6,-234" stroke="${P.pjB}" stroke-width="3" fill="none" stroke-linecap="round"/>`}
      <circle cx="-22" cy="-240" r="6" fill="#c87b6b" opacity=".35"/><circle cx="22" cy="-240" r="6" fill="#c87b6b" opacity=".35"/>`;
    if (q.glow) s += `<ellipse cx="0" cy="-240" rx="46" ry="50" fill="url(#gCyan)" opacity="${q.glow * 0.9}"/>`;
  }
  s += `</g>`;
  return `<g class="tema">${s}</g>`;
}

// ───────────────────────── СОСЕДИ: силуэты, лица подсвечены телефонами
function neighbor(v = 0, p = {}) {
  const q = Object.assign({ glow: 1, half: false }, p);
  const H = [410, 370, 440, 380, 330][v % 5];
  const sh = H - 160, hy = H - 205, hr = [34, 31, 36, 32, 30][v % 5];
  let s = '';
  if (!q.half) {
    s += `<rect x="-36" y="${-H * 0.47}" width="30" height="${H * 0.47}" rx="12" fill="${P.body}"/><rect x="6" y="${-H * 0.47}" width="30" height="${H * 0.47}" rx="12" fill="${P.body}"/>`;
  }
  s += `<path d="M-56,${-sh} Q0,${-sh - 12} 56,${-sh} L48,${-H * 0.45} L-48,${-H * 0.45} Z" fill="${P.body}"/>`;
  // руки держат телефон у груди
  s += `<rect x="-50" y="${-sh + 4}" width="22" height="104" rx="11" fill="#1d2540"/><rect x="28" y="${-sh + 4}" width="22" height="104" rx="11" fill="#1d2540"/>
    <rect x="-46" y="${-sh + 90}" width="92" height="20" rx="10" fill="#1d2540"/>`;
  s += `<circle cx="0" cy="${-sh + 90}" r="${90}" fill="url(#gCyan)" opacity="${q.glow * 0.8}"/>`;
  s += `<rect x="-13" y="${-sh + 78}" width="26" height="40" rx="4" fill="${P.cyan}" opacity="${0.4 + 0.6 * q.glow}"/>`;
  // голова
  s += `<rect x="-10" y="${-hy - 6}" width="20" height="20" fill="${P.body}"/>`;
  s += `<ellipse cx="0" cy="${-hy - hr}" rx="${hr}" ry="${hr * 1.15}" fill="url(#gFaceLit)" opacity="${0.35 + 0.65 * q.glow}"/>`;
  s += `<ellipse cx="0" cy="${-hy - hr}" rx="${hr}" ry="${hr * 1.15}" fill="${P.sil}" opacity="${1 - q.glow * 0.75}"/>`;
  const ey = -hy - hr - 2;
  s += `<circle cx="-11" cy="${ey}" r="3.2" fill="${P.white}"/><circle cx="11" cy="${ey}" r="3.2" fill="${P.white}"/>`;
  const top = -hy - hr * 2.15;
  const hair = [
    `<path d="M-30,${ey - 16} Q0,${top - 4} 30,${ey - 16}" stroke="${P.sil}" stroke-width="7" fill="none"/><path d="M-20,${ey} h14 M6,${ey} h14" stroke="#6aa9c2" stroke-width="2.5"/><circle cx="-13" cy="${ey}" r="8" stroke="#6aa9c2" stroke-width="2" fill="none"/><circle cx="13" cy="${ey}" r="8" stroke="#6aa9c2" stroke-width="2" fill="none"/>`,
    `<path d="M-33,${ey - 4} Q-36,${top - 10} 0,${top} Q36,${top - 10} 33,${ey - 4} Q24,${ey - 24} 0,${ey - 26} Q-24,${ey - 24} -33,${ey - 4}Z" fill="${P.sil}"/><circle cx="0" cy="${top - 14}" r="16" fill="${P.sil}"/>`,
    `<path d="M-38,${ey - 12} Q0,${top - 18} 38,${ey - 12}Z" fill="${P.sil}"/><rect x="-6" y="${ey - 16}" width="54" height="9" rx="4" fill="${P.sil}"/>`,
    `<path d="M-34,${ey + 40} Q-44,${top - 8} 0,${top - 2} Q44,${top - 8} 34,${ey + 40} L26,${ey + 40} Q28,${ey - 20} 0,${ey - 22} Q-28,${ey - 20} -26,${ey + 40}Z" fill="${P.sil}"/><circle cx="-14" cy="${top + 6}" r="9" fill="#2a2f45"/><circle cx="6" cy="${top + 2}" r="9" fill="#2a2f45"/><circle cx="24" cy="${top + 10}" r="9" fill="#2a2f45"/>`,
    `<path d="M-42,${ey + 48} Q-48,${top - 16} 0,${top - 12} Q48,${top - 16} 42,${ey + 48} L30,${ey + 48} Q32,${ey - 22} 0,${ey - 22} Q-32,${ey - 22} -30,${ey + 48}Z" fill="#141a2e"/>`
  ][v % 5];
  s += hair;
  return `<g class="neighbor">${s}</g>`;
}

// ───────────────────────── ДЫШАЩИЙ: то, что в трубке
function breather(p = {}) {
  const q = Object.assign({ breath: 0.5, tilt: 14, op: 1 }, p);
  let s = '';
  // тонкое тело, длинные руки
  s += `<path d="M-30,0 L-18,-430 Q-40,-560 -46,-700 Q0,-730 46,-700 Q40,-560 18,-430 L30,0 L12,0 L0,-380 L-12,0Z" fill="${P.ink}"/>`;
  s += `<path d="M-44,-690 Q-90,-520 -78,-320 L-68,-318 Q-70,-520 -30,-660Z M44,-690 Q96,-520 84,-300 L74,-298 Q76,-520 30,-660Z" fill="${P.ink}"/>`;
  s += `<path d="M-78,-320 l-10,40 M-74,-318 l-2,44 M-70,-319 l8,38 M84,-300 l12,40 M78,-299 l2,44 M74,-298 l-8,38" stroke="${P.ink}" stroke-width="5" stroke-linecap="round"/>`;
  // голова наклонена
  s += `<g transform="${rot(q.tilt, 0, -720)}"><rect x="-9" y="-760" width="18" height="50" fill="${P.ink}"/>
    <ellipse cx="0" cy="-805" rx="40" ry="58" fill="${P.ink}"/>
    <path d="M-26,-790 ${Array.from({ length: 13 }, (_, i) => `L${-26 + i * 4.33},${-790 + (i % 2 ? -1 : 1) * (2 + 10 * q.breath * Math.sin(i / 12 * Math.PI))}`).join(' ')}" stroke="${P.cyan}" stroke-width="2.5" fill="none" opacity="${0.35 + 0.5 * q.breath}"/>
    </g>`;
  // кайма света и «помехи»
  s += `<path d="M46,-700 Q40,-560 18,-430 L30,0" stroke="${P.cyanDim}" stroke-width="2" fill="none" opacity=".5"/>`;
  let seed = 7; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 70; i++) {
    const y = -rnd() * 860, w = 50 + (y < -680 ? 10 : 0);
    s += `<rect x="${(rnd() - 0.5) * w * 2.6}" y="${y}" width="${2 + rnd() * 6}" height="2" fill="${rnd() > 0.7 ? P.cyanDim : P.ink}" opacity="${0.4 + rnd() * 0.6}"/>`;
  }
  return `<g class="breather" opacity="${q.op}">${s}</g>`;
}

// ───────────────────────── ФОНЫ 1080×1920
function bgBedroom(p = {}) {
  const q = Object.assign({ curtain: 0, clock: '02:47', lamp: 1 }, p);
  let s = `<rect width="1080" height="1920" fill="url(#gWall)"/>`;
  // обои — еле видные полосы
  for (let x = 0; x < 1080; x += 90) s += `<rect x="${x}" y="0" width="2" height="1450" fill="#ffffff" opacity=".025"/>`;
  // окно
  s += `<g class="window"><rect x="110" y="360" width="440" height="640" fill="url(#gOutside)"/>
    <rect x="150" y="760" width="360" height="240" fill="#0a0a14"/><polygon points="140,760 330,640 520,760" fill="#0a0a14"/>
    <rect x="290" y="820" width="80" height="90" fill="${P.cyan}" opacity=".55" class="oppWin"/>
    <circle cx="470" cy="440" r="90" fill="url(#gAmber)"/>
    <rect x="96" y="346" width="468" height="16" fill="#2a3150"/><rect x="96" y="996" width="468" height="20" fill="#2a3150"/>
    <rect x="96" y="346" width="16" height="670" fill="#2a3150"/><rect x="548" y="346" width="16" height="670" fill="#2a3150"/>
    <rect x="322" y="346" width="14" height="670" fill="#2a3150"/><rect x="96" y="660" width="468" height="14" fill="#2a3150"/></g>`;
  // штора
  s += `<path class="curtain" d="M520,320 Q${600 + q.curtain * 30},700 ${560 + q.curtain * 40},1080 L700,1080 Q${690 + q.curtain * 10},700 690,320Z" fill="#33284a"/>
    <path d="M560,330 Q${610 + q.curtain * 20},700 ${600 + q.curtain * 30},1070" stroke="#251d38" stroke-width="10" fill="none"/>`;
  s += `<rect x="480" y="300" width="300" height="16" rx="8" fill="#3a3350"/>`;
  // календарь и куртка на крючке
  s += `<rect x="800" y="470" width="170" height="210" fill="#c9c2b3" opacity=".22"/><rect x="800" y="470" width="170" height="44" fill="${P.red}" opacity=".45"/>
    <text x="885" y="501" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="24" fill="#e9dfd0" opacity=".8">АВГУСТ</text>`;
  for (let i = 0; i < 20; i++) s += `<rect x="${812 + (i % 5) * 31}" y="${528 + Math.floor(i / 5) * 34}" width="20" height="20" fill="#e9dfd0" opacity="${i < 18 ? .12 : .3}"/>${i < 18 ? `<path d="M${812 + (i % 5) * 31},${528 + Math.floor(i / 5) * 34} l20,20" stroke="${P.red}" stroke-width="2" opacity=".5"/>` : ''}`;
  s += `<circle cx="900" cy="770" r="7" fill="#4a4f60"/><path d="M850,790 Q900,770 950,790 L962,1010 L838,1010Z" fill="${P.jacket}"/><rect x="842" y="900" width="116" height="9" fill="${P.amber}" opacity=".7"/>`;
  // пол
  s += `<rect y="1440" width="1080" height="480" fill="#0e1320"/>`;
  for (let y = 1470; y < 1920; y += 60) s += `<rect y="${y}" width="1080" height="3" fill="#000" opacity=".35"/>`;
  // кровать Марка (справа)
  s += `<rect x="560" y="1240" width="500" height="250" rx="10" fill="#1c2236"/><rect x="560" y="1290" width="500" height="150" rx="14" fill="#2a3a55"/>
    <rect x="1000" y="1140" width="36" height="360" rx="6" fill="#151a2a"/><rect x="590" y="1250" width="150" height="60" rx="24" fill="#4b5a75"/>`;
  // тумбочка + часы
  s += `<rect x="420" y="1300" width="130" height="190" fill="#181e30"/><rect x="438" y="1262" width="96" height="40" rx="6" fill="#0a0d15"/>
    <text x="486" y="1292" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="28" fill="${P.red}">${q.clock}</text>
    <ellipse cx="486" cy="1282" rx="90" ry="40" fill="url(#gRed)" opacity=".4"/>`;
  // кровать Тёмы (слева, ниже)
  s += `<rect x="20" y="1560" width="380" height="180" rx="10" fill="#1c2236"/><rect x="20" y="1590" width="380" height="110" rx="14" fill="#4a2530"/>
    <rect x="30" y="1570" width="120" height="50" rx="20" fill="#5b4a5a"/><rect x="20" y="1480" width="28" height="270" rx="6" fill="#151a2a"/>`;
  return s;
}

function bgHighway(p = {}) {
  const q = Object.assign({ lamps: [1, 1, 1, 1], truck: 0 }, p);
  const vx = 700, vy = 1040;
  let s = `<rect width="1080" height="1920" fill="url(#gSkyHwy)"/>`;
  // звёзды-помехи, город и элеватор на горизонте
  let seed = 3; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 60; i++) s += `<circle cx="${rnd() * 1080}" cy="${rnd() * 700}" r="${rnd() * 1.6 + 0.4}" fill="#cfd6ff" opacity="${rnd() * 0.5}"/>`;
  s += `<path d="M0,1040 L0,990 L60,990 L60,960 L120,960 L120,1000 L200,1000 L200,940 L260,940 L260,1000 L330,1000 L330,980 L390,980 L390,1040Z" fill="#0b0c16"/>
    <rect x="860" y="820" width="46" height="220" fill="#0b0c16"/><rect x="910" y="850" width="46" height="190" fill="#0b0c16"/><rect x="960" y="800" width="46" height="240" fill="#0b0c16"/><polygon points="850,820 1016,780 1016,800 850,840" fill="#0b0c16"/>
    <rect x="978" y="770" width="8" height="30" fill="#0b0c16"/><circle cx="982" cy="768" r="4" fill="${P.red}" class="towerLed"/>`;
  for (let i = 0; i < 14; i++) s += `<rect x="${20 + rnd() * 360}" y="${965 + rnd() * 60}" width="5" height="5" fill="${P.amber}" opacity="${0.3 + rnd() * 0.5}"/>`;
  // земля, дорога в перспективе
  s += `<rect y="1040" width="1080" height="880" fill="#0c0e15"/>
    <polygon points="${vx - 6},${vy} ${vx + 6},${vy} 1240,1920 160,1920" fill="#181b24"/>
    <polygon points="${vx - 6},${vy} ${vx - 2},${vy} 220,1920 160,1920" fill="#c9c2a8" opacity=".35"/>
    <polygon points="${vx + 4},${vy} ${vx + 6},${vy} 1240,1920 1180,1920" fill="#c9c2a8" opacity=".25"/>`;
  for (let i = 0; i < 9; i++) {
    const t1 = Math.pow(i / 9, 1.8), t2 = Math.pow((i + 0.45) / 9, 1.8);
    const y1 = vy + (1920 - vy) * t1, y2 = vy + (1920 - vy) * t2;
    const x1 = vx + (700 - vx) * t1, x2 = vx + (700 - vx) * t2;
    const w1 = 1 + 14 * t1, w2 = 1 + 14 * t2;
    s += `<polygon points="${x1 - w1},${y1} ${x1 + w1},${y1} ${x2 + w2},${y2} ${x2 - w2},${y2}" fill="${P.amber}" opacity=".5"/>`;
  }
  // обочина (гравий) слева
  s += `<polygon points="${vx - 8},${vy} 160,1920 0,1920 0,1500" fill="#14161e"/>`;
  // отбойник справа
  s += `<polygon points="${vx + 16},${vy - 4} 1080,1560 1080,1600 ${vx + 16},${vy}" fill="#5a6070" opacity=".6"/>`;
  // фонари
  const lampsAt = [[110, 1500, 1], [360, 1220, 0.62], [520, 1120, 0.4], [610, 1075, 0.25]];
  lampsAt.forEach(([x, y, k], i) => {
    const h = 900 * k, on = q.lamps[i] ?? 1;
    s += `<g class="lamp lamp${i}"><polygon points="${x + 70 * k},${y - h + 20 * k} ${x + 70 * k - 260 * k},${y + 30 * k} ${x + 70 * k + 260 * k},${y + 30 * k}" fill="url(#gCone)" opacity="${on}"/>
      <ellipse cx="${x + 70 * k}" cy="${y + 20 * k}" rx="${250 * k}" ry="${50 * k}" fill="${P.amber}" opacity="${0.18 * on}"/>
      <rect x="${x - 6 * k}" y="${y - h}" width="${12 * k}" height="${h}" fill="#08090f"/>
      <path d="M${x},${y - h + 6 * k} q${40 * k},-${30 * k} ${80 * k},0" stroke="#08090f" stroke-width="${10 * k}" fill="none"/>
      <rect x="${x + 52 * k}" y="${y - h + 4 * k}" width="${40 * k}" height="${14 * k}" rx="${4 * k}" fill="${on > 0.3 ? '#ffd9a0' : '#3a2f22'}"/>
      <circle cx="${x + 72 * k}" cy="${y - h + 16 * k}" r="${80 * k}" fill="url(#gAmber)" opacity="${on}"/></g>`;
  });
  // провода
  s += `<path d="M0,640 Q300,700 600,${1070 - 900 * 0.25 + 10}" stroke="#05060b" stroke-width="3" fill="none"/><path d="M0,700 Q320,760 610,1000" stroke="#05060b" stroke-width="2" fill="none"/>`;
  // остановка «ТРАССА», маршрут 7
  s += `<g class="stop"><rect x="842" y="1150" width="14" height="430" fill="#0a0c12"/>
    <rect x="760" y="1150" width="180" height="96" rx="8" fill="#e8e1cf" opacity=".9"/><rect x="760" y="1150" width="180" height="28" rx="8" fill="#2c5a3a"/>
    <text x="850" y="1171" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="20" fill="#e8e1cf">ОСТАНОВКА</text>
    <text x="850" y="1222" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="38" fill="#141820">ТРАССА</text>
    <circle cx="900" cy="1290" r="34" fill="${P.amber}"/><text x="900" y="1304" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="40" fill="#141820">7</text></g>`;
  // фары грузовика вдали
  if (q.truck) s += `<circle cx="${vx - 14}" cy="${vy + 6}" r="${4 + 30 * q.truck}" fill="#fff4d8" opacity=".9"/><circle cx="${vx + 14}" cy="${vy + 6}" r="${4 + 30 * q.truck}" fill="#fff4d8" opacity=".9"/><circle cx="${vx}" cy="${vy}" r="${60 + 300 * q.truck}" fill="url(#gAmber)" opacity=".6"/>`;
  return s;
}

function bgRoute(p = {}) {
  const q = Object.assign({ dot: 0.15, lit: 1 }, p);
  let s = `<rect width="1080" height="1920" fill="#07090f"/>`;
  for (let y = 0; y < 1920; y += 8) s += `<rect y="${y}" width="1080" height="1" fill="#fff" opacity=".02"/>`;
  s += `<rect x="70" y="300" width="940" height="1320" rx="30" fill="#0e121c" stroke="#252c3e" stroke-width="6"/>
    <text x="540" y="420" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="64" fill="${P.amber}" letter-spacing="4">МАРШРУТ № 7</text>
    <text x="540" y="480" text-anchor="middle" font-family="JetBrains Mono" font-size="30" fill="${P.amberDim}">КОЛЬЦЕВОЙ · НОЧНОЙ</text>`;
  const cx = 540, cy = 1040, rx = 330, ry = 430;
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="${P.amberDim}" stroke-width="14"/>`;
  const stops = [['САДОВАЯ, 7 · КОНЕЧНАЯ', -90], ['АВТОПАРК', -30], ['ЭЛЕВАТОР', 30], ['ТРАССА', 90], ['РЫНОК', 150], ['ШКОЛА', 210]];
  // пройденная часть маршрута
  const a0 = 90, a1 = 90 + 360 * q.dot;
  const arcPts = []; for (let a = a0; a <= a1; a += 2) { const r = a * Math.PI / 180; arcPts.push(`${cx + rx * Math.cos(r)},${cy + ry * Math.sin(r)}`); }
  if (arcPts.length > 1) s += `<polyline points="${arcPts.join(' ')}" fill="none" stroke="${P.amber}" stroke-width="14" stroke-linecap="round"/>`;
  stops.forEach(([n, a]) => {
    const r = a * Math.PI / 180, x = cx + rx * Math.cos(r), y = cy + ry * Math.sin(r);
    const home = a === -90;
    s += `<circle cx="${x}" cy="${y}" r="${home ? 26 : 18}" fill="#0e121c" stroke="${home ? P.red : P.amber}" stroke-width="8"/>`;
    const right = Math.cos(r) > 0.2, left = Math.cos(r) < -0.2;
    const bottom = Math.sin(r) > 0.9;
    const tx = home ? x : x + (right ? -40 : left ? 40 : 0), ty = home ? y - 50 : bottom ? y + 70 : y + 10, anc = home ? 'middle' : right ? 'end' : left ? 'start' : 'middle';
    s += `<text x="${tx}" y="${ty}" text-anchor="${anc}" font-family="JetBrains Mono" font-weight="800" font-size="${home ? 34 : 32}" fill="${home ? P.red : P.amber}">${n}</text>`;
  });
  const r = a1 * Math.PI / 180;
  s += `<circle cx="${cx + rx * Math.cos(r)}" cy="${cy + ry * Math.sin(r)}" r="22" fill="${P.cyan}"/><circle cx="${cx + rx * Math.cos(r)}" cy="${cy + ry * Math.sin(r)}" r="60" fill="url(#gCyan)"/>`;
  return s;
}

function bgHouse(p = {}) {
  const q = Object.assign({ neighbors: true, glow: 1, door: 1, lamp: 1 }, p);
  let s = `<rect width="1080" height="1920" fill="url(#gSkyHouse)"/>`;
  // деревья
  s += `<path d="M0,900 Q60,700 30,520 Q120,600 140,460 Q200,620 260,560 Q240,760 300,900Z" fill="#06080f"/>
    <path d="M1080,880 Q1000,680 1040,520 Q960,600 940,470 Q880,620 820,580 Q850,760 790,880Z" fill="#06080f"/>`;
  // дом
  s += `<polygon points="90,900 540,560 990,900" fill="#0d1018"/><rect x="130" y="890" width="820" height="620" fill="#171c2a"/>`;
  for (let y = 910; y < 1500; y += 34) s += `<rect x="130" y="${y}" width="820" height="3" fill="#000" opacity=".3"/>`;
  s += `<rect x="470" y="700" width="140" height="120" fill="#0a0c14"/><rect x="480" y="710" width="120" height="100" fill="#121828"/>`;
  // табличка адреса
  s += `<rect x="790" y="930" width="130" height="56" rx="6" fill="#2b4a7a"/><text x="855" y="968" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="24" fill="#dfe6f2">Садовая 7</text>`;
  // большое окно с соседями
  s += `<g class="bigWindow"><rect x="190" y="980" width="520" height="380" fill="url(#gWindowLit)"/>`;
  if (q.neighbors) {
    const ppl = [[250, 0], [355, 1], [455, 2], [560, 3], [655, 4], [300, 2], [610, 1]];
    s += `<clipPath id="winClip"><rect x="190" y="980" width="520" height="380"/></clipPath><g clip-path="url(#winClip)">`;
    ppl.slice(5).forEach(([x, v]) => s += `<g transform="translate(${x},1420) scale(1.05)" opacity=".7">${neighbor(v, { glow: q.glow * 0.7, half: true })}</g>`);
    ppl.slice(0, 5).forEach(([x, v]) => s += `<g transform="translate(${x},1490) scale(1.25)">${neighbor(v, { glow: q.glow, half: true })}</g>`);
    s += `</g>`;
  }
  s += `<rect x="176" y="966" width="548" height="16" fill="#2a3150"/><rect x="176" y="1356" width="548" height="22" fill="#2a3150"/>
    <rect x="176" y="966" width="16" height="410" fill="#2a3150"/><rect x="708" y="966" width="16" height="410" fill="#2a3150"/><rect x="444" y="966" width="12" height="410" fill="#2a3150"/></g>`;
  // дверь (открыта)
  s += `<rect x="760" y="1060" width="150" height="450" fill="#05070b"/>
    <polygon points="760,1060 ${760 + 150 * (1 - 0.7 * q.door)},1080 ${760 + 150 * (1 - 0.7 * q.door)},1490 760,1510" fill="#2a2030"/>
    <rect x="770" y="1070" width="130" height="430" fill="${P.cyan}" opacity="${0.08 * q.door}"/>`;
  // крыльцо
  s += `<rect x="720" y="1510" width="230" height="30" fill="#232838"/><rect x="740" y="1540" width="190" height="30" fill="#1c2030"/>`;
  // улица, забор, фонарь
  s += `<rect y="1520" width="1080" height="400" fill="#0b0d14"/>`;
  for (let x = -10; x < 1080; x += 52) s += `<rect x="${x}" y="1560" width="30" height="170" fill="#121624"/><polygon points="${x},1560 ${x + 15},1535 ${x + 30},1560" fill="#121624"/>`;
  s += `<rect x="0" y="1600" width="1080" height="14" fill="#121624"/><rect x="0" y="1680" width="1080" height="14" fill="#121624"/>`;
  s += `<rect x="40" y="980" width="14" height="760" fill="#05060b"/><path d="M47,986 q50,-40 100,0" stroke="#05060b" stroke-width="12" fill="none"/>
    <rect x="120" y="980" width="52" height="18" rx="5" fill="${q.lamp > 0.3 ? '#ffd9a0' : '#3a2f22'}"/><circle cx="146" cy="996" r="110" fill="url(#gAmber)" opacity="${q.lamp}"/>`;
  return s;
}

// ───────────────────────── ЭКРАН ТЕЛЕФОНА
function wrapText(t, n) { const w = t.split(' '); const out = []; let l = ''; w.forEach(x => { if ((l + ' ' + x).trim().length > n) { out.push(l.trim()); l = x; } else l += ' ' + x; }); if (l.trim()) out.push(l.trim()); return out; }
function phoneScreen(p = {}) {
  const q = Object.assign({ msgs: [], battery: 2, title: 'НЕИЗВЕСТНЫЙ', w: 420, h: 860, call: false, wave: 0.5, done: false }, p);
  const W = q.w, H = q.h;
  let s = `<rect x="-14" y="-14" width="${W + 28}" height="${H + 28}" rx="56" fill="#05070c"/><rect width="${W}" height="${H}" rx="44" fill="#0b1018"/>`;
  s += `<rect x="${W / 2 - 50}" y="14" width="100" height="26" rx="13" fill="#05070c"/>`;
  s += `<text x="34" y="36" font-family="JetBrains Mono" font-weight="700" font-size="20" fill="#c7d0dc">02:47</text>`;
  const bc = q.battery <= 5 ? P.red : '#c7d0dc';
  s += `<rect x="${W - 86}" y="20" width="40" height="20" rx="4" fill="none" stroke="${bc}" stroke-width="2"/><rect x="${W - 83}" y="23" width="${Math.max(2, 34 * q.battery / 100)}" height="14" fill="${bc}"/><text x="${W - 36}" y="37" font-family="JetBrains Mono" font-size="16" fill="${bc}">${q.battery}%</text>`;
  s += `<rect y="58" width="${W}" height="84" fill="#111827"/><circle cx="56" cy="100" r="26" fill="#1f2a3a"/><text x="56" y="110" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="28" fill="${P.cyan}">?</text>
    <text x="96" y="108" font-family="Inter Display" font-weight="800" font-size="26" fill="#e6ecf3">${q.title}</text>`;
  if (q.call) {
    s += `<text x="${W / 2}" y="300" text-anchor="middle" font-family="Inter Display" font-weight="600" font-size="26" fill="#9aa7b8">входящий вызов</text>`;
    let d = `M40,480`; for (let i = 0; i <= 60; i++) { const x = 40 + i * (W - 80) / 60; d += ` L${x},${480 + Math.sin(i * 0.9) * 70 * q.wave * Math.sin(i / 60 * Math.PI)}`; }
    s += `<path d="${d}" stroke="${P.cyan}" stroke-width="4" fill="none"/>`;
    s += `<circle cx="${W / 2 - 100}" cy="${H - 140}" r="44" fill="${P.red}"/><circle cx="${W / 2 + 100}" cy="${H - 140}" r="44" fill="#3fbf6a"/>`;
    return s;
  }
  let y = 180;
  q.msgs.forEach(m => {
    const lines = wrapText(m, 22); const bh = 26 + lines.length * 34;
    s += `<rect x="24" y="${y}" width="${W - 90}" height="${bh}" rx="20" fill="#1c2534"/>`;
    lines.forEach((l, i) => s += `<text x="44" y="${y + 42 + i * 34}" font-family="Inter Display" font-weight="700" font-size="27" fill="#e6ecf3">${l}</text>`);
    if (q.done) s += `<text x="${W - 54}" y="${y + bh - 10}" font-family="Inter Display" font-weight="900" font-size="22" fill="#3fbf6a">✓✓</text>`;
    y += bh + 16;
  });
  return s;
}

if (typeof module !== 'undefined') module.exports = { P, defs, mark, tema, neighbor, breather, bgBedroom, bgHighway, bgRoute, bgHouse, phoneScreen };

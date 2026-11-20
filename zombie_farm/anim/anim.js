// Анимация «Ферма. Зомби-апокалипсис». render(t) рисует кадр на время t (сек).
// Тайминг слов — window.TL (timeline.json). Все действия привязаны к словам через W().
/* global TL, farmer, infected, infectedFar, goose, dog, cow, gate, fence, well, house, generator, food, bgFarm, P */

// ---------- утилиты ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
const eout = (x) => 1 - Math.pow(1 - x, 3);
const back = (x) => { const c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const pr = (t, t0, d = 0.5) => clamp((t - t0) / d);
const lerp = (a, b, p) => a + (b - a) * p;
const rnd = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const g = (x, y, s, inner, extra = '') => `<g transform="translate(${x} ${y}) scale(${s})" ${extra}>${inner}</g>`;
const norm = (w) => w.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9-]/g, '');

const WORDS = TL.words;
const NSEC = 10;
const secWords = (i) => WORDS.filter((w) => w.sec === i);
const SEC = (i) => secWords(i)[0].s;
const SECEND = (i) => secWords(i).slice(-1)[0].e;
// время начала слова в секции: W(2, 'ворота'), W(1, 'миллионы', 1) — второе вхождение
function W(sec, prefix, n = 0) {
  const p = norm(prefix);
  const hits = secWords(sec).filter((w) => norm(w.w).startsWith(p));
  if (!hits[n]) throw new Error(`нет слова ${prefix} в секции ${sec}`);
  return hits[n].s;
}
const VOICE_END = TL.voiceEnd;
const CARD_START = VOICE_END + 0.7;
const TOTAL = CARD_START + 3.6;
window.TOTAL = TOTAL;

// камера: ключи [время, cx, cy, масштаб]
function cam(t, keys) {
  let c = keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a[0] && t < b[0]) { const p = ease((t - a[0]) / (b[0] - a[0])); c = [lerp(a[1], b[1], p), lerp(a[2], b[2], p), lerp(a[3], b[3], p)]; break; }
    if (t >= b[0]) c = b.slice(1);
  }
  return c;
}
function camT(t, c, shake = 0) {
  const [cx, cy, s] = c;
  const dx = Math.sin(t * 0.7) * 5 + (shake ? (rnd(Math.floor(t * 30)) - 0.5) * shake : 0);
  const dy = Math.cos(t * 0.53) * 4 + (shake ? (rnd(Math.floor(t * 30) + 7) - 0.5) * shake : 0);
  return `translate(${540 + dx} ${960 + dy}) scale(${s}) translate(${-cx} ${-cy})`;
}

// ---------- общие элементы ----------
function arcs(x, y, t, on, color = P.accent, dir = 1, size = 1) {
  if (on <= 0) return '';
  let s = '';
  for (let k = 0; k < 3; k++) {
    const p = (t * 1.6 + k / 3) % 1, r = (24 + p * 90) * size;
    const a = 0.75;
    const x1 = x + dir * r * Math.cos(-a), y1 = y + r * Math.sin(-a), x2 = x + dir * r * Math.cos(a), y2 = y + r * Math.sin(a);
    s += `<path d="M${x1} ${y1} A${r} ${r} 0 0 ${dir > 0 ? 1 : 0} ${x2} ${y2}" stroke="${color}" stroke-width="${7 * size}" fill="none" stroke-linecap="round" opacity="${(1 - p) * on}"/>`;
  }
  return s;
}
const eyes = (x, y, s = 1, op = 1) => `<g opacity="${op}"><circle cx="${x - 7 * s}" cy="${y}" r="${3.2 * s}" fill="${P.zEye}"/><circle cx="${x + 7 * s}" cy="${y}" r="${3.2 * s}" fill="${P.zEye}"/><circle cx="${x}" cy="${y}" r="${14 * s}" fill="${P.zEye}" opacity=".12"/></g>`;

function plumes(t, hz, k = 1) {
  let s = '';
  for (let i = 0; i < 5; i++) {
    const x = 90 + i * 220 + Math.sin(i * 3) * 40;
    for (let j = 0; j < 6; j++) {
      const p = (t * 0.08 + j / 6 + i * 0.13) % 1;
      s += `<circle cx="${x + p * 120 + Math.sin(t + j) * 10}" cy="${hz - 60 - p * 520}" r="${30 + p * 90}" fill="#24161a" opacity="${(1 - p) * 0.45 * k}"/>`;
    }
  }
  return s;
}

function grass(t, y, n = 26, h = 60, col = '#0e1410') {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = (i / n) * 1120 - 20 + rnd(i) * 30, sw = Math.sin(t * 1.4 + i * 0.7) * 12;
    const hh = h * (0.6 + rnd(i + 3) * 0.7);
    s += `<path d="M${x - 8} ${y} Q${x + sw * 0.5} ${y - hh * 0.6} ${x + sw} ${y - hh} Q${x + sw * 0.4} ${y - hh * 0.5} ${x + 8} ${y} Z" fill="${col}"/>`;
  }
  return s;
}

function barn(doorOpen = 1) {
  const dw = 80 * doorOpen;
  return `<g class="barn"><ellipse cx="0" cy="4" rx="190" ry="12" fill="#000" opacity=".35"/>
    <rect x="-170" y="-300" width="340" height="300" fill="#4e2520"/>
    ${Array.from({ length: 8 }, (_, i) => `<line x1="${-170 + i * 45}" y1="-300" x2="${-170 + i * 45}" y2="0" stroke="#3a1a16" stroke-width="4"/>`).join('')}
    <path d="M-200 -296 L0 -430 L200 -296 Z" fill="#2a1814"/>
    <rect x="-90" y="-210" width="180" height="210" fill="#120c0b"/>
    <rect x="${-90}" y="-210" width="${90 - dw}" height="210" fill="#6b3a2c"/>
    <rect x="${dw}" y="-210" width="${90 - dw}" height="210" fill="#6b3a2c"/>
    ${doorOpen < 0.1 ? `<path d="M-90 -210 L90 0 M90 -210 L-90 0" stroke="#8a4d3a" stroke-width="10"/>` : ''}
    <rect x="-30" y="-280" width="60" height="44" fill="#120c0b"/></g>`;
}

function car(c, lit) {
  return `<g><rect x="-70" y="-46" width="140" height="40" rx="10" fill="${c}"/><path d="M-44 -46 L-30 -76 L34 -76 L48 -46 Z" fill="${c}"/>
    <path d="M-34 -48 L-24 -70 L26 -70 L38 -48 Z" fill="#0c1018"/>
    <circle cx="-42" cy="-6" r="14" fill="#0a0a0a"/><circle cx="42" cy="-6" r="14" fill="#0a0a0a"/>
    <rect x="-70" y="-40" width="16" height="10" rx="3" fill="#ff3020" opacity="${lit}"/><rect x="54" y="-40" width="16" height="10" rx="3" fill="#ff3020" opacity="${lit}"/>
    <circle cx="-62" cy="-35" r="26" fill="#ff3020" opacity="${0.12 * lit}"/><circle cx="62" cy="-35" r="26" fill="#ff3020" opacity="${0.12 * lit}"/></g>`;
}

function bigCity(t, hz) {
  let s = '', x = -20, i = 0;
  while (x < 1100) {
    const bw = 70 + rnd(i) * 110, bh = 220 + rnd(i + 50) * 560;
    s += `<rect x="${x}" y="${hz - bh}" width="${bw}" height="${bh}" fill="${i % 2 ? '#150b0c' : '#1b0e0e'}"/>`;
    for (let k = 0; k < 10; k++) {
      if (rnd(i * 31 + k) > 0.6) {
        const fl = 0.5 + 0.5 * Math.sin(t * (3 + rnd(k + i) * 6) + k);
        s += `<rect x="${x + 10 + rnd(i * 7 + k) * (bw - 26)}" y="${hz - bh + 20 + rnd(i * 13 + k) * (bh - 60)}" width="12" height="16" fill="${P.glow}" opacity="${0.4 + fl * 0.5}"/>`;
      }
    }
    x += bw + 6; i++;
  }
  return s;
}

function iconBubble(x, y, p, inner, label) {
  if (p <= 0) return '';
  const s = back(clamp(p));
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="${clamp(p * 3)}">
    <circle r="118" fill="#0b0e15" opacity=".82" stroke="${P.accent}" stroke-width="7"/>${inner}
    <text y="168" text-anchor="middle" font-family="Rubik" font-weight="800" font-size="50" fill="${P.text}" stroke="#000" stroke-width="10" paint-order="stroke">${label}</text></g>`;
}
const dropIcon = (s = 1, col = '#5aa9e6') => `<path transform="scale(${s})" d="M0 -78 C30 -36 52 -6 52 22 A52 52 0 0 1 -52 22 C-52 -6 -30 -36 0 -78Z" fill="${col}"/><path transform="scale(${s})" d="M-24 18 A26 26 0 0 0 -4 44" stroke="#cfe8ff" stroke-width="8" fill="none" stroke-linecap="round"/>`;
const breadIcon = `<rect x="-62" y="-30" width="124" height="70" rx="30" fill="#c98a3c"/><path d="M-30 -24 L-38 30 M0 -28 L-6 34 M30 -24 L24 30" stroke="#8a5a22" stroke-width="8" stroke-linecap="round"/>`;
const distIcon = `<path d="M-70 40 L70 40" stroke="${P.text}" stroke-width="8"/><path d="M-70 26 V54 M70 26 V54" stroke="${P.text}" stroke-width="8"/><text y="12" text-anchor="middle" font-family="Russo One" font-size="62" fill="${P.accent}">КМ</text>`;

function calendarCell(x, y, n, p, crossed) {
  if (p <= 0) return '';
  return `<g transform="translate(${x} ${y}) scale(${back(clamp(p))})"><rect x="-70" y="-80" width="140" height="160" rx="14" fill="#e9e4d6"/><rect x="-70" y="-80" width="140" height="40" rx="14" fill="#b53a2a"/><rect x="-70" y="-56" width="140" height="16" fill="#b53a2a"/>
    <text y="56" text-anchor="middle" font-family="Russo One" font-size="92" fill="#1b1f2a">${n}</text>
    ${crossed > 0 ? `<path d="M-60 -64 L${-60 + 120 * crossed} ${-64 + 140 * crossed}" stroke="#d0281c" stroke-width="16" stroke-linecap="round"/>` : ''}</g>`;
}

// ---------- СЦЕНЫ ----------
const S = [];

// 0. Хук: ферма, потом зарево города
S[0] = (t) => {
  const hz = 1000, tCity = W(0, 'городе'), tStay = W(0, 'оставайтесь');
  const c = cam(t, [[0, 540, 1380, 1.05], [tStay, 560, 1420, 1.18], [tCity - 0.15, 560, 1420, 1.18], [tCity + 0.9, 540, 1000, 1.5], [SECEND(0) + 1, 540, 990, 1.62]]);
  const glowK = 0.5 + 0.5 * pr(t, tCity, 0.6);
  const fl = 0.75 + 0.25 * Math.sin(t * 9) * Math.sin(t * 3.3);
  const arm = -40 * ease(pr(t, tStay, 0.35)) * (1 - pr(t, tCity, 0.5));
  return `<g transform="${camT(t, c)}">
    ${bgFarm(1080, 1920, { horizon: hz })}
    <ellipse cx="540" cy="${hz}" rx="700" ry="${220 + 80 * glowK}" fill="${P.glow}" opacity="${0.25 * glowK * fl}"/>
    ${plumes(t, hz, glowK)}
    ${g(140 + t * 6, hz + 12, 0.32, infectedFar())}${g(930 - t * 5, hz + 8, 0.3, infectedFar({ lean: 5 }))}
    ${g(0, 1150, 1, fence(1080))}
    ${g(330, 1400, 0.85, house())}
    ${g(870, 1430, 0.6, well())}
    ${g(820, 1800, 0.9, dog())}
    ${g(560, 1790, 1.35, farmer({ arm }))}
    ${grass(t, 1925, 30, 80)}
  </g>`;
};

// 1. Город: миллионы → заражённые → пробки, пустые магазины → у вас: вода, еда, расстояние
S[1] = (t) => {
  const tRoad = W(1, 'дороги'), tFarm = W(1, 'а', 1);
  const tMil = W(1, 'миллионы', 0), tInf = W(1, 'заражённых'), tShop = W(1, 'магазины');
  const parts = [];
  // A — город и толпа
  if (t < tRoad + 0.35) {
    const hz = 1250;
    const c = cam(t, [[SEC(1) - 0.3, 540, 1100, 1.0], [tRoad, 540, 1250, 1.14]]);
    let crowd = '';
    const rows = [[1300, 0.55, 14], [1420, 0.85, 10], [1600, 1.3, 7], [1830, 2.0, 5]];
    let idx = 0;
    rows.forEach(([y, s, n], r) => {
      for (let i = 0; i < n; i++, idx++) {
        const x = (i + 0.5) * (1080 / n) + (rnd(idx) - 0.5) * 60;
        const appear = pr(t, tMil + idx * 0.025, 0.3);
        const sway = Math.sin(t * 2 + idx) * 3;
        const eyesOn = pr(t, tInf + rnd(idx) * 0.6, 0.15);
        crowd += `<g transform="translate(${x} ${y + (1 - appear) * 60}) scale(${s})" opacity="${appear}"><g transform="skewX(${sway})">${infectedFar().split(P.zEye).join('#06080d')}</g>${eyesOn > 0 ? eyes(4, -93, 1.1, eyesOn) : ''}</g>`;
      }
    });
    parts.push([1 - pr(t, tRoad, 0.35), `<g transform="${camT(t, c)}">
      <rect width="1080" height="1920" fill="#0d0a10"/>
      <rect width="1080" height="${hz}" fill="url(#cityG)"/>
      ${plumes(t, hz - 300, 1)}
      ${bigCity(t, hz)}
      <rect y="${hz}" width="1080" height="${1920 - hz}" fill="#0b0b0f"/>
      ${crowd}
    </g>`]);
  }
  // B — пробка и пустой магазин
  if (t >= tRoad - 0.05 && t < tFarm + 0.35) {
    const hz = 900;
    const c = cam(t, [[tRoad, 620, 1250, 1.0], [tShop, 600, 1250, 1.05], [tShop + 0.7, 300, 1200, 1.3], [tFarm, 280, 1180, 1.36]]);
    let cars = '';
    const lane = [[0.15, -1], [0.3, 1], [0.45, -1], [0.6, 1], [0.75, -1], [0.92, 1], [1.1, -1], [1.3, 1]];
    lane.forEach(([d, side], i) => {
      const y = hz + 30 + d * d * 820, s = 0.25 + d * 1.25, x = 540 + side * (40 + d * 210) + 120;
      const lit = 0.4 + 0.6 * (Math.sin(t * 5 + i * 2) > 0 ? 1 : 0.2);
      cars += g(x, y, s, car(['#3b4252', '#4a3535', '#2f3a33', '#45403a'][i % 4], lit));
    });
    const flick = Math.sin(t * 23) > 0.2 || Math.sin(t * 7) > 0.6 ? 1 : 0.15;
    parts.push([pr(t, tRoad - 0.05, 0.35) * (1 - pr(t, tFarm, 0.35)), `<g transform="${camT(t, c)}">
      ${bgFarm(1080, 1920, { horizon: hz })}
      <rect y="${hz}" width="1080" height="${1920 - hz}" fill="#121216"/>
      <path d="M560 ${hz} L720 ${hz} L1180 1920 L140 1920 Z" fill="#1c1c22"/>
      ${[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6 + t * 0.0) ; const y1 = hz + a * a * 1020, y2 = hz + (a + 0.06) * (a + 0.06) * 1020; return `<path d="M${640 + (y1 - hz) * 0.06} ${y1} L${640 + (y2 - hz) * 0.06} ${y2}" stroke="#55545a" stroke-width="${4 + a * 14}"/>`; }).join('')}
      ${cars}
      <g transform="translate(0 1330)">
        <rect x="20" y="-420" width="470" height="420" fill="#232634"/>
        <rect x="40" y="-500" width="430" height="80" fill="#14161f"/>
        <text x="255" y="-442" text-anchor="middle" font-family="Russo One" font-size="54" fill="${flick > 0.5 ? '#6ad1ff' : '#1d3a48'}">ПРОДУКТЫ</text>
        <rect x="60" y="-370" width="390" height="250" fill="#0b0d13"/>
        ${[0, 1, 2].map((r) => `<rect x="70" y="${-320 + r * 80}" width="370" height="8" fill="#3a3f4f"/>`).join('')}
        <rect x="120" y="-334" width="26" height="14" fill="#5a4a3a" transform="rotate(30 133 -327)"/>
        <path d="M60 -370 L180 -260 L130 -200 L250 -120" stroke="#5f6a80" stroke-width="3" fill="none"/>
        <rect x="200" y="-110" width="110" height="110" fill="#0b0d13"/>
      </g>
    </g>`]);
  }
  // C — ферма: вода, еда, расстояние
  if (t >= tFarm - 0.05) {
    const hz = 1080;
    const c = cam(t, [[tFarm, 540, 1250, 1.2], [SECEND(1) + 0.5, 540, 1150, 1.05]]);
    const tv = W(1, 'вода'), te = W(1, 'еда'), td = W(1, 'расстояние');
    parts.push([pr(t, tFarm - 0.05, 0.35), `<g transform="${camT(t, c)}">
      ${bgFarm(1080, 1920, { horizon: hz })}
      ${g(0, 1230, 1, fence(1080))}
      ${g(300, 1520, 0.8, house())}${g(840, 1520, 0.6, well())}
      ${g(560, 1800, 1.1, cow())}
      ${grass(t, 1925, 30, 80)}
    </g>
    ${iconBubble(220, 830, pr(t, tv, 0.45), dropIcon(1.1), 'вода')}
    ${iconBubble(540, 760, pr(t, te, 0.45), breadIcon, 'еда')}
    ${iconBubble(860, 830, pr(t, td, 0.45), distIcon, 'расстояние')}`]);
  }
  return parts.map(([o, s]) => `<g opacity="${o}">${s}</g>`).join('');
};

// 2. Совет 1: закройте ворота, загоните скот. Заражённые идут на движение и шум
S[2] = (t) => {
  const hz = 1060, tGate = W(2, 'закройте'), tCow = W(2, 'загоните'), tInf = W(2, 'заражённые'), tMove = W(2, 'движение'), tNoise = W(2, 'шум');
  const c = cam(t, [[SEC(2) - 0.3, 560, 1350, 1.0], [tGate, 640, 1420, 1.2], [tCow - 0.1, 640, 1420, 1.2], [tCow + 0.7, 400, 1480, 1.12], [tInf, 400, 1480, 1.12], [tInf + 0.8, 600, 1180, 1.3], [SECEND(2) + 1, 600, 1170, 1.38]]);
  const open = 0.85 * (1 - ease(pr(t, tGate, 0.8)));
  const cp = ease(pr(t, tCow, 1.6));
  const cowX = lerp(930, 200, cp), cowOp = 1 - pr(t, tCow + 1.45, 0.3);
  const door = 1 - ease(pr(t, tCow + 1.7, 0.4));
  const ap = pr(t, tInf, 4);
  let inf = '';
  for (let i = 0; i < 6; i++) {
    const x = 120 + i * 170 + Math.sin(i * 5) * 30;
    const walk = Math.sin(t * 3 + i) * 3;
    inf += `<g transform="translate(${x + (540 - x) * ap * 0.15} ${hz + 20 + ap * 80 + (i % 2) * 14}) scale(${0.45 + ap * 0.35})"><g transform="skewX(${walk})">${infectedFar()}</g></g>`;
  }
  return `<g transform="${camT(t, c)}">
    ${bgFarm(1080, 1920, { horizon: hz })}
    ${inf}
    ${pr(t, tMove, 0.2) > 0 ? `<g opacity="${pr(t, tMove, 0.3) * (1 - pr(t, tNoise + 1.2, 0.4))}">${[0, 1, 2].map((k) => `<path d="M${cowX + 90 + k * 18} ${1650 + k * 26} h${50 + k * 10}" stroke="${P.accent}" stroke-width="7" stroke-linecap="round" opacity="${0.5 + 0.5 * Math.sin(t * 10 + k)}"/>`).join('')}</g>` : ''}
    ${g(0, 1300, 1, fence(360))}${g(860, 1300, 1, fence(220))}
    ${g(640, 1460, 1.25, gate({ open }))}
    ${arcs(640, 1340, t, pr(t, tNoise, 0.2) * (1 - pr(t, tNoise + 1.6, 0.3)), P.accent, 1, 1.2)}
    ${arcs(640, 1340, t, pr(t, tNoise, 0.2) * (1 - pr(t, tNoise + 1.6, 0.3)), P.accent, -1, 1.2)}
    ${g(200, 1600, 1, barn(door))}
    <g opacity="${cowOp}" transform="translate(${cowX} ${1760 + Math.abs(Math.sin(t * 8)) * -6 * (cp > 0 && cp < 1 ? 1 : 0)}) scale(-1.1 1.1)">${cow()}</g>
    ${grass(t, 1925, 30, 70)}
  </g>`;
};

// 3. Совет 2: колодец, вода, три дня
S[3] = (t) => {
  const tChk = W(3, 'проверьте'), tWell = W(3, 'колодец'), tWater = W(3, 'вода'), tDays = W(3, 'трёх'), tSurv = W(3, 'протянете');
  const c = cam(t, [[SEC(3) - 0.3, 540, 1300, 1.0], [tChk, 540, 1430, 1.22], [tWater - 0.1, 540, 1430, 1.22], [tWater + 0.6, 540, 1120, 1.0], [SECEND(3) + 1, 540, 1100, 1.04]]);
  const down = ease(pr(t, tChk + 0.1, 0.8)), up = ease(pr(t, tWell + 0.6, 0.9));
  const by = 95 * down * (1 - up);
  const full = up > 0.05;
  let drips = '';
  if (full) for (let i = 0; i < 5; i++) { const p = (t * 1.5 + i / 5) % 1; drips += `<circle cx="${540 + (rnd(i) - 0.5) * 50}" cy="${1560 + 2 * (-84) + 2 * by + p * 110}" r="6" fill="#5aa9e6" opacity="${1 - p}"/>`; }
  const dp = pr(t, tWater, 0.5), shrink = 1 - 0.4 * ease(pr(t, tSurv, 1.2));
  const dCells = [0, 1, 2].map((i) => calendarCell(300 + i * 240, 980, i + 1, pr(t, tDays + i * 0.14, 0.4), pr(t, SECEND(3) + 0.05 + i * 0.22, 0.25))).join('');
  return `<g transform="${camT(t, c)}">
    ${bgFarm(1080, 1920, { horizon: 960 })}
    ${g(0, 1120, 1, fence(1080))}
    ${g(540, 1560, 2, well({ bucket: by, full }))}
    ${drips}
    ${g(170, 1760, 1.25, farmer({ arm: -60 * pr(t, tChk, 0.3) * (1 - pr(t, tWater, 0.3)) }))}
    ${grass(t, 1925, 30, 70)}
  </g>
  ${dp > 0 ? `<g transform="translate(540 ${700 + Math.sin(t * 2) * 10}) scale(${back(dp) * shrink * 1.6})"><circle r="120" fill="#5aa9e6" opacity=".18"/>${dropIcon(1.2)}</g>` : ''}
  ${dCells}`;
};

// 4. Совет 3: собрать еду, разделить на порции
S[4] = (t) => {
  const tCol = W(4, 'соберите'), tDiv = W(4, 'разделите'), tSeem = W(4, 'кажется');
  const c = cam(t, [[SEC(4) - 0.3, 540, 1250, 1.05], [tDiv, 540, 1300, 1.12], [SECEND(4) + 1, 540, 1260, 1.0]]);
  const items = [];
  const jar = (c1) => `<rect x="-26" y="-80" width="52" height="80" rx="8" fill="${c1}"/><rect x="-23" y="-92" width="46" height="14" rx="3" fill="#8b8f96"/><rect x="-16" y="-56" width="32" height="22" fill="#e8e2cc" opacity=".7"/>`;
  const can = `<rect x="-24" y="-60" width="48" height="60" rx="5" fill="#9ba0a8"/><rect x="-24" y="-46" width="48" height="20" fill="#c4502f"/>`;
  const sack = `<path d="M-60 0 Q-70 -80 -40 -110 L40 -110 Q70 -80 60 0 Z" fill="#c9b27a"/><path d="M-40 -110 Q0 -126 40 -110" stroke="#8a6a45" stroke-width="8" fill="none"/><text y="-44" text-anchor="middle" font-family="Rubik" font-weight="800" font-size="26" fill="#4a3826">МУКА</text>`;
  const pile = [[260, sack], [380, jar('#7a3b2e')], [450, jar('#a5722c')], [520, can], [590, jar('#5c6b2e')], [660, can], [740, sack], [830, jar('#7a3b2e')]];
  const dv = ease(pr(t, tDiv, 1.0));
  pile.forEach(([x, it], i) => {
    const p = pr(t, tCol + i * 0.12, 0.45);
    if (p <= 0) return;
    const y0 = 1330 - (1 - eout(p)) * 600;
    const tx = lerp(x, 160 + (i % 4) * 250, dv), ty = lerp(y0, 1330 + Math.floor(i / 4) * 0, dv);
    items.push(`<g transform="translate(${tx} ${ty}) scale(${lerp(1.3, 1.1, dv)})">${it}</g>`);
  });
  const boxes = dv > 0 ? [0, 1, 2, 3].map((i) => `<rect x="${160 + i * 250 - 105}" y="1150" width="210" height="200" rx="16" fill="none" stroke="${P.accent}" stroke-width="6" stroke-dasharray="22 14" opacity="${dv}"/>
      <text x="${160 + i * 250}" y="1120" text-anchor="middle" font-family="Russo One" font-size="44" fill="${P.text}" opacity="${dv}">ДЕНЬ ${i + 1}</text>`).join('') : '';
  const sp = pr(t, tSeem, 0.4);
  return `<g transform="${camT(t, c)}">
    <rect width="1080" height="1920" fill="#1a1411"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 90}" y="0" width="88" height="1920" fill="${i % 2 ? '#1e1713' : '#1a1411'}"/>`).join('')}
    <rect x="360" y="380" width="360" height="400" fill="#0a0f1c"/><rect x="380" y="400" width="320" height="360" fill="#121a2e"/>
    <circle cx="610" cy="500" r="40" fill="#d8d3c0" opacity=".7"/><path d="M540 400 V760 M380 580 H700" stroke="#2b2017" stroke-width="16"/>
    <rect x="340" y="770" width="400" height="24" fill="#2b2017"/>
    <circle cx="540" cy="200" r="${26}" fill="#e7b25a" opacity="${0.0}"/>
    ${boxes}
    <rect x="-20" y="1340" width="1120" height="40" fill="#5b4330"/><rect x="-20" y="1380" width="1120" height="560" fill="#3a2b20"/>
    ${items.join('')}
    ${g(920 + Math.sin(t) * 4, 1720, 1.2, farmer({ arm: -30 * Math.max(0, Math.sin(t * 3)) * (1 - dv) }))}
  </g>
  ${sp > 0 ? `<g transform="translate(540 ${640}) scale(${back(sp)}) rotate(-5)"><rect x="-260" y="-80" width="520" height="140" rx="20" fill="${P.accent}"/><text y="30" text-anchor="middle" font-family="Russo One" font-size="88" fill="#111">МНОГО?</text></g>` : ''}`;
};

// 5. Совет 4: не двор, а дом; забор падает; заколотить окна; спать на втором
S[5] = (t) => {
  const tYard = W(5, 'весь'), tHouse = W(5, 'один'), tFence = W(5, 'забор'), tHold = W(5, 'удержит'), tBoard = W(5, 'заколотите'), tUp = W(5, 'втором');
  const HX = 540, HY = 1440, HS = 0.8;
  const c = cam(t, [[SEC(5) - 0.3, 540, 1300, 0.95], [tFence - 0.1, 540, 1300, 0.95], [tFence + 0.5, 820, 1180, 1.35], [tBoard - 0.1, 820, 1180, 1.35], [tBoard + 0.4, 540, 1300, 1.75], [tUp - 0.1, 540, 1300, 1.75], [tUp + 0.5, 540, 1150, 1.6], [SECEND(5) + 1, 540, 1150, 1.65]]);
  // забор под натиском
  const push = pr(t, tFence, (tHold - tFence) + 0.4), fall = ease(pr(t, tHold + 0.25, 0.5));
  const tilt = -8 * push + Math.sin(t * 14) * 3 * push * (1 - fall);
  let crowd = '';
  for (let i = 0; i < 5; i++) {
    const x = 640 + i * 95, adv = push * 20 + fall * 70;
    crowd += `<g transform="translate(${x - 30 + Math.sin(t * 3 + i) * 6} ${1140 + adv + (i % 2) * 20}) scale(-0.55 0.55)">${infected({ variant: i % 2 })}</g>`;
  }
  const crowdOp = pr(t, tFence - 0.6, 0.5);
  // доски
  const boardSpots = [[-200, -200, 10, -12], [-200, -200, 44, 10], [-200, -200, 70, -6], [130, -200, 10, -12], [130, -200, 44, 10], [130, -200, 70, -6], [-42, -260, 130, 0], [-42, -260, 190, 0]];
  let boards = '', shake = 0;
  boardSpots.forEach(([x, y, dy, rot], i) => {
    const tb = tBoard + i * 0.17, p = pr(t, tb, 0.14);
    if (p <= 0) return;
    if (t - tb < 0.2) shake = 10;
    const bx = x === -42 ? -52 : x - 6, bw = x === -42 ? 104 : 82;
    boards += `<rect x="${bx}" y="${y + dy}" width="${bw}" height="13" fill="${i % 2 ? P.wood : P.woodLight}" transform="rotate(${rot} ${bx + bw / 2} ${y + dy + 6}) translate(0 ${(1 - p) * -40})" opacity="${p}"/>`;
  });
  const yardP = pr(t, tYard, 0.6), xP = pr(t, tHouse - 0.15, 0.3), hP = pr(t, tHouse, 0.4);
  const upP = pr(t, tUp, 0.4);
  return `<g transform="${camT(t, c, shake)}">
    ${bgFarm(1080, 1920, { horizon: 1000 })}
    <g opacity="${crowdOp}">${crowd}</g>
    ${g(0, 1220, 1, fence(560))}
    <g transform="translate(600 1220) skewX(${-tilt * 0.4}) scale(1 ${1 - 0.85 * fall})">${fence(480)}</g>
    ${g(HX, HY, HS, house({ boarded: false }) + boards)}
    ${upP > 0 ? `<g opacity="${upP}"><path d="M${HX - 0.8 * 165} ${HY - 0.8 * 240 + Math.sin(t * 5) * 8} v-60 m-26 26 l26 -26 l26 26" stroke="${P.accent}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="${HX - 0.8 * 80}" y="${HY - 0.8 * 440 - (t - tUp) * 20}" font-family="Russo One" font-size="54" fill="${P.text}" opacity="${0.9}">z z</text></g>` : ''}
    ${yardP > 0 ? `<rect x="40" y="1080" width="1000" height="780" rx="20" fill="none" stroke="${P.accent}" stroke-width="10" stroke-dasharray="40 24" stroke-dashoffset="${-t * 60}" opacity="${yardP * (1 - pr(t, tHouse + 0.3, 0.4))}"/>` : ''}
    ${xP > 0 ? `<g opacity="${xP * (1 - pr(t, tHouse + 0.3, 0.4))}" stroke="#d0281c" stroke-width="22" stroke-linecap="round"><path d="M140 1180 L940 1780"/><path d="M940 1180 L140 1780"/></g>` : ''}
    ${hP > 0 ? `<path d="M${HX - 260} ${HY} V${HY - 376} L${HX} ${HY - 520} L${HX + 260} ${HY - 376} V${HY} Z" fill="none" stroke="${P.accent}" stroke-width="12" opacity="${hP * (1 - pr(t, tFence, 0.4))}" filter="url(#glow)"/>` : ''}
    ${grass(t, 1925, 30, 70)}
  </g>`;
};

// 6. Совет 5: ни света, ни генератора; свет и звук видны за километры
S[6] = (t) => {
  const tLight = W(6, 'света'), tGen = W(6, 'генератора'), tSee = W(6, 'свет'), tKm = W(6, 'километры');
  const parts = [];
  if (t < tSee + 0.35) {
    const L = 1 - pr(t, tLight + 0.1, 0.12);
    const on = 1 - pr(t, tGen + 0.1, 0.1);
    const vib = on ? Math.sin(t * 60) * 2 : 0;
    const HX = 470, HY = 1480, HS = 0.8;
    const win = [[-200, -420], [-35, -420], [130, -420], [-200, -200], [130, -200]].map(([x, y]) => `<rect x="${HX + HS * x}" y="${HY + HS * y}" width="${HS * 70}" height="${HS * 86}" fill="#f0b85a" opacity="${L * (0.85 + 0.15 * Math.sin(t * 17 + x))}"/>`).join('');
    const c = cam(t, [[SEC(6) - 0.3, 560, 1350, 1.0], [tGen - 0.1, 560, 1350, 1.08], [tGen + 0.4, 760, 1500, 1.35], [tSee, 760, 1500, 1.38]]);
    parts.push([1 - pr(t, tSee, 0.35), `<g transform="${camT(t, c)}">
      ${bgFarm(1080, 1920, { horizon: 1040 })}
      ${g(0, 1200, 1, fence(1080))}
      <ellipse cx="${HX}" cy="${HY + 140}" rx="420" ry="120" fill="#f0b85a" opacity="${0.18 * L}"/>
      ${g(HX, HY, HS, house({ boarded: true }))}${win}
      <path d="M${HX + 210} ${HY - 120} Q 800 ${HY - 100} 860 ${1660}" stroke="#111" stroke-width="6" fill="none"/>
      ${g(880 + vib, 1720, 1.25, generator({ off: pr(t, tGen + 0.15, 0.1) > 0.5 }))}
      ${arcs(960, 1640, t, on, '#d9d2b0', 1, 1)}
      <rect width="1080" height="1920" fill="#000" opacity="${0.3 * (1 - L)}"/>
      ${grass(t, 1925, 30, 70)}
    </g>`]);
  }
  if (t >= tSee - 0.05) {
    const hz = 1060;
    const c = cam(t, [[tSee, 540, 1100, 1.25], [SECEND(6) + 1.2, 540, 1080, 1.0]]);
    const NX = 300, NY = 1150;
    let rings = '';
    for (let k = 0; k < 4; k++) { const p = (t * 0.6 + k / 4) % 1; rings += `<ellipse cx="${NX}" cy="${NY - 20}" rx="${40 + p * 700}" ry="${(40 + p * 700) * 0.35}" fill="none" stroke="#f0b85a" stroke-width="5" opacity="${(1 - p) * 0.7}"/>`; }
    const sp = pr(t, W(6, 'звук'), 0.3);
    let eyesS = '';
    for (let i = 0; i < 16; i++) {
      const ep = pr(t, tKm - 0.4 + i * 0.06, 0.3), adv = pr(t, tKm, 3);
      const ex = 60 + rnd(i) * 960, ey = 1120 + rnd(i + 9) * 600;
      eyesS += eyes(lerp(ex, NX, adv * 0.25), lerp(ey, NY, adv * 0.2), 1 + (ey - 1100) / 500, ep);
    }
    const kp = pr(t, tKm, 0.5);
    parts.push([pr(t, tSee - 0.05, 0.35), `<g transform="${camT(t, c)}">
      ${bgFarm(1080, 1920, { horizon: hz })}
      <path d="M0 ${hz + 60} Q300 ${hz - 20} 600 ${hz + 50} T1080 ${hz + 20} V1920 H0Z" fill="#0f1511"/>
      ${rings}
      ${g(NX, NY, 0.22, house({ boarded: false }))}
      <rect x="${NX - 0.22 * 200}" y="${NY - 0.22 * 420}" width="${0.22 * 70}" height="${0.22 * 86}" fill="#f0b85a"/>
      <rect x="${NX + 0.22 * 130}" y="${NY - 0.22 * 200}" width="${0.22 * 70}" height="${0.22 * 86}" fill="#f0b85a"/>
      <circle cx="${NX}" cy="${NY - 60}" r="90" fill="#f0b85a" opacity=".2"/>
      ${g(NX + 80, NY - 20, 0.4, generator())}${arcs(NX + 120, NY - 40, t, sp, '#d9d2b0', 1, 0.8)}
      <rect width="1080" height="1920" fill="#000" opacity=".25"/>
      ${eyesS}
      ${kp > 0 ? `<g opacity="${kp}"><path d="M${NX + 40} 1260 L1000 1640" stroke="${P.text}" stroke-width="6" stroke-dasharray="18 14"/>
        <text x="760" y="1420" font-family="Russo One" font-size="72" fill="${P.accent}" transform="rotate(22 760 1420)">3 км</text></g>` : ''}
      ${grass(t, 1925, 30, 70, '#090d0a')}
    </g>`]);
  }
  return parts.map(([o, s]) => `<g opacity="${o}">${s}</g>`).join('');
};

// 7. Совет 6: гуси и собаки — сигнализация
S[7] = (t) => {
  const tAn = W(7, 'животные'), tG = W(7, 'гуси'), tD = W(7, 'собаки'), tN = W(7, 'шум'), tSee = W(7, 'раньше');
  const c = cam(t, [[SEC(7) - 0.3, 540, 1550, 1.15], [tSee - 0.1, 540, 1520, 1.15], [tSee + 0.8, 640, 1200, 1.5], [SECEND(7) + 1, 650, 1190, 1.62]]);
  const noise = pr(t, tN, 0.15);
  const geese = [[230, 1720, 1.15], [410, 1680, 1.0], [130, 1610, 0.9]].map(([x, y, s], i) => {
    const hop = pr(t, tG + i * 0.1, 0.25) * (1 - pr(t, tG + 0.6 + i * 0.1, 0.25));
    const wx = x + Math.sin(t * 0.8 + i * 2) * 40, dirS = Math.cos(t * 0.8 + i * 2) > 0 ? 1 : -1;
    return `<g transform="translate(${wx} ${y - hop * 40}) scale(${dirS * s} ${s})">${goose({ honk: noise > 0 && Math.sin(t * 14 + i) > -0.2 })}</g>${arcs(wx + dirS * 66 * s, y - 112 * s, t + i * 0.3, noise, P.accent, dirS, 0.8)}`;
  }).join('');
  const dh = pr(t, tD, 0.25) * (1 - pr(t, tD + 0.6, 0.25));
  const barkOn = noise > 0 && Math.sin(t * 11) > 0;
  const shadow = pr(t, tSee + 0.4, 1.2);
  return `<g transform="${camT(t, c)}">
    ${bgFarm(1080, 1920, { horizon: 1040 })}
    <rect y="1040" width="1080" height="200" fill="#000" opacity=".35"/>
    <g opacity="${shadow}">${g(660, 1180, 0.62, infectedFar({ lean: 3 }))}${eyes(662, 1123, 1.3, 0.6 + 0.4 * Math.sin(t * 3))}</g>
    ${g(0, 1300, 1, fence(1080))}
    ${geese}
    ${g(760, 1800 - dh * 40, 1.15, dog({ bark: barkOn }))}${arcs(870, 1680, t, noise, P.accent, 1, 1)}
    ${pr(t, tAn, 0.3) > 0 && pr(t, tG, 0.1) < 1 ? '' : ''}
    ${grass(t, 1925, 30, 70)}
  </g>`;
};

// 8. Главное: не открывать ворота; наблюдать издалека; укушенный просит о помощи
S[8] = (t) => {
  const tNo = W(8, 'открывайте'), tNobody = W(8, 'никому'), tWatch = W(8, 'наблюдайте'), tBit = W(8, 'укушенный'), tHelp = W(8, 'помощи');
  const parts = [];
  if (t < tWatch + 0.35) {
    const c = cam(t, [[SEC(8) - 0.3, 540, 1380, 1.2], [tNobody, 540, 1420, 1.45], [tWatch, 540, 1420, 1.5]]);
    const chain = pr(t, tNo + 0.1, 0.6);
    const shake = t > tNobody && t < tNobody + 0.25 ? 14 : 0;
    const links = (x1, y1, x2, y2, p) => { let s = ''; const n = 12; for (let i = 0; i < n * p; i++) { const x = lerp(x1, x2, i / n), y = lerp(y1, y2, i / n); s += `<ellipse cx="${x}" cy="${y}" rx="22" ry="12" fill="none" stroke="#9ea3ab" stroke-width="7" transform="rotate(${(i % 2) * 90 + Math.atan2(y2 - y1, x2 - x1) * 57} ${x} ${y})"/>`; } return s; };
    parts.push([1 - pr(t, tWatch, 0.35), `<g transform="${camT(t, c, shake)}">
      ${bgFarm(1080, 1920, { horizon: 1000 })}
      ${g(0, 1300, 1, fence(1080))}
      ${g(540, 1640, 2.2, gate())}
      ${links(250, 1340, 830, 1560, chain)}${links(830, 1340, 250, 1560, chain)}
      <g transform="translate(540 1460) scale(${1 + 0.15 * pr(t, tNobody, 0.1) * (1 - pr(t, tNobody + 0.2, 0.2))})"><rect x="-60" y="-30" width="120" height="100" rx="14" fill="#c9a43a"/><path d="M-36 -30 V-70 A36 36 0 0 1 36 -70 V-30" stroke="#9ea3ab" stroke-width="16" fill="none"/><circle cy="14" r="12" fill="#3a2e10"/><rect x="-5" y="14" width="10" height="30" fill="#3a2e10"/></g>
      ${grass(t, 1925, 30, 70)}
    </g>`]);
  }
  if (t >= tWatch - 0.05) {
    const c = cam(t, [[tWatch, 540, 1150, 1.3], [tBit - 0.1, 540, 1150, 1.45], [tBit + 0.5, 470, 1150, 2.3], [SECEND(8) + 1, 470, 1150, 2.4]]);
    const wave = Math.sin(t * 6) * 25;
    const flash = t > tHelp + 0.15 && (Math.floor((t - tHelp) * 6) % 3 === 0) ? 1 : 0;
    const SX = 540, SY = 1330, SS = 0.8;
    const stranger = g(SX, SY, SS, farmer({ arm: -150 + wave, jacket: '#4a5670', jacketDark: '#38425a', cap: '#3a3f4a', beard: '#3a3530' }) +
      `<rect x="-54" y="-178" width="24" height="30" rx="4" fill="#e8e2cc"/><circle cx="-42" cy="-162" r="${7 + Math.sin(t * 4) * 1.5}" fill="#a3201a"/>` +
      (flash ? `<circle cx="-12" cy="-286" r="6" fill="${P.zEye}"/><circle cx="12" cy="-286" r="6" fill="${P.zEye}"/>` : ''));
    const scene = `<g transform="${camT(t, c)}">
      ${bgFarm(1080, 1920, { horizon: 980 })}
      ${g(0, 1300, 1, fence(1080))}
      ${stranger}
      ${g(540, 1360, 1.0, gate())}
      ${grass(t, 1925, 30, 70)}
    </g>`;
    const op = pr(t, tWatch - 0.05, 0.35);
    parts.push([op, `<clipPath id="bino"><circle cx="420" cy="960" r="300"/><circle cx="660" cy="960" r="300"/></clipPath>
      <rect width="1080" height="1920" fill="#030407"/>
      <g clip-path="url(#bino)">${scene}</g>
      <circle cx="420" cy="960" r="300" fill="none" stroke="#000" stroke-width="30" opacity=".5"/><circle cx="660" cy="960" r="300" fill="none" stroke="#000" stroke-width="30" opacity=".5"/>`]);
  }
  return parts.map(([o, s]) => `<g opacity="${o}">${s}</g>`).join('');
};

// 9. Финал: месяцы проходят; гуси кричат… и замолкают
S[9] = (t) => {
  const tMon = W(9, 'месяцы'), tNight = W(9, 'однажды'), tScream = W(9, 'закричат'), tThen = W(9, 'потом'), tSilent = W(9, 'замолчат');
  const c = cam(t, [[SEC(9) - 0.3, 540, 1100, 1.0], [tScream - 0.1, 540, 1050, 1.05], [tScream + 0.3, 540, 860, 1.35], [tThen, 540, 860, 1.42], [CARD_START, 540, 760, 1.75]]);
  const mp = pr(t, tMon, tNight - tMon);
  const day = Math.max(1, Math.round(1 + 146 * eout(mp)));
  const moonX = 290 + ((t - SEC(9)) * (mp > 0 && mp < 1 ? 1.4 : 0.05) % 1) * 500;
  const screamOn = pr(t, tScream, 0.1) * (1 - pr(t, tThen - 0.2, 0.05));
  const red = screamOn * (0.5 + 0.5 * Math.sin(t * 18));
  const silence = pr(t, tSilent, 0.6);
  const startle = screamOn > 0 ? Math.abs(Math.sin(t * 20)) * 8 : 0;
  // вид из окна
  let geeseOut = '';
  [[420, 1250], [560, 1270], [690, 1240]].forEach(([x, y], i) => { geeseOut += `<g transform="translate(${x} ${y}) scale(0.5)">${goose({ honk: screamOn > 0 && Math.sin(t * 15 + i) > 0 })}</g>${arcs(x + 30, y - 60, t + i * 0.2, screamOn, P.accent, 1, 0.5)}`; });
  let snow = '';
  if (mp > 0.3 && mp < 0.8) for (let i = 0; i < 30; i++) { const p = (t * 0.4 + rnd(i)) % 1; snow += `<circle cx="${200 + rnd(i + 4) * 700}" cy="${500 + p * 1000}" r="4" fill="#dfe6f0" opacity=".7"/>`; }
  let eyesW = '';
  for (let i = 0; i < 14; i++) eyesW += eyes(330 + rnd(i) * 420, 1080 + rnd(i + 3) * 260, 1 + rnd(i + 5), pr(t, tSilent + 0.3 + i * 0.07, 0.4));
  const outside = `${bgFarm(1080, 1920, { horizon: 1150 })}${snow}<circle cx="${moonX}" cy="560" r="36" fill="#d8d3c0" opacity=".9"/>
    ${g(0, 1300, 0.9, fence(1080))}${geeseOut}
    <rect width="1080" height="1920" fill="#000" opacity="${0.85 * silence}"/>${eyesW}`;
  return `<g transform="${camT(t, c, startle)}">
    <rect width="1080" height="1920" fill="#10141d"/>
    ${Array.from({ length: 22 }, (_, i) => `<rect x="${i * 50}" y="0" width="48" height="1920" fill="${i % 2 ? '#141925' : '#121722'}"/>`).join('')}
    <svg x="290" y="420" width="500" height="620" viewBox="290 420 500 620" overflow="hidden"><g transform="translate(540 730) scale(.62) translate(-540 -1000)">${outside}</g></svg>
    <path d="M540 420 V1040 M290 730 H790" stroke="#2b3343" stroke-width="18"/>
    <rect x="270" y="400" width="540" height="660" fill="none" stroke="#2b3343" stroke-width="30"/>
    <rect x="240" y="1060" width="600" height="30" fill="#232a38"/>
    <g transform="translate(900 820)"><rect x="-90" y="-110" width="180" height="210" rx="10" fill="#d9d3c4"/><rect x="-90" y="-110" width="180" height="50" rx="10" fill="#8a2a1f"/>
      <text y="-72" text-anchor="middle" font-family="Rubik" font-weight="800" font-size="30" fill="#f2efe6">ДЕНЬ</text>
      <text y="50" text-anchor="middle" font-family="Russo One" font-size="${day > 99 ? 76 : 92}" fill="#1b1f2a">${day}</text></g>
    <rect x="0" y="1500" width="1080" height="420" fill="#1a1612"/>
    <rect x="640" y="1460" width="340" height="120" rx="12" fill="#2a3346"/><rect x="660" y="1420" width="120" height="60" rx="20" fill="#cfcabb" opacity=".6"/>
    ${g(330, 1640 - startle, 1.6, farmer())}
    <rect width="1080" height="1920" fill="#b01818" opacity="${0.22 * red}"/>
    <rect width="1080" height="1920" fill="#000" opacity="${0.45 * silence}"/>
  </g>`;
};

// ---------- атмосфера поверх сцены ----------
function ambient(t, outdoor) {
  let s = '';
  if (outdoor) for (let i = 0; i < 4; i++) {
    const x = ((t * (14 + i * 6) + i * 400) % 1700) - 300;
    s += `<ellipse cx="${x}" cy="${1250 + i * 160}" rx="${420 + i * 60}" ry="70" fill="#8c9bb0" opacity=".05"/>`;
  }
  for (let i = 0; i < 36; i++) {
    const p = (t * (0.03 + rnd(i) * 0.04) + rnd(i + 1)) % 1;
    s += `<circle cx="${(rnd(i + 2) * 1080 + Math.sin(t * 0.8 + i) * 30 + p * 120) % 1080}" cy="${p * 1920}" r="${1.5 + rnd(i + 3) * 2.5}" fill="#c9b8a6" opacity="${0.18 + rnd(i + 4) * 0.2}"/>`;
  }
  return s + `<rect width="1080" height="1920" fill="url(#vign)"/>`;
}

const DEFS = `<defs>
  <radialGradient id="vign" cx=".5" cy=".46" r=".78"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".72"/></radialGradient>
  <linearGradient id="cityG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0a14"/><stop offset=".6" stop-color="#3a1814"/><stop offset="1" stop-color="#c2502a"/></linearGradient>
  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>`;

// ---------- субтитры ----------
const KEY_ORANGE = new Set(['зомби-апокалипсис', 'ферме', 'оставайтесь', 'опаснее', 'вода', 'еда', 'расстояние', 'ворота', 'скот', 'колодец', 'важнее', 'трех', 'дней', 'еду', 'порции', 'один', 'дом', 'заколотите', 'втором', 'света', 'генератора', 'километры', 'животные', 'гуси', 'собаки', 'шум', 'открывайте', 'никому', 'издалека', 'месяцы', 'закричат', 'главное']);
const KEY_GREEN = new Set(['заражённых', 'заражённые', 'зараженных', 'зараженные', 'укушенный', 'толпу', 'замолчат']);
const CHUNKS = (() => {
  const out = [];
  let cur = [];
  WORDS.forEach((w, i) => {
    const prev = cur[cur.length - 1];
    const len = cur.reduce((a, x) => a + x.w.length + 1, 0);
    if (cur.length && (cur.length >= 3 || len + w.w.length > 22 || /[.,:!?]$/.test(prev.w) || prev.sec !== w.sec)) { out.push(cur); cur = []; }
    cur.push(w);
  });
  if (cur.length) out.push(cur);
  return out.map((ws, i) => ({ ws, s: ws[0].s, e: i < out.length - 1 ? Math.min(out[i + 1][0].s, ws[ws.length - 1].e + 0.9) : ws[ws.length - 1].e + 0.7 }));
})();

function subsHTML(t) {
  const ch = CHUNKS.find((c) => t >= c.s - 0.02 && t < c.e);
  if (!ch) return '';
  return ch.ws.map((w) => {
    const n = norm(w.w);
    const col = KEY_GREEN.has(n) || KEY_GREEN.has(n.replace(/е/g, 'ё')) ? P.accentGreen : KEY_ORANGE.has(n) ? P.accent : '#ffffff';
    const p = pr(t, w.s - 0.03, 0.12);
    const active = t >= w.s && t < w.e + 0.05;
    const sc = p <= 0 ? 0.6 : lerp(0.6, 1, back(p)) * (active ? 1.08 : 1);
    return `<span style="color:${col};opacity:${p > 0 ? 1 : 0};transform:scale(${sc})">${w.w.replace(/</g, '')}</span>`;
  }).join(' ');
}

// ---------- номер совета ----------
const TIPS = { 2: '1', 3: '2', 4: '3', 5: '4', 6: '5', 7: '6', 8: '!' };
function badgeHTML(t, si) {
  if (!(si in TIPS)) return '';
  const t0 = SEC(si), p = pr(t, t0 - 0.05, 0.35);
  const outP = si < 9 ? 1 - pr(t, SEC(si + 1) - 0.4, 0.3) : 1;
  if (p <= 0) return '';
  const sc = lerp(1.9, 1, eout(p));
  const label = si === 8 ? 'ГЛАВНОЕ' : 'СОВЕТ';
  const ring = pr(t, t0 + 0.2, 0.5);
  return `<div class="badge" style="opacity:${clamp(p * 2) * outP};transform:translateX(-50%) scale(${sc})">
    <div class="ring" style="opacity:${(1 - ring) * 0.8};transform:translate(-50%,-50%) scale(${0.6 + ring * 1.4})"></div>
    <div class="lbl">${label}</div><div class="num">${TIPS[si]}</div></div>`;
}

// ---------- финальная карточка ----------
function cardHTML(t) {
  const p = pr(t, CARD_START, 0.45);
  if (p <= 0) return '';
  const pulse = 1 + 0.025 * Math.sin((t - CARD_START) * 4);
  const p2 = pr(t, CARD_START + 0.35, 0.5);
  return `<div class="card" style="opacity:${p}">
    <div class="cglow" style="opacity:${0.5 + 0.2 * Math.sin(t * 3)}"></div>
    <div class="ctext" style="transform:translateY(${(1 - eout(p)) * 40}px)">Больше таких анимаций<br>в Telegram-канале</div>
    <div class="chandle" style="opacity:${p2};transform:scale(${lerp(0.85, 1, eout(p2)) * pulse})">@Claude306</div>
  </div>`;
}

// ---------- главный рендер ----------
function sceneAt(t) {
  let si = 0;
  for (let i = 0; i < NSEC; i++) if (t >= SEC(i) - 0.25) si = i;
  return si;
}
function render(t) {
  const si = sceneAt(t);
  const start = SEC(si) - 0.25;
  let svg = DEFS;
  if (si > 0 && t < start + 0.35) svg += S[si - 1](t);
  const op = si > 0 ? pr(t, start, 0.35) : pr(t, 0, 0.3);
  svg += `<g opacity="${op}">${S[si](t)}</g>`;
  svg += ambient(t, ![4, 9].includes(si));
  document.getElementById('scene').innerHTML = svg;
  document.getElementById('badge').innerHTML = badgeHTML(t, si);
  document.getElementById('subs').innerHTML = t < CARD_START ? subsHTML(t) : '';
  document.getElementById('card').innerHTML = cardHTML(t);
  // шрифт «Канала» на всю ширину
  const h = document.querySelector('.chandle');
  if (h && !h.dataset.fit) {
    h.style.fontSize = '200px';
    const w = h.scrollWidth;
    h.style.fontSize = Math.floor(200 * 1000 / w) + 'px';
    h.dataset.fit = 1;
    window.__fit = h.style.fontSize;
  } else if (h && window.__fit) h.style.fontSize = window.__fit;
}
window.render = render;

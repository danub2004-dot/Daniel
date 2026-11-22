// СТРАННЫЙ СИГНАЛ · серия 2 — новая графика поверх ../../episode01/art/art.js
// Салон автобуса, кабина водителя, вид из дверей, документ с правилами, карточка правила.

// Тёма-варианты
const temaBare = o => tema(o).replace(/#c9ccd4/g, P.skin).replace(/#7b7f8a/g, P.skinSh);   // босиком
const temaGrin = s => s.replace('M-6,-234 Q0,-230 6,-234', 'M-15,-238 Q0,-220 15,-238');      // слишком широкая улыбка
const temaShadow = o => tema(o).replace(/fill="#[0-9a-fA-F]{6}"/g, 'fill="#04060b"').replace(/fill="url\([^)]*\)"/g, 'fill="none"');
const kidEyes = (k = 1) => `<circle cx="-12" cy="-254" r="5" fill="${P.cyan}" opacity="${k}"/><circle cx="12" cy="-254" r="5" fill="${P.cyan}" opacity="${k}"/>
  <circle cx="0" cy="-254" r="40" fill="url(#gCyan)" opacity="${0.5 * k}"/>`;

// ───────────────────────── САЛОН (вид от кабины назад, сиденья лицом к нам)
// q.occ(row, side) → { body, glow } — кто сидит; координаты «ближнего плана», сиденье: x центр, подушка y=1400
const SAL_V = [540, 880], SAL_KB = 0.37;
const salK = d => 1 - (1 - SAL_KB) * d;
const salPr = (x, y, d) => { const k = salK(d); return [SAL_V[0] + (x - SAL_V[0]) * k, SAL_V[1] + (y - SAL_V[1]) * k]; };
const salG = (d, inner) => { const k = salK(d); return `<g transform="translate(${SAL_V[0] * (1 - k)} ${SAL_V[1] * (1 - k)}) scale(${k})">${inner}</g>`; };
const quad = (pts, fill, extra = '') => `<polygon points="${pts.map(p => p.join(',')).join(' ')}" fill="${fill}" ${extra}/>`;

function bgSalon(p = {}) {
  const q = Object.assign({ lights: 0.12, occ: null, t: 0, outside: 1 }, p);
  const L = q.lights;
  let s = `<rect width="1080" height="1920" fill="#0b0e17"/>`;
  const b0 = salPr(0, 0, 1), b1 = salPr(1080, 1920, 1);
  s += quad([[0, 0], [1080, 0], [b1[0], b0[1]], [b0[0], b0[1]]], '#121620');
  s += quad([[0, 1920], [1080, 1920], [b1[0], b1[1]], [b0[0], b1[1]]], '#171b25');
  s += quad([[0, 0], b0, [b0[0], b1[1]], [0, 1920]], '#10141d');
  s += quad([[1080, 0], [b1[0], b0[1]], b1, [1080, 1920]], '#10141d');
  // проход — резиновая дорожка
  s += quad([salPr(420, 1920, 0), salPr(660, 1920, 0), salPr(660, 1920, 1), salPr(420, 1920, 1)], '#1f2430');
  for (let i = 1; i < 12; i++) { const d = i / 12; s += quad([salPr(420, 1920, d), salPr(660, 1920, d), salPr(660, 1900, d + 0.01), salPr(420, 1900, d + 0.01)], '#000', 'opacity=".25"'); }
  // задняя стенка + заднее окно
  s += `<rect x="${b0[0]}" y="${b0[1]}" width="${b1[0] - b0[0]}" height="${b1[1] - b0[1]}" fill="#0e121b"/>`;
  const w0 = salPr(110, 330, 1), w1 = salPr(970, 1000, 1);
  s += `<rect x="${w0[0]}" y="${w0[1]}" width="${w1[0] - w0[0]}" height="${w1[1] - w0[1]}" fill="url(#gSkyHwy)" opacity="${0.5 + 0.5 * q.outside}"/>`;
  // боковые окна с пролетающими фонарями
  for (let i = 0; i < 5; i++) {
    const d1 = 0.04 + i * 0.19, d2 = d1 + 0.15;
    [[0, 1], [1080, -1]].forEach(([x, sg], side) => {
      s += quad([salPr(x, 330, d1), salPr(x, 330, d2), salPr(x, 960, d2), salPr(x, 960, d1)], '#141c30');
      const ph = ((q.t * 0.7 + i * 0.37 + side * 0.5) % 1);
      if (q.outside > 0 && ph < 0.3) { const d = d1 + (d2 - d1) * (ph / 0.3); const c = salPr(x, 620, d); s += `<circle cx="${c[0]}" cy="${c[1]}" r="${90 * salK(d)}" fill="url(#gAmber)" opacity="${0.7 * q.outside}"/>`; }
    });
  }
  // поручни на потолке
  [380, 700].forEach(x => { s += `<line x1="${salPr(x, 140, 0)[0]}" y1="${salPr(x, 140, 0)[1]}" x2="${salPr(x, 140, 1)[0]}" y2="${salPr(x, 140, 1)[1]}" stroke="${P.amberDim}" stroke-width="10"/>`; });
  // плафоны
  for (let i = 0; i < 6; i++) { const d1 = 0.05 + i * 0.16, d2 = d1 + 0.08; s += quad([salPr(470, 30, d1), salPr(610, 30, d1), salPr(610, 30, d2), salPr(470, 30, d2)], L > 0.5 ? '#fff2d0' : '#2a2c35', `opacity="${0.4 + 0.6 * L}"`); }
  // сиденья: дальние первыми
  const rows = [0.08, 0.26, 0.44, 0.62, 0.8];
  const glow = [];
  const seat = (d, x0, x1, row, side) => {
    s += salG(d + 0.04, `<rect x="${x0}" y="980" width="${x1 - x0}" height="440" rx="40" fill="#3a2230"/><rect x="${x0 + 20}" y="1000" width="${x1 - x0 - 40}" height="60" rx="20" fill="#4a2c3c"/><rect x="${x0}" y="960" width="${x1 - x0}" height="26" rx="12" fill="${P.amberDim}"/>`);
    if (q.occ) { const o = q.occ(row, side, (x0 + x1) / 2); if (o) { s += salG(d + 0.02, o.body || ''); if (o.glow) glow.push(salG(d + 0.02, o.glow)); } }
    s += salG(d, `<rect x="${x0}" y="1400" width="${x1 - x0}" height="150" rx="26" fill="#2c1824"/><rect x="${x0}" y="1400" width="${x1 - x0}" height="30" rx="14" fill="#4a2c3c"/><rect x="${(x0 + x1) / 2 - 12}" y="1550" width="24" height="370" fill="#0c0f16"/>`);
  };
  seat(0.93, 60, 1020, 5, 0);   // задний диван
  for (let r = rows.length - 1; r >= 0; r--) { seat(rows[r], 30, 390, r, 0); seat(rows[r], 690, 1050, r, 1); }
  s += `<rect width="1080" height="1920" fill="#000" opacity="${(1 - L) * 0.6}"/>`;
  if (L > 0.5) s += `<rect width="1080" height="1920" fill="#ffe9b8" opacity="${(L - 0.5) * 0.12}"/>`;
  return s + glow.join('');
}
// сидящий человек на месте x (ближний план)
const sitTema = (x, inner, sc = 2.0) => `<g transform="translate(${x} ${1400 + 112 * sc}) scale(${sc})">${inner}</g>`;
function sitNeighbor(x, v, glow = 1) {
  const H = [410, 370, 440, 380, 330][v % 5], sc = 2.1;
  return `<g transform="translate(${x} ${1400 + 0.45 * H * sc}) scale(${sc})">${neighbor(v, { glow, half: true })}</g>`;
}

// ───────────────────────── КАБИНА: Марк со спины, лобовое, зеркало заднего вида
function bgCab(p = {}) {
  const q = Object.assign({ t: 0, speed: 1, clock: '23:41', blink: 1, door: 0, mirror: {}, mirrorDark: 0, lamps: 1 }, p);
  const t = q.t;
  let s = `<rect width="1080" height="1920" fill="url(#gSkyHwy)"/>`;
  let seed = 5; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 40; i++) s += `<circle cx="${rnd() * 1080}" cy="${150 + rnd() * 450}" r="${rnd() * 1.6 + 0.4}" fill="#cfd6ff" opacity="${rnd() * 0.5}"/>`;
  s += `<rect y="640" width="1080" height="500" fill="#0c0e15"/><polygon points="530,640 550,640 1060,1140 20,1140" fill="#181b24"/>`;
  for (let i = 0; i < 8; i++) {
    const ph = (i / 8 + t * 0.55 * q.speed) % 1, tt = ph * ph;
    const y = 640 + 500 * tt, w = 2 + 18 * tt, h = 4 + 60 * tt;
    s += `<rect x="${540 - w / 2}" y="${y}" width="${w}" height="${h}" fill="${P.amber}" opacity=".55"/>`;
  }
  for (let i = 0; i < 3; i++) {
    const ph = (i / 3 + t * 0.35 * q.speed) % 1, tt = ph * ph;
    [-1, 1].forEach(sg => {
      const x = 540 + sg * (30 + 760 * tt), yb = 640 + 520 * tt, h = 20 + 900 * tt;
      s += `<rect x="${x - 2 - 6 * tt}" y="${yb - h}" width="${4 + 12 * tt}" height="${h}" fill="#05060b"/>
        <circle cx="${x - sg * 40 * tt}" cy="${yb - h}" r="${10 + 160 * tt}" fill="url(#gAmber)" opacity="${q.lamps}"/>`;
    });
  }
  // рама кабины (всё, кроме лобового)
  s += `<path fill-rule="evenodd" fill="#06080d" d="M0,0 H1080 V1920 H0Z M70,170 Q540,130 1010,170 L1050,1110 Q540,1080 30,1110Z"/>`;
  s += `<path d="M70,170 Q540,130 1010,170" stroke="#1a1f2b" stroke-width="14" fill="none"/>`;
  s += `<rect x="530" y="170" width="20" height="60" fill="#0b0d14"/>`;
  // зеркало заднего вида
  const mx = 380, my = 220, mw = 320, mh = 140;
  s += `<clipPath id="mirClip"><rect x="${mx}" y="${my}" width="${mw}" height="${mh}" rx="22"/></clipPath>
    <rect x="${mx - 10}" y="${my - 10}" width="${mw + 20}" height="${mh + 20}" rx="30" fill="#0b0d14"/>
    <g clip-path="url(#mirClip)"><g transform="translate(${mx + mw + 2} ${my + 70 - 264}) scale(-0.3 0.3)">${bgSalon(Object.assign({ t }, q.mirror))}</g>
    <rect x="${mx}" y="${my}" width="${mw}" height="${mh}" fill="#000" opacity="${q.mirrorDark}"/>
    <path d="M${mx + 30},${my + mh} L${mx + 120},${my}" stroke="#fff" stroke-width="16" opacity=".05"/></g>`;
  // приборная панель
  s += `<path d="M0,1130 Q540,1060 1080,1130 V1920 H0Z" fill="#10141e"/><path d="M0,1130 Q540,1060 1080,1130" stroke="#232a3a" stroke-width="6" fill="none"/>`;
  [[250, 1230], [830, 1230]].forEach(([x, y], i) => {
    const a = -120 + (i ? 60 : 140) + Math.sin(t * 3 + i) * 4;
    s += `<circle cx="${x}" cy="${y}" r="78" fill="#0a0d15" stroke="#2a3245" stroke-width="6"/>
      <line x1="${x}" y1="${y}" x2="${x + 60 * Math.cos(a * Math.PI / 180)}" y2="${y + 60 * Math.sin(a * Math.PI / 180)}" stroke="${P.amber}" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${x}" cy="${y}" r="78" fill="url(#gAmber)" opacity=".12"/>`;
  });
  s += `<rect x="420" y="1170" width="240" height="84" rx="12" fill="#06080d" stroke="#232a3a" stroke-width="4"/>
    <text x="540" y="1232" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="58" fill="${q.clock === '00:00' ? P.red : P.amber}" opacity="${q.blink}">${q.clock}</text>`;
  // индикатор дверей
  s += `<g transform="translate(470 1280)" opacity="${0.25 + 0.75 * q.door}"><rect width="140" height="54" rx="10" fill="#06080d" stroke="${q.door > 0.5 ? P.red : '#232a3a'}" stroke-width="4"/>
    <rect x="22" y="12" width="40" height="30" fill="none" stroke="${q.door > 0.5 ? P.red : '#3a4052'}" stroke-width="4"/><rect x="78" y="12" width="40" height="30" fill="none" stroke="${q.door > 0.5 ? P.red : '#3a4052'}" stroke-width="4"/>
    <text x="70" y="-12" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="22" fill="${q.door > 0.5 ? P.red : '#3a4052'}">ДВЕРИ</text></g>`;
  if (q.door > 0.5) s += `<circle cx="540" cy="1307" r="120" fill="url(#gRed)" opacity="${0.5 * q.door}"/>`;
  // руль
  s += `<rect x="520" y="1520" width="40" height="400" fill="#07090e"/>
    <ellipse cx="540" cy="1560" rx="360" ry="120" fill="none" stroke="#07090e" stroke-width="40"/>
    <ellipse cx="540" cy="1550" rx="360" ry="120" fill="none" stroke="#1d2230" stroke-width="6"/>`;
  // Марк со спины
  s += at(540, 2400, 2.3, mark({ back: true, armL: [40, 0], armR: [-40, 0] }));
  return s;
}

// ───────────────────────── ВИД ИЗ ПЕРЕДНЕЙ ДВЕРИ: дом, у подъезда стоит Тёма
function bgDoor(p = {}) {
  const q = Object.assign({ open: 0, tema: null, lamp: 1 }, p);
  let s = bgHouse({ neighbors: false, door: 1, lamp: q.lamp });
  if (q.tema) s += q.tema;
  // салон вокруг дверного проёма
  s += `<path fill-rule="evenodd" fill="#090b12" d="M0,0 H1080 V1920 H0Z M150,250 H930 V1770 H150Z"/>`;
  s += `<rect x="150" y="1770" width="780" height="150" fill="#1a1f2b"/><rect x="150" y="1770" width="780" height="14" fill="${P.amber}" opacity=".7"/>`;
  s += `<rect x="100" y="200" width="22" height="1720" rx="10" fill="#c9a23a"/><rect x="958" y="200" width="22" height="1720" rx="10" fill="#c9a23a"/>`;
  // складные створки
  const pw = 390 * (1 - 0.92 * ease(q.open));
  const panel = (x, w) => `<rect x="${x}" y="260" width="${w}" height="1500" fill="#9fc6e0" opacity=".10"/>
    <rect x="${x}" y="260" width="${w}" height="1500" fill="none" stroke="#1a1f2b" stroke-width="22"/>
    <rect x="${x}" y="980" width="${w}" height="30" fill="#1a1f2b"/><path d="M${x + w * 0.2},300 L${x + w * 0.6},900" stroke="#fff" stroke-width="18" opacity=".05"/>`;
  s += panel(150, pw / 2) + panel(150 + pw / 2, pw / 2) + panel(930 - pw, pw / 2) + panel(930 - pw / 2, pw / 2);
  return s;
}
const TEMA_AT_DOOR = [800, 1512, 1.25];

// ───────────────────────── ДОКУМЕНТ С ПРАВИЛАМИ на экране телефона
function rulesScreen(p = {}) {
  const q = Object.assign({ file: 1, open: 0, sub: 0, battery: 14, time: '07:12' }, p);
  let s = phoneScreen({ msgs: [], battery: q.battery, title: 'Загрузки' }).replace('02:47', q.time).replace('>?<', '>↓<');
  const fk = ease(q.file);
  s += `<g opacity="${fk}" transform="translate(0 ${20 * (1 - fk)})"><rect x="24" y="170" width="372" height="104" rx="18" fill="#1c2534"/>
    <rect x="44" y="188" width="54" height="68" rx="6" fill="${P.red}"/><text x="71" y="230" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="18" fill="#fff">DOC</text>
    <text x="116" y="216" font-family="Inter Display" font-weight="800" font-size="24" fill="#e6ecf3">pravila_7.doc</text>
    <text x="116" y="248" font-family="Inter Display" font-weight="600" font-size="20" fill="#7d8aa0">сегодня, 03:00 · новый</text></g>`;
  const ok = ease(q.open);
  if (ok > 0) {
    s += `<g opacity="${ok}"><rect x="24" y="296" width="372" height="540" rx="10" fill="#e4ddcb"/>
      <text x="210" y="360" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="38" fill="#a8261f">ПРАВИЛА</text>
      <text x="210" y="398" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="21" fill="#2a2420">для водителя маршрута № 7</text>
      <text x="210" y="434" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="24" fill="#2a2420" opacity="${ease(q.sub)}">НОЧНАЯ СМЕНА</text>
      <line x1="60" y1="458" x2="360" y2="458" stroke="#2a2420" stroke-width="2"/>
      ${[0, 1, 2, 3].map(i => `<text x="54" y="${510 + i * 76}" font-family="Inter Display" font-weight="900" font-size="26" fill="#a8261f">${i + 1}.</text>
        <rect x="92" y="${494 + i * 76}" width="${260 - i * 30}" height="12" rx="6" fill="#2a2420" opacity=".55"/><rect x="92" y="${516 + i * 76}" width="${200 + i * 15}" height="12" rx="6" fill="#2a2420" opacity=".35"/>`).join('')}</g>`;
  }
  return s;
}

// ───────────────────────── КАРТОЧКА ПРАВИЛА (лист под красной лампой)
// lines: [[текст, t0], ...]
function ruleCard(n, lines, t, t0) {
  let s = `<rect width="1080" height="1920" fill="#07080d"/><circle cx="540" cy="820" r="900" fill="url(#gRed)" opacity="${0.22 + 0.06 * Math.sin(t * 9)}"/>`;
  const k = ease((t - t0) / 0.35);
  let inner = `<rect x="-430" y="-560" width="860" height="1120" rx="6" fill="#ddd5c1"/>
    <rect x="-430" y="-560" width="860" height="1120" rx="6" fill="url(#gPaper)"/>
    <rect x="-90" y="-590" width="180" height="56" fill="#cfc19a" opacity=".85" transform="rotate(-3)"/>
    <text x="0" y="-410" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="66" fill="#a8261f" letter-spacing="3">ПРАВИЛО № ${n}</text>
    <line x1="-340" y1="-360" x2="340" y2="-360" stroke="#2a2420" stroke-width="4"/>`;
  let y = -240;
  lines.forEach(([txt, tt]) => {
    const wl = wrapText(txt, 18), o = ease((t - tt + 0.05) / 0.25);
    wl.forEach(l => { inner += `<text x="-350" y="${y}" font-family="Inter Display" font-weight="800" font-size="66" fill="#1d1916" opacity="${o}">${l}</text>`; y += 86; });
    y += 40;
  });
  s += `<g transform="translate(540 ${880 + 60 * (1 - k)}) rotate(${-2.5 + 1.5 * (1 - k)})" opacity="${k}">${inner}</g>`;
  return s;
}
const ART2_DEFS = `<defs><radialGradient id="gPaper" cx=".5" cy=".45" r=".7"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3a2a1a" stop-opacity=".45"/></radialGradient></defs>`;

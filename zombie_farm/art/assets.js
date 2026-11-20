// Библиотека персонажей и объектов. Всё — плоский 2D в SVG, одна палитра.
// Каждая функция возвращает строку <g>…</g>. Точка (0,0) — у ног / у основания объекта.

const P = {
  sky0: '#070b16', sky1: '#111a2e', sky2: '#1f2a45',
  glow: '#e0612f', glowSoft: '#8a3a1e', glowDeep: '#4a2218',
  ground: '#141b17', ground2: '#1b2420', field: '#20291f',
  wood: '#6b5137', woodDark: '#4a3826', woodLight: '#8a6a45',
  stone: '#565c66', stoneDark: '#3c414a',
  wall: '#3a4456', wallDark: '#2b3343', roof: '#22262f',
  window: '#0c1018',
  skin: '#d9a57a', skinShade: '#b7845c',
  jacket: '#5b6b3e', jacketDark: '#46542f', jeans: '#2f3d56', cap: '#8a3b2a', boot: '#1d1a17',
  zSkin: '#7d8f6e', zSkinDark: '#5f6f53', zCloth: '#3b3f4a', zCloth2: '#4b3a3a', zEye: '#c6ff4d',
  goose: '#e6e3d8', gooseShade: '#bdb9ab', beak: '#e08a2a',
  dog: '#6b4a32', dogDark: '#3f2b1d',
  cow: '#d8d4c8', cowSpot: '#22232a',
  gen: '#a88a37', genDark: '#6e5a22',
  accent: '#ff7a2f', accentGreen: '#c6ff4d', text: '#f2efe6'
};

// ---------- ФЕРМЕР (главный герой) ----------
function farmer(o = {}) {
  const arm = o.arm || 0; // поворот правой руки, градусы
  return `<g class="farmer">
    <ellipse cx="0" cy="2" rx="46" ry="8" fill="#000" opacity=".35"/>
    <!-- ноги -->
    <rect x="-26" y="-120" width="22" height="112" rx="6" fill="${P.jeans}"/>
    <rect x="4" y="-120" width="22" height="112" rx="6" fill="${P.jeans}"/>
    <rect x="-30" y="-14" width="30" height="16" rx="6" fill="${P.boot}"/>
    <rect x="2" y="-14" width="30" height="16" rx="6" fill="${P.boot}"/>
    <!-- левая рука -->
    <rect x="-52" y="-222" width="20" height="98" rx="10" fill="${P.jacketDark}"/>
    <circle cx="-42" cy="-122" r="11" fill="${P.skin}"/>
    <!-- куртка -->
    <path d="M-40 -230 Q0 -246 40 -230 L44 -112 L-44 -112 Z" fill="${P.jacket}"/>
    <rect x="-3" y="-232" width="6" height="120" fill="${P.jacketDark}"/>
    <rect x="-34" y="-180" width="22" height="16" rx="3" fill="${P.jacketDark}"/>
    <rect x="12" y="-180" width="22" height="16" rx="3" fill="${P.jacketDark}"/>
    <!-- правая рука -->
    <g transform="rotate(${arm} 42 -218)">
      <rect x="32" y="-222" width="20" height="98" rx="10" fill="${P.jacketDark}"/>
      <circle cx="42" cy="-122" r="11" fill="${P.skin}"/>
    </g>
    <!-- шея и голова -->
    <rect x="-10" y="-252" width="20" height="18" fill="${P.skinShade}"/>
    <circle cx="0" cy="-282" r="36" fill="${P.skin}"/>
    <path d="M-30 -270 Q-28 -238 0 -236 Q28 -238 30 -270 Q20 -256 0 -256 Q-20 -256 -30 -270Z" fill="#5a4030"/>
    <circle cx="-12" cy="-286" r="4" fill="#1a1410"/>
    <circle cx="12" cy="-286" r="4" fill="#1a1410"/>
    <path d="M-20 -297 L-5 -294 M5 -294 L20 -297" stroke="#3a2a20" stroke-width="4" stroke-linecap="round"/>
    <!-- кепка -->
    <path d="M-37 -292 Q-36 -326 0 -328 Q36 -326 37 -292 Z" fill="${P.cap}"/>
    <path d="M-6 -296 L54 -294 Q50 -284 -6 -288 Z" fill="#6e2e21"/>
  </g>`;
}

// ---------- ЗАРАЖЁННЫЙ (вблизи) ----------
function infected(o = {}) {
  const v = o.variant || 0;
  const cloth = v ? P.zCloth2 : P.zCloth;
  return `<g class="infected">
    <ellipse cx="0" cy="2" rx="44" ry="8" fill="#000" opacity=".35"/>
    <path d="M-24 -116 L-30 -4 L-8 -4 L-4 -112 Z" fill="#262a33"/>
    <path d="M6 -116 L16 -4 L36 -4 L24 -112 Z" fill="#262a33"/>
    <rect x="-34" y="-8" width="28" height="10" rx="4" fill="${P.zSkinDark}"/>
    <rect x="14" y="-8" width="28" height="10" rx="4" fill="${P.zSkinDark}"/>
    <!-- туловище, сутулое -->
    <path d="M-36 -214 Q6 -236 44 -206 L36 -110 L-38 -110 Z" fill="${cloth}"/>
    <path d="M-38 -130 L-30 -110 L-20 -128 L-8 -110 L4 -126 L16 -110 L28 -128 L36 -110 L-38 -110Z" fill="${cloth}"/>
    <path d="M-10 -190 L4 -172 L-6 -160" stroke="#24262d" stroke-width="4" fill="none"/>
    <!-- руки вперёд -->
    <path d="M24 -204 L104 -190 L104 -172 L22 -182 Z" fill="${cloth}"/>
    <path d="M-20 -200 L86 -170 L84 -152 L-24 -178 Z" fill="${cloth}" opacity=".85"/>
    <circle cx="112" cy="-181" r="12" fill="${P.zSkin}"/>
    <circle cx="92" cy="-160" r="11" fill="${P.zSkinDark}"/>
    <!-- голова, наклонена -->
    <g transform="rotate(14 20 -250)">
      <rect x="10" y="-238" width="18" height="20" fill="${P.zSkinDark}"/>
      <circle cx="22" cy="-262" r="34" fill="${P.zSkin}"/>
      <path d="M-8 -276 Q4 -300 30 -298 Q50 -294 54 -270 Q40 -286 22 -284 Q4 -282 -8 -276Z" fill="#2c3027"/>
      <circle cx="12" cy="-262" r="6" fill="${P.zEye}"/>
      <circle cx="36" cy="-262" r="6" fill="${P.zEye}"/>
      <path d="M8 -242 L14 -246 L20 -242 L26 -246 L32 -242" stroke="#2a2a22" stroke-width="3" fill="none"/>
    </g>
  </g>`;
}

// ---------- ЗАРАЖЁННЫЙ (силуэт вдали) ----------
function infectedFar(o = {}) {
  const lean = o.lean || 0;
  return `<g class="infected-far" transform="skewX(${lean})">
    <path d="M-10 0 L-8 -40 L-14 -78 Q-4 -90 10 -80 L14 -40 L12 0 L4 0 L2 -36 L-2 0 Z" fill="#06080d"/>
    <path d="M6 -76 L34 -68 L34 -63 L6 -68 Z" fill="#06080d"/>
    <circle cx="4" cy="-92" r="12" fill="#06080d"/>
    <circle cx="1" cy="-93" r="2.2" fill="${P.zEye}"/>
    <circle cx="9" cy="-93" r="2.2" fill="${P.zEye}"/>
  </g>`;
}

// ---------- ГУСЬ ----------
function goose(o = {}) {
  const honk = o.honk;
  return `<g class="goose">
    <ellipse cx="0" cy="2" rx="40" ry="6" fill="#000" opacity=".3"/>
    <path d="M-10 -8 L-12 0 M8 -8 L6 0" stroke="${P.beak}" stroke-width="5" stroke-linecap="round"/>
    <path d="M-48 -40 Q-44 -12 -6 -8 Q30 -6 36 -34 Q30 -58 -8 -56 Q-36 -56 -48 -40 Z" fill="${P.goose}"/>
    <path d="M-50 -42 L-66 -50 L-58 -34 Z" fill="${P.gooseShade}"/>
    <path d="M-30 -36 Q-8 -22 18 -34" stroke="${P.gooseShade}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M18 -50 Q28 -82 28 -104 L42 -104 Q42 -80 34 -46 Z" fill="${P.goose}"/>
    <circle cx="36" cy="-110" r="13" fill="${P.goose}"/>
    ${honk
      ? `<path d="M46 -116 L66 -122 L50 -110 Z M46 -106 L64 -98 L48 -103Z" fill="${P.beak}"/>`
      : `<path d="M46 -114 L66 -108 L46 -102 Z" fill="${P.beak}"/>`}
    <circle cx="38" cy="-113" r="2.6" fill="#111"/>
  </g>`;
}

// ---------- СОБАКА ----------
function dog(o = {}) {
  const bark = o.bark;
  return `<g class="dog">
    <ellipse cx="0" cy="2" rx="56" ry="7" fill="#000" opacity=".3"/>
    <rect x="-44" y="-44" width="12" height="44" rx="5" fill="${P.dogDark}"/>
    <rect x="-26" y="-44" width="12" height="44" rx="5" fill="${P.dog}"/>
    <rect x="22" y="-44" width="12" height="44" rx="5" fill="${P.dogDark}"/>
    <rect x="38" y="-44" width="12" height="44" rx="5" fill="${P.dog}"/>
    <rect x="-50" y="-80" width="104" height="44" rx="20" fill="${P.dog}"/>
    <path d="M-48 -70 Q-74 -86 -70 -110" stroke="${P.dog}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <rect x="34" y="-108" width="22" height="36" rx="8" fill="${P.dog}"/>
    <rect x="34" y="-128" width="46" height="36" rx="14" fill="${P.dog}"/>
    <rect x="62" y="-${bark ? 106 : 112}" width="30" height="${bark ? 12 : 18}" rx="7" fill="${P.dogDark}"/>
    ${bark ? `<rect x="64" y="-94" width="24" height="8" rx="4" fill="${P.dogDark}"/>` : ''}
    <circle cx="90" cy="-108" r="5" fill="#111"/>
    <path d="M38 -126 L30 -148 L52 -130 Z" fill="${P.dogDark}"/>
    <circle cx="64" cy="-116" r="4" fill="#111"/>
    <rect x="34" y="-98" width="22" height="6" fill="${P.cap}"/>
  </g>`;
}

// ---------- КОРОВА (скот) ----------
function cow() {
  return `<g class="cow">
    <ellipse cx="0" cy="2" rx="80" ry="9" fill="#000" opacity=".3"/>
    <rect x="-62" y="-56" width="16" height="56" rx="5" fill="#9e9a8f"/>
    <rect x="-36" y="-56" width="16" height="56" rx="5" fill="${P.cow}"/>
    <rect x="30" y="-56" width="16" height="56" rx="5" fill="#9e9a8f"/>
    <rect x="52" y="-56" width="16" height="56" rx="5" fill="${P.cow}"/>
    <rect x="-70" y="-122" width="146" height="74" rx="26" fill="${P.cow}"/>
    <path d="M-40 -122 Q-20 -96 -42 -78 Q-64 -86 -64 -108 Z" fill="${P.cowSpot}"/>
    <path d="M20 -120 Q46 -112 40 -88 Q16 -84 12 -104 Z" fill="${P.cowSpot}"/>
    <path d="M-70 -108 Q-86 -96 -82 -70" stroke="${P.cow}" stroke-width="6" fill="none"/>
    <rect x="62" y="-136" width="50" height="52" rx="18" fill="${P.cow}"/>
    <rect x="80" y="-104" width="38" height="24" rx="10" fill="#c7a99a"/>
    <circle cx="80" cy="-118" r="4" fill="#111"/>
    <path d="M64 -136 L54 -150 M104 -136 L114 -150" stroke="#cfc6a8" stroke-width="6" stroke-linecap="round"/>
  </g>`;
}

// ---------- ВОРОТА ----------
function gate(o = {}) {
  const open = o.open || 0; // 0..1
  const sx = 1 - open * 0.85;
  const leaf = (dir) => `<g transform="translate(${dir > 0 ? -150 : 150} 0) scale(${dir * sx} 1)">
      <rect x="0" y="-150" width="146" height="14" fill="${P.wood}"/>
      <rect x="0" y="-80" width="146" height="14" fill="${P.wood}"/>
      <rect x="0" y="-24" width="146" height="14" fill="${P.wood}"/>
      <rect x="0" y="-158" width="14" height="150" fill="${P.woodLight}"/>
      <rect x="132" y="-158" width="14" height="150" fill="${P.woodLight}"/>
      <path d="M8 -20 L138 -146" stroke="${P.woodDark}" stroke-width="14"/>
    </g>`;
  return `<g class="gate">
    <rect x="-168" y="-200" width="20" height="200" fill="${P.woodDark}"/>
    <rect x="148" y="-200" width="20" height="200" fill="${P.woodDark}"/>
    <rect x="-174" y="-206" width="32" height="10" fill="${P.wood}"/>
    <rect x="142" y="-206" width="32" height="10" fill="${P.wood}"/>
    ${leaf(1)}${leaf(-1)}
    ${open < 0.05 ? `<rect x="-14" y="-96" width="28" height="18" rx="3" fill="#8b8f96"/><circle cx="0" cy="-80" r="9" fill="none" stroke="#8b8f96" stroke-width="4"/>` : ''}
  </g>`;
}

// ---------- ЗАБОР (сегмент) ----------
function fence(len = 400) {
  let s = `<rect x="0" y="-70" width="${len}" height="8" fill="${P.woodDark}"/><rect x="0" y="-36" width="${len}" height="8" fill="${P.woodDark}"/>`;
  for (let x = 0; x <= len; x += 50) s += `<rect x="${x}" y="-86" width="10" height="86" fill="${P.wood}"/>`;
  return `<g class="fence">${s}</g>`;
}

// ---------- КОЛОДЕЦ ----------
function well() {
  return `<g class="well">
    <ellipse cx="0" cy="4" rx="110" ry="12" fill="#000" opacity=".35"/>
    <rect x="-96" y="-210" width="14" height="150" fill="${P.woodDark}"/>
    <rect x="82" y="-210" width="14" height="150" fill="${P.woodDark}"/>
    <path d="M-120 -200 L0 -260 L120 -200 Z" fill="${P.roof}"/>
    <path d="M-120 -200 L0 -260 L120 -200" stroke="${P.woodDark}" stroke-width="8" fill="none"/>
    <rect x="-90" y="-170" width="180" height="10" fill="${P.wood}"/>
    <line x1="0" y1="-160" x2="0" y2="-112" stroke="#9a9a90" stroke-width="3"/>
    <path d="M-16 -112 L16 -112 L12 -84 L-12 -84 Z" fill="${P.woodLight}"/>
    <path d="M-100 -70 Q0 -84 100 -70 L100 0 L-100 0 Z" fill="${P.stone}"/>
    <ellipse cx="0" cy="-70" rx="100" ry="14" fill="${P.stoneDark}"/>
    <ellipse cx="0" cy="-70" rx="84" ry="9" fill="#05070b"/>
    <path d="M-100 -44 H100 M-100 -18 H100 M-60 -70 V-44 M20 -70 V-44 M60 -44 V-18 M-20 -44 V-18 M-70 -18 V0 M30 -18 V0" stroke="${P.stoneDark}" stroke-width="3"/>
  </g>`;
}

// ---------- ДОМ (2 этажа) ----------
function house(o = {}) {
  const boarded = o.boarded !== false;
  const lit = o.lit || false;
  const board = (x, y) => `<g>
      <rect x="${x - 6}" y="${y + 10}" width="82" height="12" fill="${P.woodLight}" transform="rotate(-12 ${x + 35} ${y + 16})"/>
      <rect x="${x - 6}" y="${y + 44}" width="82" height="12" fill="${P.wood}" transform="rotate(10 ${x + 35} ${y + 50})"/>
      <rect x="${x - 6}" y="${y + 70}" width="82" height="11" fill="${P.woodLight}" transform="rotate(-6 ${x + 35} ${y + 76})"/>
    </g>`;
  const win = (x, y, l) => `<rect x="${x}" y="${y}" width="70" height="86" fill="${l ? '#e7b25a' : P.window}"/>
      <path d="M${x + 35} ${y} V${y + 86} M${x} ${y + 43} H${x + 70}" stroke="${P.wallDark}" stroke-width="6"/>
      <rect x="${x - 6}" y="${y + 86}" width="82" height="8" fill="${P.wallDark}"/>`;
  return `<g class="house">
    <ellipse cx="0" cy="4" rx="300" ry="16" fill="#000" opacity=".35"/>
    <rect x="-260" y="-470" width="520" height="470" fill="${P.wall}"/>
    ${Array.from({ length: 15 }, (_, i) => `<line x1="-260" x2="260" y1="${-440 + i * 30}" y2="${-440 + i * 30}" stroke="${P.wallDark}" stroke-width="3"/>`).join('')}
    <path d="M-300 -460 L0 -640 L300 -460 Z" fill="${P.roof}"/>
    <rect x="130" y="-640" width="44" height="110" fill="${P.stoneDark}"/>
    <rect x="-306" y="-470" width="612" height="16" fill="#1a1d24"/>
    <!-- второй этаж -->
    ${win(-200, -420, lit)}${win(-35, -420, false)}${win(130, -420, false)}
    <rect x="-262" y="-252" width="524" height="10" fill="${P.wallDark}"/>
    <!-- первый этаж -->
    ${win(-200, -200, false)}${win(130, -200, false)}
    ${boarded ? board(-200, -200) + board(130, -200) : ''}
    <rect x="-42" y="-176" width="84" height="176" fill="${P.woodDark}"/>
    ${boarded ? `<rect x="-52" y="-130" width="104" height="14" fill="${P.woodLight}"/><rect x="-52" y="-70" width="104" height="14" fill="${P.wood}"/>` : ''}
    <circle cx="28" cy="-88" r="5" fill="#b9a36a"/>
    <rect x="-70" y="-10" width="140" height="10" fill="${P.stoneDark}"/>
  </g>`;
}

// ---------- ГЕНЕРАТОР ----------
function generator(o = {}) {
  const off = o.off;
  return `<g class="generator">
    <ellipse cx="0" cy="3" rx="70" ry="8" fill="#000" opacity=".35"/>
    <rect x="-66" y="-90" width="132" height="12" rx="4" fill="#222"/>
    <rect x="-60" y="-80" width="120" height="70" rx="8" fill="${P.gen}"/>
    <rect x="-46" y="-66" width="46" height="42" rx="4" fill="${P.genDark}"/>
    <circle cx="30" cy="-46" r="16" fill="#2a2a2a"/>
    <circle cx="30" cy="-46" r="6" fill="${off ? '#5a1d1d' : '#ff3b2f'}"/>
    <rect x="-56" y="-10" width="16" height="10" fill="#222"/><rect x="40" y="-10" width="16" height="10" fill="#222"/>
    ${off ? `<path d="M-80 -110 L80 0 M80 -110 L-80 0" stroke="${P.accent}" stroke-width="10" stroke-linecap="round" opacity=".9"/>` : ''}
  </g>`;
}

// ---------- ЕДА / ПОРЦИИ ----------
function food() {
  const jar = (x, c) => `<rect x="${x}" y="-60" width="34" height="56" rx="6" fill="${c}"/><rect x="${x + 2}" y="-68" width="30" height="10" rx="2" fill="#8b8f96"/><rect x="${x + 6}" y="-44" width="22" height="16" fill="#e8e2cc" opacity=".7"/>`;
  return `<g class="food">
    <ellipse cx="0" cy="3" rx="150" ry="10" fill="#000" opacity=".35"/>
    <rect x="-150" y="-80" width="120" height="80" fill="${P.wood}"/>
    <path d="M-150 -40 H-30 M-150 -60 H-30 M-150 -20 H-30" stroke="${P.woodDark}" stroke-width="4"/>
    <rect x="-122" y="-104" width="64" height="28" rx="6" fill="#c9b27a"/>
    <text x="-90" y="-84" font-family="DejaVu Sans" font-weight="bold" font-size="16" fill="#4a3826" text-anchor="middle">МУКА</text>
    ${jar(-14, '#7a3b2e')}${jar(26, '#a5722c')}${jar(66, '#5c6b2e')}
    <rect x="110" y="-46" width="40" height="46" rx="4" fill="#9ba0a8"/><rect x="110" y="-36" width="40" height="14" fill="#c4502f"/>
  </g>`;
}

// ---------- ФОН: ферма ночью, зарево города ----------
function bgFarm(w = 1080, h = 1920, o = {}) {
  const hz = o.horizon || h * 0.52;
  let stars = '';
  let seed = 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 70; i++) stars += `<circle cx="${rnd() * w}" cy="${rnd() * hz * 0.7}" r="${rnd() * 2 + 0.6}" fill="#cfd7ff" opacity="${0.2 + rnd() * 0.5}"/>`;
  let city = '';
  let x = 0;
  seed = 3;
  while (x < w) {
    const bw = 30 + rnd() * 60, bh = 30 + rnd() * 110;
    city += `<rect x="${x}" y="${hz - bh}" width="${bw}" height="${bh}" fill="#160d0d"/>`;
    for (let k = 0; k < 3; k++) if (rnd() > 0.55) city += `<rect x="${x + 6 + rnd() * (bw - 14)}" y="${hz - bh + 8 + rnd() * (bh - 20)}" width="5" height="7" fill="${P.glow}" opacity=".7"/>`;
    x += bw + 2;
  }
  return `<g class="bg">
    <defs>
      <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${P.sky0}"/><stop offset=".55" stop-color="${P.sky1}"/>
        <stop offset=".82" stop-color="${P.glowDeep}"/><stop offset="1" stop-color="${P.glowSoft}"/>
      </linearGradient>
      <radialGradient id="cityGlow" cx=".5" cy="1" r=".7">
        <stop offset="0" stop-color="${P.glow}" stop-opacity=".75"/><stop offset="1" stop-color="${P.glow}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="groundG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${P.field}"/><stop offset="1" stop-color="${P.ground}"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${hz}" fill="url(#skyG)"/>
    ${stars}
    <circle cx="${w * 0.8}" cy="${hz * 0.18}" r="46" fill="#d8d3c0" opacity=".85"/>
    <circle cx="${w * 0.8 + 18}" cy="${hz * 0.18 - 10}" r="44" fill="${P.sky0}" opacity=".9"/>
    <ellipse cx="${w * 0.5}" cy="${hz}" rx="${w * 0.8}" ry="${hz * 0.32}" fill="url(#cityGlow)"/>
    <path d="M${w * 0.18} ${hz - 120} q20 -80 -10 -160 q40 60 30 160Z M${w * 0.62} ${hz - 140} q30 -90 0 -200 q50 80 30 200Z" fill="#2a1a1a" opacity=".55"/>
    ${city}
    <rect y="${hz}" width="${w}" height="${h - hz}" fill="url(#groundG)"/>
    <path d="M0 ${hz + 40} Q${w * 0.3} ${hz + 10} ${w * 0.6} ${hz + 50} T${w} ${hz + 30} V${hz} H0Z" fill="#1a2219"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${-200 + i * 180} ${h} L${w / 2 + (i - 4) * 30} ${hz + 40}" stroke="#18201a" stroke-width="10"/>`).join('')}
  </g>`;
}

if (typeof module !== 'undefined') module.exports = { P, farmer, infected, infectedFar, goose, dog, cow, gate, fence, well, house, generator, food, bgFarm };

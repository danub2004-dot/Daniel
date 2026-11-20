// «Выживание в лесу» — общая графика сериала (плоский 2D, SVG-строки).
// Все персонажи: начало координат — между ступнями, вверх — отрицательный Y.
// Все фоны: 1080×1920, параметр t — время в секундах (для анимации тумана, огня и т.д.).

const P = {
  sky0: '#070d10', sky1: '#122127', sky2: '#25383b', dawn: '#6b706a', dawnWarm: '#8c7863',
  fog: '#7a8c89', fogLight: '#a8b5ae',
  tree0: '#050a0c', tree1: '#0b1518', tree2: '#132226', tree3: '#1e3034', tree4: '#2c4043',
  ground: '#0f1614', ground2: '#18231f', grass: '#22322a', grassLight: '#33463a', dirt: '#3a3a30',
  wood: '#3b3127', woodDark: '#221b15', woodLight: '#4d4234', roof: '#1a1714', moss: '#2f4a2c',
  ember: '#e8742e', fire: '#f3a64a', fireCore: '#ffe6a8', orange: '#d4552a', orangeDark: '#9a3a1d', red: '#8e2b22',
  skin: '#c49a80', skinSh: '#9c7562', pale: '#b6bdac', paleSh: '#8d9585',
  glow: '#e9e3a2', ink: '#0b0f10', bone: '#cfc7b0', paper: '#c9bc98', paperDark: '#8f8061',
};

// ---------- утилиты ----------
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const f = n => Math.round(n * 10) / 10;
const pts = a => a.map(p => f(p[0]) + ',' + f(p[1])).join(' ');
function g(o, inner) { // обёртка позиционирования
  const s = o.s ?? 1, fx = o.flip ? -1 : 1;
  return `<g transform="translate(${f(o.x ?? 0)},${f(o.y ?? 0)}) scale(${f(s * fx * 1000) / 1000},${s}) rotate(${o.rot ?? 0})" opacity="${o.op ?? 1}">${inner}</g>`;
}
function limb(x, y, ang, len, w, color, handColor, handR) {
  return `<g transform="translate(${x},${y}) rotate(${f(ang)})"><rect x="${-w / 2}" y="0" width="${w}" height="${len}" rx="${w / 2}" fill="${color}"/>` +
    (handColor ? `<circle cx="0" cy="${len}" r="${handR}" fill="${handColor}"/>` : '') + `</g>`;
}
function eyes(cx, cy, dx, r, o) {
  if (o.glow) return [-1, 1].map(k => `<circle cx="${cx + k * dx}" cy="${cy}" r="${r * 1.25}" fill="${P.glow}"/><circle cx="${cx + k * dx}" cy="${cy}" r="${r * 2.6}" fill="${P.glow}" opacity=".18"/>`).join('');
  const bl = o.blink ?? 0; // 0 открыты, 1 закрыты
  return [-1, 1].map(k => bl > 0.6
    ? `<rect x="${cx + k * dx - r}" y="${cy - 1.5}" width="${r * 2}" height="3" rx="1.5" fill="${P.ink}"/>`
    : `<ellipse cx="${cx + k * dx}" cy="${cy}" rx="${r}" ry="${r * (1 - bl)}" fill="${P.ink}"/>` + (o.shine ? `<circle cx="${cx + k * dx + r * .35}" cy="${cy - r * .35}" r="${r * .32}" fill="#e8eee8"/>` : '')
  ).join('');
}

// ---------- ПЕРСОНАЖИ ----------

// Миша, 47, пожарный в отпуске. Коренастый, щетина с сединой, куртка с потёртыми светоотражающими полосами.
// o: {x,y,s,flip, armL,armR (градусы, 0 = вниз, + = вперёд/вверх), head (-1..1 поворот), worry (0..1), blink, mouth (0..1 открыт), hold:'match'|'map'}
function misha(o = {}) {
  const head = o.head ?? 0, w = o.worry ?? 0.4, hx = head * 10;
  const jacket = '#34402f', jacketSh = '#283224', stripe = '#a8924a';
  let s = '';
  s += `<ellipse cx="0" cy="4" rx="78" ry="12" fill="#000" opacity=".35"/>`;
  // ноги
  s += `<rect x="-42" y="-175" width="38" height="170" rx="10" fill="#22292a"/><rect x="4" y="-175" width="38" height="170" rx="10" fill="#1d2324"/>`;
  s += `<rect x="-48" y="-22" width="48" height="24" rx="8" fill="#111"/><rect x="2" y="-22" width="48" height="24" rx="8" fill="#111"/>`;
  // дальняя рука
  s += limb(58, -318, -(o.armR ?? 4), 150, 34, jacketSh, P.skinSh, 17);
  // торс
  s += `<path d="M-72,-330 Q-82,-250 -66,-160 L66,-160 Q82,-250 72,-330 Q0,-352 -72,-330Z" fill="${jacket}"/>`;
  s += `<rect x="-74" y="-228" width="148" height="13" fill="${stripe}" opacity=".75"/><rect x="-74" y="-200" width="148" height="7" fill="${stripe}" opacity=".45"/>`;
  s += `<line x1="0" y1="-340" x2="0" y2="-162" stroke="${jacketSh}" stroke-width="4"/>`;
  s += `<rect x="-60" y="-300" width="30" height="26" rx="3" fill="${jacketSh}"/>`; // нагрудный карман
  s += `<path d="M-70,-168 L70,-168 L66,-150 L-66,-150Z" fill="#1c2220"/>`; // ремень
  // шея и голова
  s += `<rect x="-20" y="-362" width="40" height="30" fill="${P.skinSh}"/>`;
  s += `<path d="M-36,-338 Q0,-322 36,-338 L28,-356 L-28,-356Z" fill="${jacketSh}"/>`; // воротник
  s += `<ellipse cx="0" cy="-400" rx="48" ry="54" fill="${P.skin}"/>`;
  s += `<path d="M${-44 + hx * .3},-385 Q${-40},-338 ${0 + hx},-340 Q40,-338 ${44 + hx * .3},-385 Q${22 + hx},-360 ${0 + hx},-362 Q${-22 + hx},-360 ${-44 + hx * .3},-385Z" fill="#4a4540"/>`; // щетина
  s += `<path d="M-50,-405 Q-52,-462 0,-458 Q52,-462 50,-405 Q44,-440 0,-440 Q-44,-440 -50,-405Z" fill="#3a3734"/>`; // волосы
  s += `<path d="M18,-452 Q36,-448 46,-424" stroke="#7b7770" stroke-width="5" fill="none"/>`; // седина
  s += `<ellipse cx="${-50 + hx * .2}" cy="-398" rx="7" ry="12" fill="${P.skinSh}"/>`;
  s += eyes(hx, -402, 17, 5.5, o);
  // брови: worry поднимает внутренние концы
  s += `<path d="M${hx - 30},${-416 + w * 2} L${hx - 9},${-418 - w * 7}" stroke="#2a2725" stroke-width="5" stroke-linecap="round"/>`;
  s += `<path d="M${hx + 30},${-416 + w * 2} L${hx + 9},${-418 - w * 7}" stroke="#2a2725" stroke-width="5" stroke-linecap="round"/>`;
  const m = o.mouth ?? 0;
  s += m > 0.05 ? `<ellipse cx="${hx}" cy="-370" rx="9" ry="${2 + m * 7}" fill="#2a1a16"/>` : `<path d="M${hx - 11},-369 Q${hx},${-371 + w * 4} ${hx + 11},-369" stroke="#2a1a16" stroke-width="3.5" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M${hx - 3},-398 L${hx + 4},-384 L${hx - 4},-382" stroke="${P.skinSh}" stroke-width="3" fill="none"/>`;
  // ближняя рука
  s += limb(-60, -318, (o.armL ?? -4), 150, 36, jacket, P.skin, 18);
  return g(o, s);
}

// Тёма, 16, младший брат. Худой, лохматый, худи с оранжевой заплаткой (такая же — на палатке).
// o.blank (0..1) — «привык»: бледнеет, застывшая улыбка, пустые глаза.
function tyoma(o = {}) {
  const head = o.head ?? 0, hx = head * 9, bl = o.blank ?? 0;
  const skin = bl > 0.5 ? P.pale : '#c8a088';
  const hood = '#2f4450', hoodSh = '#24353e';
  let s = `<ellipse cx="0" cy="4" rx="58" ry="10" fill="#000" opacity=".35"/>`;
  s += `<rect x="-30" y="-150" width="26" height="146" rx="8" fill="#2b3442"/><rect x="4" y="-150" width="26" height="146" rx="8" fill="#252d39"/>`;
  s += `<rect x="-36" y="-18" width="36" height="20" rx="7" fill="#8c8f8a"/><rect x="2" y="-18" width="36" height="20" rx="7" fill="#7e817c"/>`;
  s += limb(44, -268, -(o.armR ?? 4), 122, 26, hoodSh, skin, 13);
  s += `<path d="M-52,-280 Q-60,-210 -50,-140 L50,-140 Q60,-210 52,-280 Q0,-296 -52,-280Z" fill="${hood}"/>`;
  s += `<path d="M-28,-198 L28,-198 L24,-166 L-24,-166Z" fill="${hoodSh}"/>`; // карман-кенгуру
  s += `<rect x="-54" y="-268" width="32" height="30" rx="2" fill="${P.orange}" transform="rotate(-8 -38 -255)"/>`;
  s += `<path d="M-48,-262 l20,-2 M-47,-250 l20,-2" stroke="#f0a070" stroke-width="2" stroke-dasharray="3 3" transform="rotate(-8 -38 -255)"/>`;
  s += `<path d="M-40,-284 Q0,-262 40,-284 Q30,-306 0,-304 Q-30,-306 -40,-284Z" fill="${hoodSh}"/>`; // капюшон
  s += `<path d="M-8,-276 L-10,-236 M8,-276 L10,-236" stroke="#9aa6a8" stroke-width="2.5"/>`; // шнурки
  s += `<rect x="-14" y="-302" width="28" height="22" fill="${bl > 0.5 ? P.paleSh : '#a07a66'}"/>`;
  s += `<ellipse cx="0" cy="-338" rx="40" ry="45" fill="${skin}"/>`;
  s += `<path d="M-44,-340 L-50,-372 L-34,-366 L-36,-392 L-16,-378 L-8,-398 L6,-380 L22,-396 L26,-374 L46,-382 L40,-356 L46,-340 Q40,-368 0,-370 Q-38,-368 -44,-340Z" fill="#2a1f19"/>`;
  s += eyes(hx, -336, 15, 7, { ...o, glow: bl > 0.8, shine: bl < 0.5 });
  if (bl < 0.5) {
    s += `<path d="M${hx - 24},${-354 - (o.curious ?? 0) * 4} L${hx - 8},-356" stroke="#2a1f19" stroke-width="4" stroke-linecap="round"/><path d="M${hx + 24},${-354 - (o.curious ?? 0) * 6} L${hx + 8},-356" stroke="#2a1f19" stroke-width="4" stroke-linecap="round"/>`;
    const m = o.mouth ?? 0;
    s += m > 0.05 ? `<ellipse cx="${hx}" cy="-312" rx="7" ry="${2 + m * 6}" fill="#3a1e18"/>` : `<path d="M${hx - 8},-312 L${hx + 8},-312" stroke="#3a1e18" stroke-width="3" stroke-linecap="round"/>`;
  } else {
    s += `<path d="M${hx - 18},-316 Q${hx},-302 ${hx + 18},-316" stroke="#3a2a26" stroke-width="3" fill="none" stroke-linecap="round"/>`; // застывшая улыбка
  }
  s += limb(-46, -268, (o.armL ?? -4), 122, 28, hood, skin, 14);
  return g(o, s);
}

// Старик — старожил деревни. Сутулый, длинная борода, ватник, посох. Говорит спокойно.
// o.point (0..1) — поднимает руку и показывает вперёд.
function oldman(o = {}) {
  const head = o.head ?? 0, hx = head * 8, pt = o.point ?? 0;
  const coat = '#45443a', coatSh = '#33322a';
  let s = `<ellipse cx="0" cy="4" rx="70" ry="11" fill="#000" opacity=".35"/>`;
  s += `<rect x="-34" y="-150" width="30" height="146" rx="8" fill="#26241f"/><rect x="4" y="-150" width="30" height="146" rx="8" fill="#211f1b"/>`;
  s += `<rect x="-40" y="-20" width="40" height="22" rx="6" fill="#141210"/><rect x="2" y="-20" width="40" height="22" rx="6" fill="#141210"/>`;
  // посох в дальней руке
  s += `<line x1="76" y1="-300" x2="86" y2="4" stroke="${P.woodLight}" stroke-width="9" stroke-linecap="round"/>`;
  s += limb(54, -282, -(o.armR ?? 18), 112, 30, coatSh, P.skinSh, 14);
  s += `<g transform="rotate(6 0 -150)"><path d="M-60,-292 Q-70,-220 -58,-140 L58,-140 Q70,-220 60,-292 Q0,-310 -60,-292Z" fill="${coat}"/>`;
  for (let i = 0; i < 6; i++) s += `<line x1="-60" y1="${-276 + i * 24}" x2="60" y2="${-276 + i * 24}" stroke="${coatSh}" stroke-width="3"/>`;
  s += `<line x1="0" y1="-300" x2="0" y2="-142" stroke="${coatSh}" stroke-width="4"/></g>`;
  // голова (наклонена вперёд)
  s += `<g transform="translate(14,0) rotate(8 0 -300)">`;
  s += `<ellipse cx="0" cy="-350" rx="40" ry="46" fill="#b39079"/>`;
  s += `<path d="M-36,-348 Q-46,-300 -26,-250 Q0,-210 26,-250 Q46,-300 36,-348 Q20,-322 0,-324 Q-20,-322 -36,-348Z" fill="#b7b4a5"/>`; // борода
  s += `<path d="M-14,-326 Q0,-318 14,-326" stroke="#8d8a7d" stroke-width="5" fill="none"/>`; // усы
  s += `<path d="M-40,-356 Q-44,-386 -26,-394 M40,-356 Q44,-386 26,-394" stroke="#a9a699" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M-30,-380 Q0,-402 30,-380 Q0,-392 -30,-380Z" fill="#9c7a66"/>`; // лысина-блик
  s += `<path d="M${hx - 26},-364 L${hx - 8},-360 M${hx + 26},-364 L${hx + 8},-360" stroke="#dcd8ca" stroke-width="5" stroke-linecap="round"/>`; // седые брови
  s += o.glow ? eyes(hx, -350, 15, 4, { glow: true }) : `<path d="M${hx - 20},-350 L${hx - 9},-350 M${hx + 9},-350 L${hx + 20},-350" stroke="${P.ink}" stroke-width="4" stroke-linecap="round"/><circle cx="${hx + 14}" cy="-351" r="1.6" fill="#e8e2c8"/>`;
  s += `</g>`;
  s += limb(-56, -282, -4 + pt * 100 + (o.armL ?? 0), 116, 32, coat, '#b39079', 15);
  return g(o, s);
}

// Местные: бледные, одинаковая улыбка, одежда разных лет (кто когда пришёл).
// o.v: 0 — геолог 70-х, 1 — турист 90-х, 2 — женщина в платке, 3 — турист 2010-х
function local(o = {}) {
  const v = o.v ?? 0, hx = (o.head ?? 0) * 8;
  const looks = [
    { c: '#4c4f35', sh: '#3a3d28', h: 400, hat: 'cap' },
    { c: '#463a52', sh: '#362c40', h: 380, hat: 'none', stripe: '#6b5a3c' },
    { c: '#3f3434', sh: '#2e2525', h: 360, hat: 'scarf' },
    { c: '#5a2c2a', sh: '#43201e', h: 390, hat: 'beanie' },
  ][v];
  const k = looks.h / 400;
  let s = `<ellipse cx="0" cy="4" rx="${60 * k}" ry="10" fill="#000" opacity=".35"/>`;
  s += `<g transform="scale(${k})">`;
  if (v === 2) s += `<path d="M-50,-150 L-60,0 L60,0 L50,-150Z" fill="#2c2626"/>`;
  else s += `<rect x="-34" y="-160" width="30" height="156" rx="8" fill="#23262a"/><rect x="4" y="-160" width="30" height="156" rx="8" fill="#1e2124"/>`;
  s += limb(52, -306, -(o.armR ?? 3), 140, 30, looks.sh, P.paleSh, 14);
  s += `<path d="M-56,-316 Q-64,-240 -54,-150 L54,-150 Q64,-240 56,-316 Q0,-332 -56,-316Z" fill="${looks.c}"/>`;
  if (looks.stripe) s += `<rect x="-56" y="-262" width="112" height="16" fill="${looks.stripe}"/>`;
  if (v === 0) s += `<rect x="-44" y="-292" width="28" height="30" rx="3" fill="${looks.sh}"/><rect x="16" y="-292" width="28" height="30" rx="3" fill="${looks.sh}"/>`;
  if (v === 3) s += `<path d="M0,-326 L0,-150" stroke="#2a1110" stroke-width="5"/><rect x="-6" y="-300" width="12" height="20" fill="#7a3f3a"/>`;
  s += `<rect x="-15" y="-342" width="30" height="28" fill="${P.paleSh}"/>`;
  s += `<ellipse cx="0" cy="-378" rx="40" ry="46" fill="${P.pale}"/>`;
  if (looks.hat === 'cap') s += `<path d="M-42,-392 Q-40,-432 0,-432 Q40,-432 42,-392Z" fill="#3a3d28"/><rect x="-6" y="-396" width="62" height="10" rx="5" fill="#2e3020"/>`;
  if (looks.hat === 'scarf') s += `<path d="M-48,-360 Q-56,-434 0,-436 Q56,-434 48,-360 Q40,-410 0,-412 Q-40,-410 -48,-360Z" fill="#5a4a3e"/><path d="M-40,-346 L-58,-318 L-30,-330Z" fill="#5a4a3e"/>`;
  if (looks.hat === 'beanie') s += `<path d="M-42,-388 Q-44,-438 0,-438 Q44,-438 42,-388Z" fill="#26292c"/><rect x="-44" y="-396" width="88" height="14" rx="6" fill="#323639"/>`;
  if (looks.hat === 'none') s += `<path d="M-42,-380 Q-46,-426 0,-428 Q46,-426 42,-380 Q30,-410 0,-408 Q-30,-410 -42,-380Z" fill="#4a4036"/>`;
  // одинаковое лицо: тёмные круги под глазами и широкая тонкая улыбка
  s += `<ellipse cx="${hx - 15}" cy="-376" rx="11" ry="9" fill="${P.paleSh}"/><ellipse cx="${hx + 15}" cy="-376" rx="11" ry="9" fill="${P.paleSh}"/>`;
  s += o.glow ? eyes(hx, -378, 15, 5, { glow: true }) : `<circle cx="${hx - 15}" cy="-378" r="4.5" fill="${P.ink}"/><circle cx="${hx + 15}" cy="-378" r="4.5" fill="${P.ink}"/>`;
  s += `<path d="M${hx - 22},-354 Q${hx},-338 ${hx + 22},-354" stroke="#4a3632" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += limb(-54, -306, (o.armL ?? -3), 140, 30, looks.c, P.pale, 14);
  s += `</g>`;
  return g(o, s);
}

// Незнакомая птица — «монстр» серии. Чёрная, как цапля с переломанной слишком длинной шеей, костяной клюв, светящиеся глаза.
// o.neck (0..1) — вытягивание шеи, o.beak (0..1) — открытый клюв (крик), o.eye (0..1) — яркость глаз
function bird(o = {}) {
  const nk = o.neck ?? 0.3, bk = o.beak ?? 0, ey = o.eye ?? 1;
  const hx = 70 + nk * 30, hy = -260 - nk * 110;
  let s = '';
  s += `<line x1="-10" y1="-90" x2="-18" y2="0" stroke="#1a1a18" stroke-width="5"/><line x1="12" y1="-90" x2="20" y2="0" stroke="#1a1a18" stroke-width="5"/>`;
  s += `<path d="M-18,0 l-14,6 M-18,0 l10,6 M20,0 l-10,6 M20,0 l14,6" stroke="#1a1a18" stroke-width="4"/>`;
  s += `<path d="M-90,-150 Q-120,-60 -150,10 L-128,-40 L-140,30 L-108,-60 Q-60,-80 -30,-90Z" fill="#090b0c"/>`; // хвост-лохмотья
  s += `<path d="M-80,-150 Q-60,-210 10,-200 Q70,-190 60,-130 Q40,-80 -20,-86 Q-80,-96 -80,-150Z" fill="#0c0f10"/>`; // тело
  s += `<path d="M-40,-180 Q0,-196 40,-170 Q0,-160 -30,-150Z" fill="#161b1c"/>`; // крыло-блик
  s += `<path d="M40,-180 C${60},${-230} ${hx - 60},${hy + 60} ${hx},${hy}" stroke="#0c0f10" stroke-width="22" fill="none" stroke-linecap="round"/>`; // шея
  s += `<ellipse cx="${hx}" cy="${hy}" rx="22" ry="17" fill="#0c0f10"/>`;
  s += `<path d="M${hx + 14},${hy - 6} L${hx + 92},${hy - 2 - bk * 18} L${hx + 16},${hy + 2}Z" fill="${P.bone}"/>`;
  s += `<path d="M${hx + 14},${hy + 4} L${hx + 84},${hy + 6 + bk * 22} L${hx + 14},${hy + 10}Z" fill="#a9a28c"/>`;
  s += `<circle cx="${hx + 4}" cy="${hy - 4}" r="${5}" fill="${P.glow}" opacity="${ey}"/><circle cx="${hx + 4}" cy="${hy - 4}" r="${16}" fill="${P.glow}" opacity="${ey * .2}"/>`;
  s += `<path d="M${hx - 14},${hy - 12} l-12,-20 M${hx - 6},${hy - 16} l-4,-22" stroke="#0c0f10" stroke-width="5" stroke-linecap="round"/>`; // хохолок
  return g(o, s);
}

// ---------- РЕКВИЗИТ ----------
function burntMap(o = {}) { // карта с обгоревшим краем, пустое зелёное пятно в центре
  let s = `<path d="M-200,-140 L190,-150 L205,-60 L185,-20 L210,40 L190,80 L200,140 L-190,150 Q-215,60 -200,-140Z" fill="${P.paper}"/>`;
  s += `<path d="M190,-150 L205,-60 L185,-20 L210,40 L190,80 L200,140 L150,145 L168,90 L150,50 L172,0 L150,-40 L166,-100 L150,-148Z" fill="#2a1c12"/>`;
  s += `<path d="M150,-148 L166,-100 L150,-40 L172,0 L150,50 L168,90 L150,145" stroke="${P.ember}" stroke-width="3" fill="none" opacity=".7"/>`;
  s += `<path d="M-180,-120 Q-60,-100 -20,-130 M-180,100 Q-100,60 -40,120 M60,-130 Q100,-60 140,-120" stroke="#6d8aa0" stroke-width="5" fill="none" opacity=".7"/>`; // реки
  s += `<path d="M-120,-60 Q-40,-90 40,-50 Q90,0 50,60 Q-20,90 -100,50 Q-140,0 -120,-60Z" fill="#7e9a6c" opacity=".55"/>`; // пустой лес
  s += `<path d="M-170,-20 L-130,-24 M140,-10 L120,30" stroke="#8a3b2a" stroke-width="4" stroke-dasharray="8 6"/>`;
  for (let i = -160; i < 160; i += 80) s += `<line x1="${i}" y1="-140" x2="${i + 4}" y2="145" stroke="${P.paperDark}" stroke-width="1.5" opacity=".5"/>`;
  return g(o, s);
}
function matchbox(o = {}) { // открытый коробок, o.n — сколько спичек
  const n = o.n ?? 3; let s = '';
  s += `<rect x="-90" y="-40" width="180" height="80" rx="4" fill="#5a3b24"/><rect x="-90" y="-40" width="180" height="22" fill="#7a5232"/>`;
  s += `<rect x="-60" y="-34" width="120" height="10" fill="#c9b77a" opacity=".6"/>`;
  for (let i = 0; i < n; i++) s += `<rect x="${-70 + i * 14}" y="${-56 + i * 2}" width="140" height="7" rx="3" fill="#d8c08a" transform="rotate(-4)"/><ellipse cx="${74 + i * 14}" cy="${-52 + i * 2}" rx="9" ry="6" fill="#8e2b22" transform="rotate(-4)"/>`;
  s += `<rect x="-100" y="20" width="200" height="40" rx="4" fill="#3a2716"/><rect x="-100" y="34" width="200" height="12" fill="#2a1a0e"/>`;
  return g(o, s);
}
function oldBox(o = {}) { // пустой старый коробок в траве
  return g(o, `<rect x="-26" y="-12" width="52" height="24" rx="2" fill="${o.c ?? '#4a3c2c'}"/><rect x="-26" y="-12" width="52" height="7" fill="${o.c2 ?? '#6a5236'}" opacity=".8"/><rect x="-14" y="-2" width="28" height="6" fill="#20180f" opacity=".6"/>`);
}
function tent(o = {}) { // оранжевая палатка с заплаткой, как у Тёмы на худи. o.up (0..1) — насколько поставлена
  const u = o.up ?? 1, h = 220 * u;
  let s = `<ellipse cx="0" cy="6" rx="230" ry="18" fill="#000" opacity=".35"/>`;
  s += `<path d="M-220,0 L0,${-h} L220,0Z" fill="${P.orange}"/>`;
  s += `<path d="M0,${-h} L220,0 L120,0Z" fill="${P.orangeDark}"/>`;
  s += `<path d="M-40,0 L0,${-h * .62} L40,0Z" fill="#3a1508"/>`;
  s += `<line x1="0" y1="${-h}" x2="0" y2="${-h - 20 * u}" stroke="#2a2a2a" stroke-width="5"/>`;
  s += `<line x1="0" y1="${-h}" x2="-290" y2="2" stroke="#9a9a8a" stroke-width="2" opacity=".6"/><line x1="0" y1="${-h}" x2="290" y2="2" stroke="#9a9a8a" stroke-width="2" opacity=".6"/>`;
  if (u > .5) s += `<g transform="translate(-110,${-h * .3}) rotate(-8)"><rect x="-22" y="-20" width="44" height="40" fill="#e07a48"/><path d="M-20,-14 h40 M-20,10 h40" stroke="#f6c49a" stroke-width="2.5" stroke-dasharray="4 4"/></g>`;
  return g(o, s);
}
function backpack(o = {}) {
  const c = ['#4a4a32', '#5b3b30', '#2e4258', '#3d4a3a'][o.v ?? 0];
  let s = `<rect x="-50" y="-130" width="100" height="130" rx="22" fill="${c}"/><path d="M-50,-110 Q0,-140 50,-110 L50,-80 Q0,-96 -50,-80Z" fill="#000" opacity=".25"/>`;
  s += `<rect x="-34" y="-60" width="68" height="40" rx="8" fill="#000" opacity=".2"/><path d="M-30,-130 Q0,-160 30,-130" stroke="#222" stroke-width="7" fill="none"/>`;
  s += `<path d="M-50,-40 Q-30,-56 0,-20 Q20,0 50,-10 L50,0 L-50,0Z" fill="${P.moss}" opacity=".9"/>`;
  if ((o.v ?? 0) === 2) s += `<rect x="-50" y="-96" width="100" height="6" fill="#9aa8a0" opacity=".5"/>`;
  return g(o, s);
}
// огонь: несколько языков пламени, анимируется по t
function fire(o = {}) {
  const t = o.t ?? 0, sc = o.size ?? 1; let s = '';
  s += `<circle cx="0" cy="-40" r="${260 * sc * (1 + .05 * Math.sin(t * 11))}" fill="url(#fireGlow)" opacity=".9"/>`;
  s += `<path d="M-90,6 L80,-14 M-80,-14 L90,8 M-20,10 L10,-22" stroke="${P.woodDark}" stroke-width="18" stroke-linecap="round"/>`;
  const layers = [[P.red, 1], [P.ember, .78], [P.fire, .56], [P.fireCore, .32]];
  for (const [dx, hk, ph] of [[-34, .7, 0], [30, .8, 2.1], [0, 1, 4.2]])
    layers.forEach(([c, k], i) => {
      const w = 48 * sc * k, h = 190 * sc * k * hk * (1 + .14 * Math.sin(t * 9.3 + i + ph) + .06 * Math.sin(t * 23 + ph));
      const sw = 14 * sc * Math.sin(t * 6.1 + i * 1.1 + ph), x = dx * sc;
      s += `<path d="M${f(x - w)},0 C${f(x - w)},${f(-h * .45)} ${f(x + sw - w * .2)},${f(-h * .7)} ${f(x + sw)},${f(-h)} C${f(x + sw + w * .3)},${f(-h * .62)} ${f(x + w)},${f(-h * .4)} ${f(x + w)},0Z" fill="${c}"/>`;
    });
  // искры
  const r = rng(7);
  for (let i = 0; i < 10; i++) { const ph = (t * (.5 + r()) + r()) % 1; s += `<circle cx="${f((r() - .5) * 160 * sc + Math.sin(t * 3 + i) * 20)}" cy="${f(-60 * sc - ph * 420 * sc)}" r="${f(2 + r() * 3)}" fill="${P.fire}" opacity="${f((1 - ph) * 10) / 10}"/>`; }
  return g(o, s);
}
function matchFlame(o = {}) { // горящая спичка в пальцах
  const t = o.t ?? 0, fl = 1 + .1 * Math.sin(t * 17);
  let s = `<circle cx="0" cy="-30" r="${140 * fl}" fill="url(#fireGlow)" opacity=".8"/>`;
  s += `<rect x="-4" y="-10" width="8" height="120" rx="3" fill="#d8c08a"/><rect x="-5" y="-10" width="10" height="26" rx="4" fill="#2a1a12"/>`;
  s += `<path d="M-14,-6 C-16,-30 ${-2 + 4 * Math.sin(t * 9)},-50 ${2 * Math.sin(t * 11)},${-62 * fl} C10,-44 16,-28 14,-6 Q0,6 -14,-6Z" fill="${P.ember}"/>`;
  s += `<path d="M-7,-8 C-8,-24 0,-34 ${1 * Math.sin(t * 13)},${-42 * fl} C6,-30 8,-20 7,-8 Q0,0 -7,-8Z" fill="${P.fireCore}"/>`;
  return g(o, s);
}

// ---------- ФОНЫ (1080×1920) ----------
const DEFS = `<defs>
<radialGradient id="fireGlow"><stop offset="0" stop-color="#ff9a40" stop-opacity=".55"/><stop offset=".4" stop-color="#d9552a" stop-opacity=".22"/><stop offset="1" stop-color="#d9552a" stop-opacity="0"/></radialGradient>
<filter id="blur30" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="blur12" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter>
<filter id="blur4"><feGaussianBlur stdDeviation="4"/></filter>
<linearGradient id="skyDawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky0}"/><stop offset=".45" stop-color="${P.sky1}"/><stop offset=".68" stop-color="${P.sky2}"/><stop offset=".8" stop-color="${P.dawnWarm}"/></linearGradient>
<linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04070a"/><stop offset=".6" stop-color="#0c1820"/><stop offset=".75" stop-color="#1a2a33"/></linearGradient>
<linearGradient id="skyRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d0605"/><stop offset=".55" stop-color="#2a0f0a"/><stop offset=".78" stop-color="#6a2414"/></linearGradient>
<radialGradient id="vignette" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient>
</defs>`;

function spruce(x, y, h, w, c) {
  const top = y - h, tiers = 7, R = [[x, top]];
  for (let i = 1; i <= tiers; i++) { const ty = top + h * .9 * i / tiers, tw = w * .5 * (0.25 + .75 * i / tiers); R.push([x + tw, ty]); if (i < tiers) R.push([x + tw * .38, ty - h * .03]); }
  R.push([x + w * .05, y - h * .1], [x + w * .05, y]);
  const L = R.slice(1).reverse().map(p => [2 * x - p[0], p[1]]);
  return `<polygon points="${pts(R.concat(L))}" fill="${c}"/>`;
}
function forestRow(seed, baseY, n, hMin, hMax, c, x0 = -80, x1 = 1160) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) { const x = x0 + (x1 - x0) * (i + r() * .8) / n, h = hMin + r() * (hMax - hMin); s += spruce(x, baseY + r() * 30, h, h * (.32 + r() * .12), c); }
  return s + `<rect x="-20" y="${baseY + 10}" width="1120" height="${1940 - baseY}" fill="${c}"/>`;
}
function fogBand(y, t, speed, op, c = P.fog, seed = 1) {
  const r = rng(seed); let s = `<g filter="url(#blur30)" opacity="${op}">`;
  for (let i = 0; i < 7; i++) { const x = ((i * 260 + r() * 120 + t * speed) % 1700) - 300; s += `<ellipse cx="${f(x)}" cy="${f(y + r() * 60 - 30)}" rx="${f(220 + r() * 160)}" ry="${f(40 + r() * 40)}" fill="${c}"/>`; }
  return s + `</g>`;
}
function hut(x, y, w, h, o = {}) {
  const roofH = h * .8, c = o.c ?? P.wood, rc = o.roof ?? P.roof;
  let s = `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${h}" fill="${c}"/>`;
  for (let i = 1; i < 6; i++) s += `<line x1="${x - w / 2}" y1="${y - h * i / 6}" x2="${x + w / 2}" y2="${y - h * i / 6}" stroke="${P.woodDark}" stroke-width="${Math.max(1.5, w / 90)}" opacity=".7"/>`;
  s += `<polygon points="${pts([[x - w * .62, y - h + 4], [x - w * .02, y - h - roofH], [x + w * .62, y - h + 10 + (o.sag ?? 6)]])}" fill="${rc}"/>`;
  const lit = o.lit ?? 0, ww = w * .22;
  s += `<rect x="${x - ww / 2}" y="${y - h * .66}" width="${ww}" height="${ww * .9}" fill="${lit > 0 ? '#c98a3e' : '#0a0d0e'}" opacity="${lit > 0 ? lit : 1}"/>`;
  if (lit > 0) s += `<rect x="${x - ww}" y="${y - h * .66 - ww * .5}" width="${ww * 2}" height="${ww * 1.9}" fill="#c98a3e" opacity="${lit * .15}" filter="url(#blur12)"/>`;
  s += `<line x1="${x}" y1="${y - h * .66}" x2="${x}" y2="${y - h * .66 + ww * .9}" stroke="${P.woodDark}" stroke-width="${ww * .12}"/>`;
  return s;
}
function smoke(x, y, t, sc = 1) {
  let s = `<g filter="url(#blur12)" opacity=".45">`;
  for (let i = 0; i < 6; i++) { const ph = (t * .12 + i / 6) % 1; s += `<circle cx="${f(x + Math.sin(ph * 5 + i) * 30 * sc + ph * 60 * sc)}" cy="${f(y - ph * 420 * sc)}" r="${f((14 + ph * 50) * sc)}" fill="${P.fogLight}" opacity="${f((1 - ph) * 10) / 10}"/>`; }
  return s + `</g>`;
}
function fence(y0, y1, x0, x1, n, c = P.woodDark, seed = 3, hk = 1) { // частокол между двумя точками, линейная перспектива
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1), x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k, sc = .4 + .6 * k;
    const w = 26 * sc * hk, h = (170 + r() * 50) * sc * hk, tilt = (r() - .5) * 6;
    s += `<polygon points="${pts([[x - w / 2, y], [x - w / 2, y - h], [x, y - h - w * .9], [x + w / 2, y - h], [x + w / 2, y]])}" fill="${i % 2 ? c : P.wood}" transform="rotate(${f(tilt)} ${f(x)} ${f(y)})"/>`;
  }
  const xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
  s += `<line x1="${x0}" y1="${y0 - 110 * .4 * hk}" x2="${x1}" y2="${y1 - 110 * hk}" stroke="${P.woodDark}" stroke-width="${8 * hk}"/>`;
  return s;
}
function grassTufts(seed, y0, y1, n, c, t = 0) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = r() * 1100 - 10, y = y0 + r() * (y1 - y0), sc = .5 + (y - y0) / (y1 - y0 + 1) * 1.2, sw = Math.sin(t * 1.3 + i) * 4 * sc;
    s += `<path d="M${f(x)},${f(y)} q${f(-6 * sc + sw)},${f(-40 * sc)} ${f(-14 * sc + sw)},${f(-60 * sc)} M${f(x)},${f(y)} q${f(2 * sc + sw)},${f(-50 * sc)} ${f(4 * sc + sw * 1.4)},${f(-78 * sc)} M${f(x)},${f(y)} q${f(8 * sc + sw)},${f(-36 * sc)} ${f(18 * sc + sw)},${f(-52 * sc)}" stroke="${c}" stroke-width="${f(4 * sc)}" fill="none" stroke-linecap="round"/>`;
  }
  return s;
}
function stars(seed, n, ymax, t) { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${f(r() * 1080)}" cy="${f(r() * ymax)}" r="${f(.8 + r() * 1.6)}" fill="#c8d4d8" opacity="${f((.25 + .5 * r()) * (0.75 + .25 * Math.sin(t * 2 + i)) * 100) / 100}"/>`; return s; }
function dust(seed, t, n = 40, c = '#cfd8d0') { const r = rng(seed); let s = ''; for (let i = 0; i < n; i++) { const x = (r() * 1080 + t * (10 + r() * 20)) % 1080, y = (r() * 1920 - t * (4 + r() * 10) + 1920) % 1920; s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1 + r() * 2)}" fill="${c}" opacity="${f(r() * .35 * 100) / 100}"/>`; } return s; }

// 1. Рассвет: деревня выходит из тумана
function bgDawnVillage(t = 0, o = {}) {
  let s = `<rect width="1080" height="1920" fill="url(#skyDawn)"/>`;
  s += `<circle cx="760" cy="1180" r="120" fill="#c9a77c" opacity=".18" filter="url(#blur30)"/>`;
  s += forestRow(11, 1240, 26, 140, 260, P.tree4);
  s += fogBand(1230, t, 8, .55, P.fogLight, 2);
  s += forestRow(12, 1300, 18, 200, 340, P.tree3);
  const vis = o.reveal ?? 1; // деревня проступает
  s += `<g opacity="${vis}">` + smoke(380, 1180, t) + smoke(690, 1210, t + 3, .8) + hut(380, 1340, 230, 150, { lit: o.lit ?? 0 }) + hut(690, 1350, 190, 125, { sag: 16 }) + hut(150, 1360, 160, 110, { sag: 10 }) + hut(900, 1365, 170, 115) + fence(1395, 1395, -40, 1120, 46, P.woodDark, 5, .45) + `</g>`;
  s += fogBand(1360, t, -12, .7, P.fog, 3);
  s += `<rect x="0" y="1400" width="1080" height="520" fill="${P.ground}"/>`;
  s += `<path d="M420,1920 Q500,1600 540,1410 L580,1410 Q620,1600 760,1920Z" fill="${P.dirt}" opacity=".5"/>`;
  s += grassTufts(21, 1420, 1900, 70, P.grass, t);
  s += fogBand(1560, t, 16, .35, P.fog, 4);
  s += spruce(-40, 1950, 1500, 520, P.tree0) + spruce(1130, 1950, 1600, 560, P.tree0);
  return s;
}
// 2. Забор с ничьими рюкзаками (днём, серо)
function bgFence(t = 0, o = {}) {
  let s = `<rect width="1080" height="1920" fill="url(#skyDawn)"/>` + `<rect width="1080" height="1920" fill="#2c3a3a" opacity=".35"/>`;
  s += forestRow(31, 1050, 22, 220, 420, P.tree3);
  s += fogBand(1080, t, 10, .5, P.fogLight, 5);
  s += hut(860, 1180, 260, 170, { sag: 20 });
  s += `<rect x="0" y="1180" width="1080" height="740" fill="${P.ground2}"/>`;
  s += fence(1250, 1700, -60, 1140, 22, P.woodDark, 9, 2.1);
  s += grassTufts(33, 1500, 1920, 80, P.grass, t);
  // сухое дерево для птицы
  s += `<path d="M960,1160 L940,300 M945,520 Q860,470 780,480 M940,420 Q1010,360 1080,370" stroke="#0a0e0f" stroke-width="22" fill="none" stroke-linecap="round"/>`;
  s += fogBand(1720, t, -14, .3, P.fog, 6);
  return s;
}
// 3. Ночь, костёр посреди деревни (белая ночь — небо не до конца чёрное)
function bgNight(t = 0, o = {}) {
  let s = `<rect width="1080" height="1920" fill="url(#skyNight)"/>` + stars(41, 70, 900, t);
  s += forestRow(42, 1180, 24, 220, 380, P.tree1);
  s += hut(220, 1300, 260, 170, { lit: o.lit ?? 0, c: '#231d17' }) + hut(860, 1290, 240, 160, { c: '#231d17', sag: 18 });
  s += `<rect x="0" y="1290" width="1080" height="630" fill="#0a100f"/>`;
  s += grassTufts(43, 1310, 1900, 50, '#16211c', t);
  s += fogBand(1320, t, 9, .25, '#40525a', 7);
  return s;
}
// 4. Дорога за забором — обрывается в траве
function bgRoad(t = 0, o = {}) {
  let s = `<rect width="1080" height="1920" fill="url(#skyNight)"/>` + stars(51, 50, 700, t);
  s += forestRow(52, 1000, 20, 380, 640, P.tree1);
  s += forestRow(53, 1080, 14, 300, 520, P.tree0);
  s += `<rect x="0" y="1080" width="1080" height="840" fill="#0c1411"/>`;
  s += `<path d="M330,1920 Q440,1500 500,1180 L580,1180 Q640,1500 800,1920Z" fill="#2a2a22"/>`; // колея
  s += `<path d="M420,1920 Q500,1500 530,1185 M700,1920 Q610,1500 555,1185" stroke="#1d1d17" stroke-width="10" fill="none"/>`;
  s += `<path d="M380,1185 Q540,1140 720,1185 Q720,1240 540,1250 Q370,1240 380,1185Z" fill="#14201a"/>`; // трава съедает дорогу
  s += grassTufts(54, 1110, 1300, 90, '#1c2a22', t) + grassTufts(55, 1300, 1920, 50, '#16231c', t);
  s += fogBand(1150, t, 7, .35, '#3e5058', 8);
  return s;
}
// 5. Флешбэк: вчерашний лагерь горит (красные тона)
function bgFlashback(t = 0, o = {}) {
  let s = `<rect width="1080" height="1920" fill="url(#skyRed)"/>`;
  s += forestRow(61, 1250, 24, 260, 440, '#1a0a07');
  s += `<rect x="0" y="1300" width="1080" height="620" fill="#140806"/>`;
  s += `<g filter="url(#blur30)" opacity=".5">` + [0, 1, 2, 3, 4].map(i => { const ph = (t * .15 + i / 5) % 1; return `<circle cx="${f(540 + Math.sin(i * 2 + t) * 80 + ph * 100)}" cy="${f(1250 - ph * 900)}" r="${f(80 + ph * 180)}" fill="#2a1410"/>`; }).join('') + `</g>`;
  return s;
}
// 6. Край деревни, ночь — место для новой палатки
function bgEdge(t = 0, o = {}) {
  let s = `<rect width="1080" height="1920" fill="url(#skyNight)"/>` + stars(71, 60, 900, t);
  s += forestRow(72, 1150, 26, 260, 460, P.tree1);
  s += hut(170, 1330, 220, 150, { c: '#211b16', lit: o.lit ?? .5 }) + fence(1360, 1330, 300, 1120, 26, '#1a1511', 13, .8);
  s += `<rect x="0" y="1360" width="1080" height="560" fill="#0b120f"/>`;
  s += grassTufts(73, 1370, 1900, 60, '#17231c', t);
  s += fogBand(1400, t, 6, .3, '#3e5058', 9);
  return s;
}
// общий оверлей «атмосферы» — пылинки + виньетка
function overlay(t, o = {}) { return dust(o.seed ?? 99, t, o.n ?? 40, o.c) + `<rect width="1080" height="1920" fill="url(#vignette)"/>`; }

if (typeof module !== 'undefined') module.exports = { P, misha, tyoma, oldman, local, bird, burntMap, matchbox, oldBox, tent, backpack, fire, matchFlame, DEFS, bgDawnVillage, bgFence, bgNight, bgRoad, bgFlashback, bgEdge, overlay, spruce, fogBand, hut, fence, grassTufts, rng };

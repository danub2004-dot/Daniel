// Серия 2 «Две спички»: новые фоны и реквизит. Использует общие функции из episode1/art/assets.js.

// Внутри палатки: оранжевые стены в темноте. o.light (0..1) — насколько светло (спичка/факел)
function bgTentInside(t = 0, o = {}) {
  const L = o.light ?? 0;
  let s = `<rect width="1080" height="1920" fill="#120806"/>`;
  s += `<polygon points="-200,1920 540,250 1280,1920" fill="${L > 0 ? '#5a2412' : '#241009'}"/>`;
  s += `<polygon points="540,250 1280,1920 900,1920" fill="#1a0a06" opacity=".6"/>`;
  s += `<polygon points="540,250 -200,1920 160,1920" fill="#1a0a06" opacity=".5"/>`;
  s += `<line x1="540" y1="250" x2="540" y2="1920" stroke="#2a1208" stroke-width="10" opacity=".7"/>`;
  for (let i = 0; i < 5; i++) s += `<path d="M${300 + i * 120},${700 + i * 40} q30,80 0,160" stroke="#000" stroke-width="3" fill="none" opacity=".25"/>`;
  s += `<rect x="0" y="1500" width="1080" height="420" fill="#1c0e08"/>`;
  s += `<path d="M0,1500 Q540,1470 1080,1500" stroke="#3a1a0c" stroke-width="6" fill="none"/>`;
  if (L > 0) s += `<circle cx="${o.lx ?? 540}" cy="${o.ly ?? 1100}" r="${f(900 * L)}" fill="url(#fireGlow)"/>`;
  s += `<rect width="1080" height="1920" fill="#000" opacity="${f((.55 - L * .45) * 100) / 100}"/>`;
  return s;
}
// Ржавый фонарик
function flashlight(o = {}) {
  let s = `<rect x="-120" y="-26" width="200" height="52" rx="12" fill="#5a5850"/><rect x="70" y="-40" width="70" height="80" rx="10" fill="#6a6860"/>`;
  s += `<ellipse cx="140" cy="0" rx="10" ry="34" fill="#2a2a28"/><rect x="-30" y="-36" width="30" height="14" rx="4" fill="#3a3a36"/>`;
  const r = rng(31); for (let i = 0; i < 18; i++) s += `<circle cx="${f(-110 + r() * 240)}" cy="${f(-30 + r() * 60)}" r="${f(4 + r() * 12)}" fill="${['#8a4a22', '#6a3416', '#a0582a'][i % 3]}" opacity=".85"/>`;
  return g(o, s);
}
// Целая карта: деревня нарисована карандашом, подпись «Миша. Тёма.» o.draw (0..1) — проявление рисунка, o.names (0..2)
function pencilMap(o = {}) {
  const d = o.draw ?? 1, n = o.names ?? 2;
  let s = `<rect x="-210" y="-150" width="420" height="300" rx="4" fill="${P.paper}"/>`;
  s += `<path d="M-180,-120 Q-60,-100 -20,-130 M-180,100 Q-100,60 -40,120 M60,-130 Q100,-60 140,-120" stroke="#6d8aa0" stroke-width="5" fill="none" opacity=".7"/>`;
  s += `<path d="M-120,-60 Q-40,-90 40,-50 Q90,0 50,60 Q-20,90 -100,50 Q-140,0 -120,-60Z" fill="#7e9a6c" opacity=".55"/>`;
  for (let i = -160; i < 200; i += 80) s += `<line x1="${i}" y1="-150" x2="${i + 4}" y2="150" stroke="${P.paperDark}" stroke-width="1.5" opacity=".5"/>`;
  // карандашная деревня: домики-треугольники и частокол
  const sk = `M-70,10 v-24 l14,-14 l14,14 v24 z M-34,14 v-20 l12,-12 l12,12 v20 z M2,12 v-26 l15,-15 l15,15 v26 z M-84,22 h130 M-80,22 v-8 M-60,22 v-8 M-40,22 v-8 M-20,22 v-8 M0,22 v-8 M20,22 v-8 M40,22 v-8`;
  s += `<path d="${sk}" stroke="#2a2a2a" stroke-width="2.6" fill="none" stroke-linejoin="round" stroke-dasharray="900" stroke-dashoffset="${f(900 * (1 - d))}" opacity=".85"/>`;
  s += `<circle cx="-18" cy="0" r="${f(64 * d)}" stroke="#2a2a2a" stroke-width="1.6" fill="none" opacity="${f(d * .5 * 100) / 100}"/>`;
  if (n > 0) s += `<text x="-100" y="62" font-family="DejaVu Serif" font-style="italic" font-size="30" fill="#2a2a2a" opacity="${clamp(n)}">Миша.</text>`;
  if (n > 1) s += `<text x="6" y="62" font-family="DejaVu Serif" font-style="italic" font-size="30" fill="#2a2a2a" opacity="${clamp(n - 1)}">Тёма.</text>`;
  return g(o, s);
}
// Пепел кострища с живыми углями. o.glow (0..1), o.dig (0..1) — разгребли
function ashPile(o = {}) {
  const t = o.t ?? 0, gl = o.glow ?? .2, dig = o.dig ?? 0;
  let s = `<ellipse cx="0" cy="0" rx="230" ry="60" fill="#2a2a28"/><ellipse cx="0" cy="-10" rx="180" ry="40" fill="#3e3c38"/>`;
  s += `<path d="M-150,-10 L120,-30 M-120,-30 L150,0" stroke="#141210" stroke-width="20" stroke-linecap="round"/>`;
  s += `<ellipse cx="${f(-20 + dig * 30)}" cy="-14" rx="${f(40 + dig * 50)}" ry="${f(10 + dig * 12)}" fill="#120a06" opacity="${dig}"/>`;
  const r = rng(12);
  for (let i = 0; i < 16; i++) { const x = (r() - .5) * 260, y = -20 + (r() - .5) * 40, k = gl * (.5 + .5 * Math.sin(t * (2 + r() * 3) + i)) * (Math.abs(x) < 80 ? 1 : .4); s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(3 + r() * 5)}" fill="${P.ember}" opacity="${f(k * 100) / 100}"/>`; }
  if (gl > .4) s += `<circle cx="0" cy="-20" r="${f(200 * gl)}" fill="url(#fireGlow)" opacity="${f(gl * 100) / 100}"/><ellipse cx="0" cy="-18" rx="${f(24 * gl)}" ry="${f(12 * gl)}" fill="${P.fireCore}" opacity="${f(gl * (.8 + .2 * Math.sin(t * 9)) * 100) / 100}"/>`;
  return g(o, s);
}
// Факел: колышек, обмотанный оранжевой тканью палатки. o.lit (0..1)
function torch(o = {}) {
  const t = o.t ?? 0, lit = o.lit ?? 1;
  let s = '';
  if (lit > 0) s += `<circle cx="0" cy="-160" r="${f(420 * lit * (1 + .06 * Math.sin(t * 11)))}" fill="url(#fireGlow)"/>`;
  s += `<rect x="-9" y="-120" width="18" height="300" rx="6" fill="${P.woodLight}"/>`;
  s += `<rect x="-22" y="-150" width="44" height="60" rx="10" fill="${P.orangeDark}"/><path d="M-22,-130 h44 M-22,-110 h44" stroke="#5a2010" stroke-width="4"/>`;
  if (lit > 0) {
    const layers = [[P.red, 1], [P.ember, .75], [P.fire, .52], [P.fireCore, .28]];
    layers.forEach(([c, k], i) => {
      const w = 46 * k * lit, h = 170 * k * lit * (1 + .16 * Math.sin(t * 10 + i) + .07 * Math.sin(t * 27 + i)), sw = 12 * Math.sin(t * 7 + i);
      s += `<path d="M${f(-w)},-140 C${f(-w)},${f(-140 - h * .5)} ${f(sw - w * .2)},${f(-140 - h * .75)} ${f(sw)},${f(-140 - h)} C${f(sw + w * .3)},${f(-140 - h * .6)} ${f(w)},${f(-140 - h * .4)} ${f(w)},-140Z" fill="${c}"/>`;
    });
  }
  return g(o, s);
}
// Птица в полёте. o.flap (фаза), o.beak (0..1)
function birdFly(o = {}) {
  const fl = Math.sin(o.flap ?? 0), bk = o.beak ?? 0;
  let s = `<path d="M-40,0 Q0,-24 60,-6 Q90,0 110,-30 Q120,-40 132,-36" stroke="#0c0f10" stroke-width="18" fill="none" stroke-linecap="round"/>`;
  s += `<ellipse cx="10" cy="-4" rx="70" ry="24" fill="#0c0f10"/>`;
  s += `<path d="M-20,-10 Q-60,${f(-120 * fl - 20)} -160,${f(-150 * fl)} L-110,${f(-60 * fl)} L-150,${f(-80 * fl + 20)} Q-60,10 20,-4Z" fill="#090b0c"/>`;
  s += `<path d="M10,-12 Q40,${f(-110 * fl - 20)} 120,${f(-160 * fl)} L90,${f(-70 * fl)} Q60,-10 30,-4Z" fill="#111516"/>`;
  s += `<path d="M-70,0 L-150,24 L-130,8 L-160,10Z" fill="#090b0c"/>`;
  s += `<path d="M138,-42 L200,${f(-40 - bk * 14)} L140,-32Z" fill="${P.bone}"/><path d="M138,-32 L194,${f(-26 + bk * 16)} L138,-28Z" fill="#a9a28c"/>`;
  s += `<circle cx="134" cy="-40" r="4.5" fill="${P.glow}"/><circle cx="134" cy="-40" r="14" fill="${P.glow}" opacity=".2"/>`;
  return g(o, s);
}
// Гарь вчерашнего лагеря: чёрная земля, обугленные пни, остов палатки, иван-чай. o.bloom (0..1) — сколько иван-чая видно
function bgBurnt(t = 0, o = {}) {
  const bl = o.bloom ?? 1;
  let s = `<rect width="1080" height="1920" fill="url(#skyNight)"/>` + stars(81, 60, 900, t);
  s += forestRow(82, 1100, 22, 300, 520, '#0a1012');
  // обгоревшие стволы
  [[160, 1180, 520], [880, 1160, 600], [700, 1200, 380]].forEach(([x, y, h]) => s += `<path d="M${x},${y} L${x + 6},${y - h} M${x + 3},${y - h * .6} l40,-60 M${x + 4},${y - h * .4} l-50,-50" stroke="#050606" stroke-width="16" stroke-linecap="round"/>`);
  s += `<rect x="0" y="1180" width="1080" height="740" fill="#0c0d0c"/>`;
  s += `<ellipse cx="540" cy="1560" rx="460" ry="140" fill="#1a1816"/>`;
  // остов палатки
  s += `<path d="M330,1600 L540,1330 L750,1600 M540,1330 L540,1300" stroke="#1e1e1c" stroke-width="10" fill="none"/>`;
  s += `<path d="M360,1600 Q450,1560 520,1600 M600,1590 Q680,1570 730,1600" stroke="#2a2420" stroke-width="14" fill="none"/>`;
  // иван-чай: розово-лиловые колоски
  const r = rng(83);
  for (let i = 0; i < 70; i++) {
    const x = r() * 1100 - 10, y = 1230 + Math.pow(r(), .7) * 690, sc = .5 + (y - 1230) / 690 * 1.3, h = (90 + r() * 80) * sc, sw = Math.sin(t * 1.2 + i) * 5 * sc;
    const show = clamp((bl * 1.4 - (Math.abs(x - 540) / 900)) * 2);
    if (show <= 0) continue;
    s += `<g opacity="${f(show * 100) / 100}"><line x1="${f(x)}" y1="${f(y)}" x2="${f(x + sw)}" y2="${f(y - h)}" stroke="#2c3a26" stroke-width="${f(4 * sc)}"/>`;
    for (let k = 0; k < 5; k++) s += `<ellipse cx="${f(x + sw * (0.6 + k * .08))}" cy="${f(y - h * (.55 + k * .1))}" rx="${f(7 * sc)}" ry="${f(11 * sc)}" fill="${k > 3 ? '#c27aa6' : '#a3487e'}"/>`;
    s += `<path d="M${f(x)},${f(y - h * .3)} l${f(-18 * sc)},${f(-10 * sc)} M${f(x)},${f(y - h * .38)} l${f(18 * sc)},${f(-12 * sc)}" stroke="#2c3a26" stroke-width="${f(3 * sc)}"/></g>`;
  }
  s += fogBand(1300, t, 6, .25, '#3e5058', 10);
  return s;
}
// Продолжение тропы за обрывом дороги (видна только в свете огня)
function trailBeyond(o = {}) {
  return g(o, `<path d="M500,1190 Q470,1100 520,1030 Q580,960 540,880 L556,880 Q600,960 540,1030 Q500,1100 560,1190Z" fill="#4a4636"/><path d="M520,1180 Q495,1100 534,1030 Q570,970 546,890" stroke="#1d1d17" stroke-width="4" fill="none"/>`);
}

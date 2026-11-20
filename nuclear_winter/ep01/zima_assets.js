// ЯДЕРНАЯ ЗИМА — общая библиотека рисунков (SVG-строки).
// Персонажи: начало координат — между ступнями, вверх — минус Y.
// Части тела помечены классами (head, armL, armR, legL, legR, torso) для анимации.
// Фоны рисуются в viewBox 0 0 1080 1920 (9:16).

const PAL = {
  night: '#0b0e13', deep: '#121821', wall: '#1a222d', wall2: '#232d3a',
  steel: '#2e3a48', fog: '#4a5666', frost: '#9fb4c7', snow: '#c9d4de',
  ash: '#3a3836', lamp: '#e8a33d', lampSoft: '#f2c46d', siren: '#c8352b',
  blood: '#8a2c2c', skin: '#b89478', ink: '#06080b'
};

// детерминированный «случай», чтобы кадры не дрожали между рендерами
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

// ---------- ПЕРСОНАЖИ ----------

function breath(x, y, scale = 1) {
  return `<g class="breath" transform="translate(${x},${y}) scale(${scale})" opacity="0.55">
    <ellipse cx="14" cy="-4" rx="12" ry="8" fill="${PAL.snow}" opacity="0.35"/>
    <ellipse cx="34" cy="-12" rx="16" ry="11" fill="${PAL.snow}" opacity="0.22"/>
    <ellipse cx="58" cy="-22" rx="20" ry="13" fill="${PAL.snow}" opacity="0.12"/>
  </g>`;
}

function misha(o = {}) {
  const jacket = '#3a4434', jacketD = '#2c3428', pants = '#20262e', wrap = PAL.blood;
  return `<g class="char misha">
  <g class="legL"><path d="M-36,-172 L-6,-172 L-9,-14 L-37,-14 Z" fill="${pants}"/>
    <rect x="-44" y="-18" width="40" height="18" rx="7" fill="#15191e"/></g>
  <g class="legR"><path d="M6,-172 L36,-172 L37,-14 L9,-14 Z" fill="${pants}"/>
    <rect x="4" y="-18" width="40" height="18" rx="7" fill="#15191e"/></g>
  <g class="torso">
    <path d="M-64,-298 Q0,-320 64,-298 L72,-166 Q0,-148 -72,-166 Z" fill="${jacket}"/>
    <path d="M-68,-262 Q0,-246 68,-262 M-70,-226 Q0,-210 70,-226 M-71,-192 Q0,-176 71,-192" stroke="${jacketD}" stroke-width="4" fill="none"/>
    <line x1="0" y1="-306" x2="0" y2="-152" stroke="${jacketD}" stroke-width="5"/>
    <path d="M-40,-312 Q0,-292 40,-312 L46,-292 Q0,-270 -46,-292 Z" fill="#4b5a6b"/>
    <path d="M18,-292 L34,-226 L20,-222 L8,-288 Z" fill="#43505f"/>
  </g>
  <g class="armL" style="transform-origin:-58px -292px">
    <path d="M-60,-298 Q-86,-290 -90,-250 L-92,-196 L-66,-194 L-64,-246 Z" fill="${jacket}"/>
    <circle cx="-80" cy="-186" r="15" fill="${wrap}"/>
    <path d="M-92,-190 L-68,-184 M-92,-180 L-68,-176" stroke="#b05050" stroke-width="2.5"/>
  </g>
  <g class="armR" style="transform-origin:58px -292px">
    <path d="M60,-298 Q86,-290 90,-250 L92,-196 L66,-194 L64,-246 Z" fill="${jacket}"/>
    <circle cx="80" cy="-186" r="15" fill="${wrap}"/>
    <path d="M68,-190 L92,-184 M68,-180 L92,-176" stroke="#b05050" stroke-width="2.5"/>
  </g>
  <g class="head">
    <rect x="-12" y="-318" width="24" height="18" fill="#9c7c64"/>
    <ellipse cx="-33" cy="-348" rx="7" ry="10" fill="#a8866c"/>
    <ellipse cx="33" cy="-348" rx="7" ry="10" fill="#a8866c"/>
    <ellipse cx="0" cy="-350" rx="33" ry="39" fill="${PAL.skin}"/>
    <path d="M-31,-338 Q-28,-310 0,-311 Q28,-310 31,-338 Q20,-322 0,-322 Q-20,-322 -31,-338 Z" fill="#7d6352" opacity="0.6"/>
    <path d="M-34,-358 Q-36,-392 0,-394 Q36,-392 34,-358 Q28,-378 0,-380 Q-28,-378 -34,-358 Z" fill="#1c1a19"/>
    <path d="M-22,-364 L-7,-361 M7,-361 L22,-364" stroke="#1c1a19" stroke-width="5" stroke-linecap="round"/>
    <path d="M14,-370 L19,-360" stroke="#d9b9a0" stroke-width="2"/>
    <ellipse cx="-14" cy="-350" rx="3.6" ry="4.2" fill="#14110f"/>
    <ellipse cx="14" cy="-350" rx="3.6" ry="4.2" fill="#14110f"/>
    <circle cx="-13" cy="-351.5" r="1.2" fill="#e8dccf"/><circle cx="15" cy="-351.5" r="1.2" fill="#e8dccf"/>
    <path d="M0,-348 L-3,-334 L3,-333" stroke="#8a6c56" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <path class="mouth" d="M-9,-323 Q0,-326 9,-323" stroke="#4a3328" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
  ${o.breath === false ? '' : breath(28, -326)}
</g>`;
}

function vera(o = {}) {
  const parka = '#4b4256', parkaD = '#3a3243', fur = '#7c7366';
  return `<g class="char vera">
  <g class="legL"><path d="M-28,-110 L-4,-110 L-6,-16 L-30,-16 Z" fill="#23262e"/>
    <rect x="-36" y="-40" width="34" height="40" rx="9" fill="#3a3330"/></g>
  <g class="legR"><path d="M4,-110 L28,-110 L30,-16 L6,-16 Z" fill="#23262e"/>
    <rect x="2" y="-40" width="34" height="40" rx="9" fill="#3a3330"/></g>
  <g class="torso">
    <path d="M-50,-272 Q0,-290 50,-272 L66,-96 Q0,-82 -66,-96 Z" fill="${parka}"/>
    <path d="M-58,-170 L58,-170" stroke="${parkaD}" stroke-width="5"/>
    <line x1="0" y1="-276" x2="0" y2="-90" stroke="${parkaD}" stroke-width="4"/>
    <path d="M-46,-286 Q0,-262 46,-286 Q48,-266 0,-252 Q-48,-266 -46,-286 Z" fill="${fur}"/>
    <path d="M-40,-268 L56,-150" stroke="#8d969c" stroke-width="7"/>
  </g>
  <g class="bag">
    <rect x="34" y="-162" width="62" height="50" rx="9" fill="#a9b1b6"/>
    <rect x="34" y="-162" width="62" height="14" rx="6" fill="#8d969c"/>
    <path d="M59,-140 h12 v-8 h8 v8 h12 v-4" fill="none"/>
    <rect x="60" y="-142" width="10" height="26" fill="${PAL.siren}"/><rect x="52" y="-134" width="26" height="10" fill="${PAL.siren}"/>
    <circle cx="44" cy="-164" r="8" fill="#e6e2d8"/><circle cx="56" cy="-167" r="7" fill="#d6d1c5"/>
    <circle cx="44" cy="-164" r="2.5" fill="#bdb6a8"/>
  </g>
  <g class="armL" style="transform-origin:-46px -264px">
    <path d="M-46,-268 Q-70,-258 -72,-222 L-74,-170 L-52,-168 L-50,-218 Z" fill="${parka}"/>
    <circle cx="-63" cy="-162" r="11" fill="#c4a38c"/>
    <circle class="roll" cx="-63" cy="-150" r="10" fill="#e6e2d8"/><circle cx="-63" cy="-150" r="3" fill="#bdb6a8"/>
  </g>
  <g class="armR" style="transform-origin:46px -264px">
    <path d="M46,-268 Q70,-258 72,-222 L74,-170 L52,-168 L50,-218 Z" fill="${parka}"/>
    <circle cx="63" cy="-162" r="11" fill="#c4a38c"/>
  </g>
  <g class="head">
    <rect x="-10" y="-292" width="20" height="16" fill="#a88a75"/>
    <ellipse cx="0" cy="-320" rx="30" ry="34" fill="#c4a38c"/>
    <path d="M-30,-322 Q-36,-290 -24,-280 L-20,-312 Z M30,-322 Q36,-290 24,-280 L20,-312 Z" fill="#5a3d2c"/>
    <path d="M-34,-326 Q-36,-370 0,-372 Q36,-370 34,-326 Z" fill="#2f5a5a"/>
    <rect x="-35" y="-334" width="70" height="12" rx="5" fill="#264a4a"/>
    <circle cx="0" cy="-376" r="11" fill="#3b6b6b"/>
    <ellipse cx="-12" cy="-312" rx="4.4" ry="5" fill="#14110f"/>
    <ellipse cx="12" cy="-312" rx="4.4" ry="5" fill="#14110f"/>
    <circle cx="-11" cy="-313.5" r="1.4" fill="#eee"/><circle cx="13" cy="-313.5" r="1.4" fill="#eee"/>
    <path d="M-18,-304 Q-12,-301 -6,-304 M6,-304 Q12,-301 18,-304" stroke="#8f6f60" stroke-width="2" fill="none"/>
    <path d="M-17,-321 L-7,-322 M7,-322 L17,-321" stroke="#5a3d2c" stroke-width="3" stroke-linecap="round"/>
    <path class="mouth" d="M-6,-294 Q0,-296 6,-294" stroke="#6a4036" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  </g>
  ${o.breath === false ? '' : breath(24, -298, 0.9)}
</g>`;
}

function commandant(o = {}) {
  const coat = '#2d3829', coatD = '#222b1f';
  return `<g class="char commandant">
  <g class="legL"><rect x="-40" y="-90" width="32" height="76" fill="#1d2126"/><rect x="-46" y="-24" width="42" height="24" rx="6" fill="#111"/></g>
  <g class="legR"><rect x="8" y="-90" width="32" height="76" fill="#1d2126"/><rect x="4" y="-24" width="42" height="24" rx="6" fill="#111"/></g>
  <g class="torso">
    <path d="M-80,-300 Q0,-326 80,-300 L92,-80 Q0,-66 -92,-80 Z" fill="${coat}"/>
    <path d="M-86,-190 Q0,-176 86,-190 L86,-174 Q0,-160 -86,-174 Z" fill="#1c1a16"/>
    <rect x="-12" y="-192" width="24" height="20" rx="3" fill="#8a7a4a"/>
    <circle cx="-22" cy="-260" r="5" fill="#8a7a4a"/><circle cx="-22" cy="-228" r="5" fill="#8a7a4a"/>
    <circle cx="22" cy="-260" r="5" fill="#8a7a4a"/><circle cx="22" cy="-228" r="5" fill="#8a7a4a"/>
    <path d="M-50,-308 L0,-262 L50,-308" stroke="${coatD}" stroke-width="8" fill="none"/>
    <rect x="34" y="-280" width="26" height="18" rx="4" fill="#3a3a3a"/>
    <circle class="torch" cx="47" cy="-271" r="6" fill="${PAL.lampSoft}"/>
  </g>
  <g class="armL" style="transform-origin:-74px -292px">
    <path d="M-74,-298 Q-104,-288 -108,-240 L-110,-170 L-80,-168 L-78,-236 Z" fill="${coat}"/>
    <circle cx="-95" cy="-160" r="14" fill="#9a7a64"/>
    <g class="clipboard"><rect x="-150" y="-226" width="62" height="84" rx="5" fill="#6b5236"/>
      <rect x="-144" y="-214" width="50" height="66" fill="#c9c3b0"/>
      <rect x="-130" y="-232" width="22" height="10" rx="3" fill="#888"/>
      <path d="M-139,-202 h38 M-139,-194 h34 M-139,-186 h38 M-139,-178 h30 M-139,-170 h36 M-139,-162 h26" stroke="#555" stroke-width="2"/></g>
  </g>
  <g class="armR" style="transform-origin:74px -292px">
    <path d="M74,-298 Q104,-288 108,-240 L110,-170 L80,-168 L78,-236 Z" fill="${coat}"/>
    <circle cx="95" cy="-160" r="14" fill="#9a7a64"/>
  </g>
  <g class="head">
    <ellipse cx="0" cy="-344" rx="38" ry="40" fill="#a37f68"/>
    <path d="M-44,-350 Q-48,-404 0,-408 Q48,-404 44,-350 L40,-364 Q0,-372 -40,-364 Z" fill="#4e4033"/>
    <rect x="-46" y="-372" width="92" height="18" rx="8" fill="#5f4f40"/>
    <path d="M-46,-360 Q-56,-326 -42,-306 L-34,-330 Z M46,-360 Q56,-326 42,-306 L34,-330 Z" fill="#5f4f40"/>
    <path d="M-20,-348 L-6,-346 M6,-346 L20,-348" stroke="#2d241d" stroke-width="5" stroke-linecap="round"/>
    <circle cx="-13" cy="-338" r="3.6" fill="#14110f"/><circle cx="13" cy="-338" r="3.6" fill="#14110f"/>
    <path d="M-22,-318 Q-10,-328 0,-322 Q10,-328 22,-318 Q10,-314 0,-318 Q-10,-314 -22,-318 Z" fill="#3a2e26"/>
    <ellipse cx="0" cy="-326" rx="6" ry="4" fill="#8f6a55"/>
  </g>
  ${o.breath === false ? '' : breath(28, -316)}
</g>`;
}

function saveliev(o = {}) {
  const coat = '#8c6b4a', coatD = '#6f5439';
  return `<g class="char saveliev">
  <g class="legL"><rect x="-26" y="-70" width="22" height="58" fill="#1b1c20"/><path d="M-34,-14 h32 v14 h-38 Z" fill="#0c0c0e"/></g>
  <g class="legR"><rect x="4" y="-70" width="22" height="58" fill="#1b1c20"/><path d="M2,-14 h32 l4,14 h-36 Z" fill="#0c0c0e"/></g>
  <g class="torso">
    <path d="M-52,-310 Q0,-326 52,-310 L64,-64 Q0,-54 -64,-64 Z" fill="${coat}"/>
    <path d="M-30,-318 L-4,-220 L-18,-150 M30,-318 L4,-220" stroke="${coatD}" stroke-width="6" fill="none"/>
    <path d="M-24,-318 Q0,-296 24,-318 L18,-270 Q0,-262 -18,-270 Z" fill="#6b2d2d"/>
    <path d="M-20,-304 h40 M-18,-290 h36 M-16,-278 h32" stroke="#c2a56d" stroke-width="3"/>
    <circle cx="-12" cy="-190" r="4" fill="${coatD}"/><circle cx="-12" cy="-150" r="4" fill="${coatD}"/>
  </g>
  <g class="armL" style="transform-origin:-48px -302px">
    <path d="M-48,-306 Q-72,-296 -74,-252 L-76,-176 L-54,-174 L-52,-248 Z" fill="${coat}"/>
    <circle cx="-65" cy="-166" r="11" fill="#151515"/>
  </g>
  <g class="armR" style="transform-origin:48px -302px">
    <path d="M48,-306 Q72,-296 74,-252 L76,-176 L54,-174 L52,-248 Z" fill="${coat}"/>
    <circle cx="65" cy="-166" r="11" fill="#151515"/>
    <rect x="52" y="-160" width="10" height="12" fill="#2a1d16"/>
    <rect x="34" y="-150" width="64" height="44" rx="5" fill="#3b2a20"/>
    <rect x="58" y="-152" width="16" height="6" fill="#8a7a4a"/>
  </g>
  <g class="head">
    <rect x="-10" y="-336" width="20" height="16" fill="#b39c8a"/>
    <ellipse cx="0" cy="-364" rx="28" ry="36" fill="#cdb6a3"/>
    <path d="M-29,-370 Q-30,-404 4,-404 Q30,-402 29,-372 Q14,-392 -10,-386 Q-22,-382 -29,-370 Z" fill="#6d6d6d"/>
    <circle cx="-11" cy="-364" r="9" fill="none" stroke="#c9c9c9" stroke-width="2.4"/>
    <circle cx="11" cy="-364" r="9" fill="none" stroke="#c9c9c9" stroke-width="2.4"/>
    <line x1="-2" y1="-364" x2="2" y2="-364" stroke="#c9c9c9" stroke-width="2"/>
    <circle cx="-11" cy="-363" r="2.8" fill="#14110f"/><circle cx="11" cy="-363" r="2.8" fill="#14110f"/>
    <path class="mouth" d="M-7,-338 h14" stroke="#7a5a50" stroke-width="2.4" stroke-linecap="round"/>
  </g>
  ${o.breath === false ? '' : breath(22, -340, 0.85)}
</g>`;
}

// «Лишний»: слишком высокий, слишком тонкий — и у него НЕТ пара изо рта.
function extra(o = {}) {
  return `<g class="char extra">
  <g class="torso">
    <path d="M-30,-400 Q0,-416 30,-400 L40,-150 L26,0 L8,0 L4,-140 L-4,-140 L-8,0 L-26,0 L-40,-150 Z"
      fill="${PAL.ink}" stroke="${PAL.frost}" stroke-opacity="0.45" stroke-width="2.5"/>
  </g>
  <g class="armL" style="transform-origin:-28px -396px">
    <path d="M-28,-398 Q-52,-380 -56,-300 L-62,-150 Q-66,-120 -58,-104 L-50,-150 L-40,-300 Z" fill="${PAL.ink}" stroke="${PAL.frost}" stroke-opacity="0.35" stroke-width="2"/>
  </g>
  <g class="armR" style="transform-origin:28px -396px">
    <path d="M28,-398 Q52,-380 56,-300 L62,-150 Q66,-120 58,-104 L50,-150 L40,-300 Z" fill="${PAL.ink}" stroke="${PAL.frost}" stroke-opacity="0.35" stroke-width="2"/>
  </g>
  <g class="head">
    <ellipse cx="0" cy="-452" rx="24" ry="44" fill="${PAL.ink}" stroke="${PAL.frost}" stroke-opacity="0.5" stroke-width="2.5"/>
    <ellipse class="eye" cx="-9" cy="-458" rx="3" ry="2" fill="#d8ecf7"/>
    <ellipse class="eye" cx="9" cy="-458" rx="3" ry="2" fill="#d8ecf7"/>
  </g>
</g>`;
}

function crowdPerson(color = '#2a313b', s = 1, hat = true) {
  return `<g class="char crowd" transform="scale(${s})">
    <path d="M-44,-260 Q0,-280 44,-260 L54,-60 Q0,-50 -54,-60 Z" fill="${color}"/>
    <rect x="-36" y="-64" width="28" height="64" fill="${color}" opacity="0.85"/><rect x="8" y="-64" width="28" height="64" fill="${color}" opacity="0.85"/>
    <ellipse cx="0" cy="-296" rx="28" ry="32" fill="${color}"/>
    ${hat ? `<path d="M-30,-300 Q0,-344 30,-300 Z" fill="${color}" opacity="0.8"/>` : ''}
  </g>`;
}

// ---------- РЕКВИЗИТ ----------

function chocolate() {
  return `<g class="prop chocolate">
    <rect x="-70" y="-34" width="140" height="68" rx="4" fill="#7a1f22"/>
    <path d="M30,-34 L70,-34 L70,34 L48,34 L56,10 L40,-4 L50,-20 Z" fill="#cfd3d6"/>
    <path d="M40,-4 L56,10 L48,34" stroke="#9aa0a5" stroke-width="2" fill="none"/>
    <rect x="-60" y="-12" width="80" height="24" fill="#a8892f" opacity="0.9"/>
    <text x="-20" y="7" font-family="Inter" font-weight="800" font-size="16" fill="#3b0f10" text-anchor="middle">ШОКОЛАД</text>
    <path d="M-70,-34 L-62,-24 M-40,34 L-30,26" stroke="#5c1517" stroke-width="3"/>
  </g>`;
}

function listSheet(o = {}) {
  const names = ['Абрамов А.', 'Белова Т.', 'Гордеев П.', 'Дронов С.', 'Ефимова Л.', 'Кравец И.', 'Ланской М.', 'Савельев В.', 'Тихонов Р.', 'Шульц Е.'];
  let rows = '';
  names.forEach((n, i) => {
    const y = 40 + i * 22;
    const op = n.startsWith('Савельев') ? 1 - (o.erase || 0) : 1;
    const glow = o.paidGlow || 0;
    rows += `<g opacity="${op}"><text x="-92" y="${y}" font-family="DejaVu Sans Mono" font-size="13" fill="#2b2b2b">${i + 1}. ${n}</text>
      <text x="40" y="${y}" font-family="DejaVu Sans Mono" font-size="11" fill="${glow > 0.5 ? '#2a7a2a' : '#3a5a3a'}" font-weight="${glow > 0.5 ? 'bold' : 'normal'}">оплачено ✓</text></g>`;
  });
  return `<g class="prop list">
    <rect x="-110" y="-30" width="220" height="300" fill="#d4ceb9"/>
    <text x="0" y="-8" font-family="DejaVu Sans Mono" font-size="12" font-weight="bold" fill="#222" text-anchor="middle">СПИСОК УБЕЖИЩА №3</text>
    <text x="0" y="10" font-family="DejaVu Sans Mono" font-size="10" fill="#6a2020" text-anchor="middle">составлен: 08.09 — за 7 дн. до удара</text>
    <line x1="-96" y1="20" x2="96" y2="20" stroke="#555"/>
    ${rows}
  </g>`;
}

function radio() {
  return `<g class="prop radio">
    <rect x="-70" y="-46" width="140" height="80" rx="10" fill="#4a3d30"/>
    <rect x="-58" y="-34" width="64" height="56" rx="6" fill="#2b241d"/>
    ${[0,1,2,3,4].map(i => `<line x1="-54" y1="${-28 + i * 11}" x2="2" y2="${-28 + i * 11}" stroke="#4a3d30" stroke-width="3"/>`).join('')}
    <rect x="16" y="-32" width="42" height="16" rx="3" fill="#c59a3e" opacity="0.8"/>
    <line x1="30" y1="-32" x2="30" y2="-16" stroke="#7a1f22" stroke-width="2"/>
    <circle cx="26" cy="12" r="9" fill="#2b241d"/><circle cx="48" cy="12" r="9" fill="#2b241d"/>
    <line x1="50" y1="-46" x2="86" y2="-110" stroke="#777" stroke-width="3"/>
  </g>`;
}

function thermometer(level = 0.1) {
  const h = 160, fill = h * level;
  return `<g class="prop thermo">
    <rect x="-22" y="-100" width="44" height="200" rx="8" fill="#2e3a48"/>
    <rect x="-5" y="-86" width="10" height="${h}" rx="5" fill="#0b0e13"/>
    <rect class="mercury" x="-5" y="${-86 + h - fill}" width="10" height="${fill}" rx="5" fill="${PAL.siren}"/>
    <circle cx="0" cy="82" r="12" fill="${PAL.siren}"/>
    <text x="16" y="62" font-family="Inter" font-weight="700" font-size="13" fill="${PAL.frost}">−50</text>
    <text x="16" y="-70" font-family="Inter" font-size="11" fill="${PAL.fog}">0</text>
  </g>`;
}

// ---------- ФОНЫ (1080×1920) ----------

function ashFlakes(seed, n, color = '#8d8a85', yMax = 1920) {
  const r = rng(seed); let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${(r() * 1080).toFixed(0)}" cy="${(r() * yMax).toFixed(0)}" r="${(1.5 + r() * 3.5).toFixed(1)}" fill="${color}" opacity="${(0.25 + r() * 0.5).toFixed(2)}"/>`;
  return s;
}

function bgBasement() {
  let bricks = '';
  for (let row = 0; row < 40; row++) for (let c = 0; c < 9; c++) {
    const x = c * 130 + (row % 2) * 65 - 65, y = 200 + row * 46;
    bricks += `<rect x="${x}" y="${y}" width="124" height="40" rx="3" fill="#1d2530" opacity="${0.5 + ((row * 7 + c * 3) % 5) * 0.08}"/>`;
  }
  let tally = '';
  for (let g = 0; g < 12; g++) {
    const gx = 160 + (g % 4) * 170, gy = 720 + Math.floor(g / 4) * 130;
    for (let k = 0; k < 4; k++) tally += `<line x1="${gx + k * 22}" y1="${gy}" x2="${gx + k * 22 + 4}" y2="${gy + 80}" stroke="#b9c3cc" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
    tally += `<line x1="${gx - 10}" y1="${gy + 62}" x2="${gx + 84}" y2="${gy + 14}" stroke="#b9c3cc" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`;
  }
  return `<g class="bg basement">
  <rect width="1080" height="1920" fill="#0f141b"/>
  ${bricks}
  <rect x="0" y="0" width="1080" height="200" fill="#0b0f14"/>
  <rect x="0" y="180" width="1080" height="22" fill="#2a333f"/>
  <rect x="0" y="230" width="1080" height="18" rx="9" fill="#33404e"/><rect x="0" y="262" width="1080" height="12" rx="6" fill="#2a3542"/>
  <g class="window"><rect x="700" y="300" width="240" height="120" fill="#3a3f46"/>
    <rect x="700" y="300" width="240" height="120" fill="none" stroke="#202830" stroke-width="12"/>
    <line x1="820" y1="300" x2="820" y2="420" stroke="#202830" stroke-width="10"/>
    <path d="M700,420 L940,420 L930,396 Q880,404 830,392 Q760,400 710,390 Z" fill="${PAL.snow}" opacity="0.8"/></g>
  <text x="140" y="690" font-family="Inter" font-weight="700" font-size="36" fill="#b9c3cc" opacity="0.6">ДНИ:</text>
  ${tally}
  <path d="M0,200 L0,520 L40,480 L18,420 L60,380 L30,320 L80,260 L40,200 Z" fill="${PAL.frost}" opacity="0.35"/>
  <path d="M1080,200 L1080,600 L1040,560 L1066,480 L1020,420 L1060,340 L1010,280 L1050,200 Z" fill="${PAL.frost}" opacity="0.3"/>
  <rect x="0" y="1500" width="1080" height="420" fill="#0a0d11"/>
  <rect x="120" y="1380" width="260" height="140" fill="#3b3024"/><path d="M120,1420 h260 M120,1470 h260" stroke="#2a2219" stroke-width="5"/>
  <rect x="600" y="1300" width="360" height="90" rx="10" fill="#2a2e36"/>
  <rect x="610" y="1390" width="20" height="130" fill="#20242b"/><rect x="930" y="1390" width="20" height="130" fill="#20242b"/>
  <path d="M640,1300 Q700,1240 820,1270 Q900,1250 930,1300 Z" fill="#3d3a4a"/>
  </g>`;
}

function bgStreet() {
  return `<g class="bg street">
  <defs><linearGradient id="skyAsh" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#2a2827"/><stop offset="0.55" stop-color="#3f3b38"/><stop offset="1" stop-color="#1c1f24"/></linearGradient>
    <radialGradient id="deadSun"><stop offset="0" stop-color="#8a7f70" stop-opacity="0.55"/><stop offset="1" stop-color="#8a7f70" stop-opacity="0"/></radialGradient></defs>
  <rect width="1080" height="1920" fill="url(#skyAsh)"/>
  <circle cx="740" cy="380" r="220" fill="url(#deadSun)"/>
  <circle cx="740" cy="380" r="46" fill="#6e665c" opacity="0.5"/>
  <g class="block">
    <rect x="-40" y="560" width="440" height="880" fill="#161b22"/>
    ${Array.from({length: 9}, (_, r) => Array.from({length: 4}, (_, c) =>
      `<rect x="${10 + c * 96}" y="${600 + r * 92}" width="56" height="58" fill="${(r * 4 + c) % 11 === 3 ? '#c58f3a' : '#0d1116'}" opacity="${(r * 4 + c) % 11 === 3 ? 0.55 : 1}"/>`).join('')).join('')}
    <rect x="150" y="1330" width="90" height="110" fill="#0a0c10"/>
  </g>
  <g class="factory">
    <rect x="560" y="900" width="560" height="540" fill="#1a2028"/>
    <path d="M560,900 l70,-70 l70,70 l70,-70 l70,70 l70,-70 l70,70 l70,-70 l70,70 Z" fill="#1a2028"/>
    <rect x="640" y="520" width="56" height="390" fill="#141a21"/><rect x="760" y="440" width="64" height="470" fill="#141a21"/>
    <rect x="760" y="470" width="64" height="16" fill="#5a2422"/><rect x="760" y="520" width="64" height="16" fill="#5a2422"/>
    <rect x="770" y="1290" width="150" height="150" fill="#2b3644"/>
    <circle class="doorLamp" cx="845" cy="1266" r="12" fill="${PAL.lamp}"/>
    <path d="M845,1266 L760,1440 L930,1440 Z" fill="${PAL.lamp}" opacity="0.12"/>
  </g>
  <rect x="0" y="1430" width="1080" height="490" fill="#aeb9c4"/>
  <path d="M0,1430 Q160,1390 320,1440 Q520,1400 700,1436 Q900,1396 1080,1430 L1080,1520 L0,1520 Z" fill="${PAL.snow}"/>
  <path d="M0,1640 L1080,1600 L1080,1760 L0,1800 Z" fill="#8d99a6" opacity="0.5"/>
  ${Array.from({length: 14}, (_, i) => `<ellipse cx="${120 + i * 70}" cy="${1720 - i * 4 + (i % 2) * 24}" rx="12" ry="6" fill="#6d7885"/>`).join('')}
  ${ashFlakes(7, 120)}
  </g>`;
}

function bgDoor() {
  return `<g class="bg door">
  <rect width="1080" height="1920" fill="#1a2028"/>
  ${Array.from({length: 12}, (_, i) => `<rect x="0" y="${i * 160}" width="1080" height="4" fill="#141a21"/>`).join('')}
  <path d="M120,1500 L120,560 L960,560 L960,1500" fill="none" stroke="#c8a12d" stroke-width="40" stroke-dasharray="60 60"/>
  <rect x="180" y="620" width="720" height="880" rx="30" fill="#2e3a48"/>
  <rect x="210" y="650" width="660" height="820" rx="24" fill="#36444f"/>
  ${[0,1,2,3].map(i => `<rect x="${i < 2 ? 196 : 854}" y="${i % 2 ? 1300 : 740}" width="30" height="100" rx="8" fill="#232c36"/>`).join('')}
  <g class="wheel" style="transform-origin:540px 1060px">
    <circle cx="540" cy="1060" r="130" fill="none" stroke="#5a6774" stroke-width="22"/>
    ${[0,60,120].map(a => `<line x1="540" y1="930" x2="540" y2="1190" stroke="#5a6774" stroke-width="16" transform="rotate(${a} 540 1060)"/>`).join('')}
    <circle cx="540" cy="1060" r="30" fill="#4a5662"/>
  </g>
  <text x="540" y="780" font-family="Inter" font-weight="900" font-size="64" fill="#c9d4de" opacity="0.75" text-anchor="middle" letter-spacing="6">УБЕЖИЩЕ №3</text>
  <rect x="470" y="400" width="140" height="80" rx="16" fill="#3a1a1a"/>
  <ellipse class="siren" cx="540" cy="420" rx="50" ry="44" fill="${PAL.siren}"/>
  <rect x="0" y="1500" width="1080" height="420" fill="#aeb9c4"/>
  <path d="M0,1500 Q200,1440 360,1510 Q540,1470 720,1512 Q900,1450 1080,1500 L1080,1560 L0,1560 Z" fill="${PAL.snow}"/>
  ${ashFlakes(11, 80)}
  </g>`;
}

function bgHall() {
  let bunks = '';
  for (let i = 0; i < 6; i++) {
    const k = 1 - i * 0.14, yL = 820 + i * 70, h = 380 * k, w = 380 * k;
    const xl = 40 + i * 70, xr = 1040 - i * 70 - w;
    [xl, xr].forEach(x => {
      bunks += `<rect x="${x}" y="${yL}" width="${w}" height="${h}" fill="none" stroke="#3b4652" stroke-width="${10 * k}"/>
        <rect x="${x}" y="${yL + h * 0.45}" width="${w}" height="${12 * k}" fill="#3b4652"/>
        <ellipse cx="${x + w * 0.5}" cy="${yL + h * 0.4}" rx="${w * 0.36}" ry="${26 * k}" fill="#28303a"/>
        <ellipse cx="${x + w * 0.5}" cy="${yL + h * 0.92}" rx="${w * 0.36}" ry="${26 * k}" fill="#252c35"/>`;
    });
  }
  return `<g class="bg hall">
  <rect width="1080" height="1920" fill="#10151c"/>
  <path d="M0,0 L1080,0 L700,820 L380,820 Z" fill="#0c1016"/>
  <path d="M0,1920 L1080,1920 L700,1240 L380,1240 Z" fill="#161c24"/>
  <rect x="380" y="820" width="320" height="420" fill="#080b0f"/>
  ${[0,1,2,3].map(i => { const y = 160 + i * 170, x = 540; return `<line x1="${x}" y1="0" x2="${x}" y2="${y}" stroke="#222" stroke-width="3"/>
     <circle class="bulb" cx="${x}" cy="${y}" r="${18 - i * 3}" fill="${PAL.lampSoft}" opacity="${0.9 - i * 0.15}"/>
     <circle cx="${x}" cy="${y}" r="${120 - i * 22}" fill="${PAL.lamp}" opacity="0.07"/>`; }).join('')}
  ${bunks}
  <g class="crates">
    <rect x="420" y="1460" width="120" height="90" fill="#4a3d2a"/><rect x="545" y="1460" width="120" height="90" fill="#43382a"/>
    <rect x="480" y="1372" width="120" height="88" fill="#4f422e"/>
    <text x="480" y="1515" font-family="Inter" font-weight="800" font-size="20" fill="#2a2219" text-anchor="middle">ТУШЁНКА</text>
    <text x="605" y="1515" font-family="Inter" font-weight="800" font-size="20" fill="#2a2219" text-anchor="middle">ВОДА</text>
  </g>
  </g>`;
}

function bgPost() {
  return `<g class="bg post">
  <rect width="1080" height="1920" fill="#0e1218"/>
  <rect x="80" y="300" width="400" height="300" fill="#1a2028"/>
  ${Array.from({length: 12}, (_, i) => `<circle cx="${130 + (i % 4) * 90}" cy="${360 + Math.floor(i / 4) * 80}" r="7" fill="#3a4450"/>
    <rect x="${126 + (i % 4) * 90}" y="${368 + Math.floor(i / 4) * 80}" width="8" height="34" fill="#8a7a4a" opacity="${i === 7 ? 0 : 0.8}"/>`).join('')}
  <rect x="640" y="240" width="300" height="760" fill="#06080b"/>
  <rect x="630" y="230" width="320" height="780" fill="none" stroke="#1d242d" stroke-width="20"/>
  <rect x="0" y="1180" width="1080" height="80" fill="#3a2e22"/>
  <rect x="0" y="1260" width="1080" height="660" fill="#2b2219"/>
  <rect x="300" y="1060" width="36" height="120" fill="#2a3a2a"/>
  <path d="M230,1060 L420,1060 L380,960 L270,960 Z" fill="#2f5a3a"/>
  <path d="M230,1060 L120,1260 L560,1260 L420,1060 Z" fill="${PAL.lampSoft}" opacity="0.18"/>
  <rect x="620" y="1110" width="90" height="70" rx="10" fill="#4a4f55"/><path d="M710,1130 q30,0 30,20" stroke="#4a4f55" stroke-width="10" fill="none"/>
  <rect x="160" y="1196" width="110" height="40" rx="6" fill="#6b2020"/>
  </g>`;
}

const ART = { PAL, rng, misha, vera, commandant, saveliev, extra, crowdPerson, chocolate, listSheet, radio, thermometer,
  bgBasement, bgStreet, bgDoor, bgHall, bgPost, breath, ashFlakes };
if (typeof module !== 'undefined') module.exports = ART;
if (typeof window !== 'undefined') window.ART = ART;

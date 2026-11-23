// Серия 6 — покадровая анимация.
(function (G) {
  'use strict';
  const V = G.VAD, W = G.WORDS;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const eout = (x) => 1 - Math.pow(1 - x, 3);
  const wt = (word, n = 1) => { let k = 0; for (const w of W) if (w[0].replace(/[«»,.…—?!]/g, '') === word && ++k === n) return w[1]; return null; };
  const noise = (t) => (Math.sin(t * 13.1) + Math.sin(t * 7.3 + 1) + Math.sin(t * 23.7 + 2)) / 3;
  const flick = (t, amt = 0.25) => clamp(1 - amt * Math.max(0, noise(t * 2.2)) - (Math.sin(t * 31) > 0.97 ? 0.5 : 0));
  

  // камера
  const cam = (c, z = 1, cx = 540, cy = 960, sh = 0, t = 0) => {
    const dx = sh * Math.sin(t * 87), dy = sh * Math.cos(t * 71);
    return `<g transform="translate(${540 + dx},${960 + dy}) scale(${z}) translate(${-cx},${-cy})">${c}</g>`;
  };
  const shake = (t, at, dur = 0.5, amp = 22) => (t >= at && t < at + dur) ? amp * (1 - (t - at) / dur) : 0;
  // персонаж: локальная система 400×600
  const put = (key, o, x, y, s, t, extra = '') => {
    const br = Math.sin(t * 2.1) * 2.5;
    const blink = ((t + x * 0.01) % 3.7) < 0.12 ? 1 : 0;
    o = Object.assign({}, o); o.expr = Object.assign({}, V.CH[key].expr, o.expr || {});
    if (blink) o.expr.lid = 0.95;
    return `<g transform="translate(${x},${y + br}) scale(${s})" ${extra}>${V.character(key, o)}</g>`;
  };
  const dim = (op, col = '#05070c') => `<rect x="-200" y="-200" width="1480" height="2320" fill="${col}" opacity="${op}"/>`;
  const blurBg = (c, b = 6) => `<g filter="url(#bgBlur${b})">${c}</g>`;
  const glow = (x, y, r, col, op) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" opacity="${op}" filter="url(#blur50)"/>`;

  // текущее «время на экране» (03:00 → 03:03)
  const clock = (t) => { const s = 45 * 60 + Math.floor(t); return `05:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const nowPlates = (t, where, when) => V.plates(where || 'МОЯ ПРИХОЖАЯ', when || clock(t).slice(0, 5), clock(t), { y: 170 });

  // ---------- реквизит ----------
  const tap = (t, a) => {
    const d = seg(t, a + 0.2, a + 0.9);
    return `<rect width="1080" height="1920" fill="#1a2028"/>
      ${Array.from({ length: 60 }, (_, i) => `<rect x="${(i % 6) * 180 + 4}" y="${Math.floor(i / 6) * 180 + 4}" width="172" height="172" fill="#26303c"/>`).join('')}
      <rect x="340" y="1250" width="400" height="670" fill="#3a4250"/>
      <ellipse cx="540" cy="1260" rx="240" ry="40" fill="#0e1218"/>
      <path d="M470,560 L610,560 L610,640 L700,640 C760,640 790,680 790,740 L790,820 L730,820 L730,760 C730,720 712,700 690,700 L610,700 L610,760 L470,760Z" fill="#8a96a4"/>
      <path d="M470,560 L540,560 L540,760 L470,760Z" fill="#c8d2dc" opacity="0.5"/>
      <rect x="500" y="500" width="80" height="70" rx="10" fill="#6a7684"/><rect x="420" y="490" width="240" height="26" rx="12" fill="#9aa6b2"/>
      <ellipse cx="760" cy="${830 + d * 420}" rx="${7 - d * 2}" ry="${11 - d * 3}" fill="#bfe0ff" opacity="${1 - d * 0.8}"/>
      <ellipse cx="760" cy="824" rx="30" ry="6" fill="#000" opacity="0.4"/>`;
  };
  const glasses = (t, pour, tone) => {
    let s = `<rect width="1080" height="1920" fill="#1a1410"/>${V.bgBar(t)}${dim(0.45)}
      <path d="M-100,1100 L1180,1100 L1180,2000 L-100,2000Z" fill="#3a2616"/>
      ${Array.from({ length: 8 }, (_, i) => `<path d="M-100,${1150 + i * 110} L1180,${1130 + i * 112}" stroke="#2a1a0e" stroke-width="4" opacity="0.6"/>`).join('')}
      <rect x="-100" y="1100" width="1280" height="16" fill="#5a3a20"/>`;
    const g = (x, y, sc, lvl) => `<g transform="translate(${x},${y}) scale(${sc})">
      <ellipse cx="0" cy="4" rx="70" ry="12" fill="#000" opacity="0.5"/>
      <rect x="-6" y="-70" width="12" height="70" fill="#d9e6ee" opacity="0.45"/><ellipse cx="0" cy="0" rx="46" ry="9" fill="#d9e6ee" opacity="0.4"/>
      <path d="M-62,-250 C-76,-160 -44,-80 0,-74 C44,-80 76,-160 62,-250Z" fill="#cfe0ea" opacity="0.18" stroke="#e4eef4" stroke-opacity="0.45" stroke-width="3"/>
      <clipPath id="gl${x}"><path d="M-62,-250 C-76,-160 -44,-80 0,-74 C44,-80 76,-160 62,-250Z"/></clipPath>
      <g clip-path="url(#gl${x})"><rect x="-90" y="${-80 - lvl * 110}" width="180" height="200" fill="#b8661f" opacity="0.92"/>
      <ellipse cx="0" cy="${-80 - lvl * 110}" rx="80" ry="10" fill="#e8a048"/></g>
      <path d="M-44,-240 C-52,-170 -40,-120 -26,-100" stroke="#fff" stroke-width="5" opacity="0.45" fill="none"/></g>`;
    s += g(260, 1500, 1.4, pour) + g(560, 1470, 1.5, pour) + g(860, 1520, 1.4, pour);
    // пустой графин «ВОДА»
    s += `<g transform="translate(560,1060) scale(1.1)"><path d="M-30,-300 L30,-300 L30,-220 C100,-180 120,-100 110,-20 C100,40 -100,40 -110,-20 C-120,-100 -100,-180 -30,-220Z" fill="#cfe0ea" opacity="0.15" stroke="#e4eef4" stroke-opacity="0.5" stroke-width="3"/>
      <rect x="-70" y="-140" width="140" height="56" fill="#e8e0cc"/><text x="0" y="-100" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="36" fill="#2a3a5a">ВОДА</text></g>`;
    s += `<rect width="1080" height="1920" fill="${tone[0]}" opacity="${tone[1]}" style="mix-blend-mode:soft-light"/>`;
    return s;
  };
  const crow = (t, a) => {
    const p = seg(t, a, a + 1.6); if (p <= 0 || p >= 1) return '';
    const x = 120 + p * 900, y = 1260 - p * 900 - Math.sin(p * 9) * 30, f = Math.sin(t * 40) * 26;
    return `<g transform="translate(${x},${y})"><ellipse rx="26" ry="12" fill="#07080a"/><path d="M-6,0 L-46,${-f} L-20,4Z M6,0 L46,${-f} L20,4Z" fill="#07080a"/><path d="M24,-4 L40,-2 L24,2Z" fill="#07080a"/></g>`;
  };
  const boom = (t, a, x, y) => {
    const p = seg(t, a, a + 1.2); if (p <= 0 || p >= 1) return '';
    return `<circle cx="${x}" cy="${y}" r="${80 + p * 420}" fill="#ffb040" opacity="${(1 - p) * 0.9}" filter="url(#blur20)"/>
      <circle cx="${x}" cy="${y}" r="${40 + p * 200}" fill="#fff3c0" opacity="${(1 - p) * (1 - p)}" filter="url(#blur8)"/>
      ${Array.from({ length: 14 }, (_, i) => { const a2 = i * 0.45, r = p * 520; return `<rect x="${x + Math.cos(a2) * r}" y="${y + Math.sin(a2) * r * 0.7 - p * 200}" width="16" height="7" fill="#4a3424" transform="rotate(${i * 40 + p * 300},${x + Math.cos(a2) * r},${y + Math.sin(a2) * r * 0.7 - p * 200})"/>`; }).join('')}
      <circle cx="${x}" cy="${y - p * 200}" r="${60 + p * 300}" fill="#3a3a40" opacity="${p * (1 - p) * 1.6}" filter="url(#blur20)"/>`;
  };
  const fountain = (t, a, x, y) => {
    const p = seg(t, a, a + 2.4); if (p <= 0) return '';
    let s = '';
    for (let i = 0; i < 60; i++) {
      const ph = ((t - a) * 1.6 + i / 60) % 1, ang = -Math.PI / 2 + (i % 7 - 3) * 0.12;
      const v = 900 * Math.min(1, p * 3), xx = x + Math.cos(ang) * v * ph, yy = y + Math.sin(ang) * v * ph + 1300 * ph * ph;
      s += `<ellipse cx="${xx}" cy="${yy}" rx="9" ry="16" fill="#bfe0ff" opacity="${0.75 * (1 - ph)}"/>`;
    }
    return s + `<ellipse cx="${x}" cy="${y}" rx="60" ry="30" fill="#e0f0ff" opacity="${0.5 * Math.min(1, p * 3)}" filter="url(#blur8)"/>`;
  };
  const handReach = (x, y, rot, sleeve, skin, holding = '') => `<g transform="translate(${x},${y}) rotate(${rot})">
      <path d="M-70,0 L-70,900 L70,900 L70,0Z" fill="${sleeve}"/><path d="M-70,0 L-70,900 L-30,900 L-30,0Z" fill="#fff" opacity="0.06"/>
      <path d="M-62,-10 C-70,-80 -60,-130 -20,-150 L40,-150 C70,-140 74,-90 66,-20 C60,10 40,24 0,24 C-40,24 -58,14 -62,-10Z" fill="${skin}"/>
      <path d="M-40,-148 L-40,-60 M-8,-152 L-8,-60 M24,-152 L24,-60" stroke="#6a4038" stroke-width="5" opacity="0.4"/>
      <path d="M40,-150 C70,-140 74,-90 66,-20 L40,-20Z" fill="#2a3048" opacity="0.5"/>${holding}</g>`;
  const cap = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse cx="0" cy="40" rx="130" ry="18" fill="#000" opacity="0.5"/>
      <path d="M-110,20 C-110,-70 110,-70 110,20Z" fill="#4a5a72"/><path d="M-110,20 C-60,40 60,40 110,20 L180,40 C120,60 -40,60 -110,20Z" fill="#3a4860"/>
      <circle cx="0" cy="-48" r="8" fill="#3a4860"/><path d="M-60,-40 C-40,-60 0,-66 30,-60" stroke="#fff" stroke-width="5" opacity="0.15" fill="none"/></g>`;

  // ---------- субтитры ----------
  const KEY = { 'Вадулека': '#5cff7a', 'Андрея': '#7ac8ff', 'Андрей': '#7ac8ff', 'Угроза': '#ff8a5a', 'унитаза': '#ff8a5a', 'коньяк': '#ffb84a', 'коньяком': '#ffb84a',
    'Юра': '#ffd84a', 'Анальный': '#ff8a5a', 'террорист': '#ff8a5a', 'Виорел': '#ff8a6a', 'Мамочка': '#ff6a8a', 'бильярд': '#5cff7a', 'храм': '#ffd84a',
    'биток': '#ffffff', 'кепку': '#7ac8ff', 'кладовке': '#ff6a5a', 'двое': '#ff6a5a', 'чужое': '#ff4a4a', 'вода': '#7ac8ff', 'воды': '#7ac8ff', 'петарды': '#ff8a5a', 'шары': '#5cff7a', 'праздника': '#ffd84a', 'камеру': '#ff8a5a', 'Облизывает': '#ff8a5a', 'медаль': '#ffd84a', 'сиденье': '#7ac8ff', 'Пупсик': '#ff6a8a', 'бигудях': '#ff6a8a', 'халате': '#ff6a8a', 'Красной': '#ff6a8a', 'Москвой': '#ff6a8a', 'Пиздец': '#ff3a3a', 'спиздил': '#ff8a5a', 'бля': '#ff8a5a' };
  Object.assign(KEY, { 'мамы': '#ff6a8a', 'сука': '#ff3a3a', 'мамочка': '#ff6a8a', 'рот': '#ff8a5a', 'Целиком': '#ff8a5a', 'застрял': '#7ac8ff', 'Жопой': '#ff8a5a', 'наружу': '#ff8a5a', 'Петардой': '#ff8a5a',
    'шампанского': '#ffd84a', 'бля': '#ff3a3a', 'туалет': '#7ac8ff', 'пятнадцать': '#5cff7a', 'пупсика': '#ff6a8a', 'Круглые': '#ff6a8a', 'спине': '#ff8a5a', 'нахуй': '#ff3a3a',
    'смыв': '#7ac8ff', 'неделю': '#7ac8ff', 'Доставай': '#ff6a8a', 'локоть': '#ff8a5a', 'булькнул': '#7ac8ff', 'Вода': '#7ac8ff', 'толчок': '#7ac8ff', 'Пиздец': '#ff3a3a', 'правильное': '#5cff7a', 'Виорел': '#ff8a6a', 'Юра': '#ffd84a', 'Андрей': '#7ac8ff', 'Андрея': '#7ac8ff', 'Андрюша': '#7ac8ff', 'смертоносный': '#ff5a9a', 'Смертоносный': '#ff5a9a', 'гей': '#ff5a9a', 'гея': '#ff5a9a', 'Смертоносного': '#ff5a9a', 'Анальный': '#ff8a5a', 'террорист': '#ff8a5a', 'Вагинальная': '#ff6aff', 'пробка': '#ff6aff', 'пробку': '#ff6aff', 'анальная': '#ff8a5a', 'Стеклорез': '#9ae8ff', 'Влад': '#9ae8ff', 'Владик': '#9ae8ff', 'стёкла': '#9ae8ff', 'окно': '#9ae8ff', 'лбом': '#ff8a5a', 'стекло': '#9ae8ff', 'витражи': '#ffd84a', 'храм': '#ffd84a', 'облизнулся': '#ff8a5a', 'пиздец': '#ff3a3a', 'засасывает': '#ff3a3a', 'Сука': '#ff3a3a', 'бассейном': '#7ac8ff', 'бигуди': '#ff6a8a', 'Намертво': '#ff3a3a', 'Жопой': '#ff8a5a', 'плафон': '#9ae8ff', 'бокал': '#9ae8ff', 'зубах': '#ffffff', 'сиденье': '#7ac8ff', 'Иону': '#5cff7a', 'Иона': '#5cff7a', 'десантник': '#5aa0ff', 'десантника': '#5aa0ff', 'Василий': '#5aa0ff', 'ВДВ': '#5aa0ff', 'нахуй': '#ff3a3a', 'жопой': '#ff8a5a', 'голову': '#ff8a5a', 'Тишина': '#9ae8ff', 'поймал': '#5cff7a', 'плану': '#5cff7a', 'тельняшку': '#5aa0ff', 'августа': '#5aa0ff', 'обнимку': '#ff6a8a', 'ревновал': '#ff5a9a', 'лысый': '#ffc8a0', 'ключом': '#ffc8a0', 'Сантехника': '#ffc8a0', 'вызывали': '#ffc8a0', 'Пиздец': '#ff3a3a', 'молчит': '#9ae8ff', 'праздник': '#ffd84a', 'скатерти': '#ff8ac0', 'цель': '#ff8a5a', 'Владик': '#9ae8ff', 'Марин': '#c8e08a', 'алкаш': '#c8e08a', 'недоволен': '#ff6a5a', 'доволен': '#5cff7a', 'сука': '#ff3a3a', 'тапке': '#ff8ac0', 'тапок': '#ff8ac0', 'бутылку': '#5cff7a', 'восьмого': '#ffd84a', 'самогона': '#ffd84a', 'банки': '#ffd84a', 'бить': '#ff3a3a', 'ссорьтесь': '#ff5a9a', 'семечки': '#ffd84a', 'шарик': '#ffffff', 'вышибала': '#ffc8a0', 'врачом': '#ffc8a0', 'пожарным': '#ffc8a0', 'сантехником': '#ffc8a0', 'сантехника': '#ffc8a0', 'Злой': '#ff3a3a', 'Местному': '#c8e08a', 'алкашу': '#c8e08a', 'Местный': '#c8e08a', 'Алкаш': '#c8e08a', 'пьётся': '#c8e08a', 'причёска': '#ff5a9a', 'бигудях': '#ff6a8a', 'болото': '#b08a5a', 'грязь': '#b08a5a', 'грязи': '#b08a5a', 'мель': '#b08a5a', 'пластиковые': '#ff6a8a', 'разбил': '#9ae8ff', 'заплакал': '#9ae8ff', 'Целую': '#5cff7a', 'Доволен': '#5cff7a', 'попробуй': '#ff3a3a', 'вестерне': '#ffd84a', 'Бабах': '#ff8a5a', 'Без': '#ff6a8a', 'проглотил': '#ff3a3a', 'Пробка': '#ff6aff', 'Стеклорезу': '#9ae8ff', 'лоб': '#ff8a5a', 'Лбом': '#ff8a5a', 'Лоб': '#ff8a5a', 'Подальше': '#ffffff' });
  const SUB = {};
  const lines = (() => {
    const L = []; let cur = [];
    const len = (a) => a.reduce((s, w) => s + w[0].length + 1, 0);
    W.forEach((w, i) => {
      cur.push(w);
      const end = /[.,…»]$/.test(w[0]) && /[.…]$/.test(w[0]);
      const nxt = W[i + 1];
      if (end || len(cur) > 15 || (nxt && nxt[1] - w[2] > 0.5) || (/,$/.test(w[0]) && len(cur) > 8)) { L.push(cur); cur = []; }
    });
    if (cur.length) L.push(cur);
    return L.map((ws, i) => ({ ws, a: ws[0][1] - 0.08, b: (L[i + 1] ? Math.min(L[i + 1][0][1] - 0.08, ws[ws.length - 1][2] + 0.9) : ws[ws.length - 1][2] + 1.2) }));
  })();
  function subs(t) {
    if (t > W[W.length - 1][2] + 0.6) return '';
    const ln = lines.find(l => t >= l.a && t < l.b); if (!ln) return '';
    const fs = ln.ws.reduce((n, w) => n + w[0].length + 1, 0) > 17 ? 66 : 76, y = 1470;
    const items = ln.ws.map(w => { const who = w[3]; const bare = w[0].replace(/[«»,.…—?!]/g, ''); let txt = w[0]; if (SUB[bare]) txt = txt.replace(bare, SUB[bare]); return { txt, bare, who, on: t >= w[1] - 0.05, cur: t >= w[1] - 0.05 && t < w[2] + 0.1 }; });
    const pop = eout(seg(t, ln.a, ln.a + 0.12));
    const sp = items.map(w => { const col = KEY[w.bare] || ({ V: '#ffb0d4', Y: '#ffe08a', D: '#8ac0ff', L: '#ffc8a0', M: '#c8e08a' }[w.who] || '#ffffff'); return `<tspan fill="${w.on ? col : '#7d838e'}">${w.txt}</tspan>`; }).join(' ');
    const s = `<text x="540" y="${y}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${fs}" stroke="#05070a" stroke-width="10" paint-order="stroke" stroke-linejoin="round" xml:space="preserve">${sp}</text>`;
    return `<g opacity="${pop}" transform="translate(0,${(1 - pop) * 20})">${s}</g>`;
  }

  // ---------- сцены ----------

  // ---------- новые декорации серии 2 ----------
  const VIO = { cloth: 'robe', clothC: '#c4708e', curlers: 1, tag: 'МАМА' };
  const vTalk = (t, who = 'V') => W.some(w => w[3] === who && t >= w[1] && t <= w[2]) ? 0.18 + 0.25 * Math.abs(Math.sin(t * 18)) : 0;

  function bgWindowOut(t, o = {}) {
    const kick = Math.sin(t * 9) * 14;
    let s = `<rect width="1080" height="1920" fill="#14181f"/>
      ${Array.from({ length: 30 }, (_, i) => `<rect x="0" y="${i * 66}" width="1080" height="62" fill="${i % 2 ? '#2a2420' : '#262019'}"/><rect x="0" y="${i * 66 + 62}" width="1080" height="4" fill="#0e0b09"/>`).join('')}
      <rect x="250" y="620" width="560" height="520" fill="#06080c"/>
      <rect x="250" y="620" width="560" height="520" fill="none" stroke="#3a2e24" stroke-width="26"/>
      <rect x="230" y="1130" width="600" height="30" fill="#4a3a2c"/>`;
    // жопа Андрея, торчащая из окна
    s += `<g transform="translate(530,${980 + Math.sin(t * 6) * 6})">
      <path d="M-240,-60 C-250,-240 -20,-260 0,-120 C20,-260 250,-240 240,-60 C230,90 30,120 0,70 C-30,120 -230,90 -240,-60Z" fill="#262f4a"/>
      <path d="M0,-120 C6,-40 4,20 0,70" stroke="#121828" stroke-width="8" fill="none"/>
      <path d="M-236,-80 C-230,20 -180,80 -120,96" stroke="#c9ccd2" stroke-width="12" fill="none"/><path d="M-214,-90 C-206,10 -160,66 -104,82" stroke="#c9ccd2" stroke-width="12" fill="none"/>
      <path d="M236,-80 C230,20 180,80 120,96" stroke="#c9ccd2" stroke-width="12" fill="none"/><path d="M214,-90 C206,10 160,66 104,82" stroke="#c9ccd2" stroke-width="12" fill="none"/>
      <path d="M-150,-200 C-110,-230 -60,-220 -40,-180" stroke="#5a6a90" stroke-width="10" fill="none" opacity="0.6"/>
      <g transform="translate(-120,80) rotate(${kick})"><rect x="-50" y="0" width="100" height="330" rx="40" fill="#262f4a"/><path d="M-60,320 L80,320 L90,380 L-70,380Z" fill="#e8e6e0"/></g>
      <g transform="translate(120,80) rotate(${-kick})"><rect x="-50" y="0" width="100" height="330" rx="40" fill="#262f4a"/><path d="M-80,320 L60,320 L70,380 L-90,380Z" fill="#e8e6e0"/></g>
      ${o.pet ? `<g transform="translate(150,-60) rotate(30)"><rect x="-12" y="-80" width="24" height="80" rx="3" fill="#b2322a"/><rect x="-12" y="-80" width="24" height="9" fill="#e8d7b0"/>
        <path d="M0,-80 C6,-94 -6,-100 4,-112" stroke="#3a2a1a" stroke-width="3" fill="none"/><circle cx="4" cy="-113" r="${12 + Math.abs(Math.sin(t * 30)) * 8}" fill="#ffd36b" filter="url(#blur4)"/><circle cx="4" cy="-113" r="4" fill="#fff"/></g>` : ''}
    </g>`;
    s += V.rain(t, 120, 0, 0, 1080, 1920, 0.4, 9);
    s += `<ellipse cx="540" cy="300" rx="600" ry="400" fill="#ffb060" opacity="0.08" filter="url(#blur50)"/>`;
    return s;
  }

  function bgToilet(t, o = {}) {
    let s = `<rect width="1080" height="1920" fill="#1e2a30"/>
      ${Array.from({ length: 120 }, (_, i) => `<rect x="${(i % 8) * 136 + 3}" y="${Math.floor(i / 8) * 136 + 3}" width="130" height="130" fill="${(i * 7) % 5 ? '#2c3c42' : '#283840'}"/>`).join('')}
      <rect x="0" y="1500" width="1080" height="420" fill="#2a2622"/>
      ${Array.from({ length: 8 }, (_, i) => `<line x1="${i * 160}" y1="1500" x2="${i * 160 - 200}" y2="1920" stroke="#1a1612" stroke-width="4"/>`).join('')}
      <ellipse cx="540" cy="300" rx="500" ry="380" fill="#ffd8a0" opacity="0.16" filter="url(#blur50)"/>`;
    // бачок
    s += `<rect x="350" y="560" width="380" height="330" rx="20" fill="#e6e2d8"/><rect x="350" y="560" width="120" height="330" rx="20" fill="#fff" opacity="0.25"/>
      <rect x="330" y="540" width="420" height="40" rx="14" fill="#f0ece2"/>
      <ellipse cx="540" cy="540" rx="${56}" ry="14" fill="#bdb8ac"/><ellipse cx="540" cy="${536 + (o.press || 0) * 8}" rx="40" ry="10" fill="#d8d4c8"/>`;
    // унитаз
    s += `<path d="M380,900 L700,900 L700,980 C700,1100 640,1180 600,1220 L620,1500 L460,1500 L480,1220 C440,1180 380,1100 380,980Z" fill="#ece8de"/>
      <path d="M380,900 L470,900 L470,1220 C440,1180 380,1100 380,980Z" fill="#fff" opacity="0.3"/>
      <path d="M600,1220 L620,1500 L560,1500 L560,1220Z" fill="#000" opacity="0.12"/>
      <ellipse cx="540" cy="960" rx="230" ry="80" fill="#f4f0e6"/><ellipse cx="540" cy="960" rx="180" ry="56" fill="#1a1e22"/>
      <ellipse cx="540" cy="972" rx="150" ry="38" fill="#0a0c0e"/>
      <path d="M330,940 C330,640 750,640 750,940" fill="none" stroke="#e0dcd2" stroke-width="26" opacity="0.9"/>`;
    if (o.bubble) { const b = o.bubble; s += `<circle cx="${520 + Math.sin(t * 7) * 20}" cy="${975 - b * 30}" r="${10 + b * 46}" fill="#8ac8e8" opacity="${0.35 + 0.4 * b}"/><circle cx="${510}" cy="${960 - b * 40}" r="${6 + b * 10}" fill="#fff" opacity="0.6"/>`; }
    if (o.arm) {
      const a = o.arm, ay = 600 + a * 380;
      s += `<g transform="translate(620,${ay}) rotate(-12)"><rect x="-60" y="-900" width="120" height="900" fill="#262f4a"/><rect x="-50" y="-900" width="12" height="900" fill="#c9ccd2"/><rect x="-30" y="-900" width="12" height="900" fill="#c9ccd2"/>
        <rect x="-62" y="-200" width="124" height="40" fill="#1e2640"/><rect x="-46" y="-160" width="92" height="170" rx="40" fill="#dcab8c"/></g>
        <ellipse cx="540" cy="960" rx="230" ry="80" fill="none" stroke="#f4f0e6" stroke-width="2"/>
        <path d="M310,960 C310,1050 770,1050 770,960 L770,1000 C770,1100 310,1100 310,1000Z" fill="#ece8de"/>`;
    }
    if (o.ball) s += `<ellipse cx="${o.ball[0]}" cy="${o.ball[1] + 40}" rx="${30}" ry="8" fill="#000" opacity="0.3"/><circle cx="${o.ball[0]}" cy="${o.ball[1]}" r="38" fill="url(#ballG)"/>`;
    if (o.flood || o.spray) {
      const f = o.spray != null ? o.spray : o.flood, lvl = 1920 - (o.level != null ? o.level : o.flood) * 1300;
      for (let i = 0; i < 80; i++) {
        const ph = ((t * 1.4 + i / 80) % 1), ang = -Math.PI / 2 + (i % 9 - 4) * 0.09;
        const v = 1500 * Math.min(1, f * 4);
        s += `<ellipse cx="${540 + Math.cos(ang) * v * ph}" cy="${960 + Math.sin(ang) * v * ph + 1600 * ph * ph}" rx="16" ry="26" fill="#9ad0f0" opacity="${0.8 * (1 - ph)}"/>`;
      }
      s += `<rect x="380" y="0" width="320" height="960" fill="#bfe4ff" opacity="${0.35 * Math.min(1, f * 4)}" filter="url(#blur20)"/>
        <path d="M-50,${lvl} ${Array.from({ length: 12 }, (_, i) => `Q${i * 100 + 50},${lvl - 30 * Math.sin(t * 6 + i)} ${i * 100 + 100},${lvl}`).join(' ')} L1130,1990 L-50,1990Z" fill="#2a6a9a" opacity="0.78"/>`;
    }
    return s;
  }
  const flyer = (t, a, d, from, to, rot, inner) => {
    const p = seg(t, a, a + d); if (p <= 0 || p >= 1) return '';
    const x = from[0] + (to[0] - from[0]) * p, y = from[1] + (to[1] - from[1]) * p - Math.sin(p * Math.PI) * 300;
    return `<g transform="translate(${x},${y}) rotate(${rot * p})">${inner}</g>`;
  };
  const counter = (t, at, i, label, val, col = '#ff8a6a') => t < at ? '' : `<g transform="translate(60,${420 + i * 80})" opacity="${eout(seg(t, at, at + 0.2))}"><rect width="${(label.length + val.length + 2) * 20 + 40}" height="62" fill="#0a0d0f" opacity="0.8"/><rect width="${(label.length + val.length + 2) * 20 + 40}" height="62" fill="none" stroke="${col}" stroke-width="3"/>
      <text x="18" y="43" font-family="JetBrains Mono" font-weight="700" font-size="32" fill="${col}">${label}: <tspan fill="#fff">${val}</tspan></text></g>`;
  const heart = (x, y, s, op) => `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}">${[[1,0],[2,0],[4,0],[5,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[1,3],[2,3],[3,3],[4,3],[5,3],[2,4],[3,4],[4,4],[3,5]].map(q => `<rect x="${q[0] * 14}" y="${q[1] * 14}" width="13" height="13" fill="#ff5a9a"/>`).join('')}</g>`;
  const drips = (t, n = 20) => Array.from({ length: n }, (_, i) => { const x = 120 + (i * 137) % 840, ph = (t * 0.8 + i * 0.37) % 1; return `<ellipse cx="${x}" cy="${700 + ph * 900}" rx="6" ry="14" fill="#a8d8ff" opacity="${0.7 * (1 - ph)}"/>`; }).join('');


  // ---------- декорации серии 3 ----------
  const water = (t, lvl, col = '#2a5a80', op = 0.72) => `<path d="M-80,${lvl} ${Array.from({ length: 14 }, (_, i) => `Q${i * 90 + 45},${lvl - 22 * Math.sin(t * 5 + i * 1.3)} ${i * 90 + 90},${lvl}`).join(' ')} L1180,2000 L-80,2000Z" fill="${col}" opacity="${op}"/>
    <path d="M-80,${lvl} ${Array.from({ length: 14 }, (_, i) => `Q${i * 90 + 45},${lvl - 22 * Math.sin(t * 5 + i * 1.3)} ${i * 90 + 90},${lvl}`).join(' ')}" fill="none" stroke="#bfe4ff" stroke-width="5" opacity="0.6"/>`;
  const slipper = (x, y, r, col) => `<g transform="translate(${x},${y}) rotate(${r})"><ellipse rx="60" ry="24" fill="${col}"/><path d="M-10,-22 C10,-40 40,-30 50,-10" fill="none" stroke="${col}" stroke-width="14"/></g>`;
  const shards = (t, at, x, y, n = 26, spread = 700) => {
    const p = seg(t, at, at + 1.1); if (p <= 0 || p >= 1) return '';
    let s = `<circle cx="${x}" cy="${y}" r="${60 + p * 260}" fill="#e8f8ff" opacity="${(1 - p) * 0.6}" filter="url(#blur20)"/>`;
    for (let i = 0; i < n; i++) {
      const a = i * 2.399, v = spread * (0.4 + (i % 5) / 6), xx = x + Math.cos(a) * v * p, yy = y + Math.sin(a) * v * p * 0.8 + 700 * p * p;
      s += `<path d="M0,-18 L12,10 L-10,14Z" transform="translate(${xx},${yy}) rotate(${i * 47 + p * 720}) scale(${0.8 + (i % 3) * 0.5})" fill="#d8f0ff" opacity="${0.9 * (1 - p)}" stroke="#fff" stroke-width="1.5"/>`;
    }
    return s;
  };
  const crack = (x, y, s = 1, op = 1) => `<g transform="translate(${x},${y}) scale(${s})" stroke="#e8f4ff" stroke-width="3" fill="none" opacity="${op}">${Array.from({ length: 9 }, (_, i) => { const a = i * 0.7 + 0.3, r = 60 + (i % 3) * 30; return `<path d="M0,0 L${Math.cos(a) * r * 0.5},${Math.sin(a) * r * 0.5 + 6} L${Math.cos(a) * r},${Math.sin(a) * r}"/>`; }).join('')}<circle r="22" stroke-width="2"/></g>`;
  const ballMouth = (x, y, s = 1) => `<circle cx="${x}" cy="${y}" r="${30 * s}" fill="url(#ballG)"/>`;
  const seatRing = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})"><ellipse rx="150" ry="58" fill="none" stroke="#f2efe6" stroke-width="34"/><ellipse rx="150" ry="58" fill="none" stroke="#fff" stroke-width="6" opacity="0.6" transform="translate(-6,-10)"/></g>`;
  const phone = (t, ring) => `<rect width="1080" height="1920" fill="#06070a"/>${glow(540, 900, 500, '#ff5a9a', 0.12)}
    <g transform="translate(540,1050) rotate(-8)"><rect x="-190" y="-380" width="380" height="760" rx="44" fill="#16181e"/><rect x="-170" y="-350" width="340" height="690" rx="26" fill="#1e2a3a"/>
      <circle cx="0" cy="-150" r="${80 + (ring ? Math.abs(Math.sin(t * 6)) * 14 : 0)}" fill="#9ae8ff" opacity="0.25"/><circle cx="0" cy="-150" r="70" fill="#2a3a4a"/>
      <text y="-130" text-anchor="middle" font-family="Inter" font-weight="900" font-size="64" fill="#9ae8ff">В</text>
      <text y="-20" text-anchor="middle" font-family="Inter" font-weight="900" font-size="46" fill="#fff">ВЛАДИК</text>
      <text y="30" text-anchor="middle" font-family="JetBrains Mono" font-size="26" fill="#9ae8ff">стеклорез 🪟</text>
      <text y="100" text-anchor="middle" font-family="JetBrains Mono" font-size="26" fill="#aab">${ring ? 'вызов…' : ''}</text>
      <circle cx="-90" cy="230" r="44" fill="#d03030"/><circle cx="90" cy="230" r="44" fill="#30b050"/></g>
    <g transform="translate(700,1500) rotate(-20)"><rect x="-70" y="-60" width="140" height="300" rx="50" fill="#c89a7d"/>
      ${[-48, -16, 16, 48].map(x => `<rect x="${x - 14}" y="-130" width="28" height="90" rx="14" fill="#c89a7d"/><rect x="${x - 11}" y="-128" width="22" height="26" rx="10" fill="#ff3a8a"/>`).join('')}
      <rect x="-80" y="200" width="160" height="300" fill="#c4708e"/></g>`;
  function bgChurch(t, o = {}) {
    let s = `<linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a6a"/><stop offset="0.55" stop-color="#c8708a"/><stop offset="0.8" stop-color="#ffb070"/></linearGradient>
      <rect width="1080" height="1920" fill="url(#dawn)"/><circle cx="820" cy="1250" r="140" fill="#ffd8a0" opacity="0.8" filter="url(#blur20)"/>
      <path d="M0,1250 C200,1200 400,1230 600,1190 C800,1160 950,1210 1080,1190 L1080,1400 L0,1400Z" fill="#3a2a40"/>`;
    // церковь
    s += `<g transform="translate(540,1350)"><rect x="-260" y="-560" width="520" height="560" fill="#e8dccc"/><rect x="-260" y="-560" width="120" height="560" fill="#fff" opacity="0.2"/>
      <path d="M-300,-560 L0,-760 L300,-560Z" fill="#c8b8a8"/>
      <rect x="-70" y="-1020" width="140" height="300" fill="#e8dccc"/><path d="M-110,-1020 C-110,-1180 110,-1180 110,-1020Z" fill="#d8a040"/>
      <path d="M0,-1180 L0,-1300 M-40,-1250 L40,-1250 M-30,-1210 L30,-1225" stroke="#d8a040" stroke-width="10"/>`;
    const cols = ['#e03040', '#3060e0', '#f0c030', '#30b060', '#a040c0', '#ff8030'];
    [[-180, -480], [-30, -500], [120, -480]].forEach((w, k) => {
      const bright = 0.75 + 0.25 * Math.sin(t * 3 + k);
      s += `<clipPath id="vw${k}"><path d="M${w[0]},${w[1] + 340} L${w[0]},${w[1] + 60} C${w[0]},${w[1] - 20} ${w[0] + 70},${w[1] - 20} ${w[0] + 70},${w[1] + 60} L${w[0] + 70},${w[1] + 340}Z"/></clipPath>
        <g clip-path="url(#vw${k})" opacity="${bright}">${Array.from({ length: 24 }, (_, i) => `<rect x="${w[0] + (i % 3) * 24}" y="${w[1] - 20 + Math.floor(i / 3) * 46}" width="23" height="45" fill="${cols[(i * 5 + k) % 6]}"/>`).join('')}</g>
        <path d="M${w[0]},${w[1] + 340} L${w[0]},${w[1] + 60} C${w[0]},${w[1] - 20} ${w[0] + 70},${w[1] - 20} ${w[0] + 70},${w[1] + 60} L${w[0] + 70},${w[1] + 340}" fill="none" stroke="#5a4a3a" stroke-width="6"/>`;
    });
    s += `<rect x="-60" y="-200" width="120" height="200" fill="#5a3a2a"/></g>`;
    s += water(t, 1500, '#3a5a8a', 0.8) + `<ellipse cx="820" cy="1560" rx="160" ry="20" fill="#ffd8a0" opacity="0.4"/>`;
    return s;
  }
  const swimmer = (key, o, x, y, s, t) => `<g transform="translate(${x},${y + Math.sin(t * 4 + x) * 10}) rotate(${Math.sin(t * 3 + x) * 6})">${put(key, o, -200 * s, -300 * s, s, t)}</g>`;


  // ---------- декорации серии 4 ----------
  const chute = (x, y, s, op = 1) => `<g transform="translate(${x},${y}) scale(${s})" opacity="${op}">
    <path d="M-300,0 C-300,-260 300,-260 300,0 C250,-30 200,-30 150,0 C100,-30 50,-30 0,0 C-50,-30 -100,-30 -150,0 C-200,-30 -250,-30 -300,0Z" fill="#f2ead8"/>
    ${Array.from({ length: 24 }, (_, i) => `<circle cx="${-240 + (i % 8) * 68}" cy="${-170 + Math.floor(i / 8) * 55 + (i % 2) * 14}" r="14" fill="${['#e04060', '#40a060', '#e0a020'][i % 3]}"/>`).join('')}
    <path d="M-300,0 C-250,-30 -200,-30 -150,0 C-100,-30 -50,-30 0,0 C50,-30 100,-30 150,0 C200,-30 250,-30 300,0" fill="none" stroke="#c84040" stroke-width="10"/>
    ${[-300, -150, 0, 150, 300].map(px => `<line x1="${px}" y1="0" x2="0" y2="420" stroke="#ddd" stroke-width="3"/>`).join('')}</g>`;
  const tower = (t) => `<g transform="translate(300,1500)"><rect x="-26" y="-900" width="20" height="900" fill="#3a3a44"/><rect x="66" y="-900" width="20" height="900" fill="#3a3a44"/>
    ${[0, 1, 2, 3, 4].map(i => `<path d="M-16,${-i * 180} L76,${-i * 180 - 180} M76,${-i * 180} L-16,${-i * 180 - 180}" stroke="#3a3a44" stroke-width="8"/>`).join('')}
    <path d="M-120,-900 L180,-900 L160,-1150 L-100,-1150Z" fill="#4a4a58"/><path d="M-120,-1150 L30,-1260 L180,-1150Z" fill="#3a3a48"/><text x="30" y="-1010" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="40" fill="#c8c8d8">ВОДА</text></g>`;
  const doorOut = (t, open, warm) => `<rect width="1080" height="1920" fill="#2a2a38"/>
    ${Array.from({ length: 30 }, (_, i) => `<rect x="0" y="${i * 66}" width="1080" height="62" fill="${i % 2 ? '#3a3038' : '#342a32'}"/>`).join('')}
    <rect x="250" y="400" width="580" height="1200" fill="${open ? '#ffcf90' : '#1a1418'}"/>${open ? `<ellipse cx="540" cy="1000" rx="500" ry="700" fill="#ffd8a0" opacity="${0.35 * warm}" filter="url(#blur50)"/>` : ''}
    <g transform="translate(250,400) scale(${1 - open * 0.85},1)"><rect width="580" height="1200" fill="#5a3a2a"/><rect x="40" y="40" width="500" height="500" fill="none" stroke="#3a2418" stroke-width="12"/></g>
    <rect x="230" y="380" width="620" height="24" fill="#4a3428"/>`;
  const brokenHeart = (x, y, s, p) => `<g transform="translate(${x},${y}) scale(${s})">${heart(-p * 20, p * 30, 1, 1).replace('<g transform="translate(0,0) scale(1)"', '<g clip-path="none"')}</g>`;
  const halfHeart = (x, y, s, p) => `<g transform="translate(${x},${y})"><clipPath id="hl"><rect x="-10" y="-10" width="52" height="100"/></clipPath><clipPath id="hr"><rect x="42" y="-10" width="60" height="100"/></clipPath>
    <g clip-path="url(#hl)" transform="translate(${-p * 30},${p * 40}) rotate(${-p * 20})">${heart(0, 0, s, 1)}</g><g clip-path="url(#hr)" transform="translate(${p * 30},${p * 50}) rotate(${p * 25})">${heart(0, 0, s, 1)}</g></g>`;
  const inWater = (key, o, x, y, s, t, lvl) => put(key, o, x, y, s, t) + water(t, lvl);


  // ---------- декорации серии 5 ----------
  const phone2 = (t, name, sub) => `<rect width="1080" height="1920" fill="#14100c"/>${glow(540, 900, 500, '#c8e08a', 0.1)}
    <g transform="translate(540,1050) rotate(6)"><rect x="-190" y="-380" width="380" height="760" rx="30" fill="#2a2a2a"/><rect x="-160" y="-340" width="320" height="300" rx="8" fill="#6a8a5a"/>
      <text y="-230" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="42" fill="#1a2a14">${name}</text><text y="-170" text-anchor="middle" font-family="JetBrains Mono" font-size="28" fill="#1a2a14">${sub}</text>
      <text y="-100" text-anchor="middle" font-family="JetBrains Mono" font-size="26" fill="#1a2a14">${Math.floor(t * 2) % 2 ? 'вызов…' : ''}</text>
      ${Array.from({ length: 12 }, (_, i) => `<rect x="${-140 + (i % 3) * 100}" y="${20 + Math.floor(i / 3) * 80}" width="80" height="60" rx="10" fill="#4a4a4a"/>`).join('')}</g>`;
  const jars = (t, broken) => `<rect width="1080" height="1920" fill="#1e1812"/>${[0, 1, 2, 3].map(r => `<rect x="60" y="${560 + r * 300}" width="960" height="16" fill="#4a3424"/>` +
    Array.from({ length: 10 }, (_, i) => broken > (r * 10 + i) / 40 ? `<path d="M${100 + i * 92},${560 + r * 300} l10,-30 l14,18 l12,-40 l16,30 l10,-14 l10,36Z" fill="#cfe0e8" opacity="0.5"/>` :
      `<rect x="${92 + i * 92}" y="${560 + r * 300 - 150}" width="70" height="150" rx="14" fill="#cfe0e8" opacity="0.35"/><rect x="${96 + i * 92}" y="${560 + r * 300 - 100}" width="62" height="98" rx="10" fill="#e8d8a8" opacity="0.5"/><rect x="${100 + i * 92}" y="${560 + r * 300 - 168}" width="54" height="20" rx="4" fill="#a8a8b0"/>`).join('')).join('')}`;
  const hat = (kind, x, y, s) => `<g transform="translate(${x},${y}) scale(${s})">${{
    doc: `<path d="M-95,10 L-90,-70 C-60,-90 60,-90 90,-70 L95,10Z" fill="#f4f4f4"/><rect x="-14" y="-62" width="28" height="56" fill="#e02020"/><rect x="-28" y="-48" width="56" height="28" fill="#e02020"/>`,
    fire: `<path d="M-110,10 C-110,-110 110,-110 110,10Z" fill="#d02020"/><path d="M-140,10 L140,10 L120,30 L-120,30Z" fill="#a01818"/><rect x="-16" y="-96" width="32" height="90" fill="#e8c040"/>`,
    plumb: `<path d="M-95,10 C-95,-90 95,-90 95,10Z" fill="#2a5a9a"/><path d="M-95,10 L170,10 L150,30 L-95,30Z" fill="#1e4a80"/>`,
    guard: `<path d="M-95,10 C-95,-90 95,-90 95,10Z" fill="#14161a"/><path d="M-95,10 L170,10 L150,30 L-95,30Z" fill="#0a0c0e"/><text y="-20" text-anchor="middle" font-family="Inter" font-weight="900" font-size="34" fill="#e8e8e8">ОХРАНА</text>`
  }[kind]}</g>`;
  const seeds = (t, x, y) => Array.from({ length: 6 }, (_, i) => { const ph = (t * 0.9 + i / 6) % 1; return `<ellipse cx="${x + ph * 120 * (i % 2 ? 1 : -1)}" cy="${y - Math.sin(ph * Math.PI) * 120 + ph * 80}" rx="7" ry="4" fill="#2a2420" transform="rotate(${i * 60 + t * 200},${x},${y})" opacity="${1 - ph}"/>`; }).join('');
  const marinInset = (t, x, y, s, ex = {}) => `<g transform="translate(${x},${y})"><rect x="-10" y="-10" width="${400 * s + 20}" height="${470 * s + 20}" fill="#0a0d0f" stroke="#c8e08a" stroke-width="4"/><clipPath id="mi${Math.round(x)}"><rect width="${400 * s}" height="${470 * s}"/></clipPath><g clip-path="url(#mi${Math.round(x)})">${put('marin', { prop: false, expr: Object.assign({ brow: 14, smirk: -0.7, lid: 0.5 }, ex) }, 0, 20 * s, s, t)}</g></g>`;


  // ---------- декорации серии 6 ----------
  const dawnPlates = (t, where) => V.plates(where || 'С. ВАДУЛЕКА', clock(t).slice(0, 5) + ' · ДО ХРАМА ' + Math.max(0, 55 - Math.floor(t / 60)) + ' МИН', clock(t), { y: 170 });
  const P = (t, where) => dawnPlates(t, where);
  const mud = (t, lvl) => `<path d="M-80,${lvl} ${Array.from({ length: 14 }, (_, i) => `Q${i * 90 + 45},${lvl - 10 * Math.sin(t * 1.5 + i * 1.7)} ${i * 90 + 90},${lvl}`).join(' ')} L1180,2600 L-80,2600Z" fill="#5a4028"/>
    ${Array.from({ length: 26 }, (_, i) => `<ellipse cx="${(i * 173) % 1080}" cy="${lvl + 40 + (i * 97) % (1960 - lvl)}" rx="${30 + (i % 4) * 16}" ry="${8 + (i % 3) * 4}" fill="${i % 2 ? '#4a3420' : '#6a4a30'}"/>`).join('')}
    <path d="M-80,${lvl} ${Array.from({ length: 14 }, (_, i) => `Q${i * 90 + 45},${lvl - 10 * Math.sin(t * 1.5 + i * 1.7)} ${i * 90 + 90},${lvl}`).join(' ')}" fill="none" stroke="#8a6a48" stroke-width="5"/>`;
  const stars = (t, x, y, r = 90) => Array.from({ length: 5 }, (_, i) => { const a = t * 4 + i * 1.256; return `<path d="M0,-16 L5,-5 L16,-4 L7,4 L10,16 L0,9 L-10,16 L-7,4 L-16,-4 L-5,-5Z" fill="#ffd84a" transform="translate(${x + Math.cos(a) * r},${y + Math.sin(a) * r * 0.35})"/>`; }).join('');
  const tears = (t, x, y) => Array.from({ length: 10 }, (_, i) => { const ph = (t * 1.6 + i / 10) % 1; return `<ellipse cx="${x + (i % 2 ? 1 : -1) * (20 + ph * 140)}" cy="${y + ph * 200 - Math.sin(ph * Math.PI) * 120}" rx="10" ry="16" fill="#9ad8ff" opacity="${1 - ph}"/>`; }).join('');
  const sparkle = (t, n = 10) => Array.from({ length: n }, (_, i) => { const x = 140 + (i * 197) % 800, y = 500 + (i * 131) % 700, k = Math.abs(Math.sin(t * 5 + i)); return `<path d="M${x},${y - 22 * k} L${x + 6},${y} L${x},${y + 22 * k} L${x - 6},${y}Z M${x - 22 * k},${y} L${x},${y - 6} L${x + 22 * k},${y} L${x},${y + 6}Z" fill="#fff" opacity="${k}"/>`; }).join('');
  const butt = (x, y, col, label, t, ph) => `<g transform="translate(${x},${y + Math.sin(t * 8 + ph) * 8})"><path d="M-90,30 C-100,-70 -10,-80 0,-30 C10,-80 100,-70 90,30Z" fill="${col}"/><path d="M0,-30 L0,30" stroke="#000" stroke-width="5" opacity="0.4"/>
    <g transform="translate(-40,-60) rotate(${Math.sin(t * 10 + ph) * 25})"><rect x="-18" y="-150" width="36" height="150" rx="16" fill="${col}"/></g><g transform="translate(40,-60) rotate(${-Math.sin(t * 10 + ph) * 25})"><rect x="-18" y="-150" width="36" height="150" rx="16" fill="${col}"/></g>
    <text y="90" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="30" fill="#fff" stroke="#05070a" stroke-width="6" paint-order="stroke">${label}</text></g>`;
  const curlerBall = (t, x, y, s) => `<circle cx="${x}" cy="${y}" r="${30 * s}" fill="url(#ballG)"/><ellipse cx="${x - 8 * s}" cy="${y - 10 * s}" rx="${8 * s}" ry="${5 * s}" fill="#fff" opacity="0.8"/>`;
  const mudStreet = (t, lvl) => V.bgStreet(t) + mud(t, lvl);
  const bottle = (x, y, r, s) => `<g transform="translate(${x},${y}) rotate(${r}) scale(${s})"><path d="M-22,-40 L-22,-150 C-22,-170 -10,-176 -8,-196 L-8,-240 L8,-240 L8,-196 C10,-176 22,-170 22,-150 L22,-40Z" fill="#2a6a3a" opacity="0.95"/><rect x="-16" y="-140" width="6" height="90" fill="#cfe8c0" opacity="0.4"/><rect x="-9" y="-252" width="18" height="14" fill="#c8a040"/></g>`;

  // ---------- тайминг ----------
  const T = {
    brosil: wt('бросил'), b1: wt('Биток'), lob: wt('лоб'), b2: wt('Биток', 2), nah: wt('Нахуй'), shvyr: wt('швырнул'), b3: wt('Биток', 3), malch: wt('Мальчики'),
    a1: wt('А'), vag: wt('Вагинальная'), st1: wt('Стеклорез'), lbom: wt('Лбом'), no: wt('Но'), otsk: wt('отскочил', 2), on2: wt('Он', 2), i2: wt('И', 2), butyl: wt('бутылку'), dovolen: wt('Доволен'),
    st3: wt('Стеклорез', 3), steklo: wt('стекло'), tolko: wt('Только'), oni: wt('Они'), tapok: wt('тапок'), anal: wt('Анальный'), petard: wt('Петардой'), babah: wt('Бабах'), uletel: wt('улетел'),
    vse: wt('Все'), a2: wt('А', 2), progl: wt('проглотил'), pzd: wt('Пиздец'), last: W[W.length - 1][2]
  };
  const END = T.last + 2.6;
  const B = [0, T.b1 - 0.15, T.b2 - 0.15, T.nah - 0.15, T.b3 - 0.15, T.malch - 0.15, T.a1 - 0.15, T.vag - 0.15, T.st1 - 0.15, T.no - 0.15, T.on2 - 0.15, T.i2 - 0.15, T.st3 - 0.15, T.tolko - 0.15, T.oni - 0.15, T.anal - 0.15, T.babah - 0.1, T.vse - 0.15, T.a2 - 0.15, T.pzd - 0.1, T.last + 0.6, END];
  const VIOc = Object.assign({}, VIO);
  const scenes = [
    // 1. Лысый тянется — я бросаю биток
    [B[0], B[1], (t, l) => {
      if (t < T.brosil - 0.3) return `<rect width="1080" height="1920" fill="#3a1a2a"/>` + glow(540, 900, 700, '#ff8ac0', 0.22) + cam(put('lysy', { prop: false, expr: { lid: 0.45, smirk: 0.8, brow: -8 } }, 40, 500, 2.5, t) + hat('guard', 540, 650, 2.1) + handReach(700, 1900 - ease(seg(t, 0, T.brosil)) * 450, -10, '#2a5a9a', '#d8a080'), 1.2, 540, 900) + P(t, 'ДОМ ДЯДИ ИОНА');
      const p = seg(t, T.brosil - 0.3, B[1]);
      return cam(blurBg(doorOut(t, 1, 0.6)), 1.4, 540, 1000) + dim(0.35) + inWater('ya', { prop: p < 0.15, expr: { lid: 0.1, brow: 10, mo: 0.5, look: 4 } }, 40, 560, 2.5, t, 1720) +
        (p > 0.15 ? `<circle cx="${330 + p * 900}" cy="${1600 - p * 1500}" r="${50 - p * 30}" fill="url(#ballG)"/>` : '') + P(t, 'ДОМ ДЯДИ ИОНА');
    }],
    // 2. Биток — Стеклорезу в лоб
    [B[1], B[2], (t, l) => { const hit = T.lob, d = seg(t, B[1], hit);
      return cam(blurBg(bgChurch(t)), 1.5, 540, 1100) + dim(0.15) + put('vlad', { over: { shades: false }, expr: { lid: t > hit ? 0.55 : 0.2, brow: t > hit ? -10 : 12, mo: t > hit ? 0.4 : 0, look: t > hit ? Math.sin(t * 12) * 5 : 0 } }, 40, 560, 2.5, t) +
        (t < hit ? `<circle cx="${-100 + d * 640}" cy="${200 + d * 520}" r="${30 + d * 40}" fill="url(#ballG)"/>` : stars(t, 540, 700) + `<g transform="translate(540,560)" opacity="${1 - seg(t, hit + 0.6, hit + 1.1)}"><text text-anchor="middle" font-family="Inter" font-weight="900" font-size="120" fill="#ffd84a" stroke="#05070a" stroke-width="10" paint-order="stroke">ДЫНЬ</text></g>`) +
        water(t, 1720, '#3a5a8a', 0.85) + counter(t, hit + 1.0, 0, 'ЛОБ', 'ВПЕРВЫЕ ПРОИГРАЛ', '#9ae8ff') + P(t); }],
    // 3. Биток в руки Местному алкашу
    [B[2], B[3], (t, l) => { const c = t > T.b2 + 0.8;
      return cam(blurBg(bgChurch(t)), 1.5, 540, 1100) + dim(0.15) + put('marin', { prop: false, expr: { lid: c ? 0.6 : 0.3, brow: c ? 16 : -4, smirk: -0.6, look: c ? -4 : 0 } }, 40, 540, 2.5, t) +
        (c ? curlerBall(t, 330, 1560, 1.6) : `<circle cx="${1100 - seg(t, B[2], T.b2 + 0.8) * 770}" cy="${600 + seg(t, B[2], T.b2 + 0.8) * 960}" r="48" fill="url(#ballG)"/>`) + water(t, 1720, '#3a5a8a', 0.85) +
        nameTag(t, T.b2 + 0.9, 'МАРИН', '«Местный алкаш»', '#c8e08a') + P(t); }],
    // 4. «Не пьётся!» — швырнул через плечо
    [B[3], B[4], (t, l) => { const thrown = t > T.shvyr;
      return cam(blurBg(bgChurch(t)), 1.5, 540, 1100) + dim(0.15) + put('marin', { prop: false, expr: { lid: 0.3, brow: 18, mo: vTalk(t, 'M') ? 0.4 + vTalk(t, 'M') : 0.15, smirk: -0.8 } }, 40, 540, 2.5, t, '') +
        (!thrown ? curlerBall(t, 540, 1260 + Math.sin(t * 6) * 10, 1.6) : `<circle cx="${540 + seg(t, T.shvyr, B[4]) * 700}" cy="${1260 - Math.sin(seg(t, T.shvyr, B[4]) * Math.PI) * 900}" r="44" fill="url(#ballG)"/>`) +
        water(t, 1720, '#3a5a8a', 0.85) + counter(t, T.nah + 1.6, 0, 'ПЬЁТСЯ', 'НЕТ', '#ff6a5a') + P(t); }],
    // 5. Биток застрял в бигудях у Смертоносного гея
    [B[4], B[5], (t, l) => { const st = seg(t, B[4], T.b3 + 0.4);
      return `<rect width="1080" height="1920" fill="#0a1420"/>` + glow(540, 800, 600, '#ff5a9a', 0.14) + `<g filter="url(#nite2)">${cam(put('virel', { prop: false, over: VIOc, expr: { lid: st >= 1 ? -0.1 : 0.4, brow: st >= 1 ? -14 : 0, mo: st >= 1 ? 0.4 : 0 } }, 40, 500, 2.5, t), 1.25, 540, 850, shake(t, T.b3 + 0.4, 0.3, 14), t)}</g>` +
        (st < 1 ? `<circle cx="${1200 - st * 620}" cy="${200 + st * 450}" r="50" fill="url(#ballG)"/>` : curlerBall(t, 600, 640, 2.2)) + water(t, 1720) + counter(t, wt('Намертво'), 0, 'ЗАСТРЯЛ', 'НАМЕРТВО', '#ff5a9a') + P(t, 'БАР «У ИОНА»'); }],
    // 6. «Мальчики… у меня новая причёска»
    [B[5], B[6], (t, l) => `<rect width="1080" height="1920" fill="#3a1030"/>` + glow(540, 800, 700, '#ff5a9a', 0.25) + `<g filter="url(#nite2)">${cam(put('virel', { prop: false, over: VIOc, expr: { lid: 0.5, smirk: 0.9, mo: vTalk(t), brow: -6, wink: t > T.malch + 1.2 && t < T.malch + 1.8 } }, 40, 500, 2.5, t), 1.2 + l * 0.15, 540, 850)}</g>` +
      curlerBall(t, 600, 640, 2.2) + sparkle(t, 14) + heart(800, 480, 1.1, 0.9) + water(t, 1720) + P(t, 'БАР «У ИОНА»')],
    // 7. Вода уходит — село превращается в болото
    [B[6], B[7], (t, l) => { const lv = 1250 + ease(l) * 300;
      return cam(V.bgStreet(t) + (l < 0.6 ? water(t, lv, '#2a5a80', 0.85 * (1 - l)) : '') + mud(t, 1250 + Math.max(0, l - 0.3) * 200), 1.1, 540, 1100) + counter(t, T.a1 + 1.0, 0, 'ВОДА', 'УШЛА', '#7ac8ff') + V.plates('С. ВАДУЛЕКА', 'БОЛОТО', null, { y: 170 }); }],
    // 8. Вагинальная пробка сел на мель
    [B[7], B[8], (t, l) => cam(mudStreet(t, 1300) + `<g transform="translate(540,1420)">${put('yura', { prop: false, expr: { smirk: -0.3, lid: 0.5, brow: 6, look: Math.sin(t) * 4 } }, -200 * 1.3, -300 * 1.3 - 80, 1.3, t)}${seatRing(0, 40, 1.5)}</g>`, 1.1, 540, 1150) +
      nameTag(t, T.vag + 0.3, 'ЮРА', '«Вагинальная пробка»', '#ff6aff') + counter(t, wt('мель') + 0.2, 0, 'СТАТУС', 'НА МЕЛИ', '#b08a5a') + P(t)],
    // 9. Стеклорез идёт на бигуди лбом
    [B[8], B[9], (t, l) => { const run = ease(l);
      return cam(mudStreet(t, 1350) + `<g transform="translate(${870},${1380})" filter="url(#nite2)">${put('virel', { prop: false, over: VIOc, expr: { lid: -0.05, brow: -14 } }, -200 * 0.9, -300 * 0.9 - 60, 0.9, t)}${curlerBall(t, 30, -300 * 0.9 - 60 + 80, 1)}</g>` +
        `<g transform="translate(${150 + run * 420},${1400}) rotate(${run * 20})">${put('vlad', { over: { shades: false }, expr: { brow: 18, lid: 0.1, mo: 0.3 } }, -200 * 0.9, -300 * 0.9 - 60, 0.9, t * 2)}</g>`, 1.15, 540, 1150, run > 0.6 ? 6 : 0, t) +
        nameTag(t, T.st1 + 0.2, 'ВЛАД', '«Стеклорез»', '#9ae8ff') + P(t); }],
    // 10. Бигуди пластиковые — лоб отскочил
    [B[9], B[10], (t, l) => { const hit = T.no + 0.3, back = ease(seg(t, wt('отскочил', 2), wt('отскочил', 2) + 0.6));
      return cam(mudStreet(t, 1350) + `<g transform="translate(870,1380)" filter="url(#nite2)">${put('virel', { prop: false, over: VIOc, expr: { lid: 0.5, smirk: 0.9 } }, -200 * 0.9, -300 * 0.9 - 60, 0.9, t)}${curlerBall(t, 30, -300 * 0.9 - 60 + 80, 1)}</g>` +
        `<g transform="translate(${570 - back * 380},${1400}) rotate(${20 - back * 60})">${put('vlad', { over: { shades: false }, expr: { brow: t > hit ? -12 : 18, lid: t > hit ? 0.6 : 0.1, mo: 0.4 } }, -200 * 0.9, -300 * 0.9 - 60, 0.9, t)}</g>` +
        (t > hit ? stars(t, 570 - back * 380, 1100, 70) + `<g transform="translate(540,800)" opacity="${1 - seg(t, hit + 0.8, hit + 1.4)}"><text text-anchor="middle" font-family="Inter" font-weight="900" font-size="120" fill="#ff6a8a" stroke="#05070a" stroke-width="10" paint-order="stroke">БОЙНЬ</text></g>` : ''),
        1.15, 540, 1150, shake(t, hit, 0.4, 18), t) + counter(t, wt('Впервые', 2), 0, 'РАЗБИТО', '0', '#9ae8ff') + P(t); }],
    // 11. Стеклорез сел в грязь и заплакал
    [B[10], B[11], (t, l) => { const cry = t > wt('заплакал');
      return cam(blurBg(mudStreet(t, 1350)), 1.4, 540, 1100) + dim(0.15) + put('vlad', { over: { shades: false }, expr: { brow: -16, lid: cry ? 0.75 : 0.4, mo: cry ? 0.3 + 0.2 * Math.abs(Math.sin(t * 9)) : 0.1, smirk: -0.8 } }, 40, 620, 2.5, t) +
        (cry ? tears(t, 455, 1100) + tears(t + 0.5, 625, 1100) + handReach(900, 700 + Math.sin(t * 6) * 30, -150, '#c4708e', '#c89a7d') : '') + mud(t, 1720) + P(t); }],
    // 12. Местный алкаш нашёл бутылку — доволен второй раз
    [B[11], B[12], (t, l) => { const up = eout(seg(t, T.butyl - 0.3, T.butyl + 0.6)), hap = t > T.dovolen;
      return cam(blurBg(mudStreet(t, 1350)), 1.4, 540, 1100) + dim(0.15) + put('marin', { prop: false, expr: { lid: hap ? 0.6 : 0.2, brow: hap ? -10 : -6, smirk: hap ? 1 : 0.2, mo: hap ? 0.15 : 0.3 } }, 40, 560, 2.5, t) +
        bottle(800, 1950 - up * 420, -10 + Math.sin(t * 3) * 5, 1.6) + mud(t, 1740) + (hap ? heart(780, 560, 1.2, 0.9) : '') +
        counter(t, T.dovolen, 0, 'ДОВОЛЕН', '2 РАЗА ЗА СУТКИ', '#5cff7a') + P(t); }],
    // 13. Стеклорез перестал плакать: бутылка — это стекло
    [B[12], B[13], (t, l) => { const lk = seg(t, T.steklo, T.steklo + 0.8), tg = Math.max(0, Math.sin(lk * Math.PI * 2)) * 60;
      const L = V.CH.vlad.L, my = 272 + L * 0.6;
      return cam(blurBg(mudStreet(t, 1350)), 1.4, 540, 1100) + dim(0.25, '#1a1020') + cam(put('vlad', { over: { shades: true }, expr: { brow: 10, lid: 0.25, smirk: 0.8, mo: lk > 0 && lk < 1 ? 0.6 : 0 } }, 40, 560, 2.5, t) +
        (lk > 0 && lk < 1 ? `<path d="M${40 + 2.5 * 175},${560 + 2.5 * (my + 4)} C${40 + 2.5 * 172},${560 + 2.5 * (my + 18 + tg)} ${40 + 2.5 * 228},${560 + 2.5 * (my + 18 + tg)} ${40 + 2.5 * 225},${560 + 2.5 * (my + 4)}Z" fill="#d06a7a"/>` : ''), 1.0 + l * 0.25, 540, 1000) +
        `<rect x="${40 + 2.5 * 220}" y="${560 + 2.5 * 172}" width="40" height="60" fill="#2a6a3a" opacity="${0.5 + 0.3 * Math.sin(t * 8)}"/>` + mud(t, 1760) + P(t); }],
    // 14. «Только, сука, попробуй»
    [B[13], B[14], (t, l) => `<rect width="1080" height="1920" fill="#2a1a10"/>` + glow(540, 900, 700, '#ff6a3a', 0.15) + cam(put('marin', { prop: false, expr: { lid: 0.2, brow: 20, mo: vTalk(t, 'M') ? 0.3 + vTalk(t, 'M') : 0.1, smirk: -0.9 } }, 40, 500, 2.5, t) + bottle(800, 1760, -8, 1.7), 1.25, 540, 950) + P(t)],
    // 15. Дуэль-вестерн, катится тапок
    [B[14], B[15], (t, l) => { const sep = `<rect width="1080" height="1920" fill="#c08040" opacity="0.35" style="mix-blend-mode:color"/>`;
      const band = (key, y, o) => `<g><clipPath id="band${y}"><rect x="0" y="${y}" width="1080" height="440"/></clipPath><g clip-path="url(#band${y})">${put(key, o, -300, y - 570, 4.2, t)}</g><rect x="0" y="${y}" width="1080" height="440" fill="none" stroke="#000" stroke-width="10"/></g>`;
      return `<rect width="1080" height="1920" fill="#e0b070"/>` + band('marin', 260, { prop: false, expr: { lid: 0.55, brow: 18 } }) + band('vlad', 760, { over: { shades: false }, expr: { lid: 0.55, brow: 18 } }) +
        cam(`<rect y="1260" width="1080" height="700" fill="#8a6038"/>` + (t > T.tapok - 0.4 ? `<g transform="translate(${-150 + seg(t, T.tapok - 0.4, T.tapok + 1.4) * 1400},1500) rotate(${t * 400})">${slipper(0, 0, 0, '#c05a6a')}</g>` : ''), 1.0, 540, 960) + sep +
        V.plates('С. ВАДУЛЕКА', 'ПОЛДЕНЬ (НЕТ)', null, { y: 170 }); }],
    // 16. Анальный террорист — петарда между ними
    [B[15], B[16], (t, l) => { const tossP = seg(t, T.petard + 0.2, B[16]);
      return cam(mudStreet(t, 1350) + put('yura', { prop: tossP <= 0, expr: { smirk: 1, lid: 0.3, look: 4 } }, 40, 700, 2.0, t) +
        (tossP > 0 ? `<g transform="translate(${400 + tossP * 500},${1200 - Math.sin(tossP * Math.PI) * 500}) rotate(${tossP * 720})"><rect x="-12" y="-60" width="24" height="70" rx="3" fill="#b2322a"/><circle cx="0" cy="-66" r="${10 + Math.abs(Math.sin(t * 30)) * 8}" fill="#ffd36b" filter="url(#blur4)"/></g>` : ''), 1.0, 540, 1050) +
        nameTag(t, T.anal + 0.2, 'ЮРА', '«Анальный террорист»', '#ffd84a') + P(t); }],
    // 17. Бабах: грязь до неба, бигуди разлетелись, биток улетел
    [B[16], B[17], (t, l) => { const a = T.babah;
      return cam(mudStreet(t, 1350) + boom(t, a, 540, 1350).replace(/#ffb040/g, '#8a6038').replace(/#fff3c0/g, '#ffd8a0') +
        Array.from({ length: 30 }, (_, i) => { const p = seg(t, a, a + 2.2), an = i * 2.4; return p > 0 && p < 1 ? `<ellipse cx="${540 + Math.cos(an) * 700 * p}" cy="${1350 - 1400 * p + 1600 * p * p * (0.5 + (i % 3) / 3)}" rx="${18 + (i % 4) * 8}" ry="${12 + (i % 3) * 6}" fill="#5a4028"/>` : ''; }).join('') +
        Array.from({ length: 7 }, (_, i) => flyer(t, wt('Бигуди') - 0.1, 1.2, [540, 1100], [100 + i * 150, -200], 720, `<rect x="-26" y="-17" width="52" height="34" rx="12" fill="${['#e07aa0', '#7ac0e0', '#e0c060'][i % 3]}"/>`)).join('') +
        flyer(t, T.uletel - 0.3, 1.0, [540, 1100], [1300, -300], 0, `<circle r="40" fill="url(#ballG)"/>`), 1.0, 540, 1050, shake(t, a, 0.8, 34), t) +
        `<rect width="1080" height="1920" fill="#8a6038" opacity="${0.5 * (1 - seg(t, a, a + 0.4)) * (t > a ? 1 : 0)}"/>` + P(t); }],
    // 18. Все нырнули в грязь — четыре задницы
    [B[17], B[18], (t, l) => cam(mudStreet(t, 1250) +
      butt(200, 1330, '#4c5236', t > wt('Пробка') - 0.1 ? 'ПРОБКА' : '', t, 0) + butt(430, 1350, '#1d1e24', t > wt('Стеклорез', 4) - 0.1 ? 'СТЕКЛОРЕЗ' : '', t, 1) +
      butt(660, 1330, '#7a7468', t > wt('Алкаш') - 0.1 ? 'АЛКАШ' : '', t, 2) + butt(890, 1350, '#c4708e', t > wt('Смертоносный') - 0.1 ? 'ГЕЙ' : '', t, 3) + mud(t, 1480), 1.1, 540, 1250) +
      counter(t, wt('бигуди', 3) || wt('Без'), 0, 'БИГУДИ', '0 ИЗ 7', '#ff6a8a') + P(t)],
    // 19. Нашёл Андрей. И проглотил
    [B[18], B[19], (t, l) => { const g = seg(t, T.progl - 0.1, T.progl + 0.8), L = V.CH.andrei.L, my = 272 + L * 0.6;
      const bx = 60 + 2.4 * 200, by0 = 600 + 2.4 * (my + 10);
      return cam(blurBg(mudStreet(t, 1300)), 1.4, 540, 1100) + dim(0.15) + put('andrei', { prop: false, expr: { lid: g > 0 ? -0.08 : 0.3, brow: g > 0 ? -14 : 4, mo: g > 0 && g < 0.3 ? 0.9 : 0.1, smirk: g >= 1 ? 0.8 : 0.2 } }, 60, 600, 2.4, t) +
        (g <= 0 ? `<circle cx="${bx}" cy="${by0 + 110}" r="50" fill="url(#ballG)"/>` : g < 1 ? `<circle cx="${bx}" cy="${by0 + g * 360}" r="${50 - g * 10}" fill="url(#ballG)" opacity="${g < 0.25 ? 1 : 0.35}"/>` : '') +
        (g > 0.2 && g < 1 ? `<g transform="translate(540,760)"><text text-anchor="middle" font-family="Inter" font-weight="900" font-size="120" fill="#ff3a3a" stroke="#05070a" stroke-width="10" paint-order="stroke">ГЛЫК</text></g>` : '') +
        mud(t, 1760) + nameTag(t, wt('Андрей') + 0.1, 'АНДРЕЙ', 'нашёл первым', '#7ac8ff') + P(t); }],
    // 20. «Пиздец»
    [B[19], B[20], (t, l) => cam(blurBg(mudStreet(t, 1300)) + put('andrei', { prop: false, expr: { lid: 0.4, smirk: 1, brow: -6, cheek: 0.3 } }, 60, 600, 2.4, t) + mud(t, 1760), 1.3, 540, 1050, shake(t, T.pzd, 0.7, 30), t) +
      `<rect width="1080" height="1920" fill="#ff2020" opacity="${0.35 * (1 - seg(t, T.pzd, T.pzd + 0.4)) * (t > T.pzd ? 1 : 0)}"/>` + counter(t, T.pzd + 0.2, 0, 'БИТОК', 'ВНУТРИ АНДРЕЯ', '#ff3a3a') + P(t)],
    // 21. Продолжение следует
    [B[20], END, (t, l) => { const a = B[20]; return `<rect width="1080" height="1920" fill="#000"/>
      <text x="540" y="900" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="64" fill="#e8dcc8" opacity="${eout(seg(t, a, a + 0.3))}">ПРОДОЛЖЕНИЕ</text>
      <text x="540" y="990" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="64" fill="#e8dcc8" opacity="${eout(seg(t, a + 0.4, a + 0.7))}">СЛЕДУЕТ</text>
      <text x="540" y="1120" text-anchor="middle" font-family="JetBrains Mono" font-size="30" fill="#8a96a8" opacity="${seg(t, a + 0.8, a + 1.1)}">ВАДУЛЕКА · СЕРИЯ 6</text>`; }]
  ];

  function nameTag(t, a, name, nick, col) {
    if (!a || t < a) return '';
    const p = eout(seg(t, a, a + 0.3));
    const w = Math.max(name.length, nick.length) * 25 + 60;
    return `<g transform="translate(${60 - (1 - p) * 500},1150)"><rect width="${w}" height="130" fill="#0a0d0f" opacity="0.8"/><rect width="${w}" height="130" fill="none" stroke="${col}" stroke-width="4"/>
      <text x="26" y="56" font-family="JetBrains Mono" font-weight="800" font-size="46" fill="${col}">${name}</text>
      <text x="26" y="106" font-family="JetBrains Mono" font-weight="500" font-size="34" fill="#e8eee8">${nick}</text></g>`;
  }


  function frame(t) {
    const i = scenes.findIndex(s => t >= s[0] && t < s[1]);
    const sc = scenes[i < 0 ? scenes.length - 1 : i];
    const l = seg(t, sc[0], sc[1]);
    let body = sc[2](t, l);
    // короткий проблеск-затемнение на стыке сцен
    const d = Math.min(t - sc[0], sc[1] - t);
    const fade = i > 0 && d < 0.06 ? 0.6 : 0;
    return `<defs>${V.defs()}
      <filter id="bgBlur6" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="mono" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.25 0.5 0.1 0 0.02  0.3 0.62 0.12 0 0.06  0.2 0.42 0.08 0 0.02  0 0 0 1 0"/></filter>
      <filter id="sil" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.16 0 0 0 0.01  0 0.17 0 0 0.02  0 0 0.24 0 0.04  0 0 0 1 0"/></filter>
      <filter id="nite" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.3 0 0 0 0  0 0.36 0 0 0.01  0 0 0.5 0 0.03  0 0 0 1 0"/></filter>
      <filter id="nite2" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.55 0.05 0 0 0  0 0.5 0.05 0 0  0 0 0.6 0 0.02  0 0 0 1 0"/></filter>
    <filter id="wetF" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.75 0 0.05 0 0  0 0.85 0.08 0 0.02  0 0.05 1.05 0 0.06  0 0 0 1 0"/></filter>
    </defs>${body}${subs(t)}${V.overlay(t)}<rect width="1080" height="1920" fill="#000" opacity="${fade}"/>`;
  }
  G.EP = { frame, END, scenes, B, T };
})(window);

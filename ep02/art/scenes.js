// Серия 2 — покадровая анимация.
(function (G) {
  'use strict';
  const V = G.VAD, W = G.WORDS;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / (b - a));
  const ease = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
  const eout = (x) => 1 - Math.pow(1 - x, 3);
  const wt = (word, n = 1) => { let k = 0; for (const w of W) if (w[0].replace(/[«»,.…—]/g, '') === word && ++k === n) return w[1]; return null; };
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
  const clock = (t) => { const s = 180 + Math.floor(t); return `03:0${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
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
    'смыв': '#7ac8ff', 'неделю': '#7ac8ff', 'Доставай': '#ff6a8a', 'локоть': '#ff8a5a', 'булькнул': '#7ac8ff', 'Вода': '#7ac8ff', 'толчок': '#7ac8ff', 'Пиздец': '#ff3a3a', 'правильное': '#5cff7a', 'Виорел': '#ff8a6a', 'Юра': '#ffd84a', 'Андрей': '#7ac8ff', 'Андрея': '#7ac8ff', 'Андрюша': '#7ac8ff' });
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
    const items = ln.ws.map(w => { const who = w[3]; const bare = w[0].replace(/[«»,.…—]/g, ''); let txt = w[0]; if (SUB[bare]) txt = txt.replace(bare, SUB[bare]); return { txt, bare, who, on: t >= w[1] - 0.05, cur: t >= w[1] - 0.05 && t < w[2] + 0.1 }; });
    const pop = eout(seg(t, ln.a, ln.a + 0.12));
    const sp = items.map(w => { const col = KEY[w.bare] || (w.who === 'V' ? '#ffb0d4' : '#ffffff'); return `<tspan fill="${w.on ? col : '#7d838e'}">${w.txt}</tspan>`; }).join(' ');
    const s = `<text x="540" y="${y}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${fs}" stroke="#05070a" stroke-width="10" paint-order="stroke" stroke-linejoin="round" xml:space="preserve">${sp}</text>`;
    return `<g opacity="${pop}" transform="translate(0,${(1 - pop) * 20})">${s}</g>`;
  }

  // ---------- сцены ----------

  // ---------- новые декорации серии 2 ----------
  const VIO = { cloth: 'robe', clothC: '#c4708e', curlers: 1, tag: 'МАМА' };
  const vTalk = (t) => W.some(w => w[3] === 'V' && t >= w[1] && t <= w[2]) ? 0.18 + 0.25 * Math.abs(Math.sin(t * 18)) : 0;

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
    if (o.flood) {
      const f = o.flood, lvl = 1920 - f * 1300;
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

  // ---------- тайминг ----------
  const T = {
    teper: wt('Теперь'), halat: wt('халате'), suka: wt('сука'), karm: wt('Карманы'), zas: wt('Засунул'), rot: wt('рот'), tem: wt('Тем'), zastr: wt('застрял'), jop: wt('Жопой'),
    yura: wt('Юра'), petard: wt('Петардой'), vystr: wt('выстрелило'), vesh: wt('вешалку'), shtor: wt('штору'), dver: wt('дверь'), viorel: wt('Виорел', 2), dva: wt('два'), pyat: wt('пятнадцать'),
    shchek: wt('Щёк'), dve: wt('две'), krug: wt('Круглые'), pups: wt('Пупсик'), andrei3: wt('Андрей', 2), hlop: wt('хлопнул'), bitok: wt('Биток'), unitaz: wt('унитаз'),
    privych: wt('привычке'), najal: wt('нажал'), no: wt('Но'), andr: wt('Андрюша'), zasuch: wt('засучил'), sunul: wt('Сунул'), lok: wt('локоть'), itut: wt('И', 2), bulk: wt('булькнул'),
    voda: wt('Вода'), pzd: wt('Пиздец'), vpervye: wt('Впервые'), last: W[W.length - 1][2]
  };
  const END = T.last + 2.6;
  const B = [0, T.teper - 0.15, T.karm - 0.15, T.zas - 0.15, T.tem - 0.15, T.yura - 0.15, wt('Андрея') - 0.15, T.viorel - 0.15, T.pups - 0.2, T.andrei3 - 0.15, T.bitok - 0.1, wt('Андрей', 3) - 0.15, T.andr - 0.15, wt('Андрей', 4) - 0.15, T.itut - 0.15, T.voda - 0.15, T.pzd - 0.2, T.last + 0.5, END];
  const scenes = [
    // 1. Виорел в прихожей, мамин халат
    [B[0], B[1], (t, l) => {
      const z = t > T.halat ? 1.15 + ease(seg(t, T.halat, T.halat + 0.8)) * 0.7 : 1.0 + l * 0.12;
      const cx = t > T.halat ? 380 : 540, cy = t > T.halat ? 1450 : 1000;
      return `<rect width="1080" height="1920" fill="#06070a"/>` + glow(300, 700, 500, '#7affa0', 0.12) +
        `<g filter="url(#nite2)">${cam(put('virel', { prop: false, over: VIO, expr: { lid: 0.5, smirk: 0.5, brow: 4 } }, 40, 520, 2.5, t), z, cx, cy, shake(t, T.suka, 0.3, 12), t)}</g>` + nowPlates(t);
    }],
    // 2. «Теперь я твоя мамочка» — подмигивает
    [B[1], B[2], (t, l) => {
      const wink = t > T.teper + 1.0 && t < T.teper + 1.6;
      return `<rect width="1080" height="1920" fill="#06070a"/>` + glow(540, 800, 600, '#ff5a9a', 0.12) +
        `<g filter="url(#nite2)">${cam(put('virel', { prop: false, over: VIO, expr: { lid: 0.45, smirk: 0.8, mo: vTalk(t), wink, brow: -4 } }, 40, 500, 2.5, t), 1.35 + l * 0.2, 540, 850)}</g>` +
        heart(820, 520 - l * 120, 1.4, eout(seg(t, T.teper + 1.0, T.teper + 1.3))) + heart(120, 700 - l * 80, 0.9, eout(seg(t, T.teper + 1.2, T.teper + 1.5))) + nowPlates(t);
    }],
    // 3. Карманы проверит… биток в руке
    [B[2], B[3], (t, l) => cam(blurBg(V.bgHallway(t, { flicker: 0.25 })), 1.5, 540, 1000) + dim(0.5) +
      `<g filter="url(#nite)">${cam(put('ya', { expr: { look: -4 + Math.sin(t * 5) * 3, brow: -10, lid: 0.25 } }, 40, 560, 2.5, t), 1.0 + l * 0.12, 500, 1150)}</g>` + nowPlates(t)],
    // 4. Биток в рот
    [B[3], B[4], (t, l) => {
      const ck = eout(seg(t, T.rot - 0.1, T.rot + 0.3));
      return cam(blurBg(V.bgHallway(t, { flicker: 0.25 })), 1.5, 540, 1000) + dim(0.5) +
        `<g filter="url(#nite)">${cam(put('ya', { prop: ck < 0.5, expr: { lid: -0.08, brow: -16, cheek: ck, look: 0 } }, 40, 560, 2.5, t), 1.3 + l * 0.3, 540, 1000, shake(t, T.rot, 0.25, 10), t)}</g>` + nowPlates(t);
    }],
    // 5. Андрей застрял в окне кладовки
    [B[4], B[5], (t, l) => {
      const z = t > T.jop ? 1.1 + ease(seg(t, T.jop, T.jop + 0.6)) * 0.5 : 1.0;
      return cam(bgWindowOut(t), z, 540, 1000, shake(t, T.zastr, 0.3, 8), t) + nowPlates(t, 'ОКНО КЛАДОВКИ') +
        (t > T.zastr ? `<g transform="translate(540,1300) rotate(-6)" opacity="${eout(seg(t, T.zastr, T.zastr + 0.2))}"><rect x="-200" y="-50" width="400" height="90" fill="#0a0d0f" opacity="0.8"/><rect x="-200" y="-50" width="400" height="90" fill="none" stroke="#7ac8ff" stroke-width="4"/><text y="18" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="48" fill="#7ac8ff">ЗАСТРЯЛ</text></g>` : '');
    }],
    // 6. Юра помогает петардой
    [B[5], B[6], (t, l) => cam(bgWindowOut(t, { pet: t > T.petard }), 1.0, 540, 1000) + dim(0.1) +
      put('yura', { expr: { smirk: 1, lid: 0.35, look: -5 } }, 500, 820, 1.7, t) + nowPlates(t, 'ОКНО КЛАДОВКИ') + nameTag(t, T.yura, 'ЮРА', 'помогает', '#ffd84a')],
    // 7. Андрея выстрелило в прихожую
    [B[6], B[7], (t, l) => {
      const a = B[6] + 0.05, sh = shake(t, a, 0.9, 34);
      const fl = t - a < 0.25 ? 0.7 * (1 - (t - a) / 0.25) : 0;
      const coat = `<path d="M-40,-120 C-60,-40 -70,80 -60,160 L60,160 C70,80 60,-40 40,-120Z" fill="#3e4a38"/>`;
      const curt = `<path d="M-90,-300 L90,-300 C70,0 110,200 80,300 L-80,300 C-110,200 -70,0 -90,-300Z" fill="#2f4a52"/>`;
      const door = `<rect x="-130" y="-260" width="260" height="520" fill="#5a4a3a"/><rect x="-100" y="-220" width="200" height="190" fill="none" stroke="#3a2e22" stroke-width="10"/><text y="120" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="56" fill="#e8dcc8">WC</text>`;
      const andr = `<g transform="scale(1.3) translate(-200,-300)">${V.character('andrei', { prop: false, expr: { mo: 0.9, lid: -0.08, brow: -14 } })}</g>`;
      return cam(V.bgHallway(t, { flicker: 0.5, pantry: 60 }) + boom(t, a, 1000, 1000) +
        flyer(t, T.vesh - 0.1, 1.0, [460, 700], [-200, 400], -260, coat) + flyer(t, T.shtor - 0.1, 1.1, [150, 900], [-300, 300], 200, curt) + flyer(t, T.dver - 0.1, 1.2, [700, 1100], [-300, 700], -400, door) +
        flyer(t, a, 1.6, [1150, 1100], [-400, 900], -720, andr), 1.0, 540, 960, sh, t) +
        `<rect width="1080" height="1920" fill="#fff4d0" opacity="${fl}"/>` + nowPlates(t);
    }],
    // 8. Виорел считает → щёки пупсика
    [B[7], B[8], (t, l) => {
      const cnt = counter(t, T.dva, 0, 'МАЛЬЧИКИ', '2') + counter(t, T.pyat, 1, 'ШАРЫ', '15') + counter(t, T.dve, 2, 'ЩЁКИ', '2') + counter(t, T.krug, 3, 'ФОРМА', 'КРУГЛЫЕ', '#ff6a8a');
      if (t < T.shchek - 0.15) return `<rect width="1080" height="1920" fill="#06070a"/>` + glow(300, 700, 500, '#7affa0', 0.1) +
        `<g filter="url(#nite2)">${cam(put('virel', { prop: false, over: VIO, expr: { lid: 0.55, look: Math.sin(t * 2) * 4 } }, 40, 560, 2.4, t), 1.05, 540, 1000)}</g>` + cnt + nowPlates(t);
      return cam(blurBg(V.bgHallway(t, { flicker: 0.25 })), 1.5, 540, 1000) + dim(0.5) +
        `<g filter="url(#nite)">${cam(put('ya', { prop: false, expr: { lid: -0.08, brow: -16, cheek: 1, look: Math.sin(t * 6) * 4 } }, 40, 560, 2.5, t), 1.4 + seg(t, T.shchek, B[8]) * 0.6, 540 - seg(t, T.krug, B[8]) * 120, 1050)}</g>` + cnt + nowPlates(t);
    }],
    // 9. «Пупсик, открой ротик»
    [B[8], B[9], (t, l) => `<rect width="1080" height="1920" fill="#06070a"/>` + glow(540, 800, 600, '#ff5a9a', 0.1) +
      `<g filter="url(#nite2)">${cam(put('virel', { prop: false, over: VIO, expr: { lid: 0.4, smirk: 0.7, mo: vTalk(t), brow: -2 } }, 40, 500, 2.5, t), 1.3 + l * 0.15, 540, 860)}` +
      handReach(340 + ease(l) * 150, 2100 - ease(l) * 500, 20, '#c4708e', '#c89a7d') + `</g>` + nowPlates(t)],
    // 10. Хлопок по спине
    [B[9], B[10], (t, l) => {
      const hit = T.hlop, ck = t < hit ? 1 : 1 - eout(seg(t, hit, hit + 0.25));
      return cam(blurBg(V.bgHallway(t, { flicker: 0.25 })), 1.5, 540, 1000) + dim(0.5) +
        `<g filter="url(#nite)">${cam(put('ya', { prop: false, expr: { lid: t > hit ? -0.1 : 0, brow: -16, cheek: ck, mo: t > hit + 0.15 ? 0.8 : 0 } }, 40, 560, 2.5, t), 1.3, 540, 1000, shake(t, hit, 0.5, 40), t)}</g>` +
        (t > hit + 0.1 ? `<circle cx="${540 + seg(t, hit + 0.1, B[10]) * 700}" cy="${1120 - Math.sin(seg(t, hit + 0.1, B[10]) * 2.5) * 500}" r="${60 + seg(t, hit, B[10]) * 30}" fill="url(#ballG)"/>` : '') + nowPlates(t);
    }],
    // 11. Биток летит в унитаз
    [B[10], B[11], (t, l) => {
      const p = seg(t, T.bitok, T.unitaz + 0.2);
      const bx = -100 + p * 640, by = 300 + p * 670 - Math.sin(p * Math.PI) * 500;
      const inside = p >= 1;
      return cam(bgToilet(t, { ball: inside ? null : [bx, by] }), 1.0 + l * 0.1, 540, 1000, shake(t, T.unitaz + 0.2, 0.25, 14), t) +
        (inside ? `<g transform="translate(540,800)" opacity="${1 - seg(t, T.unitaz + 0.6, T.unitaz + 1.2)}"><text text-anchor="middle" font-family="Inter" font-weight="900" font-size="120" fill="#7ac8ff" stroke="#05070a" stroke-width="10" paint-order="stroke">ДЗЫНЬ</text></g>` : '') + nowPlates(t, 'МОЙ ТУАЛЕТ');
    }],
    // 12. Смыв — воды нет
    [B[11], B[12], (t, l) => {
      const pr = t > T.najal && t < T.najal + 0.5 ? 1 : 0;
      return cam(bgToilet(t, { press: pr }) + (t > T.najal - 0.4 ? handReach(560, 600 + (1 - ease(seg(t, T.najal - 0.4, T.najal))) * 500 + pr * 10, 180, '#262f4a', '#dcab8c') : ''), 1.4, 540, 800) +
        counter(t, T.no, 0, 'ВОДЫ НЕТ', '8 ДНЕЙ', '#7ac8ff') + nowPlates(t, 'МОЙ ТУАЛЕТ');
    }],
    // 13. «Андрюша. Доставай»
    [B[12], B[13], (t, l) => cam(blurBg(bgToilet(t)), 1.3, 540, 1000) + dim(0.35) +
      cam(put('andrei', { expr: { lid: 0.3, mo: 0, look: 0, brow: 6 } }, 60, 600, 2.4, t), 1.05 + l * 0.15, 540, 1050) +
      nameTag(t, T.andr + 0.1, 'АНДРЕЙ', 'смотрит в камеру', '#7ac8ff') + nowPlates(t, 'МОЙ ТУАЛЕТ')],
    // 14. Рука в унитаз по локоть
    [B[13], B[14], (t, l) => cam(bgToilet(t, { arm: ease(seg(t, T.sunul - 0.3, T.lok + 0.4)) }), 1.25 + l * 0.2, 560, 960) +
      counter(t, T.lok, 0, 'ГЛУБИНА', 'ПО ЛОКОТЬ', '#ff8a5a') + nowPlates(t, 'МОЙ ТУАЛЕТ')],
    // 15. …булькнул
    [B[14], B[15], (t, l) => cam(bgToilet(t, { arm: 1, bubble: ease(seg(t, T.bulk - 0.6, T.bulk + 0.2)) * (t < T.bulk + 0.3 ? 1 : 0) }), 1.5 + l * 0.6, 540, 960, shake(t, T.bulk + 0.25, 0.3, 12), t) + nowPlates(t, 'МОЙ ТУАЛЕТ')],
    // 16. Вода вернулась — через толчок
    [B[15], B[16], (t, l) => cam(bgToilet(t, { flood: ease(l) }) + flyer(t, B[15] + 0.1, 1.4, [600, 900], [1300, -200], 600, `<g transform="scale(0.9) translate(-200,-300)">${V.character('andrei', { prop: false, expr: { mo: 0.9, lid: -0.08, brow: -14 } })}</g>`),
      1.0, 540, 960, 10 + 8 * Math.sin(t * 9), t) + nowPlates(t, 'МОЙ ТОЛЧОК')],
    // 17. Мокрый Андрей с битком: «Пиздец»
    [B[16], B[17], (t, l) => `<rect width="1080" height="1920" fill="#1a3a52"/>` + cam(blurBg(bgToilet(t, { flood: 0.55 })), 1.2, 540, 1000) + dim(0.25, '#0a2a44') +
      `<g filter="url(#wetF)">${cam(put('andrei', { over: { prop: 'ball' }, expr: { lid: 0.35, smirk: t > T.vpervye ? 0.9 : 0.1, mo: t > T.pzd && t < T.pzd + 0.8 ? 0.6 : 0.1, brow: t > T.vpervye ? -6 : 4 } }, 60, 620, 2.4, t), 1.05 + l * 0.1, 540, 1050)}</g>` +
      drips(t) + `<path d="M-50,1700 ${Array.from({ length: 12 }, (_, i) => `Q${i * 100 + 50},${1700 - 20 * Math.sin(t * 5 + i)} ${i * 100 + 100},1700`).join(' ')} L1130,1990 L-50,1990Z" fill="#2a6a9a" opacity="0.7"/>` +
      nowPlates(t, 'МОЙ ТОЛЧОК')],
    // 18. Продолжение следует
    [B[17], END, (t, l) => { const a = B[17]; return `<rect width="1080" height="1920" fill="#000"/>
      <text x="540" y="900" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="64" fill="#e8dcc8" opacity="${eout(seg(t, a, a + 0.3))}">ПРОДОЛЖЕНИЕ</text>
      <text x="540" y="990" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="64" fill="#e8dcc8" opacity="${eout(seg(t, a + 0.4, a + 0.7))}">СЛЕДУЕТ</text>
      <text x="540" y="1120" text-anchor="middle" font-family="JetBrains Mono" font-size="30" fill="#8a96a8" opacity="${seg(t, a + 0.8, a + 1.1)}">ВАДУЛЕКА · СЕРИЯ 2</text>
      ${nowPlates(t, 'МОЙ ТОЛЧОК')}`; }]
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

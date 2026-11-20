// Серия 1 — покадровая анимация. frame(t) возвращает SVG кадра 1080×1920 в момент t (сек).
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
  const clock = (t) => { const s = Math.min(180, Math.floor(t * 2.08)); return `03:0${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  const nowPlates = (t, when) => V.plates('С. ВАДУЛЕКА', when || clock(t).slice(0, 5), clock(t), { y: 170 });

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
  const SUB = { 'Анальный': 'Ан*льный', 'спиздил': 'сп*здил', 'бля': 'бл*', 'Пиздец': 'П*здец' };
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
    if (t > T.pzd + 0.9) return '';
    const ln = lines.find(l => t >= l.a && t < l.b); if (!ln) return '';
    const fs = ln.ws.reduce((n, w) => n + w[0].length + 1, 0) > 17 ? 66 : 76, y = 1470;
    const items = ln.ws.map(w => { const bare = w[0].replace(/[«»,.…—]/g, ''); let txt = w[0]; if (SUB[bare]) txt = txt.replace(bare, SUB[bare]); return { txt, bare, on: t >= w[1] - 0.05, cur: t >= w[1] - 0.05 && t < w[2] + 0.1 }; });
    const pop = eout(seg(t, ln.a, ln.a + 0.12));
    const sp = items.map(w => { const col = KEY[w.bare] || '#ffffff'; return `<tspan fill="${w.on ? col : '#7d838e'}">${w.txt}</tspan>`; }).join(' ');
    const s = `<text x="540" y="${y}" text-anchor="middle" font-family="Inter" font-weight="900" font-size="${fs}" stroke="#05070a" stroke-width="10" paint-order="stroke" stroke-linejoin="round" xml:space="preserve">${sp}</text>`;
    return `<g opacity="${pop}" transform="translate(0,${(1 - pop) * 20})">${s}</g>`;
  }

  // ---------- сцены ----------
  const T = {
    andrei: wt('Андрея'), lop: wt('лопнула'), pyut: wt('пьют'), utrom: wt('Утром'), dnem: wt('днём'), noch: wt('ночью'),
    yura: wt('Юра'), tual: wt('туалеты'), viorel: wt('Виорел'), sch: wt('считает'), malch: wt('мальчиков'), but: wt('бутылки'), shary: wt('шары'),
    bil: wt('бильярд'), derev: wt('деревня'), ne_bud: wt('будет'), ukral: wt('спиздил'), edin: wt('Единственный'), kepku: wt('кепку'), zabyl: wt('забыл'),
    zaper: wt('Запер'), zad: wt('Задёрнул'), tolko: wt('Только'), domof2: wt('Домофон', 2), dvoe: wt('двое'), mam2: wt('Мамочка', 2), za: wt('За'),
    polov: wt('половица'), zapah: wt('Запахло'), vada: wt('Вадулека'), voda: wt('вода'), lick: wt('Облизывает'), ryadom: wt('Рядом'), sid: wt('сиденье'), vio2: wt('Виорел', 2), pups: wt('Пупсик'), pzd: wt('Пиздец'), domof1: wt('Домофон'), ya1: wt('Я'), posle: wt('После'), poet1: wt('Поэтому'), kazh: wt('Каждую'), zavtra: wt('Завтра'), poet2: wt('Поэтому', 2), no: wt('Но'), tolko2: wt('Только', 2), a2: wt('ходит') - 1.3
  };
  const END = T.pzd + 2.7;
  const B = [0, T.ya1 - 0.1, T.vada - 0.25, T.posle - 0.15, T.poet1 - 0.1, T.yura - 0.2, T.viorel - 0.3, T.kazh - 0.15, T.zavtra - 0.2, T.poet2 - 0.15, T.no - 0.1, wt('Запер') - 0.15, T.domof2 - 0.1, T.tolko2 - 0.1, T.a2, T.za - 0.1, T.vio2 - 0.15, T.pups - 0.15, T.pzd - 0.05, END];
  const scenes = [
    // 1. Прихожая, звонок
    [B[0], B[1], (t, l) => {
      const ring = (t % 1.4) < 0.9 ? 1 : 0;
      return cam(V.bgHallway(t, { ring, flicker: flick(t) }), 1.12 + l * 0.18, 520, 1000, 0, t) + nowPlates(t);
    }],
    // 2. Я у стены
    [B[1], B[2], (t, l) => {
      const g = (t % 1.4) < 0.9 ? Math.abs(Math.sin(t * 9)) : 0;
      return cam(blurBg(V.bgHallway(t, { ring: 1, flicker: flick(t) })), 1.5, 440, 1000) + dim(0.35) +
        cam(put('ya', { expr: { look: -3 + Math.sin(t * 1.5) * 2, brow: -9, lid: 0.08 } }, 40, 560, 2.5, t), 1 + l * 0.06, 540, 1100) +
        `<rect width="1080" height="1920" fill="#7affa0" opacity="${g * 0.08}"/>` + nowPlates(t);
    }],
    // 3. Деревня, неделю назад. Кран
    [B[2], B[3], (t, l) => {
      const tp = T.voda - 0.6;
      if (t > tp) return cam(tap(t, tp), 1.05 + seg(t, tp, B[3]) * 0.1, 600, 900) + V.plates('С. ВАДУЛЕКА', '7 ДНЕЙ НАЗАД', null, { y: 170 });
      return cam(V.bgStreet(t), 1.25 - l * 0.15, 540 + l * 80, 1100) + V.plates('С. ВАДУЛЕКА', '7 ДНЕЙ НАЗАД', null, { y: 170 });
    }],
    // 4. Андрей и туалет
    [B[3], B[4], (t, l) => {
      const sh = shake(t, T.lop, 0.8, 26);
      return cam(V.bgStreet(t) + fountain(t, T.lop, 260, 1080), 1.15, 400, 1200, sh, t) + dim(0.15) +
        cam(put('andrei', { expr: { look: t > T.lop ? -5 : 0, brow: t > T.lop ? -8 : -2, mo: t > T.lop ? 0.5 : 0.25 } }, 330, 760, 2.0, t), 1, 540, 960, sh * 0.5, t) +
        V.plates('С. ВАДУЛЕКА', '7 ДНЕЙ НАЗАД', null, { y: 170 }) + nameTag(t, T.andrei, 'АНДРЕЙ', '«Угроза унитаза»', '#7ac8ff');
    }],
    // 5. Коньяк вместо воды
    [B[4], B[5], (t, l) => {
      const pour = 0.25 + ease(seg(t, T.pyut - 0.2, T.pyut + 1.2)) * 0.7;
      let when = 'КАЖДЫЙ ДЕНЬ', tone = ['#000', 0];
      if (t > T.utrom) { when = '08:00'; tone = ['#9ac8ff', 0.35]; }
      if (t > T.dnem) { when = '14:00'; tone = ['#fff0c0', 0.4]; }
      if (t > T.noch) { when = '23:00'; tone = ['#0a1a40', 0.6]; }
      return cam(glasses(t, pour, tone), 1.0 + l * 0.08, 560, 1300) + V.plates('С. ВАДУЛЕКА', when, null, { y: 170 });
    }],
    // 6. Юра с петардой
    [B[5], B[6], (t, l) => {
      const bt = T.tual + 0.5, sh = shake(t, bt, 0.7, 30);
      const fl = t > bt && t < bt + 0.25 ? 0.8 * (1 - (t - bt) / 0.25) : 0;
      return cam(V.bgStreet(t) + boom(t, bt, 260, 1200) + crow(t, bt + 0.1), 1.15, 400, 1200, sh, t) + dim(0.12) +
        cam(put('yura', { expr: { smirk: 1, look: t > bt ? -4 : 2 } }, 330, 700, 2.1, t), 1, 540, 960, sh * 0.4, t) +
        `<circle cx="${330 + 116 * 2.1 + 6}" cy="${700 + (470 - 141) * 2.1}" r="${40 + noise(t * 5) * 15}" fill="#ffd36b" opacity="${t < bt ? 0.35 : 0}" filter="url(#blur8)"/>` +
        `<rect width="1080" height="1920" fill="#fff4d0" opacity="${fl}"/>` +
        V.plates('С. ВАДУЛЕКА', 'КАЖДУЮ НОЧЬ', null, { y: 170 }) + nameTag(t, T.yura, 'ЮРА', '«Ан*льный террорист»', '#ffd84a');
    }],
    // 7. Виорел считает
    [B[6], B[7], (t, l) => {
      const lid = 0.48 + seg(t, T.shary - 0.3, T.shary + 0.4) * 0.25;
      let cnt = '';
      [[T.malch, 'МАЛЬЧИКИ', '2'], [T.but, 'БУТЫЛКИ', '14'], [T.shary, 'ШАРЫ', '16']].forEach((c, i) => {
        if (t > c[0]) cnt += `<g transform="translate(60,${420 + i * 80})" opacity="${eout(seg(t, c[0], c[0] + 0.2))}"><rect width="420" height="62" fill="#0a0d0f" opacity="0.75"/><rect width="420" height="62" fill="none" stroke="#ff8a6a" stroke-width="3"/>
          <text x="18" y="43" font-family="JetBrains Mono" font-weight="700" font-size="32" fill="#ff8a6a">${c[1]}: <tspan fill="#fff">${c[2]}</tspan></text></g>`;
      });
      return cam(blurBg(V.bgBar(t)), 1.4, 540, 1200) + dim(0.3) +
        cam(put('virel', { expr: { lid, smirk: 0.45, look: Math.sin(t * 0.8) * 3 } }, 70, 600, 2.4, t), 1 + l * 0.1, 540, 1000) + cnt +
        V.plates('БАР «У ИОНА»', 'КАЖДУЮ НОЧЬ', null, { y: 170 }) + nameTag(t, T.viorel, 'ВИОРЕЛ', '«Мамочка»', '#ff8a6a');
    }],
    // 8. Бильярд → деревня не спит
    [B[7], B[8], (t, l) => {
      if (t < T.derev - 0.7) {
        const hit = T.bil, p = eout(seg(t, hit, hit + 1.4));
        const rack = [[480, 1360, '#c8a020'], [520, 1380, '#a02020'], [560, 1360, '#20308a'], [500, 1400, '#6a2a7a'], [540, 1400, '#1a1a1a'], [580, 1400, '#c05a10']];
        const dirs = [[-260, -120], [-60, -150], [240, -110], [-340, 200], [40, 230], [330, 160]];
        const balls = rack.map((b, i) => [b[0] + dirs[i][0] * p, b[1] + dirs[i][1] * p, b[2]]);
        const cp = seg(t, hit - 0.45, hit);
        balls.push([690 - cp * 150 - p * 40, 1520 - cp * 120 + p * 40, '#e8e4da']);
        return cam(V.bgBar(t, { balls, swing: 26 }), 1.25 - l * 0.1, 540, 1250, shake(t, hit, 0.3, 8), t) + V.plates('БАР «У ИОНА»', '02:00', null, { y: 170 });
      }
      const st = T.derev - 0.7;
      let win = '';
      [[40 + 240 * 0.3, 1060 + 60], [600 + 260 * 0.3, 1050 + 63], [900 + 200 * 0.3, 1040 + 54], [330 + 200 * 0.3, 1030 + 51]].forEach((w, i) => {
        const on = t > st + i * 0.35;
        win += `<rect x="${w[0]}" y="${w[1]}" width="50" height="60" fill="${on ? '#ffc060' : '#151820'}"/>${on ? `<circle cx="${w[0] + 25}" cy="${w[1] + 40}" r="15" fill="#2a1e14"/><rect x="${w[0] + 8}" y="${w[1] + 52}" width="34" height="10" fill="#2a1e14"/>` : ''}`;
      });
      return cam(V.bgStreet(t) + win, 1.3, 540, 1150) + V.plates('С. ВАДУЛЕКА', '02:00', null, { y: 170 });
    }],
    // 9. Афиша храма
    [B[8], B[9], (t, l) => {
      const stamp = eout(seg(t, T.ne_bud, T.ne_bud + 0.25));
      return cam(V.bgStreet(t) + (stamp > 0 ? `<g transform="translate(775,980) rotate(-14) scale(${2 - stamp})" opacity="${stamp}"><rect x="-110" y="-34" width="220" height="68" fill="none" stroke="#d02020" stroke-width="7"/><text y="20" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="44" fill="#d02020">ОТМЕНА?</text></g>` : ''),
        1.6 + ease(l) * 1.4, 775, 980, shake(t, T.ne_bud, 0.3, 10), t) + V.plates('С. ВАДУЛЕКА', 'ЗАВТРА · ХРАМ', null, { y: 170 });
    }],
    // 10. Кража битка
    [B[9], B[10], (t, l) => {
      if (t < T.edin - 0.1) {
        const a = T.ukral, inn = ease(seg(t, a - 0.5, a + 0.3)), out = ease(seg(t, a + 0.5, a + 1.3));
        const taken = t > a + 0.4;
        const balls = [[300, 1300, '#c8a020'], [700, 1280, '#a02020'], [420, 1580, '#20308a'], [880, 1600, '#6a2a7a']];
        if (!taken) balls.push([690, 1520, '#e8e4da']);
        const hy = 2300 - inn * 700 + out * 800;
        const hold = taken ? `<circle cx="4" cy="-150" r="46" fill="url(#ballG)"/>` : '';
        return cam(V.bgBar(t, { balls }) + handReach(700, hy - 120 * 0 + 0, -8, '#55627a', '#d2a083', hold), 1.8, 650, 1450) + V.plates('БАР «У ИОНА»', 'СЕГОДНЯ · 01:40', null, { y: 170 });
      }
      return cam(blurBg(V.bgBar(t)), 1.4, 540, 1200) + dim(0.3) +
        cam(put('ya', { expr: { brow: 6, smirk: 0.6, lid: 0.25, look: 2 } }, 40, 560, 2.5, t), 1 + l * 0.05, 540, 1100) + V.plates('БАР «У ИОНА»', 'СЕГОДНЯ · 01:40', null, { y: 170 });
    }],
    // 11. Забытая кепка
    [B[10], B[11], (t, l) => {
      const a = T.kepku, p = ease(seg(t, a - 0.2, a + 0.7)), q = ease(seg(t, a + 0.7, B[11]));
      const hx = 520 - 600 * (1 - p), hy = 1060 - 500 * (1 - p) - q * 600;
      return cam(V.bgBar(t) + (t < a + 0.7 ? cap(520, 1300) : '') +
        handReach(hx, hy + 240, 150, '#2d2421', '#c89a7d', t >= a + 0.7 ? `<g transform="translate(0,-170) rotate(180)">${cap(0, 0, 0.9)}</g>` : ''), 1.9, 520, 1250) + V.plates('БАР «У ИОНА»', 'СЕГОДНЯ · 01:41', null, { y: 170 });
    }],
    // 12. Запер, штора, кладовка
    [B[11], B[12], (t, l) => {
      const fl = flick(t, 0.35);
      if (t < T.zad) { const k = shake(t, T.zaper + 0.1, 0.25, 14); return cam(V.bgHallway(t, { flicker: fl }) + `<rect x="${640 + ease(seg(t, T.zaper, T.zaper + 0.25)) * 40}" y="1098" width="44" height="12" fill="#c8a060"/>`, 2.4, 640, 1080, k, t) + nowPlates(t); }
      if (t < T.tolko) return cam(V.bgHallway(t, { flicker: fl, sway: 1 + 6 * (1 - seg(t, T.zad, T.zad + 1.2)) }), 1.5, 200, 960) + nowPlates(t);
      const p = ease(seg(t, T.tolko, B[12]));
      return cam(V.bgHallway(t, { flicker: fl, pantry: p * 22 }), 1.4 + p * 1.0, 760 + p * 220, 1080) + nowPlates(t);
    }],
    // 13. Домофон: Юра облизывает камеру → Андрей с сиденьем
    [B[12], B[13], (t, l) => {
      if (t < T.ryadom - 0.1) { const lk = seg(t, T.lick - 0.2, T.ryadom); return cam(intercom(t, { lick: lk }), 1.05 + lk * 0.25, 540, 800, lk > 0 ? 3 : 0, t) + nowPlates(t); }
      const p = ease(seg(t, T.ryadom - 0.1, T.ryadom + 0.5));
      return cam(intercom(t, { seat: t > T.sid - 0.1 ? eout(seg(t, T.sid - 0.1, T.sid + 0.3)) : 0, smear: 1 }), 1.15 + p * 0.55, 540 + p * 30, 800) + nowPlates(t);
    }],
    // 14. «Только двое» — пустое место
    [B[13], B[14], (t, l) => cam(intercom(t, { smear: 1, seat: 1 }), 1.2 + ease(l) * 1.0, 840, 800) + nowPlates(t)],
    // 15. Моё лицо
    [B[14], B[15], (t, l) => {
      const fl = flick(t, 0.6);
      return cam(blurBg(V.bgHallway(t, { flicker: fl })), 1.5, 540, 1000) + dim(0.4 + (1 - fl) * 0.3) +
        cam(put('ya', { expr: { lid: -0.05, brow: -14, look: 4, mo: 0.15 } }, 40, 560, 2.5, t), 1.1 + l * 0.25, 540, 900) + nowPlates(t);
    }],
    // 16. Свет гаснет, Мамочка за спиной
    [B[15], B[16], (t, l) => {
      const off = seg(t, T.za, T.za + 0.25), app = ease(seg(t, T.polov - 0.3, T.zapah + 0.5));
      return cam(blurBg(V.bgHallway(t, { flicker: 1 - off * 0.95 })), 1.5, 540, 1000) + dim(0.5) +
        `<g opacity="${app}" filter="url(#sil)">${put('virel', { prop: false, expr: { lid: 0.55 } }, 470, 420, 2.3, t)}</g>` +
        `<g filter="url(#nite)">${put('ya', { expr: { lid: -0.05, brow: -14, look: 5 } }, -160, 640, 2.5, t)}</g>` +
        `<rect width="1080" height="1920" fill="#c07020" opacity="${0.12 * seg(t, T.zapah, T.zapah + 1)}" style="mix-blend-mode:soft-light"/>` + nowPlates(t);
    }],
    // 17. Виорел в бигудях и халате
    [B[16], B[17], (t, l) => {
      const on = eout(seg(t, B[16], B[16] + 0.35));
      return `<rect width="1080" height="1920" fill="#06070a"/>` + glow(300, 700, 500, '#7affa0', 0.12 * on) +
        `<g opacity="${on}" filter="url(#nite2)">${cam(put('virel', { prop: false, over: { cloth: 'robe', clothC: '#c4708e', curlers: 1 }, expr: { lid: 0.55, smirk: 0.5, brow: 4 } }, 40, 520, 2.5, t), 1.0 + l * 0.12, 540, 1000)}</g>` +
        nameTag(t, T.vio2 + 0.3, 'ВИОРЕЛ', '«Мамочка» · дома', '#ff6a8a') + nowPlates(t);
    }],
    // 18. «Пупсик… ты взял чужое»
    [B[17], B[18], (t, l) => {
      const talking = W.some(w => w[1] >= T.pups - 0.01 && w[1] < T.pzd - 0.1 && t >= w[1] && t <= w[2]);
      const mo = talking ? 0.2 + 0.25 * Math.abs(Math.sin(t * 18)) : 0;
      return `<rect width="1080" height="1920" fill="#030406"/>` +
        `<g filter="url(#nite2)">${cam(put('virel', { prop: false, over: { cloth: 'robe', clothC: '#c4708e', curlers: 1 }, expr: { lid: 0.62, mo, smirk: 0.35, brow: 7 } }, 40, 500, 2.5, t), 1.3 + l * 0.35, 540, 820)}</g>` + nowPlates(t);
    }],
    // 19. «Пиздец» → продолжение следует
    [B[18], B[19], (t, l) => {
      const a = T.pzd, hit = t < a + 0.6, card = a + 1.0;
      if (hit) return cam(`<rect width="1080" height="1920" fill="#030406"/><g filter="url(#nite2)">${put('virel', { prop: false, over: { cloth: 'robe', clothC: '#c4708e', curlers: 1 }, expr: { lid: 0.2, mo: 0.4, smirk: 0.9, brow: 12 } }, 40, 500, 2.5, t)}</g>`, 1.65, 540, 820, 34 * (1 - seg(t, a, a + 0.6)), t) +
        `<rect width="1080" height="1920" fill="#ff2020" opacity="${0.35 * (1 - seg(t, a, a + 0.4))}"/>`;
      return `<rect width="1080" height="1920" fill="#000"/>
      <text x="540" y="900" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="64" fill="#e8dcc8" opacity="${eout(seg(t, card, card + 0.3))}">ПРОДОЛЖЕНИЕ</text>
      <text x="540" y="990" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="64" fill="#e8dcc8" opacity="${eout(seg(t, card + 0.4, card + 0.7))}">СЛЕДУЕТ</text>
      <text x="540" y="1120" text-anchor="middle" font-family="JetBrains Mono" font-size="30" fill="#8a96a8" opacity="${seg(t, card + 0.8, card + 1.1)}">ВАДУЛЕКА · СЕРИЯ 1</text>
      ${V.plates('С. ВАДУЛЕКА', '03:03', '03:03:00', { y: 170 })}`;
    }]
  ];

  function nameTag(t, a, name, nick, col) {
    if (!a || t < a) return '';
    const p = eout(seg(t, a, a + 0.3));
    const w = Math.max(name.length, nick.length) * 25 + 60;
    return `<g transform="translate(${60 - (1 - p) * 500},1150)"><rect width="${w}" height="130" fill="#0a0d0f" opacity="0.8"/><rect width="${w}" height="130" fill="none" stroke="${col}" stroke-width="4"/>
      <text x="26" y="56" font-family="JetBrains Mono" font-weight="800" font-size="46" fill="${col}">${name}</text>
      <text x="26" y="106" font-family="JetBrains Mono" font-weight="500" font-size="34" fill="#e8eee8">${nick}</text></g>`;
  }

  function intercom(t, o = {}) {
    const bob = Math.sin(t * 3) * 6, lk = o.lick || 0;
    const wave = (x, y, ph) => `<g transform="translate(${x},${y}) rotate(${Math.sin(t * 8 + ph) * 18})"><rect x="-22" y="-120" width="44" height="130" rx="18" fill="#d7a586"/><rect x="-26" y="0" width="52" height="200" fill="#4c5236"/></g>`;
    const seat = o.seat ? `<g transform="translate(200,${352 - (1 - o.seat) * 200})" opacity="${o.seat}"><ellipse rx="150" ry="62" fill="none" stroke="#f2efe6" stroke-width="34"/><ellipse rx="150" ry="62" fill="none" stroke="#fff" stroke-width="6" opacity="0.6" transform="translate(-6,-10)"/><rect x="-40" y="-82" width="80" height="22" rx="8" fill="#d8d4c8"/></g>` : '';
    let yura;
    if (lk > 0) {
      const zz = 1 + eout(lk) * 1.6, tg = Math.max(0, Math.sin(lk * Math.PI * 3)) * 70;
      yura = `<g transform="translate(${130 + 400 * 0.4 * (1 - zz) + lk * 120},${700 - lk * 420}) scale(${0.8 * zz})">${V.character('yura', { prop: false, expr: { smirk: 0.4, lid: 0.55, mo: 0.7 } })}
        <path d="M178,286 C175,${300 + tg} 225,${300 + tg} 222,286Z" fill="#d06a7a"/><path d="M200,290 L200,${292 + tg * 0.8}" stroke="#a04a5a" stroke-width="3"/></g>`;
    } else yura = `<g transform="translate(130,${700 + bob}) scale(0.8)">${V.character('yura', { prop: false, expr: { smirk: 1, lid: 0.3 } })}</g>${wave(170, 1010 + bob, 0)}`;
    const smear = Math.max(lk > 0.3 ? (lk - 0.3) / 0.7 : 0, o.smear || 0);
    const inner = `<g filter="url(#mono)">
      <g transform="translate(370,${670 - bob}) scale(0.8)">${V.character('andrei', { prop: false, expr: { mo: 0.4, smirk: o.seat ? 0.9 : 0.2, lid: o.seat ? 0.4 : 0.28 } })}${seat}</g>${o.seat ? '' : wave(650, 990 - bob, 1)}
      ${yura}
      <g opacity="${smear * 0.55}" filter="url(#blur20)"><ellipse cx="380" cy="760" rx="220" ry="120" fill="#e0ffe0"/><ellipse cx="300" cy="900" rx="90" ry="200" fill="#e0ffe0" transform="rotate(20,300,900)"/></g>
      ${smear > 0 ? `<path d="M260,700 C300,800 280,900 320,1050 M420,690 C440,780 430,860 460,980" stroke="#e8ffe8" stroke-width="18" opacity="${smear * 0.35}" fill="none" stroke-linecap="round" filter="url(#blur4)"/>` : ''}
    </g>`;
    return V.bgIntercomScreen(t, { inner });
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
    </defs>${body}${subs(t)}${V.overlay(t)}<rect width="1080" height="1920" fill="#000" opacity="${fade}"/>`;
  }
  G.EP = { frame, END, scenes, B, T };
})(window);

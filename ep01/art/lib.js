// Вадулека — графическая библиотека в стиле «Кино-2D».
// Персонажи и фоны рисуются SVG-кодом. Свет — тёплая лампа слева, холодная тень справа.
(function (G) {
  'use strict';
  let UID = 0;
  const uid = (p) => `${p}${++UID}`;

  // ---------- цвет ----------
  const hex = (c) => { c = c.replace('#', ''); return [0, 2, 4].map(i => parseInt(c.substr(i, 2), 16)); };
  const toHex = (a) => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };

  // ---------- общие defs (фильтры) ----------
  function defs() {
    return `
    <filter id="blur2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2"/></filter>
    <filter id="blur4" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
    <filter id="blur8" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="8"/></filter>
    <filter id="blur20" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="20"/></filter>
    <filter id="blur50" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="50"/></filter>
    <filter id="shadeF" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.36 0.04 0.04 0 0.02  0.03 0.42 0.05 0 0.03  0.04 0.08 0.62 0 0.07  0 0 0 1 0"/></filter>
    <filter id="warmF" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1.12 0 0 0 0.03  0 1.02 0 0 0.01  0 0 0.84 0 0  0 0 0 1 0"/></filter>
    <filter id="white"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer><feFuncA type="table" tableValues="0 0.10"/></feComponentTransfer>
    </filter>
    <pattern id="scan" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect width="6" height="2" fill="#000" opacity="0.28"/>
    </pattern>
    <radialGradient id="vign" cx="50%" cy="48%" r="75%">
      <stop offset="55%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.7"/>
    </radialGradient>`;
  }

  // ---------- персонажи ----------
  const CH = {
    ya: {
      name: 'Я', nick: 'рассказчик', skin: '#d2a083', hair: '#2a201b', hairStyle: 'messy',
      w: 1.0, jaw: 0.98, L: 0, cloth: 'hoodie', clothC: '#55627a', eyes: '#5b4631',
      stubble: 0.12, expr: { lid: 0.12, brow: -7, smirk: 0, mo: 0 }, prop: 'ball'
    },
    yura: {
      name: 'ЮРА', nick: '«Анальный террорист»', skin: '#d7a586', hair: '#33281f', hairStyle: 'buzz',
      w: 0.97, jaw: 1.1, L: 4, cloth: 'bomber', clothC: '#4c5236', lining: '#c4652a', eyes: '#55643c',
      stubble: 0.38, scar: true, bags: 0.4, expr: { lid: 0.32, brow: 9, smirk: 1, mo: 0 }, prop: 'petard'
    },
    andrei: {
      name: 'АНДРЕЙ', nick: '«Угроза унитаза»', skin: '#dcab8c', hair: '#5a4530', hairStyle: 'cap',
      w: 1.17, jaw: 1.22, L: 8, cloth: 'track', clothC: '#262f4a', stripe: '#c9ccd2', eyes: '#3e4c60',
      stubble: 0.22, chubby: true, broad: 1.14, expr: { lid: 0.28, brow: -2, smirk: 0.2, mo: 0.25 }, prop: 'plunger'
    },
    virel: {
      name: 'ВИОРЕЛ', nick: '«Мамочка»', skin: '#c89a7d', hair: '#3c3633', hairStyle: 'slick',
      w: 0.92, jaw: 0.9, L: 10, cloth: 'leather', clothC: '#2d2421', eyes: '#3a2a20',
      stubble: 0.1, mustache: true, bags: 0.55, expr: { lid: 0.48, brow: 2, smirk: 0.45, mo: 0 }, prop: 'glass'
    }
  };

  function headPath(w, j, L, t = 58) {
    const X = (d) => 200 + d * w;
    return `M200,${t} C${X(52)},${t} ${X(86)},${t + 38} ${X(86)},150 C${X(87)},190 ${X(80 * j)},228 ${X(70 * j)},258 ` +
      `C${X(58 * j)},${283 + L} ${X(30 * j)},${302 + L} 200,${304 + L} C${X(-30 * j)},${302 + L} ${X(-58 * j)},${283 + L} ${X(-70 * j)},258 ` +
      `C${X(-80 * j)},228 ${X(-87)},190 ${X(-86)},150 C${X(-86)},${t + 38} ${X(-52)},${t} 200,${t}Z`;
  }

  function eye(cx, cy, side, c, e) {
    const s = side < 0 ? -1 : 1;
    const ly = -10 + e.lid * 13;
    const id = uid('eye');
    const lidC = mix(c.skin, '#6b4a45', 0.35);
    const line = mix(c.skin, '#21140f', 0.8);
    const b = -21 + (e.browY || 0);
    return `<g transform="translate(${cx},${cy}) scale(${s},1)">
      <clipPath id="${id}"><path d="M-17,1 C-9,-8 9,-10 17,-1 C9,6 -9,7 -17,1Z"/></clipPath>
      <ellipse cx="0" cy="-2" rx="24" ry="14" fill="${mix(c.skin, '#3b2b33', 0.38)}" opacity="0.55" filter="url(#blur4)"/>
      ${c.bags ? `<path d="M-15,6 C-6,${12 + c.bags * 4} 8,${12 + c.bags * 4} 17,4" fill="none" stroke="${mix(c.skin, '#4a3040', 0.5)}" stroke-width="2" opacity="${c.bags}" filter="url(#blur2)"/>` : ''}
      <g clip-path="url(#${id})">
        <rect x="-20" y="-14" width="40" height="24" fill="#d6cfc4"/>
        <circle cx="${1 + (e.look || 0)}" cy="0" r="7.3" fill="${c.eyes}"/>
        <circle cx="${1 + (e.look || 0)}" cy="0" r="7.3" fill="none" stroke="${mix(c.eyes, '#000', 0.5)}" stroke-width="1.2"/>
        <circle cx="${1 + (e.look || 0)}" cy="0" r="3.3" fill="#1b1411"/>
        <circle cx="${-2 + (e.look || 0)}" cy="-3" r="1.6" fill="#fff4e0" opacity="0.9"/>
        <path d="M-20,-16 L20,-16 L20,${ly} C8,${ly + 3} -8,${ly + 3} -20,${ly + 2}Z" fill="${lidC}"/>
        <rect x="-20" y="${ly}" width="40" height="5" fill="#2a1a18" opacity="0.25"/>
      </g>
      <path d="M-18,${Math.min(1, ly + 2.5)} C-8,${ly + 3.2} 9,${ly + 2.2} 18,${Math.max(-1, ly + 1)}" fill="none" stroke="${line}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M-15,${Math.min(-4, ly - 5)} C-6,${ly - 9} 8,${ly - 10} 17,${Math.min(-5, ly - 3)}" fill="none" stroke="${mix(c.skin, '#3a2420', 0.6)}" stroke-width="1.4" opacity="0.55"/>
      <path d="M-15,3 C-6,7 8,6 16,1" fill="none" stroke="${mix(c.skin, '#3a2420', 0.5)}" stroke-width="1" opacity="0.4"/>
      <g transform="rotate(${e.brow || 0},-18,${b})">
        <path d="M-19,${b + 3} C-8,${b - 3} 8,${b - 5} 22,${b + 1} C8,${b - 1} -6,${b + 1} -19,${b + 7}Z" fill="${mix(c.hair, '#000', 0.15)}"/>
      </g>
    </g>`;
  }

  function hair(c, X, front) {
    const h = c.hair, hl = mix(h, '#c9b9a5', 0.25);
    switch (c.hairStyle) {
      case 'messy': {
        if (!front) return `<path d="M${X(-90)},190 C${X(-100)},110 ${X(-72)},40 200,38 C${X(72)},40 ${X(100)},110 ${X(90)},190 Z" fill="${h}"/>`;
        let jag = '', n = 9;
        for (let i = 0; i <= n; i++) {
          const x = X(72 - i * 144 / n), y = 116 + (i % 2 ? 24 : 6) + (i === 3 ? 6 : 0);
          jag += ` L${x},${y}`;
        }
        return `<path d="M${X(-91)},170 C${X(-98)},100 ${X(-70)},38 200,36 C${X(72)},38 ${X(98)},100 ${X(91)},170 C${X(88)},140 ${X(82)},122 ${X(72)},116 ${jag} L${X(-80)},128 C${X(-86)},140 ${X(-89)},155 ${X(-91)},170Z" fill="${h}"/>
          <g stroke="${hl}" stroke-width="2" fill="none" opacity="0.35" stroke-linecap="round">
            <path d="M${X(-50)},60 C${X(-30)},80 ${X(-20)},100 ${X(-25)},128"/><path d="M${X(10)},48 C${X(20)},80 ${X(15)},100 ${X(5)},126"/>
            <path d="M${X(-70)},90 C${X(-60)},105 ${X(-55)},115 ${X(-58)},130"/></g>`;
      }
      case 'buzz': {
        if (!front) return '';
        return `<path d="M${X(-87)},165 C${X(-90)},92 ${X(-56)},50 200,50 C${X(56)},50 ${X(90)},92 ${X(87)},165 C${X(82)},132 ${X(74)},112 ${X(56)},106 C${X(30)},100 ${X(-30)},100 ${X(-56)},106 C${X(-74)},112 ${X(-82)},132 ${X(-87)},165Z" fill="${h}" opacity="0.88"/>
          <path d="M${X(-87)},165 C${X(-90)},92 ${X(-56)},50 200,50 C${X(56)},50 ${X(90)},92 ${X(87)},165" fill="none" stroke="${mix(h, '#000', 0.3)}" stroke-width="3" opacity="0.5"/>`;
      }
      case 'cap': {
        if (!front) return `<path d="M${X(-88)},150 L${X(-90)},205 L${X(-80)},205 L${X(-78)},150Z M${X(88)},150 L${X(90)},205 L${X(80)},205 L${X(78)},150Z" fill="${h}"/>`;
        const cc = '#1f2329';
        return `<ellipse cx="200" cy="152" rx="${84 * c.w}" ry="16" fill="#000" opacity="0.45" filter="url(#blur8)"/>
          <path d="M${X(-92)},140 C${X(-94)},60 ${X(-52)},30 200,30 C${X(52)},30 ${X(94)},60 ${X(92)},140 Z" fill="${cc}"/>
          <path d="M200,30 L200,138 M${X(-48)},40 C${X(-60)},80 ${X(-62)},110 ${X(-60)},138 M${X(48)},40 C${X(60)},80 ${X(62)},110 ${X(60)},138" stroke="#0e1013" stroke-width="2" fill="none" opacity="0.7"/>
          <circle cx="200" cy="32" r="5" fill="#15181c"/>
          <path d="M${X(-96)},136 C${X(-60)},122 ${X(60)},122 ${X(96)},136 C${X(86)},158 ${X(-86)},158 ${X(-96)},136Z" fill="#15181c"/>
          <path d="M${X(-90)},140 C${X(-60)},130 ${X(60)},130 ${X(90)},140" stroke="#3a4048" stroke-width="2" fill="none"/>`;
      }
      case 'slick': {
        const g = mix(h, '#a9a39c', 0.55);
        if (!front) return `<path d="M${X(-89)},185 C${X(-97)},100 ${X(-70)},44 200,42 C${X(70)},44 ${X(97)},100 ${X(89)},185 Z" fill="${h}"/>`;
        return `<path d="M${X(-89)},175 C${X(-95)},95 ${X(-66)},44 200,42 C${X(66)},44 ${X(95)},95 ${X(89)},175 C${X(84)},140 ${X(72)},112 ${X(50)},100 C${X(30)},106 ${X(18)},96 200,96 C${X(-18)},96 ${X(-30)},106 ${X(-50)},100 C${X(-72)},112 ${X(-84)},140 ${X(-89)},175Z" fill="${h}"/>
          <path d="M${X(-89)},175 C${X(-92)},140 ${X(-86)},120 ${X(-76)},110 L${X(-70)},150Z M${X(89)},175 C${X(92)},140 ${X(86)},120 ${X(76)},110 L${X(70)},150Z" fill="${g}" opacity="0.8"/>
          <g stroke="${g}" stroke-width="1.6" fill="none" opacity="0.45">
            ${[-60, -35, -12, 12, 35, 60].map(d => `<path d="M${X(d * 0.6)},98 C${X(d * 0.8)},80 ${X(d * 0.9)},68 ${X(d * 0.95)},58"/>`).join('')}
          </g>`;
      }
    }
    return '';
  }

  function cloth(c, front) {
    const cc = c.clothC, dk = mix(cc, '#0a0d14', 0.45), lt = mix(cc, '#e8dccb', 0.18);
    const torso = `M-10,600 L2,450 C14,390 58,352 120,338 L160,326 C180,344 220,344 240,326 L280,338 C342,352 386,390 398,450 L410,600 Z`;
    if (!front) {
      if (c.cloth === 'hoodie') // капюшон за шеей
        return `<path d="M120,345 C118,292 160,268 200,268 C240,268 282,292 280,345 Z" fill="${dk}"/>`;
      return '';
    }
    let s = `<path d="${torso}" fill="${cc}"/>
      <path d="M2,450 C14,390 58,352 120,338" fill="none" stroke="${lt}" stroke-width="3" opacity="0.35"/>
      <path d="M86,420 C90,480 84,540 80,600 M314,420 C310,480 316,540 320,600" stroke="${dk}" stroke-width="4" fill="none" opacity="0.5" filter="url(#blur2)"/>`;
    if (c.cloth === 'hoodie') {
      s += `<path d="M128,342 C140,312 170,300 200,300 C230,300 260,312 272,342 C250,330 225,326 200,348 C175,326 150,330 128,342Z" fill="${mix(cc, '#000', 0.2)}"/>
        <path d="M128,342 C150,330 175,326 200,348 C225,326 250,330 272,342" fill="none" stroke="${lt}" stroke-width="2.5" opacity="0.4"/>
        <path d="M188,350 C186,390 190,420 186,452" stroke="#d9d4ca" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <path d="M212,350 C214,385 211,415 214,440" stroke="#d9d4ca" stroke-width="3.5" fill="none" stroke-linecap="round"/>
        <rect x="182" y="450" width="8" height="14" rx="2" fill="#a9a399"/><rect x="210" y="438" width="8" height="14" rx="2" fill="#a9a399"/>
        <path d="M110,560 C160,540 240,540 290,560" stroke="${dk}" stroke-width="3" fill="none" opacity="0.6"/>`;
    } else if (c.cloth === 'bomber') {
      s += `<path d="M150,330 C170,352 230,352 250,330 L262,346 C235,374 165,374 138,346Z" fill="${mix(cc, '#000', 0.35)}"/>
        ${[0, 1, 2, 3].map(i => `<path d="M${142 + i * 2},${340 + i * 4} C175,${362 + i * 4} 225,${362 + i * 4} ${258 - i * 2},${340 + i * 4}" stroke="#000" stroke-width="1" opacity="0.25" fill="none"/>`).join('')}
        <path d="M188,368 L176,600 L224,600 L212,368Z" fill="${c.lining}"/>
        <path d="M200,368 L200,600" stroke="#8d8a7e" stroke-width="4" stroke-dasharray="3 3"/>
        <path d="M300,400 L332,392 L338,440 L306,448Z" fill="${dk}" opacity="0.7"/>
        <path d="M304,410 L334,402" stroke="#9a9a8a" stroke-width="2"/>`;
    } else if (c.cloth === 'track') {
      const st = c.stripe;
      s += `<path d="M150,322 L152,360 C180,372 220,372 248,360 L250,322 C230,340 170,340 150,322Z" fill="${mix(cc, '#000', 0.15)}"/>
        <path d="M200,350 L200,600" stroke="#9aa0aa" stroke-width="4"/>
        <path d="M200,350 L200,600" stroke="#000" stroke-width="1.5" stroke-dasharray="2 3" opacity="0.5"/>
        <path d="M120,340 C70,352 30,385 18,450 L8,600" stroke="${st}" stroke-width="9" fill="none"/>
        <path d="M134,342 C86,356 46,392 36,452 L28,600" stroke="${st}" stroke-width="9" fill="none"/>
        <path d="M280,340 C330,352 370,385 382,450 L392,600" stroke="${st}" stroke-width="9" fill="none"/>
        <path d="M266,342 C314,356 354,392 364,452 L372,600" stroke="${st}" stroke-width="9" fill="none"/>`;
    } else if (c.cloth === 'robe') {
      s += `<path d="M150,326 C170,360 190,420 200,470 C210,420 230,360 250,326 L262,334 C236,380 214,440 204,520 L196,520 C186,440 164,380 138,334Z" fill="${mix(cc, '#fff', 0.15)}"/>
        <path d="M120,340 C150,380 180,440 196,520 L178,600 L110,600 C100,500 96,420 120,340Z" fill="${mix(cc, '#fff', 0.22)}" opacity="0.6"/>
        <path d="M280,340 C250,380 220,440 204,520 L222,600 L290,600 C300,500 304,420 280,340Z" fill="${mix(cc, '#000', 0.12)}" opacity="0.6"/>
        ${Array.from({ length: 40 }, (_, i) => `<circle cx="${20 + (i * 97) % 360}" cy="${380 + (i * 53) % 210}" r="3" fill="#fff" opacity="0.12"/>`).join('')}
        <path d="M60,560 C140,540 260,540 340,560" stroke="${mix(cc, '#fff', 0.3)}" stroke-width="16" fill="none"/>
        ${c.tag ? `<g transform="translate(92,440) rotate(-8)"><rect width="100" height="46" fill="#f2ead8"/><rect width="100" height="46" fill="none" stroke="#a02040" stroke-width="3"/><text x="50" y="33" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="27" fill="#a02040">${c.tag}</text></g>` : ''}`;
    } else if (c.cloth === 'leather') {
      s += `<path d="M168,330 C180,352 220,352 232,330 L236,600 L164,600Z" fill="#1a1a1e"/>
        <path d="M160,326 L120,352 L158,410 L136,428 L186,520 L176,600 L150,600 L120,440 Z" fill="${mix(cc, '#000', 0.25)}"/>
        <path d="M240,326 L280,352 L242,410 L264,428 L214,520 L224,600 L250,600 L280,440 Z" fill="${mix(cc, '#000', 0.25)}"/>
        <path d="M160,326 L120,352 L158,410" stroke="${mix(cc, '#fff', 0.25)}" stroke-width="2" fill="none" opacity="0.5"/>
        <path d="M40,430 C60,410 90,400 110,400 M60,480 C70,470 90,466 104,468" stroke="#e6d6c2" stroke-width="3" opacity="0.18" fill="none"/>
        <path d="M182,352 C190,384 210,384 218,352" stroke="#c9a24a" stroke-width="2" fill="none"/>`;
    }
    return s;
  }

  function hand(x, y, c, rot = 0) {
    const sk = c.skin, dk = mix(sk, '#4a3040', 0.35);
    return `<g transform="translate(${x},${y}) rotate(${rot})">
      <path d="M-30,10 C-34,-14 -28,-30 -8,-32 L22,-30 C34,-28 36,-14 34,6 C32,26 18,36 0,36 C-18,36 -28,28 -30,10Z" fill="${sk}"/>
      <path d="M-20,-29 C-21,-18 -20,-8 -19,0 M-4,-31 C-5,-20 -4,-10 -4,0 M12,-31 C11,-20 12,-10 12,0" stroke="${dk}" stroke-width="2" opacity="0.45" filter="url(#blur2)"/>
      <path d="M-24,-30 C-10,-34 14,-34 28,-28" stroke="#fff0dc" stroke-width="3" fill="none" opacity="0.25"/>
      <path d="M-30,-2 C-42,-6 -44,-22 -34,-28 C-26,-32 -16,-26 -12,-16 C-14,-8 -22,-2 -30,-2Z" fill="${sk}"/>
      <path d="M-12,-16 C-14,-8 -22,-2 -30,-2" stroke="${dk}" stroke-width="1.5" fill="none" opacity="0.6"/>
      <path d="M-30,-14 C-31,-26 -24,-31 -14,-32" stroke="#fff0dc" stroke-width="3" fill="none" opacity="0.3"/>
      <path d="M-26,40 L-30,90 L30,90 L26,34Z" fill="${c.clothC}"/>
    </g>`;
  }

  function prop(c) {
    switch (c.prop) {
      case 'ball': return `<g transform="translate(118,468)">
          <circle cx="0" cy="-48" r="26" fill="url(#ballG)"/>
          <ellipse cx="-9" cy="-58" rx="8" ry="5" fill="#fff" opacity="0.8"/></g>${hand(118, 470, c)}`;
      case 'petard': return `<g transform="translate(116,470) rotate(-14)">
          <rect x="-11" y="-112" width="22" height="80" rx="3" fill="#b2322a"/>
          <rect x="-11" y="-112" width="22" height="8" fill="#e8d7b0"/><rect x="-11" y="-40" width="22" height="8" fill="#e8d7b0"/>
          <rect x="-11" y="-112" width="7" height="80" fill="#fff" opacity="0.15"/>
          <path d="M0,-112 C4,-124 -4,-130 6,-140" stroke="#3a2a1a" stroke-width="2.5" fill="none"/>
          <circle cx="6" cy="-141" r="7" fill="#ffd36b" filter="url(#blur2)"/><circle cx="6" cy="-141" r="3" fill="#fff"/></g>${hand(116, 470, c, -14)}`;
      case 'plunger': return `<g transform="translate(110,470) rotate(-8)">
          <rect x="-6" y="-210" width="12" height="190" fill="#8a5a32"/><rect x="-6" y="-210" width="4" height="190" fill="#c08a56" opacity="0.5"/>
          <path d="M-40,-200 C-40,-250 40,-250 40,-200 L34,-196 C10,-188 -10,-188 -34,-196Z" fill="#9c1f22"/>
          <path d="M-30,-215 C-26,-236 0,-242 10,-238" stroke="#e66" stroke-width="3" opacity="0.5" fill="none"/></g>${hand(110, 470, c, -8)}`;
      case 'glass': return `<g transform="translate(118,468)">
          <path d="M-28,-100 C-34,-60 -20,-36 0,-34 C20,-36 34,-60 28,-100Z" fill="#cfe0ea" opacity="0.25" stroke="#e4eef4" stroke-opacity="0.5"/>
          <path d="M-31,-72 C-30,-48 -18,-36 0,-35 C18,-36 30,-48 31,-72Z" fill="#b8661f" opacity="0.9"/>
          <ellipse cx="0" cy="-72" rx="31" ry="5" fill="#e09440"/>
          <rect x="-3" y="-34" width="6" height="22" fill="#d9e6ee" opacity="0.5"/>
          <path d="M-20,-96 C-24,-70 -18,-56 -12,-48" stroke="#fff" stroke-width="2.5" opacity="0.5" fill="none"/></g>${hand(118, 482, c)}`;
    }
    return '';
  }

  // Главная функция персонажа. Локальная система: 400×600, по пояс.
  // o: {expr:{...}, prop:bool, light: 0..1 (сила света), split: 0..1 (сила тени)}
  function character(key, o = {}) {
    const c = Object.assign({}, CH[key], o.over || {});
    const e = Object.assign({}, c.expr, o.expr || {});
    const w = c.w, j = c.jaw, L = c.L;
    const X = (d) => 200 + d * w;
    const id = uid('ch');
    const sh = mix(c.skin, '#3a4664', 0.5);
    const lipC = mix(c.skin, '#8a4a4a', 0.35), mouthL = mix(c.skin, '#2a1214', 0.7);
    const my = 272 + L * 0.6;
    const ex = 36 * Math.sqrt(w), ey = 188;
    const sm = e.smirk || 0, mo = e.mo || 0;
    const broad = c.broad || 1;

    let body = '';
    body += `<g transform="translate(200,0) scale(${broad},1) translate(-200,0)">${cloth(c, false)}</g>`;
    body += `<path d="M${X(-42)},240 L${X(-46 - (c.chubby ? 8 : 0))},350 L${X(46 + (c.chubby ? 8 : 0))},350 L${X(42)},240Z" fill="${mix(c.skin, '#5a4048', 0.25)}"/>`;
    body += `<path d="M${X(-46)},255 L${X(46)},255 L${X(46)},300 L${X(-46)},300Z" fill="#2a1e28" opacity="0.4" filter="url(#blur8)"/>`;
    body += `<g transform="translate(200,0) scale(${broad},1) translate(-200,0)">${cloth(c, true)}</g>`;
    body += hair(c, X, false);
    // уши
    body += `<ellipse cx="${X(-86)}" cy="205" rx="12" ry="25" fill="${mix(c.skin, '#8a5050', 0.15)}"/><ellipse cx="${X(-86)}" cy="205" rx="6" ry="15" fill="${mix(c.skin, '#5a3030', 0.3)}"/>`;
    body += `<ellipse cx="${X(86)}" cy="205" rx="12" ry="25" fill="${mix(c.skin, '#8a5050', 0.15)}"/><ellipse cx="${X(86)}" cy="205" rx="6" ry="15" fill="${mix(c.skin, '#5a3030', 0.3)}"/>`;
    // голова
    const hp = headPath(w, j, L);
    body += `<clipPath id="${id}h"><path d="${hp}"/></clipPath><path d="${hp}" fill="${c.skin}"/>`;
    body += `<g clip-path="url(#${id}h)">
      <radialGradient id="${id}warm" cx="30%" cy="35%" r="60%"><stop offset="0" stop-color="#ffcf9a" stop-opacity="0.35"/><stop offset="1" stop-color="#ffcf9a" stop-opacity="0"/></radialGradient>
      <rect x="0" y="0" width="400" height="400" fill="url(#${id}warm)"/>
      <path d="${hp}" fill="none" stroke="${mix(c.skin, '#3a2530', 0.4)}" stroke-width="22" opacity="0.35" filter="url(#blur8)"/>
      <path d="M${X(-80)},212 C${X(-66)},232 ${X(-52)},244 ${X(-40)},250 M${X(80)},212 C${X(66)},232 ${X(52)},244 ${X(40)},250" stroke="${mix(c.skin, '#4a3040', 0.45)}" stroke-width="12" fill="none" opacity="0.45" filter="url(#blur4)"/>
      <path d="M${X(-74)},196 C${X(-60)},188 ${X(-44)},190 ${X(-34)},200" stroke="#ffe1c0" stroke-width="10" fill="none" opacity="0.18" filter="url(#blur4)"/>
      ${c.stubble ? `<path d="M${X(-76)},240 C${X(-60)},${300 + L} ${X(60)},${300 + L} ${X(76)},240 L${X(76)},${330 + L} L${X(-76)},${330 + L}Z M${X(-40)},${my - 10} C${X(-20)},${my - 18} ${X(20)},${my - 18} ${X(40)},${my - 10} L${X(40)},${my - 4} L${X(-40)},${my - 4}Z" fill="#2a2e3a" opacity="${c.stubble}" filter="url(#blur4)"/>` : ''}
      ${c.chubby ? `<path d="M${X(-50)},${296 + L} C${X(-20)},${316 + L} ${X(20)},${316 + L} ${X(50)},${296 + L}" stroke="${mix(c.skin, '#4a3040', 0.4)}" stroke-width="4" fill="none" opacity="0.5" filter="url(#blur2)"/>` : ''}
    </g>`;
    body += hair(c, X, true);
    if (c.curlers) {
      [[-62, 92, -30], [-30, 66, -12], [4, 58, 0], [38, 66, 12], [68, 92, 30], [-80, 128, -55], [84, 128, 55]].forEach((q, i) => {
        const col = ['#e07aa0', '#7ac0e0', '#e0c060'][i % 3];
        body += `<g transform="translate(${X(q[0])},${q[1]}) rotate(${q[2]})"><rect x="-26" y="-17" width="52" height="34" rx="12" fill="${col}"/>
          <rect x="-26" y="-17" width="52" height="10" rx="5" fill="#fff" opacity="0.35"/>${[-14, -2, 10].map(z => `<line x1="${z}" y1="-17" x2="${z}" y2="17" stroke="#000" stroke-opacity="0.2" stroke-width="2"/>`).join('')}</g>`;
      });
    }
    // глаза
    body += eye(200 - ex, ey, -1, c, e) + eye(200 + ex, ey, 1, c, e.wink ? Object.assign({}, e, { lid: 0.97 }) : e);
    if (c.scar) body += `<path d="M${200 - ex - 18},${ey - 36} L${200 - ex - 8},${ey - 16}" stroke="${mix(c.skin, '#fff', 0.3)}" stroke-width="3" opacity="0.7"/>`;
    // нос
    const nsW = 1 + (w - 1) * 0.8;
    body += `<g transform="translate(200,0) scale(${nsW},1) translate(-200,0)">
      <path d="M190,196 C187,215 182,230 182,238" stroke="${mix(c.skin, '#4a3040', 0.35)}" stroke-width="5" fill="none" opacity="0.45" filter="url(#blur2)"/>
      <path d="M196,192 C195,212 194,228 196,236" stroke="#ffe8d0" stroke-width="5" fill="none" opacity="0.28" filter="url(#blur2)"/>
      <ellipse cx="201" cy="246" rx="17" ry="5" fill="${mix(c.skin, '#3a2030', 0.45)}" opacity="0.7" filter="url(#blur2)"/>
      <path d="M184,241 C182,234 188,230 192,236 M218,241 C220,234 214,230 210,236" stroke="${mix(c.skin, '#4a2a2a', 0.45)}" stroke-width="2.4" fill="none"/>
      <ellipse cx="193" cy="244" rx="4" ry="2.3" fill="${mix(c.skin, '#2a1414', 0.65)}"/><ellipse cx="209" cy="244" rx="4" ry="2.3" fill="${mix(c.skin, '#2a1414', 0.65)}"/>
      <ellipse cx="197" cy="236" rx="5" ry="3.5" fill="#fff0e0" opacity="0.3"/>
    </g>`;
    body += `<path d="M197,250 L196,${my - 6} M205,250 L206,${my - 6}" stroke="${mix(c.skin, '#4a3030', 0.3)}" stroke-width="2" opacity="0.4"/>`;
    if (c.mustache) body += `<path d="M${X(-30)},${my + 2} C${X(-26)},${my - 12} ${X(-6)},${my - 14} 200,${my - 9} C${X(6)},${my - 14} ${X(26)},${my - 12} ${X(30)},${my + 2} C${X(18)},${my - 3} ${X(6)},${my - 4} 200,${my - 2} C${X(-6)},${my - 4} ${X(-18)},${my - 3} ${X(-30)},${my + 2}Z" fill="${mix(c.hair, '#8a8078', 0.3)}"/>`;
    // рот
    const lc = my - sm * 4, rc = my - sm * 1;
    if (mo > 0.05) body += `<path d="M${X(-21)},${lc} C${X(-8)},${my + 2} ${X(8)},${my + 2} ${X(21)},${rc - sm * 4} C${X(10)},${my + 4 + mo * 16} ${X(-10)},${my + 4 + mo * 16} ${X(-21)},${lc}Z" fill="#3a1618"/>`;
    body += `<path d="M${X(-21)},${lc} C${X(-10)},${my - 7} ${X(-4)},${my - 6} 200,${my - 3} C${X(4)},${my - 6} ${X(10)},${my - 7} ${X(21)},${rc - sm * 4} C${X(10)},${my + 1} ${X(-10)},${my + 1} ${X(-21)},${lc}Z" fill="${lipC}" opacity="0.8"/>`;
    body += `<path d="M${X(-21)},${lc} C${X(-8)},${my + 1} ${X(8)},${my + 1 - sm * 2} ${X(21)},${rc - sm * 4}" stroke="${mouthL}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    body += `<path d="M${X(-17)},${my + 3 + mo * 14} C${X(-8)},${my + 13 + mo * 14} ${X(8)},${my + 13 + mo * 14} ${X(17)},${my + 3 + mo * 14} C${X(8)},${my + 7 + mo * 14} ${X(-8)},${my + 7 + mo * 14} ${X(-17)},${my + 3 + mo * 14}Z" fill="${lipC}" opacity="0.7"/>`;
    body += `<ellipse cx="200" cy="${my + 22 + mo * 12}" rx="16" ry="5" fill="${mix(c.skin, '#3a2030', 0.4)}" opacity="0.4" filter="url(#blur2)"/>`;
    if (e.cheek) {
      const k = e.cheek;
      [-1, 1].forEach(sd => {
        body += `<ellipse cx="${X(sd * 50)}" cy="${252 + L * 0.5}" rx="${16 + 30 * k}" ry="${14 + 26 * k}" fill="${c.skin}"/>
          <ellipse cx="${X(sd * 50)}" cy="${262 + L * 0.5}" rx="${16 + 30 * k}" ry="${8 + 14 * k}" fill="${mix(c.skin, '#4a3040', 0.4)}" opacity="0.35" filter="url(#blur4)"/>
          <ellipse cx="${X(sd * 54)}" cy="${240 + L * 0.5}" rx="${8 + 10 * k}" ry="${6 + 7 * k}" fill="#fff0e0" opacity="${0.35 * k}" filter="url(#blur2)"/>`;
      });
      body += `<ellipse cx="200" cy="${my}" rx="${22 - 10 * k}" ry="${6 + 2 * k}" fill="${lipC}"/><path d="M${200 - 10 + 4 * k},${my} L${200 + 10 - 4 * k},${my}" stroke="${mouthL}" stroke-width="2.5"/>`;
    }
    if (o.prop !== false) body += prop(c);

    // делим по свету: правая половина — та же картинка, но в холодной тени (через нос)
    const sp = o.split == null ? 1 : o.split;
    const shadowPath = `M206,-40 L212,140 L215,196 L224,238 L207,252 L205,${my} L212,${330 + L} L214,700 L700,700 L700,-40Z`;
    const litPath = `M-300,-40 L206,-40 L212,140 L215,196 L224,238 L207,252 L205,${my} L212,${330 + L} L214,700 L-300,700Z`;
    return `<g>
      <g id="${id}g">${body}</g>
      <mask id="${id}sm" maskUnits="userSpaceOnUse" x="-300" y="-100" width="1000" height="900"><path d="${shadowPath}" fill="#fff" opacity="${sp}" filter="url(#blur4)"/></mask>
      <mask id="${id}lm" maskUnits="userSpaceOnUse" x="-300" y="-100" width="1000" height="900"><path d="${litPath}" fill="#fff" opacity="${o.light == null ? 1 : o.light}" filter="url(#blur8)"/></mask>
      <use href="#${id}g" filter="url(#shadeF)" mask="url(#${id}sm)"/>
      <use href="#${id}g" filter="url(#warmF)" mask="url(#${id}lm)" opacity="0.6"/>
    </g>`;
  }

  // ---------- фоны (1080×1920) ----------
  function rain(t, n, x0, y0, w, h, op = 0.35, seed = 1) {
    let s = '';
    let r = seed * 9301 + 49297;
    const rnd = () => { r = (r * 9301 + 49297) % 233280; return r / 233280; };
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd() * w, sp = 900 + rnd() * 700, len = 30 + rnd() * 40;
      const y = y0 + ((rnd() * h + t * sp) % h);
      s += `<line x1="${x}" y1="${y}" x2="${x - len * 0.18}" y2="${y + len}" stroke="#b9c8dc" stroke-width="${1 + rnd() * 1.4}" opacity="${op * (0.4 + rnd() * 0.6)}"/>`;
    }
    return s;
  }

  function bgHallway(t = 0, o = {}) {
    const fl = o.flicker == null ? 1 : o.flicker; // 0..1 яркость лампы
    const ring = o.ring || 0;
    let s = `<rect width="1080" height="1920" fill="#232a37"/>
    <linearGradient id="hwWall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1f2a"/><stop offset="1" stop-color="#2c3444"/></linearGradient>
    <rect width="1080" height="1560" fill="url(#hwWall)"/>
    ${Array.from({ length: 28 }, (_, i) => `<rect x="${i * 40}" y="0" width="14" height="1560" fill="#3a4458" opacity="0.18"/>`).join('')}
    <rect x="0" y="1180" width="1080" height="14" fill="#3e3630" opacity="0.8"/>
    <rect x="0" y="1194" width="1080" height="366" fill="#262b35"/>
    ${Array.from({ length: 14 }, (_, i) => `<rect x="${i * 80}" y="1200" width="2" height="360" fill="#000" opacity="0.25"/>`).join('')}
    <rect x="0" y="1540" width="1080" height="22" fill="#2f2722"/>
    <rect x="0" y="1560" width="1080" height="360" fill="#241d19"/>
    ${Array.from({ length: 9 }, (_, i) => `<line x1="${540 + (i - 4) * 60}" y1="1560" x2="${540 + (i - 4) * 300}" y2="1920" stroke="#120d0b" stroke-width="3"/>`).join('')}
    <path d="M200,1640 L880,1640 L960,1840 L120,1840Z" fill="#4a2a26" opacity="0.8"/>
    <path d="M230,1660 L850,1660 L920,1820 L160,1820Z" fill="none" stroke="#8a5a3a" stroke-width="5" opacity="0.4"/>`;
    // окно со шторой слева
    s += `<rect x="40" y="380" width="300" height="680" fill="#0d1626"/>
      <rect x="40" y="380" width="300" height="680" fill="#1d3050" opacity="0.5"/>
      <g clip-path="url(#hwWin)"><clipPath id="hwWin"><rect x="40" y="380" width="300" height="680"/></clipPath>${rain(t, 50, 40, 380, 300, 680, 0.5, 2)}
      <path d="M40,900 L120,860 L200,880 L260,840 L340,870 L340,1060 L40,1060Z" fill="#070b12"/>
      <rect x="250" y="905" width="14" height="18" fill="#d8a050" opacity="0.7"/></g>
      <rect x="40" y="380" width="300" height="680" fill="none" stroke="#3b3430" stroke-width="14"/>
      <line x1="190" y1="380" x2="190" y2="1060" stroke="#3b3430" stroke-width="10"/>
      <line x1="40" y1="700" x2="340" y2="700" stroke="#3b3430" stroke-width="10"/>
      <rect x="0" y="330" width="420" height="16" rx="6" fill="#5a4a3c"/>`;
    const sway = Math.sin(t * 1.3) * 6 * (o.sway || 1);
    let folds = '';
    for (let i = 0; i < 9; i++) {
      const x = -10 + i * 30 + (i > 4 ? 0 : 0);
      folds += `<path d="M${x},344 C${x + 10 + sway * 0.3},700 ${x - 6 + sway},1100 ${x + 4 + sway * 1.2},1520 L${x + 30 + sway * 1.2},1520 C${x + 24 + sway},1100 ${x + 40 + sway * 0.3},700 ${x + 30},344Z" fill="${i % 2 ? '#2f4a52' : '#25393f'}"/>`;
    }
    s += `<g>${folds}<rect x="0" y="344" width="280" height="1180" fill="url(#curtG)"/></g>
      <linearGradient id="curtG" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.1"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></linearGradient>`;
    // домофон
    s += `<g transform="translate(410,880)">
      <rect x="0" y="0" width="90" height="220" rx="8" fill="#b7b1a4"/>
      <rect x="0" y="0" width="90" height="220" rx="8" fill="url(#plast)"/>
      <linearGradient id="plast" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.15"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient>
      <rect x="12" y="18" width="66" height="54" rx="3" fill="${ring ? '#9fd8a8' : '#2a3a30'}" opacity="${ring ? 0.6 + 0.4 * Math.abs(Math.sin(t * 9)) : 1}"/>
      ${ring ? `<rect x="-40" y="-30" width="170" height="140" fill="#8affa0" opacity="${0.18 * Math.abs(Math.sin(t * 9))}" filter="url(#blur20)"/>` : ''}
      <rect x="18" y="90" width="54" height="110" rx="20" fill="#9c968a"/>
      <rect x="22" y="96" width="46" height="98" rx="18" fill="#a8a296"/>
      <circle cx="45" cy="210" r="5" fill="${ring ? '#ff5040' : '#5a2a24'}"/>
      <path d="M45,220 C45,260 80,270 70,320" stroke="#2a2a2a" stroke-width="3" fill="none"/></g>`;
    // входная дверь
    s += `<rect x="560" y="560" width="320" height="990" fill="#3a2c22"/>
      <rect x="580" y="580" width="280" height="960" fill="#4a3628"/>
      <rect x="610" y="620" width="220" height="380" fill="none" stroke="#2e2118" stroke-width="10"/>
      <rect x="610" y="1060" width="220" height="430" fill="none" stroke="#2e2118" stroke-width="10"/>
      <rect x="580" y="580" width="30" height="960" fill="#fff" opacity="0.04"/>
      <rect x="610" y="1000" width="40" height="70" rx="6" fill="#7a6040"/>
      <rect x="600" y="1030" width="70" height="14" rx="6" fill="#c8a060"/>
      <circle cx="630" cy="1100" r="9" fill="#2a2018"/><rect x="626" y="1100" width="8" height="18" fill="#2a2018"/>
      <circle cx="720" cy="760" r="8" fill="#151010"/>
      <rect x="560" y="1540" width="320" height="20" fill="#000" opacity="0.3"/>`;
    // дверь кладовки справа, приоткрыта
    const gap = 26 + (o.pantry || 0);
    s += `<rect x="930" y="620" width="170" height="930" fill="#05070b"/>
      <rect x="${930 + gap}" y="620" width="${150}" height="930" fill="#3b3a3c"/>
      <rect x="${930 + gap}" y="620" width="12" height="930" fill="#000" opacity="0.5"/>
      <rect x="${960 + gap}" y="1060" width="10" height="40" rx="4" fill="#8a8070"/>
      <rect x="922" y="610" width="12" height="950" fill="#2e2620"/>`;
    // крючки и куртка
    s += `<rect x="410" y="560" width="110" height="12" fill="#5a4a3c"/>
      <path d="M430,572 L430,590 M490,572 L490,590" stroke="#c8a060" stroke-width="5"/>
      <path d="M418,590 C410,640 400,760 408,840 L475,840 C480,760 470,640 444,590Z" fill="#3e4a38"/>`;
    // лампа
    const lx = 470, ly = 300;
    s += `<line x1="${lx}" y1="0" x2="${lx}" y2="${ly}" stroke="#111" stroke-width="3"/>
      <ellipse cx="${lx}" cy="${ly + 80}" rx="${560}" ry="${640}" fill="#ffb05a" opacity="${0.22 * fl}" filter="url(#blur50)"/>
      <path d="M${lx - 30},${ly} L${lx + 30},${ly} L${lx + 70},${ly + 60} L${lx - 70},${ly + 60}Z" fill="#6a4a2a"/>
      <ellipse cx="${lx}" cy="${ly + 64}" rx="22" ry="14" fill="#fff1c8" opacity="${0.4 + 0.6 * fl}"/>
      <ellipse cx="${lx}" cy="${ly + 70}" rx="90" ry="60" fill="#ffd08a" opacity="${0.5 * fl}" filter="url(#blur20)"/>
      <rect width="1080" height="1920" fill="#0b1020" opacity="${0.55 * (1 - fl)}"/>`;
    return s;
  }

  function bgBar(t = 0, o = {}) {
    const sw = Math.sin(t * 1.6) * (o.swing == null ? 18 : o.swing);
    let s = `<rect width="1080" height="1920" fill="#1b1714"/>
      ${Array.from({ length: 12 }, (_, i) => `<rect x="${i * 92}" y="0" width="90" height="1100" fill="${i % 2 ? '#2a211a' : '#251d17'}"/>`).join('')}
      <rect x="0" y="1100" width="1080" height="820" fill="#1e1915"/>
      <rect x="0" y="1090" width="1080" height="16" fill="#3a2a1e"/>`;
    // полка бутылок
    s += `<rect x="60" y="430" width="420" height="14" fill="#4a3424"/><rect x="60" y="640" width="420" height="14" fill="#4a3424"/>`;
    const bot = (x, y, h, col) => `<path d="M${x - 14},${y} L${x - 14},${y - h + 34} C${x - 14},${y - h + 20} ${x - 6},${y - h + 14} ${x - 5},${y - h} L${x + 5},${y - h} C${x + 6},${y - h + 14} ${x + 14},${y - h + 20} ${x + 14},${y - h + 34} L${x + 14},${y}Z" fill="${col}"/><rect x="${x - 10}" y="${y - h + 40}" width="5" height="${h - 50}" fill="#ffcf80" opacity="0.25"/><rect x="${x - 10}" y="${y - 50}" width="20" height="24" fill="#d8c8a0" opacity="0.5"/>`;
    [[90, 430, 120, '#5a2e10'], [140, 430, 140, '#6b3612'], [190, 430, 110, '#2a3a20'], [240, 430, 130, '#7a4416'], [300, 430, 120, '#5a2e10'], [360, 430, 145, '#3a1e0c'], [420, 430, 115, '#6b3612'],
    [110, 640, 130, '#7a4416'], [170, 640, 120, '#5a2e10'], [230, 640, 140, '#3a2a20'], [300, 640, 125, '#6b3612'], [380, 640, 135, '#5a2e10']].forEach(b => s += bot(...b));
    // окно
    s += `<rect x="640" y="380" width="340" height="480" fill="#0c1424"/>
      <g clip-path="url(#barWin)"><clipPath id="barWin"><rect x="640" y="380" width="340" height="480"/></clipPath>${rain(t, 45, 640, 380, 340, 480, 0.55, 5)}</g>
      <rect x="640" y="380" width="340" height="480" fill="none" stroke="#3a2a1e" stroke-width="14"/><line x1="810" y1="380" x2="810" y2="860" stroke="#3a2a1e" stroke-width="10"/>`;
    // табличка
    s += `<rect x="560" y="200" width="420" height="110" rx="6" fill="#2a1e16" stroke="#7a5a30" stroke-width="4"/>
      <text x="770" y="272" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="50" fill="#d8a04a" opacity="0.85">БАР «У ИОНА»</text>`;
    // бильярдный стол в перспективе
    s += `<path d="M250,1180 L830,1180 L1040,1700 L40,1700Z" fill="#3a2414"/>
      <path d="M285,1205 L795,1205 L985,1665 L95,1665Z" fill="#1f5a3c"/>
      <path d="M285,1205 L795,1205 L985,1665 L95,1665Z" fill="url(#felt)"/>
      <radialGradient id="felt" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#5ab07a" stop-opacity="0.45"/><stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient>
      ${[[285, 1205], [795, 1205], [95, 1665], [985, 1665], [540, 1205], [540, 1665]].map(p => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="22" ry="12" fill="#080604"/>`).join('')}
      <path d="M40,1700 L1040,1700 L1040,1760 L40,1760Z" fill="#2a1a0e"/>
      <rect x="80" y="1760" width="40" height="160" fill="#22160c"/><rect x="960" y="1760" width="40" height="160" fill="#22160c"/>`;
    const balls = o.balls || [[480, 1360, '#c8a020'], [520, 1380, '#a02020'], [560, 1360, '#20308a'], [500, 1400, '#6a2a7a'], [540, 1400, '#1a1a1a'], [580, 1400, '#c05a10'], [690, 1520, '#e8e4da']];
    balls.forEach(b => {
      s += `<ellipse cx="${b[0]}" cy="${b[1] + 14}" rx="20" ry="7" fill="#000" opacity="0.4"/><circle cx="${b[0]}" cy="${b[1]}" r="18" fill="${b[2]}"/><circle cx="${b[0] - 6}" cy="${b[1] - 7}" r="5" fill="#fff" opacity="0.6"/>`;
    });
    // лампа над столом с качанием
    s += `<g transform="rotate(${sw * 0.15},540,0)">
      <line x1="540" y1="0" x2="540" y2="860" stroke="#111" stroke-width="4"/>
      <path d="M540,860 L${540 - 260},1140 L${540 + 260},1140Z" fill="#ffcf80" opacity="0.10"/>
      <path d="M380,860 L700,860 L740,920 L340,920Z" fill="#245a3a"/>
      <rect x="350" y="916" width="380" height="10" fill="#fff0c0" opacity="0.9"/>
      <ellipse cx="540" cy="930" rx="260" ry="40" fill="#ffd890" opacity="0.6" filter="url(#blur20)"/></g>
      <ellipse cx="${540 + sw}" cy="1420" rx="520" ry="320" fill="#ffd08a" opacity="0.18" filter="url(#blur50)"/>`;
    return s;
  }

  function bgStreet(t = 0, o = {}) {
    let s = `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0f1c"/><stop offset="1" stop-color="#243049"/></linearGradient>
      <rect width="1080" height="1920" fill="url(#sky)"/>
      <ellipse cx="${300 + t * 8}" cy="300" rx="420" ry="80" fill="#2a3550" opacity="0.6" filter="url(#blur20)"/>
      <ellipse cx="${800 - t * 6}" cy="460" rx="380" ry="70" fill="#1e2840" opacity="0.7" filter="url(#blur20)"/>
      <path d="M0,980 C200,900 380,940 560,890 C760,840 900,910 1080,880 L1080,1200 L0,1200Z" fill="#141a26"/>`;
    // дома
    const house = (x, y, w, h, lit) => `<path d="M${x},${y} L${x + w / 2},${y - h * 0.55} L${x + w},${y}Z" fill="#1c1a1e"/><rect x="${x + 8}" y="${y}" width="${w - 16}" height="${h}" fill="#262a33"/>
      <rect x="${x + w * 0.3}" y="${y + h * 0.3}" width="${w * 0.22}" height="${h * 0.3}" fill="${lit ? '#e0a050' : '#151820'}"/>
      ${lit ? `<rect x="${x + w * 0.3 - 30}" y="${y + h * 0.3 - 30}" width="${w * 0.22 + 60}" height="${h * 0.3 + 60}" fill="#ffb060" opacity="0.25" filter="url(#blur20)"/>` : ''}`;
    s += house(40, 1060, 240, 200, true) + house(330, 1030, 200, 170, false) + house(600, 1050, 260, 210, true) + house(900, 1040, 200, 180, true);
    // земля, лужи
    s += `<rect x="0" y="1260" width="1080" height="660" fill="#1a1c20"/>
      <ellipse cx="540" cy="1640" rx="380" ry="60" fill="#3a4a66" opacity="0.5"/>
      <ellipse cx="${540 + Math.sin(t * 3) * 6}" cy="1640" rx="300" ry="40" fill="#ffb060" opacity="0.12"/>`;
    // забор
    s += Array.from({ length: 22 }, (_, i) => `<path d="M${i * 50},1420 L${i * 50},1300 L${i * 50 + 18},1280 L${i * 50 + 36},1300 L${i * 50 + 36},1420Z" fill="#2e2620"/>`).join('') +
      `<rect x="0" y="1320" width="1080" height="12" fill="#3a2e24"/><rect x="0" y="1390" width="1080" height="12" fill="#3a2e24"/>`;
    // столб с афишей
    s += `<rect x="760" y="560" width="22" height="900" fill="#2a2420"/>
      <rect x="690" y="860" width="170" height="230" fill="#d8ccb0"/>
      <rect x="690" y="860" width="170" height="230" fill="#3a4a66" opacity="0.25"/>
      <text font-family="JetBrains Mono" font-weight="800" fill="#7a2a1e" text-anchor="middle"><tspan x="775" y="920" font-size="44">ХРАМ</tspan><tspan x="775" y="960" font-size="20">СЕЛА ВАДУЛЕКА</tspan><tspan x="775" y="1010" font-size="26">21 НОЯБРЯ</tspan><tspan x="775" y="1050" font-size="16" fill="#2a2a2a">музыка · танцы</tspan></text>
      <path d="M700,1090 L712,1120 L724,1090 M820,1090 L832,1124 L846,1090" stroke="#d8ccb0" stroke-width="3" fill="none"/>`;
    // уличный фонарь
    s += `<path d="M782,600 C800,560 840,560 860,580" stroke="#2a2420" stroke-width="8" fill="none"/>
      <path d="M840,580 L880,580 L870,600 L850,600Z" fill="#3a3430"/>
      <path d="M860,600 L700,1300 L1020,1300Z" fill="#ffc070" opacity="0.08"/>
      <circle cx="860" cy="604" r="10" fill="#ffe0a0"/><circle cx="860" cy="604" r="60" fill="#ffc070" opacity="0.3" filter="url(#blur20)"/>`;
    // деревянный туалет
    s += `<g transform="translate(150,1080)">
      <path d="M-10,0 L110,-30 L230,0Z" fill="#2a1e16"/>
      <rect x="0" y="0" width="220" height="380" fill="#4a3424"/>
      ${[0, 1, 2, 3, 4].map(i => `<line x1="${i * 44}" y1="0" x2="${i * 44}" y2="380" stroke="#2a1c12" stroke-width="3"/>`).join('')}
      <path d="M110,70 C95,50 70,60 80,82 L110,110 L140,82 C150,60 125,50 110,70Z" fill="#0a0806"/>
      <rect x="0" y="0" width="60" height="380" fill="#ffb060" opacity="0.08"/></g>`;
    s += rain(t, 140, 0, 0, 1080, 1920, 0.4, 7);
    return s;
  }

  function bgIntercomScreen(t = 0, o = {}) {
    let s = `<rect width="1080" height="1920" fill="#0d0f0e"/>
      <rect x="90" y="460" width="900" height="760" rx="30" fill="#bdb7aa"/>
      <rect x="90" y="460" width="900" height="760" rx="30" fill="url(#plast2)"/>
      <linearGradient id="plast2" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.15"/><stop offset="1" stop-color="#000" stop-opacity="0.4"/></linearGradient>
      <rect x="140" y="510" width="800" height="600" fill="#0f1a12"/>
      <g clip-path="url(#icS)"><clipPath id="icS"><rect x="140" y="510" width="800" height="600"/></clipPath>
        <rect x="140" y="510" width="800" height="600" fill="#5c7a62" opacity="0.35"/>
        <rect x="140" y="900" width="800" height="210" fill="#1e2a22"/>
        <rect x="200" y="620" width="680" height="300" fill="#2a3a2e"/>
        ${Array.from({ length: 14 }, (_, i) => `<rect x="${210 + i * 48}" y="630" width="30" height="290" fill="#3c5242"/>`).join('')}
        <circle cx="540" cy="560" r="60" fill="#d8ffd8" opacity="0.3" filter="url(#blur20)"/>
        ${o.inner || ''}
        ${Array.from({ length: 100 }, (_, i) => `<rect x="140" y="${510 + i * 6}" width="800" height="2" fill="#000" opacity="0.35"/>`).join('')}
        <rect x="140" y="${510 + ((t * 300) % 600)}" width="800" height="30" fill="#bfffc8" opacity="0.08"/>
      </g>
      <text x="170" y="560" font-family="JetBrains Mono" font-size="28" fill="#c8ffc8" opacity="0.8">CAM 1 · КАЛИТКА</text>
      <circle cx="900" cy="550" r="10" fill="#ff4030" opacity="${0.5 + 0.5 * Math.round((t * 2) % 1)}"/>
      <rect x="400" y="1140" width="280" height="50" rx="20" fill="#8e887c"/>`;
    return s;
  }

  // ---------- плашки ----------
  function plates(where, when, timer, o = {}) {
    const y = o.y || 90, x = o.x || 60;
    const box = (yy, col, label, text, size = 34) => {
      const w = 36 + (label.length + text.length + 1) * size * 0.6;
      return `<g transform="translate(${x},${yy})"><rect width="${w}" height="${size + 30}" fill="#0a0d0f" opacity="0.72"/>
        <rect width="${w}" height="${size + 30}" fill="none" stroke="${col}" stroke-width="3"/>
        <text x="18" y="${size + 6}" font-family="JetBrains Mono" font-weight="700" font-size="${size}" fill="${col}">${label} <tspan fill="#e8eee8">${text}</tspan></text></g>`;
    };
    let s = '';
    if (where) s += box(y, '#5cff7a', 'ГДЕ:', where);
    if (when) s += box(y + 84, '#ffd84a', 'КОГДА:', when);
    if (timer) s += `<g transform="translate(${1080 - x - 260},${y})"><rect width="260" height="64" fill="#0a0d0f" opacity="0.72"/><rect width="260" height="64" fill="none" stroke="#ff5a4a" stroke-width="3"/>
        <circle cx="30" cy="32" r="9" fill="#ff5a4a"/><text x="52" y="44" font-family="JetBrains Mono" font-weight="700" font-size="34" fill="#e8eee8">${timer}</text></g>`;
    return s;
  }

  function overlay(t = 0) {
    return `<rect width="1080" height="1920" fill="url(#scan)"/>
      <rect width="1080" height="1920" filter="url(#grain)" opacity="1"/>
      <rect width="1080" height="1920" fill="url(#vign)"/>
      <rect width="1080" height="1920" fill="#2a3a5a" opacity="0.10" style="mix-blend-mode:color"/>`;
  }

  const ballDefs = `<radialGradient id="ballG" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#fffdf6"/><stop offset="0.6" stop-color="#ddd6c8"/><stop offset="1" stop-color="#6a6660"/></radialGradient>`;

  G.VAD = { CH, mix, defs: () => defs() + ballDefs, character, bgHallway, bgBar, bgStreet, bgIntercomScreen, plates, overlay, rain };
})(typeof window !== 'undefined' ? window : globalThis);

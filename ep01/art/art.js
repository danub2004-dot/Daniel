// ЭПИДЕМИЯ — библиотека рисунков «Кино-2D» (SVG-строки).
// Персонаж рисуется в своей системе координат 600×900 (по пояс), центр головы ~ (300, 270).
// Фоны — в координатах кадра 1080×1920.
(function (global) {
  let uid = 0;
  const nid = (p) => `${p}_${++uid}`;

  const PAL = {
    shadow: '#232a40',     // холодная тень (multiply)
    rim: '#8fb0d8',        // холодный контровой
    warm: '#ffb46b',       // тёплая лампа
    lid: '#2a1d1c',
    sclera: '#d6cfc4',
  };

  // ---------- ЛИЦО ----------
  const HEAD_D = 'M300,150 C350,150 388,185 388,245 C388,285 382,315 368,340 C350,370 325,390 300,392 C275,390 250,370 232,340 C218,315 212,285 212,245 C212,185 250,150 300,150 Z';

  function eye(x, y, o, flip) {
    const s = o.eyeSize || 1, w = 21 * s;
    const open = Math.max(0.04, 1 - (o.blink || 0));
    const sq = o.squint || 0;
    const top = -10.5 * s * open * (1 - sq * 0.4), bot = 7 * s * open * (1 - sq * 0.3);
    const dx = (o.look ? o.look[0] : 0) * (flip ? -1 : 1), dy = o.look ? o.look[1] : 0;
    const A = `M${x - w},${y} C${x - w * 0.45},${y + top} ${x + w * 0.55},${y + top} ${x + w},${y + 1.5} C${x + w * 0.45},${y + bot} ${x - w * 0.5},${y + bot} ${x - w},${y} Z`;
    const cid = nid('eye');
    const iris = o.iris || '#4a3a2e';
    let g = `<clipPath id="${cid}"><path d="${A}"/></clipPath>`;
    // глазница
    g += `<ellipse cx="${x + 2}" cy="${y - 6}" rx="${w * 1.25}" ry="${14 * s}" fill="#5a3a34" opacity="0.18" filter="url(#blur6)"/>`;
    g += `<path d="${A}" fill="${PAL.sclera}"/>`;
    g += `<g clip-path="url(#${cid})">
      <circle cx="${x + dx}" cy="${y + dy + 0.5}" r="${8.2 * s}" fill="${iris}"/>
      <circle cx="${x + dx}" cy="${y + dy + 0.5}" r="${8.2 * s}" fill="none" stroke="#1a1310" stroke-width="1.2" opacity=".6"/>
      <circle cx="${x + dx}" cy="${y + dy + 0.5}" r="${3.8 * s}" fill="#120d0b"/>
      <circle cx="${x + dx - 2.6}" cy="${y + dy - 2.2}" r="${1.9 * s}" fill="#fff" opacity=".85"/>
      <rect x="${x - w - 2}" y="${y - 16}" width="${2 * w + 4}" height="${9 * s}" fill="#3a2420" opacity=".38"/>
    </g>`;
    // верхнее веко (линия) и складка
    g += `<path d="M${x - w - 1.5},${y + 0.6} C${x - w * 0.45},${y + top - 1.2} ${x + w * 0.55},${y + top - 1.2} ${x + w + 1.5},${y + 2}" fill="none" stroke="${PAL.lid}" stroke-width="${2.8 * s}" stroke-linecap="round"/>`;
    g += `<path d="M${x - w + 2},${y + 1} C${x - w * 0.5},${y + bot + 0.6} ${x + w * 0.45},${y + bot + 0.6} ${x + w - 1},${y + 2}" fill="none" stroke="#5b3b34" stroke-width="1" opacity=".45"/>`;
    const lidH = (o.heavyLid || 0) * 4;
    g += `<path d="M${x - w * 0.85},${y + top - 4 + lidH} Q${x + 1},${y + top * 1.45 - 6 + lidH} ${x + w * 0.9},${y + top - 2 + lidH}" fill="none" stroke="#6b443b" stroke-width="1.5" opacity=".5"/>`;
    if (o.bags) {
      g += `<path d="M${x - w * 0.8},${y + bot + 5} Q${x},${y + bot + 11} ${x + w * 0.85},${y + bot + 4}" fill="none" stroke="#6b443b" stroke-width="1.4" opacity="${0.3 * o.bags}"/>`;
      g += `<path d="M${x - w * 0.6},${y + bot + 10} Q${x + 2},${y + bot + 17} ${x + w * 0.7},${y + bot + 9}" fill="none" stroke="#6b443b" stroke-width="1.1" opacity="${0.22 * o.bags}"/>`;
    }
    if (o.crowsFeet) {
      for (let i = 0; i < 3; i++) g += `<path d="M${x + w + 4},${y - 3 + i * 5} l${9},${-3 + i * 3}" stroke="#6b443b" stroke-width="1" opacity="${0.35 * o.crowsFeet}"/>`;
    }
    return flip ? `<g transform="translate(${2 * x},0) scale(-1,1)">${g}</g>` : g;
  }

  function brow(x, y, o, flip) {
    const r = (o.browRaise || 0) * -6, f = (o.frown || 0) * 6, t = o.browThick || 1;
    const c = o.browColor || '#3a2a22';
    // внутренний конец (у переносицы) = x+24 для левой брови
    const d = `M${x - 26},${y + 5 + r * 0.5} C${x - 14},${y - 6 + r} ${x + 6},${y - 9 + r} ${x + 25},${y - 1 + f + r * 0.3}
               C${x + 26},${y + 4 * t + f + r * 0.3} ${x + 6},${y - 2 + 4 * t + r} ${x - 26},${y + 7 + r * 0.5} Z`;
    const g = `<path d="${d}" fill="${c}" opacity=".92"/>`;
    return flip ? `<g transform="translate(${2 * x},0) scale(-1,1)">${g}</g>` : g;
  }

  function head(o) {
    const skin = o.skin || '#c4917a';
    const cid = nid('headclip'), sid = nid('sil');
    const hair = HAIR[o.hair || 'none'](o);
    const sx = o.headW || 1, sy = o.headH || 1;
    let g = '';
    // уши
    g += `<ellipse cx="214" cy="284" rx="13" ry="27" fill="${skin}"/><ellipse cx="216" cy="286" rx="6" ry="16" fill="#7a4b40" opacity=".35"/>`;
    g += `<ellipse cx="386" cy="284" rx="13" ry="27" fill="${skin}"/><ellipse cx="384" cy="286" rx="6" ry="16" fill="#7a4b40" opacity=".35"/>`;
    g += `<path d="${HEAD_D}" fill="${skin}"/>`;
    g += `<clipPath id="${cid}"><path d="${HEAD_D}"/></clipPath>`;
    g += `<g clip-path="url(#${cid})">`;
    // объём: скулы, виски, щёки, подбородок — тенью
    g += `<path d="M220,292 C236,312 250,326 270,334 C252,334 236,326 222,312 Z" fill="#6d3f38" opacity=".28" filter="url(#blur6)"/>`;
    g += `<path d="M380,292 C364,312 350,326 330,334 C348,334 364,326 378,312 Z" fill="#6d3f38" opacity=".28" filter="url(#blur6)"/>`;
    g += `<ellipse cx="300" cy="196" rx="70" ry="30" fill="#fff3e4" opacity=".10" filter="url(#blur10)"/>`;
    g += `<ellipse cx="246" cy="292" rx="18" ry="11" fill="#e9b39a" opacity=".22" filter="url(#blur6)"/>`;
    g += `<ellipse cx="300" cy="384" rx="30" ry="10" fill="#6d3f38" opacity=".25" filter="url(#blur6)"/>`;
    if (o.gaunt) {
      g += `<path d="M232,318 C246,336 262,346 276,350 L268,362 C250,352 236,338 228,326 Z" fill="#5a332e" opacity="${0.25 * o.gaunt}" filter="url(#blur6)"/>`;
      g += `<path d="M368,318 C354,336 338,346 324,350 L332,362 C350,352 364,338 372,326 Z" fill="#5a332e" opacity="${0.25 * o.gaunt}" filter="url(#blur6)"/>`;
    }
    // глаза и брови
    g += eye(264, 270, o, false) + eye(336, 270, o, true);
    g += brow(262, 244, o, false) + brow(338, 244, o, true);
    if (!o.mask) {
      // нос — светотенью
      g += `<path d="M292,258 C292,280 288,300 284,316 C290,322 298,323 304,322" fill="none" stroke="#6d3f38" stroke-width="5" opacity=".18" filter="url(#blur3)"/>`;
      g += `<path d="M308,258 C309,282 314,302 318,316 C314,324 306,327 300,326" fill="#5d342f" opacity=".32" filter="url(#blur3)"/>`;
      g += `<ellipse cx="294" cy="314" rx="7" ry="5" fill="#f0c1a6" opacity=".45" filter="url(#blur3)"/>`;
      g += `<path d="M281,321 C284,327 291,328 295,326" fill="none" stroke="#5a2f2a" stroke-width="2" opacity=".55"/>`;
      g += `<path d="M319,321 C316,327 309,328 305,326" fill="none" stroke="#5a2f2a" stroke-width="2" opacity=".55"/>`;
      g += `<ellipse cx="301" cy="333" rx="17" ry="5" fill="#5a2f2a" opacity=".28" filter="url(#blur3)"/>`;
      // рот
      const m = o.mouth || 0, sm = (o.smile || 0) * 7 + 3, sd = (o.sad || 0) * 5;
      g += `<path d="M300,338 L300,347" stroke="#7a4a40" stroke-width="5" opacity=".18" filter="url(#blur3)"/>`;
      if (m > 0.05) {
        g += `<path d="M276,${353 - sm + sd} Q300,${348 - m * 2} 324,${353 - sm * (o.smirk ? 0.2 : 1) + sd} Q300,${356 + m * 14} 276,${353 - sm + sd} Z" fill="#2a1412"/>`;
        g += `<path d="M286,${352} Q300,${350} 314,${352} L312,${354} Q300,${352} 288,${354} Z" fill="#cfc6bb" opacity=".6"/>`;
      }
      g += `<path d="M274,${353 - sm + sd} C282,349 292,${346} 300,348 C308,${346} 318,349 326,${353 - sm * (o.smirk ? 0.2 : 1) + sd}" fill="none" stroke="#5e2e2a" stroke-width="2.4" stroke-linecap="round"/>`;
      g += `<path d="M280,351 C288,345 296,343 300,346 C304,343 312,345 320,351 C310,350 290,350 280,351 Z" fill="#8a4c44" opacity=".55"/>`;
      g += `<path d="M282,${356 + m * 12} C292,${364 + m * 12} 308,${364 + m * 12} 318,${356 + m * 12}" fill="none" stroke="#c88a78" stroke-width="5" opacity=".35" filter="url(#blur3)"/>`;
      g += `<ellipse cx="300" cy="${372 + m * 10}" rx="16" ry="5" fill="#5a2f2a" opacity=".25" filter="url(#blur3)"/>`;
    }
    // возраст
    if (o.age) {
      const a = o.age;
      for (let i = 0; i < 3; i++) g += `<path d="M${262 - i * 3},${212 - i * 10} Q300,${206 - i * 10} ${338 + i * 3},${212 - i * 10}" fill="none" stroke="#6d3f38" stroke-width="1.5" opacity="${0.28 * a}"/>`;
      if (!o.mask) {
        g += `<path d="M282,324 C272,336 268,348 270,364" fill="none" stroke="#6d3f38" stroke-width="2.2" opacity="${0.4 * a}"/>`;
        g += `<path d="M318,324 C328,336 332,348 330,364" fill="none" stroke="#6d3f38" stroke-width="2.2" opacity="${0.4 * a}"/>`;
      }
      g += `<path d="M290,240 L292,254 M310,240 L308,254" stroke="#6d3f38" stroke-width="1.6" opacity="${0.3 * a}"/>`;
    }
    if (o.stubble) {
      const pid = nid('stub');
      g += `<pattern id="${pid}" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".9" fill="${o.stubbleColor || '#5a5250'}"/><circle cx="3.5" cy="3.2" r=".8" fill="${o.stubbleColor || '#5a5250'}"/></pattern>`;
      g += `<path d="M226,310 C240,346 268,388 300,392 C332,388 360,346 374,310 C362,330 345,344 330,346 C320,340 310,338 300,338 C290,338 280,340 270,346 C255,344 238,330 226,310 Z" fill="url(#${pid})" opacity="${0.55 * o.stubble}"/>`;
    }
    if (o.mustache) {
      g += `<path d="M266,356 C268,338 286,328 300,332 C314,328 332,338 334,356 C326,350 316,346 300,347 C284,346 274,350 266,356 Z" fill="${o.mustache}"/><path d="M270,352 C280,342 292,338 300,340" stroke="#a9a39c" stroke-width="2" fill="none" opacity=".5"/>`;
      for (let i = 0; i < 8; i++) g += `<path d="M${278 + i * 6},${340 + Math.abs(3.5 - i)} l${-1 + i * 0.3},8" stroke="#bdb6ae" stroke-width=".8" opacity=".35"/>`;
    }
    if (o.mask) {
      g += `<path d="M206,298 C240,290 270,284 300,284 C330,284 360,290 394,298 L392,350 C370,384 335,398 300,398 C265,398 230,384 208,350 Z" fill="#9fb8c0"/>`;
      for (let i = 0; i < 3; i++) g += `<path d="M214,${318 + i * 18} Q300,${310 + i * 18} 386,${318 + i * 18}" fill="none" stroke="#6c8790" stroke-width="2" opacity=".6"/>`;
      g += `<path d="M206,298 C240,290 270,284 300,284 C330,284 360,290 394,298" fill="none" stroke="#c9dadf" stroke-width="3" opacity=".7"/>`;
      g += `<path d="M288,286 Q300,280 312,286" fill="none" stroke="#e5eef0" stroke-width="2" opacity=".6"/>`;
    }
    // СВЕТОТЕНЬ: лицо делится пополам по линии носа
    const shadowD = 'M300,100 L304,236 C307,262 313,288 319,314 C320,324 312,330 302,332 L303,346 C305,362 302,378 300,420 L460,420 L460,100 Z';
    const sd = o.lightFrom === 'right' ? `<g transform="translate(600,0) scale(-1,1)"><path d="${shadowD}"/></g>` : `<path d="${shadowD}"/>`;
    g += `<g fill="${PAL.shadow}" opacity="${o.shadowAmt ?? 0.58}" style="mix-blend-mode:multiply" filter="url(#blur3)">${sd}</g>`;
    g += `</g>`; // end headclip
    g += `<g transform="translate(300 270) scale(${sx} ${sy}) translate(-300 -270)">${hair.front}</g>`;
    // тёплый свет со стороны лампы
    const wx = o.lightFrom === 'right' ? 420 : 180;
    const wid = nid('warm');
    g += `<radialGradient id="${wid}" cx="${wx}" cy="230" r="240" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${PAL.warm}" stop-opacity=".42"/><stop offset="1" stop-color="${PAL.warm}" stop-opacity="0"/></radialGradient>`;
    g += `<g clip-path="url(#${cid})"><rect x="150" y="100" width="300" height="320" fill="url(#${wid})" style="mix-blend-mode:soft-light"/></g>`;
    // холодный контровой по теневой кромке
    const rimClip = nid('rimc');
    g += `<clipPath id="${rimClip}"><rect x="${o.lightFrom === 'right' ? 150 : 340}" y="120" width="110" height="300"/></clipPath>`;
    g += `<path d="${HEAD_D}" fill="none" stroke="${PAL.rim}" stroke-width="5" opacity=".38" clip-path="url(#${rimClip})" filter="url(#blur3)"/>`;
    const back = `<g transform="translate(300 270) scale(${sx} ${sy}) translate(-300 -270)">${hair.back || ''}</g>`;
    return { back, front: `<g transform="translate(300 270) scale(${sx} ${sy}) translate(-300 -270)">${g}</g>` };
  }

  // ---------- ПРИЧЁСКИ ----------
  const HAIR = {
    none: () => ({ front: '' }),
    fedya: () => ({
      front: `<path d="M211,252 C204,190 236,138 300,136 C364,138 396,190 389,252 C386,232 381,214 372,203 C356,188 340,178 318,176 C302,183 284,189 266,186 C248,186 232,198 226,210 C219,224 215,238 211,252 Z" fill="#83807d"/>
        <path d="M236,170 Q270,150 312,152 M250,163 Q290,146 340,158 M226,200 Q236,176 262,168 M330,170 Q366,176 380,210" fill="none" stroke="#b3aea8" stroke-width="2" opacity=".55"/>
        <path d="M211,252 C212,240 214,232 218,226 L222,262 Z M389,252 C388,240 386,232 382,226 L378,262 Z" fill="#6e6b68"/>`,
    }),
    timur: () => ({
      front: `<path d="M204,258 C194,182 228,116 302,114 C374,114 408,176 396,258 C392,238 388,224 382,214 C374,226 360,224 350,212 C342,226 328,226 318,210 C310,230 292,230 284,212 C274,228 258,226 250,214 C240,228 226,228 218,214 C212,230 207,244 204,258 Z" fill="#221d1b"/>
        <path d="M240,140 Q280,124 330,132 M226,170 Q256,140 300,138 M300,140 Q350,140 380,180 M262,200 Q270,178 290,170 M320,198 Q326,176 352,170" fill="none" stroke="#4d4440" stroke-width="2.4" opacity=".7"/>`,
    }),
    doctor: () => ({
      front: `<path d="M226,232 C222,250 220,262 222,272 L230,272 C230,258 232,246 236,234 Z" fill="#4a3428"/>
        <path d="M374,232 C378,250 380,262 378,272 L370,272 C370,258 368,246 364,234 Z" fill="#4a3428"/>
        <path d="M204,242 C198,168 238,124 300,122 C362,124 402,168 396,242 C380,228 350,220 300,220 C250,220 220,228 204,242 Z" fill="#6f9197"/>
        <path d="M204,242 C220,228 250,220 300,220 C350,220 380,228 396,242 C380,234 350,228 300,228 C250,228 220,234 204,242 Z" fill="#587a80"/>
        <path d="M240,150 Q262,190 252,222 M300,126 Q306,176 296,220 M358,150 Q340,190 350,222" fill="none" stroke="#557479" stroke-width="2" opacity=".7"/>`,
    }),
    stranger: () => ({
      front: `<path d="M210,246 C204,182 240,138 300,136 C362,138 396,182 390,246 C386,218 378,200 366,190 C345,178 322,175 300,178 C276,175 252,180 236,192 C222,204 214,224 210,246 Z" fill="#1d1c1f"/>
        <path d="M236,184 Q290,160 360,184 M232,196 Q290,170 372,196 M248,170 Q300,150 350,168" fill="none" stroke="#3d3a40" stroke-width="2" opacity=".8"/>
        <path d="M212,240 C212,226 216,214 222,206 L226,236 Z M388,240 C388,226 384,214 378,206 L374,236 Z" fill="#6c6a6e"/>`,
    }),
  };

  // ---------- ТЕЛО / ОДЕЖДА ----------
  const TORSO_D = 'M92,900 L106,570 C114,484 168,452 240,432 C255,446 276,454 300,454 C324,454 345,446 360,432 C432,452 486,484 494,570 L508,900 Z';
  const NECK_D = 'M254,340 Q256,400 248,446 Q300,462 352,446 Q344,400 346,340 Z';

  function neck(skin) {
    const c = nid('neckc');
    return `<path d="${NECK_D}" fill="${skin}"/><clipPath id="${c}"><path d="${NECK_D}"/></clipPath>
      <g clip-path="url(#${c})"><path d="M232,330 C250,372 275,396 300,400 C325,396 350,372 368,330 L368,410 L232,410 Z" fill="#4a2c2a" opacity=".45" filter="url(#blur6)"/>
      <rect x="300" y="340" width="60" height="120" fill="${PAL.shadow}" opacity=".45" style="mix-blend-mode:multiply"/></g>`;
  }

  const OUTFIT = {
    jacket: (o) => ({
      back: '',
      torso: `<path d="${TORSO_D}" fill="#2f3b4e"/>
        <path d="M246,432 L300,540 L354,432 C340,446 322,452 300,452 C278,452 260,446 246,432 Z" fill="#5d6068"/>
        ${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${262 + i * 7},${446 + i * 12} l5,-4" stroke="#43464d" stroke-width="2"/>`).join('')}
        <path d="M236,428 C226,456 232,490 250,512 L296,552 L264,476 C258,460 254,444 252,430 Z" fill="#26303f"/>
        <path d="M364,428 C374,456 368,490 350,512 L304,552 L336,476 C342,460 346,444 348,430 Z" fill="#26303f"/>
        <path d="M300,548 L300,900" stroke="#1a2130" stroke-width="5"/><path d="M303,548 L303,900" stroke="#4b5870" stroke-width="1.2" opacity=".7"/>
        <path d="M150,520 C170,500 200,486 230,478 M450,520 C430,500 400,486 370,478" fill="none" stroke="#1f2734" stroke-width="3" opacity=".7"/>
        <path d="M170,700 C180,760 176,820 180,900 M430,700 C420,760 424,820 420,900" fill="none" stroke="#222b3a" stroke-width="3" opacity=".6"/>
        <rect x="174" y="612" width="96" height="70" rx="5" fill="#2a3546"/><path d="M174,624 L270,624" stroke="#1f2734" stroke-width="3"/>
        <g transform="translate(336,606) rotate(-2)"><rect width="128" height="54" rx="4" fill="#c9c6bd"/><rect x="6" y="6" width="30" height="42" fill="#7f8a96"/>
          <text x="42" y="24" font-family="JetBrains Mono" font-size="13" font-weight="700" fill="#2a2d33">КОВАЛЁВ Ф.С.</text>
          <text x="42" y="42" font-family="JetBrains Mono" font-size="11" fill="#3e4450">МАРШРУТ 40</text></g>`,
    }),
    hoodie: (o) => ({
      back: `<path d="M196,420 C190,360 230,330 300,330 C370,330 410,360 404,420 C380,440 220,440 196,420 Z" fill="#4e5a44"/>`,
      torso: `<path d="${TORSO_D}" fill="#5c6a4e"/>
        <path d="M218,420 C222,480 262,508 300,508 C338,508 378,480 382,420 C366,450 334,464 300,464 C266,464 234,450 218,420 Z" fill="#4c5840"/>
        <path d="M232,430 C246,462 272,476 300,476 C328,476 354,462 368,430" fill="none" stroke="#3c4632" stroke-width="3"/>
        <path d="M284,474 C282,520 278,560 276,606" fill="none" stroke="#cfcab8" stroke-width="5" stroke-linecap="round"/><rect x="270" y="604" width="10" height="20" rx="3" fill="#8a8678"/>
        <path d="M316,474 C318,522 324,566 328,614" fill="none" stroke="#cfcab8" stroke-width="5" stroke-linecap="round"/><rect x="323" y="612" width="10" height="20" rx="3" fill="#8a8678"/>
        <path d="M200,780 C240,770 360,770 400,780 L410,900 L190,900 Z" fill="#53603f"/><path d="M200,780 C240,770 360,770 400,780" fill="none" stroke="#3c4632" stroke-width="3"/>
        <path d="M118,560 C150,520 170,500 196,480 L222,520 C196,540 170,620 160,900 L120,900 Z" fill="#8c7a3a"/>
        <path d="M482,560 C450,520 430,500 404,480 L378,520 C404,540 430,620 440,900 L480,900 Z" fill="#8c7a3a"/>
        <path d="M160,640 L210,650 M440,640 L390,650" stroke="#6b5c2a" stroke-width="6"/>`,
    }),
    doctor: (o) => ({
      back: '',
      torso: `<path d="${TORSO_D}" fill="#c4c9cb"/>
        <path d="M236,432 L300,560 L364,432 C344,448 322,454 300,454 C278,454 256,448 236,432 Z" fill="#4c7980"/>
        <path d="M262,440 L300,520 L338,440" fill="none" stroke="#3a6268" stroke-width="3"/>
        <path d="M226,430 C214,500 230,600 262,700 L282,640 L250,500 L246,436 Z" fill="#aeb4b7"/>
        <path d="M374,430 C386,500 370,600 338,700 L318,640 L350,500 L354,436 Z" fill="#aeb4b7"/>
        <path d="M262,452 C240,520 246,580 280,610 M338,452 C360,520 354,580 320,610" fill="none" stroke="#2d3135" stroke-width="5" stroke-linecap="round"/>
        <circle cx="300" cy="618" r="12" fill="#8b9297"/><circle cx="300" cy="618" r="6" fill="#5b6166"/>
        <rect x="372" y="560" width="74" height="30" rx="3" fill="#e2e4e0"/><text x="380" y="581" font-family="JetBrains Mono" font-size="14" font-weight="700" fill="#3a3e44">ВРАЧ</text>`,
    }),
    coat: (o) => ({
      back: `<path d="M224,440 C220,380 250,350 300,350 C350,350 380,380 376,440 Z" fill="#17181d"/>`,
      torso: `<path d="${TORSO_D}" fill="#2a2a30"/>
        <path d="M244,420 C250,400 270,392 300,392 C330,392 350,400 356,420 L360,470 C340,484 260,484 240,470 Z" fill="#17181d"/>
        <path d="M250,410 Q300,402 350,410 M248,430 Q300,422 352,430 M246,450 Q300,442 354,450" fill="none" stroke="#25262c" stroke-width="2"/>
        <path d="M236,450 C214,520 220,610 270,720 L296,690 L262,560 L258,470 Z" fill="#202026"/>
        <path d="M364,450 C386,520 380,610 330,720 L304,690 L338,560 L342,470 Z" fill="#202026"/>
        <path d="M236,450 L196,560 L262,560 Z M364,450 L404,560 L338,560 Z" fill="#26262c"/>
        <circle cx="300" cy="760" r="7" fill="#0e0e12"/><circle cx="300" cy="840" r="7" fill="#0e0e12"/>`,
    }),
  };

  // Персонаж целиком. o: {outfit, skin, ...параметры лица}
  function character(o) {
    const skin = o.skin || '#c4917a';
    const h = head(o), out = OUTFIT[o.outfit](o);
    const clip = nid('torsoc'), grad = nid('bodyg');
    const right = o.lightFrom !== 'right';
    const shade = `<linearGradient id="${grad}" x1="${right ? 0 : 1}" x2="${right ? 1 : 0}" y1="0" y2="0">
        <stop offset="0" stop-color="${PAL.shadow}" stop-opacity="0"/><stop offset=".47" stop-color="${PAL.shadow}" stop-opacity=".05"/>
        <stop offset=".55" stop-color="${PAL.shadow}" stop-opacity=".55"/><stop offset="1" stop-color="${PAL.shadow}" stop-opacity=".72"/></linearGradient>
      <clipPath id="${clip}"><path d="${TORSO_D}"/></clipPath>`;
    const rc = nid('rimt');
    return `<g>${shade}${out.back}${h.back}${o.outfit === 'coat' ? '' : neck(skin)}
      <g>${out.torso}</g>
      <g clip-path="url(#${clip})"><rect x="80" y="400" width="440" height="520" fill="url(#${grad})" style="mix-blend-mode:multiply"/>
      <rect x="80" y="400" width="440" height="520" fill="url(#vfade)"/></g>
      <clipPath id="${rc}"><rect x="${right ? 420 : 60}" y="430" width="120" height="480"/></clipPath>
      <path d="${TORSO_D}" fill="none" stroke="${PAL.rim}" stroke-width="5" opacity=".3" clip-path="url(#${rc})" filter="url(#blur3)"/>
      ${h.front}</g>`;
  }

  const CAST = {
    fedya: { outfit: 'jacket', skin: '#c08c74', hair: 'fedya', age: 1, stubble: 1, stubbleColor: '#77716c', mustache: '#6f6a66', bags: 1, crowsFeet: 1, heavyLid: 1, browColor: '#6f6964', browThick: 1.3, headW: 1.06, iris: '#4f5a5e', squint: 0.15 },
    timur: { outfit: 'hoodie', skin: '#c79878', hair: 'timur', age: 0, eyeSize: 1.06, headW: 0.93, headH: 1.0, iris: '#3a2a20', browColor: '#231c1a', gaunt: 0.6 },
    doctor: { outfit: 'doctor', skin: '#cf9f88', hair: 'doctor', mask: true, eyeSize: 1.02, headW: 0.94, iris: '#5a4a32', bags: 0.8, browColor: '#4a3428', browThick: 0.8 },
    stranger: { outfit: 'coat', skin: '#b88a74', hair: 'stranger', age: 0.4, headW: 0.98, headH: 1.03, iris: '#6a6a5a', heavyLid: 1, squint: 0.35, browColor: '#1d1c1f', smile: 0.5, smirk: true, shadowAmt: 0.75, gaunt: 0.8 },
  };

  // ---------- ОБЩИЕ DEFS ----------
  const DEFS = `<defs>
    <filter id="blur3" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3"/></filter>
    <filter id="blur6" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>
    <filter id="blur10" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10"/></filter>
    <filter id="blur24" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="24"/></filter>
    <filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="40"/></filter>
    <linearGradient id="vfade" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#0d1018" stop-opacity="0"/><stop offset="1" stop-color="#0d1018" stop-opacity=".6"/></linearGradient>
    <pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1.3" fill="#000" opacity=".28"/></pattern>
    <radialGradient id="vign" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .09 0"/></filter>
  </defs>`;

  // ---------- ФОНЫ (1080×1920) ----------
  function lampGlow(x, y, r, a = 0.55) {
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${PAL.warm}" opacity="${a}" filter="url(#glow)"/>`;
  }

  function bgHallway() {
    let g = `<rect width="1080" height="1920" fill="#1b2230"/>`;
    g += `<rect y="0" width="1080" height="1060" fill="#3a4250"/>`;               // побелка сверху
    g += `<rect y="1060" width="1080" height="860" fill="#2c3a44"/>`;            // крашеная панель снизу
    g += `<rect y="1052" width="1080" height="14" fill="#232d36"/>`;
    // обои с узором (прихожая)
    for (let y = 40; y < 1050; y += 90) for (let x = (y / 90) % 2 ? 45 : 0; x < 1080; x += 90)
      g += `<path d="M${x},${y} l14,-14 l14,14 l-14,14 Z" fill="#434c5b" opacity=".6"/>`;
    // дверь, обитая дерматином
    g += `<rect x="360" y="420" width="420" height="1360" fill="#141821"/>`;
    g += `<rect x="378" y="436" width="384" height="1330" rx="8" fill="#3e2c2a"/>`;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 4; c++) {
      const x = 425 + c * 96 + (r % 2) * 48, y = 520 + r * 140;
      if (x < 740) g += `<circle cx="${x}" cy="${y}" r="7" fill="#9a8058"/><circle cx="${x - 2}" cy="${y - 2}" r="2.5" fill="#e0c890" opacity=".7"/>`;
    }
    g += `<path d="M425,520 L713,520 M425,1640 L713,1640" stroke="#2a1d1c" stroke-width="3" opacity=".6"/>`;
    g += `<circle cx="570" cy="760" r="13" fill="#0f0d0c"/><circle cx="570" cy="760" r="7" fill="#6b7a8a"/><circle cx="567" cy="757" r="2.5" fill="#d0e2f0"/>`;
    g += `<rect x="700" y="1060" width="24" height="96" rx="6" fill="#8d8a80"/><rect x="684" y="1090" width="64" height="18" rx="6" fill="#a9a597"/>`;
    // домофон
    g += `<rect x="842" y="820" width="140" height="300" rx="14" fill="#cfcabd"/><rect x="852" y="834" width="120" height="270" rx="10" fill="#bdb8aa"/>`;
    g += `<path d="M880,860 C860,900 860,1050 880,1090 L944,1090 C964,1050 964,900 944,860 Z" fill="#e2ddd0"/>`;
    for (let i = 0; i < 5; i++) g += `<rect x="${892 + (i % 2) * 22}" y="${890 + i * 8}" width="16" height="3" fill="#8a8578"/>`;
    g += `<circle cx="960" cy="1080" r="6" fill="#4eb86a"/><circle cx="960" cy="1080" r="16" fill="#4eb86a" opacity=".25" filter="url(#blur6)"/>`;
    g += `<path d="M912,1120 C910,1200 940,1240 980,1280" fill="none" stroke="#9c988c" stroke-width="5"/>`;
    // вешалка с курткой
    g += `<rect x="60" y="560" width="230" height="16" fill="#4c3a2e"/>`;
    g += `<path d="M110,576 C70,640 70,900 96,1100 L260,1100 C286,900 280,640 240,576 Z" fill="#232b38"/><path d="M175,600 L175,1090" stroke="#1a202a" stroke-width="4"/>`;
    // лампочка
    g += `<path d="M560,0 L560,120" stroke="#1a1a1a" stroke-width="4"/><circle cx="560" cy="150" r="30" fill="#ffd9a0"/>`;
    g += lampGlow(560, 150, 230, 0.55);
    g += `<rect y="1700" width="1080" height="220" fill="#15191f"/><rect y="1696" width="1080" height="8" fill="#2c3036"/>`;
    // половик
    g += `<path d="M300,1760 L780,1760 L820,1880 L260,1880 Z" fill="#4a2e2a"/>`;
    return g;
  }

  function bgApartment() {
    let g = `<rect width="1080" height="1920" fill="#1d2330"/>`;
    // обои
    for (let x = 0; x < 1080; x += 60) g += `<rect x="${x}" y="0" width="30" height="1500" fill="#252c3a" opacity=".7"/>`;
    for (let y = 60; y < 1480; y += 120) for (let x = 15; x < 1080; x += 60) g += `<circle cx="${x + ((y / 120) % 2) * 30}" cy="${y}" r="5" fill="#3a3f4c"/>`;
    // окно со шторами
    g += `<rect x="250" y="230" width="580" height="830" fill="#0a0e18"/>`;
    g += `<rect x="270" y="250" width="540" height="790" fill="#1a2740"/>`;
    // дом напротив + огни
    g += `<rect x="300" y="520" width="240" height="520" fill="#121a2a"/><rect x="580" y="430" width="220" height="610" fill="#0f1626"/>`;
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) if ((i * 7 + j * 3) % 5 === 0) g += `<rect x="${320 + j * 55}" y="${550 + i * 80}" width="26" height="38" fill="#e3a65a" opacity=".55"/>`;
    for (let i = 0; i < 7; i++) for (let j = 0; j < 4; j++) if ((i * 5 + j) % 6 === 1) g += `<rect x="${598 + j * 52}" y="${460 + i * 80}" width="24" height="36" fill="#9fb4d0" opacity=".35"/>`;
    g += `<path d="M540,250 L540,1040 M270,640 L810,640" stroke="#0a0e18" stroke-width="16"/>`;
    g += `<rect x="236" y="1040" width="608" height="30" fill="#3a3c44"/>`;
    // тюль
    g += `<rect x="270" y="250" width="540" height="790" fill="#b8c4d4" opacity=".08"/>`;
    for (let x = 280; x < 810; x += 22) g += `<path d="M${x},250 C${x + 8},500 ${x - 8},800 ${x + 4},1040" stroke="#c9d4e2" stroke-width="2" opacity=".12" fill="none"/>`;
    // тяжёлые шторы
    g += `<rect x="200" y="200" width="680" height="16" fill="#4c4036"/>`;
    g += `<path d="M180,216 L380,216 C360,500 330,780 360,1150 L170,1150 Z" fill="#3e3434"/>`;
    g += `<path d="M700,216 L900,216 L910,1150 L720,1150 C750,780 720,500 700,216 Z" fill="#3a3132"/>`;
    for (let i = 0; i < 5; i++) {
      g += `<path d="M${200 + i * 38},216 C${210 + i * 36},600 ${196 + i * 34},900 ${200 + i * 34},1150" stroke="#2a2224" stroke-width="10" fill="none" opacity=".7"/>`;
      g += `<path d="M${720 + i * 38},216 C${730 + i * 36},600 ${724 + i * 36},900 ${730 + i * 36},1150" stroke="#251e20" stroke-width="10" fill="none" opacity=".7"/>`;
    }
    // торшер
    g += `<path d="M120,820 L230,820 L260,1000 L90,1000 Z" fill="#d79a58"/><path d="M175,1000 L175,1700" stroke="#2a241e" stroke-width="10"/><ellipse cx="175" cy="1700" rx="60" ry="14" fill="#2a241e"/>`;
    g += lampGlow(175, 930, 320, 0.6);
    g += `<path d="M90,1000 L260,1000 L560,1920 L-200,1920 Z" fill="${PAL.warm}" opacity=".06"/>`;
    // диван
    g += `<rect x="380" y="1300" width="700" height="360" rx="40" fill="#4a3c3a"/><rect x="420" y="1440" width="660" height="200" rx="26" fill="#56463f"/>`;
    g += `<rect x="360" y="1330" width="80" height="340" rx="30" fill="#3f3331"/>`;
    g += `<path d="M720,1450 L720,1640" stroke="#3a2e2c" stroke-width="6"/>`;
    // ковёр на стене (сбоку) и пол
    g += `<rect y="1660" width="1080" height="260" fill="#241c1a"/>`;
    for (let x = 0; x < 1080; x += 90) g += `<path d="M${x},1660 L${x - 160},1920" stroke="#1a1413" stroke-width="3"/>`;
    return g;
  }

  function bgStairwell() {
    let g = `<rect width="1080" height="1920" fill="#202833"/>`;
    g += `<rect y="0" width="1080" height="900" fill="#465060"/><rect y="900" width="1080" height="1020" fill="#2e4a4a"/>`;
    g += `<rect y="892" width="1080" height="12" fill="#253a3a"/>`;
    // пятна сырости и надписи
    g += `<ellipse cx="200" cy="300" rx="160" ry="90" fill="#3b4452" opacity=".8" filter="url(#blur24)"/>`;
    // марш лестницы
    for (let i = 0; i < 10; i++) {
      const y = 1880 - i * 92, x = 80 + i * 70;
      g += `<rect x="${x}" y="${y - 40}" width="900" height="40" fill="#5a5c5e"/><rect x="${x}" y="${y}" width="900" height="52" fill="#3c3e42"/>`;
    }
    // перила
    g += `<path d="M60,1500 L760,840" stroke="#5b2b24" stroke-width="18" stroke-linecap="round"/>`;
    for (let i = 0; i < 12; i++) { const x = 90 + i * 58, y = 1472 - i * 55; g += `<path d="M${x},${y} L${x},${y + 260}" stroke="#2a2c30" stroke-width="6"/>`; }
    // почтовые ящики
    g += `<rect x="640" y="1000" width="380" height="260" fill="#3b5a7a"/>`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) g += `<rect x="${652 + c * 92}" y="${1012 + r * 82}" width="84" height="72" fill="#4a6c8e"/><rect x="${666 + c * 92}" y="${1030 + r * 82}" width="56" height="8" fill="#1a2632"/>`;
    // ведро с хлоркой
    g += `<path d="M120,1700 L280,1700 L260,1880 L140,1880 Z" fill="#6f7d84"/><ellipse cx="200" cy="1700" rx="80" ry="18" fill="#8fa0a8"/><ellipse cx="200" cy="1702" rx="68" ry="12" fill="#c9e0d8" opacity=".7"/>`;
    g += `<path d="M150,1660 C160,1600 180,1580 200,1560 M230,1650 C240,1600 230,1560 250,1520" stroke="#cfe6e0" stroke-width="6" opacity=".25" fill="none" filter="url(#blur6)"/>`;
    g += `<text x="300" y="1830" font-family="JetBrains Mono" font-size="26" fill="#8e9aa0" opacity=".6">ДЕЗИНФЕКЦИЯ 12:00</text>`;
    // лампа с решёткой
    g += `<rect x="440" y="80" width="200" height="90" rx="40" fill="#e9dcc0"/><path d="M460,90 L460,160 M500,84 L500,166 M540,82 L540,168 M580,84 L580,166 M620,90 L620,160" stroke="#3a3a3a" stroke-width="5"/>`;
    g += lampGlow(540, 125, 260, 0.5);
    return g;
  }

  function bgFence() {
    let g = `<linearGradient id="skyF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1220"/><stop offset="1" stop-color="#26324a"/></linearGradient>`;
    g += `<rect width="1080" height="1920" fill="url(#skyF)"/>`;
    // корпус больницы
    g += `<rect x="80" y="300" width="920" height="1100" fill="#1a2232"/>`;
    for (let r = 0; r < 9; r++) for (let c = 0; c < 8; c++) {
      const lit = (r * 3 + c * 5) % 7 === 0;
      g += `<rect x="${120 + c * 110}" y="${340 + r * 116}" width="62" height="78" fill="${lit ? '#b8d2c8' : '#121928'}" opacity="${lit ? 0.6 : 1}"/>`;
    }
    g += `<text x="560" y="380" font-family="JetBrains Mono" font-size="40" font-weight="700" fill="#3c4a60">БОЛЬНИЦА №3</text>`;
    g += `<rect x="760" y="1220" width="140" height="180" fill="#0a0e16"/><path d="M790,1240 L870,1240 L870,1290 L790,1290 Z" fill="#c43c32" opacity=".55"/>`;
    // мокрый асфальт
    g += `<rect y="1400" width="1080" height="520" fill="#141a24"/>`;
    g += `<ellipse cx="300" cy="1600" rx="260" ry="30" fill="#e0a050" opacity=".12" filter="url(#blur10)"/>`;
    // фонарь (натрий)
    g += `<path d="M180,1900 L180,480 Q180,440 230,440 L300,440" stroke="#202530" stroke-width="18" fill="none"/><rect x="280" y="430" width="70" height="26" rx="8" fill="#f0b060"/>`;
    g += lampGlow(315, 450, 150, 0.45);
    g += `<path d="M280,456 L60,1500 L620,1500 L350,456 Z" fill="#ffb060" opacity=".07"/>`;
    // решётка забора
    g += `<rect x="0" y="1000" width="1080" height="16" fill="#1c1f26"/><rect x="0" y="1560" width="1080" height="16" fill="#1c1f26"/>`;
    for (let x = 10; x < 1080; x += 58) g += `<rect x="${x}" y="960" width="12" height="760" fill="#22262e"/><path d="M${x - 4},962 L${x + 6},930 L${x + 16},962 Z" fill="#22262e"/><rect x="${x + 2}" y="960" width="3" height="760" fill="#5a6474" opacity=".5"/>`;
    // лента кордона
    g += `<g transform="rotate(-6 540 1300)"><rect x="-40" y="1280" width="1160" height="46" fill="#c9c2b0"/>`;
    for (let x = -40; x < 1120; x += 80) g += `<path d="M${x},1280 L${x + 40},1280 L${x + 10},1326 L${x - 30},1326 Z" fill="#a33a30"/>`;
    g += `<text x="140" y="1314" font-family="JetBrains Mono" font-size="26" font-weight="800" fill="#1a1a1a" opacity=".7">КАРАНТИН · ПРОХОД ЗАПРЕЩЁН · КАРАНТИН</text></g>`;
    return g;
  }

  // ---------- РЕКВИЗИТ ----------
  function propAmpoule(label = true) {
    return `<g>${lampGlow(0, 0, 120, 0.35)}
      <path d="M-26,-130 L26,-130 L26,40 Q26,70 0,74 Q-26,70 -26,40 Z" fill="#cfe3ea" opacity=".55"/>
      <path d="M-14,-130 L-14,-160 Q0,-176 14,-160 L14,-130 Z" fill="#cfe3ea" opacity=".55"/>
      <path d="M-26,-20 L26,-20 L26,40 Q26,70 0,74 Q-26,70 -26,40 Z" fill="#8fb6c4" opacity=".55"/>
      <path d="M-18,-120 L-18,50" stroke="#fff" stroke-width="5" opacity=".6"/>
      ${label ? `<rect x="-24" y="-96" width="48" height="64" fill="#e8e2d0"/>
      <text font-family="JetBrains Mono" font-size="7.2" font-weight="700" fill="#2a2a2a"><tspan x="-21" y="-84">КОВАЛЁВ</tspan><tspan x="-21" y="-74">СЕМЁН</tspan><tspan x="-21" y="-62">82 · П.6</tspan></text>
      <rect x="-21" y="-54" width="42" height="16" fill="#2a2a2a" opacity=".8"/>` : ''}</g>`;
  }
  function propKey() {
    return `<g><circle cx="0" cy="0" r="30" fill="none" stroke="#b7a37a" stroke-width="8"/>
      <rect x="22" y="-10" width="140" height="20" rx="4" fill="#c4b088"/><path d="M120,10 L120,34 L136,34 L136,22 L148,22 L148,34 L162,34 L162,10 Z" fill="#c4b088"/>
      <rect x="40" y="-6" width="110" height="4" fill="#8a7a58"/>
      <path d="M-28,8 L-60,60" stroke="#999" stroke-width="3"/>
      <g transform="translate(-130,60)"><rect width="120" height="56" rx="10" fill="#c9a43a"/><rect x="10" y="10" width="34" height="22" fill="#9fc0d6"/><rect x="50" y="10" width="34" height="22" fill="#9fc0d6"/>
      <circle cx="26" cy="56" r="10" fill="#222"/><circle cx="94" cy="56" r="10" fill="#222"/><text x="88" y="30" font-family="JetBrains Mono" font-size="16" font-weight="800" fill="#2a2a2a">40</text></g></g>`;
  }
  function propPhone(lines = ['ПАПА', 'вызов…', 'нет ответа']) {
    return `<g><rect x="-110" y="-210" width="220" height="420" rx="26" fill="#0e1014"/><rect x="-98" y="-190" width="196" height="380" rx="14" fill="#1b2a3c"/>
      ${lampGlow(0, 0, 150, 0.18).replace(PAL.warm, '#8fb6e0')}
      <circle cx="0" cy="-90" r="40" fill="#3b4d63"/><path d="M-22,-70 Q0,-116 22,-70" fill="#5c7088"/><circle cx="0" cy="-100" r="14" fill="#5c7088"/>
      <text x="0" y="-10" text-anchor="middle" font-family="Inter" font-weight="700" font-size="30" fill="#e6edf5">${lines[0]}</text>
      <text x="0" y="24" text-anchor="middle" font-family="Inter" font-size="18" fill="#9fb2c8">${lines[1]}</text>
      <text x="0" y="52" text-anchor="middle" font-family="JetBrains Mono" font-size="16" fill="#e07060">${lines[2]}</text>
      <circle cx="0" cy="130" r="28" fill="#c8443a"/><path d="M-12,128 Q0,118 12,128" stroke="#fff" stroke-width="5" fill="none"/></g>`;
  }
  function propSuitcase(open = true) {
    let g = `<g>`;
    if (open) {
      g += `<path d="M-230,-40 L230,-40 L250,-250 L-250,-250 Z" fill="#7a2622"/><path d="M-214,-56 L214,-56 L230,-232 L-230,-232 Z" fill="#2a1414"/>`;
      g += `<rect x="-240" y="-40" width="480" height="230" rx="16" fill="#8e2c26"/><rect x="-222" y="-28" width="444" height="196" rx="8" fill="#1c1e24"/>`;
      for (let r = 0; r < 4; r++) for (let c = 0; c < 25; c++) {
        const x = -210 + c * 17.2, y = -16 + r * 46;
        g += `<rect x="${x}" y="${y}" width="10" height="38" rx="4" fill="#bcd6e0" opacity=".75"/><rect x="${x + 2}" y="${y + 2}" width="2" height="30" fill="#fff" opacity=".7"/>`;
      }
      g += `<rect x="-190" y="-30" width="380" height="200" fill="#9fd0e8" opacity=".12" filter="url(#blur10)"/>`;
    } else {
      g += `<rect x="-200" y="-140" width="400" height="300" rx="22" fill="#8e2c26"/><rect x="-200" y="-140" width="400" height="300" rx="22" fill="none" stroke="#5e1a16" stroke-width="6"/>`;
      g += `<path d="M-60,-140 L-60,-180 Q-60,-196 -44,-196 L44,-196 Q60,-196 60,-180 L60,-140" fill="none" stroke="#2a1a18" stroke-width="16"/>`;
      g += `<rect x="-150" y="-150" width="40" height="24" rx="4" fill="#b8a070"/><rect x="110" y="-150" width="40" height="24" rx="4" fill="#b8a070"/>`;
      g += `<path d="M-200,10 L200,10" stroke="#6e1f1b" stroke-width="4"/>`;
    }
    return g + `</g>`;
  }
  function propWrist(spots = 1) {
    // предплечье с пятнами, рукав худи
    let g = `<g><path d="M-60,200 C-70,80 -60,-60 -40,-170 L40,-170 C60,-60 70,80 60,200 Z" fill="#c79878"/>
      <path d="M10,-170 C30,-60 40,80 60,200 L20,200 C10,60 4,-60 -6,-170 Z" fill="${PAL.shadow}" opacity=".45" style="mix-blend-mode:multiply"/>
      <path d="M-46,-120 C-20,-110 20,-110 46,-120" stroke="#8a5a48" stroke-width="2" opacity=".5" fill="none"/>`;
    const pts = [[-20, -150], [10, -130], [-30, -100], [24, -96], [-6, -70], [18, -40], [-24, -30], [4, -4], [-14, 24], [20, 30], [-4, 60], [14, 92]];
    pts.forEach(([x, y], i) => {
      if (i / pts.length < spots) g += `<ellipse cx="${x}" cy="${y}" rx="${7 + (i % 3) * 3}" ry="${5 + (i % 2) * 3}" fill="#7a3a4a" opacity=".75"/><ellipse cx="${x}" cy="${y}" rx="${11 + (i % 3) * 3}" ry="${8 + (i % 2) * 3}" fill="#9a4a5a" opacity=".25" filter="url(#blur3)"/>`;
    });
    g += `<path d="M-80,200 L80,200 L90,320 L-90,320 Z" fill="#5c6a4e"/><path d="M-80,206 L80,206" stroke="#4c5840" stroke-width="8"/></g>`;
    return g;
  }
  function propBag() {
    return `<g><rect x="-170" y="-170" width="340" height="340" rx="24" fill="#a08a3c"/><rect x="-170" y="-170" width="340" height="60" rx="20" fill="#8c7832"/>
      <path d="M-170,-110 L170,-110" stroke="#6b5c2a" stroke-width="4"/><path d="M-100,-170 Q0,-260 100,-170" fill="none" stroke="#5a4c22" stroke-width="18"/>
      <rect x="-80" y="-40" width="160" height="70" rx="8" fill="#6b5c2a" opacity=".6"/><text x="-56" y="6" font-family="JetBrains Mono" font-weight="800" font-size="30" fill="#c9b66a" opacity=".9">ЕДА 24</text>
      <rect x="-170" y="-170" width="160" height="340" rx="24" fill="#fff" opacity=".06"/><rect x="40" y="-170" width="130" height="340" fill="${PAL.shadow}" opacity=".35" style="mix-blend-mode:multiply"/></g>`;
  }

  // ---------- ПЛАШКИ ----------
  function plaque(x, y, label, text, color, size = 34) {
    const w = (label.length + text.length + 2) * size * 0.6 + 40;
    return `<g transform="translate(${x},${y})"><rect width="${w}" height="${size * 1.9}" fill="#0a0d12" opacity=".72"/>
      <rect x="3" y="3" width="${w - 6}" height="${size * 1.9 - 6}" fill="none" stroke="${color}" stroke-width="3"/>
      <text x="20" y="${size * 1.28}" font-family="JetBrains Mono" font-weight="700" font-size="${size}" fill="${color}">${label}<tspan fill="#e8e6df"> ${text}</tspan></text></g>`;
  }
  const GREEN = '#5fd07a', YELLOW = '#f2c94c';
  function plaqueWhere(x, y, t, s) { return plaque(x, y, 'ГДЕ:', t, GREEN, s); }
  function plaqueWhen(x, y, t, s) { return plaque(x, y, 'КОГДА:', t, YELLOW, s); }
  function timer(x, y, t, size = 40, blinkOn = true) {
    const w = t.length * size * 0.6 + 96;
    return `<g transform="translate(${x},${y})"><rect width="${w}" height="${size * 1.8}" fill="#0a0d12" opacity=".72"/>
      <rect x="3" y="3" width="${w - 6}" height="${size * 1.8 - 6}" fill="none" stroke="${YELLOW}" stroke-width="3"/>
      <circle cx="34" cy="${size * 0.9}" r="10" fill="#e0453a" opacity="${blinkOn ? 1 : 0.2}"/>
      <text x="60" y="${size * 1.25}" font-family="JetBrains Mono" font-weight="800" font-size="${size}" fill="${YELLOW}">${t}</text></g>`;
  }
  function screenFX(w = 1080, h = 1920) {
    return `<rect width="${w}" height="${h}" fill="url(#vign)"/><rect width="${w}" height="${h}" fill="url(#scan)"/><rect width="${w}" height="${h}" filter="url(#grain)" opacity=".6"/>`;
  }

  global.ART = { PAL, DEFS, character, CAST, bgHallway, bgApartment, bgStairwell, bgFence, propAmpoule, propKey, propPhone, propSuitcase, propWrist, propBag, plaqueWhere, plaqueWhen, timer, screenFX, lampGlow, GREEN, YELLOW };
})(typeof window !== 'undefined' ? window : globalThis);

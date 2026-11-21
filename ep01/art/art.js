// «Ночь без закона» — библиотека рисунков (SVG-строки). Один стиль для листа персонажей и анимации.
// Все функции возвращают строку SVG. Персонажи рисуются с началом координат у ног (0,0), рост ~900.
(function (root) {
  const P = {
    sky0: '#04071a', sky1: '#0d1438', sky2: '#1d2660',
    navy: '#0a0f2a', wall: '#1f2650', wallDark: '#161c3e', roof: '#0e1230', shutter: '#2b3366', shutterLine: '#1a2048',
    win: '#ffcf5a', winGlow: '#ffb534', ground: '#0b0e22', road: '#0e1330',
    red: '#ff2a3c', blue: '#2f6bff', neonC: '#3cf2ff', neonM: '#ff3ca6', neonG: '#8dff4a', neonY: '#ffe14a',
    skin: '#e3a98b', skinShade: '#c48a70', skin2: '#eab99c',
    jacket: '#3b2a22', jacketHi: '#5a4234', jeans: '#1c2a4a', boots: '#120d0b',
    hoodie: '#2f5fd0', hoodieDark: '#2449a8', pack: '#c8752b', packDark: '#8f4f1a', pants2: '#24262f', sneaker: '#d8d8e0',
    hairM: '#a3a6b4', hairMDark: '#6f7284', hairS: '#1c1512', gold: '#f2c14e', ink: '#0a0a12', white: '#f4f1ea',
  };
  const rad = (a) => (a * Math.PI) / 180;
  const pt = (x, y, a, L) => [x + Math.sin(rad(a)) * L, y + Math.cos(rad(a)) * L];
  const f = (n) => Math.round(n * 10) / 10;
  // обратная кинематика: углы плеча и локтя, чтобы кисть оказалась в точке (tx,ty)
  function ik(sx, sy, tx, ty, L1, L2, bend = 1) {
    const dx = tx - sx, dy = ty - sy; let d = Math.hypot(dx, dy); d = Math.min(d, L1 + L2 - 1);
    const base = Math.atan2(dx, dy), c = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
    const a1 = base + bend * c; const ex = sx + Math.sin(a1) * L1, ey = sy + Math.cos(a1) * L1;
    const a2 = Math.atan2(tx - ex, ty - ey); return [(a1 * 180) / Math.PI, (a2 * 180) / Math.PI];
  }

  function defs() {
    return `<defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <filter id="glowBig" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="22"/></filter>
    <filter id="soft"><feGaussianBlur stdDeviation="3"/></filter>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky0}"/><stop offset="0.6" stop-color="${P.sky1}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient>
    <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9a463"/><stop offset="1" stop-color="#f7d79a"/></linearGradient>
    <radialGradient id="redLight" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#ff2020" stop-opacity="0.55"/><stop offset="1" stop-color="#ff2020" stop-opacity="0"/></radialGradient>
    <radialGradient id="lamp" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.45"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
    <linearGradient id="beam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff2a2a" stop-opacity="0.75"/><stop offset="1" stop-color="#ff2a2a" stop-opacity="0"/></linearGradient>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b8f9e"/><stop offset="1" stop-color="#3d4050"/></linearGradient>
    <pattern id="slats" width="20" height="26" patternUnits="userSpaceOnUse"><rect width="20" height="26" fill="${P.shutter}"/><rect y="22" width="20" height="4" fill="${P.shutterLine}"/></pattern>
    <pattern id="slatsDay" width="20" height="26" patternUnits="userSpaceOnUse"><rect width="20" height="26" fill="#b99a7a"/><rect y="22" width="20" height="4" fill="#8e7259"/></pattern>
    <pattern id="boards" width="160" height="40" patternUnits="userSpaceOnUse"><rect width="160" height="40" fill="#1a1530"/><rect y="37" width="160" height="3" fill="#100d20"/><rect x="100" width="3" height="40" fill="#100d20"/></pattern>
    </defs>`;
  }

  // ---------- Лица ----------
  function face(o, cx, cy, kind) {
    const look = o.look || 0, ex = 34, ey = cy - 4;
    const e = o.eyes || 'normal';
    let s = '';
    // брови
    const browY = ey - 30;
    const brow = {
      normal: [[-52, browY, -18, browY - 4], [18, browY - 4, 52, browY]],
      worried: [[-52, browY + 2, -18, browY - 12], [18, browY - 12, 52, browY + 2]],
      angry: [[-52, browY - 10, -18, browY + 4], [18, browY + 4, 52, browY - 10]],
      sad: [[-52, browY + 4, -18, browY - 8], [18, browY - 8, 52, browY + 4]],
    }[o.brow || 'normal'];
    brow.forEach(([x1, y1, x2, y2]) => (s += `<line x1="${cx + x1 + look * 0.5}" y1="${y1}" x2="${cx + x2 + look * 0.5}" y2="${y2}" stroke="${kind === 'M' ? P.hairMDark : P.hairS}" stroke-width="8" stroke-linecap="round"/>`));
    [-1, 1].forEach((sd) => {
      const x = cx + sd * ex + look * 0.5;
      if (e === 'closed') s += `<path d="M${x - 15} ${ey} Q${x} ${ey + 9} ${x + 15} ${ey}" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>`;
      else {
        const h = e === 'wide' ? 17 : e === 'narrow' ? 7 : 12;
        s += `<ellipse cx="${x}" cy="${ey}" rx="16" ry="${h}" fill="${P.white}"/>`;
        s += `<circle cx="${x + look * 0.4}" cy="${ey + 1}" r="${e === 'wide' ? 6 : 7.5}" fill="${P.ink}"/>`;
        if (kind === 'M') s += `<path d="M${x - 17} ${ey + h + 6} q17 6 34 0" fill="none" stroke="${P.skinShade}" stroke-width="3"/>`;
      }
    });
    // нос
    s += `<path d="M${cx + look * 0.7} ${ey + 10} l-7 26 l12 0" fill="none" stroke="${P.skinShade}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
    const my = cy + 52, mx = cx + look * 0.6;
    const m = o.mouth || 'flat';
    if (m === 'flat') s += `<line x1="${mx - 18}" y1="${my}" x2="${mx + 18}" y2="${my}" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>`;
    if (m === 'tight') s += `<path d="M${mx - 18} ${my + 3} q18 -6 36 0" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>`;
    if (m === 'open') s += `<ellipse cx="${mx}" cy="${my + 2}" rx="13" ry="16" fill="#2a0d10"/>`;
    if (m === 'talk') s += `<ellipse cx="${mx}" cy="${my + 1}" rx="15" ry="8" fill="#2a0d10"/>`;
    if (m === 'frown') s += `<path d="M${mx - 18} ${my + 6} q18 -14 36 0" fill="none" stroke="${P.ink}" stroke-width="6" stroke-linecap="round"/>`;
    if (kind === 'M') s += `<path d="M${cx - 66} ${cy + 26} q6 14 18 16 M${cx + 66} ${cy + 26} q-6 14 -18 16" fill="none" stroke="${P.skinShade}" stroke-width="3"/>`;
    return s;
  }

  // ---------- Конечности ----------
  function limb(x, y, a1, a2, L1, L2, w, color) {
    const [ex, ey] = pt(x, y, a1, L1);
    const [hx, hy] = pt(ex, ey, a2, L2);
    return { path: `<path d="M${f(x)} ${f(y)} L${f(ex)} ${f(ey)} L${f(hx)} ${f(hy)}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`, ex, ey, hx, hy };
  }

  // ---------- Миша (главный герой) ----------
  // o: {armL:[a1,a2], armR:[a1,a2], legL, legR, eyes, mouth, brow, look, flash:'off'|'on', keys:true, handOnMouth, lit(0..1 красный отсвет)}
  function hero(o = {}) {
    let armL = o.armL || [-14, -4], armR = o.armR || [14, 8];
    if (o.handOnMouth) armR = ik(104, -670, 10 + (o.look || 0) * 0.6, -772, 170, 160, 1);
    if (o.handL) armL = ik(-104, -670, o.handL[0], o.handL[1], 170, 160, 1);
    if (o.handR) armR = ik(104, -670, o.handR[0], o.handR[1], 170, 160, -1);
    const legL = o.legL || [-4, 0], legR = o.legR || [4, 0];
    let s = '';
    // ноги
    const lL = limb(-38, -390, legL[0], legL[1], 200, 190, 58, P.jeans), lR = limb(38, -390, legR[0], legR[1], 200, 190, 58, P.jeans);
    [lL, lR].forEach((l) => (s += l.path + `<ellipse cx="${f(l.hx + 10)}" cy="${f(l.hy + 8)}" rx="44" ry="20" fill="${P.boots}"/>`));
    // куртка (корпус)
    s += `<path d="M-124 -690 Q-130 -520 -116 -370 L116 -370 Q130 -520 124 -690 Q0 -724 -124 -690Z" fill="${P.jacket}"/>`;
    s += `<path d="M-112 -370 L112 -370 L112 -340 L-112 -340Z" fill="#2a1e18"/>`; // пояс куртки
    s += `<path d="M-30 -700 L0 -600 L30 -700" fill="${P.white}" opacity="0.85"/>`; // футболка
    s += `<path d="M-30 -702 L-70 -640 L-40 -560 L-6 -600Z M30 -702 L70 -640 L40 -560 L6 -600Z" fill="${P.jacketHi}"/>`; // лацканы
    s += `<line x1="4" y1="-598" x2="4" y2="-350" stroke="#a88a5a" stroke-width="4" stroke-dasharray="6 5"/>`; // молния
    s += `<path d="M-96 -660 Q-100 -520 -94 -400" stroke="#7a5a44" stroke-width="6" fill="none" opacity="0.6"/>`; // блик кожи
    // руки
    const aL = limb(-104, -670, armL[0], armL[1], 170, 160, 50, P.jacket), aR = limb(104, -670, armR[0], armR[1], 170, 160, 50, P.jacket);
    s += aL.path + `<circle cx="${f(aL.hx)}" cy="${f(aL.hy)}" r="26" fill="${P.skin}"/>`;
    s += aR.path + `<circle cx="${f(aR.hx)}" cy="${f(aR.hy)}" r="26" fill="${P.skin}"/>`;
    // ключи на пальце правой руки
    if (o.keys !== false && !o.flashR) {
      const kx = aR.hx + 6, ky = aR.hy + 28, spin = o.keySpin || 0;
      s += `<g transform="rotate(${spin} ${f(aR.hx)} ${f(aR.hy + 8)})"><circle cx="${f(kx)}" cy="${f(ky)}" r="16" fill="none" stroke="#c9cbd6" stroke-width="5"/>
        <rect x="${f(kx - 4)}" y="${f(ky + 12)}" width="9" height="34" rx="2" fill="#c9cbd6"/><rect x="${f(kx + 6)}" y="${f(ky + 8)}" width="8" height="28" rx="2" fill="${P.gold}" transform="rotate(-25 ${f(kx)} ${f(ky)})"/>
        <rect x="${f(kx - 18)}" y="${f(ky + 10)}" width="22" height="30" rx="7" fill="#111" transform="rotate(25 ${f(kx)} ${f(ky)})"/><circle cx="${f(kx - 4)}" cy="${f(ky + 26)}" r="4" fill="${o.fobPress ? P.red : '#555'}" transform="rotate(25 ${f(kx)} ${f(ky)})"/></g>`;
    }
    // фонарик
    if (o.flash) {
      const hand = o.flashR ? aR : aL; const ang = (o.flashR ? armR : armL)[1];
      const dirx = Math.sin(rad(ang)), diry = Math.cos(rad(ang));
      const tx = hand.hx + dirx * 40, ty = hand.hy + diry * 40;
      const deg = 90 - ang; // направление в градусах для rotate (0 = вправо)
      if (o.flash === 'on') s += `<g transform="translate(${f(tx)} ${f(ty)}) rotate(${f(deg)})"><path d="M0 -16 L${o.beamLen || 700} -${o.beamW || 170} L${o.beamLen || 700} ${o.beamW || 170} L0 16Z" fill="url(#beam)"/></g>`;
      s += `<g transform="translate(${f(hand.hx)} ${f(hand.hy)}) rotate(${f(deg)})"><rect x="-10" y="-13" width="56" height="26" rx="6" fill="#26262e"/><rect x="40" y="-16" width="12" height="32" rx="3" fill="#3a3a44"/>${o.flash === 'on' ? `<circle cx="52" cy="0" r="12" fill="#ff4040" filter="url(#glow)"/>` : ''}</g>`;
      s += `<circle cx="${f(hand.hx)}" cy="${f(hand.hy)}" r="26" fill="${P.skin}"/>`;
    }
    // шея и голова
    s += `<rect x="-24" y="-740" width="48" height="50" fill="${P.skinShade}"/>`;
    const hy = -835;
    // голова мужчины: квадратная челюсть, короткая седая стрижка, щетина
    s += `<path d="M-90 ${hy - 40} Q-92 ${hy - 104} 0 ${hy - 108} Q92 ${hy - 104} 90 ${hy - 40} L88 ${hy + 50} Q80 ${hy + 104} 0 ${hy + 110} Q-80 ${hy + 104} -88 ${hy + 50}Z" fill="${P.skin}"/>`;
    s += `<path d="M-86 ${hy + 30} Q-82 ${hy + 102} 0 ${hy + 110} Q82 ${hy + 102} 86 ${hy + 30} Q60 ${hy + 60} 0 ${hy + 62} Q-60 ${hy + 60} -86 ${hy + 30}Z" fill="#6f7284" opacity="0.38"/>`; // щетина
    s += `<ellipse cx="-90" cy="${hy + 6}" rx="16" ry="24" fill="${P.skinShade}"/><ellipse cx="90" cy="${hy + 6}" rx="16" ry="24" fill="${P.skinShade}"/>`;
    s += `<path d="M-94 ${hy - 20} Q-100 ${hy - 118} 0 ${hy - 122} Q100 ${hy - 118} 94 ${hy - 20} L84 ${hy - 46} Q70 ${hy - 80} 40 ${hy - 84} Q0 ${hy - 70} -40 ${hy - 84} Q-70 ${hy - 80} -84 ${hy - 46}Z" fill="${P.hairM}"/>`; // седой ёжик с залысинами
    s += `<path d="M-50 ${hy - 106} l10 -6 M-20 ${hy - 112} l10 -6 M14 ${hy - 112} l10 -6 M46 ${hy - 104} l10 -6" stroke="${P.hairMDark}" stroke-width="4"/>`;
    s += face(o, 0, hy, 'M');
    s += `<path d="M${-40 + (o.look || 0) * 0.6} ${hy + 44} Q${(o.look || 0) * 0.6} ${hy + 30} ${40 + (o.look || 0) * 0.6} ${hy + 44} Q${(o.look || 0) * 0.6} ${hy + 38} ${-40 + (o.look || 0) * 0.6} ${hy + 44}Z" fill="${P.hairMDark}" stroke="${P.hairMDark}" stroke-width="8" stroke-linejoin="round"/>`; // усы
    if (o.handOnMouth) { const a = limb(104, -670, armR[0], armR[1], 170, 160, 50, P.jacket); s += a.path + `<circle cx="${f(a.hx)}" cy="${f(a.hy)}" r="28" fill="${P.skin}" stroke="${P.skinShade}" stroke-width="3"/>`; }
    return `<g>${s}</g>`;
  }

  // ---------- Сестра (Лиза, 17) ----------
  function sister(o = {}) {
    let armL = o.armL || [-10, -2], armR = o.armR || [10, 4];
    if (o.handL) armL = ik(-92, -640, o.handL[0], o.handL[1], 160, 150, 1);
    if (o.handR) armR = ik(92, -640, o.handR[0], o.handR[1], 160, 150, -1);
    const legL = o.legL || [-4, 0], legR = o.legR || [4, 0];
    let s = '';
    // рюкзак сзади
    if (o.pack !== false) s += `<rect x="-120" y="-660" width="240" height="260" rx="40" fill="${P.packDark}"/>`;
    const lL = limb(-32, -370, legL[0], legL[1], 190, 180, 50, P.pants2), lR = limb(32, -370, legR[0], legR[1], 190, 180, 50, P.pants2);
    [lL, lR].forEach((l) => (s += l.path + `<ellipse cx="${f(l.hx + 8)}" cy="${f(l.hy + 8)}" rx="38" ry="17" fill="${P.sneaker}"/><rect x="${f(l.hx - 28)}" y="${f(l.hy + 12)}" width="72" height="8" fill="#9a9aa6"/>`));
    // худи
    s += `<path d="M-92 -660 Q-104 -500 -100 -360 L100 -360 Q104 -500 92 -660 Q0 -690 -92 -660Z" fill="${P.hoodie}"/>`;
    s += `<path d="M-70 -470 L70 -470 L60 -400 L-60 -400Z" fill="${P.hoodieDark}"/>`; // карман
    s += `<line x1="-14" y1="-650" x2="-18" y2="-560" stroke="${P.white}" stroke-width="4"/><line x1="14" y1="-650" x2="18" y2="-560" stroke="${P.white}" stroke-width="4"/>`;
    // лямки рюкзака
    if (o.pack !== false) s += `<path d="M-78 -665 Q-90 -560 -70 -460 M78 -665 Q90 -560 70 -460" stroke="${P.pack}" stroke-width="20" fill="none" stroke-linecap="round"/>`;
    // руки: левая с порванным рукавом
    const aL = limb(-92, -640, armL[0], armL[1], 160, 150, 44, P.hoodie), aR = limb(92, -640, armR[0], armR[1], 160, 150, 44, P.hoodie);
    const hideL = o.hideSleeve; // спрятала руку за спину
    if (!hideL) {
      s += aL.path;
      // порванная часть: кожа на предплечье + лоскут
      const mx = aL.ex + (aL.hx - aL.ex) * 0.35, my = aL.ey + (aL.hy - aL.ey) * 0.35;
      s += `<path d="M${f(mx)} ${f(my)} L${f(aL.hx)} ${f(aL.hy)}" stroke="${P.skin2}" stroke-width="34" stroke-linecap="round"/>`;
      s += `<path d="M${f(mx - 22)} ${f(my - 6)} l10 14 l8 -10 l9 14 l8 -12 l9 12" stroke="${P.hoodie}" stroke-width="8" fill="none" stroke-linejoin="round"/>`;
      s += `<path d="M${f(mx + 14)} ${f(my + 4)} l10 40 l-10 -6" fill="${P.hoodieDark}"/>`;
      s += `<path d="M${f(mx - 6)} ${f(my + 30)} l20 6" stroke="#c0503c" stroke-width="3"/>`; // царапина
      s += `<circle cx="${f(aL.hx)}" cy="${f(aL.hy)}" r="23" fill="${P.skin2}"/>`;
    } else s += `<path d="M-92 -640 L-120 -500 L-80 -420" stroke="${P.hoodieDark}" stroke-width="44" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += aR.path + `<circle cx="${f(aR.hx)}" cy="${f(aR.hy)}" r="23" fill="${P.skin2}"/>`;
    if (o.point) s += `<line x1="${f(aR.hx)}" y1="${f(aR.hy)}" x2="${f(aR.hx + Math.sin(rad(armR[1])) * 40)}" y2="${f(aR.hy + Math.cos(rad(armR[1])) * 40)}" stroke="${P.skin2}" stroke-width="12" stroke-linecap="round"/>`;
    // шея, наушники на шее
    s += `<rect x="-20" y="-700" width="40" height="46" fill="#d49f85"/>`;
    const hp = o.hpGlow || 0;
    s += `<path d="M-60 -668 Q0 -620 60 -668" stroke="#d8d8e2" stroke-width="12" fill="none"/>`;
    s += `<rect x="-86" y="-694" width="38" height="50" rx="16" fill="#e8e8ef"/><rect x="48" y="-694" width="38" height="50" rx="16" fill="#e8e8ef"/>`;
    s += `<rect x="-80" y="-686" width="26" height="34" rx="10" fill="${hp ? P.neonM : '#9a9aa8'}" ${hp ? 'filter="url(#glow)"' : ''}/><rect x="54" y="-686" width="26" height="34" rx="10" fill="${hp ? P.neonM : '#9a9aa8'}" ${hp ? 'filter="url(#glow)"' : ''}/>`;
    if (hp) for (let i = 1; i <= 3; i++) s += `<path d="M${-96 - i * 22} -700 q-14 30 0 60 M${96 + i * 22} -700 q14 30 0 60" stroke="${P.neonM}" stroke-width="5" fill="none" opacity="${(1.1 - i * 0.28) * hp}"/>`;
    // голова
    const hy = -790;
    s += `<path d="M-84 ${hy - 20} Q-90 ${hy - 110} 0 ${hy - 112} Q90 ${hy - 110} 84 ${hy - 20}Z" fill="${P.hairS}"/>`;
    s += `<path d="M60 ${hy - 70} Q150 ${hy - 60} 130 ${hy + 60} Q110 ${hy - 10} 70 ${hy - 20}Z" fill="${P.hairS}"/>`; // хвост
    s += `<ellipse cx="0" cy="${hy}" rx="80" ry="92" fill="${P.skin2}"/>`;
    s += `<path d="M-84 ${hy - 10} Q-70 ${hy - 104} 10 ${hy - 100} Q80 ${hy - 96} 84 ${hy - 20} Q20 ${hy - 70} -84 ${hy - 10}Z" fill="${P.hairS}"/>`;
    s += face(o, 0, hy + 6, 'S');
    return `<g>${s}</g>`;
  }

  // ---------- Человек в светящейся маске ----------
  function masked(o = {}) {
    const c = o.color || P.neonC, g = o.grin !== false;
    let s = '';
    s += `<path d="M-130 0 L-110 -560 Q-120 -760 0 -800 Q120 -760 110 -560 L130 0Z" fill="#070912" stroke="${c}" stroke-opacity="0.35" stroke-width="5"/>`;
    s += `<path d="M-96 -640 Q-100 -770 0 -780 Q100 -770 96 -640 Q60 -600 0 -600 Q-60 -600 -96 -640Z" fill="#0f1220"/>`; // капюшон
    s += `<g filter="url(#glow)"><ellipse cx="0" cy="-680" rx="62" ry="74" fill="none" stroke="${c}" stroke-width="7"/>
      <path d="M-38 -702 l26 10 l-26 10Z M38 -702 l-26 10 l26 10Z" fill="${c}"/>
      ${g ? `<path d="M-34 -648 Q0 -620 34 -648" stroke="${c}" stroke-width="6" fill="none"/><path d="M-22 -640 v10 M-8 -634 v12 M8 -634 v12 M22 -640 v10" stroke="${c}" stroke-width="4"/>` : `<line x1="-26" y1="-640" x2="26" y2="-640" stroke="${c}" stroke-width="6"/>`}
      ${o.talk ? `<ellipse cx="0" cy="-640" rx="14" ry="${6 + o.talk * 10}" fill="${c}"/>` : ''}</g>`;
    s += `<ellipse cx="0" cy="-680" rx="120" ry="130" fill="${c}" opacity="0.12" filter="url(#glowBig)"/>`;
    if (o.arms) s += `<path d="M-110 -540 L-170 -300 M110 -540 L170 -300" stroke="#070912" stroke-width="50" stroke-linecap="round"/>`;
    return `<g>${s}</g>`;
  }

  // ---------- Фоны (1080×1920) ----------
  function rain(seed = 1, n = 140, phase = 0, color = '#8fa6ff', op = 0.35) {
    let s = '', r = seed * 9301;
    const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < n; i++) {
      const x = rnd() * 1180 - 50, y0 = rnd() * 1920, L = 30 + rnd() * 50, sp = 0.6 + rnd() * 0.8;
      const y = ((y0 + phase * 2400 * sp) % 2000) - 60;
      s += `<line x1="${f(x)}" y1="${f(y)}" x2="${f(x - L * 0.18)}" y2="${f(y + L)}" stroke="${color}" stroke-width="2" opacity="${f(op * (0.5 + rnd() * 0.5))}"/>`;
    }
    return `<g>${s}</g>`;
  }

  function smallHouse(x, y, w, h, wins, prefix) {
    let s = `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="${P.wallDark}"/><path d="M${x - 20} ${y - h} L${x + w / 2} ${y - h - w * 0.4} L${x + w + 20} ${y - h}Z" fill="${P.roof}"/>`;
    wins.forEach(([wx, wy, on], i) => {
      s += `<rect class="${prefix}${i}" x="${x + wx}" y="${y - h + wy}" width="44" height="54" fill="${on ? P.win : '#0b0f26'}"/>`;
      if (on) s += `<rect x="${x + wx - 14}" y="${y - h + wy - 14}" width="72" height="82" fill="${P.winGlow}" opacity="0.18" filter="url(#soft)"/>`;
    });
    return s;
  }

  // Экстерьер: дом в посёлке. o.lit — массив вкл/выкл соседних окон (12 шт), o.shut 0..1 — насколько опущены ставни, o.siren 0..1, o.redWin — красный отсвет в окне, o.mask — маски у забора
  function bgExterior(o = {}) {
    const lit = o.lit || Array(12).fill(1), shut = o.shut ?? 1, ph = o.phase || 0;
    let s = `<rect width="1080" height="1920" fill="url(#sky)"/>`;
    for (let i = 0; i < 40; i++) s += `<circle cx="${(i * 137) % 1080}" cy="${(i * 89) % 700}" r="${i % 3 ? 1.5 : 2.5}" fill="#fff" opacity="${0.3 + (i % 4) * 0.1}"/>`;
    s += `<circle cx="820" cy="260" r="70" fill="#d9dcff" opacity="0.18" filter="url(#glowBig)"/><circle cx="820" cy="260" r="44" fill="#cfd4ff" opacity="0.5"/>`;
    // далёкий город
    let city = '';
    for (let i = 0; i < 18; i++) { const bx = i * 64 - 20, bh = 120 + ((i * 53) % 160); city += `<rect x="${bx}" y="${1020 - bh}" width="58" height="${bh}" fill="#121a44"/>`; for (let j = 0; j < 4; j++) if ((i + j) % 3 === 0) city += `<rect x="${bx + 12 + (j % 2) * 22}" y="${1030 - bh + 20 + j * 26}" width="10" height="12" fill="${P.win}" opacity="${o.cityOff ? 0.1 : 0.7}"/>`; }
    s += city;
    s += `<rect y="1020" width="1080" height="900" fill="${P.ground}"/>`;
    // соседи
    s += smallHouse(-60, 1180, 280, 200, [[40, 50, lit[0]], [130, 50, lit[1]], [210, 50, lit[2]], [80, 130, lit[3]]], 'nl');
    s += smallHouse(860, 1180, 280, 200, [[30, 50, lit[4]], [120, 50, lit[5]], [200, 50, lit[6]], [150, 130, lit[7]]], 'nr');
    s += smallHouse(250, 1080, 160, 120, [[30, 40, lit[8]], [90, 40, lit[9]]], 'nf');
    s += smallHouse(700, 1080, 160, 120, [[30, 40, lit[10]], [90, 40, lit[11]]], 'ng');
    // главный дом
    s += `<rect x="200" y="760" width="680" height="760" fill="${P.wall}"/>`;
    s += `<path d="M160 770 L540 470 L920 770Z" fill="${P.roof}"/><rect x="700" y="520" width="60" height="160" fill="${P.roof}"/>`;
    s += `<rect x="200" y="1110" width="680" height="16" fill="${P.wallDark}"/>`;
    const win = (x, y, w, h, sh, open) => {
      let r = `<rect x="${x - 12}" y="${y - 12}" width="${w + 24}" height="${h + 24}" fill="${P.wallDark}"/>`;
      r += open ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#03040c"/>` : `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${P.win}"/><rect x="${x - 30}" y="${y - 30}" width="${w + 60}" height="${h + 60}" fill="${P.winGlow}" opacity="0.2" filter="url(#soft)"/>`;
      if (open && o.redWin) r += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#ff2020" opacity="${0.25 * o.redWin}"/>`;
      if (sh > 0) r += `<rect x="${x}" y="${y}" width="${w}" height="${h * sh}" fill="url(#slats)"/><rect x="${x - 6}" y="${y - 14}" width="${w + 12}" height="16" fill="${P.shutterLine}"/>`;
      r += `<line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="${P.wallDark}" stroke-width="6" opacity="${sh >= 1 ? 0 : 1}"/>`;
      return r;
    };
    const stuck = o.stuck ?? 0.18; // застрявшая ставня наверху
    s += win(270, 840, 200, 210, shut, false);
    s += win(610, 840, 200, 210, Math.min(shut, stuck), true);
    s += win(250, 1200, 170, 200, shut, false);
    s += win(660, 1200, 170, 200, shut, false);
    s += `<rect x="470" y="1210" width="140" height="310" fill="#141936"/><circle cx="590" cy="1370" r="8" fill="${P.gold}"/>`;
    if (o.markOnDoor) s += `<g filter="url(#glow)"><circle cx="540" cy="1300" r="34" fill="none" stroke="${P.neonM}" stroke-width="9"/><line x1="515" y1="1275" x2="565" y2="1325" stroke="${P.neonM}" stroke-width="9"/></g>`;
    s += `<rect x="440" y="1520" width="200" height="20" fill="#1a1f40"/>`;
    // фонарь
    s += `<rect x="96" y="980" width="10" height="560" fill="#0a0d1e"/><rect x="80" y="970" width="44" height="18" rx="5" fill="#0a0d1e"/>`;
    if (!o.lampOff) s += `<circle cx="102" cy="992" r="12" fill="#ffe0a0"/><path d="M102 992 L-60 1560 L270 1560Z" fill="url(#lamp)"/>`;
    // забор
    let fence = '';
    for (let i = 0; i < 28; i++) fence += `<path d="M${i * 40} 1640 L${i * 40} 1530 L${i * 40 + 14} 1512 L${i * 40 + 28} 1530 L${i * 40 + 28} 1640Z" fill="#0c0f24"/>`;
    s += fence + `<rect y="1560" width="1080" height="14" fill="#0c0f24"/><rect y="1610" width="1080" height="14" fill="#0c0f24"/>`;
    s += `<rect y="1640" width="1080" height="280" fill="${P.road}"/>`;
    s += `<rect x="0" y="1660" width="1080" height="260" fill="${P.win}" opacity="0.04"/>`;
    // отражения в лужах
    s += `<ellipse cx="300" cy="1760" rx="160" ry="16" fill="#3a4690" opacity="0.4"/><ellipse cx="780" cy="1820" rx="220" ry="18" fill="#3a4690" opacity="0.35"/>`;
    if (o.masks) o.masks.forEach((m) => (s += `<g transform="translate(${m.x} ${m.y}) scale(${m.s || 0.45})">${masked({ color: m.c, talk: m.talk })}</g>`));
    if (o.siren) {
      const k = o.siren;
      s += `<rect width="1080" height="1920" fill="${P.red}" opacity="${0.22 * k * (0.5 + 0.5 * Math.sin(ph * 12))}" style="mix-blend-mode:screen"/>`;
      s += `<rect width="1080" height="1920" fill="${P.blue}" opacity="${0.22 * k * (0.5 - 0.5 * Math.sin(ph * 12))}" style="mix-blend-mode:screen"/>`;
    }
    s += rain(3, 150, ph);
    return s;
  }

  // Дверь крупно с меткой краской
  function bgDoor(o = {}) {
    const drip = o.drip ?? 1;
    let s = `<rect width="1080" height="1920" fill="${P.wall}"/>`;
    for (let i = 0; i < 14; i++) s += `<rect x="0" y="${i * 140}" width="1080" height="4" fill="${P.wallDark}"/>`;
    s += `<rect x="190" y="160" width="700" height="1640" fill="#0b0d22"/><rect x="220" y="190" width="640" height="1610" fill="#1a1d3e"/>`;
    s += `<rect x="270" y="260" width="540" height="560" rx="8" fill="none" stroke="#11142e" stroke-width="16"/><rect x="270" y="900" width="540" height="760" rx="8" fill="none" stroke="#11142e" stroke-width="16"/>`;
    s += `<circle cx="540" cy="420" r="14" fill="#2c3054" stroke="#555a80" stroke-width="4"/>`;
    s += `<rect x="740" y="960" width="60" height="140" rx="12" fill="#2a2d4e"/><rect x="700" y="1010" width="110" height="26" rx="12" fill="${P.gold}" opacity="0.8"/>`;
    // метка
    s += `<g filter="url(#glow)"><circle cx="540" cy="640" r="170" fill="none" stroke="${P.neonM}" stroke-width="34"/><line x1="420" y1="520" x2="660" y2="760" stroke="${P.neonM}" stroke-width="34" stroke-linecap="round"/>`;
    [[400, 700], [470, 800], [610, 795], [690, 690], [545, 810]].forEach(([x, y], i) => (s += `<path d="M${x - 9} ${y} L${x - 7} ${y + 120 * drip * (0.6 + (i % 3) * 0.3)} Q${x} ${y + 140 * drip * (0.6 + (i % 3) * 0.3)} ${x + 7} ${y + 120 * drip * (0.6 + (i % 3) * 0.3)} L${x + 9} ${y}Z" fill="${P.neonM}"/>`));
    s += `</g>`;
    s += `<rect width="1080" height="1920" fill="#000" opacity="0.15"/>`;
    return s;
  }

  // Прихожая изнутри: две героини у стены, входная дверь
  function bgHall(o = {}) {
    let s = `<rect width="1080" height="1920" fill="#141a3a"/>`;
    s += `<rect y="1460" width="1080" height="460" fill="url(#boards)"/>`;
    s += `<rect x="620" y="480" width="360" height="990" fill="#0c0f26"/><rect x="640" y="500" width="320" height="970" fill="#1b1f44"/><circle cx="920" cy="1000" r="12" fill="${P.gold}"/>`;
    s += `<rect x="560" y="470" width="20" height="1000" fill="#0f1330"/>`;
    s += `<rect x="80" y="380" width="260" height="190" fill="#0f1330"/><rect x="96" y="396" width="228" height="158" fill="url(#slats)"/>`; // ставня в прихожей (закрыта)
    s += `<rect x="96" y="396" width="228" height="158" fill="${P.blue}" opacity="${o.siren ? 0.2 : 0}"/>`;
    s += `<rect x="40" y="760" width="160" height="12" fill="#0f1330"/><path d="M60 772 v120 M180 772 v120" stroke="#0f1330" stroke-width="10"/>`; // вешалка/полка
    s += `<path d="M380 0 L380 260 L330 300 L430 300 L380 260" stroke="#0f1330" stroke-width="4" fill="#ffcf5a" opacity="${o.lampOn === false ? 0.15 : 0.9}"/>`;
    if (o.lampOn !== false) s += `<path d="M380 290 L80 1460 L700 1460Z" fill="url(#lamp)" opacity="0.6"/>`;
    // полоса света под дверью
    s += `<rect x="650" y="1460" width="300" height="10" fill="${o.underDoor || P.neonC}" opacity="${o.underDoorOp ?? 0}" filter="url(#glow)"/>`;
    return s;
  }

  // Комната наверху: окно с застрявшей ставней
  function bgRoom(o = {}) {
    const day = o.day, stuck = o.stuck ?? 0.42;
    let s = `<rect width="1080" height="1920" fill="${day ? '#c89c76' : '#11163a'}"/>`;
    s += `<rect y="1420" width="1080" height="500" fill="${day ? '#8a5d3c' : 'url(#boards)'}"/>`;
    // окно
    s += `<rect x="200" y="340" width="680" height="820" fill="${day ? '#6e4a33' : '#090b20'}"/>`;
    s += `<rect x="230" y="370" width="620" height="760" fill="${day ? 'url(#skyDay)' : '#050716'}"/>`;
    if (!day) {
      // ночь за окном: огоньки и маски
      for (let i = 0; i < 6; i++) s += `<rect x="${260 + i * 100}" y="${900 + (i % 2) * 30}" width="70" height="${200 - (i % 3) * 40}" fill="#0c1130"/>`;
      if (o.masks) o.masks.forEach((m) => (s += `<g transform="translate(${m.x} ${m.y}) scale(${m.s || 0.3})">${masked({ color: m.c })}</g>`));
      s += rain(7, 40, o.phase || 0, '#8fa6ff', 0.3).replace('<g>', '<g clip-path="url(#winClip)">');
    } else s += `<circle cx="700" cy="520" r="70" fill="#fff3c4"/>`;
    s += `<clipPath id="winClip"><rect x="230" y="370" width="620" height="760"/></clipPath>`;
    s += `<rect x="532" y="370" width="16" height="760" fill="${day ? '#6e4a33' : '#090b20'}"/><rect x="230" y="740" width="620" height="16" fill="${day ? '#6e4a33' : '#090b20'}"/>`;
    // ставня (снаружи) — застряла
    s += `<rect x="230" y="370" width="620" height="${760 * stuck}" fill="url(#${day ? 'slatsDay' : 'slats'})"/>`;
    s += `<path d="M230 ${370 + 760 * stuck} l620 ${o.tilt ?? 22}" stroke="${day ? '#6e5340' : P.shutterLine}" stroke-width="14"/>`;
    // механизм справа
    s += `<rect x="890" y="320" width="90" height="140" rx="10" fill="${day ? '#7a6a5e' : '#1d2246'}"/><circle cx="935" cy="390" r="30" fill="url(#metal)"/>`;
    s += `<rect x="912" y="460" width="46" height="600" fill="${day ? '#7a6a5e' : '#161a3a'}"/>`;
    if (o.fabric) s += `<path d="M955 380 l40 30 l-10 50 l-25 -30Z" fill="${P.hoodie}"/>`;
    // мебель
    s += `<rect x="60" y="1240" width="300" height="200" rx="12" fill="${day ? '#5c3c28' : '#0b0e26'}"/><rect x="80" y="1180" width="140" height="80" rx="20" fill="${day ? '#e5d3b6' : '#1a1f45'}"/>`;
    s += `<rect x="760" y="1260" width="220" height="180" fill="${day ? '#5c3c28' : '#0b0e26'}"/>`;
    // лестница вниз справа
    if (!day) s += `<path d="M1080 1420 L960 1420 L960 1500 L1080 1500" fill="#05060f"/>`;
    if (o.shadow) s += `<path d="M${o.shadow} 0 l160 0 l-40 1420 l-80 0Z" fill="#000" opacity="0.35" filter="url(#soft)"/>`;
    if (!day) s += `<path d="M230 1130 L850 1130 L1000 1700 L120 1700Z" fill="#6f86ff" opacity="0.08"/><rect width="1080" height="1920" fill="#000" opacity="${o.dark ?? 0.1}"/>`;
    else s += `<rect width="1080" height="1920" fill="#ffb060" opacity="0.12"/>`;
    return s;
  }

  // Шестерёнки механизма крупно (под красным светом), клок синей ткани
  function gearPath(cx, cy, r, teeth, rot) {
    let d = '';
    for (let i = 0; i < teeth * 2; i++) {
      const a1 = (i / (teeth * 2)) * Math.PI * 2 + rot, a2 = ((i + 1) / (teeth * 2)) * Math.PI * 2 + rot;
      const rr = i % 2 ? r : r * 1.14;
      d += `${i ? 'L' : 'M'}${f(cx + Math.cos(a1) * rr)} ${f(cy + Math.sin(a1) * rr)} L${f(cx + Math.cos(a2) * rr)} ${f(cy + Math.sin(a2) * rr)} `;
    }
    return d + 'Z';
  }
  function bgGears(o = {}) {
    const rot = o.rot || 0, red = o.red ?? 1;
    let s = `<rect width="1080" height="1920" fill="#07060c"/>`;
    s += `<g opacity="${0.35 + 0.65 * red}">`;
    s += `<path d="${gearPath(420, 860, 300, 14, rot)}" fill="url(#metal)"/><circle cx="420" cy="860" r="120" fill="#2a2c38"/><circle cx="420" cy="860" r="40" fill="#555a6e"/>`;
    s += `<path d="${gearPath(780, 1260, 210, 10, -rot * 1.4 + 0.2)}" fill="url(#metal)"/><circle cx="780" cy="1260" r="80" fill="#2a2c38"/><circle cx="780" cy="1260" r="28" fill="#555a6e"/>`;
    s += `<path d="M300 1500 L1000 1500" stroke="#3d4050" stroke-width="30"/>`;
    // ткань между зубьями
    s += `<path d="M610 1050 Q650 1010 700 1040 L740 1110 Q700 1180 720 1260 L690 1230 Q660 1190 650 1120 Q600 1110 610 1050Z" fill="${P.hoodie}"/>`;
    s += `<path d="M640 1060 l20 50 M670 1050 l10 70 M700 1080 l-10 60" stroke="${P.hoodieDark}" stroke-width="5"/>`;
    s += `<path d="M720 1260 l10 50 M700 1240 l-6 60 M735 1225 l25 40" stroke="${P.hoodie}" stroke-width="5"/>`;
    s += `</g>`;
    s += `<rect width="1080" height="1920" fill="#ff1818" opacity="${0.42 * red}" style="mix-blend-mode:multiply"/>`;
    s += `<circle cx="660" cy="1120" r="${520}" fill="url(#redLight)"/>`;
    s += `<rect width="1080" height="1920" fill="url(#vignette)"/>`;
    return s;
  }

  // Двор с такси
  function bgYard(o = {}) {
    const alarm = o.alarm || 0, ph = o.phase || 0;
    let s = `<rect width="1080" height="1920" fill="url(#sky)"/><rect y="980" width="1080" height="940" fill="${P.ground}"/>`;
    s += `<rect x="0" y="420" width="300" height="760" fill="${P.wall}"/><rect x="60" y="520" width="180" height="200" fill="url(#slats)"/><rect x="60" y="820" width="180" height="200" fill="url(#slats)"/>`;
    let fence = '';
    for (let i = 0; i < 28; i++) fence += `<rect x="${300 + i * 34}" y="${900 + (i % 2) * 8}" width="26" height="280" fill="#0c0f24"/>`;
    s += fence;
    // машина
    const blink = alarm ? (Math.sin(ph * 40) > 0 ? 1 : 0) : 0;
    s += `<g transform="translate(140 1240)">
      <ellipse cx="420" cy="330" rx="460" ry="40" fill="#000" opacity="0.5"/>
      <path d="M20 300 L20 200 Q30 150 120 140 L240 40 Q260 20 300 20 L560 20 Q600 20 630 50 L740 140 Q830 150 840 200 L840 300Z" fill="#c9a522"/>
      <path d="M270 60 L240 140 L420 140 L420 50 L300 50Z M450 50 L450 140 L700 140 L610 60 Q590 50 560 50Z" fill="#0d1330"/>
      <rect x="20" y="200" width="820" height="26" fill="#1a1a1a"/>
      ${Array.from({ length: 10 }, (_, i) => `<rect x="${60 + i * 76}" y="${200 + (i % 2) * 13}" width="38" height="13" fill="#f2f2f2"/>`).join('')}
      <rect x="360" y="-26" width="140" height="46" rx="8" fill="${blink ? P.neonY : '#8a7a2a'}" ${blink ? 'filter="url(#glow)"' : ''}/><text x="430" y="8" font-family="Inter" font-weight="900" font-size="28" text-anchor="middle" fill="#1a1a1a">ТАКСИ</text>
      <circle cx="200" cy="300" r="70" fill="#0b0b10"/><circle cx="200" cy="300" r="30" fill="#4a4d5c"/>
      <circle cx="660" cy="300" r="70" fill="#0b0b10"/><circle cx="660" cy="300" r="30" fill="#4a4d5c"/>
      <rect x="800" y="170" width="44" height="30" rx="8" fill="${blink ? '#fff6c0' : '#77735a'}"/><rect x="16" y="170" width="30" height="30" rx="6" fill="${blink ? P.red : '#5a2020'}"/>
      ${blink ? `<path d="M844 185 L1100 80 L1100 300Z" fill="#fff6c0" opacity="0.25"/>` : ''}
    </g>`;
    if (alarm) for (let i = 1; i <= 3; i++) s += `<path d="M${560 - i * 70} ${1150 - i * 40} q${i * 70} -${i * 40} ${i * 140} 0" stroke="${P.neonY}" stroke-width="8" fill="none" opacity="${0.8 - i * 0.2}" filter="url(#glow)"/>`;
    s += rain(11, 120, ph);
    return s;
  }

  // ---------- Интерфейс Ночи ----------
  function hud(o = {}) {
    const t = o.time || '19:00:00', left = o.left || '12:00:00';
    let s = `<g font-family="JetBrains Mono" font-weight="800">
      <rect x="40" y="70" width="1000" height="150" rx="26" fill="#05060f" opacity="0.72" stroke="${P.red}" stroke-width="3"/>
      <circle cx="96" cy="145" r="16" fill="${P.red}" opacity="${o.rec ?? 1}" filter="url(#glow)"/>
      <text x="130" y="128" font-size="34" fill="#9aa3d4" font-family="Inter" font-weight="800" letter-spacing="4">НОЧЬ БЕЗ ЗАКОНА</text>
      <text x="130" y="192" font-size="56" fill="${P.white}">${t}</text>
      <text x="1010" y="128" font-size="28" fill="#9aa3d4" text-anchor="end" font-family="Inter" font-weight="700">ДО УТРА</text>
      <text x="1010" y="192" font-size="56" fill="${P.red}" text-anchor="end">${left}</text></g>`;
    if (o.services !== false) s += `<g transform="translate(540 270)"><rect x="-300" y="-30" width="600" height="60" rx="30" fill="${P.red}" opacity="${o.servOp ?? 0.92}"/><text y="12" font-family="Inter" font-weight="900" font-size="32" text-anchor="middle" fill="#fff" letter-spacing="3">⚠ СЛУЖБЫ НЕ РАБОТАЮТ</text></g>`;
    if (o.battery != null) {
      const b = o.battery;
      s += `<g transform="translate(880 340)"><rect x="0" y="0" width="140" height="60" rx="10" fill="#05060f" opacity="0.7" stroke="#ff5050" stroke-width="3"/><rect x="140" y="18" width="10" height="24" fill="#ff5050"/><rect x="8" y="8" width="${124 * b}" height="44" rx="6" fill="${b > 0.2 ? '#ff3030' : '#801010'}"/><text x="-14" y="44" font-family="JetBrains Mono" font-weight="800" font-size="30" fill="#ff6060" text-anchor="end">${Math.round(b * 100)}%</text></g>`;
    }
    return s;
  }

  // Субтитры: words = [{text, hl}] (hl — цвет выделения), active — индекс текущего слова
  function subtitle(words, active, o = {}) {
    const y = o.y || 1600, size = o.size || 72;
    // перенос строк по ширине (~900px), примерная ширина символа 0.6*size
    const lines = [[]]; let w = 0;
    words.forEach((wd, i) => { const ww = (wd.text.length + 1) * size * 0.58; if (w + ww > 960 && lines[lines.length - 1].length) { lines.push([]); w = 0; } lines[lines.length - 1].push({ ...wd, i }); w += ww; });
    let s = `<g font-family="Inter" font-weight="900" font-size="${size}" text-anchor="middle" paint-order="stroke" stroke="#000" stroke-width="14" stroke-linejoin="round">`;
    lines.forEach((ln, li) => {
      s += `<text x="540" y="${y + li * size * 1.18}">`;
      ln.forEach((wd) => {
        const col = wd.i === active ? (wd.hl || P.neonY) : wd.hl ? wd.hl : wd.i < active ? '#ffffff' : '#ffffff';
        const op = wd.i <= active ? 1 : 0.45;
        s += `<tspan fill="${col}" fill-opacity="${op}" ${wd.i === active ? `font-size="${size * 1.08}"` : ''}>${wd.text} </tspan>`;
      });
      s += `</text>`;
    });
    return s + '</g>';
  }

  function vignetteDef() { return `<defs><radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.85"/></radialGradient></defs>`; }

  root.ART = { P, ik, defs: () => defs() + vignetteDef(), hero, masha: hero, sister, masked, bgExterior, bgDoor, bgHall, bgRoom, bgGears, bgYard, hud, subtitle, rain };
})(typeof window !== 'undefined' ? window : globalThis);

// ЭПИДЕМИЯ, серия 1 — покадровая анимация. render(t) рисует кадр в момент t (сек).
(function () {
  const A = ART, WORDS = window.WORDS;
  const W = 1080, H = 1920, END = 90.0;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
  const prog = (t, a, b) => ease((t - a) / (b - a));
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const norm = (s) => s.toLowerCase().replace(/[«»"….,:!?—-]/g, '').replace(/ё/g, 'е');
  function T(word, after = 0) {
    const w = norm(word);
    const f = WORDS.find((x) => x.s >= after && norm(x.w) === w);
    if (!f) throw new Error('word not found: ' + word + ' after ' + after);
    return f.s;
  }

  // ---------- эффекты ----------
  function flicker(t, strength = 1) {
    const b = Math.floor(t / 0.07);
    let v = 1;
    if (hash(b) > 0.9) v -= 0.5 * strength * hash(b + 7);
    if (hash(Math.floor(t / 1.9)) > 0.75 && (t % 1.9) < 0.18) v -= 0.35 * strength;
    return clamp(v, 0.25, 1);
  }
  function blinkAt(t, seed = 0) {
    const per = 3.3 + seed * 0.7, ph = (t + seed * 1.3) % per;
    return ph < 0.16 ? Math.sin((ph / 0.16) * Math.PI) : 0;
  }
  function rain(t, n = 140, op = 0.35, len = 70, color = '#a9c0dc') {
    let g = `<g stroke="${color}" stroke-linecap="round" opacity="${op}">`;
    for (let i = 0; i < n; i++) {
      const sp = 1900 + hash(i) * 900, l = len * (0.6 + hash(i + 3));
      const x = hash(i + 11) * 1240 - 80, y = ((hash(i + 5) * 2300 + t * sp) % 2300) - 180;
      g += `<path d="M${x.toFixed(1)},${y.toFixed(1)} l${(-l * 0.12).toFixed(1)},${l.toFixed(1)}" stroke-width="${(1.2 + hash(i + 9) * 1.8).toFixed(1)}"/>`;
    }
    return g + '</g>';
  }
  function dust(t, cx, cy, r, n = 40) {
    let g = '<g fill="#ffe2b8">';
    for (let i = 0; i < n; i++) {
      const a = hash(i) * 6.28 + t * 0.05 * (hash(i + 2) - 0.5), d = Math.sqrt(hash(i + 4)) * r;
      const x = cx + Math.cos(a) * d + Math.sin(t * 0.4 + i) * 12, y = cy + Math.sin(a) * d - ((t * 8 * (0.5 + hash(i + 6))) % 60);
      g += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(1 + hash(i + 8) * 2.2).toFixed(1)}" opacity="${(0.15 + 0.35 * hash(i + 1)).toFixed(2)}"/>`;
    }
    return g + '</g>';
  }
  function darken(a, color = '#05070c') { return `<rect width="${W}" height="${H}" fill="${color}" opacity="${a.toFixed(3)}"/>`; }
  function cam(z, dx, dy, inner, rot = 0) {
    return `<g transform="translate(540 960) rotate(${rot}) scale(${z.toFixed(4)}) translate(${(-540 + dx).toFixed(1)} ${(-960 + dy).toFixed(1)})">${inner}</g>`;
  }
  function place(o, x, y, s, rot = 0) {
    return `<g transform="translate(${x},${y}) scale(${s}) rotate(${rot} 300 450)">${A.character(o)}</g>`;
  }
  function breath(t, seed = 0) { return Math.sin(t * 1.6 + seed) * 4; }
  function beam(x, y, ang, len, w, op) {
    const r = (ang * Math.PI) / 180, ex = x + Math.cos(r) * len, ey = y + Math.sin(r) * len;
    const nx = -Math.sin(r) * w, ny = Math.cos(r) * w;
    return `<path d="M${x},${y} L${ex + nx},${ey + ny} L${ex - nx},${ey - ny} Z" fill="#dfe9ff" opacity="${op}" filter="url(#blur24)" style="mix-blend-mode:screen"/>`;
  }
  function vignetteBlack(a) { return `<rect width="${W}" height="${H}" fill="url(#vign)" opacity="${a}"/>`; }

  // ---------- кадры (шоты) ----------
  const S = {};
  S.sneeze = T('Сначала'); S.spots1 = T('пятна') - 0.15; S.cordon = T('кордон') - 0.1; S.fedya = T('Сороковой') - 0.2;
  S.phone = T('Отец') - 0.1; S.doctor = T('Врач') - 0.1; S.suitcase = T('Выведете'); S.squint = T('Отчества') - 0.05;
  S.timur = T('Дозу') - 0.05; S.wrist = T('рукав') - 0.1; S.obhod = T('полночь') - 0.25; S.key = T('ключ') - 0.6;
  S.apt = T('Пустая') - 0.1; S.call = T('половине') - 0.2; S.amp1 = T('Одна', 59) - 0.1; S.father = T('Отец', 61) - 0.05;
  S.boy = T('или', 62) - 0.05; S.label = T('поднёс') - 0.15; S.close = T('Отец', 72) - 0.1; S.knock = T('В', 78) - 0.1;
  S.case = T('Незнакомец') - 0.1; S.stranger = T('Мне', 83) - 0.1; S.final = T('Чемодан') - 0.1; S.title = 88.75;

  const fedya = A.CAST.fedya, timur = A.CAST.timur, doctor = A.CAST.doctor, stranger = A.CAST.stranger;

  const shots = [
    { a: 0, b: S.spots1, draw(t, lt) {
      const f = flicker(t, 1.4);
      let g = A.bgStairwell() + dust(t, 540, 300, 380) + darken(0.62 - 0.25 * (f - 0.25));
      const jolt = t > T('чихали') && t < T('чихали') + 0.25 ? Math.sin((t - T('чихали')) * 60) * 10 : 0;
      return cam(1.15 + lt * 0.03, 0, -80 + jolt, g);
    } },
    { a: S.spots1, b: S.cordon, draw(t, lt) {
      const sp = lerp(0.25, 0.75, prog(t, S.spots1, S.cordon));
      const g = `<rect width="${W}" height="${H}" fill="#151a24"/>${A.lampGlow(300, 600, 400, 0.3)}<g transform="translate(540 1000) scale(3.4) rotate(-12)">${A.propWrist(sp)}</g>`;
      return cam(1 + lt * 0.05, 0, 0, g);
    } },
    { a: S.cordon, b: S.fedya, draw(t, lt) {
      const g = A.bgFence() + rain(t, 120, 0.4);
      return cam(2.3 + lt * 0.06, -40 * lt, 330, g);
    } },
    { a: S.fedya, b: S.phone, place: ['ЗАДНИЙ ДВОР БОЛЬНИЦЫ №3', 'ДЕНЬ 40 · ВЕЧЕР'], draw(t, lt) {
      const o = { ...fedya, blink: blinkAt(t), look: [lt > 6 ? 4 : -1, 0] };
      let g = A.bgFence() + darken(0.25) + rain(t, 90, 0.25, 60);
      g += place(o, 0, 330 + breath(t), 1.8);
      g += rain(t + 3, 70, 0.35, 90);
      return cam(1 + lt * 0.012, lt * 4, 0, g);
    } },
    { a: S.phone, b: S.doctor, draw(t, lt) {
      const late = t > T('Десятый') - 0.1;
      let g = `<rect width="${W}" height="${H}" fill="#0c1018"/>`;
      for (let i = 0; i < 9; i++) g += `<circle cx="${hash(i) * 1080}" cy="${hash(i + 3) * 1920}" r="${60 + hash(i + 5) * 90}" fill="${i % 3 ? '#e0a050' : '#6f8fc0'}" opacity=".12" filter="url(#blur24)"/>`;
      const dots = '.'.repeat(1 + (Math.floor(lt * 3) % 3));
      g += `<g transform="translate(${540 + Math.sin(t * 2) * 6} ${900 + Math.sin(t * 1.3) * 5}) scale(3.1) rotate(-4)">${A.propPhone(['ПАПА', late ? 'не в сети 10 дн.' : 'вызов' + dots, late ? 'нет ответа' : ''])}</g>`;
      return cam(1 + lt * 0.02, 0, 0, g);
    } },
    { a: S.doctor, b: S.suitcase, draw(t, lt) {
      const ws = T('Вакцина');
      const o = { ...doctor, blink: blinkAt(t, 1), look: [t < ws ? 6 * Math.sin(t * 3) : -3, 0], frown: 0.6, browRaise: t > T('Одна') ? 0.4 : 0 };
      let g = A.bgFence() + darken(0.35) + rain(t, 80, 0.2, 60);
      g += place(o, 60, 360 + breath(t, 1), 1.6);
      // передние прутья решётки
      for (let x = -40; x < 1200; x += 250) g += `<rect x="${x}" y="0" width="54" height="1920" fill="#101318"/><rect x="${x + 8}" y="0" width="6" height="1920" fill="#4a5466" opacity=".5"/>`;
      g += `<rect x="0" y="1180" width="1080" height="40" fill="#101318"/>`;
      g += rain(t + 7, 60, 0.3, 90);
      return cam(1.04 + lt * 0.012, -20 + lt * 3, 0, g);
    } },
    { a: S.suitcase, b: S.squint, draw(t, lt) {
      let g = `<rect width="${W}" height="${H}" fill="#121822"/>${A.lampGlow(300, 400, 300, 0.25)}`;
      g += `<ellipse cx="540" cy="1420" rx="460" ry="60" fill="#e0a050" opacity=".08" filter="url(#blur10)"/>`;
      g += `<path d="M300,0 L340,1400 L260,1400 Z M760,0 L800,1400 L720,1400 Z" fill="#1d2530" opacity=".9"/>`; // ноги в халате (силуэт)
      g += `<g transform="translate(560 1250) scale(1.5)">${A.propSuitcase(false)}</g>`;
      for (let x = 40; x < 1080; x += 230) g += `<rect x="${x}" y="0" width="40" height="1920" fill="#0d1015"/>`;
      g += rain(t, 80, 0.3, 80);
      return cam(1 + lt * 0.08, 0, -260 + lt * 120, g);
    } },
    { a: S.squint, b: S.timur, draw(t, lt) {
      const o = { ...fedya, blink: blinkAt(t, 2) * 0.5, look: [5, 0], squint: lerp(0.15, 0.7, prog(t, S.squint, S.squint + 0.6)), frown: 0.8 };
      let g = A.bgFence() + darken(0.45) + rain(t, 60, 0.2);
      g += place(o, -480, -420, 3.4);
      g += rain(t + 2, 50, 0.3, 90);
      return cam(1 + lt * 0.03, 0, 0, g);
    } },
    { a: S.timur, b: S.wrist, place: ['ПРИХОЖАЯ, КВ. 12', 'ДЕНЬ 40 · 21:15'], draw(t, lt) {
      const f = flicker(t, 0.6);
      const o = { ...timur, blink: blinkAt(t, 3), look: [-5, 1], browRaise: 0.3 };
      let g = A.bgHallway() + darken(0.35 - 0.2 * (f - 0.25)) + dust(t, 560, 200, 300, 25);
      g += place(o, 80, 380 + breath(t, 2), 1.7);
      const bagUp = t > T('хлебом') ? 1 : 0;
      g += `<g transform="translate(820 ${1460 - bagUp * 20}) scale(1.25) rotate(-6)">${A.propBag()}</g>`;
      return cam(1 + lt * 0.015, -lt * 6, 0, g);
    } },
    { a: S.wrist, b: S.obhod, draw(t, lt) {
      const sp = lerp(0.45, 1, prog(t, T('Пятна', 37), T('запястья') + 0.4));
      const g = `<rect width="${W}" height="${H}" fill="#141a24"/>${A.lampGlow(260, 500, 420, 0.35)}<g transform="translate(560 ${1080 - lt * 40}) scale(3.6) rotate(-8)">${A.propWrist(sp)}</g>`;
      return cam(1.02 + lt * 0.04, 0, 0, g);
    } },
    { a: S.obhod, b: S.key, place: ['ПОДЪЕЗД 2', 'ДЕНЬ 40 · ПОЛНОЧЬ'], draw(t, lt) {
      const f = flicker(t, 1.6);
      let g = A.bgStairwell() + darken(0.6 - 0.25 * (f - 0.25));
      g += beam(1180, 200 + Math.sin(t * 1.3) * 120, 150 + Math.sin(t * 0.9) * 25, 1500, 180, 0.35);
      g += beam(1180, 900, 190 + Math.sin(t * 1.7 + 1) * 20, 1400, 140, 0.25);
      const slam = T('Увозят');
      if (t > slam && t < slam + 0.12) g += darken(0.5, '#dfe9ff');
      return cam(1.05 + lt * 0.02, Math.sin(t * 0.7) * 10, 0, g);
    } },
    { a: S.key, b: S.apt, place: ['ПОДЪЕЗД 2, КВ. 57', 'ДЕНЬ 40 · 00:02'], draw(t, lt) {
      const tk = T('ключ'), turn = prog(t, tk + 0.3, tk + 0.8), into = prog(t, S.key, tk + 0.2);
      let g = A.bgHallway() + darken(0.35);
      const open = prog(t, T('Она', 46), T('рейсом') + 0.4);
      g += `<rect x="378" y="436" width="${14 + open * 70}" height="1330" fill="#e9c58a" opacity="${0.5 * open}" filter="url(#blur6)"/>`;
      g += `<g transform="translate(${lerp(980, 700, into)} 1120) rotate(${-turn * 90}) scale(1.4)"><g transform="translate(-162 0)">${A.propKey()}</g></g>`;
      return cam(lerp(2.2, 1.7, open), lerp(-220, -120, open), -200, g);
    } },
    { a: S.apt, b: S.call, place: ['КВ. 57 · БАБА ШУРА', 'ДЕНЬ 40 · 00:07'], draw(t, lt) {
      const tb = T('Сапоги');
      const o = { ...fedya, blink: blinkAt(t, 4), look: [t > tb ? 7 : -2, 0], frown: 0.5, lightFrom: 'left' };
      let g = A.bgApartment() + darken(0.3) + dust(t, 175, 930, 300, 30);
      g += beam(-200, 300, 20 + 15 * Math.sin(t * 0.8), 1300, 120, 0.18);
      // полоса света под дверью и тени сапог
      const steps = (t - tb) / 1.6;
      g += `<rect x="560" y="1890" width="520" height="16" fill="#f0d8a0" opacity=".7" filter="url(#blur3)"/>`;
      if (steps > 0 && steps < 1) for (let k = 0; k < 2; k++) g += `<rect x="${560 + steps * 600 - k * 140}" y="1884" width="70" height="28" fill="#05070c"/>`;
      g += place(o, -60, 360 + breath(t, 3), 1.75);
      return cam(1.02 + lt * 0.015, 0, 0, g);
    } },
    { a: S.call, b: S.amp1, place: [null, 'ДЕНЬ 41 · 00:30'], draw(t, lt) {
      const fail = t > T('Абонент') - 0.1;
      let g = `<rect width="${W}" height="${H}" fill="#0b0f16"/>${A.lampGlow(200, 1500, 400, 0.2)}`;
      g += `<g transform="translate(${540 + Math.sin(t * 2.2) * 5} 900) scale(3.1) rotate(3)">${A.propPhone(['НИНА С.', fail ? '00:30 · сброс' : 'вызов' + '.'.repeat(1 + (Math.floor(lt * 3) % 3)), fail ? 'абонент недоступен' : ''])}</g>`;
      return cam(1 + lt * 0.02, 0, 0, g);
    } },
    { a: S.amp1, b: S.father, draw(t, lt) {
      let g = `<rect width="${W}" height="${H}" fill="#0d1017"/>${A.lampGlow(540, 900, 500, 0.4 * flicker(t, 0.3))}`;
      g += `<g transform="translate(540 980) scale(4.2) rotate(${-70 + lt * 4})">${A.propAmpoule(false)}</g>`;
      return cam(1 + lt * 0.05, 0, 0, g);
    } },
    { a: S.father, b: S.boy, draw(t, lt) {
      const o = { ...fedya, blink: blinkAt(t, 5), look: [-4, 3], sad: 0.6 };
      let g = A.bgApartment() + darken(0.4);
      g += place(o, -420, -330, 3.2);
      return cam(1 + lt * 0.03, 0, 0, g);
    } },
    { a: S.boy, b: S.label, draw(t, lt) {
      const o = { ...timur, blink: 1, look: [0, 2] };
      let g = A.bgApartment() + darken(0.3) + dust(t, 175, 930, 300, 30);
      g += place(o, 300, 620 + breath(t * 0.6, 1) * 1.5, 1.25, 14);
      return cam(1.12 - lt * 0.02, 80, 40, g);
    } },
    { a: S.label, b: S.close, draw(t, lt) {
      const t0 = T('Ковалёв'), lines = ['КОВАЛЁВ', 'СЕМЁН', '82 · ПАЛАТА 6'];
      const times = [t0, T('Семён'), T('восемьдесят')];
      let g = `<rect width="${W}" height="${H}" fill="#0b0d12"/>${A.lampGlow(300, 400, 520, 0.55 * flicker(t, 0.4))}`;
      g += `<g transform="translate(540 960) rotate(-8)">
        <rect x="-230" y="-760" width="460" height="1500" rx="200" fill="#cfe3ea" opacity=".35"/>
        <rect x="-230" y="200" width="460" height="540" rx="200" fill="#8fb6c4" opacity=".45"/>
        <rect x="-170" y="-700" width="30" height="1300" fill="#fff" opacity=".35"/>
        <rect x="-210" y="-380" width="420" height="520" fill="#e8e2d0"/>
        <rect x="-210" y="-380" width="420" height="520" fill="#ffb46b" opacity=".12"/>`;
      lines.forEach((ln, i) => {
        const tl = times[i], n = Math.floor(clamp((t - tl) / 0.6) * ln.length);
        g += `<text x="-180" y="${-270 + i * 120}" font-family="JetBrains Mono" font-weight="800" font-size="${i === 2 ? 50 : 70}" fill="#24221f">${ln.slice(0, n)}</text>`;
      });
      g += `<rect x="-180" y="40" width="360" height="60" fill="#24221f" opacity=".8"/></g>`;
      return cam(0.9 + prog(t, S.label, t0) * 0.25 + lt * 0.01, 0, 100, g);
    } },
    { a: S.close, b: S.knock, draw(t, lt) {
      const tz = T('забрал');
      const o = { ...fedya, blink: t > tz ? clamp((t - tz) / 0.5) : blinkAt(t, 6), look: [0, 1], sad: 0.8, frown: 0.3, browRaise: 0.5 };
      let g = A.bgApartment() + darken(0.5);
      g += place(o, -720, -720, 4.2);
      return cam(1 + lt * 0.02, 0, 0, g);
    } },
    { a: S.knock, b: S.case, place: [null, 'ДЕНЬ 41 · 01:12'], draw(t, lt) {
      const tk = T('постучали');
      let shake = 0;
      [0, 0.33, 0.66].forEach((d) => { const x = t - (tk + d); if (x > 0 && x < 0.15) shake = Math.sin(x * 120) * 8 * (1 - x / 0.15); });
      let g = A.bgHallway() + darken(0.55 - 0.3 * (flicker(t, 1.8) - 0.25));
      return cam(1.35 + lt * 0.05, shake, -60, g);
    } },
    { a: S.case, b: S.stranger, draw(t, lt) {
      const op = prog(t, T('замками') + 0.2, T('замками') + 0.6);
      let g = `<rect width="${W}" height="${H}" fill="#0b0d12"/>`;
      g += `<g transform="translate(540 1100) scale(1.9)" opacity="${1 - op}">${A.propSuitcase(false)}</g>`;
      g += `<g transform="translate(540 1150) scale(2)" opacity="${op}">${A.propSuitcase(true)}</g>`;
      g += `<circle cx="540" cy="1000" r="300" fill="#9fd0e8" opacity="${0.25 * op}" filter="url(#glow)"/>`;
      return cam(1 + lt * 0.04, 0, 0, g);
    } },
    { a: S.stranger, b: S.final, draw(t, lt) {
      const talk = WORDS.some((w) => t >= w.s && t <= w.e && w.s >= S.stranger);
      const o = { ...stranger, lightFrom: 'right', blink: blinkAt(t, 7), mouth: talk ? 0.25 + 0.25 * Math.abs(Math.sin(t * 18)) : 0, look: [-3, 0] };
      let g = A.bgHallway() + darken(0.6);
      g += `<circle cx="540" cy="1500" r="400" fill="#9fd0e8" opacity=".12" filter="url(#glow)"/>`;
      g += place(o, -300, -60, 2.4);
      return cam(1 + lt * 0.03, 0, 0, g);
    } },
    { a: S.final, b: END, draw(t, lt) {
      const tr = T('красный');
      const o = { ...stranger, lightFrom: 'right', blink: blinkAt(t, 8), look: [-2, 0] };
      let g = A.bgHallway() + darken(0.55);
      g += place(o, 60, 360, 1.6);
      const red = prog(t, tr - 0.1, tr + 0.4);
      g += `<g transform="translate(760 1560) scale(1.3)">${A.propSuitcase(false)}</g>`;
      g += `<circle cx="760" cy="1560" r="280" fill="#e0302a" opacity="${0.35 * red}" filter="url(#glow)"/>`;
      g += darken(0.4 * red);
      g += `<g transform="translate(760 1560) scale(1.3)" opacity="${red}">${A.propSuitcase(false)}</g>`;
      return cam(lerp(1.25, 1.0, prog(t, S.final, S.final + 1.5)), lerp(-80, 0, prog(t, S.final, S.final + 1.5)), 0, g);
    } },
  ];

  // ---------- плашки ----------
  const CLOCK = [[0, 19 * 3600 + 38 * 60], [S.fedya, 19 * 3600 + 40 * 60], [S.timur, 21 * 3600 + 15 * 60], [S.obhod, 23 * 3600 + 58 * 60],
    [S.apt, 24 * 3600 + 7 * 60], [S.call, 24 * 3600 + 30 * 60], [S.knock, 25 * 3600 + 12 * 60], [END, 25 * 3600 + 14 * 60]];
  function clock(t) {
    let i = 0; while (i < CLOCK.length - 2 && t > CLOCK[i + 1][0]) i++;
    const [t0, c0] = CLOCK[i], [t1, c1] = CLOCK[i + 1];
    let c = Math.floor(lerp(c0, c1, clamp((t - t0) / (t1 - t0)))) % 86400;
    const p = (n) => String(n).padStart(2, '0');
    return `${p(Math.floor(c / 3600))}:${p(Math.floor(c / 60) % 60)}:${p(c % 60)}`;
  }
  let lastWhere = '', lastWhen = '';
  function plaques(t, shot) {
    // актуальные «где/когда» = последние заданные к этому моменту
    let where = '', when = '', whereT = 0, whenT = 0;
    for (const s of shots) { if (s.a > t) break; if (s.place) { if (s.place[0]) { where = s.place[0]; whereT = s.a; } if (s.place[1]) { when = s.place[1]; whenT = s.a; } } }
    if (t < S.fedya) return '';
    const type = (str, t0) => str.slice(0, Math.floor(clamp((t - t0) / 0.7) * str.length));
    let g = '';
    if (where) g += A.plaqueWhere(48, 96, type(where, whereT), 32);
    if (when) g += A.plaqueWhen(48, 176, type(when, whenT), 32);
    g += A.timer(48, 256, clock(t), 34, Math.floor(t * 2) % 2 === 0);
    return g;
  }

  // ---------- субтитры ----------
  const RED = ['пятна', 'пятнами', 'кордон', 'обход', 'увозят', 'ампула', 'ампул', 'доза', 'дозу', 'вакцина', 'сотня', 'красный', 'хлоркой'];
  const YEL = ['федя', 'отец', 'отчества', 'семенович', 'тимур', 'ключ', 'ковалев', 'семен', 'водитель', 'недоступен', 'забрал', 'постучали', 'мимо', 'мальчишка'];
  const chunks = [];
  (function build() {
    let cur = [];
    WORDS.forEach((w, i) => {
      const prev = WORDS[i - 1];
      const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
      if (cur.length && (w.s - prev.e > 0.3 || cur.length >= 3 || len > 19 || /[.,:!?»…]$/.test(prev.w))) { chunks.push(cur); cur = []; }
      cur.push(w);
    });
    if (cur.length) chunks.push(cur);
  })();
  function subtitles(t) {
    const ci = chunks.findIndex((c, i) => t >= c[0].s - 0.05 && t < (chunks[i + 1] ? chunks[i + 1][0].s - 0.05 : c[c.length - 1].e + 0.7));
    if (ci < 0) return '';
    const c = chunks[ci], last = c[c.length - 1];
    if (t > last.e + 0.9) return '';
    const size = 82, y = 1600;
    const ctx = (window._mctx ||= document.createElement('canvas').getContext('2d')); ctx.font = `800 ${size}px Inter`;
    const widths = c.map((w) => ctx.measureText(w.w).width);
    const total = widths.reduce((a, b) => a + b, 0) + (c.length - 1) * size * 0.3;
    const sc = Math.min(1, 980 / total);
    let x = 540 - (total * sc) / 2, g = `<g font-family="Inter" font-weight="800" font-size="${size * sc}" paint-order="stroke" stroke="#05070c" stroke-width="${14 * sc}" stroke-linejoin="round">`;
    c.forEach((w, i) => {
      const n = norm(w.w), on = t >= w.s;
      const col = RED.includes(n) ? '#ff5a4e' : YEL.includes(n) ? A.YELLOW : '#f4f1ea';
      const pop = on ? 1 + 0.18 * (1 - clamp((t - w.s) / 0.14)) : 1;
      const cx = x + (widths[i] * sc) / 2;
      g += `<text x="${cx.toFixed(1)}" y="${y}" text-anchor="middle" fill="${col}" opacity="${on ? 1 : 0.38}" transform="translate(${cx.toFixed(1)} ${y}) scale(${pop.toFixed(3)}) translate(${-cx.toFixed(1)} ${-y})">${w.w}</text>`;
      x += widths[i] * sc + size * 0.3 * sc;
    });
    return g + '</g>';
  }

  // ---------- финальная карточка ----------
  function titleCard(t) {
    const k = prog(t, S.title, S.title + 0.5);
    if (k <= 0) return '';
    const glitch = hash(Math.floor(t * 20)) > 0.8 ? 6 : 0;
    return `<rect width="${W}" height="${H}" fill="#05070c" opacity="${k}"/>
      <g opacity="${prog(t, S.title + 0.3, S.title + 0.8)}"><text x="${540 + glitch}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="130" letter-spacing="14" fill="#e8e6df">ЭПИДЕМИЯ</text>
      <text x="${540 - glitch}" y="900" text-anchor="middle" font-family="Inter" font-weight="900" font-size="130" letter-spacing="14" fill="#ff5a4e" opacity=".35">ЭПИДЕМИЯ</text>
      <text x="540" y="1000" text-anchor="middle" font-family="JetBrains Mono" font-weight="700" font-size="40" fill="${A.YELLOW}">СЕРИЯ 2 — СКОРО</text></g>`;
  }

  window.DURATION = END;
  window.render = function (t) {
    const i = shots.findIndex((s) => t >= s.a && t < s.b);
    const shot = shots[i < 0 ? shots.length - 1 : i];
    const lt = t - shot.a;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${A.DEFS}
      <filter id="grainT"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="${Math.floor(t * 30) % 17}"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .1 0"/></filter>
      <rect width="${W}" height="${H}" fill="#05070c"/>`;
    s += shot.draw(t, lt);
    s += darken(0.85 * (1 - clamp(lt / 0.12)));                       // мягкий вход шота
    s += `<rect width="${W}" height="${H}" fill="url(#vign)"/><rect width="${W}" height="${H}" fill="url(#scan)"/>`;
    s += `<rect width="${W}" height="${H}" filter="url(#grainT)"/>`;
    s += darken(0.05 * hash(Math.floor(t * 12)));                    // дрожание экрана
    s += plaques(t, shot) + subtitles(t) + titleCard(t);
    s += '</svg>';
    document.getElementById('stage').innerHTML = s;
  };
  window.SHOTS = S;
})();

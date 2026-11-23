// СТРАННЫЙ СИГНАЛ · серия 3 «Конечная». render(t) из common/lib.js
T_END = le(12) + 4.4;
KEY = [
  [/^(окне|отражени|телефон|глаза|фар|свет|голоса)/i, P.cyan],
  [/^(тём|соседи|автобус|седьм|маршрут|кругу|рейс|автопарк|рулём)/i, P.amber],
  [/^(я|нет|мой|меня|он)$/i, P.red],
  [/^(посмотрел|улыб|конечная|завтра|опаздывай|забрали|моргнуло|спасибо|привёл|возил)/i, P.red]
];
const NB = [[270, 0], [410, 1], [545, 2], [690, 3], [820, 4]];
const neighborsBack = (t, op = 1) => `<g opacity="${op}">` + NB.map(([x, v], i) => at(x, 1560, 1.35, neighborBack(v, { glow: 0.85 + 0.15 * noise(t + i * 3, 4) }))).join('') + '</g>';
const neighborsRefl = t => NB.map(([x, v], i) => at(x, 1500, 1.2, neighbor(v, { glow: 0.9 + 0.1 * noise(t + i, 5) }))).join('');
const roomRefl = (t, me = '') => reflection(neighborsRefl(t) + at(475, 1530, 1.1, tema({ phone: true, glow: 1, torch: false, armR: [-8, 160] })) +
  (me || at(617, 1440, 1.18, mark2({ phone: true, glow: 1, armR: [-12, 158], double: true }))), 0.55);
const DRIVER = (p = {}) => at(84, -86, 0.55, mark2(Object.assign({ double: true, armL: [-30, -60], armR: [30, 60] }, p)));
const WS = { x: 70 + 0.85 * 80, y: 1440 - 0.85 * 268 };   // лобовое стекло в координатах кадра (при busX = 0)
const DOOR = { x: 70 + 0.85 * 540, y: 1440 };

// путь от крыльца к калитке и в двери автобуса: p ∈ [0,1]
function walkPos(p, xo) {
  if (p < 0.6) { const k = p / 0.6; return [lerp(540 + xo, 540, k), lerp(1990, 1665, k), lerp(1.35, 0.78, k)]; }
  const k = (p - 0.6) / 0.4; return [lerp(540, DOOR.x, k), lerp(1665, 1450, k), lerp(0.78, 0.6, k)];
}
const WALK = [[0, -180], [2, 160], [1, -60], [4, 220], [3, 40]];   // вариант соседа, смещение
function walkers(t, P0) {   // P0(i) → прогресс каждого
  const list = WALK.map(([v, xo], i) => ({ v, xo, p: P0(i), i })).concat([{ tema: true, xo: -20, p: P0(5), i: 5 }]);
  list.sort((a, b) => b.p - a.p);
  return list.map(w => {
    if (w.p <= 0 || w.p >= 1) return '';
    const [x, y, s] = walkPos(w.p, w.xo), sw = Math.sin(t * 6 + w.i) * 10;
    const fade = 1 - ramp(w.p, 0.93, 0.07);
    return `<g opacity="${fade}">` + at(x, y, s, w.tema ? tema({ back: true, torch: true, legL: sw, legR: -sw }) : neighborBack(w.v, { glow: 0.7, walk: sw * 0.6 })) + '</g>';
  }).join('');
}

SCENES = [];
// 0 · лицо в стекле
SCENES.push([0, (t, u) => {
  const tLook = wt(0, 'посмотрел');
  const refl = reflection(at(540, 2134, 3, mark2({ eyes: 'open' })), 0.6);
  const s = bgRoom({ reflect: refl });
  const z = 1.05 + 0.1 * u + 0.55 * ramp(t, tLook - 0.1, 0.5);
  return cam(540, lerp(950, 890, ramp(t, tLook - 0.1, 0.5)), z, s, t, 0.4) + rain(t, 0.3);
}]);
// 1 · отражение моргнуло — а я нет
SCENES.push([ls(1) - 0.3, (t, u) => {
  const tBlink = wt(1, 'моргнуло') + 0.35, tMe = wt(1, 'а', 1) - 0.12;
  if (t < tMe) {
    const blink = t > tBlink && t < tBlink + 0.22;
    const refl = reflection(at(540, 2134, 3, mark2({ eyes: blink ? 'closed' : 'open' })), 0.6);
    return cam(540, 890, 1.6, bgRoom({ reflect: refl }), t, 0.3) + rain(t, 0.3);
  }
  const s = `<g opacity=".35">${bgRoom({})}</g>` + full('#05070d', 0.5) + at(540, 2300, 3.2, mark2({ eyes: 'wide', brow: -4, look: 0 }));
  return cam(540, 960, 1.0 + 0.1 * ramp(t, tMe, 1.5), s, t, 0.8) + redVig(0.5 * pulse(t, wt(1, 'нет') - 0.1, 0.9));
}]);
// 2 · отражение поднимает телефон; мой вибрирует: «Спасибо, что привёл их»
SCENES.push([ls(2) - 0.3, (t, u) => {
  const tUp = wt(2, 'подняло'), tVib = wt(2, 'мой'), tMsg = wt(2, 'спасибо') - 0.3;
  if (t < tMsg) {
    const k = ramp(t, tUp, 0.6);
    const refl = reflection(at(540, 1900, 2.0, mark2({ phone: k > 0.5, glow: k, armR: [lerp(-10, -12, k), lerp(6, 158, k)], double: true })), 0.6);
    const vib = t > tVib ? Math.sin(t * 90) * 7 : 0;
    return cam(540 + vib, 1000, 1.2, bgRoom({ reflect: refl }), t, 0.4) + rain(t, 0.3);
  }
  const ph = PHONE(t, { msgs: ['Спасибо, что привёл их.'], battery: 0, title: 'МАРК', avatar: 'М', clock: '02:59' }, 1.6);
  return cam(540, 960, 1.02 + 0.05 * u, full('#05070d') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity=".12"/>` + ph, t, 0.6) + redVig(pulse(t, wt(2, 'привёл'), 1.0));
}]);
// 3 · хотел крикнуть — нет голоса
SCENES.push([ls(3) - 0.3, (t, u) => {
  const tShout = wt(3, 'крикнуть');
  let s = bgRoom({ reflect: roomRefl(t), door: true }) + neighborsBack(t, 0.85) + at(475, 1640, 1.3, tema({ back: true, torch: false }));
  s += at(250, 2120, 1.65, mark2({ back: true, armR: [-20, -10] }));
  const fade = 1 - 0.85 * ramp(t, wt(3, 'голоса'), 0.6);
  s += bubble(420, 1300, 'Тёма!', tShout, t, false, fade);
  return cam(470, 1380, 1.05 + 0.08 * u, s, t);
}]);
// 4 · фары, ровно в три; автобус подъезжает к дому
SCENES.push([ls(4) - 0.3, (t, u) => {
  const tLight = wt(4, 'свет') - 0.1, tThree = wt(4, 'ровно'), tBus = wt(4, 'подъехал') - 0.25, tEnd = wt(4, 'конечная');
  if (t < tBus) {
    const fl = ramp(t, tLight, 0.25) * (0.35 + 0.1 * noise(t, 6));
    const sweep = lerp(-400, 1200, clamp((t - tLight) / 2.2));
    let s = bgRoom({ reflect: roomRefl(t), flash: fl, door: true }) + neighborsBack(t, 0.85) + at(475, 1640, 1.3, tema({ back: true, torch: false }));
    s += `<polygon points="${sweep},0 ${sweep + 300},0 ${sweep + 100},1920 ${sweep - 200},1920" fill="#fff4d8" opacity="${0.16 * fl * 2}"/>`;
    const ck = ramp(t, tThree - 0.1, 0.2);
    s += `<g opacity="${ck}"><rect x="340" y="240" width="400" height="140" rx="24" fill="#0a0d15" stroke="${P.red}" stroke-width="4"/><text x="540" y="340" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="96" fill="${P.red}">03:00</text></g>`;
    return cam(540, 1150, 1.0, s, t, 0.6);
  }
  const k = ease((t - tBus) / (tEnd - tBus + 0.2));
  const bx = lerp(1350, 0, k);
  const s = bgStreet({ bus: bus({ door: 0, sign: t > tEnd ? '7 · КОНЕЧНАЯ' : '7 · САДОВАЯ, 7', driver: DRIVER() }), busX: bx, lamp: noise(t, 9) > 0.88 ? 0.35 : 1 });
  return cam(540, 1300, 1.12 - 0.08 * k, s, t, 0.8) + rain(t, 0.7) + full('#fff4d8', 0.25 * pulse(t, tEnd, 0.4));
}]);
// 5 · соседи разом разворачиваются и идут к автобусу; Тёма с ними
SCENES.push([ls(5) - 0.3, (t, u) => {
  const t0 = ls(5) + 0.2;
  const s = bgStreet({ bus: bus({ door: 0, sign: '7 · КОНЕЧНАЯ', driver: DRIVER() }), busX: 0 }) + walkers(t, i => 0.55 * ease((t - t0 - i * 0.45) / 3.2));
  return cam(540, 1450, 1.15 + 0.08 * u, s, t, 0.9) + rain(t, 0.7);
}]);
// 6 · за рулём — я
SCENES.push([ls(6) - 0.3, (t, u) => {
  const s = bgStreet({ bus: bus({ door: 0, sign: '7 · КОНЕЧНАЯ', driver: DRIVER({ look: 2 }) }), busX: 0 }) + walkers(t, i => 0.55);
  return cam(WS.x + 14, WS.y + 20, lerp(3.2, 4.6, ease(u)), s, t, 0.5) + rain(t, 0.5);
}]);
// 7 · открыл двери и улыбнулся
SCENES.push([ls(7) - 0.3, (t, u) => {
  const tOpen = wt(7, 'открыл'), tGrin = wt(7, 'улыбнулся') - 0.1;
  const d = ramp(t, tOpen, 0.6);
  if (t < tGrin) {
    const s = bgStreet({ bus: bus({ door: d, sign: '7 · КОНЕЧНАЯ', driver: DRIVER() }), busX: 0 }) + walkers(t, i => i < 5 ? lerp(0.55, 1, ease((t - tOpen - 0.3 - i * 0.35) / 1.8)) : lerp(0.55, 0.9, ease((t - tOpen - 2.0) / 1.5)));
    return cam(540, 1400, 1.15, s, t, 0.7) + rain(t, 0.6);
  }
  const s = bgStreet({ bus: bus({ door: 1, sign: '7 · КОНЕЧНАЯ', driver: DRIVER({ grin: true, look: -2 }) }), busX: 0 });
  return cam(WS.x + 14, WS.y + 12, 5.2 + 0.3 * u, s, t, 0.4) + redVig(0.6 * ramp(t, wt(7, 'никогда'), 0.6));
}]);
// 8 · Тёма поднялся последним, обернулся и помахал
SCENES.push([ls(8) - 0.3, (t, u) => {
  const tTurn = wt(8, 'обернулся'), tWave = wt(8, 'помахал');
  const up = ramp(t, ls(8), 1.0);
  let s = bgStreet({ bus: bus({ door: 1, sign: '7 · КОНЕЧНАЯ', driver: DRIVER({ grin: true }) }), busX: 0 });
  const tx = DOOR.x, ty = lerp(1470, 1395, up);
  const wave = t > tWave ? Math.sin((t - tWave) * 9) * 18 : 0;
  s += t < tTurn ? at(tx, ty, 0.72, tema({ back: true, torch: true }))
    : at(tx, ty, 0.72, tema2({ torch: true, mouth: 'smile', creepy: t > tWave + 0.6, armR: t > tWave ? [-160 + wave, -10] : [-14, 8], look: 0 }));
  return cam(DOOR.x, 1270, 3.0 + 0.3 * u, s, t, 0.5) + rain(t, 0.4);
}]);
// 9 · двери закрылись, автобус ушёл на круг
SCENES.push([ls(9) - 0.3, (t, u) => {
  const tClose = wt(9, 'закрылись'), tGo = wt(9, 'автобус') - 0.1;
  const d = 1 - ramp(t, tClose - 0.1, 0.5);
  const bx = -1700 * Math.pow(clamp((t - tGo) / 2.6), 2);
  const s = bgStreet({ bus: bus({ door: d, sign: '7 · КОНЕЧНАЯ', driver: DRIVER({ grin: true }), lights: 1, tail: 1 }), busX: bx, lamp: noise(t, 9) > 0.85 ? 0.3 : 1 });
  return cam(540, 1350, 1.1, s, t, 0.8) + rain(t, 0.8);
}]);
// 10 · «Следующий рейс — завтра. Не опаздывай»
SCENES.push([ls(10) - 0.3, (t, u) => {
  const m = ['Спасибо, что привёл их.']; if (t >= wt(10, 'следующий') - 0.1) m.push('Следующий рейс — завтра. Не опаздывай.');
  const s = full('#05070d') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity=".12"/>` + PHONE(t, { msgs: m, battery: 0, title: 'МАРК', avatar: 'М', clock: '03:07' });
  return cam(540, 960, 1.02 + 0.06 * u, s, t, 0.6) + redVig(pulse(t, wt(10, 'опаздывай') - 0.05, 1.0));
}]);
// 11 · маршрут №7: по кругу
SCENES.push([ls(11) - 0.3, (t, u) => {
  const t0 = ls(11) - 0.3, tLoop = wt(11, 'кругу');
  let s = bgRoute({ dot: (0.5 + (t - t0) * 0.28) % 1 });
  const lp = pulse(t, tLoop - 0.1, 1.2);
  s += `<ellipse cx="540" cy="1040" rx="330" ry="430" fill="none" stroke="${P.amber}" stroke-width="${14 + 20 * lp}" opacity="${lp * 0.6}"/>`;
  return cam(540, 1000, 0.98 + 0.06 * u, s + dust(t, 0.5), t, 0.5);
}]);
// 12 · пустая улица, я у калитки
SCENES.push([ls(12) - 0.3, (t, u) => {
  let s = bgStreet({ lamp: noise(t, 7) > 0.8 ? 0.25 : 1 });
  s += at(540, 1760, 0.95, mark2({ back: true }));
  return cam(540, 1400, 1.05 + 0.12 * u, s, t, 0.6) + rain(t, 0.9);
}]);
SCENES.push([le(12) + 0.6, (t, u) => titleCard(t, le(12) + 0.7, 3, 'Конечная')]);

if (typeof module !== 'undefined') module.exports = { render, T_END };

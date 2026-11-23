// СТРАННЫЙ СИГНАЛ · серия 2 «Отражение». render(t) из common/lib.js
T_END = le(11) + 4.4;
KEY = [
  [/^(окн|окне|окну|стекле|отражал|телефон|экран|переписк|дыш|трубке)/i, P.cyan],
  [/^(тём|соседи|старик|трасс)/i, P.amber],
  [/^(не|я|открывай|номер|ноль|процент|холодн|уходим|здесь|двери|все|двигались)$/i, P.red],
  [/^(номер|ноль|процент|холодн|уходим|здесь|двери|открыт)/i, P.red]
];
const NB = [[270, 0], [410, 1], [545, 2], [690, 3], [820, 4]];   // соседи у окна: x, вариант
const NB_Y = 1560, NB_S = 1.35;
const neighborsBack = (t, skip = -1, op = 1) => `<g opacity="${op}">` + NB.map(([x, v], i) => i === skip ? '' : at(x, NB_Y, NB_S, neighborBack(v, { glow: 0.85 + 0.15 * noise(t + i * 3, 4) }))).join('') + '</g>';
const neighborsRefl = t => NB.map(([x, v], i) => at(x, 1500, 1.2, neighbor(v, { glow: 0.9 + 0.1 * noise(t + i, 5) }))).join('');
const MSG_M = 'Не открывай. Это не я.';

SCENES = [];
// 0 · телефон в темноте: сообщение от «МАРК», заряд 0%
SCENES.push([0, (t, u) => {
  const tMsg = wt(0, 'не') - 0.1, tNum = wt(1, 'номера'), tZero = wt(1, 'ноль');
  const on = ramp(t, tMsg - 0.35, 0.3);
  const ph = PHONE(t, { msgs: t >= tMsg ? [MSG_M] : [], battery: 0, title: 'МАРК', avatar: 'М', clock: '02:58' });
  let s = full('#05070d') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity="${0.12 * on}"/><g opacity="${on}">${ph}</g>`;
  // подсветка имени контакта
  const hn = ramp(t, tNum - 0.1, 0.25) * (1 - ramp(t, tZero - 0.3, 0.3));
  s += `<rect x="${214 + 1.55 * 8}" y="${170 + 1.55 * 62}" width="${1.55 * 404}" height="${1.55 * 76}" rx="20" fill="none" stroke="${P.red}" stroke-width="8" opacity="${hn}"/>`;
  // огромный «0%»
  const z = ramp(t, tZero - 0.1, 0.2), bl = Math.floor(t * 4) % 2 ? 1 : 0.5;
  if (z > 0) s += full('#05070d', 0.75 * z) + `<g opacity="${z * bl}"><rect x="390" y="560" width="300" height="520" rx="40" fill="none" stroke="${P.red}" stroke-width="16"/><rect x="480" y="530" width="120" height="40" rx="10" fill="${P.red}"/>
    <text x="540" y="1300" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="170" fill="${P.red}">0%</text></g>`;
  return cam(540, 960, 1.0 + 0.06 * u, s, t, 0.6) + redVig(pulse(t, wt(0, 'я') - 0.05, 0.9));
}]);
// 1 · дом: дверь уже открыта, Марк и Тёма у крыльца
SCENES.push([ls(2) - 0.3, (t, u) => {
  const tOpen = wt(2, 'открыта');
  let s = bgHouse({ neighbors: true, glow: 0.9 + 0.1 * noise(t, 6), lamp: noise(t, 9) > 0.86 ? 0.3 : 1, door: 1 });
  s += `<rect x="770" y="1070" width="130" height="430" fill="${P.cyan}" opacity="${0.25 * pulse(t, tOpen - 0.1, 1.2)}"/>`;
  const wk = clamp(u * 1.3), ph = t * 4.6, sw = wk < 1 ? Math.sin(ph) * 12 : 0;
  s += at(520 + 120 * wk, 2150 - 160 * wk, 1.55 - 0.25 * wk, mark2({ back: true, legL: sw, legR: -sw }));
  s += at(330 + 120 * wk, 2170 - 160 * wk, 1.55 - 0.25 * wk, tema({ back: true, torch: true, legL: -sw, legR: sw }));
  return cam(lerp(540, 760, ease(u)), lerp(1250, 1300, ease(u)), 1.0 + 0.35 * ease(u), s, t) + rain(t, 0.9);
}]);
// 2 · комната: соседи стоят у окна спиной
SCENES.push([ls(3) - 0.3, (t, u) => {
  let s = bgRoom({ door: true, lamp: 1, curtain: Math.sin(t * 0.8) * 0.3 }) + neighborsBack(t) + dust(t, 0.8);
  const still = ramp(t, wt(3, 'двигались') - 0.2, 0.4);
  return cam(560, 1180, 1.12 + 0.12 * ease(u), s, t, 1 - 0.8 * still);
}]);
// 3 · три телефона, одна и та же переписка
SCENES.push([ls(4) - 0.3, (t, u) => {
  const M = ['Не смотри в окно.', 'Выйди из дома. Сейчас.', 'Приведи его домой.'];
  const ts = [ls(4) - 0.1, wt(4, 'каждом') - 0.1, wt(4, 'переписка') - 0.2];
  let s = full('#06080f') + `<circle cx="540" cy="960" r="800" fill="url(#gCyan)" opacity=".1"/>`;
  [[22, 0, -4, 470], [372, 1, 2, 560], [722, 2, 5, 450]].forEach(([x, i, r, y]) => {
    const k = ramp(t, ts[i], 0.3);
    if (k <= 0) return;
    s += `<g opacity="${k}" transform="translate(${x} ${y + 40 * (1 - k)}) rotate(${r} 168 344) scale(0.8)">${phoneScreen({ msgs: M, battery: [12, 4, 31][i], done: true })}
      <circle cx="-6" cy="620" r="40" fill="#1d2540"/><circle cx="426" cy="560" r="40" fill="#1d2540"/></g>`;
  });
  return cam(540, 960, 1.0 + 0.06 * u, s, t, 0.5) + rain(t, 0.15);
}]);
// 4 · Тёма шепчет
SCENES.push([ls(5) - 0.3, (t, u) => {
  const sp = t > wt(5, 'они') - 0.05 && t < le(5);
  const mouth = sp ? (Math.floor(t * 9) % 2 ? 'o' : 'smile') : 'smile';
  const s = `<g opacity=".4">${bgRoom({})}${neighborsBack(t)}</g>` + full('#05070d', 0.55) +
    at(540, 1700, 3.3, tema2({ torch: false, phone: true, glow: 1, armR: [-8, 160], mouth, look: t > wt(5, 'все') ? -5 : 3, head: -4, eyes: 'open' }));
  return cam(540, 900, 1.0 + 0.08 * u, s, t, 0.6);
}]);
// 5 · рука на плече старика: холодный, дышит
SCENES.push([ls(6) - 0.3, (t, u) => {
  const tTouch = wt(6, 'тронул'), tCold = wt(6, 'холодный'), tBr = wt(6, 'дышит');
  const br = t > tBr ? 0.5 + 0.5 * Math.sin((t - tBr) * Math.PI * 2 / 1.6) : 0;
  let s = `<g opacity=".8">${bgRoom({})}</g>`;
  s += at(540, 2300, 3.0, `<g transform="scale(1 ${1 + 0.012 * br})">${neighborBack(0, { glow: 0.9 })}</g>`);
  // рука Марка входит снизу слева к плечу
  const k = ramp(t, tTouch, 0.6);
  const hx = lerp(-80, 370, k), hy = lerp(1950, 1480, k);
  s += `<path d="M-260,1980 L${hx - 50},${hy + 6} L${hx + 34},${hy + 84} L-90,2330Z" fill="${P.jacket}"/><ellipse cx="${hx}" cy="${hy + 40}" rx="52" ry="42" fill="${P.skin}"/>`;
  // холод: иней по краям
  const c = ramp(t, tCold - 0.1, 0.4);
  s += `<rect width="1080" height="1920" fill="${P.cyan}" opacity="${0.08 * c}"/>`;
  for (let i = 0; i < 3; i++) s += `<path d="M${640 + i * 40},${1000 - i * 20} q${50 + i * 14},${80 + i * 14} 0,${160 + i * 28}" stroke="${P.cyan}" stroke-width="8" fill="none" opacity="${br * (0.8 - i * 0.2)}"/>`;
  return cam(540, 1150, 1.0 + 0.1 * u, s, t, 0.7);
}]);
// 6 · телефон: «Встань к окну. Как все»
SCENES.push([ls(7) - 0.3, (t, u) => {
  const m = [MSG_M]; if (t >= wt(7, 'встань') - 0.1) m.push('Встань к окну. Как все.');
  const s = full('#05070d') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity=".12"/>` + PHONE(t, { msgs: m, battery: 0, title: 'МАРК', avatar: 'М', clock: '03:00' });
  return cam(540, 960, 1.02 + 0.06 * u, s, t, 0.6) + redVig(pulse(t, wt(7, 'все') - 0.05, 1.0));
}]);
// 7 · Тёма идёт к окну, Марк хватает его за руку
SCENES.push([ls(8) - 0.3, (t, u) => {
  const tStep = wt(8, 'шагнул'), tGrab = wt(8, 'схватил');
  const p = 0.65 * ease((t - tStep) / (tGrab - tStep + 0.3));
  const walking = t > tStep && t < tGrab + 0.3, sw = walking ? Math.sin(t * 7) * 12 : 0;
  let s = bgRoom({ door: true }) + neighborsBack(t);
  const tx = lerp(330, 475, p), ty = lerp(1900, 1640, p), ts = lerp(1.6, 1.3, p);
  s += at(tx, ty, ts, tema({ back: true, torch: false, legL: sw, legR: -sw }));
  const g = ramp(t, tGrab, 0.3);
  s += at(170, 2150, 1.7, mark2({ back: true, armR: [lerp(-10, -70, g), lerp(0, -15, g)] }));
  s += bubble(320, 1180, 'Тёма, мы уходим!', wt(8, 'тёма', 1) - 0.1, t);
  return cam(470, 1420, 1.15 + 0.05 * u, s, t, walking ? 1.3 : 1);
}]);
// 8 · Тёма оборачивается: «Куда? Ты же уже здесь»
SCENES.push([ls(9) - 0.3, (t, u) => {
  const tTurn = wt(9, 'посмотрел'), tQ = wt(9, 'куда'), tHere = wt(9, 'здесь');
  const turn = ramp(t, tTurn, 0.5);
  const sp = (t > tQ - 0.05 && t < le(9));
  let body;
  if (turn < 0.5) body = tema({ back: true, torch: false });
  else body = tema2({ torch: false, phone: true, glow: 0.8, armR: [-8, 160], mouth: sp && t < tHere ? (Math.floor(t * 9) % 2 ? 'o' : 'smile') : 'smile', creepy: t > tHere + 0.3, look: 0, head: t > tHere ? 6 : 0 });
  const s = `<g opacity=".4">${bgRoom({})}${neighborsBack(t)}</g>` + full('#05070d', 0.5) + at(540, 1720, 3.3, body, 0, turn < 0.5 ? 1 - turn * 2 : (turn - 0.5) * 2);
  return cam(540, 900, 1.0 + 0.1 * ramp(t, tHere, 1.2), s, t, 0.6) + redVig(0.6 * ramp(t, tHere, 0.6));
}]);
// 9 · отражение в стекле: соседи, Тёма… и я — у окна, с телефоном
SCENES.push([ls(10) - 0.3, (t, u) => {
  const tMe = wt(10, 'я', 1), tPh = wt(10, 'телефоном');
  const meK = ramp(t, tMe - 0.4, 0.7);
  const refl = reflection(neighborsRefl(t) +
    at(475, 1530, 1.1, tema({ phone: true, glow: 1, torch: false, armR: [-8, 160], mouth: 'smile' })) +
    `<g opacity="${meK}">${at(617, 1440, 1.18, mark2({ phone: true, glow: 0.6 + 0.4 * ramp(t, tPh, 0.4), armR: [-12, 158], double: true }))}</g>`, 0.55);
  const s = bgRoom({ reflect: refl }) + neighborsBack(t, -1, 0.8);
  const z = lerp(1.25, 2.1, ease((t - (tMe - 0.6)) / 1.6));
  return cam(lerp(540, 617, ramp(t, tMe - 0.6, 1.6)), lerp(1050, 930, ramp(t, tMe - 0.6, 1.6)), z, s, t, 0.5);
}]);
// 10 · а я стою у двери
SCENES.push([ls(11) - 0.25, (t, u) => {
  const refl = reflection(neighborsRefl(t) + at(475, 1530, 1.1, tema({ phone: true, glow: 1, torch: false, armR: [-8, 160] })) +
    at(617, 1440, 1.18, mark2({ phone: true, glow: 1, armR: [-12, 158], double: true })), 0.55);
  const s = bgRoom({ reflect: refl, door: true }) + neighborsBack(t, -1, 0.8) + at(250, 2120, 1.65, mark2({ back: true }));
  const k = ease(u * 1.6);
  return cam(lerp(617, 540, k), lerp(930, 1250, k), lerp(2.1, 1.0, k), s, t, 0.4);
}]);
SCENES.push([le(11) + 0.6, (t, u) => titleCard(t, le(11) + 0.7, 2, 'Отражение')]);

if (typeof module !== 'undefined') module.exports = { render, T_END };

// ДЕСЯТЫЙ ЭТАЖ · серия 1 «Кнопка». render(t) из common/lib.js
const _defs2 = defs2; defs2 = () => _defs2() + defsLift();
T_END = le(9) + 4.4;
KEY = [
  [/^(мокрый|свет|моргнул|двери|табло)/i, P.cyan],
  [/^(лифт|подъезд|лампочк|кнопк|девять|девятом|девятый|этаж|ночи)/i, P.amber],
  [/^(десят|сверху|никого|землёй|вошла|горела|последний|выскочила|обернулась)/i, L.ten]
];
function seriesTitle(t, t0, ep, name) {
  const k = ramp(t, t0, 0.6), gl = pulse(t, t0, 0.3) * 18;
  return full('#000') + `<g opacity="${k}"><text x="${540 + gl}" y="900" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="124" fill="${L.ten}" letter-spacing="4">ДЕСЯТЫЙ</text>
    <text x="${540 - gl}" y="1030" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="124" fill="#e9eef5" letter-spacing="4">ЭТАЖ</text>
    <text x="540" y="1120" text-anchor="middle" font-family="Inter Display" font-weight="700" font-size="44" fill="#9fb0c6">серия ${ep} · «${name}»</text>
    <text x="540" y="1250" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="40" fill="${P.amber}" opacity="${ramp(t, t0 + 0.8, 0.5)}">продолжение следует…</text></g>`;
}
const bulbF = (t, k = 1) => noise(t, 11) > 0.84 ? 0.25 : 1;

SCENES = [];
// 0 · дом: девять этажей… и десятый
SCENES.push([0, (t, u) => {
  const tTen = wt(0, 'десятого') - 0.2, g = ramp(t, tTen, 0.4) * (0.75 + 0.25 * noise(t, 12));
  const s = bgBuilding({ ghost: g, lamp: bulbF(t) });
  return cam(540, lerp(1350, 760, ease(u)), lerp(1.25, 1.05, ease(u)), s, t, 0.5) + rain(t, 0.25) + redVig(0.5 * pulse(t, tTen + 0.1, 1.2));
}]);
// 1 · ночь, пустой подъезд, лампочка мигает
SCENES.push([ls(1) - 0.3, (t, u) => {
  const k = clamp(u * 1.1), sw = k < 1 ? Math.sin(t * 6) * 12 : 0;
  let s = bgLobby({ bulb: bulbF(t), ind: '1', indOn: 0.0 });
  s += at(lerp(260, 470, k), lerp(2000, 1700, k), lerp(1.5, 1.15, k), liza({ back: true, legL: sw, legR: -sw, armL: [-sw * 0.5, 0], armR: [sw * 0.5, 0] }));
  return cam(540, lerp(1250, 1150, u), lerp(1.0, 1.08, u), s, t, 0.8) + dust(t, 0.6);
}]);
// 2 · вызов; цифры ползут сверху
SCENES.push([ls(2) - 0.3, (t, u) => {
  const tPress = wt(2, 'нажала'), tNum = wt(2, 'цифры') - 0.2;
  if (t < tNum) {
    const r = ramp(t, tPress, 0.4);
    let s = bgLobby({ bulb: bulbF(t), indOn: 0, call: ramp(t, tPress + 0.35, 0.2) });
    s += at(690, 1720, 1.15, liza({ back: true, armR: [lerp(-8, -150, r), lerp(4, 10, r)] }));
    return cam(700, 1250, 1.35, s, t, 0.7);
  }
  const top = ramp(t, wt(2, 'сверху') - 0.1, 0.3);
  return cam(540, 860, 1.0 + 0.1 * u, indicatorClose('10', { glow: 0.5 + 0.5 * top }), t, 0.5) + redVig(0.6 * top);
}]);
// 3 · 10… 9… 8… — я живу на девятом
SCENES.push([ls(3) - 0.3, (t, u) => {
  const t9 = wt(3, 'девять') - 0.1, t8 = wt(3, 'восемь') - 0.1, tMe = wt(3, 'живу') - 0.55;
  if (t < tMe) return cam(540, 860, 1.12, indicatorClose(t < t9 ? '10' : t < t8 ? '9' : '8'), t, 0.4) + full('#000', pulse(t, t9 - 0.05, 0.15) + pulse(t, t8 - 0.05, 0.15));
  const fl = 0.6 + 0.4 * Math.sin(t * 9);
  const s = bgLobby({ bulb: 0.4, ind: String(Math.max(2, 7 - Math.floor((t - tMe) * 1.4))), arrow: '▼' }) + full('#000', 0.45) +
    at(540, 2380, 3.2, liza({ eyes: 'wide', look: 0, brow: -3, head: -4 })) + `<circle cx="540" cy="700" r="600" fill="url(#gTen)" opacity="${0.35 * fl}"/>`;
  return cam(540, 960, 1.0 + 0.06 * ramp(t, tMe, 3), s, t, 0.7) + redVig(0.4 * pulse(t, wt(3, 'последний'), 1.2));
}]);
// 4 · двери открылись: пусто, мокро, земля
SCENES.push([ls(4) - 0.3, (t, u) => {
  const tOpen = wt(4, 'двери') - 0.1, d = ramp(t, tOpen, 0.9);
  const s = bgLobby({ bulb: bulbF(t), ind: '1', doors: d, cabin: cabin({ wet: ramp(t, wt(4, 'мокрый') - 0.2, 0.4), dirt: ramp(t, wt(4, 'землёй') - 0.2, 0.5), light: 0.8 + 0.2 * noise(t, 9) }) }) +
    at(250, 2020, 1.6, liza({ back: true }));
  return cam(540, lerp(1150, 1250, ease(u)), lerp(1.05, 1.9, ease(u)), s, t, 0.6);
}]);
// 5 · надо было идти пешком — но я вошла
SCENES.push([ls(5) - 0.3, (t, u) => {
  const tIn = wt(5, 'но') - 0.2, k = ramp(t, tIn, 1.6), sw = k > 0 && k < 1 ? Math.sin(t * 6) * 10 : 0;
  const s = bgLobby({ bulb: bulbF(t), ind: '1', doors: 1, cabin: cabin({}) }) +
    at(lerp(330, 540, k), lerp(1980, 1500, k), lerp(1.55, 0.95, k), liza({ back: true, legL: sw, legR: -sw }));
  return cam(540, 1250, 1.25 + 0.15 * u, s, t, 0.6);
}]);
// 6 · нажала «9»; двери закрылись; свет моргнул
SCENES.push([ls(6) - 0.3, (t, u) => {
  const tP = wt(6, 'нажала'), tL = wt(6, 'свет') - 0.1;
  const light = t > tL && t < tL + 0.6 ? (Math.floor(t * 14) % 2 ? 0 : 0.5) : 1;
  const s = panelClose({ press: ramp(t, tP - 0.3, 0.4) * (1 - ramp(t, tP + 0.5, 0.4)), lit: t > tP + 0.1 ? 9 : 0, light });
  return cam(560, 700, 1.15 + 0.08 * u, s, t, 0.5) + full('#000', t > tL && t < tL + 0.12 ? 0.9 : 0);
}]);
// 7 · девятый: выскочила
SCENES.push([ls(7) - 0.3, (t, u) => {
  const d = 0.25 + 0.4 * ramp(t, ls(7), 3), k = ramp(t, wt(7, 'выскочила') - 0.5, 1.2), sw = Math.sin(t * 9) * 16 * (k > 0 && k < 1 ? 1 : 0);
  const s = bgLobby({ bulb: bulbF(t), ind: '9', doors: d, floor: '9', mail: false, flats: true, cabin: cabin({ light: 1 }) }) +
    at(540, lerp(1510, 1980, k), lerp(0.95, 1.6, k), liza({ eyes: 'wide', legL: sw, legR: -sw, armL: [sw, -10], armR: [-sw, 10], look: 0 }));
  return cam(540, 1250, 1.15, s, t, k > 0 && k < 1 ? 1.6 : 0.6);
}]);
// 8 · обернулась: над «9» ещё одна кнопка — «10»
SCENES.push([ls(8) - 0.3, (t, u) => {
  const tP = wt(8, 'над') - 0.2;
  if (t < tP) {
    const s = bgLobby({ bulb: bulbF(t), ind: '9', doors: 0.6, floor: '9', mail: false, flats: true, cabin: cabin({ light: 1 }) }) + at(560, 2050, 1.7, liza({ back: true }));
    return cam(540, 1200, 1.3 + 0.1 * u, s, t, 0.6);
  }
  const ten = ramp(t, wt(8, 'ещё') - 0.2, 0.6);
  return cam(590, lerp(700, 560, ease((t - tP) / 4)), lerp(1.2, 1.7, ease((t - tP) / 4)), panelClose({ lit: 9, ten }), t, 0.4) + redVig(0.4 * pulse(t, wt(8, 'десять'), 1));
}]);
// 9 · и она горела
SCENES.push([ls(9) - 0.3, (t, u) => {
  const lit = ramp(t, wt(9, 'горела') - 0.15, 0.25);
  return cam(590, 480, 2.0 + 0.4 * u, panelClose({ lit: 9, ten: 1, tenLit: lit }), t, 0.4) + redVig(lit);
}]);
SCENES.push([le(9) + 0.6, (t, u) => seriesTitle(t, le(9) + 0.7, 1, 'Кнопка')]);
if (typeof module !== 'undefined') module.exports = { render, T_END };

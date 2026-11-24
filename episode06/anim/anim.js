// СТРАННЫЙ СИГНАЛ · серия 6 «Сигнал». render(t) из common/lib.js
T_END = le(10) + 4.4;
KEY = [
  [/^(окно|телефон|сообщение|глаза|светились|экран|фарами)/i, P.cyan],
  [/^(тём|август|автобус|седьм|рулём|марк|ключи)/i, P.amber],
  [/^(я|он|ты)$/i, P.red],
  [/^(снова|два|сорок|семь|посмотрел|кто|три|года|каждую|ночь|выйдешь|выйдет|писали|уехал)/i, P.red]
];
const WS = { x: 70 + 0.85 * 80, y: 1440 - 0.85 * 268 };
const markInBed = (eyes = 'open') => at(1010, 1340, 0.72, mark2({ eyes, buds: false, armL: [0, 0], armR: [0, 0] }), -90) +
  `<rect x="700" y="1272" width="350" height="120" rx="26" fill="#2a3a55"/><rect x="700" y="1272" width="350" height="18" rx="9" fill="#33476a"/>`;
const temaInBed = () => at(392, 1622, 0.9, tema({ eyes: 'closed', torch: false, mouth: 'smile' }), -90) +
  `<rect x="150" y="1572" width="260" height="124" rx="22" fill="#5a2c38"/><rect x="150" y="1572" width="260" height="20" rx="10" fill="#6d3846"/>`;
const room = (t, o = {}) => bgBedroom({ curtain: Math.sin(t * 1.3) * 0.5 + 0.3, clock: '02:47' }) + dust(t, 0.7);

// сообщения в чате: входящие слева, исходящие справа (в координатах экрана телефона)
function bIn(y, text) {
  const L = wrapText(text, 22), h = 26 + L.length * 34;
  return `<rect x="24" y="${y}" width="330" height="${h}" rx="20" fill="#1c2534"/>` + L.map((l, i) => `<text x="44" y="${y + 42 + i * 34}" font-family="Inter Display" font-weight="700" font-size="27" fill="#e6ecf3">${l}</text>`).join('');
}
function bOut(y, text, cursor = '') {
  const w = Math.max(90, 44 + text.length * 15.5);
  return `<rect x="${396 - w}" y="${y}" width="${w}" height="60" rx="20" fill="#2a6a86"/><text x="${396 - w + 20}" y="${y + 40}" font-family="Inter Display" font-weight="700" font-size="27" fill="#eaf8ff">${text}${cursor}</text>`;
}
const chat = (t, inner, o = {}) => full('#05070d') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity=".12"/>` +
  at(214 + (o.vib || 0), 170, 1.55, phoneScreen2(Object.assign({ msgs: [], battery: 23, title: 'НЕИЗВЕСТНЫЙ', clock: '02:47' }, o)) + inner);

SCENES = [];
// 0 · проснулся: 02:47, снова
SCENES.push([0, (t, u) => {
  const tWake = wt(0, 'проснулся'), tClk = wt(0, 'два') - 0.2, tAgain = wt(0, 'снова');
  let s = room(t) + temaInBed() + markInBed(t > tWake + 0.3 ? 'open' : 'closed');
  s += `<ellipse cx="486" cy="1282" rx="120" ry="60" fill="url(#gRed)" opacity="${0.7 * pulse(t, tAgain - 0.1, 1.0)}"/>`;
  const z = ramp(t, tClk, 0.8);
  return cam(lerp(760, 486, z), lerp(1330, 1285, z), lerp(1.5, 2.6, z), s, t, 0.5) + redVig(0.4 * pulse(t, tAgain, 1));
}]);
// 1 · август, Тёма спит — всё как в ту ночь
SCENES.push([ls(1) - 0.3, (t, u) => {
  const tAug = wt(1, 'август') - 0.2, tTema = wt(1, 'тёма') - 0.3, tAll = wt(1, 'всё') - 0.3;
  const s = room(t) + temaInBed() + markInBed();
  let cx = 885, cy = 590, z = 2.4;
  if (t > tTema) { const k = ramp(t, tTema, 0.8); cx = lerp(885, 260, k); cy = lerp(590, 1600, k); z = lerp(2.4, 2.0, k); }
  if (t > tAll) { const k = ramp(t, tAll, 1.2); cx = lerp(260, 560, k); cy = lerp(1600, 1150, k); z = lerp(2.0, 1.05, k); }
  return cam(cx, cy, z, s, t, 0.5) + full(P.amber, 0.05 * ramp(t, tAll, 1));
}]);
// 2 · «Не смотри в окно»
SCENES.push([ls(2) - 0.3, (t, u) => {
  const tV = wt(2, 'завибрировал'), vib = t > tV && t < tV + 1.0 ? Math.sin(t * 90) * 8 : 0;
  const tM = wt(2, 'не') - 0.1;
  return cam(540, 960, 1.02 + 0.05 * u, chat(t, t > tM ? bIn(180, 'Не смотри в окно.') : '', { vib }), t, 0.6) + redVig(0.5 * pulse(t, wt(2, 'окно'), 1));
}]);
// 3 · теперь я знаю — и я посмотрел
SCENES.push([ls(3) - 0.3, (t, u) => {
  const tLook = wt(3, 'посмотрел') - 0.15, k = ramp(t, tLook, 0.4);
  const s = `<g opacity=".35">${room(t)}</g>` + full('#05070d', 0.5) + at(540, 2300, 3.2, mark2({ brow: -5, look: lerp(0, -6, k), head: -8 * k, eyes: 'open' }));
  return cam(540, 960, 1.0 + 0.08 * u + 0.4 * k, s, t, 0.6);
}]);
// 4 · в окне: автобус №7 с фарами, за рулём — я
SCENES.push([ls(4) - 0.3, (t, u) => {
  const tMe = wt(4, 'рулём') - 0.4, z = ramp(t, tMe, 1.2);
  const drv = at(84, -86, 0.55, mark2({ double: true, grin: t > wt(4, 'уехал') - 0.2, armL: [-30, -60], armR: [30, 60] }));
  let s = bgStreet({ bus: bus({ door: 0, sign: '7 · САДОВАЯ, 7', driver: drv }), busX: 0, lamp: noise(t, 9) > 0.86 ? 0.3 : 1 });
  // рама окна поверх
  s += `<rect x="0" y="0" width="1080" height="40" fill="#2a3150"/><rect x="0" y="1880" width="1080" height="40" fill="#2a3150"/><rect x="0" y="0" width="40" height="1920" fill="#2a3150"/><rect x="1040" y="0" width="40" height="1920" fill="#2a3150"/>
    <rect x="532" y="0" width="16" height="1920" fill="#2a3150"/><rect x="0" y="900" width="1080" height="16" fill="#2a3150"/>
    <polygon points="140,0 360,0 60,1920 -160,1920" fill="url(#gSheen)"/>`;
  return cam(lerp(540, WS.x + 14, z), lerp(1250, WS.y + 15, z), lerp(1.0, 4.4, z), s, t, 0.5) + rain(t, 0.6) + redVig(0.5 * ramp(t, wt(4, 'уехал') - 0.2, 0.6));
}]);
// 5 · впервые ответил: «Кто ты?»
SCENES.push([ls(5) - 0.3, (t, u) => {
  const MSG = 'Кто ты?', t0 = wt(5, 'сообщение') + 0.1, t1 = le(5);
  const n = Math.floor(MSG.length * clamp((t - t0) / (t1 - t0)));
  const cur = t < t1 && Math.floor(t * 3) % 2 ? '|' : '';
  return cam(540, 960, 1.02 + 0.05 * u, chat(t, bIn(180, 'Не смотри в окно.') + (t > t0 - 0.2 ? bOut(270, MSG.slice(0, n), cur) : '')), t, 0.6);
}]);
// 6 · «Ты. Через три года. Каждую ночь»
SCENES.push([ls(6) - 0.3, (t, u) => {
  const tA = wt(6, 'ты') - 0.15;
  return cam(540, 960, 1.04 + 0.08 * u, chat(t, bIn(180, 'Не смотри в окно.') + bOut(270, 'Кто ты?') + (t > tA ? bIn(352, 'Ты. Через три года. Каждую ночь.') : '')), t, 0.6) + redVig(0.6 * pulse(t, wt(6, 'ночь'), 1.1));
}]);
// 7 · Тёма сел; глаза светятся, как экран
SCENES.push([ls(7) - 0.3, (t, u) => {
  const tSit = wt(7, 'сел') - 0.2, tEyes = wt(7, 'глаза') - 0.1;
  let s = room(t) + markInBed();
  if (t < tSit) s += temaInBed();
  else s += at(250, 1700, 0.95, tema2({ torch: false, eyes: 'open', mouth: 'smile', glowEyes: ramp(t, tEyes, 0.5), armL: [10, -6], armR: [-10, 6] })) +
    `<rect x="150" y="1600" width="260" height="96" rx="22" fill="#5a2c38"/>`;
  const z = ramp(t, tSit, 1.4);
  return cam(lerp(560, 260, z), lerp(1250, 1480, z), lerp(1.05, 2.3, z), s, t, 0.6) + full('#05070d', 0.25 * z);
}]);
// 8 · «Марк… А ключи взял?»
SCENES.push([ls(8) - 0.3, (t, u) => {
  const sp = t > ls(8) - 0.05 && t < le(8);
  const s = `<g opacity=".3">${room(t)}</g>` + full('#05070d', 0.55) +
    at(540, 1720, 3.3, tema2({ torch: false, eyes: 'open', mouth: sp ? (Math.floor(t * 9) % 2 ? 'o' : 'smile') : 'smile', creepy: t > le(8) + 0.1, glowEyes: 1, head: 6 })) +
    bubble(560, 560, 'А ключи взял?', wt(8, 'ключи') - 0.4, t);
  return cam(540, 900, 1.0 + 0.08 * u, s, t, 0.5);
}]);
// 9 · ему всегда писали (телефон Тёмы, та ночь)
SCENES.push([ls(9) - 0.3, (t, u) => {
  const gl = noise(t, 20) > 0.8 ? (hash(Math.floor(t * 20)) - 0.5) * 30 : 0;
  const m = t > wt(9, 'писали') - 0.5 ? ['Спроси, взял ли он ключи.', 'Оставь дверь открытой.'] : ['Спроси, взял ли он ключи.'];
  const s = full('#06080f') + `<circle cx="540" cy="800" r="700" fill="url(#gCyan)" opacity=".12"/>` + at(214 + gl, 170, 1.55, phoneScreen2({ msgs: m, battery: 61, done: true, title: 'НЕИЗВЕСТНЫЙ' }));
  return cam(540, 960, 1.02 + 0.05 * u, s, t, 0.6) + full(P.cyan, 0.06) + `<rect y="${(t * 900) % 1920}" width="1080" height="30" fill="#fff" opacity=".05"/>`;
}]);
// 10 · «Выйдешь ты — или выйдет он»
SCENES.push([ls(10) - 0.3, (t, u) => {
  const tM = wt(10, 'выйдешь') - 0.15;
  return cam(540, 960, 1.02 + 0.06 * u, chat(t, bIn(180, 'Не смотри в окно.') + bOut(270, 'Кто ты?') + bIn(352, 'Ты. Через три года. Каждую ночь.') + (t > tM ? bIn(474, 'Выйдешь ты — или выйдет он.') : ''), { clock: '02:49' }), t, 0.6) +
    redVig(pulse(t, le(10) - 0.4, 1.1));
}]);
SCENES.push([le(10) + 0.6, (t, u) => titleCard(t, le(10) + 0.7, 6, 'Сигнал')]);
if (typeof module !== 'undefined') module.exports = { render, T_END };

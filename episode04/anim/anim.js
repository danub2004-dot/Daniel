// СТРАННЫЙ СИГНАЛ · серия 4 «Смена». render(t) из common/lib.js
T_END = le(10) + 4.4;
KEY = [
  [/^(телефон|фото|окне|окна|фары|сообщение|фонари)/i, P.cyan],
  [/^(тём|маме|автобус|седьм|маршрут|кольца|трасс|соседи|автопарк|руль)/i, P.amber],
  [/^(нет|меня|мне)$/i, P.red],
  [/^(какого|исчезли|никогда|подпись|три|года|опаздывай|пустым|садись|смена|махал|самому)/i, P.red]
];
const WS = { x: 70 + 0.85 * 80, y: 1440 - 0.85 * 268 };
const BX = lx => 70 + 0.85 * lx;
const passengers = t => [[200, 0], [380, 1], [700, -1], [840, 3], [990, 4]].map(([x, v]) =>
  v < 0 ? at(x, -150, 0.62, tema2({ phone: true, glow: 1, torch: false, armR: [-8, 160], creepy: true })) : at(x, -130, 0.62, neighbor(v, { glow: 0.9 + 0.1 * noise(t + x, 5), half: true }))).join('');

SCENES = [];
// 0 · звонок маме: «Какого Тёму?»
SCENES.push([0, (t, u) => {
  const tQ = wt(0, 'какого') - 0.05;
  const br = 0.5 + 0.5 * Math.sin(t * 5);
  let s = full('#06080f') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity=".1"/>` +
    PHONE(t, { call: true, wave: t > wt(0, 'она') ? 0.3 + 0.7 * br : 0.15, battery: 64, title: 'МАМА', avatar: 'М', clock: '07:12' }, 0.8);
  const k = ramp(t, tQ, 0.15), gl = pulse(t, tQ, 0.35) * 16;
  if (k > 0) s += full('#05070d', 0.7 * k) + `<g opacity="${k}"><text x="${540 + gl}" y="980" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="120" fill="${P.red}">«Какого</text>
    <text x="${540 - gl}" y="1120" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="120" fill="${P.red}">Тёму?»</text></g>`;
  return cam(540, 960, 1.0 + 0.06 * u, s, t, 0.6) + redVig(pulse(t, tQ, 1.2));
}]);
// 1 · заправленная кровать, кеды исчезают
SCENES.push([ls(1) - 0.3, (t, u) => {
  const tShoes = wt(1, 'кеды') + 0.5;
  let s = bgBedroom({ clock: '07:12', curtain: Math.sin(t) * 0.3 });
  s += `<rect x="20" y="1588" width="380" height="104" rx="8" fill="#5a2c38"/><rect x="20" y="1588" width="380" height="16" rx="6" fill="#6d3846"/><rect x="36" y="1566" width="110" height="34" rx="14" fill="#6b5a6a"/>`;
  const sh = 1 - ramp(t, tShoes, 0.8);
  s += `<g opacity="${sh}"><rect x="250" y="1752" width="56" height="20" rx="9" fill="#c9ccd4"/><rect x="316" y="1758" width="56" height="20" rx="9" fill="#c9ccd4"/></g>`;
  s += `<rect width="1080" height="1920" fill="#9fc4ff" opacity=".06"/>` + dust(t, 0.8);
  return cam(lerp(300, 240, u), 1600, lerp(1.7, 2.0, ease(u)), s, t, 0.7);
}]);
// 2 · последнее фото: Тёма в окне автобуса машет
SCENES.push([ls(2) - 0.3, (t, u) => {
  const tWave = wt(2, 'махал') - 0.2, w = t > tWave ? Math.sin((t - tWave) * 8) * 16 : 0;
  const photo = `<clipPath id="phClip"><rect x="20" y="160" width="380" height="540" rx="18"/></clipPath><g clip-path="url(#phClip)">
    <rect x="20" y="160" width="380" height="540" fill="#0d1a26"/><rect x="20" y="160" width="380" height="540" fill="url(#gBusIn)" opacity=".6"/>
    ${at(210, 700, 1.35, tema2({ torch: false, armR: [-160 + w, -10], creepy: true, mouth: 'smile' }))}
    <rect x="20" y="160" width="380" height="540" fill="none" stroke="#4b5262" stroke-width="26"/><polygon points="60,160 120,160 40,700 20,700" fill="#fff" opacity=".06"/></g>
    <text x="210" y="740" text-anchor="middle" font-family="Inter Display" font-weight="700" font-size="22" fill="#9aa7b8">03:01 · Садовая, 7</text>`;
  const scr = phoneScreen2({ msgs: [], battery: 61, title: 'ГАЛЕРЕЯ', avatar: '▣', clock: '07:15' }) + photo;
  return cam(540, 960, 1.02 + 0.1 * ease(u), full('#06080f') + at(214, 170, 1.55, scr), t, 0.5);
}]);
// 3 · седьмого маршрута нет
SCENES.push([ls(3) - 0.3, (t, u) => {
  const tNo = wt(3, 'нет'), tRing = wt(3, 'кольца');
  const fl = t > tRing ? (noise(t, 16) > 0.5 ? 0.15 : 0.6) * (1 - ramp(t, tRing + 0.4, 0.6)) : 1;
  let s = `<g opacity="${fl}">${bgRoute({ dot: 0.0 })}</g>`;
  const k = ramp(t, tNo - 0.05, 0.15);
  s += `<g opacity="${k}" transform="translate(540 1040) rotate(-14) scale(${1.4 - 0.4 * k})"><rect x="-380" y="-90" width="760" height="180" rx="16" fill="none" stroke="${P.red}" stroke-width="12"/>
    <text x="0" y="30" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="88" fill="${P.red}">НЕ ЗНАЧИТСЯ</text></g>`;
  return cam(540, 1000, 0.98 + 0.06 * u, full('#07090f') + s, t, 0.5);
}]);
// 4 · журнал смен: моя подпись каждую ночь
SCENES.push([ls(4) - 0.3, (t, u) => {
  const hl = ramp(t, wt(4, 'подпись'), 0.3);
  const s = full('#0b0d14') + shiftLog({ hl }) + `<rect width="1080" height="1920" fill="#000" opacity=".2"/>`;
  return cam(lerp(540, 790, ease(u)), lerp(960, 900, ease(u)), lerp(1.0, 1.7, ease(u)), s, t, 0.5);
}]);
// 5 · 02:47: «Остановка „Трасса“. Не опаздывай»
SCENES.push([ls(5) - 0.3, (t, u) => {
  const m = []; if (t >= wt(5, 'сообщение')) m.push('Остановка «Трасса». Не опаздывай.');
  const s = full('#05070d') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity=".12"/>` + PHONE(t, { msgs: m, battery: 58, title: 'МАРК', avatar: 'М', clock: '02:47' });
  return cam(540, 960, 1.02 + 0.06 * u, s, t, 0.6) + redVig(pulse(t, wt(5, 'опаздывай'), 1.0));
}]);
// 6 · решение: поеду
SCENES.push([ls(6) - 0.3, (t, u) => {
  const s = `<g opacity=".35">${bgBedroom({ clock: '02:48' })}</g>` + full('#05070d', 0.5) + at(540, 2300, 3.2, mark2({ brow: -5, look: 0, eyes: 'open' }));
  return cam(540, lerp(960, 1000, u), 1.0 + 0.15 * ease(u), s, t, 0.7);
}]);
// 7 · трасса, фонари мигают, фары
SCENES.push([ls(7) - 0.3, (t, u) => {
  const lamps = [noise(t, 11) > 0.8 ? 0.2 : 1, noise(t + 9, 10) > 0.83 ? 0.2 : 1];
  const g = ramp(t, wt(7, 'фары') - 0.5, 1.2);
  const s = bgStop({ lamps, glare: g * 0.8, man: at(470, 1760, 1.15, mark2({ back: true })) });
  return cam(560, 1350, 1.05 + 0.08 * u, s, t, 0.8) + rain(t, 0.5);
}]);
// 8 · седьмой: двери открылись, соседи на местах, Тёма у окна
SCENES.push([ls(8) - 0.3, (t, u) => {
  const t0 = ls(8) - 0.3, tDoor = wt(8, 'двери'), tTema = wt(8, 'тёма') - 0.3;
  const bx = lerp(1300, 0, ease((t - t0) / 1.2));
  const d = ramp(t, tDoor, 0.6);
  const s = bgStop({ bus: bus({ door: d, sign: '7 · ТРАССА', driver: driverSeat(), passengers: passengers(t) }), busX: bx, man: at(300, 1800, 1.2, mark2({ back: true })) });
  const z = ramp(t, tTema, 1.0);
  return cam(lerp(540, BX(697), z), lerp(1300, 1205, z), lerp(1.1, 3.4, z), s, t, 0.7) + rain(t, 0.5);
}]);
// 9 · пустое кресло водителя
SCENES.push([ls(9) - 0.3, (t, u) => {
  const s = bgStop({ bus: bus({ door: 1, sign: '7 · ТРАССА', driver: driverSeat(), passengers: passengers(t) }) });
  return cam(WS.x + 14, WS.y + 20, lerp(3.6, 5.0, ease(u)), s, t, 0.5) + redVig(0.5 * ramp(t, wt(9, 'пустым'), 0.6));
}]);
// 10 · «Садись. Теперь твоя смена»
SCENES.push([ls(10) - 0.3, (t, u) => {
  const m = ['Остановка «Трасса». Не опаздывай.']; if (t >= wt(10, 'садись') - 0.1) m.push('Садись. Теперь твоя смена.');
  const s = full('#05070d') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity=".12"/>` + PHONE(t, { msgs: m, battery: 7, title: 'МАРК', avatar: 'М', clock: '03:00' });
  return cam(540, 960, 1.02 + 0.06 * u, s, t, 0.6) + redVig(pulse(t, wt(10, 'смена'), 1.0));
}]);
SCENES.push([le(10) + 0.6, (t, u) => titleCard(t, le(10) + 0.7, 4, 'Смена')]);
if (typeof module !== 'undefined') module.exports = { render, T_END };

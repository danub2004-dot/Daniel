// «Кому ты откроешь?» — отдельный шортс. render(t) из common/lib.js
T_END = le(8) + 2.8;
KEY = [
  [/^(телефон|пишешь|пишу|пришло|вибрирует)/i, P.cyan],
  [/^(мама|мам|кухни|кухне|смене|ночи)/i, P.amber],
  [/^(врёт|двери|дверью|открывай|открой|откроешь|опускается|знает|кому|не|она)$/i, P.red],
  [/^(врёт|двер|открыва|открой|откроешь|опускается|знает)/i, P.red]
];
const Y = '#f2cf6b';
// комната: вид из кровати на дверь
function roomPOV(t, o = {}) {
  const q = Object.assign({ feet: 0, handle: 0, ajar: 0, phoneGlow: 0 }, o);
  let s = `<rect width="1080" height="1920" fill="#0c1020"/>`;
  for (let x = 0; x < 1080; x += 90) s += `<rect x="${x}" y="0" width="2" height="1500" fill="#fff" opacity=".02"/>`;
  s += `<rect x="70" y="420" width="170" height="230" fill="#1a2036"/><rect x="84" y="434" width="142" height="202" fill="#232b46"/><circle cx="155" cy="520" r="40" fill="#2f3a5c"/>`;
  s += `<rect x="830" y="700" width="200" height="16" fill="#1a2036"/><rect x="850" y="640" width="40" height="60" fill="#232b46"/><rect x="900" y="620" width="30" height="80" fill="#2b2440"/>`;
  // дверь
  s += `<rect x="290" y="500" width="500" height="1080" fill="#141a2c"/>`;
  s += `<rect x="310" y="520" width="460" height="1050" fill="#1f2740"/>`;
  if (q.ajar > 0) s += `<rect x="310" y="520" width="${40 * q.ajar}" height="1050" fill="${Y}" opacity=".5"/>`;
  s += `<rect x="350" y="580" width="380" height="420" rx="6" fill="#1a2138"/><rect x="350" y="1060" width="380" height="440" rx="6" fill="#1a2138"/>`;
  // свет под дверью и тени ног
  s += `<rect x="310" y="1566" width="460" height="10" fill="${Y}" opacity=".85"/><ellipse cx="540" cy="1600" rx="320" ry="40" fill="${Y}" opacity=".18"/>`;
  if (q.feet > 0) s += `<rect x="440" y="1564" width="70" height="14" fill="#05070d" opacity="${q.feet}"/><rect x="560" y="1564" width="70" height="14" fill="#05070d" opacity="${q.feet}"/>
    <polygon points="440,1578 510,1578 470,1700 380,1700" fill="#05070d" opacity="${0.5 * q.feet}"/><polygon points="560,1578 630,1578 700,1700 610,1700" fill="#05070d" opacity="${0.5 * q.feet}"/>`;
  // ручка
  s += `<g transform="rotate(${42 * q.handle} 700 1080)"><rect x="690" y="1068" width="80" height="22" rx="11" fill="#8d939c"/><circle cx="700" cy="1080" r="20" fill="#6b717b"/></g>`;
  // пол, одеяло (мы лежим в кровати)
  s += `<rect y="1580" width="1080" height="340" fill="#0a0d18"/>`;
  s += `<path d="M0,1760 Q300,1690 540,1730 Q800,1770 1080,1700 L1080,1920 L0,1920Z" fill="#2a3150"/><path d="M0,1760 Q300,1690 540,1730 Q800,1770 1080,1700" stroke="#3a4468" stroke-width="10" fill="none"/>`;
  if (q.phoneGlow) s += `<circle cx="540" cy="1920" r="600" fill="url(#gCyan)" opacity="${q.phoneGlow * 0.5}"/>`;
  return s;
}
// мама-силуэт: слишком высокая, слишком длинные руки
function momSil(o = {}) {
  const q = Object.assign({ tilt: 0, phone: 0 }, o);
  const ink = '#05070d';
  let s = `<path d="M-60,0 L-46,-420 Q-70,-560 -64,-640 Q0,-670 64,-640 Q70,-560 46,-420 L60,0Z" fill="${ink}"/>`;
  s += `<path d="M-62,-630 Q-110,-420 -96,-180 L-80,-178 Q-82,-420 -40,-600Z M62,-630 Q110,-420 96,-180 L80,-178 Q82,-420 40,-600Z" fill="${ink}"/>`;
  s += `<path d="M-64,-640 Q0,-670 64,-640" stroke="${Y}" stroke-width="3" fill="none" opacity=".6"/>`;
  s += `<g transform="rotate(${q.tilt} 0 -660)"><rect x="-12" y="-700" width="24" height="50" fill="${ink}"/><ellipse cx="0" cy="-740" rx="44" ry="56" fill="${ink}"/>
    <path d="M-46,-760 Q-60,-660 -50,-600 L50,-600 Q60,-660 46,-760Z" fill="${ink}"/><path d="M-44,-780 Q0,-806 44,-780" stroke="${Y}" stroke-width="3" fill="none" opacity=".5"/></g>`;
  if (q.phone) s += `<rect x="70" y="-230" width="34" height="56" rx="5" fill="${P.cyan}" opacity="${q.phone}"/><circle cx="87" cy="-200" r="90" fill="url(#gCyan)" opacity="${q.phone}"/>`;
  return s;
}
// вид в щель двери: тёмный коридор, в конце — кухня со светом
function corridor(t, o = {}) {
  const q = Object.assign({ tilt: 0, phone: 0, zoom: 0 }, o);
  let s = `<rect width="1080" height="1920" fill="#080a12"/>`;
  s += `<polygon points="0,0 1080,0 640,700 440,700" fill="#0d1120"/><polygon points="0,1920 1080,1920 640,1180 440,1180" fill="#0b0e18"/>`;
  s += `<polygon points="0,0 440,700 440,1180 0,1920" fill="#10152a"/><polygon points="1080,0 640,700 640,1180 1080,1920" fill="#0e1326"/>`;
  s += `<rect x="440" y="700" width="200" height="480" fill="${Y}" opacity=".85"/><rect x="440" y="700" width="200" height="480" fill="#c98a3a" opacity=".4"/>`;
  s += `<polygon points="440,1180 640,1180 900,1920 180,1920" fill="${Y}" opacity=".12"/>`;
  s += `<g transform="translate(540 1180) scale(0.62)">${momSil({ tilt: q.tilt, phone: q.phone })}</g>`;
  // края двери (смотрим в щель)
  s += `<rect x="0" y="0" width="300" height="1920" fill="#141a2c"/><rect x="780" y="0" width="300" height="1920" fill="#141a2c"/><rect x="296" y="0" width="8" height="1920" fill="${Y}" opacity=".3"/>`;
  return s;
}
function bIn(y, text) {
  const Ls = wrapText(text, 22), h = 26 + Ls.length * 34;
  return `<rect x="24" y="${y}" width="330" height="${h}" rx="20" fill="#1c2534"/>` + Ls.map((l, i) => `<text x="44" y="${y + 42 + i * 34}" font-family="Inter Display" font-weight="700" font-size="27" fill="#e6ecf3">${l}</text>`).join('');
}
function bOut(y, text, cur = '') {
  const w = Math.max(90, 44 + text.length * 15.5);
  return `<rect x="${396 - w}" y="${y}" width="${w}" height="60" rx="20" fill="#2a6a86"/><text x="${396 - w + 20}" y="${y + 40}" font-family="Inter Display" font-weight="700" font-size="27" fill="#eaf8ff">${text}${cur}</text>`;
}
const chat = (t, inner, vib = 0) => full('#05070d') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity=".12"/>` +
  at(214 + vib, 170, 1.55, phoneScreen2({ msgs: [], battery: 18, title: 'Мама ❤', avatar: 'М', clock: '03:00' }) + inner);
const M1 = 'Мам, ты на кухне?', M2 = 'Я на ночной смене. Не выходи из комнаты.', M3 = 'Не открывай. Она уже у двери.', M4 = 'Открой. Это мама.';
const opening = (t, u) => cam(540, 1100, 1.0 + 0.06 * u, roomPOV(t, { phoneGlow: 0.4 }), t, 0.6);

SCENES = [];
// 0 · 3:00, мама зовёт с кухни
SCENES.push([0, (t, u) => {
  let s = opening(t, u) + bubble(540, 470, 'Иди сюда. Помоги мне.', wt(0, 'иди') - 0.1, t);
  const k = 1 - ramp(t, 3.0, 0.4);
  if (k > 0) s += `<g opacity="${k}"><rect x="290" y="150" width="500" height="110" rx="24" fill="#05070d" opacity=".8"/><text x="540" y="230" text-anchor="middle" font-family="JetBrains Mono" font-weight="800" font-size="72" fill="${P.red}">03:00</text></g>`;
  return s;
}]);
// 1 · ты пишешь: «Мам, ты на кухне?»
SCENES.push([ls(1) - 0.3, (t, u) => {
  const t0 = wt(1, 'мам') - 0.1, t1 = le(1), n = Math.floor(M1.length * clamp((t - t0) / (t1 - t0)));
  return cam(540, 960, 1.02 + 0.04 * u, chat(t, t > t0 - 0.2 ? bOut(180, M1.slice(0, n), t < t1 && Math.floor(t * 3) % 2 ? '|' : '') : ''), t, 0.5);
}]);
// 2 · «Я на ночной смене. Не выходи из комнаты»
SCENES.push([ls(2) - 0.3, (t, u) => {
  const tA = wt(2, 'ночной') - 0.7;
  return cam(540, 960, 1.04 + 0.08 * u, chat(t, bOut(180, M1) + (t > tA ? bIn(262, M2) : '')), t, 0.5) + redVig(0.5 * pulse(t, wt(2, 'выходи'), 1));
}]);
// 3 · с кухни: «Это не я тебе пишу. Телефон врёт. Иди ко мне»
SCENES.push([ls(3) - 0.3, (t, u) => {
  const txt = t > wt(3, 'иди') - 0.1 ? 'Иди ко мне.' : t > wt(3, 'телефон') - 0.1 ? 'Телефон врёт.' : 'Это не я тебе пишу.';
  const s = corridor(t) + (t > wt(3, 'это') - 0.15 ? bubble(560, 620, txt, wt(3, 'это') - 0.15, t) : '');
  return cam(540, lerp(1000, 900, u), lerp(1.0, 1.3, ease(u)), s, t, 0.5);
}]);
// 4 · голос знает, что тебе пришло (у неё в руке светится телефон)
SCENES.push([ls(4) - 0.3, (t, u) => {
  const s = corridor(t, { tilt: 18 * ramp(t, ls(4), 1.2), phone: ramp(t, wt(4, 'знает') - 0.2, 0.5) });
  return cam(560, 900, lerp(1.4, 2.4, ease(u)), s, t, 0.5) + redVig(0.4 * ramp(t, wt(4, 'пришло'), 0.6));
}]);
// 5 · «Не открывай. Она уже у двери»
SCENES.push([ls(5) - 0.3, (t, u) => {
  const tV = wt(5, 'вибрирует') - 0.2, vib = t > tV && t < tV + 0.9 ? Math.sin(t * 90) * 8 : 0, tA = wt(5, 'не') - 0.15;
  return cam(540, 960, 1.04 + 0.06 * u, chat(t, bOut(180, M1) + bIn(262, M2) + (t > tA ? bIn(384, M3) : ''), vib), t, 0.5) + redVig(0.6 * pulse(t, wt(5, 'двери'), 1));
}]);
// 6 · тени ног под дверью, ручка опускается
SCENES.push([ls(6) - 0.3, (t, u) => {
  const s = roomPOV(t, { feet: 1, handle: ramp(t, wt(6, 'медленно'), 1.6) });
  return cam(lerp(560, 690, ease(u)), lerp(1250, 1090, ease(u)), lerp(1.2, 2.3, ease(u)), s, t, 0.4);
}]);
// 7 · оба говорят: «Открой. Это мама»
SCENES.push([ls(7) - 0.3, (t, u) => {
  const tO = wt(7, 'открой') - 0.15;
  const top = `<clipPath id="topH"><rect width="1080" height="960"/></clipPath><g clip-path="url(#topH)"><g transform="translate(0 -300)">${roomPOV(t, { feet: 1, handle: 1 })}</g>${t > tO ? bubble(540, 330, M4, tO, t) : ''}</g>`;
  const bot = `<clipPath id="botH"><rect y="960" width="1080" height="960"/></clipPath><g clip-path="url(#botH)"><g transform="translate(0 700)">${chat(t, bIn(180, M3) + (t > tO ? bIn(302, M4) : ''))}</g></g>`;
  const k = ramp(t, ls(7) - 0.3, 0.5);
  return `<g opacity="${k}">${top}${bot}</g><rect y="954" width="1080" height="12" fill="${P.red}" opacity=".8"/>` + redVig(0.5 * pulse(t, wt(7, 'мама', 0) > tO ? wt(7, 'мама') : tO + 0.5, 1));
}]);
// 8 · «Кому ты откроешь?» → петля к началу
SCENES.push([ls(8) - 0.3, (t, u) => {
  if (t > T_END - 0.35) return opening(t - (T_END - 0.35), 0);
  const k = ramp(t, ls(8) - 0.3, 0.3);
  const btn = (x, label, col, ic) => `<g transform="translate(${x} 1180)"><rect x="-220" y="-90" width="440" height="180" rx="40" fill="#0f1424" stroke="${col}" stroke-width="6"/>${ic}
    <text x="40" y="22" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="58" fill="${col}">${label}</text></g>`;
  const door = `<rect x="-180" y="-60" width="70" height="120" rx="6" fill="none" stroke="${Y}" stroke-width="8"/><circle cx="-125" cy="4" r="7" fill="${Y}"/>`;
  const ph = `<rect x="-176" y="-62" width="64" height="124" rx="12" fill="none" stroke="${P.cyan}" stroke-width="8"/><rect x="-164" y="-44" width="40" height="80" fill="${P.cyan}" opacity=".4"/>`;
  return `<g opacity="${k}">${full('#06080f')}<text x="540" y="760" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="104" fill="#e9eef5">Кому ты</text>
    <text x="540" y="880" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="104" fill="${P.red}">откроешь?</text>
    ${btn(540, 'ДВЕРЬ', Y, door).replace('translate(540 1180)', 'translate(540 1100)')}${btn(540, 'ТЕЛЕФОН', P.cyan, ph).replace('translate(540 1180)', 'translate(540 1330)')}
    <text x="540" y="1530" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="44" fill="#9fb0c6" opacity="${ramp(t, le(8) + 0.2, 0.4)}">пиши в комментариях 👇</text></g>`;
}]);
if (typeof module !== 'undefined') module.exports = { render, T_END };

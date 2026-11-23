// СТРАННЫЙ СИГНАЛ · серия 5 «Кольцо». render(t) из common/lib.js
T_END = le(9) + 4.4;
KEY = [
  [/^(сообщени|зеркале|телефон|экран|окно|чат|сигнал|фонарём)/i, P.cyan],
  [/^(тём|соседи|седьм|кольцу|трасса|рынок|школа|садовая|семь|автобус|руль)/i, P.amber],
  [/^(я|сам|сами|себе|никого)$/i, P.red],
  [/^(моргают|марк|первое|отправил|тормоз|остановился|замкнут)/i, P.red]
];

// ── вид с водительского места: дорога едет навстречу
function povRoad(t, o = {}) {
  const q = Object.assign({ spd: 1, stop: 0, people: false }, o);
  const vx = 540, vy = 900;
  let s = `<rect width="1080" height="1920" fill="url(#gSkyHwy)"/>`;
  let seed = 4; const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  for (let i = 0; i < 50; i++) s += `<circle cx="${rnd() * 1080}" cy="${rnd() * 800}" r="${rnd() * 1.5 + 0.4}" fill="#cfd6ff" opacity="${rnd() * 0.5}"/>`;
  s += `<path d="M0,900 L0,850 L90,850 L90,820 L170,820 L170,870 L260,870 L260,900Z M760,900 L760,760 L810,760 L810,900Z M820,900 L820,790 L870,790 L870,900Z" fill="#0b0c16"/>`;
  s += `<rect y="${vy}" width="1080" height="${1920 - vy}" fill="#0c0e15"/>`;
  s += `<polygon points="${vx - 8},${vy} ${vx + 8},${vy} 1500,1920 -420,1920" fill="#181b24"/>`;
  s += `<polygon points="${vx - 8},${vy} ${vx - 4},${vy} -360,1920 -420,1920" fill="#c9c2a8" opacity=".35"/><polygon points="${vx + 4},${vy} ${vx + 8},${vy} 1500,1920 1440,1920" fill="#c9c2a8" opacity=".3"/>`;
  const ph = (t * q.spd * 0.9) % 1;
  for (let i = 0; i < 12; i++) {
    const z1 = Math.pow((i + ph) / 12, 2.4), z2 = Math.pow((i + ph + 0.45) / 12, 2.4);
    const y1 = vy + (1920 - vy) * z1, y2 = vy + (1920 - vy) * z2, w1 = 1 + 22 * z1, w2 = 1 + 22 * z2;
    s += `<polygon points="${vx - w1},${y1} ${vx + w1},${y1} ${vx + w2},${y2} ${vx - w2},${y2}" fill="${P.amber}" opacity=".55"/>`;
  }
  // фонари по обе стороны пролетают мимо
  for (let i = 0; i < 6; i++) {
    const z = ((i / 6) + t * q.spd * 0.22) % 1, k = Math.pow(z, 2.2);
    [-1, 1].forEach(side => {
      const x = vx + side * (40 + 900 * k), y = vy + (1920 - vy) * k * 0.55, h = 40 + 900 * k;
      s += `<rect x="${x - 3 - 6 * k}" y="${y - h}" width="${6 + 12 * k}" height="${h}" fill="#05060b"/><circle cx="${x - side * 30 * k}" cy="${y - h}" r="${10 + 160 * k}" fill="url(#gAmber)" opacity="${0.4 + 0.6 * k}"/>`;
    });
  }
  // остановка справа + двое под фонарём
  if (q.stop > 0) {
    const k = Math.pow(q.stop, 2.2), x = vx + 60 + 900 * k, y = vy + 600 * k, sc = 0.15 + 1.6 * k;
    s += `<g transform="translate(${x} ${y}) scale(${sc})"><rect x="-6" y="-430" width="12" height="430" fill="#0a0c12"/><rect x="-90" y="-430" width="180" height="96" rx="8" fill="#e8e1cf" opacity=".9"/>
      <text x="0" y="-370" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="28" fill="#141820">САДОВАЯ, 7</text>
      ${q.people ? at(-200, 0, 1, mark2({ phone: true, glow: 1, armR: [-12, 158], look: 3 })) + at(-330, 0, 1.05, tema({ torch: true, look: 3 })) : ''}</g>`;
  }
  return s;
}
// ── кабина: рама стекла, зеркало, панель, руль
function cab(t, o = {}) {
  const q = Object.assign({ wheel: 0, screen: 0, mirror: '', who: '' }, o);
  let s = `<rect width="1080" height="110" fill="#07090f"/><polygon points="0,0 130,0 50,1320 0,1320" fill="#07090f"/><polygon points="1080,0 950,0 1030,1320 1080,1320" fill="#07090f"/>`;
  s += `<rect x="530" y="96" width="20" height="30" fill="#05070b"/><rect x="380" y="120" width="320" height="130" rx="20" fill="#05070b"/>
    <clipPath id="mirClip"><rect x="392" y="132" width="296" height="106" rx="14"/></clipPath><g clip-path="url(#mirClip)"><rect x="392" y="132" width="296" height="106" fill="#0d1a26"/><rect x="392" y="132" width="296" height="106" fill="url(#gBusIn)" opacity=".5"/>${q.mirror}</g>`;
  s += `<path d="M0,1310 Q540,1220 1080,1310 L1080,1920 L0,1920Z" fill="#11141c"/><path d="M0,1310 Q540,1220 1080,1310" stroke="#262b38" stroke-width="6" fill="none"/>`;
  [[170, 1430], [320, 1410]].forEach(([x, y], i) => {
    const a = -120 + 60 * i + 20 * noise(t + i, 2);
    s += `<circle cx="${x}" cy="${y}" r="62" fill="#07090e" stroke="${P.amberDim}" stroke-width="5"/><circle cx="${x}" cy="${y}" r="70" fill="url(#gAmber)" opacity=".25"/>
      <line x1="${x}" y1="${y}" x2="${x + 46 * Math.cos(a * Math.PI / 180)}" y2="${y + 46 * Math.sin(a * Math.PI / 180)}" stroke="${P.amber}" stroke-width="5" stroke-linecap="round"/>`;
  });
  s += `<rect x="740" y="1340" width="280" height="180" rx="14" fill="#05070b"/><rect x="752" y="1352" width="256" height="156" rx="10" fill="${P.cyan}" opacity="${0.12 + 0.5 * q.screen}"/>`;
  if (q.screen > 0.3) s += `<text x="880" y="1445" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="34" fill="#05070b" opacity="${q.screen}">МАРК</text>`;
  s += `<g transform="rotate(${q.wheel} 540 1990)"><circle cx="540" cy="1990" r="380" fill="none" stroke="#05070b" stroke-width="60"/><circle cx="540" cy="1990" r="380" fill="none" stroke="#1d2130" stroke-width="42"/>
    <rect x="220" y="1970" width="640" height="40" fill="#1d2130"/><rect x="520" y="1990" width="40" height="320" fill="#1d2130"/><circle cx="540" cy="1990" r="90" fill="#15181f"/>
    <circle cx="540" cy="1990" r="44" fill="${P.amber}"/><text x="540" y="2008" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="50" fill="#141820">7</text></g>`;
  return s;
}
const mirrorPeople = (t, look = 0) => [[430, 0], [500, 2], [575, 1], [650, 4]].map(([x, v]) => at(x, 268, 0.36, neighbor(v, { glow: 0.9 + 0.1 * noise(t + x, 5), half: true }))).join('') +
  at(540, 262, 0.4, tema2({ phone: true, glow: 1, torch: false, armR: [-8, 160], look, mouth: 'smile', creepy: look !== 0 }));
// ── пустой салон
function busInterior(t) {
  const vx = 540, vy = 780;
  let s = `<rect width="1080" height="1920" fill="#0b0f18"/><polygon points="0,0 1080,0 ${vx + 120},${vy - 80} ${vx - 120},${vy - 80}" fill="#141a28"/>
    <polygon points="0,1920 1080,1920 ${vx + 120},${vy + 80} ${vx - 120},${vy + 80}" fill="#1a1e2a"/>
    <rect x="${vx - 120}" y="${vy - 80}" width="240" height="160" fill="#05070b"/>`;
  s += `<polygon points="${vx - 30},${vy - 80} ${vx + 30},${vy - 80} 640,0 440,0" fill="${P.cyan}" opacity=".18"/>`;
  for (let i = 5; i >= 0; i--) {
    const k = 1 - i / 6.5, sw = 230 * k, sh = 300 * k, y = vy + 80 + (1920 - vy - 80) * Math.pow(k, 1.6) - sh;
    [-1, 1].forEach(side => {
      const x = vx + side * (130 + 380 * k) - sw / 2;
      s += `<rect x="${x}" y="${y}" width="${sw}" height="${sh}" rx="${16 * k}" fill="#2a3448"/><rect x="${x}" y="${y}" width="${sw}" height="${sh * 0.2}" rx="${16 * k}" fill="#36425a"/>`;
    });
    const wy = vy - 60 - 500 * Math.pow(k, 1.4), wx = 480 * Math.pow(k, 1.1);
    const lit = noise(t * 2 + i, 3) > 0.55 ? 0.35 : 0.08;
    s += `<rect x="${vx - 150 - wx}" y="${wy}" width="${40 + 60 * k}" height="${120 + 300 * k}" fill="${P.amber}" opacity="${lit}"/><rect x="${vx + 110 + wx}" y="${wy}" width="${40 + 60 * k}" height="${120 + 300 * k}" fill="${P.amber}" opacity="${lit * 0.8}"/>`;
  }
  return s;
}
const wheelT = t => 14 * Math.sin(t * 0.9) + 6 * Math.sin(t * 2.3);
const MIR = (t, s0, look) => cam(540, 186, s0, povRoad(t, { spd: 1 }) + cab(t, { wheel: wheelT(t), mirror: mirrorPeople(t, look) }), t, 0.4);

SCENES = [];
// 0 · сел за руль
SCENES.push([0, (t, u) => {
  const s = povRoad(t, { spd: 0.6 * ramp(t, 1.2, 2) }) + cab(t, { wheel: wheelT(t) * ramp(t, 1.2, 1), mirror: mirrorPeople(t) });
  return cam(540, 1100, 1.15 - 0.1 * ease(u), s, t, 0.6) + redVig(0.4 * pulse(t, wt(0, 'понял'), 1.2));
}]);
// 1 · руль крутится сам; Трасса… Рынок… Школа
SCENES.push([ls(1) - 0.3, (t, u) => {
  let s = povRoad(t, { spd: 1.2 }) + cab(t, { wheel: wheelT(t) * 2.2, mirror: mirrorPeople(t) });
  [['ТРАССА', wt(1, 'трасса')], ['РЫНОК', wt(1, 'рынок')], ['ШКОЛА', wt(1, 'школа')]].forEach(([n, t0]) => {
    const k = ramp(t, t0 - 0.1, 0.15) * (1 - ramp(t, t0 + 1.1, 0.3));
    if (k > 0) s += `<g opacity="${k}" transform="translate(540 520) scale(${0.9 + 0.1 * k})"><rect x="-230" y="-70" width="460" height="120" rx="14" fill="#e8e1cf" opacity=".92"/><rect x="-230" y="-70" width="460" height="34" rx="12" fill="#2c5a3a"/>
      <text x="0" y="-44" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="24" fill="#e8e1cf">ОСТАНОВКА</text><text x="0" y="30" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="58" fill="#141820">${n}</text></g>`;
  });
  return cam(540, 1100, 1.05, s, t, 0.8);
}]);
// 2 · в зеркале соседи и Тёма
SCENES.push([ls(2) - 0.3, (t, u) => MIR(t, lerp(3.0, 3.6, ease(u)), 0) + redVig(0.3 * pulse(t, wt(2, 'моргают'), 1))]);
// 3 · обернулся — в салоне никого; только в зеркале
SCENES.push([ls(3) - 0.3, (t, u) => {
  const tE = wt(3, 'салоне') - 0.4, tM = wt(3, 'зеркале') - 0.3;
  if (t < tE) return cam(540, 960, 1.05, `<g opacity=".3">${busInterior(t)}</g>` + full('#05070d', 0.4) + at(540, 2300, 3.2, mark2({ eyes: 'wide', head: -10 * ramp(t, ls(3), 0.5), look: -5, brow: -3 })), t, 1.2);
  if (t < tM) return cam(540, 960, 1.0 + 0.05 * (t - tE), busInterior(t) + dust(t, 0.8), t, 0.6);
  return MIR(t, 3.8, 0) + redVig(0.4 * ramp(t, tM, 0.5));
}]);
// 4 · экран на панели: чат, получатель «Марк»
SCENES.push([ls(4) - 0.3, (t, u) => {
  const scr = ramp(t, wt(4, 'загорелся') - 0.1, 0.3);
  if (t < wt(4, 'чат') - 0.2) return cam(880, 1430, lerp(2.2, 2.6, u), povRoad(t) + cab(t, { wheel: wheelT(t), screen: scr, mirror: mirrorPeople(t) }), t, 0.5);
  const hn = ramp(t, wt(4, 'получатель') - 0.1, 0.25);
  const s = full('#05070d') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity=".12"/>` + PHONE(t, { msgs: [], battery: 100, title: 'МАРК', avatar: 'М', clock: '03:04' }, 0.5) +
    `<rect x="${214 + 1.55 * 8}" y="${170 + 1.55 * 62}" width="${1.55 * 404}" height="${1.55 * 76}" rx="20" fill="none" stroke="${P.red}" stroke-width="8" opacity="${hn}"/>`;
  return cam(540, 960, 1.02 + 0.04 * u, s, t, 0.5);
}]);
// 5 · пальцы сами набирают «Не смотри в окно.»
SCENES.push([ls(5) - 0.3, (t, u) => {
  const MSG = 'Не смотри в окно.', t0 = wt(5, 'набрали'), t1 = le(5) - 0.1;
  const n = Math.floor(MSG.length * clamp((t - t0) / (t1 - t0)));
  const cur = Math.floor(t * 3) % 2 ? '|' : '';
  const sent = t > t1 + 0.25;
  const s = full('#05070d') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity=".12"/>` +
    PHONE(t, { msgs: sent ? [MSG] : [], battery: 100, title: 'МАРК', avatar: 'М', clock: '03:04', done: sent }, 0.5) +
    (sent ? '' : `<g transform="translate(214 170) scale(1.55)"><rect x="20" y="760" width="380" height="64" rx="32" fill="#1c2534"/><text x="44" y="802" font-family="Inter Display" font-weight="700" font-size="27" fill="#e6ecf3">${MSG.slice(0, n)}${cur}</text></g>`);
  return cam(540, lerp(960, 1300, ease(u)), 1.02 + 0.25 * ease(u), s, t, 0.5) + redVig(pulse(t, t1 + 0.2, 1.0));
}]);
// 6 · вспышка памяти: та самая ночь, спальня, первое сообщение
SCENES.push([ls(6) - 0.3, (t, u) => {
  const gl = noise(t, 20) > 0.8 ? (hash(Math.floor(t * 20)) - 0.5) * 40 : 0;
  let s = bgBedroom({ curtain: Math.sin(t * 1.3) * 0.6 + 0.4 }) + at(780, 1500, 1.2, mark({ phone: true, glow: 0.9, armR: [-12, 158], look: 3 }));
  const k = ramp(t, ls(6), 0.3);
  const ban = `<g transform="translate(60 ${-230 + 330 * k})"><rect width="960" height="200" rx="34" fill="#121a28" opacity=".94" stroke="#2c3a52" stroke-width="2"/>
    <circle cx="62" cy="58" r="26" fill="#1f2a3a"/><text x="62" y="68" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="30" fill="${P.cyan}">?</text>
    <text x="106" y="68" font-family="Inter Display" font-weight="800" font-size="30" fill="#9fb0c6">НЕИЗВЕСТНЫЙ · 02:47</text>
    <text x="40" y="150" font-family="Inter Display" font-weight="800" font-size="48" fill="#f1f5fa">Не смотри в окно.</text></g>`;
  s += '';
  return `<g transform="translate(${gl} 0)">` + cam(600, 1100, 1.05 + 0.1 * u, s, t) + ban + `</g>` + full(P.cyan, 0.08) +
    `<rect y="${(t * 900) % 1920}" width="1080" height="30" fill="#fff" opacity=".05"/>` + redVig(0.6 * pulse(t, wt(6, 'себе'), 1.0));
}]);
// 7 · впереди «Садовая, 7»: под фонарём стою я с Тёмой
SCENES.push([ls(7) - 0.3, (t, u) => {
  const t0 = ls(7) - 0.3, tMe = wt(7, 'стоял') - 0.4;
  if (t < tMe) return cam(540, 1100, 1.05, povRoad(t, { spd: 0.8, stop: 0.25 + 0.3 * clamp((t - t0) / (tMe - t0)) }) + cab(t, { wheel: wheelT(t), mirror: mirrorPeople(t) }), t, 0.6);
  const g = 0.35 + 0.25 * ramp(t, tMe, 3);
  const s = bgStop({ name: 'САДОВАЯ, 7', glare: g, lamps: [1, noise(t, 9) > 0.85 ? 0.3 : 1],
    man: at(420, 1760, 1.15, mark2({ phone: true, glow: 1, armR: [-12, 158], look: -2 })) + at(250, 1790, 1.15, tema({ torch: true, look: -2 })) });
  return cam(lerp(480, 360, ease((t - tMe) / 3)), lerp(1350, 1300, ease((t - tMe) / 3)), lerp(1.1, 1.9, ease((t - tMe) / 3.5)), s, t, 0.5) + rain(t, 0.5);
}]);
// 8 · тормоз — не остановился
SCENES.push([ls(8) - 0.3, (t, u) => {
  const tBr = wt(8, 'тормоз') - 0.1, tNo = wt(8, 'не') - 0.1;
  const shake = t > tBr ? 2.5 : 0.6;
  const st = clamp(0.55 + (t - (ls(8) - 0.3)) * 0.22);
  const s = povRoad(t, { spd: t > tNo ? 2.2 : 0.9, stop: st, people: true }) + cab(t, { wheel: wheelT(t) * 3, mirror: mirrorPeople(t, -3) });
  return cam(540, 1100, 1.05, s, t, shake) + redVig(0.3 + 0.4 * ramp(t, tNo, 0.6));
}]);
// 9 · «Круг замкнут. Теперь ты — сигнал»
SCENES.push([ls(9) - 0.3, (t, u) => {
  const m = []; if (t >= wt(9, 'круг') - 0.1) m.push('Круг замкнут. Теперь ты — сигнал.');
  const s = full('#05070d') + `<circle cx="540" cy="900" r="700" fill="url(#gCyan)" opacity=".12"/>` + PHONE(t, { msgs: m, battery: 100, title: 'НЕИЗВЕСТНЫЙ', clock: '03:07' });
  return cam(540, 960, 1.02 + 0.06 * u, s, t, 0.6) + redVig(pulse(t, wt(9, 'сигнал'), 1.0));
}]);
SCENES.push([le(9) + 0.6, (t, u) => titleCard(t, le(9) + 0.7, 5, 'Кольцо')]);
if (typeof module !== 'undefined') module.exports = { render, T_END };

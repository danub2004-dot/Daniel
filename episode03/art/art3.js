// СТРАННЫЙ СИГНАЛ · серия 3 — графика поверх ../../episode01/art/art.js и ../../episode02/art/art2.js
// Кровать Марка с тем, кто под одеялом; «тёмный» Марк; Тёма сидит на полу.

const markShadow = o => mark(Object.assign({ buds: false, eyes: 'closed' }, o))
  .replace(/fill="#[0-9a-fA-F]{6}"/g, 'fill="#06080e"').replace(/stroke="#[0-9a-fA-F]{6}"/g, 'stroke="#06080e"');

// одеяло на кровати Марка (поверх bgBedroom). q.breath 0..1 — подъём одеяла
function blanket(q = {}) {
  const b = q.breath || 0, h = 1262 - 14 * b;
  return `<path d="M700,1300 Q720,${h} 820,${h + 2} Q930,${h - 6} 1000,1282 Q1040,1290 1050,1300 L1060,1440 L560,1440 L560,1300Z" fill="#34486a"/>
    <path d="M720,1300 Q800,${h + 12} 900,${h + 10}" stroke="#263652" stroke-width="6" fill="none"/>
    <rect x="560" y="1300" width="500" height="22" fill="#3d537a"/>`;
}
// голова на подушке (лицом к нам) — Марк или тот, кто под одеялом
function headOnPillow(q = {}) {
  const o = Object.assign({ eyes: 'closed', face: true }, q);
  if (!o.face) return `<ellipse cx="672" cy="1262" rx="44" ry="34" fill="${P.hair}"/>`;
  return `<g transform="rotate(-80 672 1268)"><ellipse cx="672" cy="1268" rx="38" ry="45" fill="${P.skin}"/>
    <path d="M631,1262 Q626,1216 668,1216 Q708,1210 716,1250 Q700,1236 668,1240 Q646,1242 631,1262Z" fill="${P.hair}"/>
    ${eyes(658, 686, 1272, o.eyes, 0, 5)}</g>`;
}
const boots = () => `<g transform="translate(-60 0)">` + [1290, 1330].map(y => `<rect x="1030" y="${y}" width="20" height="30" fill="${P.jeans}"/>
  <path d="M1046,${y - 6} h22 q16,0 16,16 v26 h-38Z" fill="#4a3a2c"/><rect x="1046" y="${y + 30}" width="40" height="8" rx="3" fill="#2a2018"/>
  <path d="M1052,${y} h10 M1052,${y + 8} h10" stroke="#c9b48a" stroke-width="2"/><circle cx="1078" cy="${y + 34}" r="4" fill="#6b5a3a" opacity=".8"/>`).join('') + '</g>';

// Тёма сидит на полу, ноги вперёд. x,y — точка на полу под бёдрами
function temaSitting(x, y, s, o = {}) {
  return at(x, y + 118 * s, s, tema(Object.assign({ legL: -84, legR: -78, torch: false }, o)));
}
// «тёмный» Марк садится на кровати: k 0 — лежит, 1 — сидит
function doubleSitting(k, o = {}) {
  return `<g transform="rotate(${-78 * (1 - k)} 720 1300)">${at(720, 1488, 1.0, markShadow(o))}</g>`;
}

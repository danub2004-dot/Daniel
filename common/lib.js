// СТРАННЫЙ СИГНАЛ — общий движок анимации (вынесен из серии 1). Требует art.js, art2.js и WORDS.
const FPS = 30;
const WL = WORDS.words;
const LINES = []; WL.forEach((w, i) => { w.i = i; (LINES[w.line] = LINES[w.line] || []).push(w); });
const ls = i => LINES[i][0].s, le = i => LINES[i][LINES[i].length - 1].e;
function wt(line, sub, k = 0) {
  const c = LINES[line].filter(w => w.w.toLowerCase().includes(sub.toLowerCase()));
  if (!c[k]) throw new Error('word not found: ' + line + ' ' + sub);
  return c[k].s;
}
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ease = v => { v = clamp(v); return v * v * (3 - 2 * v); };
const lerp = (a, b, k) => a + (b - a) * k;
const ramp = (t, a, d = 0.25) => ease((t - a) / d);
const pulse = (t, a, d = 0.4) => (t < a || t > a + d) ? 0 : Math.sin((t - a) / d * Math.PI);
function hash(n) { n = Math.sin(n * 127.1 + 311.7) * 43758.5453; return n - Math.floor(n); }
const noise = (t, sp = 8) => { const i = Math.floor(t * sp), f = t * sp - i; return hash(i) * (1 - f) + hash(i + 1) * f; };

function cam(cx, cy, s, inner, t, shake = 1) {
  const dx = (noise(t, 0.7) - 0.5) * 14 * shake, dy = (noise(t + 40, 0.6) - 0.5) * 12 * shake;
  return `<g transform="translate(${540 + dx} ${960 + dy}) scale(${s}) translate(${-cx} ${-cy})">${inner}</g>`;
}
const at = (x, y, s, inner, r = 0, sx = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s * sx} ${s})">${inner}</g>`;

function rain(t, k) {
  if (k <= 0) return '';
  let s = '';
  for (let i = 0; i < 150; i++) {
    const sp = 2300 + hash(i) * 900, len = 40 + hash(i + 7) * 50;
    const x0 = hash(i + 3) * 1300 - 100, y = ((hash(i + 11) * 2200 + t * sp) % 2200) - 140;
    const x = x0 - y * 0.12;
    s += `<line x1="${x}" y1="${y}" x2="${x - len * 0.12}" y2="${y + len}" stroke="#b9d3ff" stroke-width="2" opacity="${(0.12 + hash(i + 5) * 0.22) * k}"/>`;
  }
  return s;
}
function dust(t, k = 1) {
  let s = '';
  for (let i = 0; i < 40; i++) {
    const x = (hash(i) * 1080 + Math.sin(t * 0.3 + i) * 40), y = (hash(i + 9) * 1920 - t * (8 + hash(i + 2) * 14) + 1920 * 4) % 1920;
    s += `<circle cx="${x}" cy="${y}" r="${1 + hash(i + 4) * 2.2}" fill="#cfd8ff" opacity="${(0.05 + hash(i + 6) * 0.12) * k}"/>`;
  }
  return s;
}
function bubble(x, y, text, t0, t, flip = false, op = 1) {
  if (t < t0) return '';
  const k = ease((t - t0) / 0.18), w = 40 + text.length * 25;
  const bx = flip ? -w + 40 : -40;
  return `<g transform="translate(${x} ${y}) scale(${0.6 + 0.4 * k})" opacity="${k * op}">
    <rect x="${bx}" y="-74" width="${w}" height="86" rx="40" fill="#e9eef5"/>
    <polygon points="${flip ? '10,8 40,8 30,40' : '-10,8 -40,8 -30,40'}" fill="#e9eef5"/>
    <text x="${bx + w / 2}" y="-16" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="44" fill="#141820">${text}</text></g>`;
}
const full = (fill, op = 1) => `<rect width="1080" height="1920" fill="${fill}" opacity="${op}"/>`;
const PHONE = (t, p, sh = 1) => { const j = (noise(t, 3) - 0.5) * 10 * sh; return at(214 + j, 170 + j * 0.6, 1.55, phoneScreen2(p), (noise(t + 9, 1) - 0.5) * 2 * sh); };

// титр в конце серии
function titleCard(t, t0, ep, name) {
  const k = ramp(t, t0, 0.6), gl = pulse(t, t0, 0.3) * 18;
  return full('#000') + `<g opacity="${k}"><text x="${540 + gl}" y="900" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="118" fill="${P.amber}" letter-spacing="4">СТРАННЫЙ</text>
    <text x="${540 - gl}" y="1030" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="118" fill="${P.amber}" letter-spacing="4">СИГНАЛ</text>
    <text x="540" y="1120" text-anchor="middle" font-family="Inter Display" font-weight="700" font-size="44" fill="#9fb0c6">серия ${ep} · «${name}»</text>
    <text x="540" y="1250" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="40" fill="${P.cyan}" opacity="${ramp(t, t0 + 0.8, 0.5)}">продолжение следует…</text></g>`;
}

// субтитры по словам (KEY задаётся в серии)
let KEY = [];
const keyColor = w => { const c = w.replace(/[«»„“"—.,!?:…]/g, ''); for (const [re, col] of KEY) if (re.test(c)) return col; return null; };
const CHUNKS = [];
LINES.forEach(line => {
  let cur = [];
  line.forEach(w => {
    const len = cur.map(x => x.w).join(' ').length + w.w.length;
    if (cur.length && (cur.length >= 3 || len > 19 || /[.?!…»:]$/.test(cur[cur.length - 1].w))) { CHUNKS.push(cur); cur = []; }
    cur.push(w);
  });
  if (cur.length) CHUNKS.push(cur);
});
function subs(t) {
  let ch = null;
  for (let i = 0; i < CHUNKS.length; i++) {
    const c = CHUNKS[i], a = c[0].s - 0.08, nx = CHUNKS[i + 1] ? CHUNKS[i + 1][0].s - 0.08 : 1e9;
    const end = Math.min(nx, c[c.length - 1].e + 0.6);
    if (t >= a && t < end) { ch = c; break; }
  }
  if (!ch) return '';
  const k = ease((t - (ch[0].s - 0.08)) / 0.1);
  const spans = ch.map(w => {
    const txt = w.w.replace(/[«»„“"]/g, '');
    const kc = keyColor(w.w), on = t >= w.s, now = t >= w.s && t < w.e + 0.05;
    return `<tspan fill="${kc || '#ffffff'}" opacity="${on ? 1 : 0.5}" font-size="${now ? 98 : 88}">${txt}</tspan>`;
  }).join('<tspan font-size="88"> </tspan>');
  return `<g opacity="${k}" transform="translate(540 ${1660 + (1 - k) * 18})"><text x="0" y="0" text-anchor="middle" font-family="Inter Display" font-weight="900"
    stroke="#05070d" stroke-width="16" stroke-linejoin="round" paint-order="stroke" letter-spacing="1">${spans}</text></g>`;
}

const EXTRA_DEFS = () => `<defs><radialGradient id="gVig" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".85"/></radialGradient>
  <radialGradient id="gRedVig" cx=".5" cy=".5" r=".75"><stop offset=".45" stop-color="${P.red}" stop-opacity="0"/><stop offset="1" stop-color="${P.red}" stop-opacity=".55"/></radialGradient></defs>`;
const redVig = k => k > 0 ? `<rect width="1080" height="1920" fill="url(#gRedVig)" opacity="${k}"/>` : '';

// сцены: массив [startTime, fn(t,u)]; T_END задаётся в серии
let SCENES = [], T_END = 60, HUD = () => '';
function render(t) {
  let si = 0; while (si < SCENES.length - 1 && t >= SCENES[si + 1][0]) si++;
  const a = SCENES[si][0], b = si < SCENES.length - 1 ? SCENES[si + 1][0] : T_END;
  const u = clamp((t - a) / (b - a));
  const s = SCENES[si][1](t, u);
  const dB = Math.min(...SCENES.slice(1).map(x => Math.abs(t - x[0])));
  const cut = dB < 0.1 ? (1 - dB / 0.1) * 0.85 : 0;
  const flick = noise(t, 14) * 0.07;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">${defs()}${defs2()}${EXTRA_DEFS()}
    <rect width="1080" height="1920" fill="#000"/>${s}<rect width="1080" height="1920" fill="url(#gVig)" opacity=".9"/>${HUD(t)}
    <rect width="1080" height="1920" fill="#000" opacity="${flick + cut}"/>${subs(t)}</svg>`;
}

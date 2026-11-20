// Собирает лист персонажей и фонов: sheet.html -> sheet.png
const fs = require('fs');
const path = require('path');
const A = require('./assets.js');
const { P } = A;

const card = (title, vb, inner, w = 300, h = 300) => `
  <div class="card" style="width:${w}px">
    <svg width="${w}" height="${h}" viewBox="${vb}">${inner}</svg>
    <div class="cap">${title}</div>
  </div>`;

// Сцена 9:16: общий план фермы
const scene1 = `
  ${A.bgFarm(1080, 1920)}
  <g transform="translate(150 1010) scale(.35)">${A.infectedFar()}</g>
  <g transform="translate(200 1012) scale(.3)">${A.infectedFar({ lean: -6 })}</g>
  <g transform="translate(860 1006) scale(.32)">${A.infectedFar({ lean: 5 })}</g>
  <g transform="translate(0 1130)">${A.fence(1080)}</g>
  <g transform="translate(380 1360) scale(.9)">${A.house()}</g>
  <g transform="translate(860 1400) scale(.7)">${A.well()}</g>
  <g transform="translate(540 1640)">${A.gate()}</g>
  <g transform="translate(150 1720) scale(.8)">${A.farmer()}</g>
  <g transform="translate(860 1760) scale(.9)">${A.dog()}</g>
  <g transform="translate(700 1800) scale(.8)">${A.goose()}</g>
  <rect width="1080" height="1920" fill="#000" opacity=".12"/>`;

// Сцена 9:16: у ворот, заражённые ближе
const scene2 = `
  ${A.bgFarm(1080, 1920, { horizon: 900 })}
  ${[120, 260, 420, 700, 900].map((x, i) => `<g transform="translate(${x} ${1000 + i % 2 * 30}) scale(${0.7 + (i % 3) * 0.15})">${A.infectedFar({ lean: (i % 2 ? 4 : -4) })}</g>`).join('')}
  <g transform="translate(0 1280) scale(1)">${A.fence(1080)}</g>
  <g transform="translate(540 1560) scale(1.7)">${A.gate()}</g>
  <g transform="translate(250 1880) scale(1.1)">${A.goose({ honk: true })}</g>
  <g transform="translate(820 1900) scale(1.1)">${A.dog({ bark: true })}</g>
  <rect width="1080" height="1920" fill="#000" opacity=".1"/>`;

// Сцена 9:16: второй этаж изнутри, окно, темнота
const scene3 = `
  <rect width="1080" height="1920" fill="#10141d"/>
  ${Array.from({ length: 22 }, (_, i) => `<rect x="${i * 50}" y="0" width="48" height="1920" fill="${i % 2 ? '#141925' : '#121722'}"/>`).join('')}
  <g>
    <rect x="290" y="420" width="500" height="620" fill="#0a0f1c"/>
    <svg x="290" y="420" width="500" height="620" viewBox="200 500 680 840" preserveAspectRatio="xMidYMid slice">${A.bgFarm(1080, 1920, { horizon: 1100 })}
      <g transform="translate(400 1110) scale(.45)">${A.infectedFar()}</g>
      <g transform="translate(560 1114) scale(.4)">${A.infectedFar({ lean: 5 })}</g></svg>
    <path d="M540 420 V1040 M290 730 H790" stroke="#2b3343" stroke-width="18"/>
    <rect x="270" y="400" width="540" height="660" fill="none" stroke="#2b3343" stroke-width="30"/>
    <rect x="240" y="1060" width="600" height="30" fill="#232a38"/>
  </g>
  <rect x="0" y="1500" width="1080" height="420" fill="#1a1612"/>
  <g transform="translate(330 1640) scale(1.6)">${A.farmer()}</g>
  <rect x="640" y="1460" width="340" height="120" rx="12" fill="#2a3346"/>
  <rect x="660" y="1420" width="120" height="60" rx="20" fill="#cfcabb" opacity=".6"/>
  <rect width="1080" height="1920" fill="url(#vign)"/>
  <defs><radialGradient id="vign" cx=".5" cy=".45" r=".75"><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient></defs>`;

const palette = [
  ['Небо', P.sky1], ['Зарево', P.glow], ['Земля', P.field], ['Дерево', P.wood], ['Стены', P.wall],
  ['Фермер', P.jacket], ['Заражённый', P.zSkin], ['Глаза', P.zEye], ['Гусь', P.goose], ['Акцент', P.accent]
];

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;background:#0b0e15;color:${P.text};font-family:'DejaVu Sans',sans-serif;width:1600px}
  h1{font-size:44px;margin:0;padding:40px 48px 6px;letter-spacing:1px}
  .sub{padding:0 48px 10px;color:#9aa3b5;font-size:20px}
  h2{font-size:26px;margin:30px 48px 14px;color:${P.accent};text-transform:uppercase;letter-spacing:3px}
  .row{display:flex;flex-wrap:wrap;gap:18px;padding:0 48px}
  .card{background:#151b28;border-radius:14px;overflow:hidden;border:1px solid #242c3d}
  .card svg{display:block;background:radial-gradient(circle at 50% 70%,#1d2538,#121722)}
  .cap{padding:10px 14px;font-size:18px;color:#cdd3df}
  .sw{display:flex;gap:12px;padding:0 48px 48px;flex-wrap:wrap}
  .sw div{width:136px;font-size:16px;color:#9aa3b5}
  .sw span{display:block;height:56px;border-radius:10px;margin-bottom:6px;border:1px solid #2a3245}
</style></head><body>
<h1>Ферма. Зомби-апокалипсис — лист персонажей и фонов</h1>
<div class="sub">Плоский 2D, всё нарисовано SVG-кодом · тёмная тревожная палитра · акценты: оранжевое зарево и ядовито-зелёные глаза</div>

<h2>Персонажи</h2>
<div class="row">
  ${card('Фермер — рассказчик', '-120 -350 240 370', A.farmer(), 230, 340)}
  ${card('Фермер — жест рукой', '-120 -350 240 370', A.farmer({ arm: -120 }), 230, 340)}
  ${card('Заражённый', '-80 -330 220 350', A.infected(), 230, 340)}
  ${card('Заражённая (вар. 2)', '-80 -330 220 350', A.infected({ variant: 1 }), 230, 340)}
  ${card('Заражённые вдали (силуэты)', '-60 -120 120 130', A.infectedFar() + `<g transform="translate(-36 0) scale(.7)">${A.infectedFar({ lean: -6 })}</g><g transform="translate(36 0) scale(.8)">${A.infectedFar({ lean: 6 })}</g>`, 230, 340)}
  ${card('Гусь — спокоен', '-80 -140 160 160', A.goose(), 230, 230)}
  ${card('Гусь — кричит', '-80 -140 160 160', A.goose({ honk: true }) + `<path d="M74 -126 l18 -8 M76 -110 h22 M74 -94 l18 8" stroke="${P.accent}" stroke-width="5" stroke-linecap="round"/>`, 230, 230)}
  ${card('Собака — сторож', '-90 -160 200 180', A.dog(), 230, 230)}
  ${card('Собака — лает', '-90 -160 200 180', A.dog({ bark: true }) + `<path d="M104 -124 l18 -8 M106 -108 h22 M104 -92 l18 8" stroke="${P.accent}" stroke-width="5" stroke-linecap="round"/>`, 230, 230)}
  ${card('Скот', '-100 -170 230 190', A.cow(), 230, 230)}
</div>

<h2>Объекты</h2>
<div class="row">
  ${card('Ворота — закрыты', '-190 -230 380 250', A.gate(), 300, 210)}
  ${card('Ворота — открыты', '-190 -230 380 250', A.gate({ open: .8 }), 300, 210)}
  ${card('Колодец', '-130 -280 260 300', A.well(), 230, 260)}
  ${card('Дом — 2 этажа, заколочен', '-320 -660 640 690', A.house(), 300, 320)}
  ${card('Еда и порции', '-170 -130 340 150', A.food(), 300, 160)}
  ${card('Генератор — выключить', '-100 -130 200 150', A.generator({ off: true }), 230, 170)}
  ${card('Забор', '-10 -100 420 110', A.fence(400), 300, 100)}
</div>

<h2>Фоны 9:16</h2>
<div class="row">
  ${card('Общий план: ферма, зарево города', '0 0 1080 1920', scene1, 400, 711)}
  ${card('У ворот: заражённые за забором', '0 0 1080 1920', scene2, 400, 711)}
  ${card('Второй этаж: ночь, без света', '0 0 1080 1920', scene3, 400, 711)}
</div>

<h2>Палитра</h2>
<div class="sw">${palette.map(([n, c]) => `<div><span style="background:${c}"></span>${n}<br>${c}</div>`).join('')}</div>
</body></html>`;

fs.writeFileSync(path.join(__dirname, 'sheet.html'), html);

(async () => {
  const { chromium } = require('playwright');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: Number(process.argv[2] || 1) });
  await p.goto('file://' + path.join(__dirname, 'sheet.html'));
  await p.screenshot({ path: path.join(__dirname, 'sheet.png'), fullPage: true });
  await b.close();
  console.log('ok');
})();

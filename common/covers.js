// Обложки (превью) для Shorts: чистый кадр из ролика (без субтитров) + крупный текст.
// node common/covers.js  → videos/covers/*.png (1080×1920)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'videos/covers');
const R = '#e2463f', A = '#e8a33d', C = '#7fdcff', W = '#ffffff';

// [файл, страница ролика, время кадра, строки текста [[текст, цвет]], подпись серии]
const COVERS = [
  ['komu', 'shorts/komu/anim/page.html', 21.6, [['КОМУ ТЫ', W], ['ОТКРОЕШЬ?', R]], ''],
  ['etazh10-01', 'etazh10/ep01/anim/page.html', 49.2, [['ЛИФТ', W], ['С 10 ЭТАЖА', R]], 'ДЕСЯТЫЙ ЭТАЖ · 1'],
  ['signal-02', 'episode02/anim/page.html', 58.6, [['В СТЕКЛЕ', W], ['НЕ Я', R]], 'СТРАННЫЙ СИГНАЛ · 2'],
  ['signal-03', 'episode03/anim/page.html', 40.4, [['ЗА РУЛЁМ', W], ['СИДЕЛ Я', R]], 'СТРАННЫЙ СИГНАЛ · 3'],
  ['signal-04', 'episode04/anim/page.html', 52.9, [['«КАКОГО', W], ['ТЁМУ?»', R]], 'СТРАННЫЙ СИГНАЛ · 4'],
  ['signal-05', 'episode05/anim/page.html', 22.0, [['ОНИ ЕСТЬ', W], ['ТОЛЬКО', W], ['В ЗЕРКАЛЕ', C]], 'СТРАННЫЙ СИГНАЛ · 5'],
  ['signal-06', 'episode06/anim/page.html', 35.2, [['А КЛЮЧИ', W], ['ВЗЯЛ?', C]], 'СТРАННЫЙ СИГНАЛ · 6'],
];

function overlay(lines, badge) {
  const fs0 = lines.length > 2 ? 150 : 170, y0 = 330;
  let s = `<defs><linearGradient id="cvTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".85"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
    <rect width="1080" height="${y0 + lines.length * fs0 + 160}" fill="url(#cvTop)"/>`;
  lines.forEach(([t, c], i) => s += `<text x="540" y="${y0 + i * fs0 * 1.02}" text-anchor="middle" font-family="Inter Display" font-weight="900" font-size="${Math.min(fs0, Math.floor(960 / (t.length * 0.7)))}"
    fill="${c}" stroke="#05070d" stroke-width="22" stroke-linejoin="round" paint-order="stroke" letter-spacing="2">${t}</text>`);
  if (badge) s += `<g transform="translate(540 ${y0 + lines.length * fs0 * 1.02 + 10})"><rect x="-260" y="-44" width="520" height="66" rx="33" fill="#05070d" opacity=".85" stroke="${A}" stroke-width="3"/>
    <text x="0" y="2" text-anchor="middle" font-family="Inter Display" font-weight="800" font-size="34" fill="${A}" letter-spacing="2">${badge}</text></g>`;
  return s;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  for (const [name, page, t, lines, badge] of COVERS) {
    await p.goto('file://' + path.join(ROOT, page));
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(([t, ov]) => {
      subs = () => '';                       // без субтитров
      document.getElementById('v').innerHTML = render(t).replace(/<\/svg>\s*$/, ov + '</svg>');
    }, [t, overlay(lines, badge)]);
    await p.screenshot({ path: path.join(OUT, name + '.png') });
    console.log('ok', name);
  }
  await b.close();
})();

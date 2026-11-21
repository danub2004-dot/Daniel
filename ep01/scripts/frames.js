// Снимает отдельные кадры для проверки: node frames.js out.png t1 t2 ...
const { chromium } = require('playwright');
(async () => { const [,, out, ...ts] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs=[]; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type()==='error') errs.push(m.text()); });
  await p.goto('file://' + __dirname + '/../art/anim.html'); await p.waitForTimeout(300);
  for (const t of ts) { await p.evaluate(t => render(+t), t); await p.screenshot({ path: out.replace('%', t) }); }
  if (errs.length) console.log('ERR', errs.slice(0,5)); await b.close(); })();

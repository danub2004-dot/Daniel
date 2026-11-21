const { chromium } = require('playwright');
(async () => { const [,, url, out, w] = process.argv; const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w || 2400, height: 1000 } });
  await p.goto('file://' + url); await p.waitForTimeout(500); await p.screenshot({ path: out, fullPage: true }); await b.close(); })();

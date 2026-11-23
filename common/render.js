// node render.js page.html out.mp4 [from] [to]  |  node render.js page.html --stills dir t1 t2 ...
// или: node render.js --stills dir t1 t2 ...
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const args = process.argv.slice(2); const PAGE = path.resolve(args.shift());
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('console', m.text()); });
  await p.goto('file://' + PAGE);
  await p.evaluate(() => document.fonts.ready);
  if (args[0] === '--stills') {
    for (const t of args.slice(2)) { await p.evaluate(t => draw(t), +t); await p.screenshot({ path: `${args[1]}/f_${(+t).toFixed(2)}.jpg`, type: 'jpeg', quality: 85 }); }
    await b.close(); return;
  }
  const [out, from = 0, to] = args;
  const T_END = await p.evaluate(() => T_END), fps = 30;
  const t1 = to ? +to : T_END, n = Math.round((t1 - +from) * fps);
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const st = Date.now();
  for (let i = 0; i < n; i++) {
    const t = +from + i / fps;
    await p.evaluate(t => draw(t), t);
    const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (i % 150 === 0) console.log(`frame ${i}/${n} t=${t.toFixed(1)} ${((Date.now() - st) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('done', ((Date.now() - st) / 1000).toFixed(0) + 's');
})();

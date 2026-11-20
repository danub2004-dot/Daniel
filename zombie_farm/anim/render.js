// node render.js stills 3,10,20      -> кадры-превью в frames/
// node render.js video out.mp4 [fps] -> немое видео (кадры в ffmpeg через pipe)
const fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const { chromium } = require('playwright');
const D = __dirname;
fs.writeFileSync(path.join(D, 'timeline.js'), 'window.TL=' + fs.readFileSync(path.join(D, '..', 'timeline.json'), 'utf8'));
(async () => {
  const [mode, arg, fpsArg] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  await p.goto('file://' + path.join(D, 'anim.html'));
  await p.evaluate(() => document.fonts.ready);
  const total = await p.evaluate(() => window.TOTAL);
  const el = await p.$('#stage');
  if (mode === 'stills') {
    fs.mkdirSync(path.join(D, 'frames'), { recursive: true });
    for (const t of arg.split(',').map(Number)) {
      await p.evaluate((t) => render(t), t);
      await el.screenshot({ path: path.join(D, 'frames', `t${String(t.toFixed(2)).padStart(6, '0')}.jpg`), type: 'jpeg', quality: 80 });
    }
    console.log('total', total.toFixed(2));
  } else {
    const fps = Number(fpsArg || 30), n = Math.ceil(total * fps);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps), arg], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      await p.evaluate((t) => render(t), i / fps);
      const buf = await el.screenshot({ type: 'jpeg', quality: 92 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`кадр ${i}/${n}  ${((Date.now() - t0) / 1000).toFixed(0)} c`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    console.log('готово', arg, total.toFixed(2), 'c');
  }
  await b.close();
})();

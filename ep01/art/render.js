// node render.js <worker> <workers> <outdir>  — рендер кадров в mp4-сегмент
const { chromium } = require('playwright'); const { spawn } = require('child_process');
(async () => {
  const [wi, wn, out] = process.argv.slice(2).map((x, i) => i < 2 ? +x : x);
  const FPS = 30, b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + __dirname + '/anim.html'); await p.evaluate(() => document.fonts.ready);
  const total = Math.round(await p.evaluate(() => DURATION) * FPS), per = Math.ceil(total / wn);
  const f0 = wi * per, f1 = Math.min(total, f0 + per);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', '30', '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', `${out}/seg${wi}.mp4`], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let f = f0; f < f1; f++) {
    await p.evaluate(t => render(t), f / FPS);
    const buf = await p.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`w${wi} ${f}/${f1}`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log(`w${wi} done`);
})();

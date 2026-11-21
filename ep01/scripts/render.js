// Рендер кадров анимации в видео (без звука). node render.js out.mp4 [workers] [from] [to]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs');
const FPS = 30;
(async () => {
  const out = process.argv[2], N = +process.argv[3] || 4;
  const b = await chromium.launch();
  const p0 = await b.newPage(); await p0.goto('file://' + __dirname + '/../art/anim.html'); const dur = await p0.evaluate(() => DURATION); await p0.close();
  const from = +(process.argv[4] || 0), to = +(process.argv[5] || dur);
  const total = Math.round((to - from) * FPS), per = Math.ceil(total / N); const parts = [];
  await Promise.all([...Array(N)].map(async (_, k) => {
    const a = k * per, e = Math.min(total, a + per); if (a >= e) return; const part = `${out}.part${k}.mp4`; parts[k] = part;
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', part]);
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); await p.goto('file://' + __dirname + '/../art/anim.html'); await p.waitForTimeout(300);
    for (let i = a; i < e; i++) {
      await p.evaluate((t) => render(t), from + i / FPS);
      const buf = await p.screenshot({ type: 'jpeg', quality: 93 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (k === 0 && i % 60 === 0) console.log(`кадр ${i}/${e}`);
    }
    ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await p.close();
  }));
  await b.close();
  fs.writeFileSync(out + '.list', parts.filter(Boolean).map((p) => `file '${p}'`).join('\n'));
  await new Promise((r) => spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', out + '.list', '-c', 'copy', out], { stdio: 'inherit' }).on('close', r));
  parts.filter(Boolean).forEach((p) => fs.unlinkSync(p)); fs.unlinkSync(out + '.list'); console.log('готово', out);
})();

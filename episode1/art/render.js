// node render.js <outdir> [workers] [step] [t0] [t1]  — рендер кадров 30 fps в JPEG
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const out=process.argv[2]||'frames', N=+(process.argv[3]||4), step=+(process.argv[4]||1);
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const b=await chromium.launch();
  const page0=await b.newPage();await page0.goto('file://'+path.resolve(__dirname,'anim.html'));
  const dur=await page0.evaluate(()=>DURATION);await page0.close();
  const t0=+(process.argv[5]||0), t1=+(process.argv[6]||dur);
  const frames=[];for(let i=Math.round(t0*30);i<Math.round(t1*30);i+=step)frames.push(i);
  console.log('duration',dur,'frames',frames.length);
  let done=0;const st=Date.now();
  await Promise.all([...Array(N)].map(async(_,w)=>{
    const p=await b.newPage({viewport:{width:1080,height:1920}});
    p.on('pageerror',e=>console.log('ERR',e.message));
    await p.goto('file://'+path.resolve(__dirname,'anim.html'));
    for(let k=w;k<frames.length;k+=N){const i=frames[k];
      await p.evaluate(t=>renderFrame(t),i/30);
      await p.screenshot({path:path.join(out,`f${String(i).padStart(5,'0')}.jpg`),type:'jpeg',quality:92});
      if(++done%150==0)console.log(done,'frames',((Date.now()-st)/1000).toFixed(0)+'s');}
  }));
  await b.close();console.log('done',((Date.now()-st)/1000).toFixed(0)+'s');
})();

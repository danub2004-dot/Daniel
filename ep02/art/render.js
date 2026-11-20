// node render.js out_dir fps workers
const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
(async()=>{const [,,out,fpsS,wS]=process.argv;const fps=+fpsS||30,NW=+wS||4;
const b=await chromium.launch();
const page0=await b.newPage();await page0.goto('file://'+path.resolve('anim.html'));
const END=await page0.evaluate(()=>EP.END);await page0.close();
const N=Math.round(END*fps),per=Math.ceil(N/NW);
await Promise.all([...Array(NW)].map(async(_,k)=>{
 const a=k*per,e=Math.min(N,a+per);
 const ff=spawn('ffmpeg',['-v','error','-y','-f','image2pipe','-framerate',String(fps),'-i','-','-c:v','libx264','-preset','medium','-crf','17','-pix_fmt','yuv420p',`${out}/seg${k}.mp4`],{stdio:['pipe','inherit','inherit']});
 const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+path.resolve('anim.html'));
 for(let f=a;f<e;f++){await p.evaluate(t=>draw(t),f/fps);const buf=await p.screenshot({type:'jpeg',quality:95});
  if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));if((f-a)%300==0)console.log('w'+k,f,'/',e);}
 ff.stdin.end();await new Promise(r=>ff.on('close',r));}));
await b.close();})();

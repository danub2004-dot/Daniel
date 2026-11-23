const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>console.log('LOG',m.text()));
await p.goto('file://'+require('path').resolve('anim.html'));
const ts=process.argv[2].split(',').map(Number);
for(const t of ts){const t0=Date.now();await p.evaluate(t=>draw(t),t);await p.screenshot({path:`/tmp/claude-0/f_${t}.jpg`,type:'jpeg',quality:80});console.log(t,Date.now()-t0,'ms');}
await b.close();})();

const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const [,,html,out,scale]=process.argv;
const p=await b.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:+(scale||1)});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+require('path').resolve(html));await p.waitForTimeout(300);
await p.screenshot({path:out});await b.close();})();

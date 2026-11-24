// Build: bakes the rendered Romanian text into static HTML for SEO -> dist/
// Run from leo-site/:  node build.mjs   (needs Playwright + python3)
import {spawn} from "node:child_process";
import fs from "node:fs";import path from "node:path";import {createRequire} from "node:module";
const require=createRequire(import.meta.url);const {chromium}=require("playwright");
const root=path.dirname(new URL(import.meta.url).pathname),dist=path.join(root,"dist");
const srv=spawn("python3",["-m","http.server","8799","--bind","127.0.0.1"],{cwd:root,stdio:"ignore"});
await new Promise(r=>setTimeout(r,800));
try{
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:"reduce"});
  const p=await ctx.newPage();
  await p.goto("http://127.0.0.1:8799/index.html?lang=ro",{waitUntil:"networkidle"});
  await p.waitForTimeout(1500);
  const html=await p.evaluate(async()=>{
    const src=await (await fetch("/index.html",{cache:"no-store"})).text();
    const d=new DOMParser().parseFromString(src,"text/html");
    const live=[...document.querySelectorAll("[data-i]")],stat=[...d.querySelectorAll("[data-i]")];
    if(live.length!==stat.length)throw new Error("data-i mismatch");
    stat.forEach((el,i)=>{el.textContent=live[i].textContent});
    for(const id of ["stmt","vals","svlist","hz","team","vlist","vamts","rv1","rv2","faqL","quiz","mq1","mq2","ringTxt","h1sr"]){
      const a=document.getElementById(id),z=d.getElementById(id);if(a&&z)z.innerHTML=a.innerHTML}
    return "<!doctype html>\n"+d.documentElement.outerHTML;
  });
  await b.close();
  fs.rmSync(dist,{recursive:true,force:true});fs.mkdirSync(dist);
  fs.writeFileSync(path.join(dist,"index.html"),html);
  for(const f of ["robots.txt","sitemap.xml","site.webmanifest","og.jpg","favicon-32.png","icon-192.png","icon-512.png","apple-touch-icon.png","404.html"])
    if(fs.existsSync(path.join(root,f)))fs.copyFileSync(path.join(root,f),path.join(dist,f));
  fs.cpSync(path.join(root,"img"),path.join(dist,"img"),{recursive:true});
  const docs=path.join(root,"..","docs");fs.rmSync(docs,{recursive:true,force:true});fs.cpSync(dist,docs,{recursive:true});fs.writeFileSync(path.join(docs,".nojekyll"),"");
  console.log("dist + docs ready:",fs.readdirSync(dist).join(", "));
}finally{srv.kill()}

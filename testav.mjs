import {chromium} from 'playwright';const w=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:4317/?t='+Date.now());await w(2000);await p.click('#mskip').catch(()=>{});await p.waitForFunction(()=>window.__v17&&window.__v17.listo(),null,{timeout:120000});await w(5000);
await p.screenshot({path:'capturas/v17d/cel-apilada.png'});
await p.evaluate(()=>window.__v17.vista('piso',0));await w(40000);await p.screenshot({path:'capturas/v17d/cel-piso-pb.png'});
console.log(await p.evaluate(()=>[...document.querySelectorAll('.v17pin')].map(e=>e.textContent.trim().slice(0,20)).join(' | ')));
// tap a label
const r=await p.evaluate(()=>{const e=[...document.querySelectorAll('.v17pin')].find(x=>x.getClientRects().length&&getComputedStyle(x).opacity>0);const q=e.getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]});
await p.touchscreen.tap(r[0],r[1]);await w(8000);console.log('ficha',await p.evaluate(()=>document.getElementById('ficha').style.display));await p.screenshot({path:'capturas/v17d/cel-tap-etiqueta.png'});
console.log(errs);await b.close();

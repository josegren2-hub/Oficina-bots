import {chromium} from 'playwright';const w=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const c=await b.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true,deviceScaleFactor:1,recordVideo:{dir:'capturas/v17d/vid',size:{width:412,height:915}}});
const p=await c.newPage();await p.goto('http://localhost:4317/');await w(1500);await p.click('#mskip').catch(()=>{});await p.waitForFunction(()=>window.__v17&&window.__v17.listo(),null,{timeout:120000});await w(6000);
const top=i=>p.evaluate(i=>[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().top<70)[i]?.click(),i);
await top(0);await w(2500);await top(1);await w(2500);await top(2);await w(2500);await p.goBack();await w(2500);
const r=await p.evaluate(()=>{const e=[...document.querySelectorAll('.v17pin')].find(x=>x.getClientRects().length&&getComputedStyle(x).opacity>0);if(!e)return null;const q=e.getBoundingClientRect();return [q.x+q.width/2,q.y+q.height/2]});
if(r){await p.touchscreen.tap(r[0],r[1]);await w(9000);await p.goBack();await w(2000);}
await p.evaluate(()=>window.__v17.vista('piso',4));await w(9000);
const xy=await p.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.style&&/piz/i.test(x.className+x.id)&&/px/.test(x.style.transform));return e.style.transform.match(/translate\(([-\d.]+)px, ?([-\d.]+)px/).slice(1).map(Number)});
await p.touchscreen.tap(xy[0],xy[1]);await w(4000);await p.goBack();await w(1500);await p.goBack();await w(6000);
await p.goBack();await w(2000);console.log('url',p.url());
await c.close();await b.close();

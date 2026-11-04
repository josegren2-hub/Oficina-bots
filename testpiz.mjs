import {chromium} from 'playwright';const w=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true});const p=await c.newPage();
await p.goto('http://localhost:4317/?t='+Date.now());await w(2000);await p.click('#mskip').catch(()=>{});await p.waitForFunction(()=>window.__v17&&window.__v17.listo(),null,{timeout:120000});await w(5000);
await p.evaluate(()=>window.__v17.vista('piso',4));await w(9000);
const xy=await p.evaluate(()=>{const e=[...document.querySelectorAll('*')].find(x=>x.style&&x.style.transform&&/translate\(.*px.*\) translate\(-50%/.test(x.style.transform)&&/piz/i.test(x.className+x.id));return e&&e.style.transform});console.log(xy);
const m=xy.match(/translate\(([-\d.]+)px, ?([-\d.]+)px/);const x=+m[1],y=+m[2];
await p.screenshot({path:'capturas/v17d/t-piz-antes.png'});
for(const [dx,dy] of [[0,0],[0,15],[0,-15],[15,0]]){await p.touchscreen.tap(x+dx,y+dy);await w(1500);const o=await p.evaluate(()=>!document.getElementById('v17pizarron').hidden);console.log('tap',x+dx,y+dy,o);if(o)break;}
await p.screenshot({path:'capturas/v17d/t-piz.png'});await b.close();

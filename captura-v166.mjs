import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});await c.addInitScript(()=>localStorage.setItem('oficinaModo','dia'));
const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('http://localhost:4173/');await p.waitForTimeout(2000);await p.click('#mskip').catch(()=>{});await p.waitForTimeout(30000);
await p.screenshot({path:'capturas/v16-6/escritorio.png'});
const l=await p.locator('#lista').boundingBox();const r=await p.locator('#resumen').boundingBox();
await p.screenshot({path:'capturas/v16-6/lista-avatares.png',clip:{x:l.x,y:Math.min(l.y,r.y),width:r.x+r.width-l.x,height:Math.min(900,Math.max(l.y+l.height,r.y+r.height))-Math.min(l.y,r.y)}});
console.log(await p.$$eval('#lista .f b',a=>a.map(x=>x.textContent).join(' | ')));await b.close();

import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const c=await b.newContext({viewport:{width:1400,height:900},serviceWorkers:'block'});const p=await c.newPage();
await p.goto('http://localhost:4173/');await p.waitForSelector('#mskip',{timeout:20000}).then(e=>e.click()).catch(()=>{});
await p.waitForTimeout(25000);
{const r=await p.locator('#resumen').boundingBox().catch(()=>null)||await p.locator('#lista').boundingBox();const l=await p.locator('#lista').boundingBox();const x=Math.min(r.x,l.x),y=Math.min(r.y,l.y);await p.screenshot({path:'capturas/v16-3/lista-avatares.png',clip:{x,y,width:Math.max(r.x+r.width,l.x+l.width)-x,height:Math.min(900,Math.max(r.y+r.height,l.y+l.height))-y}});}
await p.evaluate(()=>document.querySelector('#lista .f[data-id="libro"]')?.click());await p.waitForTimeout(1500);
p.locator('#ficha').boundingBox().then(r=>p.screenshot({path:'capturas/v16-3/ficha-rodrigo.png',clip:r})).catch(e=>console.log(e.message));
await b.close();

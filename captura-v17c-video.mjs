import {chromium} from 'playwright';const w=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const c=await b.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true,deviceScaleFactor:1,recordVideo:{dir:'capturas/v17c/vid',size:{width:412,height:915}}});
const p=await c.newPage();await p.goto('http://localhost:4317/');await w(1500);await p.click('#mskip').catch(()=>{});await p.waitForFunction(()=>window.__v17&&window.__v17.listo(),null,{timeout:120000});await w(8000);
const id=await p.evaluate(()=>document.querySelector('.v17pin')?.dataset.id);
await p.click(`.v17pin[data-id="${id}"]`).catch(()=>{});await w(7000);await p.keyboard.press('Escape');await w(1000);
await p.click('#v17nav [data-v="fachada"]').catch(()=>{});await w(9000);await p.click('#v17nav [data-v="apilada"]').catch(()=>{});await w(9000);
await c.close();await b.close();

import {chromium} from 'playwright';import fs from 'fs';
const pw=(process.env.MANDO_CLAVE||fs.readFileSync('.clave-mando','utf8')).trim();
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
for(const [n,vp,mob] of [['dia',{width:1440,height:900},0],['movil',{width:390,height:844},1]]){
const c=await b.newContext({viewport:vp,isMobile:!!mob,hasTouch:!!mob,serviceWorkers:'block'});await c.addInitScript(()=>localStorage.setItem('oficinaModo','dia'));
const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('http://localhost:4173/');await p.waitForTimeout(2000);
await p.fill('#mpw',pw);await p.click('#mform button[type=submit]');await p.waitForTimeout(35000);
await p.screenshot({path:`capturas/v16-9/${n}.png`});
console.log(n,JSON.stringify(await p.evaluate(()=>window.__conteos())));
if(!mob){await p.evaluate(()=>window.__volar(11,7,14));await p.waitForTimeout(4000);await p.screenshot({path:'capturas/v16-9/cafe.png'});
 for(const id of ['ted','ines','rulo']){await p.evaluate(i=>{document.querySelector(`.pin[data-id="${i}"]`)?.click()},id);await p.waitForTimeout(800);await p.screenshot({path:`capturas/v16-9/ficha-${id}.png`});
  console.log(id,(await p.locator('#ficha').innerText()).slice(0,260).replace(/\n/g,' | '));}}
await c.close();}
await b.close();

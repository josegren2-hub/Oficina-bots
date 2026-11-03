import {chromium} from 'playwright';import fs from 'fs';
const pw=(process.env.MANDO_CLAVE||fs.readFileSync('.clave-mando','utf8')).trim();
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
for(const [n,vp,mob] of [['movil',{width:390,height:844},1],['escritorio',{width:1440,height:900},0]]){
const c=await b.newContext({viewport:vp,isMobile:!!mob,hasTouch:!!mob});await c.addInitScript(()=>localStorage.setItem('oficinaModo','dia'));
const p=await c.newPage();p.on('pageerror',e=>console.log('ERR',e.message));await p.goto('http://localhost:4173/');await p.waitForTimeout(2000);
await p.getByText('Solo ver estados').click();await p.waitForTimeout(25000);
console.log(n,'sw',await p.evaluate(async()=>{const r=await navigator.serviceWorker.getRegistration();return !!(r&&r.active)}));
const pos=()=>p.evaluate(()=>Object.fromEntries(window.__pos().map(([k,x,z,w])=>[k,x+','+z+(w?' caminando':'')])));
console.log(JSON.stringify(await p.evaluate(()=>window.__pos().slice(0,4).concat([[...document.querySelectorAll('.pin')].length]))));const a=await pos();await p.screenshot({path:`capturas/v16-12/${n}-1.png`});await p.waitForTimeout(10000);const bb=await pos();await p.screenshot({path:`capturas/v16-12/${n}-2.png`});
console.log(n,'movidos',Object.keys(a).filter(k=>a[k]!==bb[k]).map(k=>k+':'+a[k]+'->'+bb[k]).join(' | '));
if(mob){await p.evaluate(()=>document.getElementById('avisoNueva').hidden=false);await p.screenshot({path:'capturas/v16-12/movil-aviso.png'});}
await c.close();}
await b.close();

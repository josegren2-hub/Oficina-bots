import {chromium} from 'playwright';import fs from 'fs';
const pw=(process.env.MANDO_CLAVE||fs.readFileSync('.clave-mando','utf8')).trim();const U=process.env.URL||'http://localhost:4173/';const D='capturas/v16-13/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
for(const [n,vp,mob] of [['movil',{width:390,height:844},1],['escritorio',{width:1440,height:900},0]]){
for(const clave of [0,1]){const tag=n+(clave?'-clave':'-sinclave');
const c=await b.newContext({viewport:vp,isMobile:!!mob,hasTouch:!!mob});await c.addInitScript(()=>localStorage.setItem('oficinaModo','dia'));
const p=await c.newPage();p.on('pageerror',e=>errs.push(tag+' pageerror '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(tag+' console '+m.text())});
await p.goto(U);await p.waitForTimeout(2000);
if(clave){await p.fill('#mpw',pw);await p.click('#mform button[type=submit]');}else await p.getByText('Solo ver estados').click();
await p.waitForFunction(()=>window.__pos&&window.__pos().length>5,null,{timeout:90000});await p.waitForTimeout(15000);
const pos=()=>p.evaluate(()=>Object.fromEntries(window.__pos().map(([k,x,z])=>[k,x+','+z])));
const a=await pos();await p.screenshot({path:D+tag+'-1.png'});await p.waitForTimeout(10000);const bb=await pos();await p.screenshot({path:D+tag+'-2.png'});
console.log(tag,'movidos',Object.keys(a).filter(k=>a[k]!==bb[k]).length,'/',Object.keys(a).length);
console.log(tag,'barra',await p.evaluate(()=>document.querySelector('#v13bar').innerText.replace(/\s+/g,' ')),'orden',JSON.stringify(await p.evaluate(()=>window.__v13.esperan().map(b=>b.id+'@'+b.esperando_desde))));
await p.click('#v13bar .v13te');await p.waitForTimeout(500);await p.screenshot({path:D+tag+'-te-esperan.png'});
const id=await p.evaluate(()=>window.__v13.esperan()[0]?.id||'ted');await p.click(`#v13lista .f[data-id="${id}"]`).catch(()=>p.evaluate(i=>window.__abrirFicha(i),id));await p.waitForTimeout(800);
console.log(tag,'ficha',id,await p.evaluate(()=>{const f=document.getElementById('ficha');return f.style.display+' | '+(f.querySelector('.v13f')?.innerText.replace(/\s+/g,' '))+' | link '+(f.querySelector('.v13f a.mir')?.getAttribute('href')||'ninguno')}));
await p.screenshot({path:D+tag+'-tarjeta.png'});await p.evaluate(()=>document.getElementById('ficha').style.display='none');
await p.click('#v13bar .v13res');await p.waitForTimeout(500);await p.screenshot({path:D+tag+'-resumen.png'});
console.log(tag,'resumen',(await p.evaluate(()=>document.getElementById('v13tab').innerText)).replace(/\s+/g,' ').slice(0,700));
await c.close();}}
console.log('ERRORES',errs.length?errs:'ninguno');await b.close();

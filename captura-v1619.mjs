import {chromium} from 'playwright';import fs from 'fs';
const pw=(process.env.MANDO_CLAVE||fs.readFileSync('.clave-mando','utf8')).trim();const U=process.env.URL||'https://josegren2-hub.github.io/Oficina-bots/';const D='capturas/v16-20/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];const vp={width:390,height:844};
const nuevo=async(t)=>{const c=await b.newContext({viewport:vp,isMobile:true,hasTouch:true});const p=await c.newPage();p.on('pageerror',e=>errs.push(t+' '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(t+' console '+m.text())});return [c,p];};
const ah=p=>p.evaluate(()=>[...document.querySelectorAll('.ahora')].filter(d=>!d.hidden).map(d=>d.dataset.a+': '+d.textContent));
// sin clave (3D)
let [c,p]=await nuevo('3d-sin');await p.goto(U+'?t='+Date.now());await p.waitForTimeout(1500);await p.click('#mskip').catch(()=>{});
await p.waitForFunction(()=>window.__pos&&window.__pos().length>5,null,{timeout:90000});await p.waitForTimeout(3000);
for(const id of ['ted']){await p.evaluate(i=>window.__abrirFicha(i),id);await p.waitForTimeout(400);await p.screenshot({path:D+'sin-clave-ficha-'+id+'.png'});}
console.log('SIN CLAVE .ahora en DOM:',await p.evaluate(()=>document.querySelectorAll('.ahora').length),'tareas.enc pedido?');await c.close();
// con clave (3D)
[c,p]=await nuevo('3d-clave');const rq=[];p.on('request',q=>rq.push(q.url()));await p.goto(U+'?t='+Date.now());await p.waitForTimeout(1500);await p.fill('#mpw',pw);await p.click('#mform button[type=submit]');
await p.waitForFunction(()=>window.__pos&&window.__pos().length>5&&document.body.classList.contains('mando'),null,{timeout:90000});await p.waitForTimeout(4000);
console.log('version',await p.evaluate(()=>caches.keys()));
for(const id of ['ted']){await p.evaluate(i=>window.__abrirFicha(i),id);await p.waitForTimeout(500);await p.screenshot({path:D+'clave-ficha-'+id+'.png'});console.log('CLAVE ficha',id,(await p.evaluate(()=>document.getElementById('ficha').innerText)).replace(/\s+/g,' ').slice(0,400));}
await p.evaluate(()=>{document.getElementById('ficha').style.display='none';window.__abrirListaEstado('trabajando')});await p.waitForTimeout(400);await p.screenshot({path:D+'clave-lista-trabajando.png'});console.log('CLAVE lista trabajando',await ah(p));
console.log('tareas.enc pedido con clave:',rq.some(u=>u.includes('tareas.enc')));await c.close();
// Solo lista con clave y sin clave
[c,p]=await nuevo('lista-clave');await p.goto(U+'?abrir=lista&t='+Date.now());await p.waitForTimeout(1500);await p.fill('#mpw',pw);await p.click('#mform button[type=submit]');await p.waitForTimeout(4000);
await p.screenshot({path:D+'solo-lista-clave.png',fullPage:true});console.log('SOLO LISTA clave',await ah(p));
await p.evaluate(()=>window.__abrirFicha('tadeo'));await p.waitForTimeout(400);await p.screenshot({path:D+'solo-lista-clave-ficha-tadeo.png'});await c.close();
[c,p]=await nuevo('lista-sin');const rq2=[];p.on('request',q=>rq2.push(q.url()));await p.goto(U+'?abrir=lista&t='+Date.now());await p.waitForTimeout(1500);await p.click('#mskip').catch(()=>{});await p.waitForTimeout(3000);
await p.screenshot({path:D+'solo-lista-sin-clave.png',fullPage:true});console.log('SOLO LISTA sin clave .ahora:',await p.evaluate(()=>document.querySelectorAll('.ahora').length),'tareas.enc pedido:',rq2.some(u=>u.includes('tareas.enc')));await c.close();
console.log('ERRORES',errs.length?errs:'ninguno');await b.close();

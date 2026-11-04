import {chromium} from 'playwright';import fs from 'fs';
const pw=(process.env.MANDO_CLAVE||fs.readFileSync('.clave-mando','utf8')).trim();const U=process.env.URL||'http://127.0.0.1:4181/';const D='capturas/v16-16/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
const log=(...a)=>console.log(...a);
for(const [n,vp,mob] of [['movil',{width:390,height:844},1],['escritorio',{width:1440,height:900},0]]){
 // 1) 3D sin clave
 let c=await b.newContext({viewport:vp,isMobile:!!mob,hasTouch:!!mob});let p=await c.newPage();const js=[];
 p.on('pageerror',e=>errs.push(n+' '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(n+' console '+m.text())});
 await p.goto(U+'?t='+Date.now());await p.waitForTimeout(1200);await p.click('#mskip').catch(()=>{});
 await p.waitForFunction(()=>window.__pos&&window.__pos().length>5,null,{timeout:90000});await p.waitForTimeout(5000);
 const a=await p.evaluate(()=>window.__pos().map(x=>x[1]+x[2]).join());await p.waitForTimeout(6000);const a2=await p.evaluate(()=>window.__pos().map(x=>x[1]+x[2]).join());
 log(n,'3D sin clave: caminan',a!==a2,'luz',JSON.stringify(await p.evaluate(()=>window.__luz())),'salud',await p.evaluate(()=>document.getElementById('v16salud').className),'racha',await p.evaluate(()=>document.getElementById('v16racha').title));
 await p.screenshot({path:D+n+'-3d-sin-clave.png'});
 await p.click('#v16salud');await p.waitForTimeout(300);await p.screenshot({path:D+n+'-salud.png'});log(n,'salud texto',(await p.evaluate(()=>document.getElementById('v16pop').innerText)).replace(/\s+/g,' '));
 await p.click('#v16pop .lcerrar');
 await p.click('#v13bar .v13res');await p.waitForTimeout(300);await p.evaluate(()=>{const h=[...document.querySelectorAll('#v13tab h4')].find(x=>x.textContent.includes('Línea'));h&&h.scrollIntoView()});await p.screenshot({path:D+n+'-linea-sin-clave.png'});
 log(n,'linea sin clave',await p.evaluate(()=>[...document.querySelectorAll('#v13tab h4')].find(x=>x.textContent.includes('Línea'))?.nextElementSibling?.innerText));
 await c.close();
 // 2) 3D con clave
 c=await b.newContext({viewport:vp,isMobile:!!mob,hasTouch:!!mob});p=await c.newPage();
 p.on('pageerror',e=>errs.push(n+' clave '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(n+' clave console '+m.text())});
 await c.grantPermissions(['clipboard-read','clipboard-write']).catch(()=>{});
 await p.goto(U+'?t='+Date.now());await p.waitForTimeout(1200);await p.fill('#mpw',pw);await p.click('#mform button[type=submit]');
 await p.waitForFunction(()=>window.__pos&&window.__pos().length>5&&document.body.classList.contains('mando'),null,{timeout:90000});await p.waitForTimeout(4000);
 await p.evaluate(()=>window.__abrirEnlace=h=>{window.__abierto=h;});
 await p.click('#v13bar .v13te');await p.waitForTimeout(400);await p.screenshot({path:D+n+'-te-esperan-rapidas.png'});
 log(n,'botones rapidos en Te esperan',await p.evaluate(()=>document.querySelectorAll('#v13lista .v16r').length));
 const r=await p.$('#v13lista .v16r');if(r){await r.click();await p.waitForTimeout(300);await p.screenshot({path:D+n+'-toast.png'});await p.waitForTimeout(3000);
  log(n,'copiado',await p.evaluate(()=>window.__ultimoCopiado),'toast',await p.evaluate(()=>document.getElementById('mtoast')?.textContent),'abre',await p.evaluate(()=>window.__abierto));}
 const id=await p.evaluate(()=>window.__v13.esperan()[0]?.id);if(id){await p.evaluate(i=>window.__abrirFicha(i),id);await p.waitForTimeout(500);await p.screenshot({path:D+n+'-ficha-rapidas.png'});log(n,'ficha',id,'botones',await p.evaluate(()=>document.querySelectorAll('#ficha .v16r').length));await p.evaluate(()=>document.getElementById('ficha').style.display='none');}
 await p.evaluate(()=>{document.getElementById('v13lista').hidden=true;window.__v13.abrirResumen();});await p.waitForTimeout(300);
 await p.evaluate(()=>{const h=[...document.querySelectorAll('#v13tab h4')].find(x=>x.textContent.includes('Línea'));h&&h.scrollIntoView()});await p.screenshot({path:D+n+'-linea-con-clave.png'});
 log(n,'filas linea',await p.evaluate(()=>document.querySelectorAll('#v13tab .v16tl').length),'racha',await p.evaluate(()=>document.querySelector('#v13tab .v16racha')?.textContent));
 await p.evaluate(()=>document.getElementById('v13tab').hidden=true);
 if(n==='escritorio'){const PU=JSON.parse(process.env.PU||'{}');for(const [id,[x,z,w]] of Object.entries(PU)){await p.evaluate(([x,z])=>window.__volar2(x,.8,z,2.2,0,.8,.6),[x-w/2+.24,z-.12]);await p.waitForTimeout(1800);await p.screenshot({path:D+'objeto-'+id+'.png'});}}
 await c.close();
 // 3) Solo lista
 c=await b.newContext({viewport:vp,isMobile:!!mob,hasTouch:!!mob});p=await c.newPage();const req=[];
 p.on('pageerror',e=>errs.push(n+' lista '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(n+' lista console '+m.text())});p.on('request',q=>req.push(q.url()));
 await p.goto(U+'?abrir=lista&t='+Date.now());await p.waitForTimeout(1200);await p.screenshot({path:D+n+'-lista-candado.png'});await p.fill('#mpw',pw);await p.click('#mform button[type=submit]');
 await p.waitForFunction(()=>document.querySelectorAll('#l16 .f').length>5,null,{timeout:30000});await p.waitForTimeout(1500);
 await p.screenshot({path:D+n+'-lista.png',fullPage:true});
 log(n,'lista filas',await p.evaluate(()=>document.querySelectorAll('#l16 .f').length),'three cargado',req.some(u=>/main-.*\.js|hdri|modelos|\.glb/.test(u)),'pref',await p.evaluate(()=>localStorage.oficinaVista),'rapidas',await p.evaluate(()=>document.querySelectorAll('#l16 .v16r').length));
 await p.click('#l16 .f');await p.waitForTimeout(400);await p.screenshot({path:D+n+'-lista-ficha.png'});
 await p.evaluate(()=>document.getElementById('ficha').style.display='none');
 await p.goto(U+'?t='+Date.now());await p.waitForTimeout(1500);log(n,'recuerda lista',await p.evaluate(()=>!!document.getElementById('l16')));
 await p.click('#v16vista');await p.waitForTimeout(1500);await p.waitForFunction(()=>window.__pos&&window.__pos().length>5,null,{timeout:90000});log(n,'vuelta a 3D ok',await p.evaluate(()=>localStorage.oficinaVista));
 await c.close();}
// luz por hora (escritorio, horas simuladas)
for(const [h,lbl] of [[8,'manana'],[17.8,'tarde']]){const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();
 await p.addInitScript(hh=>{const R=Date;const off=(()=>{const n=new R();const p=new Intl.DateTimeFormat('en-US',{timeZone:'America/Chihuahua',hour:'numeric',minute:'numeric',hourCycle:'h23'}).formatToParts(n);const g=t=>+p.find(x=>x.type===t).value;return (hh-(g('hour')+g('minute')/60))*3600e3;})();
  class F extends R{constructor(...a){super(...(a.length?a:[R.now()+off]));}static now(){return R.now()+off;}};window.Date=F;},h);
 p.on('pageerror',e=>errs.push(lbl+' '+e.message));
 await p.goto(U+'?t='+Date.now());await p.waitForTimeout(1200);await p.click('#mskip').catch(()=>{});await p.waitForFunction(()=>window.__pos&&window.__pos().length>5,null,{timeout:90000});await p.waitForTimeout(4000);
 console.log('luz',lbl,JSON.stringify(await p.evaluate(()=>window.__luz())));await p.screenshot({path:D+'escritorio-luz-'+lbl+'.png'});await c.close();}
console.log('ERRORES',errs.length?errs:'ninguno');await b.close();

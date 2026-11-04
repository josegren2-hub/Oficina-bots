import {chromium} from 'playwright';import fs from 'fs';
const pw=(process.env.MANDO_CLAVE||fs.readFileSync('.clave-mando','utf8')).trim();const U=process.env.URL||'http://localhost:4180/';const D='capturas/v16-15/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
for(const [n,vp,mob] of [['movil',{width:390,height:844},1],['escritorio',{width:1440,height:900},0]]){
const c=await b.newContext({viewport:vp,isMobile:!!mob,hasTouch:!!mob});const p=await c.newPage();
p.on('pageerror',e=>errs.push(n+' '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(n+' console '+m.text())});
await p.goto(U+'?abrir=resumen&t='+Date.now());await p.waitForTimeout(1500);await p.fill('#mpw',pw);await p.click('#mform button[type=submit]');
await p.waitForFunction(()=>window.__pos&&window.__pos().length>5,null,{timeout:90000});await p.waitForTimeout(6000);
const a=await p.evaluate(()=>window.__pos().map(x=>x[1]+x[2]).join());await p.waitForTimeout(6000);const a2=await p.evaluate(()=>window.__pos().map(x=>x[1]+x[2]).join());
console.log(n,'caminan',a!==a2,'resumen abierto por atajo',await p.evaluate(()=>!document.getElementById('v13tab').hidden));
await p.screenshot({path:D+n+'-resumen-atajo.png'});
await p.evaluate(()=>{const h=[...document.querySelectorAll('#v13tab h4')].find(x=>x.textContent.includes('semanal'));h&&h.scrollIntoView()});await p.screenshot({path:D+n+'-semanal.png'});
console.log(n,'semanal',(await p.evaluate(()=>{const h=[...document.querySelectorAll('#v13tab h4')].find(x=>x.textContent.includes('semanal'));return h?.nextElementSibling?.innerText}))?.replace(/\s+/g,' '));
console.log(n,'audiencias li',await p.evaluate(()=>{const h=[...document.querySelectorAll('#v13tab h4')].find(x=>x.textContent.includes('Audiencias'));return h?.nextElementSibling?.querySelectorAll('li').length}));
await p.evaluate(()=>document.getElementById('v13tab').hidden=true);
await p.click('#v13bar .v15bb');await p.click('#v15busca .chip[data-dep="Proyectos"]');await p.waitForTimeout(2500);await p.screenshot({path:D+n+'-buscar-proyectos.png'});
console.log(n,'filtro',await p.evaluate(()=>document.querySelectorAll('#v15res .f').length),'cam',JSON.stringify(await p.evaluate(()=>window.__camara())));
await p.click('#v15busca .chip.on');await p.fill('#v15q','ted');console.log(n,'busca ted',await p.evaluate(()=>document.querySelectorAll('#v15res .f').length));
await p.evaluate(()=>document.getElementById('v15busca').hidden=true);
await p.click('#v13bar .v13te');await p.waitForTimeout(400);await p.screenshot({path:D+n+'-te-esperan.png'});
const n0=await p.evaluate(()=>window.__v13.esperan().length);console.log(n,'esperan',n0,'barra',await p.evaluate(()=>document.querySelector('#v13bar').innerText.replace(/\s+/g,' ')));
if(n0){await p.click('#v13lista .v15sig');await p.waitForTimeout(700);await p.screenshot({path:D+n+'-siguiente.png'});
 console.log(n,'ficha',await p.evaluate(()=>document.querySelector('#ficha .v13f')?.innerText.replace(/\s+/g,' ').slice(0,300)));
 await p.click('#ficha .v15nota summary');await p.fill('#ficha textarea[data-nota]','nota de prueba');console.log(n,'nota guardada',await p.evaluate(()=>Object.keys(JSON.parse(localStorage.v15notas||'{}')).length));
 await p.click('#ficha [data-pos="3h"]');await p.waitForTimeout(300);console.log(n,'tras posponer',await p.evaluate(()=>window.__v13.esperan().length));}
await p.evaluate(()=>window.__mOscuro?.());
await c.close();}
console.log('ERRORES',errs.length?errs:'ninguno');await b.close();

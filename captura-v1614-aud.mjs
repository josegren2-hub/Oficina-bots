import {chromium} from 'playwright';import fs from 'fs';
const pw=(process.env.MANDO_CLAVE||fs.readFileSync('.clave-mando','utf8')).trim();const U=process.env.URL||'http://localhost:4180/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const errs=[];
for(const [n,vp,mob] of [['movil',{width:390,height:844},1],['escritorio',{width:1440,height:900},0]]){
const c=await b.newContext({viewport:vp,isMobile:!!mob,hasTouch:!!mob});const p=await c.newPage();
p.on('pageerror',e=>errs.push(n+' '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(n+' console '+m.text())});
await p.goto(U+'?t='+Date.now());await p.waitForTimeout(2000);await p.fill('#mpw',pw);await p.click('#mform button[type=submit]');
await p.waitForFunction(()=>window.__pos&&window.__pos().length>5,null,{timeout:90000});await p.waitForTimeout(5000);
await p.click('#v13bar .v13res');await p.waitForTimeout(800);
await p.evaluate(()=>{const h=[...document.querySelectorAll('#v13tab h4')].find(x=>x.textContent.includes('Audiencias'));h&&h.scrollIntoView()});await p.waitForTimeout(400);
await p.screenshot({path:`capturas/v16-14/${n}-audiencias.png`});
console.log(n,'items',await p.evaluate(()=>{const h=[...document.querySelectorAll('#v13tab h4')].find(x=>x.textContent.includes('Audiencias'));const u=h?.nextElementSibling;return (h?'h4 ok ':'sin h4 ')+(u?.querySelectorAll('li').length||0)+' li · '+(u?.innerText.includes('EJEMPLO')?'EJEMPLO!':'real')}));
console.log(n,'version',await p.evaluate(()=>document.documentElement.innerHTML.match(/v16\.1\d/g)?.join(',')));await c.close();}
console.log('ERRORES',errs.length?errs:'ninguno');await b.close();

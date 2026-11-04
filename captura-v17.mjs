import {chromium} from 'playwright';import fs from 'fs';
const pw=(process.env.MANDO_CLAVE||fs.readFileSync('.clave-mando','utf8')).trim();const U=process.env.URL||'http://localhost:4317/';const D=process.env.D||'capturas/v17-preview/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const errs=[];const vp={width:412,height:915};
const nuevo=async(t,extra={})=>{const c=await b.newContext({viewport:vp,isMobile:true,hasTouch:true,deviceScaleFactor:2,...extra});const p=await c.newPage();p.on('pageerror',e=>errs.push(t+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon|404/.test(m.text()))errs.push(t+' console '+m.text())});return [c,p];};
const sh=(p,n)=>p.screenshot({path:D+n+'.png'});const w=ms=>new Promise(r=>setTimeout(r,ms));
// SIN CLAVE
let [c,p]=await nuevo('sin');await p.goto(U+'?t='+Date.now());await w(1500);await p.click('#mskip').catch(()=>{});
await p.waitForFunction(()=>window.__v17&&document.querySelectorAll('.v17pin').length>10,null,{timeout:90000});await w(2500);
await sh(p,'01-apilada');console.log('fps aprox',await p.evaluate(()=>window.__v17.fps()));
await p.click('#v17nav [data-v=lado]');await w(1500);await sh(p,'02-lado-a-lado');
// tocar un piso en lado a lado (centro de P2)
await p.evaluate(()=>window.__v17.vista('apilada'));await w(1300);
for(let i=0;i<5;i++){await p.evaluate(i=>window.__v17.vista('piso',i),i);await w(1300);await sh(p,'03-piso-'+['PB','P1','P2','P3','P4'][i]);}
await p.click('#v17volver');await w(1300);console.log('tras Volver',await p.evaluate(()=>window.__v17.estado()));
// tap real en canvas sobre un piso (centro de pantalla) en vista apilada
await p.touchscreen.tap(206,500);await w(1300);console.log('tap piso ->',await p.evaluate(()=>window.__v17.estado()));await p.click('#v17volver').catch(()=>{});await w(1200);
await p.evaluate(()=>window.__v17.vista('piso',4));await w(1300);await p.click('.v17piz');await w(500);await sh(p,'04-pizarron-sin-clave');
console.log('PIZ sin clave:',(await p.evaluate(()=>document.getElementById('v17pizarron').innerText)).replace(/\s+/g,' ').slice(0,200));
await p.click('#v17pizarron .lcerrar');
await p.click('.v17pin[data-id=ted]');await w(500);await sh(p,'05-ficha-ted-sin-clave');console.log('ficha',(await p.evaluate(()=>getComputedStyle(document.getElementById('ficha')).display)));await c.close();
// CON CLAVE
[c,p]=await nuevo('clave');await p.goto(U+'?t='+Date.now());await w(1500);await p.fill('#mpw',pw);await p.click('#mform button[type=submit]');
await p.waitForFunction(()=>window.__v17&&document.body.classList.contains('mando'),null,{timeout:90000});await w(3500);
await sh(p,'06-apilada-clave');await p.evaluate(()=>window.__v17.vista('piso',4));await w(1300);await p.click('.v17piz');await w(600);await sh(p,'07-pizarron-con-clave');
console.log('PIZ clave:',(await p.evaluate(()=>document.getElementById('v17pizarron').innerText)).replace(/\s+/g,' ').slice(0,300));await p.click('#v17pizarron .lcerrar');
const trab=await p.evaluate(()=>(window.__datos()||[]).find(b=>b.estado==='trabajando')?.id||'ted');await p.evaluate(i=>window.__v17.vista('piso',window.__v17.PISOS.findIndex(x=>i in x.bots)),trab);await w(1300);
await p.click(`.v17pin[data-id="${trab}"]`);await w(600);await sh(p,'08-ficha-trabajando-'+trab);console.log('FICHA',trab,(await p.evaluate(()=>document.getElementById('ficha').innerText)).replace(/\s+/g,' ').slice(0,300));
console.log('checks:',JSON.stringify(await p.evaluate(()=>({teEspera:typeof window.__teEspera,esperan:window.__v13?.esperan?.().length,tareaViva:typeof window.__tareaViva,botones:[...document.querySelectorAll('#ctrl button,#bact,#bpaneles')].map(b=>b.id||b.textContent.trim().slice(0,12)),sw:navigator.serviceWorker?.controller?'ctrl':'no',caches:0}))));
console.log('caches',await p.evaluate(()=>caches.keys()));
// noche
await p.evaluate(()=>{document.getElementById('ficha').style.display='none'});await p.evaluate(()=>{localStorage.setItem('oficinaModo','noche');});await p.click('#bmodo').catch(()=>{});await p.evaluate(()=>{document.body.classList.add('noche')});await p.evaluate(()=>window.__v17.vista('apilada'));await w(1500);await sh(p,'09-noche-apilada');
await p.evaluate(()=>window.__v17.vista('piso',4));await w(1300);await sh(p,'10-noche-P4');await c.close();
// Solo lista intacta
[c,p]=await nuevo('lista');await p.goto(U+'?abrir=lista&t='+Date.now());await w(1500);await p.click('#mskip').catch(()=>{});await w(3000);await sh(p,'11-solo-lista');console.log('lista v17?',await p.evaluate(()=>!!window.__v17));await c.close();
console.log('ERRORES',errs.length?errs:'ninguno');await b.close();

import {chromium} from 'playwright';import fs from 'fs';
const pw=(process.env.MANDO_CLAVE||fs.readFileSync('.clave-mando','utf8')).trim();const U=process.env.URL||'http://localhost:4317/';const D=process.env.D||'capturas/v17b-preview/';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const errs=[];const vp={width:412,height:915};
const nuevo=async(t,extra={})=>{const c=await b.newContext({viewport:vp,isMobile:true,hasTouch:true,deviceScaleFactor:2,...extra});const p=await c.newPage();p.on('pageerror',e=>errs.push(t+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/favicon|404/.test(m.text()))errs.push(t+' console '+m.text())});return [c,p];};
const sh=(p,n)=>p.screenshot({path:D+n+'.png'});const w=ms=>new Promise(r=>setTimeout(r,ms));
// ESCRITORIO 1024x985 (mismo tamaño que los renders) para comparación
{const b2=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c2=await b2.newContext({viewport:{width:1024,height:985}});const q=await c2.newPage();q.on('pageerror',e=>console.log('ERR',e.message));
await c2.addInitScript(()=>localStorage.setItem('oficinaModo',localStorage.getItem('__forz')||'dia'));
await q.goto(U+'?t='+Date.now());await w(1500);await q.click('#mskip').catch(()=>{});await q.waitForFunction(()=>window.__v17&&window.__v17.listo(),null,{timeout:90000});await w(2500);
await q.addStyleTag({content:'#vivo,#activos,#lista,#equipo,#resumen,#eq,#term,#ult,#ctrl,#bpaneles,#bact,#v17nav,#v17volver,.v17pin,.v17piz{visibility:hidden!important}'});
const sq=n=>q.screenshot({path:D+'esc-'+n+'.png'});await sq('01-apilada');await q.evaluate(()=>window.__v17.vista('lado'));await w(30000);await sq('03-lado');
for(let i=0;i<5;i++){await q.evaluate(i=>window.__v17.vista('piso',i),i);await w(25000);await sq('piso-'+i);}
await q.evaluate(()=>{localStorage.setItem('oficinaModo','noche');document.body.classList.add('noche');window.__v17.vista('apilada');});await w(30000);await sq('02-noche');await b2.close();}

await b.close();

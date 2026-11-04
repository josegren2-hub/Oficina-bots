import {chromium} from 'playwright';import fs from 'fs';
const U='http://localhost:4317/',D='capturas/v17c/';fs.mkdirSync(D,{recursive:true});const w=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const errs=[];
for(const modo of (process.env.MODOS||'dia,noche').split(',')){
 const c=await b.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true,deviceScaleFactor:2});await c.addInitScript(m=>localStorage.setItem('oficinaModo',m),modo);
 const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.goto(U+'?t='+Date.now());await w(1500);await p.click('#mskip').catch(()=>{});await p.waitForFunction(()=>window.__v17&&window.__v17.listo(),null,{timeout:120000}).catch(e=>{console.log('TIMEOUT',errs);process.exit(1)});await w(20000);
 await p.screenshot({path:`${D}cel-${modo}-apilada.png`});
 for(const v of (process.env.VISTAS||'lado,fachada').split(',')){await p.click(`#v17nav [data-v="${v}"]`);await w(30000);await p.screenshot({path:`${D}cel-${modo}-${v}.png`});}
 await c.close();}
console.log('ERRORES',errs.length?errs:'ninguno');await b.close();

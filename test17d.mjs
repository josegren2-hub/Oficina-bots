import {chromium} from 'playwright';import fs from 'fs';const w=ms=>new Promise(r=>setTimeout(r,ms));const D='capturas/v17d/';fs.mkdirSync(D,{recursive:true});
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const c=await b.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('http://localhost:4317/?t='+Date.now());await w(2000);await p.click('#mskip').catch(()=>{});await p.waitForFunction(()=>window.__v17&&window.__v17.listo(),null,{timeout:120000});await w(8000);
const open=()=>p.evaluate(()=>['v13lista','v15busca','v13tab','v16pop','v17pizarron','mpanel','ficha'].filter(id=>{const e=document.getElementById(id);return e&&(id==='ficha'?e.style.display==='block':!e.hidden&&getComputedStyle(e).display!=='none')}).concat(document.getElementById('mcpanel')?.classList.contains('plegado')?[]:['mcpanel']));
console.log('base',await open());
const btns=await p.evaluate(()=>[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().top<70).map(e=>e.textContent.trim().slice(0,12)));
for(let i=0;i<Math.min(5,btns.length);i++){await p.evaluate(i=>[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().top<70)[i]?.click(),i);await w(600);console.log(btns[i],'->',await open());}
console.log('hist',await p.evaluate(()=>history.length));
for(let k=0;k<4;k++){await p.goBack().catch(()=>{});await w(500);console.log('back',k,p.url().slice(0,40),await open(),await p.evaluate(()=>window.__v17.estado()));}
await p.evaluate(()=>window.__v17.vista('piso',4));await w(6000);console.log('piso',await p.evaluate(()=>window.__v17.estado()));
await p.goBack();await w(3000);console.log('back from piso',p.url().slice(0,30),await p.evaluate(()=>window.__v17.estado()));
// grid stats
console.log('nav',await p.evaluate(()=>[0,1,2,3,4].map(i=>{const g=window.__v17.nav(i);return g&&[g.nx,g.nz,g.ocup.toFixed(2)]})));
// pizarrón tap: project board
await p.evaluate(()=>window.__v17.vista('piso',4));await w(6000);
const pt=await p.evaluate(()=>{const pp=document.querySelector('#v17pizpin, .v17pizpin');return null});
await p.screenshot({path:D+'t-p4.png'});
console.log('errs',errs);await b.close();

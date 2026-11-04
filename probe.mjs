import {chromium} from 'playwright';const w=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:412,height:915},isMobile:true,hasTouch:true});const p=await c.newPage();
await p.goto('http://localhost:4317/');await w(2500);await p.click('#mskip').catch(()=>{});await w(4000);
const vis=()=>p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e);return (s.position==='fixed'||s.position==='absolute')&&e.id&&e.getClientRects().length&&s.display!=='none'&&s.visibility!=='hidden'&&e.getBoundingClientRect().height>40}).map(e=>e.id));
const base=new Set(await vis());console.log('base',[...base].join(' '));
const btns=await p.evaluate(()=>[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().top<70).map(e=>(e.id||'')+'|'+e.textContent.trim().slice(0,15)));console.log(btns);
for(const [i,t] of btns.entries()){const sel=t.split('|')[0];await p.evaluate(([i])=>[...document.querySelectorAll('button')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().top<70)[i]?.click(),[i]);await w(700);console.log(t,'->',(await vis()).filter(x=>!base.has(x)).join(' '));}
await b.close();

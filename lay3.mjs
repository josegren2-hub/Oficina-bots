import {chromium} from 'playwright';const w=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const out=[];
for(const W of [360,412,1024,1280,1440]){const mob=W<700;const c=await b.newContext({viewport:{width:W,height:800},isMobile:mob,hasTouch:mob});const p=await c.newPage();
await p.goto('http://localhost:4317/?t='+Date.now());await w(1500);await p.click('#mskip').catch(()=>{});await p.waitForFunction(()=>window.__v17&&window.__v17.listo(),null,{timeout:120000});await w(1500);
for(const v of ['apilada','piso','fachada']){await p.evaluate(v=>window.__v17.vista(v,v==='piso'?0:-1),v);
 const tg=mob?'#v17eq':'#mcpanel .mc-tg';
 const st=async()=>p.evaluate(()=>{const m=document.getElementById('mcpanel'),r=m.getBoundingClientRect(),cs=getComputedStyle(m);return `${m.classList.contains('plegado')?'pleg':'open'} ${cs.display} ${r.width|0}x${r.height|0}`});
 // ensure open
 if(await p.evaluate(()=>document.getElementById('mcpanel').classList.contains('plegado')))await p.click(tg);await w(800);const a=await st();
 await p.click('#mcpanel .mc-tg');await w(900);const bb=await st();if(W===1024&&v==='apilada')await p.screenshot({path:'capturas/v17d/escritorio-1024-equipo-plegado.png'});
 await p.click(mob?'#v17eq':'#mcpanel .mc-tg');await w(900);const cc=await st();out.push(`${W} ${v}: abierto[${a}] plegado[${bb}] reabierto[${cc}]`);}
await c.close();}console.log(out.join('\n'));await b.close();

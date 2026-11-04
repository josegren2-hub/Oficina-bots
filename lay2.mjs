import {chromium} from 'playwright';const w=ms=>new Promise(r=>setTimeout(r,ms));
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const out=[];
for(const W of [360,393,412,1024,1280,1440]){const mob=W<700;const c=await b.newContext({viewport:{width:W,height:mob?800:800},isMobile:mob,hasTouch:mob});const p=await c.newPage();
await p.goto('http://localhost:4317/?t='+Date.now());await w(1500);await p.click('#mskip').catch(()=>{});await p.waitForFunction(()=>window.__v17&&window.__v17.listo(),null,{timeout:120000});
await p.evaluate(()=>{document.getElementById('mpanelb').hidden=false;document.getElementById('msalir').hidden=false;});
for(const v of ['apilada','piso','fachada']){await p.evaluate(v=>window.__v17.vista(v,v==='piso'?0:-1),v);for(const eq of [0,1]){await p.evaluate(eq=>document.getElementById('mcpanel').classList.toggle('plegado',!eq),eq);await w(1600);
 const ov=await p.evaluate(()=>{const ids=['v13bar','v15viejo','leyenda','v17fila','mcpanel','bact','mpanelb','msalir','v17volver','v17eq','equipo','vivo','v17nav','term'];const R=ids.map(i=>[i,document.getElementById(i)]).filter(([i,e])=>e&&!e.hidden&&e.getClientRects().length&&getComputedStyle(e).display!=='none'&&getComputedStyle(e).visibility!=='hidden').map(([i,e])=>[i,e.getBoundingClientRect()]);const o=[];
 const anc=(a,b)=>document.getElementById(a).contains(document.getElementById(b))||document.getElementById(b).contains(document.getElementById(a));
 for(let x=0;x<R.length;x++)for(let y=x+1;y<R.length;y++){const[a,ra]=R[x],[b,rb]=R[y];if(anc(a,b))continue;const ix=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left),iy=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);if(ix>2&&iy>2)o.push(a+'×'+b);}return o.join(',')});
 out.push(`${W} ${v} eq${eq}: ${ov||'OK'}`);if(W===393||W===1024)await p.screenshot({path:`capturas/v17d/lay-${W}-${v}-eq${eq}.png`});}}
await c.close();}
console.log(out.join('\n'));await b.close();

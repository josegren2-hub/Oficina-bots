import {chromium} from 'playwright';const w=ms=>new Promise(r=>setTimeout(r,ms));
const W=+process.argv[2]||412,mob=W<700;const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const c=await b.newContext({viewport:{width:W,height:mob?915:800},isMobile:mob,hasTouch:mob});const p=await c.newPage();
await p.goto('http://localhost:4317/?t='+Date.now());await w(2000);await p.click('#mskip').catch(()=>{});await p.waitForFunction(()=>window.__v17&&window.__v17.listo(),null,{timeout:120000});await w(3000);
if(process.argv[3]==='eq')await p.evaluate(()=>document.getElementById('mcpanel').classList.remove('plegado'));await w(800);
console.log(await p.evaluate(()=>[...document.querySelectorAll('body *')].filter(e=>{const s=getComputedStyle(e);return s.position==='fixed'&&e.getClientRects().length&&s.display!=='none'&&s.visibility!=='hidden'&&!e.hidden}).map(e=>{const r=e.getBoundingClientRect();return `${e.id||e.className.toString().slice(0,20)} ${r.x|0},${r.y|0} ${r.width|0}x${r.height|0}`}).join('\n')));
await p.screenshot({path:`capturas/v17d/lay-${W}${process.argv[3]||''}.png`});await b.close();

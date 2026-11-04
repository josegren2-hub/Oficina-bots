import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('http://localhost:4173/');await p.waitForFunction(()=>window.__pos&&window.__pos().length>5,null,{timeout:90000});
console.log('fps',await p.evaluate(()=>new Promise(r=>{let n=0;const t=performance.now();const f=()=>{n++;if(performance.now()-t<2000)requestAnimationFrame(f);else r(n/2)};f();})));
const pos=()=>p.evaluate(()=>Object.fromEntries(window.__pos().map(([k,x,z,w])=>[k,[+x,+z,w]])));
const S=[];for(const t of [0,10,20]){if(t)await p.waitForTimeout(10000);S.push(await pos());}
for(const k in S[0])console.log(k,S.map(s=>s[k].join(',')).join(' | '));
const mov=k=>Math.hypot(S[2][k][0]-S[0][k][0],S[2][k][1]-S[0][k][1])+Math.hypot(S[1][k][0]-S[0][k][0],S[1][k][1]-S[0][k][1]);
console.log('se movieron',Object.keys(S[0]).filter(k=>mov(k)>.1).length,'/',Object.keys(S[0]).length);
await b.close();

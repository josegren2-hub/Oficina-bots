import {chromium} from 'playwright';
const U=process.env.URL||'http://localhost:4317/';const D='capturas/v17b-preview/';const w=ms=>new Promise(r=>setTimeout(r,ms));
const V={PB:[[10.2,-6.2,3.3],[4.2,-1.8,0.7]],P2:[[9.0,-6.4,3.0],[4.0,-1.9,0.8]],P3:[[7.0,-9.0,5.2],[4.6,-2.3,0.4]],P4:[[8.6,-6.5,3.2],[3.6,-1.6,0.9]],P5:[[10.0,-9.5,6.2],[3.6,-1.4,0.6]],P5ted:[[0.6,-2.3,2.0],[2.6,0.1,1.1]]};
// mapeo exacto de run2.sh: 04=PB,05=P2,06=P3,07=P4,08=P5,09=P5ted ; piso web i -> y
const J=[['esc-piso-0','PB',0],['esc-piso-1','P2',1],['esc-piso-2','P3',2],['esc-piso-3','P4',3],['esc-piso-4','P5',4],['esc-ted','P5ted',4]];
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const modo of (process.env.MODOS||'dia').split(',')){
const c=await b.newContext({viewport:{width:1000,height:650}});const q=await c.newPage();q.on('pageerror',e=>console.log('ERR',e.message));
await c.addInitScript(m=>localStorage.setItem('oficinaModo',m),modo);
await q.goto(U+'?t='+Date.now());await w(1500);await q.click('#mskip').catch(()=>{});await q.waitForFunction(()=>window.__v17&&window.__v17.listo(),null,{timeout:90000});await w(3000);
await q.addStyleTag({content:'body>*:not(#c17){visibility:hidden!important}'});
for(const [n,k,i] of J){await q.evaluate(i=>window.__v17.vista('piso',i),i);await w(1400);
 const y=i*6.2+(i===4?.3:0);const tr=v=>[v[0],v[2]+y,-v[1]];await q.evaluate(([p,t])=>window.__v17.camara(p,t,51.9),[tr(V[k][0]),tr(V[k][1])]);await w(1500);
 await q.screenshot({path:D+n+(modo==='noche'?'-noche':'')+'.png'});}
await c.close();}
await b.close();

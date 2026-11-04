import {chromium} from 'playwright';import {webcrypto as C} from 'crypto';
const b64=a=>Buffer.from(a).toString('base64');
const fake={generado:new Date().toISOString(),bots:[{id:'ted',nombre:'Ted',estado:'trabajando',tarea:'Revisando el resumen diario (dato de prueba)'},{id:'mateo',nombre:'Mateo',estado:'esperando',pendiente:'Nota lista, espera tu OK (prueba)',ok:['Nota lista, espera tu OK (prueba)']},{id:'julian',nombre:'Julián',estado:'esperando',pendiente:'Revisar contrato (prueba)'}],snapshots:[],fuentes:{}};
const salt=C.getRandomValues(new Uint8Array(16)),iv=C.getRandomValues(new Uint8Array(12));
const k0=await C.subtle.importKey('raw',new TextEncoder().encode('prueba'),'PBKDF2',false,['deriveKey']);
const key=await C.subtle.deriveKey({name:'PBKDF2',salt,iterations:1000,hash:'SHA-256'},k0,{name:'AES-GCM',length:256},false,['encrypt']);
const ct=await C.subtle.encrypt({name:'AES-GCM',iv},key,new TextEncoder().encode(JSON.stringify(fake)));
import fs from 'fs';const ENC=fs.readFileSync('mando-local/mando.enc','utf8');const PW=fs.readFileSync('.clave-mando','utf8').trim();
const br=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const D='capturas/v16/';let f=0;const ok=(c,t)=>{console.log((c?'OK  ':'FALLA ')+t);if(!c)f++;};
for(const [n,w,h,m] of [['escritorio',1440,900,false],['celular',390,844,true]]){
 const p=await br.newPage({viewport:{width:w,height:h},isMobile:m,hasTouch:m,serviceWorkers:'block'});p.on('pageerror',e=>{console.log('ERR '+e);f++});
 await p.route('**/mando.enc*',r=>r.fulfill({body:ENC,contentType:'application/json'}));
 const tap=async s=>{const e=await p.$(s);const bb=await e.boundingBox();m?await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2):await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(500);};
 await p.goto('http://localhost:4173/');await p.waitForTimeout(3000);
 // sin desbloquear
 await tap('#mskip');await p.waitForTimeout(30000);
 await tap('#leyenda [data-k="trabajando"]');ok(await p.$eval('#lestado',e=>!e.hidden&&e.querySelectorAll('.f').length===__conteos().trabajando),n+' leyenda trabajando (2)');
 await p.screenshot({path:D+n+'-leyenda-lista-sin-clave.png'});
 await tap('#lestado .f');ok(await p.evaluate(()=>__fichaAbierta()),n+' tocar bot abre ficha');await tap('#ficha .cerrar');
 await tap('#lestado .lcerrar');ok(await p.$eval('#lestado',e=>e.hidden),n+' cerrar lista');
 await tap('#leyenda [data-k="esperando"]');{const q=await p.evaluate(()=>[document.querySelectorAll('#lestado .f').length,__conteos().esperando,document.querySelector('#lestado').hidden,document.elementFromPoint(...(r=>[r.x+r.width/2,r.y+r.height/2])(document.querySelector('#leyenda [data-k=esperando]').getBoundingClientRect()))?.outerHTML.slice(0,80)]);ok(q[0]===q[1]&&!q[2],n+' disponibles '+JSON.stringify(q));if(!q[2])await tap('#lestado .lcerrar');}
 // desbloquear
 await p.reload();await p.waitForTimeout(2000);await p.fill('#mpw',PW);await p.click('.mprim');await p.waitForTimeout(30000);console.log('dbg',await p.evaluate(()=>[document.body.className,document.querySelector('#merr')?.textContent,!!document.querySelector('#mlock')]));
 await tap('#leyenda [data-k="te"]');{const q=await p.evaluate(()=>[document.querySelectorAll('#lestado .f').length,__conteos().te]);ok(q[0]===q[1],n+' te espera '+q);}
 await p.screenshot({path:D+n+'-leyenda-lista.png'});await tap('#lestado .lcerrar');
 await tap('#mpanelb');const cnt=await p.$$eval('#mpanel .mcont button',a=>a.map(x=>x.textContent));ok(cnt.length===4,n+' contadores '+cnt.join(' | '));
 await p.screenshot({path:D+n+'-mando.png'});
 await tap('#mpanel .mcont button[data-k="te"]');{const q=await p.evaluate(()=>[document.querySelectorAll('#lestado .f').length,__conteos().te]);ok(q[0]===q[1],n+' mando te esperan '+q);}
 await p.screenshot({path:D+n+'-mando-lista.png'});await tap('#lestado .f');ok(await p.evaluate(()=>__fichaAbierta()),n+' ficha desde mando');await p.screenshot({path:D+n+'-ficha.png'});
 // tap en bot 3D sigue
 await tap('#ficha .cerrar');await tap('#lestado .lcerrar');await tap('#mpanel .mtabs button:has-text("Uso")');ok(await p.$eval('#mpanel',e=>e.textContent.includes('no es el consumo exacto')),n+' pestaña uso');await p.screenshot({path:D+n+'-uso.png'});await p.evaluate(()=>document.querySelector('#mpanel').hidden=true);
}
await br.close();process.exit(f?1:0);

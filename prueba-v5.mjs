import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const out=[],D='capturas/v5/';let fallas=0;
const ok=(c,t)=>{out.push((c?'OK  ':'FALLA ')+t);if(!c)fallas++;};
for(const [n,w,h,m] of [['escritorio',1440,900,false],['celular',390,844,true]]){
 const p=await b.newPage({viewport:{width:w,height:h},isMobile:m,hasTouch:m});p.on('pageerror',e=>{out.push('ERR '+e);fallas++});
 await p.goto('http://localhost:4173/');await p.waitForTimeout(7000);await p.screenshot({path:D+n+'.png'});
 const fov=await p.evaluate(()=>__camara());ok(fov.polar<1.39,`${n} cámara perspectiva polar=${fov.polar}`);
 const ID='ted';const s=await p.evaluate(i=>__botPantalla(i),ID);
 await p.mouse.move(s.x,s.y);await p.mouse.down();for(let i=1;i<=10;i++)await p.mouse.move(s.x+i*8,s.y+i*4);await p.mouse.up();await p.waitForTimeout(300);
 ok(!await p.evaluate(()=>__fichaAbierta()),`${n} arrastre NO abre ficha`);
 await p.waitForTimeout(1500);const s2=await p.evaluate(i=>__botPantalla(i),ID);await (m?p.touchscreen.tap(s2.x,s2.y):p.mouse.click(s2.x,s2.y));await p.waitForTimeout(300);
 ok(await p.evaluate(()=>__fichaAbierta()),`${n} tap abre ficha`);await p.mouse.click(5,h/2);await p.waitForTimeout(200);
 if(!m){const a0=(await p.evaluate(()=>__camara())).azim;await p.mouse.move(700,700);await p.mouse.down();for(let i=1;i<=20;i++)await p.mouse.move(700-i*20,700-i*8);await p.mouse.up();await p.waitForTimeout(1500);
  const c=await p.evaluate(()=>__camara());ok(Math.abs(c.azim-a0)>.3,`giro cambia azimut ${a0}→${c.azim}`);ok(c.polar<=1.381,`no ve bajo el piso polar=${c.polar}`);await p.screenshot({path:D+n+'-girada.png'});
  await p.mouse.move(700,450);await p.mouse.wheel(0,1200);await p.waitForTimeout(800);await p.mouse.wheel(0,-1200);await p.waitForTimeout(800);}
 if(!m){await p.click('#lista .f[data-id="luna"]');await p.waitForTimeout(4000);await p.screenshot({path:D+n+'-cerca.png'});}await p.click('#bedif');await p.waitForTimeout(6000);await p.screenshot({path:D+n+'-edificio.png'});
 ok(await p.evaluate(()=>getComputedStyle(document.querySelector('.piso-et')).display==='block'),`${n} etiquetas de pisos en edificio`);}
console.log(out.join('\n'));await b.close();process.exit(fallas?1:0);

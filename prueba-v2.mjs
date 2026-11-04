import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const out=[],D='capturas/v2/';
for(const [n,w,h,m] of [['escritorio',1440,900,false],['celular',390,844,true]]){
 const p=await b.newPage({viewport:{width:w,height:h},isMobile:m,hasTouch:m});p.on('pageerror',e=>out.push('ERR '+e));
 await p.goto('http://localhost:4173/');await p.waitForTimeout(6000);await p.screenshot({path:D+n+(m?'-paneles-plegados':'')+'.png'});
 const ID='ted';const s=await p.evaluate(i=>__botPantalla(i),ID);
 await p.mouse.move(s.x,s.y);await p.mouse.down();for(let i=1;i<=10;i++)await p.mouse.move(s.x+i*8,s.y+i*4);await p.mouse.up();await p.waitForTimeout(300);
 out.push(`${n} arrastre abre ficha: ${await p.evaluate(()=>__fichaAbierta())}`);await p.screenshot({path:D+n+'-tras-arrastre.png'});
 const s2=await p.evaluate(i=>__botPantalla(i),ID);await (m?p.touchscreen.tap(s2.x,s2.y):p.mouse.click(s2.x,s2.y));await p.waitForTimeout(300);
 out.push(`${n} tap abre ficha: ${await p.evaluate(()=>__fichaAbierta())}`);await p.screenshot({path:D+n+'-ficha.png'});
 await p.mouse.click(5,h/2);
 if(m){await p.click('#bpaneles');await p.waitForTimeout(600);await p.screenshot({path:D+n+'-paneles-abiertos.png'});await p.click('#bpaneles');}
 await p.click('#bedif');await p.waitForTimeout(2500);await p.screenshot({path:D+n+'-edificio.png'});
 await p.click('#pisos button[data-i="2"]');await p.waitForTimeout(2500);await p.screenshot({path:D+n+'-piso-tinta-rosa.png'});}
console.log(out.join('\n'));await b.close();

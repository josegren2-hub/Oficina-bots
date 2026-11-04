import {chromium} from 'playwright';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});const out=[];
for(const [n,w,h,m] of [['escritorio',1440,900,false],['celular',390,844,true]]){
 const p=await b.newPage({viewport:{width:w,height:h},isMobile:m,hasTouch:m});p.on('pageerror',e=>out.push('ERR '+e));
 await p.goto('http://localhost:4173/');await p.waitForTimeout(5000);await p.screenshot({path:`capturas/${n}.png`});
 const ID=m?'mateo':'ted';const s=await p.evaluate(i=>__botPantalla(i),ID);
 await p.mouse.move(s.x,s.y);await p.mouse.down();for(let i=1;i<=10;i++)await p.mouse.move(s.x+i*8,s.y+i*4);await p.mouse.up();
 await p.waitForTimeout(300);out.push(`${n} arrastre abre ficha: ${await p.evaluate(()=>__fichaAbierta())}`);
 const s2=await p.evaluate(i=>__botPantalla(i),ID);await (m?p.touchscreen.tap(s2.x,s2.y):p.mouse.click(s2.x,s2.y));await p.waitForTimeout(300);
 out.push(`${n} tap abre ficha: ${await p.evaluate(()=>__fichaAbierta())}`);await p.screenshot({path:`capturas/${n}-ficha.png`});
 await p.click('.b[data-id="luna"]');await p.waitForTimeout(1500);await p.screenshot({path:`capturas/${n}-centrado-luna.png`});}
console.log(out.join('\n'));await b.close();

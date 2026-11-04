import {chromium} from 'playwright';import fs from 'fs';
const ENC=fs.readFileSync('mando-local/mando.enc','utf8');const PW=fs.readFileSync('.clave-mando','utf8').trim();
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
async function run(n,w,h,m,modo,mando){const c=await b.newContext({viewport:{width:w,height:h},isMobile:m,hasTouch:m,serviceWorkers:'block'});
 await c.addInitScript(v=>localStorage.setItem('oficinaModo',v),modo);const p=await c.newPage();
 await p.route('**/mando.enc*',r=>r.fulfill({body:ENC,contentType:'application/json'}));
 await p.goto('http://localhost:4173/');await p.waitForTimeout(2000);
 if(mando){await p.fill('#mpw',PW);await p.click('.mprim');await p.waitForTimeout(30000);await p.evaluate(()=>document.querySelector('#mpanelb')?.click());await p.waitForTimeout(3000);}
 else{await p.click('#mskip').catch(()=>{});await p.waitForTimeout(30000);}
 console.log(n,await p.evaluate(()=>[document.body.classList.contains('noche'),document.querySelector('#bmodo')?.textContent,document.querySelector('meta[name=theme-color]').content]));
 await p.screenshot({path:`capturas/v16-5/${n}.png`});await c.close();}
await Promise.all([run('celular-noche',390,844,true,'noche'),run('escritorio-noche',1440,900,false,'noche')]);
await b.close();

import {chromium} from 'playwright';const suf=process.argv[2]||'';
const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']});
for(const [n,w,h,m] of [['escritorio',1440,900,false],['celular',390,844,true]]){const p=await b.newPage({viewport:{width:w,height:h},isMobile:m,hasTouch:m,serviceWorkers:'block'});
 await p.goto('http://localhost:4173/');await p.waitForTimeout(2000);await p.waitForSelector('#mskip',{timeout:20000}).then(e=>e.click()).catch(e=>console.log('skip',e.message));await p.waitForTimeout(35000);await p.screenshot({path:`capturas/v16-3/${n}${suf}.png`});}
await b.close();

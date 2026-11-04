// v16.16: respuestas rápidas, línea de tiempo de hoy, luz de salud, racha y botón de vista (sin Three.js: sirve al 3D y a "Solo lista")
import {MANDO} from './mando.js';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const RR=[['OK','OK, adelante'],['Luego','Lo veo más tarde'],['No','No, gracias']];
// No existe (confirmado) un enlace que precargue texto en el chat: se abre el chat y se copia la respuesta.
export function rapidas(m){if(!m?.agente)return'';const h=`grokbot://app/v1/agent?id=${encodeURIComponent(m.agente)}`;
 return `<span class="v16rr">${RR.map(([l,t])=>`<a class="mir v16r" href="${h}" data-bot="${E(m.nombre)}" data-copia="${E(t)}" data-toast="Copiado, pégalo en el chat" title="Copia “${E(t)}” y abre el chat">${l}</a>`).join('')}</span>`;}
let EST=null;
export const rachaTxt=()=>{const r=EST?.racha;if(!r)return'🔥 Racha: sin datos aún';return `🔥 Racha: ${r.dias} día${r.dias===1?'':'s'}${r.hoy_cero?' · hoy ya llegaste a cero':' · hoy aún no llegas a cero'}`;};
export function lineaTiempoHTML(DEP,D){const t='<h4>🕒 Línea de tiempo de hoy</h4>';if(!MANDO)return t+'<p class="s">🔐 Solo con el Centro de mando desbloqueado.</p>';
 const hb=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Chihuahua'})).getHours();
 const fila=id=>{const m=MANDO.bots?.find(x=>x.id===id);const b=D[id];if(!m&&!b)return'';const hh=m?.horas_hoy;const mx=Math.max(1,...(hh||[0]));
  const cel=hh?hh.map((n,i)=>`<i class="${i>hb?'fut':''}" style="${n?`background:rgba(34,197,94,${(.25+.75*n/mx).toFixed(2)})`:''}" title="${i}:00 · ${n} mensajes"></i>`).join(''):'<span class="sd0">sin datos</span>';
  return `<div class="v16tl"><span class="n">${E(b?.nombre||m?.nombre||id)}</span><span class="h">${cel}</span></div>`;};
 return t+`<p class="s">Cada cuadro es una hora (0–23 h, Chihuahua); más verde = más mensajes. Solo conteos, nunca contenido.</p>${Object.entries(DEP).map(([n,ids])=>`<div class="v16dep">${E(n)}</div>${ids.map(fila).join('')}`).join('')}<div class="v16tl"><span class="n"></span><span class="h ej">${[0,6,12,18,23].map(h=>`<b style="left:${(h/24*100).toFixed(1)}%">${h}</b>`).join('')}</span></div>`;}
// salud
const edad=t=>{const m=t?new Date(t).getTime():NaN;return isNaN(m)?Infinity:(Date.now()-m)/60e3;};
const hum=min=>min===Infinity?'nunca':min<1?'hace un momento':min<60?`hace ${Math.round(min)} min`:min<48*60?`hace ${Math.round(min/60)} h`:`hace ${Math.round(min/1440)} días`;
export function salud(){const s=EST?.salud||{};const out=[];
 const e=Math.min(edad(s.latido),edad(EST?.actualizado));out.push(e<50?['v','Los estados de los bots se están actualizando bien',`(última señal ${hum(e)}).`]:e<120?['a','Los estados tardan en actualizarse',`(última señal ${hum(e)}). Puede ser un momento de calma o que el recolector esté lento.`]:['r','Los estados no se actualizan',`(última señal ${hum(e)}). El recolector en la computadora parece detenido.`]);
 const mm=Math.min(edad(s.mando),edad(MANDO?.generado));out.push(mm<14*60?['v','El Centro de mando tiene datos recientes',`(${hum(mm)}).`]:mm<26*60?['a','El Centro de mando tiene datos algo viejos',`(${hum(mm)}). Se actualiza 3 veces al día.`]:['r','El Centro de mando no se ha actualizado',`(${hum(mm)}).`]);
 const ok=edad(s.avisos_ok),er=edad(s.avisos_error);
 out.push(s.avisos_config===false?['a','Los avisos al celular no están configurados','']:er<ok?['a','El último aviso al celular falló',`(${hum(er)}). Se reintenta solo.`]:['v','Los avisos al celular funcionan',ok===Infinity?'(aún no ha hecho falta enviar ninguno).':`(último enviado ${hum(ok)}).`]);
 const peor=out.some(x=>x[0]==='r')?'r':out.some(x=>x[0]==='a')?'a':'v';return {peor,out};}
function pintar(){const b=document.getElementById('v16salud');if(!b)return;const {peor}=salud();b.className='v16s '+peor;b.title={v:'Todo bien',a:'Algo va lento',r:'Algo está fallando'}[peor];
 const r=document.getElementById('v16racha');if(r){r.textContent='🔥 '+(EST?.racha?EST.racha.dias:'–');r.title=rachaTxt();}
 const p=document.getElementById('v16pop');if(p&&!p.hidden)pop(true);}
function pop(re){const p=document.getElementById('v16pop');if(!re)p.hidden=!p.hidden;if(p.hidden)return;const {peor,out}=salud();const C={v:'🟢',a:'🟡',r:'🔴'};
 p.innerHTML=`<div class="lt"><b>${C[peor]} ${{v:'Todo funciona bien',a:'Algo va lento',r:'Algo está fallando'}[peor]}</b><button class="lcerrar">✕</button></div>${out.map(([c,a,b])=>`<p>${C[c]} ${E(a)} <span class="s">${E(b)}</span></p>`).join('')}<p>${E(rachaTxt())}</p><p class="s">La racha cuenta los días seguidos en que “Te esperan” llegó a cero al menos una vez.</p>`;}
async function cargar(){try{const r=await fetch('./estado.json?t='+Date.now(),{cache:'no-store'});if(r.ok)EST=await r.json();}catch(e){}pintar();window.__v13?.pintarTablero?.();}
export function iniciarV1616(modo){const bar=document.getElementById('v13bar');if(!bar)return;
 const w=document.createElement('span');w.className='v16w';
 w.innerHTML=`<button id="v16salud" class="v16s" aria-label="Salud del sistema"></button><button id="v16racha" class="v16rc" aria-label="Racha"></button><button id="v16vista" title="${modo==='lista'?'Ver la oficina en 3D':'Ver solo la lista (sin 3D, más ligero)'}">${modo==='lista'?'🏢<span class="vt"> 3D</span>':'☰<span class="vt"> Lista</span>'}</button>`;
 bar.appendChild(w);const p=document.createElement('div');p.id='v16pop';p.className='glass';p.hidden=true;document.body.appendChild(p);
 w.querySelector('#v16salud').onclick=()=>pop();w.querySelector('#v16racha').onclick=()=>pop();
 p.addEventListener('click',e=>{if(e.target.closest('.lcerrar'))p.hidden=true;});
 w.querySelector('#v16vista').onclick=()=>{localStorage.setItem('oficinaVista',modo==='lista'?'3d':'lista');location.replace(location.pathname);};
 window.__v16={salud,estado:()=>EST,recargar:cargar,rachaTxt};cargar();setInterval(cargar,120e3);setInterval(pintar,60e3);}

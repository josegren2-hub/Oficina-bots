// v16.13: barra "Te esperan", tarjeta con tarea/espera/chat, tablero "Resumen del día", avisos locales >24 h.
import {MANDO} from './mando.js';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DEP={'Tinta Rosa':['mateo','tr-editor','tr-cm','tadeo'],'Personal':['ted','luna','vale','emiliano'],'Jurídico y Finanzas':['julian','ines'],'Proyectos':['ceo','apps','libro','rulo','director','luca']};
const H24=24*3600e3;
const ms=t=>{const d=new Date(t);return isNaN(d)?null:d.getTime();};
export function hace(t){const m=ms(t);if(m==null)return'';let s=Math.max(0,Date.now()-m)/60e3;if(s<1)return'hace un momento';if(s<60)return`hace ${Math.round(s)} min`;const h=Math.floor(s/60),mm=Math.round(s%60);if(h<48)return`hace ${h} h${mm?' '+mm+' min':''}`;return`hace ${Math.floor(h/24)} días`;}
const fh=t=>{const m=ms(t);return m==null?'':new Date(m).toLocaleString('es-MX',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});};
const mb=id=>MANDO?.bots?.find(x=>x.id===id);
const esperan=()=>(window.__datos?.()||[]).filter(b=>b.estado==='esperando').sort((a,b)=>(ms(a.esperando_desde)??9e15)-(ms(b.esperando_desde)??9e15));
const chat=m=>m?.agente?`<a class="mir" href="grokbot://app/v1/agent?id=${encodeURIComponent(m.agente)}" data-bot="${E(m.nombre)}">Abrir chat →</a>`:'';
// tarjeta del bot (se inserta en la ficha)
export function extraFicha(b){const m=mb(b.id);let h='<div class="v13f">';
 if(b.estado==='esperando')h+=`<p class="v13w">⏳ Te espera desde ${E(fh(b.esperando_desde)||'—')}<br><small>${E(hace(b.esperando_desde))}</small></p>`;
 if(MANDO){h+=`<p><b class="v13l">Tarea actual</b><br>${m?.tarea?E(m.tarea):'<span class="sd0">sin datos</span>'}</p>${chat(m)}`;}
 else h+='<p class="s">🔐 La tarea y el botón de chat se ven con el Centro de mando desbloqueado.</p>';
 return h+'</div>';}
// barra superior
let abierta=false;
function pintarBarra(){const d=document.getElementById('v13bar');if(!d)return;const L=esperan();
 d.querySelector('.v13n').textContent=L.length;d.classList.toggle('cero',!L.length);
 const l=document.getElementById('v13lista');l.hidden=!abierta;
 l.innerHTML=L.length?L.map(b=>`<div class="f" data-id="${E(b.id)}"><span class="d e-te" style="margin:0"></span><div class="lx"><b>${E(b.nombre)}</b><div class="s">${E(hace(b.esperando_desde))}${ms(b.esperando_desde)&&Date.now()-ms(b.esperando_desde)>H24?' · más de 24 h':''}</div></div><span class="lir">›</span></div>`).join(''):'<p class="s">Nadie te espera ahora.</p>';
 l.innerHTML+=`<button class="v13not">${'Notification' in window&&Notification.permission==='granted'?'🔔 Avisos activados (más de 24 h)':'🔔 Activar avisos (más de 24 h)'}</button>`;}
// tablero
function pintarTablero(){const t=document.getElementById('v13tab');if(!t||t.hidden)return;const D=Object.fromEntries((window.__datos?.()||[]).map(b=>[b.id,b]));
 const hoy=new Date().toLocaleDateString('en-CA',{timeZone:'America/Chihuahua'});
 const fila=id=>{const b=D[id];if(!b)return'';const m=mb(id);const st=b.estado==='esperando'?'te':b.estado;
  let act;if(MANDO){const h=m?.hoy;const n=h?h.mensajes:(m?.stats?.por_dia?.[hoy]||[0,0]).reduce((a,c)=>a+c,0);const u=h?.ultima||m?.stats?.ultima_actividad;act=`${n} mensajes hoy · última actividad ${u?E(fh(u)):'sin datos'}`;}else act='🔐 actividad con clave';
  return `<div class="f" data-id="${E(id)}"><span class="d e-${st}" style="margin:0"></span><div class="lx"><b>${E(b.nombre)}</b><div class="s">${act}${b.estado==='esperando'?` · <span style="color:#F97316">atorado: te espera ${E(hace(b.esperando_desde))}</span>`:''}</div></div></div>`;};
 const L=esperan();
 let aud;if(!MANDO)aud='<p class="s">🔐 Solo con el Centro de mando desbloqueado.</p>';else{const a=MANDO.audiencias;aud=a&&Array.isArray(a.items)&&a.items.length?'<ul>'+a.items.map(x=>`<li>${E(x.hora||'')} ${E(x.txt||'')}</li>`).join('')+'</ul>':`<p class="sd0">Sin datos conectados</p>${a?.nota?`<p class="s">${E(a.nota)}</p>`:''}`;}
 t.innerHTML=`<div class="lt"><b>📋 Resumen del día</b><button class="lcerrar">✕ Cerrar</button></div>${MANDO?`<p class="s">Datos de actividad al ${E(fh(MANDO.generado))} (solo conteos y horas)</p>`:''}
 <h4>Atorado (te espera)</h4>${L.length?L.map(b=>`<div class="f" data-id="${E(b.id)}"><span class="d e-te" style="margin:0"></span><div class="lx"><b>${E(b.nombre)}</b><div class="s">${E(hace(b.esperando_desde))}</div></div></div>`).join(''):'<p class="s">Nada atorado.</p>'}
 ${Object.entries(DEP).map(([n,ids])=>`<h4>${E(n)}</h4>${ids.map(fila).join('')}`).join('')}
 <h4>📅 Audiencias de mañana</h4>${aud}`;}
// avisos locales (sin servidor): al abrir la app o volver al frente
async function avisar(){if(!('Notification' in window)||Notification.permission!=='granted')return;const reg=await navigator.serviceWorker?.getRegistration?.();
 const vistos=JSON.parse(localStorage.getItem('v13avisos')||'{}');let cambio=false;
 for(const b of esperan()){const m=ms(b.esperando_desde);if(m==null||Date.now()-m<H24)continue;const k=b.id+'|'+b.esperando_desde;if(vistos[k])continue;
  const o={body:`Lleva ${hace(b.esperando_desde).replace('hace ','')} esperando tu respuesta.`,tag:'espera-'+b.id,icon:'./icon-192.png',badge:'./icon-192.png',data:{url:location.href.split('?')[0]}};
  try{if(reg)await reg.showNotification(`${b.nombre} te espera`,o);else new Notification(`${b.nombre} te espera`,o);vistos[k]=1;cambio=true;}catch(e){}}
 if(cambio)localStorage.setItem('v13avisos',JSON.stringify(vistos));}
export function iniciarV1613(){
 const bar=document.createElement('div');bar.id='v13bar';bar.className='glass';
 bar.innerHTML=`<button class="v13te"><i class="pulo"></i>Te esperan <b class="v13n">0</b> <span class="v13c">▾</span></button><button class="v13res">📋 Resumen</button>`;
 const lista=document.createElement('div');lista.id='v13lista';lista.className='glass';lista.hidden=true;
 const tab=document.createElement('div');tab.id='v13tab';tab.className='glass';tab.hidden=true;
 document.body.append(bar,lista,tab);document.body.classList.add('v13');
 bar.querySelector('.v13te').onclick=()=>{abierta=!abierta;pintarBarra();};
 bar.querySelector('.v13res').onclick=()=>{tab.hidden=!tab.hidden;pintarTablero();tab.scrollTop=0;};
 lista.addEventListener('click',async e=>{if(e.target.closest('.v13not')){if('Notification' in window){try{await Notification.requestPermission();}catch(_){}}pintarBarra();avisar();return;}
  const f=e.target.closest('.f[data-id]');if(f){abierta=false;pintarBarra();window.__abrirFicha?.(f.dataset.id);}});
 tab.addEventListener('click',e=>{if(e.target.closest('.lcerrar')){tab.hidden=true;return;}const f=e.target.closest('.f[data-id]');if(f){tab.hidden=true;window.__abrirFicha?.(f.dataset.id);}});
 window.__trasCargar=()=>{pintarBarra();pintarTablero();avisar();};
 document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'){pintarBarra();avisar();}});
 setInterval(pintarBarra,60e3);window.__v13={esperan,pintarTablero};}

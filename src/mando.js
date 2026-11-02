// Centro de mando: datos detallados cifrados (AES-GCM, clave derivada con PBKDF2). Sin la frase solo se ven estados.
const LS='mandoClave';const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const b64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),tob64=a=>btoa(String.fromCharCode(...new Uint8Array(a)));
const SD='<span class="sd0">sin datos</span>';const EST={trabajando:'Trabajando',esperando:'Activo / esperando',pausa:'En pausa',inactivo:'Inactivo'};
const fh=t=>{if(!t)return'';const d=new Date(t);return isNaN(d)?E(t):d.toLocaleString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})};
let ENC=null,KEY=null;export let MANDO=null;
async function traer(){const r=await fetch('./mando.enc?t='+Date.now());if(!r.ok)throw new Error('sin mando.enc');ENC=await r.json();return ENC;}
async function derivar(pw,enc){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(pw),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt:b64(enc.salt),iterations:enc.iter,hash:'SHA-256'},k,{name:'AES-GCM',length:256},true,['decrypt']);}
async function abrir(key,enc){const pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:b64(enc.iv)},key,b64(enc.ct));return JSON.parse(new TextDecoder().decode(pt));}
async function refrescar(){try{const enc=await traer();MANDO=await abrir(KEY,enc);marcarTE();pintarPanel();}catch(e){}}
function marcarTE(){window.__teEspera=new Set(MANDO.bots.filter(b=>pendOK(b).length).map(b=>b.id));window.__repintar?.();}
function listo(){marcarTE();document.body.classList.add('mando');$('#mpanelb').hidden=false;$('#msalir').hidden=false;pintarPanel();setInterval(refrescar,5*60e3);}
const $=s=>document.querySelector(s);
export async function iniciarMando(){
 const ui=document.createElement('div');ui.innerHTML=`
 <div id="mlock"><div class="glass mbox"><div class="mt">🔐 Centro de mando</div><p>Escribe la frase para ver el detalle de cada bot. Sin ella solo ves los estados.</p>
  <form id="mform"><input id="mpw" type="password" autocomplete="current-password" placeholder="Frase de acceso" autofocus>
  <label class="mchk"><input id="mrec" type="checkbox" checked> Recordar en este dispositivo</label><div id="merr"></div>
  <button type="submit" class="mprim">Entrar</button></form><button id="mskip" class="mlink">Solo ver estados</button></div></div>
 <button id="mpanelb" class="glass" hidden>📊 Centro de mando</button><button id="msalir" class="glass" hidden title="Olvidar la clave en este dispositivo">Cerrar sesión</button>
 <div id="mpanel" class="glass" hidden></div>`;document.body.append(...ui.children);
 $('#mskip').onclick=()=>$('#mlock').remove();
 $('#mpanelb').onclick=()=>{const p=$('#mpanel');p.hidden=!p.hidden;if(!p.hidden)pintarPanel();};
 $('#msalir').onclick=()=>{localStorage.removeItem(LS);location.reload();};
 $('#mform').onsubmit=async e=>{e.preventDefault();$('#merr').textContent='Abriendo…';
  try{const enc=ENC||await traer();KEY=await derivar($('#mpw').value,enc);MANDO=await abrir(KEY,enc);
   if($('#mrec').checked)localStorage.setItem(LS,JSON.stringify({salt:enc.salt,k:tob64(await crypto.subtle.exportKey('raw',KEY))}));
   $('#mlock').remove();listo();}catch(err){KEY=null;$('#merr').textContent=ENC?'Frase incorrecta':'Aún no hay datos del centro de mando publicados';}};
 const g=JSON.parse(localStorage.getItem(LS)||'null');
 if(g){try{const enc=await traer();if(enc.salt!==g.salt)throw 0;KEY=await crypto.subtle.importKey('raw',b64(g.k),'AES-GCM',true,['decrypt']);MANDO=await abrir(KEY,enc);$('#mlock').remove();listo();}catch(e){localStorage.removeItem(LS);}}
}
// ---------- ficha detallada ----------
const OKR=/tu OK|tu visto bueno|autorices|apruebes|decidas|que elijas|que le confirmes|tu aprobaci|tu autorizaci|tu decisi|espera tu/i;const necesitaOK=t=>OKR.test(t||'');
const PRE='Desde el Centro de mando — ';
const mItem=(x,k)=>PRE+(k?'quiero trabajar en este pendiente':'quiero revisar/autorizar este pendiente')+`: "${x}". ¿Qué necesitas de mí para avanzar?`;
const mLista=b=>{const a=pendOK(b);return a.length?PRE+'quiero revisar/autorizar estos pendientes:\n'+a.map(x=>`• "${x}"`).join('\n')+'\n¿Qué necesitas de mí para avanzar?':''};
const ir=(b,t='Abrir chat',msg,cls='')=>{if(msg===undefined)msg=mLista(b);return b.agente?`<a class="mir ${cls}" href="grokbot://app/v1/agent?id=${encodeURIComponent(b.agente)}" data-bot="${E(b.nombre)}" data-copia="${E(msg)}">${t} →</a>`:''};
const btnsItem=(b,x)=>' '+ir(b,'Ir a autorizar',mItem(x))+' '+ir(b,'Trabajar en esto',mItem(x,1),'mtr');
function copiar(t){let ok=false;try{const ta=document.createElement('textarea');ta.value=t;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,t.length);ok=document.execCommand('copy');ta.remove();}catch(e){}
 try{navigator.clipboard?.writeText(t).catch(()=>{});}catch(e){}return ok;}
function toast(m){let d=document.getElementById('mtoast');if(!d){d=document.createElement('div');d.id='mtoast';document.body.appendChild(d);}d.textContent=m;d.classList.add('on');clearTimeout(d._t);d._t=setTimeout(()=>d.classList.remove('on'),2700);}
document.addEventListener('click',e=>{const a=e.target.closest('a.mir');if(!a)return;e.preventDefault();e.stopPropagation();const t=a.dataset.copia;
 if(t){copiar(t);toast('Copiado: pega y envía en el chat de '+a.dataset.bot);}window.__ultimoCopiado=t;const h=a.href;const go=()=>{window.__abrirEnlace?window.__abrirEnlace(h):location.href=h;};if(t)requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(go,2500)));else go();},true);
const pendOK=b=>[...new Set(b.ok||[])];
const lista=(a,b)=>a&&a.length?'<ul>'+a.map(x=>`<li>${E(x)}${b&&(b.ok||[]).includes(x)?btnsItem(b,x):''}</li>`).join('')+'</ul>':SD;
function barras(dia,dias=14){const out=[];let mx=1;const hoy=new Date();for(let i=dias-1;i>=0;i--){const d=new Date(hoy-i*864e5);const k=d.toLocaleDateString('en-CA',{timeZone:'America/Chihuahua'});const v=dia?.[k]||[0,0];out.push([k,v]);mx=Math.max(mx,v[0]+v[1]);}
 return `<div class="mbars">${out.map(([k,v])=>`<div title="${k}: ${v[0]} peticiones, ${v[1]} respuestas"><i style="height:${(v[0]+v[1])/mx*100}%"></i><s style="height:${v[0]/mx*100}%"></s></div>`).join('')}</div><div class="mleg"><span><s></s> peticiones de Rob</span><span><i></i> respuestas del bot</span> · últimos ${dias} días</div>`;}
export function fichaMando(id,base){if(!MANDO)return null;const b=MANDO.bots.find(x=>x.id===id);if(!b)return null;
 const esp=b.estado==='esperando'&&b.pendiente;const st=b.stats||{};
 const tabs={Ahora:`<h4>En qué está</h4><p>${b.tarea?E(b.tarea):SD}</p><h4>${esp?'Esperando':'Pendiente principal'}</h4><p>${b.pendiente?E(b.pendiente):SD}${(b.ok||[]).includes(b.pendiente)?btnsItem(b,b.pendiente):''}</p>${esp?'<p class="s">De: Rob (según el reporte del supervisor)</p>':''}
   <h4>Lo último que trabajó</h4>${b.ultimo?`<p class="s">${fh(b.ultimo.t)}</p><p>${E(b.ultimo.txt)}</p>`:SD}<p class="s">Supervisor: última actividad ${E(b.sup_ultima||'sin datos')}</p>`,
  Pendientes:`<h4>Pendientes (reporte del supervisor)</h4>${lista(b.pendientes,b)}`,
  Historial:`${(b.historial||[]).length?'<ol class="mtl">'+b.historial.map(h=>`<li><b>${fh(h.t)}</b>${E(h.txt)}</li>`).join('')+'</ol>':SD}${b.rutinas?'<h4>Corridas de rutinas</h4><ol class="mtl">'+b.rutinas.map(h=>`<li><b>${E(h.t)}</b>${E(h.txt)}${h.err&&h.err!=='ninguno'?` <em>(${E(h.err)})</em>`:''}</li>`).join('')+'</ol>':''}`,
  Estadísticas:`${barras(st.por_dia)}<div class="mkpi"><div><b>${st.mensajes??'—'}</b>mensajes totales</div><div><b>${st.peticiones??'—'}</b>peticiones de Rob</div><div><b>${(b.pendientes||[]).length}</b>pendientes</div></div>
   <p class="s">Activo desde ${fh(st.desde)||'sin datos'} · última actividad ${fh(st.ultima_actividad)||'sin datos'}</p><h4>Estados registrados</h4>${linea(id)}`};
 const k=Object.keys(tabs);
 return `<div class="mhead">${base}<div>${ir(b)}</div></div><div class="mtabs">${k.map((t,i)=>`<button data-t="${i}" class="${i?'':'on'}">${t}</button>`).join('')}</div>${k.map((t,i)=>`<div class="mtab" data-p="${i}" ${i?'hidden':''}>${tabs[t]}</div>`).join('')}`;}
document.addEventListener('click',e=>{const t=e.target.closest('.mtabs button');if(!t)return;const r=t.closest('#ficha,#mpanel');r.querySelectorAll('.mtabs button').forEach(x=>x.classList.toggle('on',x===t));r.querySelectorAll('.mtab').forEach(p=>p.hidden=p.dataset.p!==t.dataset.t);});
const CE={trabajando:'#3B82F6',esperando:'#22C55E',pausa:'#9CA3AF',inactivo:'#6B7280'};
function linea(id){const s=(MANDO.snapshots||[]).slice(-60);if(s.length<2)return `<p class="s">Se acumula con cada corrida del recolector (${s.length} registro${s.length===1?'':'s'} hasta ahora).</p>`+(s.length?`<div class="mline">${s.map(x=>`<i style="background:${CE[x.e[id]]||'#333'}" title="${x.t}"></i>`).join('')}</div>`:'');
 return `<div class="mline">${s.map(x=>`<i style="background:${CE[x.e[id]]||'#333'}" title="${x.t}: ${x.e[id]||'?'}"></i>`).join('')}</div>`;}
// ---------- panel global ----------
function pintarPanel(){const p=$('#mpanel');if(!p||!MANDO)return;const B=MANDO.bots;const c={};B.forEach(b=>c[b.estado]=(c[b.estado]||0)+1);
 const hoy=new Date(),k14=[...Array(14)].map((_,i)=>new Date(hoy-(13-i)*864e5).toLocaleDateString('en-CA',{timeZone:'America/Chihuahua'}));
 const tot=B.map(b=>[b,k14.reduce((s,k)=>s+((b.stats?.por_dia?.[k]||[0,0])[0]),0)]).sort((a,b)=>b[1]-a[1]);const mx=Math.max(1,...tot.map(x=>x[1]));
 const tl=B.flatMap(b=>(b.historial||[]).slice(0,4).map(h=>({...h,n:b.nombre}))).sort((a,b)=>b.t<a.t?-1:1).slice(0,25);
 const aut=B.map(b=>[b,pendOK(b)]).filter(x=>x[1].length);const esp=B.filter(b=>b.pendiente&&b.estado!=='pausa');
 p.innerHTML=`<div class="mt">📊 Centro de mando <button class="mx" onclick="this.closest('#mpanel').hidden=true">✕</button></div><p class="s">Datos al ${fh(MANDO.generado)}</p>
 <div class="mkpi">${['trabajando','esperando','pausa','inactivo'].filter(e=>c[e]).map(e=>`<div><b style="color:${CE[e]}">${c[e]}</b>${EST[e]}</div>`).join('')}</div>
 <div class="mtabs"><button data-t="0" class="on">Por autorizar</button><button data-t="4">Esperan algo</button><button data-t="1">Actividad</button><button data-t="2">Línea de tiempo</button><button data-t="3">Fuentes</button></div>
 <div class="mtab" data-p="0"><p class="s">Pendientes por autorizar (se autorizan en el chat de cada bot)</p>${aut.length?aut.map(([b,it])=>`<div class="maut"><div class="mt2"><b>${E(b.nombre)}</b>${ir(b,'Ir a autorizar')}</div><ul>${it.map(x=>`<li>${E(x)}${btnsItem(b,x)}</li>`).join('')}</ul></div>`).join(''):SD}</div><div class="mtab" data-p="4" hidden>${esp.length?'<ul class="mesp">'+esp.map(b=>`<li><b>${E(b.nombre)}</b> ${E(b.pendiente)} ${ir(b)}</li>`).join('')+'</ul>':SD}</div>
 <div class="mtab" data-p="1" hidden><p class="s">Peticiones de Rob por bot, últimos 14 días</p>${tot.map(([b,v])=>`<div class="mrow"><span>${E(b.nombre)}</span><div><i style="width:${v/mx*100}%"></i></div><b>${v}</b></div>`).join('')}</div>
 <div class="mtab" data-p="2" hidden><ol class="mtl">${tl.map(h=>`<li><b>${fh(h.t)} · ${E(h.n)}</b>${E(h.txt)}</li>`).join('')}</ol></div>
 <div class="mtab" data-p="3" hidden><ul>${Object.entries(MANDO.fuentes||{}).map(([k,v])=>`<li><b>${E(k)}:</b> ${E(v)}</li>`).join('')}</ul></div>`;}

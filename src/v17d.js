// v17d: un solo panel abierto a la vez + botón Atrás del celular regresa al inicio
const IDS=['v13lista','v15busca','v13tab','v16pop','v17pizarron','mpanel','mcpanel','ficha'];
const el=id=>document.getElementById(id);
function abierto(e){if(!e)return false;if(e.id==='mcpanel')return !e.classList.contains('plegado');if(e.id==='ficha')return e.style.display==='block';return !e.hidden&&getComputedStyle(e).display!=='none';}
function cerrar(e){if(!abierto(e))return;if(e.id==='mcpanel'){e.classList.add('plegado');return;}if(e.id==='ficha'){window.cerrarFicha?window.cerrarFicha():(e.style.display='none');return;}e.hidden=true;}
const prev={};let popping=false;
function revisar(){for(const id of IDS){const e=el(id),a=abierto(e);if(a&&!prev[id]){
   // se abrió uno nuevo: cierra los demás (mcpanel solo se pliega en celular)
   for(const o of IDS)if(o!==id&&!(o==='mcpanel'&&innerWidth>900)&&!(id==='ficha'&&o==='mcpanel'&&innerWidth>900)){const x=el(o);if(abierto(x)){cerrar(x);prev[o]=false;}}
   if(!popping&&id!=='mcpanel')history.pushState({v17d:id},'');}
  prev[id]=a;}}
new MutationObserver(revisar).observe(document.body,{subtree:true,attributes:true,attributeFilter:['hidden','class','style']});
// cambios de vista 3D también entran al historial
let ultV='apilada';
setInterval(()=>{const v=window.__v17?.estado?.();if(!v)return;const k=v.vista+':'+v.pisoSel;if(k!==ultV){if(!popping&&v.vista!=='apilada')history.pushState({v17d:'vista'},'');ultV=k;}
 const d=window.__v17.dist?.();if(d)document.body.classList.toggle('v17lejos',v.vista!=='piso'&&d>34);},300);
history.replaceState({v17d:'inicio'},'');history.pushState({v17d:'base'},'');
addEventListener('popstate',()=>{popping=true;
 const ab=IDS.filter(id=>id!=='mcpanel'&&abierto(el(id)));
 if(ab.length)ab.forEach(id=>cerrar(el(id)));
 else{const v=window.__v17?.estado?.();if(v&&v.vista!=='apilada')window.__v17.vista('apilada');}
 // nunca salir del sitio: siempre deja una entrada de base
 if(!history.state||history.state.v17d==='inicio')history.pushState({v17d:'base'},'');
 setTimeout(()=>{popping=false;revisar();},50);});
// v17d-1: fila de botones en flujo (sin encimarse) + un solo listado a la izquierda
const fila=document.createElement('div');fila.id='v17fila';document.body.appendChild(fila);
const st=document.createElement('style');st.textContent=`
#v17fila{position:fixed;left:8px;right:8px;z-index:31;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px;pointer-events:none}
#v17fila>*{position:static!important;transform:none!important;margin:0!important;pointer-events:auto;white-space:nowrap;flex:0 0 auto}
#v17fila>[hidden]{display:none!important}
#v17fila #v17volver{font:700 12px Inter,sans-serif;padding:8px 12px;border-radius:12px}
#v17eq{border:0;border-radius:12px;padding:8px 12px;font:600 12px Inter,sans-serif;color:#9fe0ff;background:rgba(14,17,24,.86);cursor:pointer}
body.v17d-mov #mcpanel.plegado{display:none!important}
body.v17d-mov #v17fila{justify-content:flex-start}
body.v17d-esc #vivo{display:none!important}
body.v17d-esc #v17eq{display:none}`;document.head.appendChild(st);
const eq=document.createElement('button');eq.id='v17eq';eq.textContent='☰ Equipo';eq.onclick=()=>{const m=el('mcpanel');m&&m.classList.toggle('plegado');};
const vis=e=>e&&!e.hidden&&e.getClientRects().length&&getComputedStyle(e).display!=='none';
let escIni=false;
function acomodar(){const mov=innerWidth<700;document.body.classList.toggle('v17d-mov',mov);document.body.classList.toggle('v17d-esc',!mov);
 if(!eq.parentNode)fila.appendChild(eq);
 for(const id of ['bact','mpanelb','msalir','v17volver'])if(el(id)&&el(id).parentNode!==fila)fila.appendChild(el(id));
 const m=el('mcpanel');if(!mov&&m&&!escIni){m.classList.remove('plegado');escIni=true;}
 // fila debajo de barra superior, aviso y (en cel) leyenda
 let y=0;for(const id of ['v13bar','v15viejo'].concat(mov?['leyenda']:[])){const e=el(id);if(vis(e)){const r=e.getBoundingClientRect();if(r.top<160)y=Math.max(y,r.bottom);}}
 fila.style.top=(y+6)+'px';
 if(!mov){const eqp=el('equipo'),mm=el('mcpanel');fila.style.left=(vis(mm)?mm.getBoundingClientRect().right+12:250)+'px';fila.style.right=(vis(eqp)?innerWidth-eqp.getBoundingClientRect().left+12:8)+'px';}else{fila.style.left='8px';fila.style.right='8px';}
 const fb=fila.getBoundingClientRect().bottom;
 if(m){if(mov){m.style.width='';m.style.top=(fb+6)+'px';m.style.left='8px';const nv=el('v17nav');m.style.bottom=m.classList.contains('plegado')?'':(vis(nv)?innerHeight-nv.getBoundingClientRect().top+8:96)+'px';}else{const v=el('vivo'),r=v&&v.getBoundingClientRect();m.style.top=(Math.max(y,40)+14)+'px';m.style.left='12px';if(m.classList.contains('plegado')){m.style.width='';m.style.bottom='';}else{m.style.width='230px';const t=el('term');m.style.bottom=(t?innerHeight-t.getBoundingClientRect().top+10:96)+'px';}}}}
addEventListener('resize',acomodar);document.addEventListener('click',()=>setTimeout(acomodar,0),true);document.addEventListener('click',()=>setTimeout(acomodar,30));setInterval(acomodar,700);setTimeout(acomodar,50);

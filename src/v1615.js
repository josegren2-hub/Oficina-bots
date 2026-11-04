// v16.15: datos viejos, atajos ?abrir=, buscador/filtro por departamento, posponer, siguiente pendiente, notas locales, punto rojo de rutina.
import {MANDO} from './mando.js';import {posponer} from './v1613.js';
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DEP={'Tinta Rosa':['mateo','tr-editor','tr-cm','tadeo'],'Personal':['ted','luna','vale','emiliano'],'Jurídico y Finanzas':['julian','ines'],'Proyectos':['ceo','apps','libro','rulo','director','luca']};
const VIEJO_ESTADO=30*60e3,VIEJO_MANDO=24*3600e3;
let actualizado=null,latido=null; // v16.16: latido = señal de vida aunque no cambien estados
async function leerEstado(){try{const j=await (await fetch('./estado.json?v15='+Date.now(),{cache:'no-store'})).json();actualizado=j.actualizado;latido=j.salud?.latido||null;}catch(e){}pintarViejo();}
function pintarViejo(){const d=document.getElementById('v15viejo');const m=[];const t=Math.max(Date.parse(actualizado)||0,Date.parse(latido)||0);
 if(actualizado&&Date.now()-t>(latido?45*60e3:VIEJO_ESTADO))m.push(`Estados sin actualizar desde hace ${Math.round((Date.now()-t)/60e3)} min`);
 if(MANDO?.generado){const g=Date.parse(MANDO.generado);if(Date.now()-g>VIEJO_MANDO)m.push(`Centro de mando con datos de hace ${Math.floor((Date.now()-g)/3600e3)} h`);}
 d.hidden=!m.length;d.textContent='⚠️ '+m.join(' · ');}
// punto rojo sobre el bot (rutina fallida / no corrió) y morado (callado): capa 2D ligera, 1 vez por segundo
function puntos(){const c=document.getElementById('v15puntos');if(!MANDO||!window.__botPantalla){c.innerHTML='';return;}let h='';
 for(const b of MANDO.bots){const r=b.rutina,mal=r&&(r.fallo||r.no_corrio);if(!mal&&!b.callado)continue;let p;try{p=window.__botPantalla(b.id);}catch(e){continue;}if(!p||p.x==null||p.z>1)continue;
  h+=`<i class="v15p ${mal?'rojo':'callado'}" style="left:${p.x}px;top:${p.y-18}px" title="${mal?'Rutina con problema':'Callado'}"></i>`;}
 c.innerHTML=h;}
// buscador + filtro por departamento (cámara al área)
function enfocar(ids){const P=(window.__pos?.()||[]).filter(([k])=>ids.includes(k));if(!P.length)return;const x=P.reduce((a,p)=>a+ +p[1],0)/P.length,z=P.reduce((a,p)=>a+ +p[2],0)/P.length;window.__volar?.(x,z,14);}
function pintarBusca(){const q=document.getElementById('v15q').value.trim().toLowerCase();const dep=document.querySelector('#v15busca .chip.on')?.dataset.dep;
 const D=window.__datos?.()||[];const L=D.filter(b=>(!dep||DEP[dep].includes(b.id))&&(!q||(b.nombre+' '+b.area+' '+(b.areaN||'')).toLowerCase().includes(q)));
 document.getElementById('v15res').innerHTML=L.map(b=>`<div class="f" data-id="${E(b.id)}"><span class="d e-${b.estado==='esperando'?'te':b.estado}" style="margin:0"></span><div class="lx"><b>${E(b.nombre)}</b><div class="s">${E(b.areaN||b.area)}</div></div><span class="lir">›</span></div>`).join('')||'<p class="s">Sin resultados.</p>';}
export function iniciarV1615(){
 const v=document.createElement('div');v.id='v15viejo';v.className='glass';v.hidden=true;
 const pc=document.createElement('div');pc.id='v15puntos';
 const bb=document.createElement('button');bb.id='v15bb';bb.className='glass';bb.textContent='🔎 Buscar';
 const bp=document.createElement('div');bp.id='v15busca';bp.className='glass';bp.hidden=true;
 bp.innerHTML=`<div class="lt"><b>🔎 Buscar bot</b><button class="lcerrar">✕</button></div><input id="v15q" type="search" placeholder="Nombre o área…"><div class="chips">${Object.keys(DEP).map(d=>`<button class="chip" data-dep="${E(d)}">${E(d)}</button>`).join('')}</div><div id="v15res"></div>`;
 document.body.append(v,pc,bp);const vb=document.getElementById('v13bar');vb.insertBefore(bb,vb.querySelector('.v13res'));bb.className='v15bb';
 bb.onclick=()=>{bp.hidden=!bp.hidden;if(!bp.hidden){pintarBusca();}};
 bp.addEventListener('input',pintarBusca);
 bp.addEventListener('click',e=>{if(e.target.closest('.lcerrar')){bp.hidden=true;return;}
  const ch=e.target.closest('.chip');if(ch){const on=!ch.classList.contains('on');bp.querySelectorAll('.chip').forEach(c=>c.classList.remove('on'));if(on){ch.classList.add('on');enfocar(DEP[ch.dataset.dep]);}pintarBusca();return;}
  const f=e.target.closest('.f[data-id]');if(f){bp.hidden=true;window.__abrirFicha?.(f.dataset.id);}});
 // ficha: posponer, notas, siguiente
 document.addEventListener('click',e=>{const p=e.target.closest('[data-pos]');if(p){posponer(p.dataset.id,p.dataset.pos);document.getElementById('ficha').style.display='none';return;}
  if(e.target.closest('.v15sigf')){document.querySelector('#v13lista .v15sig')?.click()||(window.__v13.abrirLista(),setTimeout(()=>document.querySelector('#v13lista .v15sig')?.click(),0));}});
 document.addEventListener('input',e=>{const t=e.target.closest('[data-nota]');if(!t)return;const n=JSON.parse(localStorage.getItem('v15notas')||'{}');if(t.value.trim())n[t.dataset.nota]=t.value;else delete n[t.dataset.nota];localStorage.setItem('v15notas',JSON.stringify(n));});
 window.__v15={repintar:()=>{window.__v13?.pintarBarra();window.__v13?.pintarTablero();},sigBoton:()=>{setTimeout(()=>{const f=document.querySelector('#ficha .v13f');if(f&&!f.querySelector('.v15sigf'))f.insertAdjacentHTML('beforeend','<button class="v15sigf">▶ Siguiente pendiente</button>');},50);}};
 // atajos del manifest: ?abrir=esperan|resumen|mando|buscar
 const ab=new URLSearchParams(location.search).get('abrir');
 if(ab)setTimeout(()=>{if(ab==='esperan')window.__v13?.abrirLista();else if(ab==='resumen')window.__v13?.abrirResumen();else if(ab==='buscar')bb.click();else if(ab==='mando'){const b=document.getElementById('mpanelb');if(b&&!b.hidden)b.click();else{const l=document.getElementById('mlock');if(l)l.style.display='';}}},2500);
 leerEstado();setInterval(leerEstado,120e3);setInterval(pintarViejo,60e3);let mPrev=null;setInterval(()=>{puntos();if(MANDO!==mPrev){mPrev=MANDO;window.__v15.repintar();pintarViejo();}},1000);}

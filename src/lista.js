// v16.16: modo "Solo lista" — sin Three.js. Reutiliza Centro de mando, Te esperan, Resumen, buscador, salud y racha.
import './estilo.css';
import {iniciarMando,fichaMando,MANDO} from './mando.js';import {iniciarV1613,extraFicha} from './v1613.js';import {iniciarV1615} from './v1615.js';import {iniciarV1616,rapidas} from './v1616.js';
iniciarMando();document.body.classList.add('lista');
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DEP={'Tinta Rosa':['mateo','tr-editor','tr-cm','tadeo'],'Personal':['ted','luna','vale','emiliano'],'Jurídico y Finanzas':['julian','ines'],'Proyectos':['ceo','apps','libro','rulo','director','luca']};
const AREA=Object.fromEntries(Object.entries(DEP).flatMap(([n,ids])=>ids.map(i=>[i,n])));
const NOMB={tadeo:'Tadeo · Web y Sitio',mateo:'Mateo · Director Tinta Rosa',julian:'Julián · Jurídico',ines:'Inés · Finanzas',vale:'Valery · Redes Personales',rulo:'Rulo · Podcast · Productor',emiliano:'Emiliano · Salud · Entrenador',libro:'Rodrigo · Libro',apps:'Charly · Apps',ceo:'Tommy · CEO Digital','tr-editor':'Naim · TR Editor Jefe','tr-cm':'Dany · TR Community Manager',director:'Joss · Director de video',luca:'Luca · Técnico Digital'};
const TXT={trabajando:'Trabajando ahora',esperando:'Disponible',pausa:'En pausa',te:'Te espera'},COL={trabajando:'#3B82F6',esperando:'#9CA3AF',pausa:'#4B5563',te:'#F97316'};
let B=[],act=null,filtro=null;const EK=b=>b.estado==='esperando'?'te':b.estado;
const h=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Chihuahua'})).getHours();if(localStorage.getItem('oficinaModo')==='noche'||(localStorage.getItem('oficinaModo')!=='dia'&&(h>=19||h<7)))document.body.classList.add('noche');
window.__datos=()=>B.map(b=>({...b,areaN:AREA[b.id]||''}));window.__vivo=id=>B.find(b=>b.id===id)?.estado;
window.__conteos=()=>{const c={te:0,trabajando:0,esperando:0,pausa:0};B.forEach(b=>c[EK(b)]++);return c;};
window.__abrirListaEstado=k=>{filtro=filtro===k?null:k;pintar();document.getElementById('mpanel')&&(document.getElementById('mpanel').hidden=true);};
window.__repintar=()=>pintar();
const av=b=>`<img class="av" src="./avatares/${E(b.id)}.webp" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`;
function abrirFicha(id){const b=B.find(x=>x.id===id);if(!b)return;const f=document.getElementById('ficha');const _h=`${av(b)}<b>${E(b.nombre)}</b><div>${E(b.area)}</div><div class="s">${E(AREA[b.id]||'')}</div><div style="color:${COL[EK(b)]};font-weight:700;margin:6px 0">${TXT[EK(b)]}</div><div>“${E(b.frase)}”</div>${extraFicha(b)}`;
 const _m=fichaMando(id,_h);f.innerHTML=(_m||_h)+'<button class="cerrar" aria-label="Cerrar">✕</button>';f.style.display='block';f.scrollTop=0;}
window.__abrirFicha=abrirFicha;
function pintar(){const L=document.getElementById('l16');if(!L)return;const c=window.__conteos();const M=Object.fromEntries(B.map(b=>[b.id,b]));
 const ac=[['te','Te esperan'],['trabajando','Trabajando'],['esperando','Disponibles'],['pausa','En pausa']];
 L.innerHTML=`<div class="l16k">${ac.map(([k,t])=>`<button data-k="${k}" class="${filtro===k?'on':''}"><b style="color:${COL[k]}">${c[k]}</b> ${t}</button>`).join('')}</div><p class="s">Actualizado ${act?E(act.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})):'—'} · ${filtro?'filtro: '+E(TXT[filtro])+' (toca otra vez para quitar)':'toca un bot para ver su tarjeta'}</p>`+
 Object.entries(DEP).map(([n,ids])=>{const r=ids.map(i=>M[i]).filter(b=>b&&(!filtro||EK(b)===filtro));if(!r.length)return'';return `<h3>${E(n)}</h3>`+r.map(b=>{const m=MANDO?.bots?.find(x=>x.id===b.id);return `<div class="f" data-id="${E(b.id)}">${av(b)}<div class="lx"><b>${E(b.nombre)}</b><div class="s"><span style="color:${COL[EK(b)]};font-weight:700">● ${TXT[EK(b)]}</span> · ${E(b.frase)}</div>${b.estado==='esperando'?rapidas(m):''}</div><span class="lir">›</span></div>`;}).join('');}).join('')+
 `<p class="s l16pie">Vista ligera sin 3D. Para volver a la oficina toca “🏢 3D”.</p>`;}
async function cargar(){try{const j=await (await fetch('./estado.json?t='+Date.now(),{cache:'no-store'})).json();if(j.bots&&!j.bots.some(b=>b.id==='luca'))j.bots.push({id:'luca',nombre:'Luca · Técnico Digital',area:'Técnico Digital · soporte',estado:'pausa',frase:'Soporte técnico de la oficina'});
 (j.bots||[]).forEach(b=>{if(NOMB[b.id])b.nombre=NOMB[b.id];if(!TXT[b.estado])b.estado='esperando';});B=j.bots||[];act=new Date(j.actualizado);pintar();window.__trasCargar?.();}catch(e){console.warn(e)}}
const L=document.createElement('main');L.id='l16';document.body.appendChild(L);
L.addEventListener('click',e=>{const k=e.target.closest('.l16k button');if(k){window.__abrirListaEstado(k.dataset.k);return;}const f=e.target.closest('.f[data-id]');if(f)abrirFicha(f.dataset.id);});
const fi=document.getElementById('ficha');fi.addEventListener('click',e=>{if(e.target.closest('.cerrar'))fi.style.display='none';});
document.addEventListener('click',e=>{if(fi.style.display==='block'&&!fi.contains(e.target)&&!e.target.closest('.f,#v13bar,#v13lista,#v13tab,#mpanel,#v16pop,#mlock,#v15busca'))fi.style.display='none';});
document.getElementById('bact')?.addEventListener('click',()=>location.reload());
iniciarV1613();iniciarV1615();iniciarV1616('lista');cargar();setInterval(cargar,60e3);

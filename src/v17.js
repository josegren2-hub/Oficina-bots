// v17: edificio de 5 pisos (solo capa visual y navegación). No toca datos, cifrado, estado vivo ni funciones de v16.x:
// usa window.__datos/__vivo/__teEspera/__abrirFicha/__v13 y MANDO (solo lectura).
import * as THREE from 'three';import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {MANDO} from './mando.js';
const E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const movil=()=>innerWidth<700;
// ---------- plano (propuesta-v17/plano-B-pisos.json, 18×9 u por piso; P4 20×7.5 + terraza) ----------
const PISOS=[
 {id:'PB',n:'PB · Cafetería + Personal',c:0xEBCBA8,bots:{luna:[9.2,2],vale:[12.8,2],emiliano:[11,6.4]}},
 {id:'P1',n:'Piso 1 · Jurídico y Finanzas',c:0xCFC8E2,bots:{julian:[4.4,3.2],ines:[11.4,3.2]}},
 {id:'P2',n:'Piso 2 · Proyectos + Podcast',c:0xCFDCBC,bots:{ceo:[2.3,1.8],apps:[5.8,1.8],libro:[9.3,1.8],director:[2.3,6.2],luca:[5.8,6.2],rulo:[14.4,6.6]}},
 {id:'P3',n:'Piso 3 · Tinta Rosa',c:0xEDC3C6,bots:{mateo:[2.5,2.2],tadeo:[8.6,1.8],'tr-editor':[12.4,1.8],'tr-cm':[9.8,6.2]}},
 {id:'P4',n:'Piso 4 · Penthouse de Ted',c:0xD9CDBB,bots:{ted:[4.6,2.6]},grande:1}];
const PISO_DE={};PISOS.forEach((p,i)=>Object.keys(p.bots).forEach(b=>PISO_DE[b]=i));
const H=3,GAP=1.0;
// ---------- materiales baratos (Lambert, sin sombras) ----------
const ML=(c,o={})=>new THREE.MeshLambertMaterial({color:c,...o});
const MAT={losa:ML(0xF4F1EC),muro:ML(0xF6F3EE),muro2:ML(0xE9E4DC),madera:ML(0xC89F74),mesa:ML(0xD8B48A),oscuro:ML(0x3a3632),silla:ML(0x2f3136),
 pantalla:ML(0x9fd0f5,{emissive:0x5aa8e8,emissiveIntensity:.8}),vidrio:new THREE.MeshLambertMaterial({color:0xdcebf3,transparent:true,opacity:.16,depthWrite:false}),
 marco:ML(0xB9BEC4),planta:ML(0x4f8a45),maceta:ML(0xC9C2B8),elev:ML(0xB7C6D0),cafe:ML(0x8a5a3c),podcast:ML(0x5B4A70),espuma:ML(0x3d3550),
 onair:new THREE.MeshBasicMaterial({color:0xff4d5e}),lampara:ML(0x222222,{emissive:0xffe0a8,emissiveIntensity:0}),terraza:ML(0xC9A27A),camastro:ML(0xF5EBDD),
 alfTR:ML(0xF2B8C4),alfP1:ML(0xBBB2D8),cuadro1:ML(0xC0392B),cuadro2:ML(0xD9A43B),cuadro3:ML(0x3E6B4A)};
// ---------- utilidades de geometría combinada por material ----------
function Edif(){const acc=new Map();const g=new THREE.Group();
 const box=(w,h,d,m,x,y,z,ry=0)=>{const b=new THREE.BoxGeometry(w,h,d);if(ry)b.rotateY(ry);b.translate(x,y,z);(acc.get(m)||acc.set(m,[]).get(m)).push(b);};
 const cil=(r,h,m,x,y,z,r2=r,n=10)=>{const b=new THREE.CylinderGeometry(r,r2,h,n);b.translate(x,y,z);(acc.get(m)||acc.set(m,[]).get(m)).push(b);};
 const esf=(r,m,x,y,z)=>{const b=new THREE.IcosahedronGeometry(r,1);b.translate(x,y,z);(acc.get(m)||acc.set(m,[]).get(m)).push(b);};
 const fin=()=>{for(const [m,gs] of acc){const me=new THREE.Mesh(mergeGeometries(gs.map(x=>x.index?x.toNonIndexed():x)),MAT[m]);me.matrixAutoUpdate=false;me.updateMatrix();g.add(me);}acc.clear();return g;};
 return {g,box,cil,esf,fin};}
function escritorio(E_,x,z,w=1.6,jefe=0){E_.box(w,.05,.8,'mesa',x,.75,z);for(const s of [-1,1])E_.box(.05,.72,.7,'oscuro',x+s*(w/2-.08),.37,z);
 E_.box(.62,.38,.03,'oscuro',x,1.05,z-.25);E_.box(.58,.34,.01,'pantalla',x,1.05,z-.233);if(jefe){E_.box(.62,.38,.03,'oscuro',x+.68,1.05,z-.2);E_.box(.58,.34,.01,'pantalla',x+.68,1.05,z-.183);}
 E_.box(.5,.08,.5,'silla',x,.48,z+.62);E_.box(.5,.5,.06,'silla',x,.78,z+.88);E_.cil(.03,.44,'oscuro',x,.24,z+.62);}
function planta(E_,x,z,s=1){E_.cil(.22*s,.4*s,'maceta',x,.2*s,z,.17*s);E_.esf(.38*s,'planta',x,.62*s,z);E_.esf(.28*s,'planta',x+.15*s,.88*s,z-.1*s);}
function lampara(E_,x,z,y=H){E_.cil(.01,.7,'oscuro',x,y-.35,z);E_.cil(.03,.18,'lampara',x,y-.75,z,.2,10);}
function cascara(E_,W,D,piso,i){// losa + muro trasero + muro izq + barandal de cristal bajo al frente + núcleo de elevador
 E_.box(W+.3,.25,D+.3,'losa',W/2,-.125,D/2);E_.box(W,.02,D,piso,W/2,.01,D/2);
 E_.box(W,H,.15,'muro',W/2,H/2,-.075);E_.box(.15,H,D,'muro2',-.075,H/2,D/2);
 E_.box(W,.9,.03,'vidrio',W/2,.45,D+.02);E_.box(W,.04,.06,'marco',W/2,.92,D+.02);
 if(i<4){E_.box(2.5,H,2.7,'elev',W-1.25,H/2,1.35);E_.box(1,2.1,.04,'marco',W-1.25,1.05,2.72);}
 E_.box(.9,.7,.04,['cuadro1','cuadro2','cuadro3'][i%3],W*.32,1.9,.01);}
function construir(i){const p=PISOS[i],E_=Edif(),W=p.grande?20:18,D=p.grande?11.5:9;
 const pisoMat='piso'+i;MAT[pisoMat]=ML(p.c);cascara(E_,W,D,pisoMat,i);
 if(p.id==='PB'){// cafetería chica a la izquierda (x 0..6.6) para no comerse los cubículos
  E_.box(4.6,1,.6,'cafe',3,.5,1.1);E_.box(4.7,.05,.7,'mesa',3,1.02,1.1);E_.cil(.12,.3,'oscuro',1.6,1.2,1.0);E_.cil(.08,.12,'pantalla',2.3,1.1,1.0);
  E_.box(4.6,.05,.3,'madera',3,2.1,.18);for(const k of [0,1,2,3])E_.box(.18,.25,.18,['cuadro1','cuadro2','cuadro3','cuadro1'][k],1.4+k*.9,2.25,.18);
  for(const [x,z] of [[1.6,5.6],[4.4,5.6],[3,7.6]]){E_.cil(.45,.04,'mesa',x,.72,z,.45,16);E_.cil(.05,.7,'oscuro',x,.36,z);for(const a of [0,2.1,4.2])E_.box(.36,.06,.36,'silla',x+.75*Math.cos(a),.45,z+.75*Math.sin(a));}
  E_.box(.1,1.6,4,'planta',6.9,.8,2.6);planta(E_,.6,8.3,1.1);planta(E_,6.9,8.2);}
 if(p.id==='P1'){E_.box(.5,2.2,2.6,'madera',.35,1.1,3);E_.box(14,.02,5,'alfP1',8,.025,4);planta(E_,7.8,7.6);E_.box(.8,.9,.6,'oscuro',14.6,.45,7.2);}
 if(p.id==='P2'){// estudio de podcast con muros bajos (1.35) para no tapar cubículos
  E_.box(7,.02,6,'espuma',14.5,.025,6);E_.box(7,1.35,.12,'podcast',14.5,.675,3);E_.box(.12,1.35,6,'podcast',11,.675,6);
  E_.box(7,.05,.16,'marco',14.5,1.37,3);E_.box(1.6,.32,.04,'oscuro',13,1.55,3.0);E_.box(1.5,.24,.02,'onair',13,1.55,2.97);
  E_.box(2.4,.05,1,'oscuro',14.4,.75,5.6);E_.cil(.03,.35,'oscuro',14,1,5.4);E_.esf(.07,'oscuro',14,1.2,5.4);E_.cil(.03,.35,'oscuro',14.9,1,5.4);E_.esf(.07,'oscuro',14.9,1.2,5.4);
  E_.box(.5,.08,.5,'silla',14.4,.48,6.6);planta(E_,10,8.2);}
 if(p.id==='P3'){E_.box(5,.02,5,'alfTR',2.5,.025,2.5);// oficina de Mateo: cristal transparente sin marco
  E_.box(5,H-.05,.03,'vidrio',2.5,H/2,5);E_.box(.03,H-.05,5,'vidrio',5,H/2,2.5);planta(E_,.6,4.3);planta(E_,16.5,8);E_.box(.3,1.2,.3,'cuadro1',.3,.6,8);}
 if(p.id==='P4'){// penthouse: ventanales limpios, oficina de Ted dominante, sala de juntas de 16, terraza
  const D4=7.5;E_.box(W,.02,4,'terraza',W/2,.03,D4+2);for(const x of [3,7.5,12.5,17])E_.box(1.8,.25,.8,'camastro',x,.15,D4+2.2);
  E_.box(W,H+.6-.1,.03,'vidrio',W/2,(H+.6)/2,D4);E_.box(W,.04,.04,'marco',W/2,H+.58,D4);
  // muros perimetrales: vidrio limpio en lugar de muro trasero/izq.
  E_.box(.03,H+.6,D4,'vidrio',W+.02,(H+.6)/2,D4/2);E_.box(9.5,.02,5.5,'alfP1',4.75,.025,2.75);
  E_.box(9.5,H,.03,'vidrio',4.75,H/2,5.5);E_.box(.03,H,5.5,'vidrio',9.5,H/2,2.75);
  E_.box(3.2,.08,1.3,'oscuro',4.6,.78,2.2);E_.box(3,.7,.2,'oscuro',4.6,.4,1.7);
  E_.box(.62,.4,.03,'oscuro',4.1,1.1,1.85);E_.box(.58,.36,.01,'pantalla',4.1,1.1,1.865);E_.box(.62,.4,.03,'oscuro',5.1,1.1,1.85);E_.box(.58,.36,.01,'pantalla',5.1,1.1,1.865);
  E_.box(.7,.1,.7,'silla',4.6,.5,2.95);E_.box(.7,.75,.1,'silla',4.6,.9,3.3);E_.box(.6,2.2,1.6,'madera',.4,1.1,2.4);E_.box(2.4,.45,.9,'cuadro2',7.6,.25,4.4);planta(E_,9,4.8,1.2);planta(E_,.7,4.8,1.1);
  // sala de juntas (más chica) 16 lugares: 7 por lado + 2 cabeceras
  E_.box(5.2,.06,1.5,'oscuro',13.75,.76,2.6);for(const s of [-1,1])E_.box(.1,.72,1.2,'oscuro',13.75+s*2.3,.37,2.6);
  for(let k=0;k<7;k++)for(const s of [-1,1])E_.box(.42,.5,.42,'silla',11.55+k*.73,.3,2.6+s*1.15);for(const s of [-1,1])E_.box(.42,.5,.42,'silla',13.75+s*3.05,.3,2.6);
  E_.box(7.4,H,.03,'vidrio',13.75,H/2,5.5);E_.box(.03,H,5.5,'vidrio',17.45,H/2,2.75);E_.box(2,.02,7.5,'losa',19,.03,3.75);
  for(const x of [3,6.5,12,15.5])lampara(E_,x,2.6,H+.6);}
 if(p.id!=='P4')for(const x of [3,8,13])lampara(E_,x,4);
 for(const [id,[x,z]] of Object.entries(p.bots)){if(id==='ted'||id==='rulo')continue;escritorio(E_,x,z,id==='mateo'||id==='ceo'?1.9:1.6,id==='mateo'||id==='ceo'||id==='julian'||id==='ines');}
 const g=E_.fin();g.userData={i,W,D:p.grande?11.5:9,alto:p.grande?H+.6:H};return g;}
// ---------- personitas sencillas (sentadas) ----------
const COLE={trabajando:0x3B82F6,te:0xF97316,esperando:0x9CA3AF,pausa:0x6B7280};
const gCuerpo=new THREE.CapsuleGeometry(.2,.35,4,8),gCab=new THREE.SphereGeometry(.17,12,10),gAro=new THREE.TorusGeometry(.38,.035,6,24).rotateX(Math.PI/2);
function persona(){const g=new THREE.Group();const mc=ML(0x3B82F6),cu=new THREE.Mesh(gCuerpo,mc);cu.position.y=.82;const ca=new THREE.Mesh(gCab,ML(0xF1D3B8));ca.position.y=1.28;const ar=new THREE.Mesh(gAro,new THREE.MeshBasicMaterial({color:0x3B82F6}));ar.position.y=.03;g.add(cu,ca,ar);g.userData={mc,ar,ca};return g;}
// ---------- estado del módulo ----------
let R,S,cam,ctl,ED,PG=[],PER={},vista='apilada',pisoSel=-1,anim=null,sucio=true,capa,nav,bVolver,piz,pizPin;
const LAY={};
function layouts(){const lay={apilada:[],lado:[]};let y=0;PISOS.forEach((p,i)=>{lay.apilada[i]=new THREE.Vector3(p.grande?-1:0,y,0);y+=(p.grande?H+.6:H)+GAP;});
 // lado a lado: en celular 2 columnas (P4 arriba a lo ancho); en escritorio una fila
 const port=innerHeight>innerWidth;if(port){const pos=[[0,3],[1,3],[0,2],[1,2]];[0,1,2,3].forEach(i=>lay.lado[i]=new THREE.Vector3(pos[i][0]*20,0,pos[i][1]*13));lay.lado[4]=new THREE.Vector3(8,0,11.5);}
 else PISOS.forEach((p,i)=>lay.lado[i]=new THREE.Vector3(i*22,0,0));return lay;}
const DIR=new THREE.Vector3(1.05,.95,1.5).normalize();
function encuadre(idx,dirOverride){const b=new THREE.Box3();for(const i of idx){const g=PG[i];const u=g.userData;const p=g.position;b.expandByPoint(new THREE.Vector3(p.x,p.y,p.z));b.expandByPoint(new THREE.Vector3(p.x+u.W,p.y+u.alto,p.z+u.D));}
 const c=b.getCenter(new THREE.Vector3()),sz=b.getSize(new THREE.Vector3());const dir=dirOverride||DIR;
 const fov=cam.fov*Math.PI/180,asp=cam.aspect;const r=Math.max(sz.y*.8+sz.z*.35, (sz.x*.75+sz.z*.5)/asp)*(idx.length===1?.47:.56);const dist=r/Math.tan(fov/2)*1.05;return {t:c,p:c.clone().add(dir.clone().multiplyScalar(dist))};}
function ir(e,dur=.9){anim={t:0,dur,t0:ctl.target.clone(),p0:cam.position.clone(),t1:e.t,p1:e.p,lay:anim?.lay};sucio=true;}
function aplicarVista(v,i=-1){vista=v;pisoSel=i;const lay=layouts();const L=v==='lado'?lay.lado:lay.apilada;
 PG.forEach((g,k)=>{g.userData.p0=g.position.clone();g.userData.p1=L[k].clone();g.visible=v!=='piso'||k===i;});
 // posiciona antes de encuadrar
 PG.forEach(g=>g.position.copy(g.userData.p1));
 const e=v==='piso'?encuadre([i],new THREE.Vector3(.55,1.05,1.25).normalize()):encuadre(PISOS.map((_,k)=>k));
 PG.forEach(g=>g.position.copy(g.userData.p0));anim={t:0,dur:.9,t0:ctl.target.clone(),p0:cam.position.clone(),t1:e.t,p1:e.p,lay:1};
 ctl.enableRotate=v==='piso';ctl.maxDistance=400;
 bVolver.hidden=v!=='piso';nav.querySelectorAll('[data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===v||(v==='piso'&&b.dataset.v===ultimaGeneral)));
 document.getElementById('v17tit').textContent=v==='piso'?PISOS[i].n:v==='lado'?'Todos los pisos · lado a lado':'Edificio · toca un piso';sucio=true;}
let ultimaGeneral='apilada';
// ---------- pines (avatar + estado) ----------
const PIN={};function ek(b){return b.estado==='esperando'?'te':b.estado;}
function pintarPines(){const D=window.__datos?.()||[];for(const b of D){if(!(b.id in PISO_DE))continue;let el=PIN[b.id];
 if(!el){el=document.createElement('div');el.dataset.id=b.id;el.addEventListener('pointerdown',e=>e.stopPropagation());el.addEventListener('click',e=>{e.stopPropagation();window.__abrirFicha?.(b.id);});capa.appendChild(el);PIN[b.id]=el;}
 const k=ek(b);el.className='v17pin '+k;el.innerHTML=`<img src="./avatares/${E(b.id)}.webp" alt=""><span class="sd"></span><em>${E(String(b.nombre||b.id).split(/\s*·\s*/)[0])}</em>`;
 const per=PER[b.id];if(per){per.userData.mc.color.setHex(COLE[k]);per.userData.ar.material.color.setHex(COLE[k]);per.userData.ar.visible=k!=='pausa';}}sucio=true;}
const _v=new THREE.Vector3();
function moverPines(){const w=innerWidth,h=innerHeight,cerca=vista==='piso';for(const [id,el] of Object.entries(PIN)){const per=PER[id];const g=PG[PISO_DE[id]];
 if(!per||!g.visible){el.style.display='none';continue;}per.getWorldPosition(_v);_v.y+=1.75;_v.project(cam);
 if(_v.z>1){el.style.display='none';continue;}el.style.display='';el.classList.toggle('chico',!cerca);el.style.transform=`translate(${(_v.x*.5+.5)*w}px,${(-_v.y*.5+.5)*h}px) translate(-50%,-100%)`;}
 const g4=PG[4];if(g4.visible){_v.set(8.1,1.75,.3).add(g4.position);_v.project(cam);pizPin.style.display='';pizPin.style.transform=`translate(${(_v.x*.5+.5)*w}px,${(-_v.y*.5+.5)*h}px) translate(-50%,-50%)`;pizPin.classList.toggle('chico',vista!=='piso');}else pizPin.style.display='none';}
// ---------- pizarrón "Agenda y pendientes de hoy" ----------
let pizTex,pizCtx;
function pizarra3D(){const c=document.createElement('canvas');c.width=512;c.height=300;pizCtx=c.getContext('2d');pizTex=new THREE.CanvasTexture(c);pizTex.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(2.2,1.3),new THREE.MeshBasicMaterial({map:pizTex}));m.position.set(8.1,1.75,.08);m.userData.piz=1;
 const marco=new THREE.Mesh(new THREE.BoxGeometry(2.3,1.4,.04),ML(0xffffff));marco.position.set(8.1,1.75,.05);PG[4].add(marco,m);dibujarPiz();}
function datosPiz(){if(!MANDO)return null;const a=MANDO.audiencias;const aud=a&&a.estado==='ok'&&Array.isArray(a.items)?a.items:[];const esp=window.__v13?.esperan?.()||[];
 const pend=(MANDO.bots||[]).flatMap(b=>(b.pendientes||[]).map(p=>({id:b.id,n:(window.__datos?.()||[]).find(x=>x.id===b.id)?.nombre||b.id,t:typeof p==='string'?p:(p.texto||p.txt||JSON.stringify(p))})));return {aud,esp,pend,gen:MANDO.generado};}
function dibujarPiz(){if(!pizCtx)return;const x=pizCtx,d=datosPiz();x.fillStyle='#1f2a24';x.fillRect(0,0,512,300);x.fillStyle='#fff';x.font='bold 30px Inter,sans-serif';x.fillText('Agenda y pendientes de hoy',20,46);
 x.font='26px Inter,sans-serif';x.fillStyle='#cfe8d6';if(!d){x.fillText('🔐 Toca para ver (requiere clave)',20,120);}
 else{x.fillText(`📅 ${d.aud.length} audiencia${d.aud.length===1?'':'s'}`,20,110);x.fillText(`🟠 ${d.esp.length} te esperan`,20,160);x.fillText(`📝 ${d.pend.length} pendientes`,20,210);x.fillStyle='#9fb8a8';x.font='20px Inter,sans-serif';x.fillText('Toca para abrir',20,265);}
 pizTex.needsUpdate=true;sucio=true;}
function abrirPiz(){piz.hidden=false;pintarPiz();}
function pintarPiz(){if(piz.hidden)return;const d=datosPiz();let h=`<div class="lt"><b>📋 Agenda y pendientes de hoy</b><button class="lcerrar">✕ Cerrar</button></div>`;
 if(!d)h+='<p class="s">🔐 Solo con el Centro de mando desbloqueado. Sin la clave no se muestra contenido privado.</p>';
 else{h+=`<p class="s">Se actualiza solo · datos al ${E(new Date(d.gen).toLocaleString('es-MX',{timeZone:'America/Chihuahua',hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'}))}</p>`;
  h+='<h4>📅 Audiencias / agenda</h4>'+(d.aud.length?'<ul>'+d.aud.map(x=>`<li><b>${E(x.hora||'')}</b> ${E(x.titulo||x.asunto||x.txt||'')}${x.lugar?` · <span class="s">📍 ${E(x.lugar)}</span>`:''}</li>`).join('')+'</ul>':`<p class="s">${MANDO.audiencias?.estado&&MANDO.audiencias.estado!=='ok'?'Sin datos de audiencias ('+E(MANDO.audiencias.estado)+')':'Sin audiencias.'}</p>`);
  h+='<h4>🟠 Te esperan</h4>'+(d.esp.length?d.esp.map(b=>`<div class="f" data-id="${E(b.id)}"><span class="d e-te" style="margin:0"></span><div class="lx"><b>${E(b.nombre)}</b></div><span class="lir">›</span></div>`).join(''):'<p class="s">Nadie te espera.</p>');
  h+='<h4>📝 Pendientes</h4>'+(d.pend.length?'<ul>'+d.pend.slice(0,30).map(p=>`<li data-id="${E(p.id)}"><b>${E(p.n)}:</b> ${E(p.t)}</li>`).join('')+'</ul>':'<p class="s">Sin pendientes.</p>');}
 piz.innerHTML=h;}
// ---------- arranque ----------
export function iniciarV17(){
 if(new URLSearchParams(location.search).has('clasica')||localStorage.getItem('oficinaV17')==='no')return;
 window.__v17on=true;document.body.classList.add('v17');
 const cv=document.createElement('canvas');cv.id='c17';document.body.prepend(cv);
 R=new THREE.WebGLRenderer({canvas:cv,antialias:!movil(),powerPreference:'high-performance'});R.setPixelRatio(Math.min(devicePixelRatio,movil()?1.75:2));R.outputColorSpace=THREE.SRGBColorSpace;
 S=new THREE.Scene();cam=new THREE.PerspectiveCamera(30,1,.5,600);
 const hl=new THREE.HemisphereLight(0xfff6ea,0xcdbfae,1.6),dl=new THREE.DirectionalLight(0xfff0da,1.6);dl.position.set(-6,14,10);S.add(hl,dl);
 ctl=new OrbitControls(cam,cv);ctl.enableDamping=true;ctl.dampingFactor=.1;ctl.screenSpacePanning=true;ctl.minDistance=6;ctl.maxPolarAngle=1.35;ctl.enableRotate=false;
 ctl.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE};ctl.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};
 ctl.addEventListener('change',()=>sucio=true);ctl.addEventListener('start',()=>{if(anim&&!anim.lay)anim=null;});
 PISOS.forEach((p,i)=>{const g=construir(i);PG.push(g);S.add(g);for(const [id,[x,z]] of Object.entries(p.bots)){const pe=persona();const zz=id==='ted'?2.95:id==='rulo'?z:z+.62;pe.position.set(x,0,zz);if(id!=='ted'&&id!=='rulo')pe.rotation.y=Math.PI;g.add(pe);PER[id]=pe;}});
 pizarra3D();
 capa=document.createElement('div');capa.id='capa17';document.body.appendChild(capa);
 nav=document.createElement('div');nav.id='v17nav';nav.className='glass';nav.innerHTML=`<span id="v17tit">Edificio</span><button data-v="apilada">🏢 Apilada</button><button data-v="lado">🧩 Lado a lado</button>`;document.body.appendChild(nav);
 bVolver=document.createElement('button');bVolver.id='v17volver';bVolver.className='glass';bVolver.textContent='← Volver';bVolver.hidden=true;document.body.appendChild(bVolver);
 bVolver.onclick=e=>{e.stopPropagation();aplicarVista(ultimaGeneral);};
 nav.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;ultimaGeneral=b.dataset.v;aplicarVista(b.dataset.v);});
 pizPin=document.createElement('button');pizPin.className='v17piz glass';pizPin.innerHTML='📋 <span>Agenda y pendientes de hoy</span>';pizPin.onclick=e=>{e.stopPropagation();abrirPiz();};capa.appendChild(pizPin);
 piz=document.createElement('div');piz.id='v17pizarron';piz.className='glass';piz.hidden=true;document.body.appendChild(piz);
 piz.addEventListener('click',e=>{if(e.target.closest('.lcerrar')){piz.hidden=true;return;}const f=e.target.closest('[data-id]');if(f){piz.hidden=true;window.__abrirFicha?.(f.dataset.id);}});
 // tocar un piso lo abre; tocar el pizarrón lo abre
 const rc=new THREE.Raycaster(),pt=new THREE.Vector2();let st=null;
 cv.addEventListener('pointerdown',e=>{st={x:e.clientX,y:e.clientY,t:performance.now()};});
 cv.addEventListener('pointerup',e=>{if(!st||Math.hypot(e.clientX-st.x,e.clientY-st.y)>12||performance.now()-st.t>700){st=null;return;}st=null;
  pt.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);rc.setFromCamera(pt,cam);const hit=rc.intersectObjects(PG.filter(g=>g.visible),true)[0];if(!hit)return;
  if(hit.object.userData.piz){abrirPiz();return;}let o=hit.object;while(o&&o.userData.i===undefined)o=o.parent;if(o&&vista!=='piso')aplicarVista('piso',o.userData.i);});
 function resize(){R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();if(vista!=='piso')aplicarVista(vista);sucio=true;}
 addEventListener('resize',resize);R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
 aplicarVista('apilada');if(anim){PG.forEach(g=>g.position.copy(g.userData.p1));ctl.target.copy(anim.t1);cam.position.copy(anim.p1);anim=null;}
 // modo noche: sigue la clase body.noche que ya maneja v16 (auto 7pm-7am + botón)
 let noche=null;const modo=()=>{const n=document.body.classList.contains('noche');if(n===noche)return;noche=n;S.background=new THREE.Color(n?0x1f1a16:0xC9CED4);hl.intensity=n?.55:1.6;dl.intensity=n?.25:1.6;hl.color.setHex(n?0xffd2a0:0xfff6ea);
  MAT.lampara.emissiveIntensity=n?2.2:.15;MAT.pantalla.emissiveIntensity=n?1.6:.8;MAT.vidrio.color.setHex(n?0xffd9a0:0xdcebf3);MAT.vidrio.opacity=n?.1:.16;sucio=true;};modo();
 new MutationObserver(modo).observe(document.body,{attributes:true,attributeFilter:['class']});
 // datos: se repinta con lo que ya carga v16 (estado.json cada 60 s, mando cada 5 min)
 const rp0=window.__repintar;window.__repintar=()=>{rp0?.();pintarPines();dibujarPiz();pintarPiz();};
 const tc0=window.__trasCargar;window.__trasCargar=()=>{tc0?.();pintarPines();dibujarPiz();pintarPiz();};
 pintarPines();setInterval(()=>{pintarPines();dibujarPiz();pintarPiz();},60e3);
 // render bajo demanda (FPS/batería): solo cuando algo cambia
 const clk=new THREE.Clock();let fr=0,ft=performance.now();window.__v17fps=0;
 R.setAnimationLoop(()=>{const dt=Math.min(clk.getDelta(),.1);
  if(anim){anim.t=Math.min(1,anim.t+dt/anim.dur);const k=anim.t<.5?4*anim.t**3:1-Math.pow(-2*anim.t+2,3)/2;
   if(anim.lay)PG.forEach(g=>g.position.lerpVectors(g.userData.p0,g.userData.p1,k));ctl.target.lerpVectors(anim.t0,anim.t1,k);cam.position.lerpVectors(anim.p0,anim.p1,k);if(anim.t>=1)anim=null;sucio=true;}
  if(ctl.update())sucio=true;if(!sucio||document.hidden)return;sucio=false;R.render(S,cam);moverPines();fr++;const n=performance.now();if(n-ft>1000){window.__v17fps=fr*1000/(n-ft);fr=0;ft=n;}});
 window.__v17={vista:(v,i)=>{if(v!=='piso')ultimaGeneral=v;aplicarVista(v,i??-1);},abrirPiz,PISOS,estado:()=>({vista,pisoSel}),fps:()=>window.__v17fps,clasica:()=>{localStorage.setItem('oficinaV17','no');location.reload();}};}

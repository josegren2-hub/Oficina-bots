// v17b: edificio (modelo GLB exportado del mismo script Blender de los renders de Ted, con correcciones de Rob) de 5 pisos (solo capa visual y navegación). No toca datos, cifrado, estado vivo ni funciones de v16.x:
// usa window.__datos/__vivo/__teEspera/__abrirFicha/__v13 y MANDO (solo lectura).
import * as THREE from 'three';import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js';import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {MANDO} from './mando.js';
const E=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const movil=()=>innerWidth<700;
// ---------- plano (propuesta-v17/plano-B-pisos.json, 18×9 u por piso; P4 20×7.5 + terraza) ----------
const PISOS=[
 {id:'PB',f:'PB',n:'PB · Cafetería + Personal',sub:'Luna, Valery, Emiliano · cafetería',bots:{luna:[9.7,2.7],vale:[13.3,2.7],emiliano:[11.3,7]}},
 {id:'P1',f:'P2',n:'Piso 1 · Jurídico y Finanzas',sub:'Julián, Inés',bots:{julian:[2.5,2.7],ines:[13.5,2.7]}},
 {id:'P2',f:'P3',n:'Piso 2 · Proyectos + Estudio de podcast',sub:'Tommy, Charly, Rodrigo, Joss, Luca · Rulo en el estudio',bots:{ceo:[2.3,2.7],apps:[5.8,2.7],libro:[9.3,2.7],director:[2.3,7.2],luca:[5.8,7.2],rulo:[14,6.6]}},
 {id:'P3',f:'P4',n:'Piso 3 · Tinta Rosa',sub:'Mateo (oficina de cristal), Tadeo, Naim, Dany',bots:{mateo:[2.5,3.1],tadeo:[8.5,2.7],'tr-editor':[12.5,2.7],'tr-cm':[9.5,7.2]}},
 {id:'P4',f:'P5',n:'Piso 4 · Penthouse de Ted',sub:'Ted (oficina + pizarrón en ventanal) · Sala de juntas 16',bots:{ted:[3.5,3.4]},grande:1}];
const PISO_DE={};PISOS.forEach((p,i)=>Object.keys(p.bots).forEach(b=>PISO_DE[b]=i));
const SC=.5,PASO=6.2;const ML=(c,o={})=>new THREE.MeshLambertMaterial({color:c,...o});
const MATS=[],LMS=[];let NOCHE=false,BLOOM=null;const TL=new THREE.TextureLoader();
function lmTex(u){const t=TL.load(u,()=>{sucio=true;});t.flipY=false;t.channel=1;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;}

// ---------- personitas sencillas (sentadas) ----------
const COLE={trabajando:0x3B82F6,te:0xF97316,esperando:0x9CA3AF,pausa:0x6B7280};
const gCuerpo=new THREE.CapsuleGeometry(.2,.35,4,8),gCab=new THREE.SphereGeometry(.17,12,10),gAro=new THREE.TorusGeometry(.38,.035,6,24).rotateX(Math.PI/2);
function persona(){const g=new THREE.Group();const mc=ML(0x3B82F6),cu=new THREE.Mesh(gCuerpo,mc);cu.position.y=.82;const ca=new THREE.Mesh(gCab,ML(0xF1D3B8));ca.position.y=1.28;const ar=new THREE.Mesh(gAro,new THREE.MeshBasicMaterial({color:0x3B82F6}));ar.position.y=.03;g.add(cu,ca,ar);g.userData={mc,ar,ca};return g;}
// ---------- estado del módulo ----------
let R,S,cam,ctl,ED,PG=[],PER={},vista='apilada',pisoSel=-1,anim=null,sucio=true,capa,nav,bVolver,piz,pizPin;
const LAY={};
function layouts(){const lay={apilada:[],lado:[]};PISOS.forEach((p,i)=>lay.apilada[i]=new THREE.Vector3(0,i*PASO+(i===4?.3:0),0));
 const pos={P5:[0,0],P4:[1,0],P3:[0,1],P2:[1,1],PB:[.5,2]};PISOS.forEach((p,i)=>{const [c,r]=pos[p.f];lay.lado[i]=new THREE.Vector3(c*12.5,0,r*8.5);});lay.fachada=PISOS.map((p,i)=>new THREE.Vector3(0,i*1.8+(i===4?.05:0),0));return lay;}
const DIR=new THREE.Vector3(26,14,30).normalize(),DIRG=new THREE.Vector3(22,26,26).normalize();
function encuadre(idx,dirOverride){const b=new THREE.Box3();for(const i of idx){const u=PG[i].userData.bb;const p=PG[i].position;b.expandByPoint(u.min.clone().add(p));b.expandByPoint(u.max.clone().add(p));}
 const c=b.getCenter(new THREE.Vector3());const dir=dirOverride||(vista==='lado'?DIRG:DIR);
 // proyecta las 8 esquinas sobre el plano de cámara para encuadre exacto
 const up=new THREE.Vector3(0,1,0),rt=new THREE.Vector3().crossVectors(up,dir).normalize(),u2=new THREE.Vector3().crossVectors(dir,rt);let mx=0,my=0;
 for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z]){const v=new THREE.Vector3(x,y,z).sub(c);mx=Math.max(mx,Math.abs(v.dot(rt)));my=Math.max(my,Math.abs(v.dot(u2)));}
 const fov=cam.fov*Math.PI/180,asp=cam.aspect;const lab=vista==='apilada'&&idx.length>1?1.5:1.08;let r=Math.max(my*1.1,mx*lab/asp);if(vista==='lado'&&idx.length>1)r=Math.max(31*1900/2400/2,31/2/asp)*.75;const dist=r*(idx.length===1?(movil()?1:.92):1)/Math.tan(fov/2);
 const cc=c.clone();if(lab>1.08)cc.add(rt.clone().multiplyScalar(mx*.42));return {t:cc,p:cc.clone().add(dir.clone().multiplyScalar(dist))};}
function ir(e,dur=.9){anim={t:0,dur,t0:ctl.target.clone(),p0:cam.position.clone(),t1:e.t,p1:e.p,lay:anim?.lay};sucio=true;}
function aplicarVista(v,i=-1){const vista0=vista;vista=v;pisoSel=i;if(!PG.length||!PG.every(x=>x.userData.bb))return;const lay=layouts();const L=v==='lado'?lay.lado:v==='fachada'?lay.fachada:lay.apilada;const deF=vista0==='fachada'&&v!=='fachada',aF=v==='fachada';
 PG.forEach((g,k)=>{g.userData.p0=g.position.clone();g.userData.p1=L[k].clone();g.visible=v!=='piso'||k===i;});
 // posiciona antes de encuadrar
 PG.forEach(g=>g.position.copy(g.userData.p1));
 const e=v==='piso'?encuadre([i],new THREE.Vector3(.75,.95,1.2).normalize()):encuadre(PISOS.map((_,k)=>k));
 if(v==='piso')e.p.sub(e.t).multiplyScalar(.72).add(e.t);PG.forEach(g=>g.position.copy(g.userData.p0));anim={t:0,dur:aF||deF?2.2:.9,t0:ctl.target.clone(),p0:cam.position.clone(),t1:e.t,p1:e.p,lay:1,fa0:FA,fa1:aF?1:0,stag:aF||deF,abrir:deF};
 ctl.enableRotate=v==='piso'||v==='fachada';pintarEtiq();ctl.maxDistance=400;
 bVolver.hidden=v!=='piso';nav.querySelectorAll('[data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===v||(v==='piso'&&b.dataset.v===ultimaGeneral)));
 document.getElementById('v17tit').textContent=v==='piso'?PISOS[i].n:v==='lado'?'Todos los pisos · lado a lado':v==='fachada'?'Fachada del edificio':'Edificio · toca un piso';sucio=true;}
let ultimaGeneral='apilada';
const FORMAS=[t=>1,t=>1+.13*Math.abs(Math.sin(2.5*t)),t=>1/Math.pow(Math.pow(Math.abs(Math.cos(t)),4)+Math.pow(Math.abs(Math.sin(t)),4),.25)*.85,t=>.72+.38*Math.pow(Math.abs(Math.cos(2*t)),2),t=>1+.2*Math.cos(5*t),t=>1+.18*Math.cos(4*t),t=>1-.25*Math.sin(t)+.1,t=>1+.16*Math.cos(3*t+Math.PI/2),t=>1+.07*Math.cos(6*t),t=>1+.24*Math.cos(6*t)*.6];
const COL=[0xff4fa3,0xff8a3d,0x3fb7ff,0x7bd36a,0xb07cff,0xffc93c,0x2fd1c1,0xff6b6b,0x5c7cff,0xe86bd4,0x9ccf3a,0xff9f80,0x48c9ff,0xc58a5a,0x8e8cf0,0xf2a2c0];let NB=0;
const OJO=new THREE.MeshBasicMaterial({color:0x2a2030}),OJOG=new THREE.SphereGeometry(1,12,10);
function blob(id){const k=NB++,f=FORMAS[k%FORMAS.length],sh=new THREE.Shape(),N=64,R0=.13;for(let j=0;j<=N;j++){const t=j/N*Math.PI*2,r=R0*f(t),x=Math.cos(t)*r*(k%FORMAS.length===8?1.35:1),y=Math.sin(t)*r;j?sh.lineTo(x,y):sh.moveTo(x,y);}
 const ge=new THREE.ExtrudeGeometry(sh,{depth:.04,bevelEnabled:true,bevelThickness:.035,bevelSize:.03,bevelSegments:4,curveSegments:8});ge.center();
 const g=new THREE.Group(),m=new THREE.Mesh(ge,new THREE.MeshStandardMaterial({color:COL[k%COL.length],roughness:.45}));g.add(m);
 for(const sx of [-.035,.035]){const o=new THREE.Mesh(OJOG,OJO);o.scale.set(.014,.03,.01);o.position.set(sx,.025,.06);g.add(o);}
 g.position.y=.2;g.rotation.y=Math.atan2(DIR.x,DIR.z);g.userData.blob=id;return g;}
// ---------- fachada v17c ----------
const FACH=[];let FA=0,ENV=null,ROOF=null;const FV={glass:new THREE.MeshStandardMaterial({color:0x6d9cc4,metalness:.75,roughness:.06,envMapIntensity:2.2,emissive:0xffc27a,emissiveIntensity:0,transparent:true}),losa:new THREE.MeshStandardMaterial({color:0xeeebe4,roughness:.7,transparent:true}),mull:new THREE.MeshStandardMaterial({color:0x22272d,roughness:.4,metalness:.6,transparent:true}),lobby:new THREE.MeshStandardMaterial({color:0xfff1d6,emissive:0xffd9a0,emissiveIntensity:.35,transparent:true}),pv:new THREE.MeshStandardMaterial({color:0x1d2f5c,roughness:.2,metalness:.6,transparent:true}),verde:new THREE.MeshStandardMaterial({color:0x5c8f45,roughness:.9,transparent:true})};
function ventTex(){const c=document.createElement('canvas');c.width=256;c.height=64;const x=c.getContext('2d');x.fillStyle='#000';x.fillRect(0,0,256,64);for(let k=0;k<16;k++){if(Math.random()<.65){x.fillStyle=`hsl(${30+Math.random()*12},85%,${45+Math.random()*20}%)`;x.fillRect(k*16+2,14,12,40);}}const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t;}
const _M=new THREE.Matrix4(),_Q=new THREE.Quaternion(),_S=new THREE.Vector3(1,1,1),_P=new THREE.Vector3();
function fachada(g,i){const b=g.userData.bb,top=i===4;const x0=b.min.x-.02,x1=b.max.x+.02,z0=b.min.z-.02,z1=b.max.z+.02,y0=top?-.2:-.17,h=top?2.4:1.8,W=x1-x0,D=z1-z0,cx=(x0+x1)/2,cz=(z0+z1)/2;
 const f=new THREE.Group();f.visible=false;FACH.push(f);const gm=FV.glass.clone();gm.emissiveMap=ventTex();gm.emissiveMap.repeat.set(Math.round(W/1.2),1);f.userData.gm=gm;
 const gl=new THREE.Mesh(new THREE.BoxGeometry(W-.1,h-.18,D-.1),i===0?FV.lobby:gm);gl.position.set(cx,y0+.18+(h-.18)/2,cz);f.add(gl);
 if(i===0){const g2=new THREE.Mesh(new THREE.BoxGeometry(W-.1,h-.18,D*.55),gm);g2.position.set(cx,gl.position.y,z0+D*.27);f.add(g2);}
 const ov=top?.45:.22,lo=new THREE.Mesh(new THREE.BoxGeometry(W+ov*2,.16,D+ov*2),FV.losa);lo.position.set(cx,y0+.08,cz);lo.castShadow=true;f.add(lo);
 const nx=Math.round(W/.45),nz=Math.round(D/.45),im=new THREE.InstancedMesh(new THREE.BoxGeometry(.035,h-.18,.07),FV.mull,(nx+nz+2)*2);let c=0;
 for(let k=0;k<=nx;k++){const x=x0+k*W/nx;for(const z of[z1-.03,z0+.03]){_M.makeTranslation(x,gl.position.y,z);im.setMatrixAt(c++,_M);}}
 for(let k=0;k<=nz;k++){const z=z0+k*D/nz;for(const x of[x1-.03,x0+.03]){_M.makeTranslation(x,gl.position.y,z);im.setMatrixAt(c++,_M);}}im.count=c;f.add(im);
 if(i===0){const m=new THREE.Mesh(new THREE.BoxGeometry(3,.1,1.2),FV.losa);m.position.set(cx,y0+1.3,z1+.55);m.castShadow=true;f.add(m);for(const sx of[-1.3,1.3]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,1.3),FV.mull);p.position.set(cx+sx,y0+.65,z1+1.05);f.add(p);}}
 if(top){const R=new THREE.Group();ROOF=R;f.add(R);const ro=new THREE.Mesh(new THREE.BoxGeometry(W+.9,.18,D+.9),FV.losa);ro.position.set(cx,y0+h+.09,cz);ro.castShadow=true;R.add(ro);
  const pv=new THREE.InstancedMesh(new THREE.BoxGeometry(.7,.03,.42),FV.pv,60);let n=0;_Q.setFromEuler(new THREE.Euler(-.35,0,0));for(let a=0;a<6;a++)for(let r=0;r<4;r++){_P.set(x0+.8+a*.85,y0+h+.35,z0+.6+r*.6);_M.compose(_P,_Q,_S);pv.setMatrixAt(n++,_M);}pv.count=n;R.add(pv);
  const jd=new THREE.Mesh(new THREE.BoxGeometry(W*.38,.14,D*.7),FV.verde);jd.position.set(x1-W*.24,y0+h+.25,cz);R.add(jd);
  const sg=new THREE.SphereGeometry(.2,12,8);for(let k=0;k<14;k++){const a=new THREE.Mesh(sg,FV.verde);a.scale.setScalar(.6+Math.random()*.9);a.position.set(x1-W*.42+Math.random()*W*.36,y0+h+.38,z0+D*.2+Math.random()*D*.6);a.castShadow=true;R.add(a);}}
 g.add(f);}
function entorno(){const E=new THREE.Group();E.visible=false;const M=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.85,...o});
 const pasto=new THREE.Mesh(new THREE.CircleGeometry(30,48),M(0x7da35a));pasto.rotation.x=-Math.PI/2;pasto.position.set(5,-.42,3);pasto.receiveShadow=true;E.add(pasto);
 const ban=new THREE.Mesh(new THREE.BoxGeometry(16,.06,11),M(0xd9d4cb));ban.position.set(4.6,-.4,2.6);ban.receiveShadow=true;E.add(ban);
 const est=new THREE.Mesh(new THREE.BoxGeometry(16,.05,6),M(0x3a3d42));est.position.set(4.6,-.4,11);est.receiveShadow=true;E.add(est);
 const lin=new THREE.InstancedMesh(new THREE.BoxGeometry(.05,.01,2.2),M(0xffffff),12);for(let k=0;k<12;k++){_M.makeTranslation(-2.6+k*1.3,-.37,10.5);lin.setMatrixAt(k,_M);}E.add(lin);
 const CC=[0xc0392b,0xecf0f1,0x2c3e50,0x95a5a6,0x2e86ab,0x111111,0xe9c46a];for(let k=0;k<7;k++){const car=new THREE.Group(),cm=M(CC[k],{roughness:.3,metalness:.5});const b1=new THREE.Mesh(new THREE.BoxGeometry(.75,.28,1.6),cm);b1.position.y=.22;const b2=new THREE.Mesh(new THREE.BoxGeometry(.66,.22,.85),M(0x1b2530,{roughness:.1,metalness:.7}));b2.position.set(0,.45,-.05);car.add(b1,b2);
  for(const[wx,wz]of[[-.36,.5],[.36,.5],[-.36,-.5],[.36,-.5]]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.1,12),M(0x111111));w.rotation.z=Math.PI/2;w.position.set(wx,.13,wz);car.add(w);}car.traverse(o=>o.castShadow=true);car.position.set(-1.95+k*1.3+(k>3?1.3:0),-.38,10.5);E.add(car);}
 const tronco=M(0x8a6a4a),hoja=M(0x3f7f3a);function palma(x,z){const p=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(.06,.1,2.6,8),tronco);t.position.y=1.3;t.rotation.z=.08;p.add(t);for(let k=0;k<7;k++){const l=new THREE.Mesh(new THREE.ConeGeometry(.12,1.2,4),hoja);l.scale.z=.25;l.position.set(Math.cos(k)*.45,2.5,Math.sin(k)*.45);l.rotation.set(Math.sin(k)*1.1,0,-Math.cos(k)*1.1);p.add(l);}p.traverse(o=>o.castShadow=true);p.position.set(x,-.4,z);E.add(p);}
 for(const x of[-2.8,0.5,3.8,7.1,10.4,13.6])palma(x,8.3);palma(-3.2,-2);palma(-3.2,3);
 const sg=new THREE.SphereGeometry(.5,12,10);for(const[x,z]of[[13,-2.5],[14,0],[-4,6.5],[15,5],[-5,-4],[16,10]]){const t=new THREE.Mesh(sg,M(0x4f8a3e));t.scale.set(1,1.2,1);t.position.set(x,.5,z);t.castShadow=true;E.add(t);const tt=new THREE.Mesh(new THREE.CylinderGeometry(.06,.08,.6),tronco);tt.position.set(x,-.1,z);E.add(tt);}
 const LM=new THREE.MeshStandardMaterial({color:0xfff0c8,emissive:0xffd28a,emissiveIntensity:0});E.userData.lm=LM;for(const x of[-2.2,2.2,5.5,8.8,12]){const p=new THREE.Mesh(new THREE.CylinderGeometry(.03,.04,1.6),M(0x2b2b2b));p.position.set(x,.4,8.6);E.add(p);const l=new THREE.Mesh(new THREE.SphereGeometry(.09,10,8),LM);l.position.set(x,1.22,8.6);E.add(l);}
 ENV=E;S.add(E);}
function alfaFach(a){FA=a;for(const m of Object.values(FV))m.opacity=a;FACH.forEach(f=>{f.userData.gm.opacity=a;f.visible=a>.01;});if(ENV)ENV.visible=a>.15;PG.forEach(g=>{if(g.userData.m)g.userData.m.visible=a<.98;});}
// ---------- v17c: avatares blob animados ----------
const COLB=[0xff5fa8,0xff9a3d,0x41b8ff,0x6fd16a,0xa97cff,0xffc93c,0x2fd1c1,0xff6b6b,0x5c7cff,0xe86bd4,0x9ccf3a,0xff9f80,0x48c9ff,0xd39a63,0x8e8cf0,0xf2a2c0];
const SHB=[t=>1,t=>1+.08*Math.cos(5*t),t=>1/Math.pow(Math.pow(Math.abs(Math.cos(t)),4)+Math.pow(Math.abs(Math.sin(t)),4),.25)*.9,t=>1+.12*Math.cos(4*t),t=>1+.06*Math.cos(6*t),t=>1+.1*Math.cos(3*t),t=>1+.15*Math.sin(t)];
const VIS=new THREE.MeshStandardMaterial({color:0x0b0d12,roughness:.15,metalness:.2}),OJOB=new THREE.MeshBasicMaterial({color:0xffffff});
const AV=[];let NBB=0;const AISLE=[4.15,4.15,4.15,4.15,3.3];
const PF=[t=>1,t=>1+.13*Math.abs(Math.sin(2.5*t)),t=>1/Math.pow(Math.pow(Math.abs(Math.cos(t)),5)+Math.pow(Math.abs(Math.sin(t)),5),.2),t=>.62+.45*Math.pow(Math.abs(Math.cos(2*t)),3),t=>.8+.22*Math.abs(Math.cos(2.5*t)),null,null,t=>1/Math.pow(Math.pow(Math.abs(Math.cos(t)/1.25),6)+Math.pow(Math.abs(Math.sin(t)/.8),6),1/6),3,5,6,t=>.66+.4*Math.pow(Math.abs(Math.cos(2.5*t)),2)];
function poly(n){return t=>{const a=Math.PI/n,u=((t-Math.PI/2)%(2*a)+2*a)%(2*a)-a;return Math.cos(a)/Math.cos(u)*.95;};}
function geoAv(k){const j=k%12,sh=new THREE.Shape(),N=96;
 for(let q=0;q<=N;q++){const t=q/N*Math.PI*2;let x,y;
  if(j===5){const r=1-.45*Math.max(0,Math.sin(t));x=Math.cos(t)*r*.85;y=Math.sin(t)*(Math.sin(t)>0?1.25:.85);x*=Math.sin(t)>0?(1-Math.sin(t)*.9):1;} // gota
  else if(j===6){x=16*Math.sin(t)**3/17;y=(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17+.15;} // corazón
  else{const f=typeof PF[j]==='number'?poly(PF[j]):PF[j],r=f(t);x=Math.cos(t)*r;y=Math.sin(t)*r;}
  q?sh.lineTo(x*.17,y*.17):sh.moveTo(x*.17,y*.17);}
 const g=new THREE.ExtrudeGeometry(sh,{depth:.12,bevelEnabled:true,bevelThickness:.06,bevelSize:.045,bevelSegments:6,curveSegments:48});g.translate(0,0,-.06);g.computeVertexNormals();return g;}
function blobAv(id,i,home){const k=NBB++,R=.17,col=COLB[k%COLB.length];const root=new THREE.Group(),body=new THREE.Group();root.add(body);
 const m=new THREE.Mesh(geoAv(k),new THREE.MeshStandardMaterial({color:col,roughness:.85,metalness:0,emissive:0,emissiveIntensity:0}));m.position.y=.27;m.castShadow=true;body.add(m);
 const v=new THREE.Mesh(new THREE.SphereGeometry(1,24,16),VIS);v.scale.set(.1,.06,.045);v.position.set(0,.29,.13);body.add(v);
 const ojos=[];for(const sx of[-.038,.038]){const o=new THREE.Mesh(new THREE.SphereGeometry(1,10,8),OJOB);o.scale.set(.014,.022,.01);o.position.set(sx,.295,.165);body.add(o);ojos.push(o);}
 const ln=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.3,4),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.7}));ln.position.y=.6;body.add(ln);
 root.userData.blob=id;m.userData.blob=id;const a={id,i,root,body,ojos,home:home.clone(),pos:home.clone(),path:[],est:'',t:Math.random()*9,blink:2+Math.random()*3,next:4+Math.random()*10,mode:'silla',face:Math.atan2(DIR.x,DIR.z),bub:'',ok:0,tp:0,gesto:'',gt:0,cara:'neutro'};
 root.position.copy(home);root.scale.setScalar(1.5);root.rotation.y=a.face;AV.push(a);return a;}
const CARAS={neutro:[.014,.022,0],concentrado:[.016,.009,0],feliz:[.017,.008,.008],cansado:[.015,.007,-.006],sorprendido:[.02,.03,.004],aburrido:[.015,.011,-.004]};
// v17d: rejilla de navegación por piso (evita muebles) + A*
const NAV={},NC=.16;
function navGrid(i){if(NAV[i])return NAV[i];const g=PG[i],m=g&&g.userData.m;if(!m)return null;g.updateMatrixWorld(true);
 const wp=new THREE.Vector3();g.getWorldPosition(wp);const bb=new THREE.Box3().setFromObject(m);bb.min.sub(wp);bb.max.sub(wp);
 const x0=bb.min.x+.15,z0=bb.min.z+.15,nx=Math.max(2,Math.floor((bb.max.x-bb.min.x-.3)/NC)),nz=Math.max(2,Math.floor((bb.max.z-bb.min.z-.3)/NC));
 const b=new Uint8Array(nx*nz),rc=new THREE.Raycaster(),o=new THREE.Vector3(),dn=new THREE.Vector3(0,-1,0);
 const ms=[];m.traverse(q=>{if(q.isMesh&&!q.userData.piz)ms.push(q);});
 for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++){o.set(x0+ix*NC+wp.x,.5+wp.y,z0+iz*NC+wp.z);rc.set(o,dn);rc.far=.6;const h=rc.intersectObjects(ms,false)[0];if(h&&.5-h.distance>.035)b[ix*nz+iz]=1;}
 const B=b.slice();for(let ix=0;ix<nx;ix++)for(let iz=0;iz<nz;iz++)if(b[ix*nz+iz])for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const X=ix+dx,Z=iz+dz;if(X>=0&&Z>=0&&X<nx&&Z<nz)B[X*nz+Z]=1;}
 let n=0;for(const v of B)n+=v;return NAV[i]={x0,z0,nx,nz,b:B,ocup:n/B.length};}
function astar(G,p,q){const cl=(v,n)=>Math.max(0,Math.min(n-1,v));const c=v=>[cl(Math.round((v.x-G.x0)/NC),G.nx),cl(Math.round((v.z-G.z0)/NC),G.nz)];
 const [sx,sz]=c(p),[tx,tz]=c(q),N=G.nx*G.nz,id=(x,z)=>x*G.nz+z,S=id(sx,sz),T=id(tx,tz);
 const free=k=>!G.b[k]||Math.hypot(Math.floor(k/G.nz)-tx,k%G.nz-tz)<2.2||Math.hypot(Math.floor(k/G.nz)-sx,k%G.nz-sz)<2.2;
 const gs=new Float32Array(N).fill(1e9),pr=new Int32Array(N).fill(-1),op=[S],en=new Uint8Array(N);gs[S]=0;en[S]=1;const hh=k=>Math.hypot(Math.floor(k/G.nz)-tx,k%G.nz-tz);let it=0;
 while(op.length&&it++<5000){let bi=0;for(let j=1;j<op.length;j++)if(gs[op[j]]+hh(op[j])<gs[op[bi]]+hh(op[bi]))bi=j;const k=op.splice(bi,1)[0];en[k]=0;if(k===T)break;const kx=Math.floor(k/G.nz),kz=k%G.nz;
  for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){if(!dx&&!dz)continue;const X=kx+dx,Z=kz+dz;if(X<0||Z<0||X>=G.nx||Z>=G.nz)continue;const n=id(X,Z);if(!free(n))continue;if(dx&&dz&&(!free(id(kx+dx,kz))||!free(id(kx,kz+dz))))continue;const gn=gs[k]+(dx&&dz?1.414:1);if(gn<gs[n]){gs[n]=gn;pr[n]=k;if(!en[n]){en[n]=1;op.push(n);}}}}
 if(T!==S&&pr[T]<0)return null;const pts=[];for(let k=T;k!==S&&k>=0;k=pr[k])pts.unshift(new THREE.Vector3(G.x0+Math.floor(k/G.nz)*NC,0,G.z0+(k%G.nz)*NC));
 const out=[];for(let j=1;j<pts.length;j+=2)out.push(pts[j]);out.push(q.clone());return out;}
function libre(i,v){const G=navGrid(i);if(!G)return true;const x=Math.round((v.x-G.x0)/NC),z=Math.round((v.z-G.z0)/NC);return x>=0&&z>=0&&x<G.nx&&z<G.nz&&!G.b[x*G.nz+z];}
function puntoLibre(i){for(let k=0;k<60;k++){const v=new THREE.Vector3(.6+Math.random()*(i===4?8:7.8),0,.5+Math.random()*(AISLE[i]-.3));if(libre(i,v))return v;}return new THREE.Vector3(.6+Math.random()*7,0,AISLE[i]-.2);}
const ruta=(a,dst)=>{const G=navGrid(a.i),p=G&&astar(G,a.pos,dst);if(p&&p.length){a.path=p;return;}const z=AISLE[a.i];a.path=[new THREE.Vector3(a.pos.x,0,z),new THREE.Vector3(dst.x,0,z),dst.clone()];};
function estadoAv(){const D=window.__datos?.()||[];for(const b of D){const a=AV.find(x=>x.id===b.id);if(!a)continue;const e=ek(b);if(a.est&&a.est==='trabajando'&&e!=='trabajando')a.ok=3;if(e==='trabajando'&&a.est!=='trabajando'){a.next=0;if(a.mode!=='silla'){ruta(a,a.home);a.mode='silla';}}a.est=e;}}
function pasoAv(dt){if(vista==='fachada')return;const T=performance.now()/1000;
 for(const a of AV){if(!PG[a.i].visible)continue;a.t+=dt;a.next-=dt;a.blink-=dt;if(a.ok>0)a.ok-=dt;
  // decide
  if(!a.path.length&&a.next<=0){a.next=8+Math.random()*14;
   if(a.est==='trabajando'||a.est==='te'){if(a.mode!=='silla'){ruta(a,a.home);a.mode='silla';}else if(Math.random()<.35){a.gesto=['voltea','estira','voltea','sorpresa'][Math.floor(Math.random()*4)];a.gt=2.5;a.next=4;}else if(Math.random()<.2){const o=AV.filter(x=>x.i===a.i&&x!==a);if(o.length){const t=o[Math.floor(Math.random()*o.length)];let d=t.home.clone().add(new THREE.Vector3(.32,0,.3));if(!libre(a.i,d))d=t.home.clone().add(new THREE.Vector3(0,0,.45));ruta(a,d);a.mode='visita';a.next=5;}}}
   else{const r=Math.random();if(a.mode!=='silla'&&r<.5){ruta(a,a.home);a.mode='silla';}else if(r<.45){a.gesto=Math.random()<.5?'estira':'voltea';a.gt=2.5;}else{const o=AV.filter(x=>x.i===a.i&&x!==a&&x.mode==='cafe'&&!x.path.length);let d;if(o.length&&Math.random()<.6){d=o[0].pos.clone().add(new THREE.Vector3(.3*(Math.random()<.5?1:-1),0,.15));if(!libre(a.i,d))d=puntoLibre(a.i);a.mode='platica';}else{d=puntoLibre(a.i);a.mode=Math.random()<.5?'cafe':'pasea';}ruta(a,d);}}}
  // mover
  let vel=0;if(a.path.length){const tg=a.path[0],d=new THREE.Vector3().subVectors(tg,a.pos);d.y=0;const L=d.length(),sp=.55*dt;
   if(L<=sp){a.pos.copy(tg);a.path.shift();if(!a.path.length&&a.mode==='silla')a.face=Math.atan2(DIR.x,DIR.z);}else{a.pos.addScaledVector(d,sp/L);vel=1;const fa=Math.atan2(d.x,d.z);let df=fa-a.face;df=Math.atan2(Math.sin(df),Math.cos(df));a.face+=df*Math.min(1,dt*8);}}
  a.vel=(a.vel||0)+(vel-(a.vel||0))*Math.min(1,dt*5);
  if(a.gt>0)a.gt-=dt;else a.gesto='';const sentado=!a.path.length&&a.mode==='silla';const fl=(sentado?0:.05+Math.sin(a.t*2.1)*.025)+(a.ok>0?Math.abs(Math.sin(a.t*7))*.25:0);a.root.position.set(a.pos.x,(sentado?.09:-.1)+fl,a.pos.z);let fc=a.face;if(a.gesto==='voltea'){const o=AV.find(x=>x.i===a.i&&x!==a);if(o)fc=Math.atan2(o.pos.x-a.pos.x,o.pos.z-a.pos.z);}if(a.mode==='platica'&&!a.path.length){const o=AV.filter(x=>x.i===a.i&&x!==a).sort((p,q)=>p.pos.distanceTo(a.pos)-q.pos.distanceTo(a.pos))[0];if(o)fc=Math.atan2(o.pos.x-a.pos.x,o.pos.z-a.pos.z);}if(a.ok>0)fc=a.face+a.t*6;a.root.rotation.y=fc;
  const tr=sentado&&a.est==='trabajando',f=tr?9:2.2,amp=tr?.025:.04;const s=Math.sin(a.t*f)*amp*(1-a.vel*.5);
  const st=a.gesto==='estira'?Math.sin(Math.min(1,(2.5-a.gt)/2.5)*Math.PI)*.22:0;a.body.scale.set(1-s*.5-st*.3,1+s+st,1-s*.5-st*.3);a.body.rotation.x=a.vel*.28;a.body.position.y=vel?Math.abs(Math.sin(a.t*10))*.02:0;
  if(a.blink<0){a.blink=2.5+Math.random()*3.5;a.bk=.15;}if(a.bk>0){a.bk-=dt;}a.cara=a.ok>0?'feliz':a.gesto==='sorpresa'?'sorprendido':a.gesto==='estira'?'cansado':a.mode==='platica'?'feliz':tr?'concentrado':a.est==='te'?'aburrido':a.est==='pausa'?'cansado':'neutro';const C=CARAS[a.cara],ey=a.bk>0?.15:1;a.ojos.forEach((o,j)=>{o.scale.x+= (C[0]-o.scale.x)*.2;o.scale.y+=(C[1]*ey-o.scale.y)*.3;o.position.y=.295+C[2]+(tr?-.006:0);o.rotation.z=(j?-1:1)*(a.cara==='cansado'?.35:a.cara==='feliz'?-.3:0);});
  if(a.tp>0){a.tp-=dt;const q=Math.abs(a.tp-.5)*2;a.root.scale.setScalar(1.5*Math.max(.01,q));a.root.rotation.y+=dt*20;}
  a.bub=SEL===a.id&&a.ok>0&&a.ok<=.6?'':a.ok>0?'✅ 🎉':a.mode==='platica'&&!a.path.length?'💬':a.gesto==='estira'?'🙆':a.gesto==='sorpresa'?'❗':a.est==='te'?'⏳ Te espera':a.mode==='visita'?'📦 entregando':tr?'⌨️':a.mode==='cafe'&&!a.path.length?'☕':'';}
 sucio=true;}
function teletransporte(id,i){const a=AV.find(x=>x.id===id);if(!a||a.i===i||!PG[i])return;a.tp=1;setTimeout(()=>{PG[i].add(a.root);a.i=i;PISO_DE[id]=i;a.pos.set(1,0,AISLE[i]);a.home=a.pos.clone();},500);}
// ---------- v17c: selección estilo Mission Control ----------
let SEL=null;const HALO=new THREE.Mesh(new THREE.RingGeometry(.2,.26,40),new THREE.MeshBasicMaterial({color:0x7fe3ff,transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}));HALO.rotation.x=-Math.PI/2;HALO.visible=false;
function seleccionar(id){const a=AV.find(x=>x.id===id);if(!a)return;SEL=id;a.ok=Math.max(a.ok,.6);
 document.querySelectorAll('.mc-bot').forEach(e=>e.classList.toggle('on',e.dataset.id===id));Object.entries(PIN).forEach(([k,e])=>e.classList.toggle('sel',k===id));
 const ir=()=>{const p=new THREE.Vector3();a.root.getWorldPosition(p);p.y+=.3;const off=cam.position.clone().sub(ctl.target).normalize().multiplyScalar(3.2);anim={t:0,dur:1.1,t0:ctl.target.clone(),p0:cam.position.clone(),t1:p,p1:p.clone().add(off),lay:0};sucio=true;};
 const fi=()=>setTimeout(()=>window.__abrirFicha?.(id),1150);if(vista==='piso'&&pisoSel===a.i){ir();fi();}else{aplicarVista('piso',a.i);setTimeout(()=>{ir();fi();},1000);}
 const fb=document.getElementById('mcficha');if(fb){fb.hidden=false;fb.textContent='Abrir ficha de '+(PIN[id]?.querySelector('em')?.textContent||id)+' ›';fb.onclick=()=>window.__abrirFicha?.(id);}}
function panelMC(){let p=document.getElementById('mcpanel');if(!p){p=document.createElement('aside');p.id='mcpanel';document.body.appendChild(p);
 p.addEventListener('pointerdown',e=>e.stopPropagation());p.addEventListener('click',e=>{if(e.target.closest('.mc-tg')){p.classList.toggle('plegado');return;}const b=e.target.closest('.mc-bot');if(b)seleccionar(b.dataset.id);});if(innerWidth<700)p.classList.add('plegado');}
 const D=window.__datos?.()||[];let h='<button class="mc-tg">☰ Equipo</button><div class="mc-in"><div class="mc-h">MISSION CONTROL</div>';
 PISOS.forEach((pi,i)=>{const bs=D.filter(b=>PISO_DE[b.id]===i);if(!bs.length)return;h+=`<div class="mc-g">${E(pi.n)}</div>`;for(const b of bs){const k=ek(b);h+=`<div class="mc-bot ${SEL===b.id?'on':''}" data-id="${E(b.id)}"><span class="mc-av"><img src="./avatares/${E(b.id)}.webp" alt=""><span class="sd ${k}"></span></span>${E(String(b.nombre||b.id).split(/\s*·\s*/)[0])}<small>${k==='trabajando'?'trabajando':k==='te'?'te espera':'disponible'}</small></div>`;}});
 p.innerHTML=h+'<button id="mcficha" hidden></button></div>';}
// ---------- pines (avatar + estado) ----------
const PIN={};function ek(b){return b.estado==='esperando'?'te':b.estado;}
function pintarPines(){const D=window.__datos?.()||[];for(const b of D){if(!(b.id in PISO_DE))continue;let el=PIN[b.id];
 if(!el){el=document.createElement('div');el.dataset.id=b.id;el.addEventListener('pointerdown',e=>e.stopPropagation());el.addEventListener('click',e=>{e.stopPropagation();seleccionar(b.id);});capa.appendChild(el);PIN[b.id]=el;}
 const k=ek(b);el.className='v17pin '+k;el.innerHTML=`<img src="./avatares/${E(b.id)}.webp" alt=""><span class="sd"></span><em>${E(String(b.nombre||b.id).split(/\s*·\s*/)[0])}</em><i class="bub"></i>`;
 }panelMC();sucio=true;}
const _v=new THREE.Vector3();
function moverPines(){const w=innerWidth,h=innerHeight,cerca=vista==='piso';if(vista==='fachada'){for(const el of Object.values(PIN))el.style.display='none';return;}for(const [id,el] of Object.entries(PIN)){const per=PER[id];const g=PG[PISO_DE[id]];
 if(!per||!g.visible){el.style.display='none';continue;}per.getWorldPosition(_v);_v.y+=1.2;_v.project(cam);
 const py=(-_v.y*.5+.5)*h,lim=nav?nav.getBoundingClientRect().top-4:h;if(_v.z>1||py>lim||py<(cerca?110:70)){el.style.display='none';continue;}el.style.display='';el.classList.toggle('chico',!cerca);{const a=AV.find(x=>x.id===id),bb=el.querySelector('.bub');if(a&&bb&&bb.textContent!==a.bub){bb.textContent=a.bub;bb.className='bub'+(a.est==='te'?' te':'')+(a.bub==='✅'?' ok':'');}}el.style.transform=`translate(${(_v.x*.5+.5)*w}px,${(-_v.y*.5+.5)*h}px) translate(-50%,-100%)`;}
 const g4=PG[4];if(g4.visible){_v.set(7.04*SC,1.95,-.3*SC).add(g4.position);_v.project(cam);pizPin.style.display='none';pizPin.style.transform=`translate(${(_v.x*.5+.5)*w}px,${(-_v.y*.5+.5)*h}px) translate(-50%,-50%)`;pizPin.classList.toggle('chico',vista!=='piso');}else pizPin.style.display='none';}
// ---------- pizarrón "Agenda y pendientes de hoy" ----------
let pizTex,pizCtx;const PIZM=[];
function pizarra3D(g){const c=document.createElement('canvas');c.width=512;c.height=250;pizCtx=c.getContext('2d');pizTex=new THREE.CanvasTexture(c);pizTex.colorSpace=THREE.SRGBColorSpace;pizTex.flipY=false;
 g.traverse(o=>{if(o.isMesh&&o.material?.name==='pizarron.png'){o.material=new THREE.MeshBasicMaterial({map:pizTex,toneMapped:false});o.userData.piz=1;PIZM.push(o);}});dibujarPiz();}
function datosPiz(){if(!MANDO)return null;const a=MANDO.audiencias;const aud=a&&a.estado==='ok'&&Array.isArray(a.items)?a.items:[];const esp=window.__v13?.esperan?.()||[];
 const pend=(MANDO.bots||[]).flatMap(b=>(b.pendientes||[]).map(p=>({id:b.id,n:(window.__datos?.()||[]).find(x=>x.id===b.id)?.nombre||b.id,t:typeof p==='string'?p:(p.texto||p.txt||JSON.stringify(p))})));return {aud,esp,pend,gen:MANDO.generado};}
function dibujarPiz(){if(!pizCtx)return;const x=pizCtx,d=datosPiz();x.fillStyle='#F4F5F2';x.fillRect(0,0,512,250);x.fillStyle='#222';x.font='bold 30px Inter,sans-serif';x.fillText('Agenda y pendientes de hoy',20,46);
 x.font='26px Inter,sans-serif';x.fillStyle='#2f3a33';if(!d){x.fillText('🔐 Toca para ver (requiere clave)',20,120);}
 else{x.fillText(`📅 ${d.aud.length} audiencia${d.aud.length===1?'':'s'}`,20,100);x.fillText(`🟠 ${d.esp.length} te esperan`,20,150);x.fillText(`📝 ${d.pend.length} pendientes`,20,200);x.fillStyle='#6b7a70';x.font='20px Inter,sans-serif';x.fillText('Toca para abrir',20,238);}
 pizTex.needsUpdate=true;sucio=true;}
function abrirPiz(){piz.hidden=false;pintarPiz();}
function pintarPiz(){if(piz.hidden)return;const d=datosPiz();let h=`<div class="lt"><b>Agenda y pendientes de hoy</b><button class="lcerrar">✕ Cerrar</button></div>`;
 if(!d)h+='<p class="s">🔐 Solo con el Centro de mando desbloqueado. Sin la clave no se muestra contenido privado.</p>';
 else{h+=`<p class="s">Se actualiza solo · datos al ${E(new Date(d.gen).toLocaleString('es-MX',{timeZone:'America/Chihuahua',hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'}))}</p>`;
  h+='<h4>📅 Audiencias / agenda</h4>'+(d.aud.length?'<ul>'+d.aud.map(x=>`<li><b>${E(x.hora||'')}</b> ${E(x.titulo||x.asunto||x.txt||'')}${x.lugar?` · <span class="s">📍 ${E(x.lugar)}</span>`:''}</li>`).join('')+'</ul>':`<p class="s">${MANDO.audiencias?.estado&&MANDO.audiencias.estado!=='ok'?'Sin datos de audiencias ('+E(MANDO.audiencias.estado)+')':'Sin audiencias.'}</p>`);
  h+='<h4>🟠 Te esperan</h4>'+(d.esp.length?d.esp.map(b=>`<div class="f" data-id="${E(b.id)}"><span class="d e-te" style="margin:0"></span><div class="lx"><b>${E(b.nombre)}</b></div><span class="lir">›</span></div>`).join(''):'<p class="s">Nadie te espera.</p>');
  h+='<h4>📝 Pendientes</h4>'+(d.pend.length?'<ul>'+d.pend.slice(0,30).map(p=>`<li data-id="${E(p.id)}"><b>${E(p.n)}:</b> ${E(p.t)}</li>`).join('')+'</ul>':'<p class="s">Sin pendientes.</p>');}
 piz.innerHTML=h;}
// ---------- etiquetas a la derecha (vista apilada, como en el render) ----------
const ETQ=[];function pintarEtiq(){ETQ.forEach((el,i)=>{el.style.display=vista==='piso'?'none':'';});}
function moverEtiq(){const w=innerWidth,h=innerHeight;const lim=nav?nav.getBoundingClientRect().top-8:h;ETQ.forEach(el=>el.style.visibility=vista==='fachada'?'hidden':'');if(vista==='fachada')return;ETQ.forEach((el,i)=>{if(vista==='piso')return;const g=PG[i],bb=g.userData.bb;
 if(vista==='apilada')_v.set(bb.max.x,.2,bb.max.z).add(g.position);else _v.set((bb.min.x+bb.max.x)/2,-.4,bb.max.z+.3).add(g.position);_v.project(cam);if((-_v.y*.5+.5)*h>lim||(-_v.y*.5+.5)*h<60)el.style.visibility='hidden';
 el.classList.toggle('lado',vista!=='apilada');let lx=(_v.x*.5+.5)*w+(vista==='apilada'?14:0);if(vista==='apilada'){const disp=w-lx-6;if(disp<120)lx=w-126;el.style.maxWidth=Math.max(120,disp)+'px';}else el.style.maxWidth=Math.min(w*.46,220)+'px';el.style.transform=`translate(${lx}px,${(-_v.y*.5+.5)*h}px) translate(${vista==='apilada'?'0':'-50%'},-50%)`;});}
// ---------- arranque ----------
export function iniciarV17(){
 if(new URLSearchParams(location.search).has('clasica')||localStorage.getItem('oficinaV17')==='no')return;
 window.__v17on=true;document.body.classList.add('v17');
 const cv=document.createElement('canvas');cv.id='c17';document.body.prepend(cv);
 R=new THREE.WebGLRenderer({canvas:cv,antialias:!movil(),powerPreference:'high-performance'});R.setPixelRatio(Math.min(devicePixelRatio,movil()?1.75:2));R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.AgXToneMapping;R.toneMappingExposure=1.25;R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.shadowMap.type=THREE.PCFSoftShadowMap;
 S=new THREE.Scene();cam=new THREE.PerspectiveCamera(14,1,1,900);
 const hl=new THREE.HemisphereLight(0xdfe8f5,0xb8a890,1.3),dl=new THREE.DirectionalLight(0xfff3e2,2.6);dl.position.set(14,26,22);dl.castShadow=true;dl.shadow.mapSize.set(movil()?1024:2048,movil()?1024:2048);dl.shadow.bias=-.0004;dl.shadow.normalBias=.03;dl.shadow.radius=4;
 const sc_=dl.shadow.camera;sc_.left=-24;sc_.right=24;sc_.top=24;sc_.bottom=-24;sc_.near=1;sc_.far=120;S.add(hl,dl,dl.target);const pm=new THREE.PMREMGenerator(R);S.environment=pm.fromScene(new RoomEnvironment(),.04).texture;S.environmentIntensity=.55;
 ctl=new OrbitControls(cam,cv);ctl.enableDamping=true;ctl.dampingFactor=.1;ctl.screenSpacePanning=true;ctl.minDistance=6;ctl.maxPolarAngle=1.35;ctl.enableRotate=false;
 ctl.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE};ctl.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};
 ctl.addEventListener('change',()=>sucio=true);ctl.addEventListener('start',()=>{if(anim&&!anim.lay)anim=null;});
 const dr=new DRACOLoader();dr.setDecoderPath('./draco/');const gl=new GLTFLoader();gl.setDRACOLoader(dr);
 PISOS.forEach((p,i)=>{const el=document.createElement('div');el.className='v17etq';el.innerHTML=`<b>${E(p.n)}</b><small>${E(p.sub)}</small>`;el.style.pointerEvents='none';ETQ.push(el);});
 const VID=new THREE.LineBasicMaterial({color:0xf4f8fb,transparent:true,opacity:.7});let LMK={};
 const lmk=fetch('./v17b/lm.json').then(r=>r.json()).then(j=>LMK=j).catch(()=>{});
 PISOS.forEach((p,i)=>{const g=new THREE.Group();g.userData.i=i;PG.push(g);S.add(g);g.visible=false;
  for(const [id,[x,z]] of Object.entries(p.bots)){const av=blobAv(id,i,new THREE.Vector3(x*SC,0,z*SC));g.add(av.root);PER[id]=av.root;}
  lmk.then(()=>gl.load(`./v17b/${p.f}.glb`,r=>{const m=r.scene;const K=LMK[p.f]||{dia:2,noche:2};const L={dia:lmTex(`./v17b/${p.f}-dia.webp`),noche:null,K,f:p.f,mats:[]};LMS.push(L);
   m.traverse(o=>{if(!o.isMesh)return;let mt=o.material;o.castShadow=false;o.receiveShadow=false;
    if(o.geometry.attributes.uv1&&!mt.transparent&&mt.metalness<.5){const b=new THREE.MeshBasicMaterial({color:mt.color,map:mt.map,lightMap:L.dia,lightMapIntensity:K.dia*Math.PI,name:mt.name});o.material=b;L.mats.push(b);return;}
    if(mt.transparent){mt.depthWrite=false;o.renderOrder=2;mt.opacity=.16;mt.color.setHex(0xcfe6f2);mt.roughness=.05;mt.metalness=0;mt.envMapIntensity=1.6;
     const ed=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,30),VID);ed.renderOrder=3;o.add(ed);}if(mt.emissive&&mt.emissive.getHex()){MATS.push([mt,mt.emissiveIntensity]);}o.matrixAutoUpdate=false;o.updateMatrix();});
   g.add(m);g.userData.bb=new THREE.Box3().setFromObject(m);g.userData.m=m;fachada(g,i);{const bb=g.userData.bb,sp=new THREE.Mesh(new THREE.PlaneGeometry(bb.max.x-bb.min.x,bb.max.z-bb.min.z),new THREE.ShadowMaterial({opacity:.28}));sp.rotation.x=-Math.PI/2;sp.position.set((bb.min.x+bb.max.x)/2,.012,(bb.min.z+bb.max.z)/2);sp.receiveShadow=true;m.add(sp);}if(i===4)pizarra3D(m);
   if(PG.every(x=>x.userData.bb)){PG.forEach(x=>x.visible=true);aplicarVista(vista,pisoSel);if(anim){PG.forEach(x=>x.position.copy(x.userData.p1));ctl.target.copy(anim.t1);cam.position.copy(anim.p1);anim=null;}modo(1);sucio=true;}}));});
 capa=document.createElement('div');capa.id='capa17';document.body.appendChild(capa);ETQ.forEach(el=>capa.appendChild(el));
 nav=document.createElement('div');nav.id='v17nav';nav.className='glass';nav.innerHTML=`<span id="v17tit">Edificio</span><button data-v="apilada">🏢 Apilada</button><button data-v="lado">🧩 Lado a lado</button><button data-v="fachada">🏙️ Fachada</button>`;document.body.appendChild(nav);
 bVolver=document.createElement('button');bVolver.id='v17volver';bVolver.className='glass';bVolver.textContent='← Volver';bVolver.hidden=true;document.body.appendChild(bVolver);
 bVolver.onclick=e=>{e.stopPropagation();aplicarVista(ultimaGeneral);};
 nav.addEventListener('click',e=>{const b=e.target.closest('[data-v]');if(!b)return;ultimaGeneral=b.dataset.v;aplicarVista(b.dataset.v);});
 pizPin=document.createElement('button');pizPin.hidden=true;pizPin.style.visibility='hidden';pizPin.className='v17piz glass';pizPin.innerHTML='📋 <span>Agenda y pendientes de hoy</span>';pizPin.onclick=e=>{e.stopPropagation();abrirPiz();};capa.appendChild(pizPin);
 piz=document.createElement('div');piz.id='v17pizarron';piz.className='glass';piz.hidden=true;document.body.appendChild(piz);
 piz.addEventListener('click',e=>{if(e.target.closest('.lcerrar')){piz.hidden=true;return;}const f=e.target.closest('[data-id]');if(f){piz.hidden=true;window.__abrirFicha?.(f.dataset.id);}});
 // tocar un piso lo abre; tocar el pizarrón lo abre
 const rc=new THREE.Raycaster(),pt=new THREE.Vector2();let st=null;
 cv.addEventListener('pointerdown',e=>{st={x:e.clientX,y:e.clientY,t:performance.now()};});
 cv.addEventListener('pointerup',e=>{if(!st||Math.hypot(e.clientX-st.x,e.clientY-st.y)>12||performance.now()-st.t>700){st=null;return;}st=null;
  pt.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1);rc.setFromCamera(pt,cam);const vis_=o=>{for(;o;o=o.parent)if(!o.visible)return false;return true;};const hs=rc.intersectObjects(PG.filter(g=>g.visible),true).filter(h=>vis_(h.object)&&!(h.object.material&&h.object.material.isShadowMaterial));const hp=hs.slice(0,4).find(h=>h.object.userData.piz);const hit=hp||hs[0];if(!hit)return;if(!hp&&PIZM[0]&&vista==='piso'&&pisoSel===4){const bx=new THREE.Box3().setFromObject(PIZM[0]).expandByScalar(.35);if(bx.containsPoint(hit.point)){abrirPiz();return;}}
  if(vista==='fachada')return;if(hit.object.userData.piz){abrirPiz();return;}{let q=hit.object;while(q&&!q.userData.blob)q=q.parent;if(q){seleccionar(q.userData.blob);return;}}let o=hit.object;while(o&&o.userData.i===undefined)o=o.parent;if(o&&vista!=='piso')aplicarVista('piso',o.userData.i);});
 function resize(){if(!PG.every(x=>x.userData.bb)){R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();return;}R.setSize(innerWidth,innerHeight);BLOOM?.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();if(vista!=='piso')aplicarVista(vista);sucio=true;}
 addEventListener('resize',resize);R.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();
 
 // modo noche: sigue la clase body.noche que ya maneja v16 (auto 7pm-7am + botón)
 let noche=null;function modo(f){const n=document.body.classList.contains('noche');if(n===noche&&!f)return;noche=n;S.background=new THREE.Color(n?0x1b2234:0xB9C1CA);VID.color.setHex(n?0x55606f:0xf4f8fb);hl.intensity=n?.35:1.3;S.environmentIntensity=n?.04:.55;dl.intensity=n?.15:2.6;hl.color.setHex(n?0x8090b0:0xdfe8f5);
  R.toneMappingExposure=n?1.12:1.0;for(const [mt,e0] of MATS)mt.emissiveIntensity=n?e0*(/bulb|lampshade/.test(mt.name)?5:1.6):e0;
  for(const L of LMS){if(n&&!L.noche)L.noche=lmTex(`./v17b/${L.f}-noche.webp`);for(const b of L.mats){b.lightMap=n?L.noche:L.dia;b.lightMapIntensity=(n?L.K.noche:L.K.dia)*Math.PI;b.needsUpdate=true;}}
  NOCHE=n;for(const f of FACH){f.userData.gm.emissiveIntensity=n?.7:0;f.userData.gm.color.setHex(n?0x1f2c40:0x6d9cc4);}FV.lobby.emissiveIntensity=n?1.2:.35;if(ENV)ENV.userData.lm.emissiveIntensity=n?3:0;if(n&&!BLOOM){BLOOM=new EffectComposer(R);BLOOM.addPass(new RenderPass(S,cam));const sz=new THREE.Vector2(innerWidth,innerHeight).multiplyScalar(movil()?.5:1);BLOOM.addPass(new UnrealBloomPass(sz,.18,.15,3.5));BLOOM.addPass(new OutputPass());BLOOM.setSize(innerWidth,innerHeight);}
  sucio=true;};modo();
 new MutationObserver(modo).observe(document.body,{attributes:true,attributeFilter:['class']});
 // datos: se repinta con lo que ya carga v16 (estado.json cada 60 s, mando cada 5 min)
 const rp0=window.__repintar;window.__repintar=()=>{rp0?.();pintarPines();dibujarPiz();pintarPiz();};
 entorno();estadoAv();setInterval(estadoAv,5000);const tc0=window.__trasCargar;window.__trasCargar=()=>{tc0?.();pintarPines();dibujarPiz();pintarPiz();};
 pintarPines();setInterval(()=>{pintarPines();dibujarPiz();pintarPiz();},60e3);
 // render bajo demanda (FPS/batería): solo cuando algo cambia
 const clk=new THREE.Clock();let fr=0,ft=performance.now();window.__v17fps=0;
 R.setAnimationLoop(()=>{if(!PG.length||PG.some(g=>!g.userData.bb))return;const dt=Math.min(clk.getDelta(),.1);
  if(anim){anim.t=Math.min(1,anim.t+dt/anim.dur);const k=anim.t<.5?4*anim.t**3:1-Math.pow(-2*anim.t+2,3)/2;
   if(anim.lay)PG.forEach((g,gi)=>{let kk=k;if(anim.stag){const d=(anim.abrir?(4-gi):gi)*.09,u=Math.min(1,Math.max(0,(anim.t-d)/(1-.36)));kk=u<.5?4*u**3:1-Math.pow(-2*u+2,3)/2;}g.position.lerpVectors(g.userData.p0,g.userData.p1,kk);});if(anim.fa0!==undefined&&anim.fa0!==anim.fa1){const u=anim.abrir?Math.min(1,anim.t/.45):Math.max(0,(anim.t-.55)/.45);alfaFach(anim.fa0+(anim.fa1-anim.fa0)*u);if(ROOF)ROOF.position.y=anim.abrir?Math.min(1,anim.t*2.5)*2.5:(1-Math.min(1,anim.t*1.4))*2.5;}ctl.target.lerpVectors(anim.t0,anim.t1,k);cam.position.lerpVectors(anim.p0,anim.p1,k);if(anim.t>=1)anim=null;sucio=true;}
  pasoAv(dt);if(ctl.update())sucio=true;if(!sucio||document.hidden)return;sucio=false;if(NOCHE&&BLOOM)BLOOM.render();else R.render(S,cam);moverPines();moverEtiq();fr++;const n=performance.now();if(n-ft>1000){window.__v17fps=fr*1000/(n-ft);fr=0;ft=n;}});
 window.__v17={nav:navGrid,dist:()=>cam.position.distanceTo(ctl.target),listo:()=>PG.length&&PG.every(x=>x.userData.bb),vista:(v,i)=>{if(v!=='piso')ultimaGeneral=v;aplicarVista(v,i??-1);},abrirPiz,PISOS,estado:()=>({vista,pisoSel}),fps:()=>window.__v17fps,camara:(p,t,fov)=>{anim=null;cam.fov=fov;cam.updateProjectionMatrix();cam.position.set(...p);ctl.target.set(...t);ctl.update();sucio=true;},clasica:()=>{localStorage.setItem('oficinaV17','no');location.reload();}};window.__v17.teletransporte=teletransporte;}

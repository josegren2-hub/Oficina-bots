import {makePersonita,PERSONITAS} from './personitas.js';
const PERS_ON=!new URLSearchParams(location.search).has('robots');
import * as THREE from 'three';import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';import * as SkU from 'three/examples/jsm/utils/SkeletonUtils.js';import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';import {N8AOPass} from 'n8ao';import './estilo.css';
const COL={trabajando:'#3B82F6',esperando:'#22C55E',pausa:'#9CA3AF'},TXT={trabajando:'Trabajando ahora',esperando:'Activo',pausa:'En pausa'},EMO={trabajando:'💻',esperando:'⏳',pausa:'☕'};
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ini=n=>n.split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
const movil=()=>innerWidth<700;
const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,movil()?1.5:2));
R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=.9;R.outputColorSpace=THREE.SRGBColorSpace;
const S=new THREE.Scene();S.background=new THREE.Color('#E9E7E3');S.fog=new THREE.Fog('#E9E7E3',90,190);
const pm=new THREE.PMREMGenerator(R);S.environmentIntensity=.55;
new RGBELoader().load('./hdri/estudio.hdr',t=>{S.environment=pm.fromEquirectangular(t).texture;t.dispose();});
S.add(new THREE.HemisphereLight('#fff4e6','#c9bca8',.35));
const dl=new THREE.DirectionalLight('#fff0da',2.6);dl.castShadow=true;const sm=movil()?1024:2048;dl.shadow.mapSize.set(sm,sm);
Object.assign(dl.shadow.camera,{left:-20,right:20,top:16,bottom:-16,near:1,far:80});dl.shadow.radius=4;dl.shadow.bias=-.0005;dl.shadow.normalBias=.03;S.add(dl,dl.target);
dl.position.set(-9,22,-14);dl.target.position.set(0,0,0);
const cam=new THREE.PerspectiveCamera(35,1,.1,260);
const ctl=new OrbitControls(cam,cv);ctl.enableDamping=true;ctl.dampingFactor=.08;ctl.minDistance=4;ctl.maxDistance=110;ctl.minPolarAngle=.15;ctl.maxPolarAngle=1.38;ctl.screenSpacePanning=false;
ctl.touches={ONE:THREE.TOUCH.PAN,TWO:THREE.TOUCH.DOLLY_ROTATE};ctl.mouseButtons={LEFT:THREE.MOUSE.PAN,MIDDLE:THREE.MOUSE.DOLLY,RIGHT:THREE.MOUSE.ROTATE};ctl.panSpeed=1.2;ctl.zoomToCursor=true;
// limita el objetivo al interior de la oficina
ctl.addEventListener('change',()=>{const t=ctl.target,cx=Math.max(-15,Math.min(15,t.x)),cz=Math.max(-11,Math.min(11,t.z)),dx=cx-t.x,dz=cz-t.z,dy=-t.y;if(dx||dz||dy){t.x+=dx;t.y+=dy;t.z+=dz;cam.position.x+=dx;cam.position.y+=dy;cam.position.z+=dz;}});
const comp=new EffectComposer(R);const ao=new N8AOPass(S,cam,innerWidth,innerHeight);Object.assign(ao.configuration,{aoRadius:1.6,distanceFalloff:1,intensity:3.5,gammaCorrection:false,halfRes:movil(),aoSamples:movil()?8:16,denoiseSamples:movil()?4:8,transparencyAware:false});ao.setQualityMode(movil()?'Low':'Medium');comp.addPass(ao);
const bloom=new UnrealBloomPass(new THREE.Vector2(innerWidth/2,innerHeight/2),.22,.5,.92);comp.addPass(bloom);comp.addPass(new OutputPass());
function resize(){R.setSize(innerWidth,innerHeight);comp.setPixelRatio(R.getPixelRatio());comp.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();}
addEventListener('resize',resize);resize();
let fly=null;const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function volar(tgt,dist,dir){const d=(dir||cam.position.clone().sub(ctl.target)).clone().normalize();fly={t:0,dur:1.1,t0:ctl.target.clone(),t1:tgt.clone(),p0:cam.position.clone(),p1:tgt.clone().add(d.multiplyScalar(dist))};}
ctl.addEventListener('start',()=>{fly=null});
const W=new THREE.Group();S.add(W);
// ---------- materiales PBR ----------
const TL=new THREE.TextureLoader(),texC={};
function tex(n,srgb){const k=n+srgb;if(texC[k])return texC[k];const t=TL.load(`./tex/${n}.webp`);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;if(srgb)t.colorSpace=THREE.SRGBColorSpace;return texC[k]=t;}
function pbr(n,o={}){const m=new THREE.MeshStandardMaterial({color:o.c??0xffffff,roughness:1,metalness:0,...(o.noDiff?{}:{map:tex(n+'_diff',1)}),normalMap:tex(n+'_nor'),roughnessMap:tex(n+'_arm'),aoMap:tex(n+'_arm'),normalScale:new THREE.Vector2(o.ns??.6,o.ns??.6)});return m;}
const M={
 madera:pbr('wood_floor'),nogal:pbr('dark_wood',{c:0xd8c8b8}),alfombra:pbr('fabric_pattern_07',{noDiff:1,c:0xC9A3A6,ns:1}),alfAzul:pbr('fabric_pattern_07',{noDiff:1,c:0x8E9FB0,ns:1}),
 mosaico:pbr('floor_tiles_06'),marmol:pbr('marble_01'),concreto:pbr('plaster_grey_04',{c:0xd9d6d0}),muro:pbr('plaster_grey_04',{c:0xF3EFE8,ns:.35}),
 zoclo:new THREE.MeshStandardMaterial({color:0x3b3631,roughness:.6}),marco:new THREE.MeshStandardMaterial({color:0x2a2a2c,roughness:.35,metalness:.7}),
 vidrio:new THREE.MeshPhysicalMaterial({color:0xe6f1f7,roughness:.05,metalness:0,transparent:true,opacity:.18,depthWrite:false}),
 negro:new THREE.MeshStandardMaterial({color:0x18181a,roughness:.4,metalness:.3}),pantalla:new THREE.MeshStandardMaterial({color:0x9fd0f5,emissive:0x8cc8ff,emissiveIntensity:1.6,roughness:.2}),
 luz:new THREE.MeshStandardMaterial({color:0xfff6e0,emissive:0xffe6b8,emissiveIntensity:3}),gris:new THREE.MeshStandardMaterial({color:0xd8d8d8,roughness:.5,metalness:.2}),
 losa:new THREE.MeshStandardMaterial({color:0xF2F0EC,roughness:.9}),fachada:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.85}),oro:new THREE.MeshStandardMaterial({color:0xC8A46A,metalness:.9,roughness:.3}),
 taza:new THREE.MeshStandardMaterial({color:0xffffff,roughness:.35})};
// geometría combinada por material
const ACC=new Map();
function P(geo,mk,x,y,z,o={}){if(o.ry)geo.rotateY(o.ry);geo.translate(x,y,z);(ACC.get(mk)||ACC.set(mk,[]).get(mk)).push(geo);}
function uvs(g,su,sv){const u=g.attributes.uv;for(let i=0;i<u.count;i++)u.setXY(i,u.getX(i)*su,u.getY(i)*sv);return g;}
// caja con UV en metros (para texturas)
function caja(w,h,d,mk,x,y,z,o={}){const g=new THREE.BoxGeometry(w,h,d);const u=g.attributes.uv,s=o.ts||1;
 const dims=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];for(let f=0;f<6;f++)for(let v=0;v<4;v++){const i=f*4+v;u.setXY(i,u.getX(i)*dims[f][0]/s,u.getY(i)*dims[f][1]/s);}P(g,mk,x,y,z,o);}
function flush(){for(const [k,gs] of ACC){const m=new THREE.Mesh(mergeGeometries(gs),M[k]);if(k==='vidrio'){m.renderOrder=10;m.castShadow=false;}else m.castShadow=!['luz','pantalla'].includes(k);m.receiveShadow=true;W.add(m);}ACC.clear();}
// ---------- muros reales ----------
const TH=.14;
function muro(x0,z0,x1,z1,t='int',puertas=[]){const H=z0===z1,a=Math.min(H?x0:z0,H?x1:z1),b=Math.max(H?x0:z0,H?x1:z1),segs=[];let u=a;
 for(const d of puertas.sort((p,q)=>p-q)){segs.push([u,d-.55]);u=d+.55;}segs.push([u,b]);
 const B=(L,h,th,mk,m,y,o)=>caja(H?L:th,h,H?th:L,mk,H?m:x0,y,H?z0:m,o);
 for(const [s,e] of segs){if(e-s<.05)continue;const L=e-s,m=(s+e)/2;
  if(t==='bajo'){B(L,.6,.2,'muro',m,.3);B(L,.04,.24,'marco',m,.62);continue;}
  const hs=t==='int'?1.05:t==='ext'?.9:.06,top=t==='ext'?3.1:2.75;
  B(L,hs,t==='ext'?.25:TH,t==='cristal'?'marco':'muro',m,hs/2);B(L,.1,(t==='ext'?.25:TH)+.03,'zoclo',m,.05);
  B(L,.04,(t==='ext'?.27:TH)+.02,'marco',m,hs+.02);B(L,top-hs-.08,.025,'vidrio',m,(top+hs)/2);
  if(t==='ext')B(L,.4,.25,'muro',m,2.9);else B(L,.06,.08,'marco',m,top);
  const n=Math.max(1,Math.round(L/1.6));for(let k=0;k<=n;k++){const q=s+k*L/n;caja(.05,top-hs,.05,'marco',H?q:x0,(top+hs)/2,H?z0:q);}}
 for(const d of puertas){for(const s of [-.55,.55])caja(H?.08:TH+.04,2.25,H?TH+.04:.08,'marco',H?d+s:x0,1.125,H?z0:d+s);
  const top=t==='ext'?3.1:2.75;caja(H?1.18:TH,top-2.25,H?TH:1.18,t==='cristal'?'vidrio':'muro',H?d:x0,(top+2.25)/2,H?z0:d);caja(H?1.18:TH+.04,.06,H?TH+.04:1.18,'marco',H?d:x0,2.25,H?z0:d);
  // hoja de puerta de vidrio entreabierta
  const hg=new THREE.BoxGeometry(1,2.15,.025);hg.translate(.5,1.1,0);hg.rotateY(H?-1.2:-1.2+Math.PI/2);P(hg,'vidrio',H?d-.55:x0,0,H?z0:d-.55);}}
function piso(x0,z0,x1,z1,mk,ts=2,y=.012){caja(x1-x0,.02,z1-z0,mk,(x0+x1)/2,y,(z0+z1)/2,{ts});}
// ---------- planta ----------
const AREAS=[
 {id:'tr',n:'Tinta Rosa',x0:-15,z0:-11,x1:-5,z1:-1,m:'alfombra',d:-7,s:1},
 {id:'per',n:'Personal · Administración',x0:-5,z0:-11,x1:7,z1:-1,m:'alfAzul',d:1,s:1},
 {id:'ceo',n:'Oficina CEO',x0:7,z0:-11,x1:15,z1:-1,m:'nogal',d:9,s:1},
 {id:'cre',n:'Creativa · Producción',x0:-15,z0:1,x1:-6,z1:11,m:'madera',d:-8,s:-1},
 {id:'rec',n:'Recepción',x0:-6,z0:1,x1:4,z1:11,m:'marmol',d:-1,s:-1},
 {id:'com',n:'Área común · Café',x0:4,z0:1,x1:15,z1:11,m:'mosaico',d:7,s:-1}];
const AR=Object.fromEntries(AREAS.map(a=>[a.id,a]));AR.jun={n:'Sala de juntas'};
caja(31,.4,23,'losa',0,-.2,0,{ts:4});caja(31.2,1.4,23.2,'fachada',0,-1.1,0);
for(let k=0;k<22;k++)caja(1,.6,.05,'negro',-14.2+k*1.35,-1.05,11.62);for(let k=0;k<16;k++)caja(.05,.6,1,'negro',15.62,-1.05,-10.2+k*1.35);
for(const a of AREAS)piso(a.x0,a.z0,a.x1,a.z1,a.m,a.m==='marmol'?3:a.m==='mosaico'?1.5:2);
piso(-15,-1,15,1,'concreto',3);piso(-15,-11,-10.8,-5.6,'nogal',2,.016);piso(10,1,15,5.5,'madera',2,.016);
muro(-15,-11,15,-11,'ext');muro(-15,-11,-15,11,'ext');muro(15,-11,15,11,'bajo');muro(-15,11,15,11,'bajo',[-1]);
muro(-15,-1,15,-1,'int',[-7,1,9]);muro(-5,-11,-5,-1,'int');muro(7,-11,7,-1,'int');
muro(-10.8,-11,-10.8,-5.6,'cristal');muro(-15,-5.6,-10.8,-5.6,'cristal',[-12.6]);
muro(-15,1,-6,1,'int',[-8]);muro(4,1,15,1,'int',[7]);muro(-6,1,-6,11,'int');muro(4,1,4,11,'int',[8]);
muro(10,1,10,5.5,'cristal',[3.4]);muro(10,5.5,15,5.5,'cristal');
// columnas de recepción
for(const x of [-6,4])caja(.4,3,.4,'muro',x,1.5,1);
// ---------- muebles GLB ----------
const GL=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder),MOD={},pend=[];
const NOMS=['metal_office_desk','dining_chair_02','sofa_02','modern_coffee_table_01','potted_plant_04','wooden_bookshelf_worn','round_wooden_table_01','drawer_cabinet','dining_table','mid_century_lounge_chair','robot'];
const cargaModelos=Promise.all(NOMS.map(n=>GL.loadAsync(`./modelos/${n}.glb`).then(g=>{MOD[n]=g;g.scene.traverse(o=>{if(o.isMesh){o.castShadow=o.receiveShadow=true;}});})));
const mueble=(n,x,z,ry=0,s=1,y=0)=>pend.push([n,x,z,ry,s,y]);
function colocar(){for(const [n,x,z,ry,s,y] of pend){const o=MOD[n].scene.clone();o.position.set(x,y,z);o.rotation.y=ry;if(Array.isArray(s))o.scale.set(...s);else o.scale.setScalar(s);W.add(o);}}
const SILLA_RY=0;// orientación del modelo de silla (respaldo hacia -z tras girar)
function monitor(x,z,ry=0){const c=Math.cos(ry),s=Math.sin(ry),R2=(dx,dz)=>[x+dx*c+dz*s,z-dx*s+dz*c];
 let [a,b]=R2(0,.12);P(new THREE.CylinderGeometry(.1,.11,.015,16),'negro',a,.765,b);P(new THREE.CylinderGeometry(.015,.015,.24,8),'negro',a,.89,b);
 [a,b]=R2(0,.1);P(new THREE.BoxGeometry(.66,.4,.03),'negro',a,1.13,b,{ry});[a,b]=R2(0,.084);P(new THREE.PlaneGeometry(.62,.36).rotateY(Math.PI),'pantalla',a,1.13,b,{ry});
 [a,b]=R2(0,-.18);P(new THREE.BoxGeometry(.44,.02,.14),'gris',a,.77,b,{ry});[a,b]=R2(.4,-.08);P(new THREE.CylinderGeometry(.035,.03,.09,12),'taza',a,.8,b);}
function lamparaLineal(x,z,L=2.4,ry=0){P(new THREE.BoxGeometry(L,.05,.12),'marco',x,2.95,z,{ry});P(new THREE.BoxGeometry(L-.06,.012,.09),'luz',x,2.922,z,{ry});
 for(const s of [-L/2+.2,L/2-.2])P(new THREE.CylinderGeometry(.004,.004,.8,4),'marco',x+s*Math.cos(ry),3.38,z-s*Math.sin(ry));}
// puestos (escritorio x,z; bot se sienta en z-.8 mirando +z)
const PUESTOS={mateo:{x:-13,z:-8.5,w:1.8,a:'tr',j:1,via:[[-12.6,-2],[-12.6,-6.3],[-11.6,-6.3]],ax:-11.6},
 'tr-editor':{x:-9,z:-8.5,a:'tr'},'tr-cm':{x:-6.6,z:-8.5,a:'tr'},tadeo:{x:-9,z:-4.5,a:'tr'},
 ted:{x:5,z:-8.5,w:1.8,a:'per',j:1},ines:{x:-3.4,z:-8.5,a:'per'},julian:{x:-1.1,z:-8.5,a:'per'},emiliano:{x:1.2,z:-8.5,a:'per'},vale:{x:-3.4,z:-4.5,a:'per'},luna:{x:-1.1,z:-4.5,a:'per'},
 ceo:{x:11,z:-8.2,w:2,a:'ceo',j:1},
 rulo:{x:-13,z:4.5,a:'cre'},director:{x:-10.6,z:4.5,a:'cre'},libro:{x:-8.2,z:4.5,a:'cre'},apps:{x:-13,z:8.3,a:'cre'}};
const EXTRA=[{x:-6.6,z:-4.5,a:'tr'},{x:1.2,z:-4.5,a:'per'},{x:-10.6,z:8.3,a:'cre'},{x:-8.2,z:8.3,a:'cre'}];
for(const p of [...Object.values(PUESTOS),...EXTRA]){const w=p.w||1.5;p.sz=p.z-.8;p.ax??=p.x+w/2+.4;
 mueble('metal_office_desk',p.x,p.z,0,[w/2,.95,.8]);mueble('dining_chair_02',p.x,p.sz-.05,SILLA_RY,1);monitor(p.x+(p.j?-.2:0),p.z,0);if(p.j)monitor(p.x+.5,p.z,0);}
// Tinta Rosa
mueble('wooden_bookshelf_worn',-14.65,-8.5,Math.PI/2,[1,1,1]);mueble('dining_chair_02',-13.4,-7.3,0,1);mueble('dining_chair_02',-12.6,-7.3,0,1);mueble('potted_plant_04',-11.3,-10.5,0,4.2);
mueble('wooden_bookshelf_worn',-7.8,-10.65,0,1);mueble('potted_plant_04',-5.5,-10.5,0,4.5);mueble('potted_plant_04',-14.5,-1.6,0,4);mueble('drawer_cabinet',-5.4,-6.5,-Math.PI/2,[.8,.7,1]);
// Personal
mueble('drawer_cabinet',3.2,-10.7,0,[1,.75,1]);mueble('wooden_bookshelf_worn',-1,-10.65,0,1);mueble('dining_chair_02',4.6,-7.3,0,1);mueble('dining_chair_02',5.4,-7.3,0,1);
mueble('potted_plant_04',-4.5,-10.5,0,4.5);mueble('potted_plant_04',6.5,-1.6,0,4);mueble('potted_plant_04',-4.5,-1.6,0,3.6);
// CEO
mueble('sofa_02',7.75,-5,Math.PI/2,1);mueble('modern_coffee_table_01',9,-5,0,1);mueble('mid_century_lounge_chair',13.9,-4.4,-Math.PI/2,.9);mueble('mid_century_lounge_chair',13.9,-6,-Math.PI/2,.9);
mueble('wooden_bookshelf_worn',9.2,-10.65,0,1);mueble('wooden_bookshelf_worn',13,-10.65,0,1);mueble('potted_plant_04',14.4,-10.4,0,5);mueble('potted_plant_04',7.6,-1.6,0,4.5);mueble('dining_chair_02',10.6,-7,0,1);mueble('dining_chair_02',11.4,-7,0,1);
// Creativa
mueble('drawer_cabinet',-6.35,6.5,-Math.PI/2,[1,.75,1]);mueble('potted_plant_04',-14.4,1.6,0,4.5);mueble('potted_plant_04',-6.6,10.4,0,4.5);mueble('potted_plant_04',-14.4,10.4,0,4);
caja(.04,1.3,3.4,'muro',-14.84,1.6,6.4);for(const [u,v,c] of [[-.3,.3,'oro'],[.3,-.9,'pantalla'],[-.2,-.4,'nogal'],[.35,.8,'alfombra'],[.1,1.2,'alfAzul']])caja(.02,.34,.46,c,-14.8,1.6+u,6.4+v);
// Recepción
caja(6,2.7,.25,'muro',-1,1.35,3.4);caja(6.1,.06,.3,'marco',-1,2.73,3.4);
caja(3.4,1.05,.7,'muro',-1,.53,6.2);caja(3.6,.06,.85,'nogal',-1,1.09,6.15);caja(3.4,.06,.04,'oro',-1,.9,6.57);mueble('dining_chair_02',-1,5.3,SILLA_RY,1);monitor(-1.5,6.1,Math.PI);
mueble('sofa_02',-4.4,9.6,0,1);mueble('sofa_02',2.4,9.6,0,1);mueble('modern_coffee_table_01',-1,9.5,Math.PI/2,1);mueble('potted_plant_04',-5.4,4.2,0,5);mueble('potted_plant_04',3.4,4.2,0,5);mueble('potted_plant_04',-5.4,10.4,0,4);mueble('potted_plant_04',3.4,10.4,0,4);
// Área común: café, lounge, sala de juntas
const MESAS=[[8.4,7.4],[11.4,7.4],[8.4,9.7],[11.4,9.7]];
for(const [tx,tz] of MESAS){mueble('round_wooden_table_01',tx,tz,0,[.62,.76,.62]);mueble('dining_chair_02',tx-.8,tz,Math.PI/2,1);mueble('dining_chair_02',tx+.8,tz,-Math.PI/2,1);}
caja(.65,.9,4,'nogal',14.5,.45,8.2);caja(.72,.05,4.1,'marmol',14.48,.925,8.2);caja(.42,.5,.45,'negro',14.55,1.2,7.2);caja(.3,.06,.3,'gris',14.5,.97,7.2);caja(.18,.3,.18,'oro',14.6,1.1,8.4);caja(.5,1.1,.04,'pantalla',14.86,1.9,8.2);
mueble('sofa_02',4.75,3.4,Math.PI/2,1);mueble('modern_coffee_table_01',5.9,3.4,0,1);mueble('mid_century_lounge_chair',8.6,2.6,-Math.PI/2,.85);mueble('mid_century_lounge_chair',8.6,4.3,-Math.PI/2,.85);
mueble('potted_plant_04',4.5,10.4,0,4.5);mueble('potted_plant_04',9.6,1.6,0,4);mueble('potted_plant_04',4.5,5.8,0,4);
mueble('dining_table',12.6,3.3,0,[1.15,.86,.8]);for(const s of [-.9,0,.9]){mueble('dining_chair_02',12.6+s,2.35,SILLA_RY,1);mueble('dining_chair_02',12.6+s,4.25,Math.PI,1);}
caja(1.8,1,.05,'negro',12.6,1.7,1.12);caja(1.7,.92,.01,'pantalla',12.6,1.7,1.15);
for(const [x,z] of [[9.9,7.4],[9.9,9.7],[12.6,3.3],[-1,6.2],[11,-6.5]])lamparaLineal(x,z,2.2);
// luces lineales en áreas de trabajo
for(const x of [-9,-6.6])for(const z of [-8,-4.4])lamparaLineal(x,z,1.8);for(const x of [-2.3,1.2])for(const z of [-8,-4.4])lamparaLineal(x,z,2.4);lamparaLineal(5,-8,1.8);lamparaLineal(-13,-8,1.6);
for(const x of [-12,-9])for(const z of [4.6,8.4])lamparaLineal(x,z,2.4);for(const x of [-10,0,10])lamparaLineal(x,0,3);
flush();
for(const [x,z] of [[-10,-6],[1,-6],[11,-6],[-10.5,6],[-1,7],[9.5,8],[12.5,3.3]]){const l=new THREE.PointLight('#ffd9a8',6,9,1.6);l.position.set(x,2.6,z);S.add(l);}
// letreros
function letrero(txt,x,z,w=2.6,y=2.4){const c=document.createElement('canvas');c.width=640;c.height=112;const g=c.getContext('2d');g.fillStyle='#1d1d1f';g.fillRect(0,0,640,112);g.fillStyle='#C8A46A';g.fillRect(0,104,640,8);g.fillStyle='#f4efe6';g.font='600 46px Inter,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,320,54);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;const m=new THREE.Mesh(new THREE.BoxGeometry(w,w*112/640,.03),[M.negro,M.negro,M.negro,M.negro,new THREE.MeshStandardMaterial({map:t,roughness:.5}),M.negro]);m.position.set(x,y,z);W.add(m);}
for(const a of AREAS)if(a.id!=='rec')letrero(a.n,(a.x0+a.x1)/2+(a.id==='com'?-2:0),a.s>0?-.86:1.14,a.n.length>14?3.6:2.6);
letrero('Dirección Tinta Rosa',-12.9,-5.48,2.6);letrero('Sala de juntas',12.5,5.62,2.4);
{const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');g.fillStyle='#EDE7DD';g.fillRect(0,0,1024,256);g.fillStyle='#1d1d1f';g.font='600 92px Inter,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('Oficina de los bots',512,120);g.fillStyle='#C8A46A';g.fillRect(352,200,320,6);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;const m=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.15),new THREE.MeshStandardMaterial({map:t,roughness:.5}));m.position.set(-1,1.8,3.53);W.add(m);}
// ---------- rutas ----------
const C=(x,z)=>new THREE.Vector3(x,0,z);
function rutaSilla(p){const a=AR[p.a],dz=a.s>0?-2:2;return [C(a.d,0),C(a.d,dz),...(p.via||[]).map(([x,z])=>C(x,z)),C(p.ax,(p.via?p.via.at(-1)[1]:dz)),C(p.ax,p.sz)];}
const CAFE=[];MESAS.forEach(([tx,tz],i)=>{for(const s of [-1,1])CAFE.push({p:C(tx+s*.8,tz),ry:s<0?Math.PI/2:-Math.PI/2,sit:1,via:[C(7,0),C(7,2),C(7,8.55),C(tx+s*.8,8.55)]});});
for(const z of [7.3,8.5])CAFE.push({p:C(13.1,z),ry:Math.PI/2,sit:0,cup:1,via:[C(7,0),C(7,2),C(7,6.3),C(13.1,6.3)]});
// ---------- bots: robots GLB animados ----------
const bots=new Map(),hits=[],AV={},capa=$('capa');
const PAL=[0x8FA89A,0x7E95B0,0xC98B6B,0xCDB48E,0x9C7C95,0x6FA3A0,0x7a7f88,0xC99AA0,0xB5A07A,0x86A4C4];
let ESC=1,SIT_Y=0;const ocupado=new Set();
function calibrar(){const g=MOD.robot,o=g.scene;const b=new THREE.Box3().setFromObject(o);ESC=1.3/(b.max.y-b.min.y);
 const c=SkU.clone(o);c.scale.setScalar(ESC);const mx=new THREE.AnimationMixer(c);const hip=()=>{c.updateMatrixWorld(true);const v=new THREE.Vector3();c.getObjectByName('Hips').getWorldPosition(v);return v.y};
 mx.clipAction(THREE.AnimationClip.findByName(g.animations,'Sitting')).play();mx.update(3);SIT_Y=.6-hip();}
function makeBot(b,i){const g=new THREE.Group(),PC=PERS_ON&&PERSONITAS[b.id],pm=PC&&makePersonita(PC),m=pm?pm.scene:SkU.clone(MOD.robot.scene),ANIMS=pm?pm.animations:MOD.robot.animations;if(!pm)m.scale.setScalar(ESC);g.add(m);
 const c=PAL[i%PAL.length];m.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;if(!pm&&o.material.name==='Main'){o.material=o.material.clone();o.material.color.set(c);o.material.roughness=.45;}}});
 const mix=new THREE.AnimationMixer(m),A={};for(const n of ['Idle','Walking','Sitting','Wave','Yes','ThumbsUp'])A[n]=mix.clipAction(THREE.AnimationClip.findByName(ANIMS,n));
 for(const n of ['Wave','Yes','ThumbsUp']){A[n].setLoop(THREE.LoopOnce);A[n].clampWhenFinished=true;}
 const cup=new THREE.Group();const cm=new THREE.Mesh(new THREE.CylinderGeometry(.04,.034,.1,14),M.taza);cm.castShadow=true;cup.add(cm);const lid=new THREE.Mesh(new THREE.CylinderGeometry(.042,.042,.012,14),M.oro);lid.position.y=.055;cup.add(lid);
 const hand=(m.getObjectByName('Palm2R')||m.getObjectByName('LowerArmR'));hand.add(cup);cup.visible=false;m.updateMatrixWorld(true);{const ws=new THREE.Vector3();hand.getWorldScale(ws);cup.scale.setScalar(1/ws.x);}
 const img=new Image();img.onload=()=>{AV[b.id]=img.src;renderPaneles();const o=bots.get(b.id);if(o)burbuja(o);};img.src=`./avatares/${b.id}.png`;
 const hit=new THREE.Mesh(new THREE.BoxGeometry(.8,1.5,.8),new THREE.MeshBasicMaterial({visible:false}));hit.position.y=.75;hit.userData.id=b.id;g.add(hit);hits.push(hit);
 const el=document.createElement('div');el.className='pin';el.dataset.id=b.id;el.addEventListener('pointerdown',e=>e.stopPropagation());el.addEventListener('click',e=>{e.stopPropagation();abrirFicha(b.id);});capa.appendChild(el);
 let p=PUESTOS[b.id];if(!p){p=EXTRA.find(e=>!e.uso)||EXTRA[0];p.uso=1;PUESTOS[b.id]=p;}g.position.set(p.x,0,p.sz);g.rotation.y=0;W.add(g);
 const o={sy:pm?0:null,g,m,mix,A,cur:null,cup,hand,el,seat:p,path:[],t:Math.random()*9,data:b,col:c,spot:null,back:rutaSilla(p).concat(C(p.x,p.sz)),ry:0,sit:0,wait:0,nuevo:1};
 mix.addEventListener('finished',()=>anim(o,o.base));return o;}
function anim(o,n,d=.35){if(['Idle','Walking','Sitting'].includes(n))o.base=n;const a=o.A[n];if(o.cur===a)return;a.reset().setEffectiveWeight(1).fadeIn(d).play();if(o.cur)o.cur.fadeOut(d);o.cur=a;}
function ir(o,dest,fin){o.path=[...o.back].reverse().concat(dest);if(o.nuevo){o.nuevo=0;const d=dest.at(-1);o.g.position.set(d.x,0,d.z);o.path=[d];}o.back=dest;o.fin=fin;o.sit=0;anim(o,'Walking');o.cup.visible=false;}
function meta(o){const e=o.data.estado,s=o.seat;if(o.spot){ocupado.delete(o.spot);o.spot=null;}
 if(e==='trabajando')ir(o,rutaSilla(s).concat(C(s.x,s.sz)),{ry:0,sit:1});
 else if(e==='esperando')ir(o,rutaSilla(s).concat(C(s.ax,s.sz+.35)),{ry:null,sit:0});
 else{const libres=CAFE.filter(c=>!ocupado.has(c));const c=libres[Math.floor(Math.random()*libres.length)]||CAFE[0];ocupado.add(c);o.spot=c;ir(o,[...c.via,c.p],{ry:c.ry,sit:c.sit,cup:c.cup});}
 o.wait=10+Math.random()*12;}
var DPIN=0;
function burbuja(o){const b=o.data;o.el.className='pin '+b.estado;o.el.innerHTML=`${AV[b.id]?`<img src="${AV[b.id]}" alt="">`:`<i style="background:#${o.col.toString(16).padStart(6,'0')}">${ini(b.nombre)}</i>`}<span class="sd"></span>`;}
const listo=cargaModelos.then(()=>{colocar();calibrar();});
// ---------- paneles ----------
// ---------- paneles ----------
const hist=[],hora=d=>(d||new Date()).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});
const avHTML=(b,c)=>AV[b.id]?`<img class="av" src="${AV[b.id]}">`:`<div class="av" style="background:${c||'#ddd'}">${ini(b.nombre)}</div>`;
const regs=[];function log(t){regs.unshift(`[${hora()}] ${t}`);regs.length=Math.min(regs.length,30);$('ult').textContent=regs[0];}
function renderPaneles(){const L=[...bots.values()].map(o=>o.data),act=L.filter(b=>b.estado==='trabajando').length;
 $('activos').textContent=`${act}/${L.length} activos`;
 $('lista').innerHTML=L.map(b=>`<div class="f" data-id="${b.id}">${avHTML(b)}<div><b>${esc(b.nombre)}</b><div class="s">${esc(AR[bots.get(b.id).seat.a].n)}</div></div><span class="d" style="background:${COL[b.estado]}"></span></div>`).join('');
 $('eq').innerHTML=L.map(b=>`<div class="f" data-id="${b.id}"><span class="d" style="margin:0;background:${COL[b.estado]}"></span><b>${esc(b.nombre)}</b><span class="s" style="margin-left:auto">${TXT[b.estado]}</span></div>`).join('');
 const c={trabajando:0,esperando:0,pausa:0};L.forEach(b=>c[b.estado]++);const mx=Math.max(...hist,1),w=200,h=34;
 const pts=hist.map((v,i)=>`${(i/Math.max(hist.length-1,1))*w},${h-2-(v/mx)*(h-6)}`).join(' ');
 $('resumen').innerHTML=`<div style="display:flex;justify-content:space-between"><span><span class="acc">${c.trabajando}</span> trabajando</span><span style="color:#F59E0B">${c.esperando} esperan</span><span>${c.pausa} pausa</span></div><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="#10B981" stroke-width="2"/></svg><div class="s">Actividad reciente · act. ${esc(hora(window.__act))}</div>`;}
const irA=id=>{const o=bots.get(id);if(!o)return;const p=new THREE.Vector3();o.g.getWorldPosition(p);p.y+=.8;volar(p,8,new THREE.Vector3(.45,.75,.6).normalize());if(movil())document.body.classList.remove('abiertos');};
for(const id of ['lista','eq'])$(id).onclick=e=>{const el=e.target.closest('.f');if(el)irA(el.dataset.id)};
$('bpaneles').onclick=()=>document.body.classList.toggle('abiertos');
function abrirFicha(id){const b=bots.get(id).data;$('ficha').style.display='block';$('ficha').innerHTML=`${avHTML(b)}<b>${esc(b.nombre)}</b><div>${esc(b.area)}</div><div class="s">${esc(AR[bots.get(b.id).seat.a].n)}${bots.get(b.id).seat.j?' · Jefe de área':''}</div><div style="color:${COL[b.estado]};font-weight:700;margin:6px 0">${EMO[b.estado]} ${TXT[b.estado]}</div><div>“${esc(b.frase)}”</div><div class="s" style="margin-top:8px">Toca fuera para cerrar</div><button class="cerrar" aria-label="Cerrar">✕</button>`;}
// ---------- datos ----------
async function cargar(){try{await listo;const j=await (await fetch('./estado.json?t='+Date.now())).json();window.__act=new Date(j.actualizado);if(PERS_ON&&new URLSearchParams(location.search).has('sentados'))for(const b of (j.bots||[]))if(b.id==='ted'||b.id==='mateo')b.estado='trabajando';
 j.bots.forEach((b,i)=>{if(!TXT[b.estado])b.estado='esperando';let o=bots.get(b.id);
  if(!o){o=makeBot(b,i);bots.set(b.id,o);meta(o);burbuja(o);}else if(o.data.estado!==b.estado||o.data.frase!==b.frase){if(o.data.estado!==b.estado){log(`${b.nombre}: ${TXT[o.data.estado]} → ${TXT[b.estado]} · ${b.frase}`);o.data=b;meta(o);}o.data=b;burbuja(o);}else o.data=b;});
 hist.push([...bots.values()].filter(o=>o.data.estado==='trabajando').length);if(hist.length<2)hist.unshift(hist[0]);if(hist.length>30)hist.shift();
 if(!regs.length)log(`Oficina actualizada · ${hist.at(-1)} bots trabajando`);renderPaneles();}catch(e){console.warn(e)}}
cargar();setInterval(cargar,60000);{const l=document.createElement('div');l.id='leyenda';l.className='glass';l.innerHTML='<span><i style="background:#22C55E"></i>Activo</span><span><i class="pul" style="background:#3B82F6"></i>Trabajando</span><span><i style="background:#9CA3AF"></i>En pausa</span>';document.body.appendChild(l);}$('pisos').style.display='none';$('bedif').style.display='none';
$('ult').textContent='Cargando muebles y personajes…';
// ---------- tap vs arrastre (la cámara la maneja OrbitControls) ----------
const ptrs=new Map();let st=null,moved=false;
cv.addEventListener('pointerdown',e=>{if(e.isPrimary)ptrs.clear();ptrs.set(e.pointerId,1);if(ptrs.size===1){st={x:e.clientX,y:e.clientY,t:performance.now()};moved=false}else moved=true;});
addEventListener('pointermove',e=>{if(st&&!moved&&ptrs.has(e.pointerId)&&Math.hypot(e.clientX-st.x,e.clientY-st.y)>(e.pointerType==='touch'?12:6))moved=true;},{passive:true});
const up=e=>{if(!ptrs.delete(e.pointerId))return;if(!ptrs.size){if(st&&!moved&&performance.now()-st.t<800&&e.type==='pointerup')tap(e.clientX,e.clientY);st=null;}};
addEventListener('pointerup',up);addEventListener('pointercancel',up);addEventListener('blur',()=>{ptrs.clear();st=null});
const ray=new THREE.Raycaster(),_nd=new THREE.Vector2(),_v=new THREE.Vector3();
function tap(x,y){_nd.set(x/innerWidth*2-1,-(y/innerHeight)*2+1);ray.setFromCamera(_nd,cam);const h=ray.intersectObjects(hits,false)[0];
 if(h)return abrirFicha(h.object.userData.id);
 let best=null,bd=movil()?34:24;for(const [id,o] of bots){for(const hy of[.35,.75,1.3]){o.g.getWorldPosition(_v);_v.y+=hy;_v.project(cam);if(_v.z>1)continue;
  const d=Math.hypot((_v.x+1)/2*innerWidth-x,(1-_v.y)/2*innerHeight-y);if(d<bd){bd=d;best=id;}}}
 if(best)abrirFicha(best);else cerrarFicha();}
function cerrarFicha(){$('ficha').style.display='none';}
$('ficha').addEventListener('click',e=>{if(e.target.closest('.cerrar'))cerrarFicha();});
window.__fichaAbierta=()=>$('ficha').style.display==='block';
const pr=(v)=>{v.project(cam);return {x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight,z:v.z}};
window.__botPantalla=id=>{const v=new THREE.Vector3();bots.get(id).g.getWorldPosition(v);v.y+=.9;return pr(v)};
const DIR0=new THREE.Vector3(.42,.62,.66).normalize(),D0=()=>movil()?82:46;
cam.position.copy(DIR0).multiplyScalar(D0());ctl.target.set(0,0,0);ctl.update();
{const z=document.createElement('div');z.id='zonas';z.className='glass';
 const L=[['Recepción','rec'],['Tinta Rosa','tr'],['Administración','per'],['Creativa','cre'],['CEO','ceo'],['Café','com'],['Vista general','']];
 for(const [n,id] of L){const b=document.createElement('button');b.textContent=n;b.onclick=()=>{if(!id){volar(new THREE.Vector3(0,0,0),D0(),DIR0.clone());return;}const a=AR[id];volar(new THREE.Vector3((a.x0+a.x1)/2,0,(a.z0+a.z1)/2),movil()?17:13,new THREE.Vector3(.25,.8,.55).normalize());};z.appendChild(b);}
 document.body.appendChild(z);}
window.__volar2=(x,y,z,d,a,b2,c)=>volar(new THREE.Vector3(x,y,z),d,new THREE.Vector3(a,b2,c).normalize());
window.__volar=(x,z,d)=>volar(new THREE.Vector3(x,0,z),d,new THREE.Vector3(.3,.75,.6).normalize());
// ---------- animación ----------
const clk=new THREE.Clock(),tmp=new THREE.Vector3(),ang=a=>((a+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;
R.setAnimationLoop(()=>{const rdt=clk.getDelta(),dt=Math.min(rdt,.05),k=1-Math.exp(-dt*8);
 if(fly){fly.t=Math.min(fly.t+Math.min(rdt,.25)/fly.dur,1);const e=ease(fly.t);ctl.target.lerpVectors(fly.t0,fly.t1,e);cam.position.lerpVectors(fly.p0,fly.p1,e);if(fly.t>=1)fly=null;}
 ctl.update();const vis=[];
 for(const o of bots.values()){o.t+=dt;o.mix.update(dt);const p=o.g.position;let want=o.ry;
  if(o.path.length){const nx=o.path[0];tmp.copy(nx).sub(p);tmp.y=0;const d=tmp.length();
   if(d<.05){p.x=nx.x;p.z=nx.z;o.path.shift();if(!o.path.length){const f=o.fin;o.ry=f.ry;if(f.sit){o.sit=1;anim(o,'Sitting',.5);}else anim(o,'Idle');o.cup.visible=!!f.cup;}}
   else{p.addScaledVector(tmp.normalize(),Math.min(d,dt*1.25));want=Math.atan2(tmp.x,tmp.z);}}
  else{if(o.fin&&o.fin.ry==null)want=Math.atan2(cam.position.x-p.x,cam.position.z-p.z);
   o.wait-=dt;if(o.wait<=0){o.wait=8+Math.random()*10;const e=o.data.estado;
    if(e==='pausa'&&Math.random()<.4)meta(o);else if(!o.sit)anim(o,o.cup.visible?'Yes':e==='esperando'?(Math.random()<.5?'Wave':'ThumbsUp'):'Yes',.25);}}
  if(want!=null)o.g.rotation.y+=ang(want-o.g.rotation.y)*k;
  p.y+=((o.sit?(o.sy??SIT_Y):0)-p.y)*k;
  o.g.getWorldPosition(tmp);const dist=tmp.distanceTo(cam.position);tmp.y+=o.sit?1.3:1.62;const q=pr(tmp),sz=Math.max(32,Math.min(movil()?44:52,(movil()?40:48)*Math.pow(D0()/cam.position.distanceTo(ctl.target),.6)));vis.push({o,q,sz});}
 vis.sort((a,b)=>a.q.z-b.q.z);const ya2=[];
 for(const v of vis){const {o,q,sz}=v;let ok=q.z<1&&q.x>-20&&q.x<innerWidth+20;for(const u of ya2)if(Math.hypot(u.x-q.x,u.y-q.y)<(u.s+sz)*.42){ok=false;break;}
  o.el.style.display=ok?'block':'none';if(ok){ya2.push({x:q.x,y:q.y,s:sz});o.el.style.transform=`translate(${q.x}px,${q.y}px) translate(-50%,-100%)`;o.el.style.setProperty('--s',sz+'px');}}
 comp.render();});
window.__camara=()=>({pos:cam.position.toArray().map(n=>+n.toFixed(2)),polar:+ctl.getPolarAngle().toFixed(3),azim:+ctl.getAzimuthalAngle().toFixed(3)});

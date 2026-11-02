import {makePersonita,PERSONITAS} from './personitas.js';import {iniciarMando,fichaMando,MANDO} from './mando.js';iniciarMando();
const PERS_ON=!new URLSearchParams(location.search).has('robots');
import * as THREE from 'three';import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader.js';import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js';import * as SkU from 'three/examples/jsm/utils/SkeletonUtils.js';import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';import {N8AOPass} from 'n8ao';import './estilo.css';
const COL={trabajando:'#3B82F6',esperando:'#9CA3AF',pausa:'#4B5563',te:'#F97316'},TXT={trabajando:'Trabajando ahora',esperando:'Disponible',pausa:'En pausa',te:'Te espera'};const TE=id=>!!window.__teEspera?.has(id);const EK=b=>TE(b.id)?'te':b.estado,EMO={trabajando:'💻',esperando:'⏳',pausa:'☕'};
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
function flush(){for(const [k,gs] of ACC){const m=new THREE.Mesh(mergeGeometries(gs.map(g=>{g=g.index?g.toNonIndexed():g;g.clearGroups();for(const a of Object.keys(g.attributes))if(!['position','normal','uv'].includes(a))g.deleteAttribute(a);return g;})),M[k]);if(k==='vidrio'){m.renderOrder=10;m.castShadow=false;}else m.castShadow=!['luz','pantalla'].includes(k);m.receiveShadow=true;W.add(m);}ACC.clear();}
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
 {id:'ted',n:'Dirección general · Ted',x0:-5,z0:-11,x1:5,z1:-1,m:'nogal',d:-3,s:1},
 {id:'jur',n:'Jurídico',x0:5,z0:-11,x1:10,z1:-1,m:'madera',d:6,s:1},
 {id:'fin',n:'Finanzas',x0:10,z0:-11,x1:15,z1:-1,m:'alfAzul',d:11.2,s:1},
 {id:'pod',n:'Estudio podcast',x0:-15,z0:1,x1:-11,z1:11,m:'concreto',d:-13.6,s:-1},
 {id:'per',n:'Asuntos personales',x0:-11,z0:1,x1:-3,z1:11,m:'madera',d:-7,s:-1},
 {id:'rec',n:'Recepción',x0:-3,z0:1,x1:3,z1:11,m:'marmol',d:0,s:-1},
 {id:'pro',n:'Proyectos',x0:3,z0:1,x1:9,z1:11,m:'concreto',d:6,s:-1},
 {id:'com',n:'Café',x0:9,z0:1,x1:15,z1:11,m:'mosaico',d:9.8,s:-1}];
const AR=Object.fromEntries(AREAS.map(a=>[a.id,a]));AR.jun={n:'Sala de juntas'};
Object.assign(M,{rojo:new THREE.MeshStandardMaterial({color:0xd33a2c,emissive:0x7a1008,emissiveIntensity:.6,roughness:.4}),espuma:new THREE.MeshStandardMaterial({color:0x2e3440,roughness:1}),
 verde:new THREE.MeshStandardMaterial({color:0x2f9e44,roughness:.8}),hoja:new THREE.MeshStandardMaterial({color:0x3f7d3a,roughness:.8}),morado:new THREE.MeshStandardMaterial({color:0x8b5cf6,roughness:.15,metalness:.1,transparent:true,opacity:.85}),
 vela:new THREE.MeshStandardMaterial({color:0xf3e9d2,roughness:.7}),llama:new THREE.MeshStandardMaterial({color:0xffb347,emissive:0xff9a2e,emissiveIntensity:3}),
 papel:new THREE.MeshStandardMaterial({color:0xf7f3ea,roughness:.9}),azul:new THREE.MeshStandardMaterial({color:0x2563eb,roughness:.5}),naranja:new THREE.MeshStandardMaterial({color:0xf59e0b,roughness:.5}),
 tapete:new THREE.MeshStandardMaterial({color:0x5b2333,roughness:1}),luna:new THREE.MeshStandardMaterial({color:0xf1f0e8,emissive:0xd9d6c8,emissiveIntensity:1.2})});
caja(31,.4,23,'losa',0,-.2,0,{ts:4});caja(31.2,1.4,23.2,'fachada',0,-1.1,0);
for(let k=0;k<22;k++)caja(1,.6,.05,'negro',-14.2+k*1.35,-1.05,11.62);for(let k=0;k<16;k++)caja(.05,.6,1,'negro',15.62,-1.05,-10.2+k*1.35);
for(const a of AREAS)piso(a.x0,a.z0,a.x1,a.z1,a.m,a.m==='marmol'?3:a.m==='mosaico'?1.5:2);
piso(-15,-1,15,1,'concreto',3);piso(-15,-11,-10.8,-5.6,'nogal',2,.016);piso(-4,-6.2,4,-2.2,'alfAzul',2,.016);
muro(-15,-11,15,-11,'ext');muro(-15,-11,-15,11,'ext');muro(15,-11,15,11,'bajo');muro(-15,11,15,11,'bajo',[0]);
muro(-15,-1,15,-1,'int',[-7,-3,6,11.2]);muro(-5,-11,-5,-1,'int');muro(5,-11,5,-1,'int');muro(10,-11,10,-1,'cristal');
muro(-10.8,-11,-10.8,-5.6,'cristal');muro(-15,-5.6,-10.8,-5.6,'cristal',[-12.6]);
muro(-15,1,-3,1,'int',[-13.6,-7]);muro(3,1,15,1,'int',[6,9.8]);muro(-11,1,-11,11,'int');muro(-3,1,-3,11,'int');muro(3,1,3,11,'int');muro(9,1,9,11,'cristal');
for(const x of [-3,3])caja(.4,3,.4,'muro',x,1.5,1);
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
 ted:{x:0,z:-7.6,w:2.4,a:'ted',j:1},julian:{x:7.2,z:-7.4,w:1.8,a:'jur',j:1},ines:{x:12.3,z:-7.4,w:1.8,a:'fin',j:1},
 rulo:{x:-13.3,z:5,w:1.6,a:'pod',j:1},
 vale:{x:-9,z:4,a:'per'},libro:{x:-5,z:4,a:'per'},emiliano:{x:-9,z:8.3,a:'per'},luna:{x:-5,z:8.3,a:'per'},
 apps:{x:4.4,z:4,a:'pro'},director:{x:7.3,z:4,a:'pro'},ceo:{x:5.4,z:8.3,w:2,a:'pro',j:1}};
const EXTRA=[{x:-6.6,z:-4.5,a:'tr'},{x:-13.3,z:9,a:'pod'}];
for(const p of [...Object.values(PUESTOS),...EXTRA]){const w=p.w||1.5;p.sz=p.z-.8;p.ax??=p.x+w/2+.4;
 mueble('metal_office_desk',p.x,p.z,0,[w/2,.95,.8]);mueble('dining_chair_02',p.x,p.sz-.05,SILLA_RY,1);monitor(p.x+(p.j?-.2:0),p.z,0);if(p.j)monitor(p.x+.5,p.z,0);}
const cil=(r,h,mk,x,y,z,r2=r,n=12)=>P(new THREE.CylinderGeometry(r,r2,h,n),mk,x,y,z);
const TOP=.77;
// Tinta Rosa (sin cambios)
mueble('wooden_bookshelf_worn',-14.65,-8.5,Math.PI/2,[1,1,1]);mueble('dining_chair_02',-13.4,-7.3,0,1);mueble('dining_chair_02',-12.6,-7.3,0,1);mueble('potted_plant_04',-11.3,-10.5,0,4.2);
mueble('wooden_bookshelf_worn',-7.8,-10.65,0,1);mueble('potted_plant_04',-5.5,-10.5,0,4.5);mueble('potted_plant_04',-14.5,-1.6,0,4);mueble('drawer_cabinet',-5.4,-6.5,-Math.PI/2,[.8,.7,1]);
// Ted: oficina principal con muro de pantallas
for(const x of [-2.6,0,2.6]){caja(2.3,1.35,.06,'negro',x,1.75,-10.86);caja(2.18,1.24,.02,'pantalla',x,1.75,-10.82);}
for(let k=0;k<6;k++)caja(.18,.2+k*.12,.01,['azul','naranja','verde'][k%3],-3.4+k*.3,1.3+(.2+k*.12)/2,-10.8);
cil(.05,.5,'naranja',2.6,1.75,-10.8);caja(2.3,.08,.3,'nogal',0,.9,-10.75);
mueble('dining_chair_02',-.5,-6.3,Math.PI,1);mueble('dining_chair_02',.5,-6.3,Math.PI,1);
mueble('dining_table',-1.6,-3.6,0,[1.1,.86,.8]);for(const s of [-.8,.8]){mueble('dining_chair_02',-1.6+s,-4.5,SILLA_RY,1);mueble('dining_chair_02',-1.6+s,-2.7,Math.PI,1);}
mueble('sofa_02',4.25,-4.6,-Math.PI/2,1);mueble('modern_coffee_table_01',3.1,-4.6,0,.9);mueble('wooden_bookshelf_worn',-4.65,-8,Math.PI/2,1);
mueble('potted_plant_04',-4.5,-10.5,0,4.6);mueble('potted_plant_04',4.5,-10.5,0,4.6);mueble('potted_plant_04',4.5,-1.6,0,4);
// Julián: jurídico
mueble('wooden_bookshelf_worn',6.2,-10.65,0,1);mueble('wooden_bookshelf_worn',8.6,-10.65,0,1);
mueble('drawer_cabinet',9.6,-4.2,-Math.PI/2,[1,.8,1]);mueble('drawer_cabinet',9.6,-5.6,-Math.PI/2,[1,.8,1]);
mueble('dining_chair_02',6.8,-6.1,Math.PI,1);mueble('dining_chair_02',7.6,-6.1,Math.PI,1);mueble('potted_plant_04',5.5,-1.6,0,4);
{const x=7.85,z=-7.3;cil(.09,.03,'oro',x,TOP+.015,z);cil(.012,.42,'oro',x,TOP+.24,z);caja(.44,.012,.012,'oro',x,TOP+.44,z);for(const s of [-.21,.21]){cil(.003,.16,'oro',x+s,TOP+.36,z);cil(.07,.012,'oro',x+s,TOP+.28,z,.05);}}
for(let k=0;k<3;k++)caja(.32,.05,.24,['papel','nogal','papel'][k],6.3,TOP+.03+k*.05,-7.3);
// Inés: finanzas
caja(.75,.95,.7,'negro',14.4,.475,-10.4);cil(.09,.04,'oro',14.4,.6,-10.03);P(new THREE.CylinderGeometry(.09,.09,.04,16).rotateX(Math.PI/2),'oro',14.4,.6,-10.04);
caja(2.2,1.2,.05,'negro',12.2,1.8,-10.86);caja(2.1,1.1,.02,'papel',12.2,1.8,-10.82);for(let k=0;k<7;k++){const h=.15+((k*37)%5)*.15;caja(.18,h,.02,k%2?'verde':'azul',11.45+k*.25,1.3+h/2,-10.8);}
mueble('wooden_bookshelf_worn',14.65,-6.4,-Math.PI/2,1);caja(.16,.03,.22,'negro',11.6,TOP+.015,-7.25);for(let k=0;k<4;k++)caja(.3,.04,.22,['verde','azul','rojo','nogal'][k],13.05,TOP+.02+k*.04,-7.3);
mueble('dining_chair_02',11.9,-6.1,Math.PI,1);mueble('dining_chair_02',12.7,-6.1,Math.PI,1);mueble('potted_plant_04',10.5,-1.6,0,4);
// Rulo: estudio de podcast
for(let i=0;i<4;i++)for(let j=0;j<6;j++){caja(.06,.5,.5,'espuma',-14.9,1.0+i*.55,2.6+j*1.15);}
for(let i=0;i<5;i++)caja(.6,.6,.06,'espuma',-14.4+i*.7,1.6,10.9);
for(const [x,z,dz] of [[-13.6,5,-.25],[-13.6,5,.25]]){cil(.06,.03,'negro',x,TOP+.015,z);cil(.01,.35,'marco',x,TOP+.2,z);caja(.012,.012,.3,'marco',x,TOP+.38,z+dz/2);P(new THREE.CapsuleGeometry(.035,.08,4,8),'negro',x,TOP+.36,z+dz);}
P(new THREE.TorusGeometry(.09,.015,8,16,Math.PI),'negro',-12.7,TOP+.09,5.1);cil(.035,.04,'rojo',-12.79,TOP+.03,5.1);cil(.035,.04,'rojo',-12.61,TOP+.03,5.1);
mueble('dining_chair_02',-13.6,6.1,Math.PI,1);mueble('potted_plant_04',-11.5,10.4,0,4);
{const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');g.fillStyle='#b91c1c';g.fillRect(0,0,256,96);g.fillStyle='#fff';g.font='700 54px Inter,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('ON AIR',128,50);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(.9,.34),new THREE.MeshStandardMaterial({map:t,emissive:0xff2a2a,emissiveMap:t,emissiveIntensity:1.4}));m.position.set(-13,2.45,10.86);m.rotation.y=Math.PI;W.add(m);}
// Asuntos personales: rincones
// Vale (redes): aro de luz y teléfono
cil(.012,1.5,'marco',-10.4,.75,2.4);P(new THREE.TorusGeometry(.26,.03,10,28),'luz',-10.4,1.6,2.4);caja(.08,.15,.01,'negro',-10.4,1.6,2.41);
caja(.08,.15,.01,'negro',-8.6,TOP+.08,3.9);caja(.5,.5,.03,'rojo',-10.95,1.7,4.6,{ry:Math.PI/2});
// Libro: librero, máquina de escribir, manuscritos
mueble('wooden_bookshelf_worn',-3.35,5.6,-Math.PI/2,1);caja(.34,.12,.26,'negro',-5.35,TOP+.06,3.85);caja(.3,.06,.02,'papel',-5.35,TOP+.17,3.98);
for(const [x,n] of [[-4.6,5],[-4.25,3]])for(let k=0;k<n;k++)caja(.24,.012,.3,'papel',x,TOP+.006+k*.013,4.1);
// Emiliano: plantas, mancuernas, tapete de yoga, agua
caja(.65,.01,1.8,'verde',-10.3,.02,9.6);for(const z of [7.4,7.8]){caja(.25,.05,.05,'marco',-10.4,.06,z);for(const s of [-.12,.12])cil(.06,.08,'negro',-10.4+s,.06,z);}
cil(.035,.22,'azul',-9.4,TOP+.11,8.35);mueble('potted_plant_04',-10.5,6.3,0,4.5);mueble('potted_plant_04',-7.6,10.4,0,4);
// Luna: velas, cristales, luna, tarot
for(const [x,z,h] of [[-4.2,10.5,.25],[-3.9,10.6,.18],[-4.5,10.65,.32]]){cil(.05,h,'vela',x,h/2,z);P(new THREE.ConeGeometry(.02,.06,8),'llama',x,h+.04,z);}
for(const [x,z,s] of [[-5.5,8.2,.06],[-5.35,8.15,.04],[-4.4,8.45,.05]])P(new THREE.OctahedronGeometry(s),'morado',x,TOP+s,z);
P(new THREE.CircleGeometry(.45,32).rotateY(Math.PI),'luna',-4.6,2.1,10.86);P(new THREE.CircleGeometry(.43,32).rotateY(Math.PI),'espuma',-4.42,2.15,10.85);
for(let k=0;k<3;k++)caja(.07,.004,.12,'morado',-4.75+k*.1,TOP+.003,8.0);caja(.6,.6,.03,'espuma',-3.05+0.0,1.7,9.2,{ry:Math.PI/2});
// Recepción
caja(5,2.7,.25,'muro',0,1.35,3.4);caja(5.1,.06,.3,'marco',0,2.73,3.4);
caja(3.4,1.05,.7,'muro',0,.53,6.2);caja(3.6,.06,.85,'nogal',0,1.09,6.15);caja(3.4,.06,.04,'oro',0,.9,6.57);mueble('dining_chair_02',0,5.3,SILLA_RY,1);monitor(-.5,6.1,Math.PI);
mueble('sofa_02',0,10.2,0,1);mueble('modern_coffee_table_01',0,9,Math.PI/2,.9);mueble('potted_plant_04',-2.5,4.2,0,5);mueble('potted_plant_04',2.5,4.2,0,5);mueble('potted_plant_04',-2.5,10.4,0,4);mueble('potted_plant_04',2.5,10.4,0,4);
// Proyectos: laboratorio de apps, oficina CEO, estudio de video
caja(.04,1,1.8,'papel',3.17,1.6,4.2);caja(.05,1.06,1.86,'marco',3.15,1.6,4.2);monitor(3.95,4,0);
caja(.03,2.2,2.6,'verde',8.86,1.3,8.8);for(const a of [0,2.1,4.2])cil(.012,1.4,'marco',7.9+Math.cos(a)*.2,.7,9.4+Math.sin(a)*.2);caja(.22,.14,.3,'negro',7.9,1.48,9.4);
cil(.012,1.6,'marco',8.4,.8,10.4);caja(.5,.5,.12,'luz',8.4,1.7,10.35);
mueble('mid_century_lounge_chair',3.8,10,Math.PI/2,.85);mueble('potted_plant_04',3.5,7,0,4);caja(.05,.7,1.1,'oro',3.17,1.7,8.6);
// Café
const MESAS=[[11,6.3],[11,9.5]];
for(const [tx,tz] of MESAS){mueble('round_wooden_table_01',tx,tz,0,[.62,.76,.62]);mueble('dining_chair_02',tx-.8,tz,Math.PI/2,1);mueble('dining_chair_02',tx+.8,tz,-Math.PI/2,1);}
caja(.65,.9,4,'nogal',14.5,.45,8.2);caja(.72,.05,4.1,'marmol',14.48,.925,8.2);caja(.42,.5,.45,'negro',14.55,1.2,7.2);caja(.3,.06,.3,'gris',14.5,.97,7.2);caja(.18,.3,.18,'oro',14.6,1.1,8.4);caja(.5,1.1,.04,'pantalla',14.86,1.9,8.2);
mueble('mid_century_lounge_chair',14,2.6,-Math.PI/2,.85);mueble('potted_plant_04',9.6,10.4,0,4.5);mueble('potted_plant_04',14.4,1.6,0,4);
// refuerzo visual: estudio y rincón de Luna
caja(2.6,.012,3.2,'tapete',-13.2,.02,5.6);for(const [x,z] of [[-13.6,4.75],[-13.6,5.25]]){caja(.03,.5,.03,'marco',x,TOP+.25,z);P(new THREE.CapsuleGeometry(.06,.14,4,10),'negro',x,TOP+.55,z);caja(.16,.16,.01,'espuma',x,TOP+.55,z+(z<5?.12:-.12));}
for(let i=0;i<3;i++)for(let j=0;j<4;j++)caja(.5,.5,.06,'espuma',-14.3+j*.6,1.2+i*.6,1.1);
{const c=document.createElement('canvas');c.width=256;c.height=96;const g=c.getContext('2d');g.fillStyle='#b91c1c';g.fillRect(0,0,256,96);g.fillStyle='#fff';g.font='700 54px Inter,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('ON AIR',128,50);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.BoxGeometry(1.1,.42,.05),new THREE.MeshStandardMaterial({map:t,emissive:0xff2a2a,emissiveMap:t,emissiveIntensity:1.4}));m.position.set(-11.1,2.3,5.2);m.rotation.y=-Math.PI/2;W.add(m);}
P(new THREE.CircleGeometry(1.1,32).rotateX(-Math.PI/2),'morado',-4.6,.025,9.6);for(const [x,z] of [[-5.4,10.3],[-3.9,9.4],[-4.2,10.4],[-3.8,8.9]]){cil(.06,.3,'vela',x,.15,z);P(new THREE.ConeGeometry(.03,.08,8),'llama',x,.35,z);}
P(new THREE.SphereGeometry(.18,16,12),'luna',-3.9,TOP+.2,8.6);cil(.1,.03,'oro',-3.9,TOP+.015,8.6);
for(const [x,z] of [[11,7.9],[0,6.2],[0,-7.4],[-1.6,-3.6],[7.2,-7.2],[12.3,-7.2]])lamparaLineal(x,z,2);
for(const x of [-9,-6.6])for(const z of [-8,-4.4])lamparaLineal(x,z,1.8);lamparaLineal(-13,-8,1.6);
for(const x of [-9,-5])for(const z of [4.6,8.4])lamparaLineal(x,z,1.8);for(const [x,z] of [[4.4,4.6],[7.3,4.6],[5.4,8.6],[-13.3,5.4]])lamparaLineal(x,z,1.6);for(const x of [-10,0,10])lamparaLineal(x,0,3);
flush();
for(const [x,z,c,i] of [[-10,-6],[0,-6],[7.5,-6],[12.5,-6],[-13,6,'#ffc2a8',5],[-7,6],[0,7],[6,6],[12,7]]){const l=new THREE.PointLight(c||'#ffd9a8',i||6,9,1.6);l.position.set(x,2.6,z);S.add(l);}
// letreros
function letrero(txt,x,z,w=2.6,y=2.4){const c=document.createElement('canvas');c.width=640;c.height=112;const g=c.getContext('2d');g.fillStyle='#1d1d1f';g.fillRect(0,0,640,112);g.fillStyle='#C8A46A';g.fillRect(0,104,640,8);g.fillStyle='#f4efe6';g.font='600 46px Inter,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,320,54);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;const m=new THREE.Mesh(new THREE.BoxGeometry(w,w*112/640,.03),[M.negro,M.negro,M.negro,M.negro,new THREE.MeshStandardMaterial({map:t,roughness:.5}),M.negro]);m.position.set(x,y,z);W.add(m);}
for(const a of AREAS)if(a.id!=='rec')letrero(a.n,(a.x0+a.x1)/2,a.s>0?-.86:1.14,Math.min(a.n.length>14?3.6:2.6,a.x1-a.x0-.6));
letrero('Dirección Tinta Rosa',-12.9,-5.48,2.6);
{const c=document.createElement('canvas');c.width=1024;c.height=256;const g=c.getContext('2d');g.fillStyle='#EDE7DD';g.fillRect(0,0,1024,256);g.fillStyle='#1d1d1f';g.font='600 92px Inter,system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('Oficina de los bots',512,120);g.fillStyle='#C8A46A';g.fillRect(352,200,320,6);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;const m=new THREE.Mesh(new THREE.PlaneGeometry(4.6,1.15),new THREE.MeshStandardMaterial({map:t,roughness:.5}));m.position.set(0,1.8,3.53);W.add(m);}
// ---------- rutas ----------
const C=(x,z)=>new THREE.Vector3(x,0,z);
function rutaSilla(p){const a=AR[p.a],dz=a.s>0?-2:2;return [C(a.d,0),C(a.d,dz),...(p.via||[]).map(([x,z])=>C(x,z)),C(p.ax,(p.via?p.via.at(-1)[1]:dz)),C(p.ax,p.sz)];}
const CAFE=[];MESAS.forEach(([tx,tz],i)=>{for(const s of [-1,1])CAFE.push({p:C(tx+s*.8,tz),ry:s<0?Math.PI/2:-Math.PI/2,sit:1,via:[C(9.8,0),C(9.8,2),C(9.8,7.9),C(tx+s*.8,7.9)]});});
for(const z of [7.3,8.5])CAFE.push({p:C(13.1,z),ry:Math.PI/2,sit:0,cup:1,via:[C(9.8,0),C(9.8,2),C(9.8,4.5),C(13.1,4.5)]});
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
function burbuja(o){const b=o.data;o.el.className='pin '+EK(b);o.el.innerHTML=`${AV[b.id]?`<img src="${AV[b.id]}" alt="">`:`<i style="background:#${o.col.toString(16).padStart(6,'0')}">${ini(b.nombre)}</i>`}<span class="sd"></span>`;}
const listo=cargaModelos.then(()=>{colocar();calibrar();});
// ---------- paneles ----------
// ---------- paneles ----------
const hist=[],hora=d=>(d||new Date()).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});
const avHTML=(b,c)=>AV[b.id]?`<img class="av" src="${AV[b.id]}">`:`<div class="av" style="background:${c||'#ddd'}">${ini(b.nombre)}</div>`;
const regs=[];function log(t){regs.unshift(`[${hora()}] ${t}`);regs.length=Math.min(regs.length,30);$('ult').textContent=regs[0];}
function renderPaneles(){const L=[...bots.values()].map(o=>o.data),act=L.filter(b=>b.estado==='trabajando').length;
 $('activos').textContent=`${act}/${L.length} activos`;
 $('lista').innerHTML=L.map(b=>`<div class="f" data-id="${b.id}">${avHTML(b)}<div><b>${esc(b.nombre)}</b><div class="s">${esc(AR[bots.get(b.id).seat.a].n)}</div></div><span class="d e-${EK(b)}"></span></div>`).join('');
 $('eq').innerHTML=L.map(b=>`<div class="f" data-id="${b.id}"><span class="d e-${EK(b)}" style="margin:0"></span><b>${esc(b.nombre)}</b><span class="s" style="margin-left:auto">${TXT[EK(b)]}</span></div>`).join('');
 const c={trabajando:0,esperando:0,pausa:0,te:0};L.forEach(b=>c[b.estado]++);L.forEach(b=>{if(TE(b.id))c.te++;});const mx=Math.max(...hist,1),w=200,h=34;
 const pts=hist.map((v,i)=>`${(i/Math.max(hist.length-1,1))*w},${h-2-(v/mx)*(h-6)}`).join(' ');
 $('resumen').innerHTML=`<div style="display:flex;justify-content:space-between"><span><span class="acc">${c.trabajando}</span> trabajando</span>${c.te?`<span style="color:#F97316">${c.te} te esperan</span>`:`<span>${c.esperando} disponibles</span>`}<span>${c.pausa} pausa</span></div><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="#10B981" stroke-width="2"/></svg><div class="s">Actividad reciente · act. ${esc(hora(window.__act))}</div>`;}
const irA=id=>{const o=bots.get(id);if(!o)return;const p=new THREE.Vector3();o.g.getWorldPosition(p);p.y+=.8;volar(p,8,new THREE.Vector3(.45,.75,.6).normalize());if(movil())document.body.classList.remove('abiertos');};
for(const id of ['lista','eq'])$(id).onclick=e=>{const el=e.target.closest('.f');if(el)irA(el.dataset.id)};
$('bpaneles').onclick=()=>document.body.classList.toggle('abiertos');
function abrirFicha(id){const b=bots.get(id).data;const _h=`${avHTML(b)}<b>${esc(b.nombre)}</b><div>${esc(b.area)}</div><div class="s">${esc(AR[bots.get(b.id).seat.a].n)}${bots.get(b.id).seat.j?' · Jefe de área':''}</div><div style="color:${COL[EK(b)]};font-weight:700;margin:6px 0">${TE(b.id)?'🟠':EMO[b.estado]} ${TXT[EK(b)]}</div><div>“${esc(b.frase)}”</div><div class="s" style="margin-top:8px">Toca fuera para cerrar</div>`;const _m=fichaMando(id,_h.replace(/<div class="s" style="margin-top:8px">Toca fuera para cerrar<\/div>/,''));$('ficha').innerHTML=(_m||_h)+'<button class="cerrar" aria-label="Cerrar">✕</button>';$('ficha').style.display='block';$('ficha').scrollTop=0;}
// ---------- datos ----------
async function cargar(){try{await listo;const j=await (await fetch('./estado.json?t='+Date.now())).json();window.__act=new Date(j.actualizado);if(PERS_ON&&new URLSearchParams(location.search).has('sentados'))for(const b of (j.bots||[]))if(b.id==='ted'||b.id==='mateo')b.estado='trabajando';
 j.bots.forEach((b,i)=>{if(!TXT[b.estado])b.estado='esperando';let o=bots.get(b.id);
  if(!o){o=makeBot(b,i);bots.set(b.id,o);meta(o);burbuja(o);}else if(o.data.estado!==b.estado||o.data.frase!==b.frase){if(o.data.estado!==b.estado){log(`${b.nombre}: ${TXT[o.data.estado]} → ${TXT[b.estado]} · ${b.frase}`);o.data=b;meta(o);}o.data=b;burbuja(o);}else o.data=b;});
 hist.push([...bots.values()].filter(o=>o.data.estado==='trabajando').length);if(hist.length<2)hist.unshift(hist[0]);if(hist.length>30)hist.shift();
 if(!regs.length)log(`Oficina actualizada · ${hist.at(-1)} bots trabajando`);renderPaneles();}catch(e){console.warn(e)}}
window.__repintar=()=>{bots.forEach(o=>burbuja(o));renderPaneles();};cargar();setInterval(cargar,60000);{const l=document.createElement('div');l.id='leyenda';l.className='glass';l.innerHTML='<span class="lte" data-k="te" role="button"><i class="pulo" style="background:#F97316"></i>Te espera</span><span data-k="trabajando" role="button"><i class="pul" style="background:#3B82F6"></i>Trabajando</span><span data-k="pausa" role="button"><i style="background:#4B5563"></i>En pausa</span><span class="s0" data-k="esperando" role="button">Sin punto: disponible</span>';document.body.appendChild(l);
 l.addEventListener('click',e=>{const k=e.target.closest('[data-k]')?.dataset.k;if(k)abrirListaEstado(k);});}
// ---------- lista de bots por estado (leyenda y centro de mando) ----------
const LTIT={te:'🟠 Te esperan',trabajando:'💻 Trabajando',pausa:'☕ En pausa',esperando:'Disponibles'};
window.__conteos=()=>{const c={te:0,trabajando:0,esperando:0,pausa:0};for(const o of bots.values())c[EK(o.data)]++;return c;};
function abrirListaEstado(k){let d=$('lestado');if(!d){d=document.createElement('div');d.id='lestado';d.className='glass';document.body.appendChild(d);
  d.addEventListener('click',e=>{if(e.target.closest('.lcerrar')){d.hidden=true;return;}const f=e.target.closest('.f[data-id]');if(f)abrirFicha(f.dataset.id);});}
 if(k==='te'&&!document.body.classList.contains('mando')){d.innerHTML=`<div class="lt"><b>🔐 Te esperan</b><button class="lcerrar" aria-label="Cerrar">✕</button></div><p class="s">Esta lista solo se ve con el Centro de mando desbloqueado. Vuelve a cargar la página y escribe la frase de acceso.</p><button class="mprim" onclick="location.reload()">Desbloquear</button>`;d.hidden=false;return;}
 const L=[...bots.values()].map(o=>o.data).filter(b=>EK(b)===k);
 const det=b=>{const m=MANDO?.bots?.find(x=>x.id===b.id);if(!m)return esc(b.frase||'');if(k==='te')return '⏳ '+esc((m.ok||[])[0]||m.pendiente||m.tarea||'');if(k==='trabajando')return esc(m.tarea||b.frase||'');return esc(m.pendiente?('Pendiente: '+m.pendiente):(m.tarea||b.frase||''));};
 d.innerHTML=`<div class="lt"><b>${LTIT[k]} · ${L.length}</b><button class="lcerrar" aria-label="Cerrar">✕ Cerrar</button></div>`+(L.length?L.map(b=>`<div class="f" data-id="${b.id}">${avHTML(b)}<span class="d e-${k}" style="margin:0"></span><div class="lx"><b>${esc(b.nombre)}</b><div class="s">${det(b)}</div></div><span class="lir">›</span></div>`).join(''):'<p class="s">No hay bots en este estado ahora.</p>')+'<p class="s" style="margin-top:6px">Toca un bot para ver su ficha.</p>';d.hidden=false;d.scrollTop=0;}
window.__abrirListaEstado=abrirListaEstado;$('pisos').style.display='none';$('bedif').style.display='none';
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
 const L=[['Recepción','rec'],['Ted','ted'],['Tinta Rosa','tr'],['Jurídico','jur'],['Finanzas','fin'],['Podcast','pod'],['Personal','per'],['Proyectos','pro'],['Café','com'],['Vista general','']];
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

import * as THREE from 'three';import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {makePersonita,PERSONITAS} from './personitas.js';
const q=new URLSearchParams(location.search),TODOS=q.get('p')==='todos',quien=TODOS?Object.keys(PERSONITAS):(q.get('p')||'ted').split(',');
const R=new THREE.WebGLRenderer({antialias:true});R.setPixelRatio(Math.min(devicePixelRatio,2));R.setSize(innerWidth,innerHeight);R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;R.toneMapping=THREE.ACESFilmicToneMapping;document.body.appendChild(R.domElement);
const S=new THREE.Scene();S.background=new THREE.Color(0xefe9e2);S.environment=new THREE.PMREMGenerator(R).fromScene(new RoomEnvironment(),.04).texture;S.environmentIntensity=.6;
const cam=new THREE.PerspectiveCamera(30,innerWidth/innerHeight,.1,100);
const sun=new THREE.DirectionalLight(0xfff1e0,2.2);sun.position.set(3,6,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.radius=6;Object.assign(sun.shadow.camera,{left:-5,right:5,top:5,bottom:-5});S.add(sun);
S.add(new THREE.HemisphereLight(0xffffff,0xd8c8b8,.8));
const fl=new THREE.Mesh(new THREE.CircleGeometry(12,64),new THREE.MeshStandardMaterial({color:0xe7ddd2,roughness:.95}));fl.rotation.x=-Math.PI/2;fl.receiveShadow=true;S.add(fl);
const ctl=new OrbitControls(cam,R.domElement);
const poses=TODOS?['Idle']:quien.length>1?['Idle','Sitting']:['Idle','Walking','Sitting','Cup','Wave'];const mixers=[];const L=document.getElementById('l');
const nombres={Idle:'De pie',Walking:'Caminando',Sitting:'Sentado tecleando',Cup:'Con café',Wave:'Saludando'};
let i=0;const N=quien.length*poses.length,gap=1.05;
for(const w of quien)for(const p of poses){const {scene,animations}=makePersonita(PERSONITAS[w]);scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 let x=(i-(N-1)/2)*gap;if(TODOS){const r=i<8?0:1,c=r?i-8:i;x=(c-(r?3:3.5))*.78+(r?.39:0);scene.position.z=r?-1.1:0;}scene.position.x=x;S.add(scene);const mx=new THREE.AnimationMixer(scene);mx.clipAction(THREE.AnimationClip.findByName(animations,p)).play();mx.update(i*.37);mixers.push(mx);
 if(p==='Sitting'){const wood=new THREE.MeshStandardMaterial({color:0x9b7653,roughness:.6}),dark=new THREE.MeshStandardMaterial({color:0x2f3134,roughness:.5});
  const chair=new THREE.Mesh(new THREE.BoxGeometry(.42,.06,.42),dark);chair.position.set(x,.43,-.02);const leg=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.4),dark);leg.position.set(x,.22,-.02);
  const desk=new THREE.Mesh(new THREE.BoxGeometry(.8,.04,.45),wood);desk.position.set(x,.68,.42);const dl=new THREE.Mesh(new THREE.BoxGeometry(.7,.66,.03),wood);dl.position.set(x,.34,.62);
  const lap=new THREE.Mesh(new THREE.BoxGeometry(.3,.015,.2),new THREE.MeshStandardMaterial({color:0xb8bcc2,metalness:.6,roughness:.3}));lap.position.set(x,.71,.36);
  const scr=new THREE.Mesh(new THREE.BoxGeometry(.3,.2,.01),lap.material);scr.position.set(x,.81,.47);scr.rotation.x=-.25;
  for(const m of[chair,leg,desk,dl,lap,scr]){m.castShadow=m.receiveShadow=true;S.add(m);}}
 if(p==='Cup'){const h=scene.getObjectByName('Palm2R');const c=new THREE.Mesh(new THREE.CylinderGeometry(.045,.038,.11,16),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.4}));c.position.set(0,-.02,.05);c.castShadow=true;h.add(c);}
 const d=document.createElement('span');d.textContent=(quien.length>1?w[0].toUpperCase()+w.slice(1)+' · ':'')+nombres[p];L.appendChild(d);d.style.display='none';i++;}
const span=N*gap;if(TODOS){cam.position.set(0,3.0,8);ctl.target.set(0,.4,-.55);}else{cam.position.set(span*.45,1.9,span*.75+1.6);ctl.target.set(0,.62,0);}cam.fov=26;cam.updateProjectionMatrix();ctl.update();
const clk=new THREE.Clock();R.setAnimationLoop(()=>{const dt=clk.getDelta();mixers.forEach(m=>m.update(dt));ctl.update();R.render(S,cam);});
addEventListener('resize',()=>{cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();R.setSize(innerWidth,innerHeight)});

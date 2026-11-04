// Personitas chibi procedurales (hechas a mano en código). Esqueleto = jerarquía de Object3D con nombres,
// animaciones = AnimationClips reales (sirven con THREE.AnimationMixer igual que el robot).
import * as THREE from 'three';
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const mat=(c,o={})=>new THREE.MeshPhysicalMaterial({color:c,roughness:o.r??.62,metalness:0,sheen:o.sheen??0,sheenRoughness:.8,sheenColor:new THREE.Color(o.sc??0xffffff),clearcoat:o.cc??0,clearcoatRoughness:.4,transparent:o.op!=null,opacity:o.op??1});
function mesh(geo,m,p,s,parent){const x=new THREE.Mesh(geo,m);if(p)x.position.copy(p);if(s)x.scale.copy(s);x.castShadow=true;x.receiveShadow=true;parent.add(x);return x;}
const cap=(r,l)=>new THREE.CapsuleGeometry(r,l,6,14);
const sph=(r,w=24,h=18)=>new THREE.SphereGeometry(r,w,h);
// medidas (m)
const HIP=.46,TH=.2,SH=.2,UA=.12,FA=.105,TOR=.34,HR=.215;
const F=0xf4f2ee;
export const PERSONITAS={
 ted:{piel:0xf0c7a8,pelo:0x3b2416,peinado:'rizos',barba:'sombra',top:0x2f2621,topSheen:0x6b5a50,pantalon:0x86a3c6,zapato:F,suela:0xb9bcc2},
 tadeo:{piel:0xefc09c,pelo:0x1e1612,peinado:'rizos',nRizos:70,rizoR:.05,barba:'sombra',ropa:'playera',top:0x22305a,topSheen:0x5a6a9a,pantalon:0x8e9096,zapato:F,suela:0xb9bcc2},
 mateo:{piel:0xd7a07c,pelo:0x221d1b,canas:0x8b8580,peinado:'corto',barba:'sal',top:0x3a3c42,topSheen:0x8a8d96,ropa:'saco',camisa:0xf5f3ef,pin:0xec6fa2,pantalon:0x2a2c31,zapato:0x4b2e20,suela:0x2a1a12,lentes:0x5e3a22,reloj:true},
 julian:{piel:0xd9a685,pelo:0x1b1512,peinado:'rizos',nRizos:80,rizoR:.055,barba:'llena',barbaC:0x2e2724,ropa:'saco',top:0x1c1c20,topSheen:0x55565c,camisa:0xf5f3ef,pantalon:0x232327,zapato:0x2a1a12,suela:0x1a120c},
 ines:{mujer:true,piel:0xf3cdb0,pelo:0x4a2e20,peinado:'largo',flequillo:true,lentes:0xd9d2ca,ropa:'sueter',top:0xeee2cf,topSheen:0xffffff,pantalon:0x8aa3c0,zapato:F,suela:0xc9c2b8,collar:0xd8b25a},
 vale:{mujer:true,piel:0xf2c4a6,pelo:0xb8432a,peinado:'largo',ropa:'playera',top:0x2f8a8c,topSheen:0xf0a060,estampado:0xe8763a,pantalon:0x26262b,zapato:0x2a2a2e,suela:0xeeeeee,collar:0xd8b25a,aretes:0xd8b25a},
 rulo:{piel:0xe8b593,pelo:0x8a6a52,peinado:'calvo',barba:'llena',barbaC:0x8f7462,lentes:0x2a2420,ropa:'playera',top:0xe0a82e,topSheen:0xffe0a0,sobre:0x8a2b2b,estampado:0x3a3a3a,audifonos:true,pantalon:0x3b4f6b,zapato:0x5a3a24,suela:0x2a1a12},
 emiliano:{piel:0xe2ad88,pelo:0x1a1411,peinado:'corto',barba:'sombra',ropa:'tirantes',top:0x5a5d63,topSheen:0x9a9da3,pantalon:0x1f1f23,zapato:0x2b2b30,suela:0xdddddd},
 luna:{mujer:true,piel:0xe4b597,pelo:0x120e0e,peinado:'largoRizo',ropa:'tirantes',top:0x18181b,topSheen:0x55555a,pantalon:0x56708f,zapato:F,suela:0xc9c2b8,collar:0xc9c9c9,aretes:0xc9c9c9},
 libro:{piel:0xe2b190,pelo:0x1e1814,canas:0x8a857f,peinado:'rizos',nRizos:60,rizoR:.05,lentes:0xa8a8a8,ropa:'cardigan',top:0x141414,topSheen:0x555555,camisa:0xefe6d2,pantalon:0x2a3446,zapato:0x1a1a1a,suela:0x111111,barba:'llena',barbaC:0x2a221c},
 apps:{piel:0xe0ad88,pelo:0x5a3a24,peinado:'rizos',nRizos:55,rizoR:.05,lentes:0xb0a890,ropa:'playera',top:0x465A4D,topSheen:0x8a9a8d,pantalon:0x182538,zapato:0x303239,suela:0x92908D},
 ceo:{piel:0xf0c9aa,pelo:0x9a7552,peinado:'corto',lentes:0x5e3a22,ropa:'saco',top:0x1e2a44,topSheen:0x5a6a8a,camisa:0x6f8fb0,pantalon:0x5e6268,zapato:0x3a2a1e,suela:0x1a1410},
 director:{piel:0xdcab86,pelo:0x1e1814,peinado:'rizos',nRizos:55,rizoR:.05,lentes:0x4a4a4e,ropa:'cuelloAlto',top:0x1c2233,topSheen:0x4a5470,pantalon:0x3a3c42,zapato:0x161616,suela:0x0e0e0e,barba:'llena',barbaC:0x1e1814,reloj:true},
 'tr-editor':{piel:0xd9a682,pelo:0x0e0c0b,peinado:'corto',ropa:'saco',top:0x2b2b2e,topSheen:0x66666c,camisa:0x5a1e2a,pantalon:0x1a1a1c,zapato:0x0e0e0e,suela:0x0a0a0a},
 'tr-cm':{piel:0xc99572,pelo:0x0e0c0b,peinado:'gorro',gorro:0x111111,ropa:'playera',top:0x2f3a30,topSheen:0x6a7a6c,pantalon:0x5b6f8a,zapato:0xece4d4,suela:0xece4d4,barba:'sombra'},
 luca:{piel:0xd9a07a,pelo:0x15100d,peinado:'rizos',nRizos:65,rizoR:.055,barba:'llena',barbaC:0x1a1410,ropa:'hoodie',top:0x2a2a30,topSheen:0x6a5a9a,pantalon:0x2a3446,zapato:0x161616,suela:0xe0e0e0}};
export function makePersonita(cfg){
 const root=new THREE.Group();root.name='Personita';const ropa=cfg.ropa||'sueter';
 const M={piel:mat(cfg.piel,{r:.55,sheen:.4,sc:0xffe0d0}),pelo:mat(cfg.pelo,{r:.7,sheen:.6,sc:0x9a8070}),top:mat(cfg.top,{r:.9,sheen:1,sc:cfg.topSheen}),
  pant:mat(cfg.pantalon,{r:.85,sheen:.5,sc:0xdde6f0}),zap:mat(cfg.zapato,{r:.45,cc:.4}),suela:mat(cfg.suela,{r:.6}),ojo:mat(0x1a120e,{r:.15,cc:1}),
  brillo:new THREE.MeshBasicMaterial({color:0xffffff}),cachete:mat(0xf19a9a,{r:.8,op:.45}),boca:mat(cfg.mujer?0xb4505a:0x7a3b33,{r:.5})};
 const sobre=cfg.sobre?mat(cfg.sobre,{r:.9,sheen:.6}):null;
 const hips=new THREE.Object3D();hips.name='Hips';hips.position.y=HIP;root.add(hips);
 const spine=new THREE.Object3D();spine.name='Spine';hips.add(spine);
 // torso
 mesh(cap(.135,.12),M.top,V(0,.17,0),V(1.12,1,.86),spine);
 mesh(sph(.13),M.pant,V(0,.02,0),V(1.1,.6,.85),spine);
 const cam=cfg.camisa?mat(cfg.camisa,{r:.7,sheen:.3}):null;
 if(ropa==='saco'||ropa==='cardigan'){const v=mesh(new THREE.CircleGeometry(.045,3),cam,V(0,.275,.119),V(1,1.6,1),spine);v.rotation.z=-Math.PI/2;
  if(ropa==='cardigan')mesh(new THREE.BoxGeometry(.03,.2,.01),cam,V(0,.13,.118),null,spine);
  if(cfg.pin)mesh(sph(.013),mat(cfg.pin,{r:.4,cc:.6}),V(.07,.24,.112),V(1,1,.6),spine);}
 else if(ropa==='cuelloAlto')mesh(new THREE.CylinderGeometry(.06,.07,.06,18),M.top,V(0,.31,0),null,spine);
 else if(ropa==='hoodie'){mesh(new THREE.TorusGeometry(.08,.035,10,22),M.top,V(0,.3,-.03),V(1,1,.9),spine).rotation.x=Math.PI/2-.3;
  const cd=mat(0xffffff,{r:.6});for(const s of[-1,1])mesh(cap(.006,.06),cd,V(s*.03,.23,.118),null,spine);
  mesh(new THREE.BoxGeometry(.16,.06,.01),M.top,V(0,.1,.118),null,spine);}
 else if(ropa==='tirantes'){mesh(new THREE.CircleGeometry(.05,20),M.piel,V(0,.27,.112),V(1,.8,1),spine);}
 else mesh(new THREE.TorusGeometry(.07,.018,8,20),M.top,V(0,.305,0),V(1,1,.8),spine).rotation.x=Math.PI/2;
 if(cfg.estampado)mesh(new THREE.BoxGeometry(.09,.06,.01),mat(cfg.estampado,{r:.7}),V(0,.18,.122),null,spine);
 if(sobre)for(const s of[-1,1])mesh(new THREE.BoxGeometry(.05,.24,.02),sobre,V(s*.115,.17,.1),null,spine).rotation.y=s*.5;
 if(cfg.collar)mesh(new THREE.TorusGeometry(.06,.004,6,24),mat(cfg.collar,{r:.3,cc:1}),V(0,.27,.05),V(1,1.25,1),spine).rotation.x=Math.PI/2-.6;
 if(cfg.audifonos){const am=mat(0x1b1b1e,{r:.4,cc:.5});mesh(new THREE.TorusGeometry(.085,.014,8,24),am,V(0,.3,.01),null,spine).rotation.x=Math.PI/2-.2;
  for(const s of[-1,1])mesh(new THREE.CylinderGeometry(.035,.035,.025,16),am,V(s*.08,.29,.05),null,spine).rotation.z=Math.PI/2;}
 const neck=new THREE.Object3D();neck.name='Neck';neck.position.y=TOR;spine.add(neck);
 mesh(cap(.045,.03),M.piel,V(0,.0,0),null,neck);
 const head=new THREE.Object3D();head.name='Head';head.position.y=.03;neck.add(head);
 const hc=V(0,HR*.95,0);
 mesh(sph(HR,32,24),M.piel,hc,V(1,.96,.94),head);
 for(const s of[-1,1])mesh(sph(.045),M.piel,V(s*HR*.98,hc.y-.01,-.01),V(.55,1,.8),head);
 if(cfg.aretes){const am=mat(cfg.aretes,{r:.25,cc:1});for(const s of[-1,1])mesh(sph(.016,12,8),am,V(s*HR*1.0,hc.y-.06,0),null,head);}
 // cara
 const fz=HR*.9;
 for(const s of[-1,1]){mesh(sph(.03,16,12),M.ojo,V(s*.072,hc.y-.005,fz-.012),V(1,1.15,.6),head);mesh(sph(.009,8,6),M.brillo,V(s*.072+.01,hc.y+.012,fz+.006),null,head);
  if(cfg.mujer){const l=mesh(new THREE.CapsuleGeometry(.005,.018,4,6),M.ojo,V(s*.1,hc.y+.022,fz-.022),null,head);l.rotation.z=s*-.9;}
  mesh(new THREE.CircleGeometry(.03,16),M.cachete,V(s*.11,hc.y-.055,fz-.045),null,head).rotation.y=s*.5;
  const ce=mesh(new THREE.CapsuleGeometry(.007,.035,4,8),mat(cfg.cejas??(cfg.peinado==='calvo'?cfg.barbaC??0x5a4030:cfg.pelo),{r:.8}),V(s*.072,hc.y+.05,fz-.005),null,head);ce.rotation.z=Math.PI/2+s*.12;}
 mesh(sph(.016,12,10),M.piel,V(0,hc.y-.035,fz+.004),null,head);
 const smile=mesh(new THREE.TorusGeometry(.028,cfg.mujer?.008:.006,6,16,Math.PI),M.boca,V(0,hc.y-.072,fz-.022),null,head);smile.rotation.z=Math.PI;
 // barba
 const bshell=(c,o,y0=.56,y1=.86,w=1.7)=>{const g=new THREE.SphereGeometry(HR*1.015,32,12,Math.PI/2-w/2,w,Math.PI*y0,Math.PI*(y1-y0));return mesh(g,mat(c,o),hc,V(1,.96,.95),head);};
 const bigote=c=>{const bi=mesh(new THREE.CapsuleGeometry(.011,.06,4,8),mat(c,{r:.9}),V(0,hc.y-.05,fz+.006),null,head);bi.rotation.z=Math.PI/2;};
 if(cfg.barba==='sal'){bshell(0x6e6662,{r:.95,sheen:.8,sc:0xd0cac4},.665,.9);bigote(0x4a4542);smile.position.z+=.006;smile.material=mat(0xf2e8e0,{r:.5});}
 else if(cfg.barba==='llena'){bshell(cfg.barbaC,{r:.95,sheen:.8,sc:0xffffff},.64,.93,2.1);bigote(cfg.barbaC);smile.position.z+=.008;smile.material=mat(0xf2e8e0,{r:.5});}
 else if(cfg.barba==='bigote')bigote(cfg.barbaC);
 else if(cfg.barba==='sombra')bshell(0x7a5a48,{r:.9,op:.3},.6,.86);
 // pelo
 let seed=0;for(const ch of JSON.stringify(cfg))seed=(seed*31+ch.charCodeAt(0))%2147483646;seed=seed||7;
 const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
 const P=cfg.peinado||'corto';
 const casco=(t=.5,r=1.05,tilt=-.32,m=M.pelo)=>{const c=mesh(new THREE.SphereGeometry(HR*r,32,20,0,Math.PI*2,0,Math.PI*t),m,hc.clone().add(V(0,0,-.015)),null,head);c.rotation.x=tilt;return c;};
 const atras=(t0,t1,r=1.07,w=Math.PI*2-1.9)=>mesh(new THREE.SphereGeometry(HR*r,32,16,Math.PI/2+(Math.PI*2-w)/2,w,Math.PI*t0,Math.PI*(t1-t0)),M.pelo,hc,null,head);
 const fleco=()=>{const g=new THREE.SphereGeometry(HR*1.07,28,8,Math.PI/2-1.0,2.0,Math.PI*.12,Math.PI*.2);mesh(g,M.pelo,hc,null,head);};
 if(P==='rizos'){const n=cfg.nRizos??120,rr=cfg.rizoR??.062,g=sph(rr,10,8);for(let i=0;i<n;i++){const u=rnd()*2-1,th=rnd()*Math.PI*2,r=Math.sqrt(1-u*u);const d=V(r*Math.cos(th),u,r*Math.sin(th));
   if(d.y<-.05)continue;if(d.z>.45&&d.y<.42)continue;if(d.y<.15&&Math.abs(d.x)>.85&&d.z>-.2)continue;mesh(g,M.pelo,hc.clone().add(d.multiplyScalar(HR*(n<100?1.0:1.04))),V(1,1,1).multiplyScalar(.8+rnd()*.5),head);}
  mesh(sph(HR*1.02),M.pelo,hc.clone().add(V(0,.03,-.02)),V(1,.92,.95),head);}
 else if(P==='corto'){casco();
  const ond=sph(.07,14,10);[[-.09,.19,.1],[.0,.21,.12],[.09,.19,.1],[-.05,.22,0],[.06,.22,0]].forEach(([x,y,z])=>mesh(ond,M.pelo,hc.clone().add(V(x,y,z)),V(1.15,.5,1),head));
  const cg=cfg.canas?mat(cfg.canas,{r:.85,sheen:.5}):M.pelo;for(const s of[-1,1]){mesh(sph(.06,14,10),cg,hc.clone().add(V(s*.2,.0,-.02)),V(.3,.95,1.1),head);mesh(sph(.05,12,8),M.pelo,hc.clone().add(V(s*.18,.1,-.02)),V(.5,.8,1.1),head);}}
 else if(P==='calvo'){const sh=mat(cfg.pelo,{r:.9,op:.35});mesh(new THREE.SphereGeometry(HR*1.01,32,10,Math.PI/2+.9,Math.PI*2-1.8,Math.PI*.38,Math.PI*.2),sh,hc,V(1,.96,.94),head);
  const br=mesh(sph(.035,8,6),M.brillo,hc.clone().add(V(.04,.19,.08)),V(1,.4,1),head);br.material=new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.25});}
 else if(P==='largo'||P==='largoRizo'){casco(.5,1.06,-.25);atras(.2,.72);
  mesh(cap(.16,.1),M.pelo,hc.clone().add(V(0,-.2,-.07)),V(1.35,1,.55),head);
  for(const s of[-1,1])mesh(cap(.05,.17),M.pelo,hc.clone().add(V(s*.2,-.1,.02)),V(1,1,1),head);
  if(P==='largoRizo'){const g=sph(.06,10,8);for(let i=0;i<90;i++){const a=Math.PI*.5+ (rnd()*2-1)*2.3,y=rnd()*.42-.3;const r=HR*(1.08+.08*rnd());
    mesh(g,M.pelo,hc.clone().add(V(Math.cos(a)*r*1.15,y,-Math.abs(Math.sin(a))*r*.6-.02+(Math.abs(Math.cos(a))>.8?.03:0))),V(1,1,1).multiplyScalar(.8+rnd()*.6),head);}
   for(let i=0;i<35;i++){const u=rnd()*.7+.3,th=rnd()*Math.PI*2,r=Math.sqrt(1-u*u);const d=V(r*Math.cos(th),u,r*Math.sin(th));if(d.z>.5&&d.y<.5)continue;mesh(g,M.pelo,hc.clone().add(d.multiplyScalar(HR*1.06)),null,head);}}
  else fleco();if(cfg.flequillo)fleco();}
 else if(P==='bob'){casco(.5,1.07,-.2);atras(.25,.68,1.1,Math.PI*2-1.5);for(const s of[-1,1])mesh(cap(.06,.08),M.pelo,hc.clone().add(V(s*.2,-.06,.05)),null,head);
  if(cfg.flequillo)fleco();else{const p=mesh(sph(.08,14,10),M.pelo,hc.clone().add(V(-.08,.17,.11)),V(1.4,.45,.8),head);p.rotation.z=.3;}}
 else if(P==='chongo'){casco(.52,1.05,-.25);mesh(sph(.085,18,14),M.pelo,hc.clone().add(V(0,.22,-.1)),null,head);
  mesh(new THREE.TorusGeometry(.075,.012,6,20),mat(0xd8b25a,{r:.4,cc:.6}),hc.clone().add(V(0,.17,-.07)),null,head).rotation.x=Math.PI/2-.6;
  const p=mesh(sph(.08,14,10),M.pelo,hc.clone().add(V(.07,.17,.11)),V(1.4,.45,.8),head);p.rotation.z=-.3;}
 else if(P==='cola'){casco(.52,1.05,-.25);mesh(sph(.06,14,10),M.pelo,hc.clone().add(V(0,.13,-.2)),null,head);
  const c=mesh(cap(.055,.2),M.pelo,hc.clone().add(V(0,-.02,-.26)),null,head);c.rotation.x=.35;
  const p=mesh(sph(.08,14,10),M.pelo,hc.clone().add(V(-.07,.17,.11)),V(1.4,.45,.8),head);p.rotation.z=.3;}
 else if(P==='gorro'){const gm=mat(cfg.gorro,{r:.95,sheen:1,sc:0xffffff});casco(.36,1.04,-.2);casco(.42,1.1,-.25,gm);
  mesh(new THREE.TorusGeometry(HR*.98,.03,10,32),gm,hc.clone().add(V(0,.06,-.03)),null,head).rotation.x=Math.PI/2-.25;
  mesh(sph(.045,12,10),mat(0xf4f2ee,{r:1,sheen:1}),hc.clone().add(V(0,.25,-.05)),null,head);}
 if(cfg.lentes){const lm=mat(cfg.lentes,{r:.35,cc:.8});const lg=mat(0xffffff,{r:.05,op:.18});
  for(const s of[-1,1]){mesh(new THREE.TorusGeometry(.045,.008,8,24),lm,V(s*.072,hc.y-.004,fz+.02),null,head);mesh(new THREE.CircleGeometry(.044,20),lg,V(s*.072,hc.y-.004,fz+.019),null,head);
   const p=mesh(new THREE.BoxGeometry(.008,.008,.17),lm,V(s*.118,hc.y+.008,fz-.065),null,head);p.rotation.y=s*.12;}
  mesh(new THREE.CapsuleGeometry(.005,.025,4,6),lm,V(0,hc.y+.006,fz+.024),null,head).rotation.z=Math.PI/2;}
 // brazos
 const brazoM=ropa==='tirantes'?M.piel:(sobre||M.top);const anteM=(ropa==='tirantes'||ropa==='playera')&&!sobre?M.piel:brazoM;
 for(const [s,n] of[[-1,'R'],[1,'L']]){const sh=new THREE.Object3D();sh.name='Arm'+n;sh.position.set(s*.165,.27,0);spine.add(sh);
  if(ropa==='playera'&&!sobre){mesh(cap(.047,UA-.03),M.piel,V(0,-UA/2,0),null,sh);mesh(cap(.056,.02),M.top,V(0,-.025,0),null,sh);}
  else mesh(cap(ropa==='tirantes'?.047:.052,UA-.03),brazoM,V(0,-UA/2,0),null,sh);
  const el=new THREE.Object3D();el.name='Fore'+n;el.position.y=-UA;sh.add(el);mesh(cap(anteM===M.piel?.042:.047,FA-.04),anteM,V(0,-FA/2,0),null,el);
  if(cam&&ropa==='saco')mesh(new THREE.CylinderGeometry(.044,.044,.02,14),cam,V(0,-FA+.005,0),null,el);
  const hand=new THREE.Object3D();hand.name=n==='R'?'Palm2R':'PalmL';hand.position.y=-FA-.025;el.add(hand);mesh(sph(.045),M.piel,V(0,0,0),V(.9,1,.8),hand);
  if(n==='R'){const th=mesh(cap(.014,.018),M.piel,V(.0,.028,.03),null,hand);th.name='Thumb';}
  if(cfg.reloj&&n==='L')mesh(new THREE.TorusGeometry(.044,.011,6,16),mat(0x5a3a24,{r:.5}),V(0,-FA+.025,0),null,el).rotation.x=Math.PI/2;}
 // piernas y zapatos
 for(const [s,n] of[[-1,'R'],[1,'L']]){const th=new THREE.Object3D();th.name='Leg'+n;th.position.set(s*.075,0,0);hips.add(th);mesh(cap(.068,TH-.06),M.pant,V(0,-TH/2,0),null,th);
  const kn=new THREE.Object3D();kn.name='Knee'+n;kn.position.y=-TH;th.add(kn);mesh(cap(.06,SH-.08),M.pant,V(0,-SH/2+.01,0),null,kn);
  mesh(new THREE.CylinderGeometry(.062,.058,.03,16),M.pant,V(0,-SH+.03,0),null,kn);
  const ft=new THREE.Object3D();ft.name='Foot'+n;ft.position.y=-SH-.005;kn.add(ft);
  mesh(sph(.06,20,14),M.zap,V(0,-.005,.0),V(1,.95,1.05),ft);
  mesh(sph(.06,20,14),M.zap,V(0,-.018,.07),V(1.02,.72,1.25),ft);
  mesh(new THREE.CylinderGeometry(.062,.062,.022,24),M.suela,V(0,-.047,.04),V(1,1,1.85),ft);
  const lz=mat(cfg.suela,{r:.6});for(let k=0;k<3;k++){const b=mesh(new THREE.CapsuleGeometry(.005,.04,4,6),lz,V(0,.022-k*.016,.045+k*.018),null,ft);b.rotation.z=Math.PI/2;}}
 root.traverse(o=>{if(o.isMesh)o.frustumCulled=false;});
 return {scene:root,animations:clips()};}
// ---------- animaciones (keyframes muestreados) ----------
const Q=new THREE.Quaternion(),E=new THREE.Euler();
function clip(name,dur,fn,fps=30){const T={};const n=Math.round(dur*fps);
 for(let i=0;i<=n;i++){const t=i/fps,P=fn(t,t/dur*Math.PI*2);for(const k in P){(T[k]??=({t:[],v:[]}));T[k].t.push(t);
   if(k.endsWith('.position'))T[k].v.push(...P[k]);else{Q.setFromEuler(E.set(...P[k]));T[k].v.push(Q.x,Q.y,Q.z,Q.w);}}}
 return new THREE.AnimationClip(name,dur,Object.entries(T).map(([k,d])=>k.endsWith('.position')?new THREE.VectorKeyframeTrack(k,d.t,d.v):new THREE.QuaternionKeyframeTrack(k+'.quaternion',d.t,d.v)));}
const base=(o={})=>Object.assign({'Hips.position':[0,HIP,0],Hips:[0,0,0],Spine:[0,0,0],Neck:[0,0,0],Head:[0,0,0],ArmR:[0,0,-(.12)],ArmL:[0,0,-(-.12)],ForeR:[-.15,0,0],ForeL:[-.15,0,0],Palm2R:[0,0,0],PalmL:[0,0,0],LegR:[0,0,0],LegL:[0,0,0],KneeR:[0,0,0],KneeL:[0,0,0],FootR:[0,0,0],FootL:[0,0,0]},o);
function clips(){const S=Math.sin,C=Math.cos;return[
 clip('Idle',3,(t,w)=>base({'Hips.position':[0,HIP-.004*(1+C(w)),0],Spine:[.02*S(w),0,0],Head:[.03*S(w+1),.12*S(w/1),.04*S(w*.5)],ArmR:[.03*S(w),0,-(.12+.02*S(w))],ArmL:[.03*S(w),0,-(-.12-.02*S(w))]})),
 clip('Walking',.9,(t,w)=>base({'Hips.position':[0,HIP+.022*Math.abs(S(w))-.01,0],Hips:[0,.1*S(w),0],Spine:[.08,-.12*S(w),.03*S(w)],Head:[-.05,.08*S(w),0],
  LegR:[.65*S(w),0,0],LegL:[-.65*S(w),0,0],KneeR:[Math.max(0,.9*S(w-1.6)),0,0],KneeL:[Math.max(0,.9*S(w+Math.PI-1.6)),0,0],
  ArmR:[-.6*S(w),0,-(.15)],ArmL:[.6*S(w),0,-(-.15)],ForeR:[-.35+.15*S(w),0,0],ForeL:[-.35-.15*S(w),0,0]})),
 // sentado tecleando (la cadera queda a la altura del asiento ~.5)
 clip('Sitting',1.2,(t,w)=>base({'Hips.position':[0,.5,0],Spine:[.12+.01*S(w),0,0],Head:[.18+.03*S(w*.5),.05*S(w*.25),0],
  LegR:[-1.5,0,.06],LegL:[-1.5,0,-.06],KneeR:[1.45,0,0],KneeL:[1.45,0,0],FootR:[.05,0,0],FootL:[.05,0,0],
  ArmR:[-.75,0,-(.08)],ArmL:[-.75,0,-(-.08)],ForeR:[-.85+.12*Math.max(0,S(w*3)),0,0],ForeL:[-.85+.12*Math.max(0,S(w*3+2)),0,0],Palm2R:[.5,0,0],PalmL:[.5,0,0]})),
 // con taza (brazo derecho al pecho, sorbos)
 clip('Cup',4,(t,w)=>{const sip=Math.max(0,S(w))**4;return base({'Hips.position':[0,HIP-.004*(1+C(w*2)),0],Head:[-.15*sip,.1*S(w*.5),0],ArmR:[-.5-.7*sip,0,-(.1)],ForeR:[-1.5-.4*sip,0,0],Palm2R:[1.2,0,0],ArmL:[.03*S(w),0,-(-.12)]})}),
 clip('Wave',1.6,(t,w)=>base({ArmR:[0,0,-(2.5)],ForeR:[0,0,.45*S(w*2)],Head:[0,0,-.1],Spine:[0,0,-.05]})),
 clip('Yes',1.2,(t,w)=>base({Head:[.25*Math.max(0,S(w*2)),0,0],Spine:[.04*S(w*2),0,0]})),
 clip('ThumbsUp',1.4,(t,w)=>base({ArmR:[-1.2,0,-(.1)],ForeR:[-1.2,0,0],Palm2R:[0,0,-1.4],Head:[0,0,.08],Spine:[0,-.1,0]}))];}

// SW v16.13: navegación e index/sw sin caché (red primero, no-store); estado.json, mando.enc y tareas.enc (v16.18) NUNCA en caché.
const C='oficina-v17b-3';
self.addEventListener('install',e=>self.skipWaiting()); // se activa solo: así las versiones viejas (v16.10 y antes) llegan sin pasos extra
self.addEventListener('message',e=>{if(e.data==='SKIP_WAITING'||e.data?.type==='SKIP_WAITING')self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 if(/(estado\.json|mando\.enc|tareas\.enc|sw\.js)$/.test(u.pathname)){e.respondWith(fetch(e.request,{cache:'no-store'}));return;}
 if(e.request.mode==='navigate'||/(\/|index\.html|manifest\.webmanifest)$/.test(u.pathname)){
  e.respondWith(fetch(e.request.url,{cache:'no-store'}).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));}return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./'))));return;}
 e.respondWith(fetch(e.request).then(r=>{if(r.ok&&!/\.(glb|hdr|ktx2)$/.test(u.pathname)){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));}return r;}).catch(()=>caches.match(e.request)));});
// v16.13: avisos locales (sin servidor). Al tocar el aviso abre/enfoca la oficina.
self.addEventListener('notificationclick',e=>{e.notification.close();const u=e.notification.data?.url||self.registration.scope;
 e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l)if(c.url.startsWith(self.registration.scope))return c.focus();return clients.openWindow(u);}));});

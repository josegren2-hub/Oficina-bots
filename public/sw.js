// SW mínimo: red primero para todo; estado.json y mando.enc NUNCA se guardan en caché.
const C='oficina-v16-9';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==location.origin)return;
 if(/(estado\.json|mando\.enc)$/.test(u.pathname)){e.respondWith(fetch(e.request,{cache:'no-store'}));return;}
 e.respondWith(fetch(e.request).then(r=>{if(r.ok&&!/\.(glb|hdr|ktx2)$/.test(u.pathname)){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c));}return r;}).catch(()=>caches.match(e.request)));});

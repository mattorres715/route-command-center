// Route Command Center offline helper. Bump VERSION when you upload a new index.html.
const VERSION='rcc-v3';
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png',
 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSION).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSION).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// The app's Refresh button asks a waiting update to take over right away.
self.addEventListener('message',e=>{if(e.data==='skipWaiting')self.skipWaiting()});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  // OpenStreetMap business lookups (Overpass) are never cached or answered from storage: network only.
  if(/(^|\.)overpass-api\.de$|overpass\.kumi\.systems$/.test(u.hostname))return;
  // App page: try the internet first so updates show up, fall back to the saved copy offline.
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(x=>{const c=x.clone();caches.open(VERSION).then(k=>k.put('index.html',c));return x}).catch(()=>caches.match('index.html')));return}
  // App files and Leaflet: saved copy first.
  if(u.origin===location.origin||u.hostname==='cdnjs.cloudflare.com'){e.respondWith(caches.match(r).then(m=>m||fetch(r)));return}
  // Everything else (map tiles, OSRM drive times, address lookups) always goes to the internet, never faked.
});

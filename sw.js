/* Lisboa y Oporto: guarda la app en el móvil para usarla sin internet */
const V = "lyo-v3"; /* prefijo propio: solo se borran las copias viejas de ESTA app */
const FILES = ["./", "index.html", "manifest.json", "icono.png", "icono-192.png", "favicon-32.png", "apple-touch-icon.png",
  "fotos/lisboa.jpg", "fotos/nazare.jpg", "fotos/fatima.jpg", "fotos/oporto.jpg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && (k.startsWith("lyo-") || k.startsWith("lisboa-oporto-"))).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const font = /fonts\.(googleapis|gstatic)\.com|unpkg\.com\/leaflet/.test(r.url);
  if (new URL(r.url).origin !== location.origin && !font) return;
  /* página: primero la red (para recibir cambios), si no hay conexión, la copia guardada */
  if (r.mode === "navigate") { e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; }).catch(() => caches.open(V).then(x => x.match(r).then(m => m || x.match("index.html"))))); return; }
  /* fotos, iconos y letras: primero la copia guardada */
  e.respondWith(caches.open(V).then(x => x.match(r)).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })));
});

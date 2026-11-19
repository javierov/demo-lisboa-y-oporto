/* Lisboa y Oporto: guarda la app en el móvil para usarla sin internet */
const V = "lyo-v4", T = "lyo-mapa"; /* solo borra sus propias copias: en github.io todas las apps comparten el mismo sitio */
const FILES = ["./", "index.html", "manifest.json", "icono.png", "icono-192.png", "favicon-32.png", "apple-touch-icon.png",
  "fotos/lisboa.jpg", "fotos/nazare.jpg", "fotos/fatima.jpg", "fotos/oporto.jpg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => Promise.allSettled(FILES.map(f => fetch(new Request(f, { cache: "reload" })).then(r => { if (r.ok) return c.put(f, r); })))).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => (k.startsWith("lyo-") || k.startsWith("lisboa-oporto-")) && k !== V && k !== T).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  /* calles del mapa: se guardan al verlas, para que sirvan después sin señal */
  if (/tile\.openstreetmap\.org/.test(r.url)) { e.respondWith(caches.open(T).then(c => c.match(r.url).then(m => m || fetch(r).then(res => { if (res.ok) c.put(r.url, res.clone()); return res; }).catch(() => new Response("", { status: 504 }))))); return; }
  const font = /fonts\.(googleapis|gstatic)\.com|unpkg\.com\/leaflet/.test(r.url);
  if (new URL(r.url).origin !== location.origin && !font) return;
  /* página: primero la red (para recibir cambios), si no hay conexión, la copia guardada */
  if (r.mode === "navigate") { e.respondWith(fetch(r.url, { cache: "no-cache" }).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; }).catch(() => caches.open(V).then(x => x.match(r).then(m => m || x.match("index.html"))))); return; }
  /* fotos, iconos, letras y el programa del mapa: primero la copia guardada */
  e.respondWith(caches.open(V).then(x => x.match(r)).then(m => m || fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })));
});

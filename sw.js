// Stark werden – Service Worker
// Holt die App bei jedem Öffnen frisch aus dem Netz (am HTTP-Zwischenspeicher vorbei)
// und nutzt die gespeicherte Kopie nur, wenn kein Netz da ist (z. B. im Studio-Keller).
const CACHE = "stark-werden-v3";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  const own = url.origin === location.origin;
  const sdk = ["www.gstatic.com", "fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname);
  if (!own && !sdk) return;
  e.respondWith(
    fetch(req, own ? { cache: "no-store" } : {})
      .then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});

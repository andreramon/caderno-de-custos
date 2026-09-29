// Guarda o app no celular para abrir sem internet.
// Ao publicar uma versão nova, troque o número abaixo (v1 -> v2).
const CACHE = 'caderno-custos-v12';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const guardar = url.origin === location.origin
    || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'
    || (url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('/firebase@'))
    || (url.hostname === 'cdnjs.cloudflare.com' && url.pathname.includes('/jspdf/'));
  if (!guardar) return; // Firestore e login passam direto
  e.respondWith(caches.open(CACHE).then(async c => {
    const salvo = await c.match(req, { ignoreSearch: url.origin === location.origin });
    const rede = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => salvo);
    return salvo || rede;
  }));
});

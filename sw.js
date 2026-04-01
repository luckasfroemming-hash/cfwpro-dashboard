const CACHE = 'cfwpro-v1';
const ASSETS = [
  '/cfwpro-dashboard/',
  '/cfwpro-dashboard/index.html',
  '/cfwpro-dashboard/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Only cache GET requests for our own origin
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Don't cache Google APIs
  if (url.hostname.includes('googleapis') || url.hostname.includes('google.com')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      });
      return cached || network;
    })
  );
});

/* Turath Lens Service Worker */
const CACHE_NAME = 'turath-lens-v1';
const OFFLINE_URL = 'offline.html';
const CORE_ASSETS = [
  './',
  './index.html',
  './offline.html',
  './facts-plugin.js',
  './facts.json',
  './geo-plugin.js',
  './geo-sites.json',
  './imgs/pyramid.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_ASSETS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    try {
      const net = await fetch(req);
      // Stale-while-revalidate for same-origin GETs
      if (new URL(req.url).origin === self.location.origin) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, net.clone());
      }
      return net;
    } catch (_) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      // Fallback to offline shell for navigation
      if (req.mode === 'navigate') {
        const off = await cache.match(OFFLINE_URL);
        if (off) return off;
      }
      return new Response('Offline', { status: 503, statusText: 'Offline' });
    }
  })());
});

const CACHE_NAME = 'asperus-dashboard-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  console.log('SW: Installing');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching files');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('SW: Cache failed', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
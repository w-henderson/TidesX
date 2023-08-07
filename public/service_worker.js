/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-globals */
const VERSION = "v2-20230807";

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open('tidesx').then(function (cache) {
      console.log("Cache created");
      return cache.addAll([
        '/TidesX/',
        '/TidesX/index.html',
        '/TidesX/style.css'
      ]);
    })
  );
});

self.addEventListener('fetch', function (event) {
  event.respondWith((async () => {
    try {
      return await fetch(event.request);
    } catch (_) {
      return caches.match(event.request);
    }
  })());
});
const VERSION = "v1-20230208-patch";

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
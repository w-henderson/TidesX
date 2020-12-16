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
  console.log(event.request.url);

  event.respondWith(
    caches.match(event.request).then(function (response) {
      return response || fetch(event.request);
    })
  );
});
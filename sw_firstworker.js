var CACHE_NAME = 'Mycache';
var urlsToCache = [
    '/',
    'index.html',
    'index.css',
    "http://placekitten.com/225/175",
    "http://placekitten.com/226/175" ,
    "http://placekitten.com/227/175"
];

self.addEventListener('install', function(event) {
    // install stage
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener("activate", e => {
    console.log("service worker is active");
    e.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames
          .filter(function(cacheName) {
             if (cacheName != CACHE_NAME) return true;
           })
            .map(function(cacheName) {
              return caches.delete(cacheName);
            })
        );
      })
    );
  });

//in the fetch event, block some network request
self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            // if the cache exist, return
            if (response) {
                return response;
            }
          
            // if failed, request to clone
            var request = event.request.clone(); // copy the original request

            // solve CORS problem
            if (request.mode !== 'navigate' && request.url.indexOf(request.referrer) === -1) 						{
                request = new Request(request, { mode: 'no-cors' })
            }

            return fetch(request).then(function (httpRes) {
								//get the data from http
              
              	//if request failed, return directly
                if (!httpRes  || ( httpRes.status !== 200 && httpRes.status !== 304 && httpRes.type !== 'opaque') || request.method === 'POST') {
                    return httpRes;
                }

                //if request succeed, cache
                var responseClone = httpRes.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(event.request, responseClone);
                });

                return httpRes;
            });
        })
    );
});

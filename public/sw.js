'use strict';

// Cache static css and js files
self.addEventListener('install', function(event){
    var urlsToCache = [
        '/',
        '/javascripts/view.js',
        '/stylesheets/style.css',
        'https://code.jquery.com/jquery-3.1.1.min.js',
        'https://bootswatch.com/2/cerulean/bootstrap.min.css'
    ];

    event.waitUntil(
        caches.open('gtfs-staticfiles-v1')
            .then(function(cache){
                return cache.addAll(urlsToCache);
            })
            .catch(function(err){
                console.log('Something went wrong while building the cache');
            })
    )
});

// Handler for offline status and 404 pages.
self.addEventListener('fetch', function(event) {
    //console.log(event.status);
    event.respondWith(
        caches.match(event.request).then(function (response) {
            if (response) return response;
            return fetch(event.request).then(function(response){
                if(response.status === 404) {
                    return new Response ('Page Not Found')
                }
                return response;
            });
        })
    );
});
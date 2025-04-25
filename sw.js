// Nome della cache
const CACHE_NAME = 'calendario-svc-v1';
// File da mettere in cache all'installazione
const urlsToCache = [
  '.', // Alias per index.html (o il nome del tuo file HTML)
  'manifest.json', // Il file manifest
  'https://cdn.tailwindcss.com', // Tailwind CSS
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' // Font Inter
  // Aggiungi qui i percorsi delle icone se vuoi metterle in cache
  // 'icon-192x192.png',
  // 'icon-512x512.png'
];

// Evento install: apre la cache e aggiunge i file principali
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aperta');
        // Nota: mettiamo in cache le risorse esterne con richieste separate
        const externalUrls = urlsToCache.filter(url => url.startsWith('http'));
        const localUrls = urlsToCache.filter(url => !url.startsWith('http'));

        const cachePromises = externalUrls.map(url => {
            // Cache delle risorse esterne senza modalità 'no-cors' per permettere l'uso
             return fetch(url).then(response => {
                 if (!response.ok) {
                    throw new Error(`Errore nel fetch di ${url}: ${response.statusText}`);
                 }
                 return cache.put(url, response);
             }).catch(error => {
                 console.error(`Impossibile mettere in cache ${url}: ${error}`);
             });
        });

        // Aggiunge le risorse locali
        cachePromises.push(cache.addAll(localUrls));

        return Promise.all(cachePromises);
      })
  );
});

// Evento fetch: intercetta le richieste
// Risponde con la cache se disponibile, altrimenti va in rete
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se la risorsa è in cache, la restituisce
        if (response) {
          return response;
        }
        // Altrimenti, prova a recuperarla dalla rete
        return fetch(event.request);
      })
  );
});

// Evento activate: pulisce le vecchie cache se necessario
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

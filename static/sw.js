// sw.js - Service Worker para MotoManutenção
const CACHE_NAME = 'motomanutencao-v2.0';
const urlsToCache = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/auth.js',
  './js/vehicles.js',
  './js/services.js',
  './js/stats.js',
  './js/ui.js',
  './js/utils.js',
  './js/api.js',
  './manifest.json',
  './sw.js',
  // CDNs externos
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Instalação
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Adicionando recursos ao cache...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Todos os recursos em cache!');
        return self.skipWaiting();
      })
      .catch(error => {
        console.log('❌ Erro no cache:', error);
      })
  );
});

// Ativação
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker ativando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker ativado e pronto!');
      return self.clients.claim();
    })
  );
});

// Fetch - Estratégia Cache First
self.addEventListener('fetch', (event) => {
  // Ignorar requisições para API (sempre buscar online)
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retorna do cache se encontrado
        if (response) {
          return response;
        }
        
        // Se não está no cache, busca na rede
        return fetch(event.request);
      })
  );
});
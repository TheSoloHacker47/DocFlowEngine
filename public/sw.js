const CACHE_NAME = 'docflow-engine-v2';
const RUNTIME_CACHE = 'docflow-runtime-v2';
const CONVERSION_CACHE = 'docflow-conversions-v2';

// Cache strategies configuration
const CACHE_STRATEGIES = {
  STATIC_ASSETS: 'cache-first',
  DYNAMIC_CONTENT: 'network-first',
  CONVERSIONS: 'cache-first',
  API_RESPONSES: 'network-first'
};

const STATIC_CACHE_URLS = [
  '/',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
  '/_next/static/css/',
  '/_next/static/js/',
  '/js/pdf.worker.min.js',
  '/js/pdf.worker.min.mjs',
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/vercel.svg',
  '/window.svg'
];

// Cache duration settings (in milliseconds)
const CACHE_DURATIONS = {
  STATIC: 7 * 24 * 60 * 60 * 1000,    // 7 days
  DYNAMIC: 1 * 60 * 60 * 1000,        // 1 hour
  CONVERSION: 24 * 60 * 60 * 1000,     // 24 hours
  API: 5 * 60 * 1000                  // 5 minutes
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .catch((error) => {
        console.error('[ServiceWorker] Cache addAll failed:', error);
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Keep current caches, remove old versions
          if (![CACHE_NAME, RUNTIME_CACHE, CONVERSION_CACHE].includes(cacheName)) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim clients immediately
  return self.clients.claim();
});

// Advanced caching strategies
function isStaticAsset(url) {
  return url.includes('/_next/static/') || 
         url.includes('.js') || 
         url.includes('.css') ||
         url.includes('.svg') ||
         url.includes('.png') ||
         url.includes('.jpg') ||
         url.includes('.jpeg') ||
         url.includes('.woff') ||
         url.includes('.woff2');
}

function isAPIRequest(url) {
  return url.includes('/api/');
}

function isConversionRequest(url) {
  return url.includes('/convert') || url.includes('pdf') || url.includes('docx');
}

async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    console.log('[ServiceWorker] Cache first - serving from cache:', request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[ServiceWorker] Cache first - network failed:', error);
    throw error;
  }
}

async function networkFirstStrategy(request, cacheName, maxAge = CACHE_DURATIONS.DYNAMIC) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      // Add timestamp header for cache expiration
      const responseWithTimestamp = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...Object.fromEntries(networkResponse.headers.entries()),
          'sw-cache-timestamp': Date.now().toString(),
          'sw-cache-max-age': maxAge.toString()
        }
      });
      cache.put(request, responseWithTimestamp.clone());
      return responseWithTimestamp;
    }
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network first - falling back to cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      // Check if cached response is still valid
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
      const maxAge = cachedResponse.headers.get('sw-cache-max-age');
      
      if (cacheTimestamp && maxAge) {
        const age = Date.now() - parseInt(cacheTimestamp);
        if (age > parseInt(maxAge)) {
          // Cache expired, remove it
          const cache = await caches.open(cacheName);
          cache.delete(request);
          throw error;
        }
      }
      
      return cachedResponse;
    }
    throw error;
  }
}

// Enhanced fetch event handler
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  const url = event.request.url;

  // Handle different types of requests with appropriate strategies
  if (isStaticAsset(url)) {
    // Static assets: Cache-first strategy
    event.respondWith(cacheFirstStrategy(event.request, CACHE_NAME));
  } else if (isAPIRequest(url)) {
    // API requests: Network-first with short cache
    event.respondWith(networkFirstStrategy(event.request, RUNTIME_CACHE, CACHE_DURATIONS.API));
  } else if (isConversionRequest(url)) {
    // Conversion requests: Cache-first for better performance
    event.respondWith(cacheFirstStrategy(event.request, CONVERSION_CACHE));
  } else {
    // Dynamic content: Network-first strategy
    event.respondWith(
      networkFirstStrategy(event.request, RUNTIME_CACHE, CACHE_DURATIONS.DYNAMIC)
        .catch(async (error) => {
          console.error('[ServiceWorker] All strategies failed:', error);
          // Return offline fallback for navigation requests
          if (event.request.mode === 'navigate') {
            const offlinePage = await caches.match('/');
            if (offlinePage) {
              return offlinePage;
            }
          }
          throw error;
        })
    );
  }
});

// Cache cleanup utility
async function cleanupExpiredCache() {
  console.log('[ServiceWorker] Starting cache cleanup');
  
  try {
    const cacheNames = await caches.keys();
    
    for (const cacheName of cacheNames) {
      if ([RUNTIME_CACHE, CONVERSION_CACHE].includes(cacheName)) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        
        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const cacheTimestamp = response.headers.get('sw-cache-timestamp');
            const maxAge = response.headers.get('sw-cache-max-age');
            
            if (cacheTimestamp && maxAge) {
              const age = Date.now() - parseInt(cacheTimestamp);
              if (age > parseInt(maxAge)) {
                console.log('[ServiceWorker] Removing expired cache entry:', request.url);
                await cache.delete(request);
              }
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('[ServiceWorker] Cache cleanup failed:', error);
  }
}

// Periodic cache cleanup (every 30 minutes)
setInterval(cleanupExpiredCache, 30 * 60 * 1000);

// Background sync for offline conversions
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Background sync:', event.tag);
  
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupExpiredCache());
  }
  
  if (event.tag === 'offline-conversion') {
    event.waitUntil(processOfflineConversions());
  }
});

// Process offline conversions when back online
async function processOfflineConversions() {
  console.log('[ServiceWorker] Processing offline conversions');
  
  try {
    // Get offline conversion queue from IndexedDB
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'PROCESS_OFFLINE_QUEUE',
        timestamp: Date.now()
      });
    });
  } catch (error) {
    console.error('[ServiceWorker] Failed to process offline conversions:', error);
  }
}

// Message handling for cache management
self.addEventListener('message', (event) => {
  console.log('[ServiceWorker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEANUP_CACHE') {
    event.waitUntil(cleanupExpiredCache());
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if ([RUNTIME_CACHE, CONVERSION_CACHE].includes(cacheName)) {
              console.log('[ServiceWorker] Clearing cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    );
  }
});

// Network status monitoring
self.addEventListener('online', () => {
  console.log('[ServiceWorker] Back online');
  // Trigger background sync for offline conversions
  self.registration.sync.register('offline-conversion');
});

self.addEventListener('offline', () => {
  console.log('[ServiceWorker] Gone offline');
}); 
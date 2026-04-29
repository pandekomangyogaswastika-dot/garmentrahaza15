/* PT Rahaza ERP — Service Worker (PWA)
 * Strategy:
 *   - Static assets (JS/CSS/images): Cache-First
 *   - API calls (/api/*): Network-First with offline fallback
 *   - HTML pages: Network-First
 */

const CACHE_NAME = 'rahaza-erp-v1';
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico',
];

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {
        // Silently ignore if some assets not found (dev mode)
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests (Posthog, fonts, etc.)
  if (url.origin !== self.location.origin) return;

  // API calls: Network-First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstApi(request));
    return;
  }

  // Static assets: Cache-First
  if (
    url.pathname.startsWith('/static/') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.json')
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML / navigation: Network-First
  event.respondWith(networkFirstHtml(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline — resource not cached', { status: 503 });
  }
}

async function networkFirstApi(request) {
  try {
    const response = await fetch(request);
    // Cache successful GETs for offline fallback
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response(
      JSON.stringify({ offline: true, message: 'Tidak ada koneksi internet. Menampilkan data terakhir yang tersimpan.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function networkFirstHtml(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request) || await caches.match('/');
    if (cached) return cached;
    return new Response('<h1>PT Rahaza ERP — Offline</h1><p>Tidak ada koneksi. Buka kembali saat online.</p>', {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

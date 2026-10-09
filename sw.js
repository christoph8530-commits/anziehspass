// Service Worker: macht die App offline-fähig.
// Bei Änderungen an der App VERSION hochzählen, damit Handys die neue Version laden.

const VERSION = 'v5';
const CACHE = `anziehspass-${VERSION}`;

const EMOJI = [
  '1f319', '1f338', '1f33b', '1f366', '1f36d', '1f380', '1f388', '1f392', '1f393', '1f3a9',
  '1f3b2', '1f3e0', '1f451', '1f452', '1f453', '1f457', '1f45f', '1f4be', '1f512', '1f576',
  '1f5bc', '1f6fc', '1f947', '1f955', '1f97d', '1f97e', '1f9b4', '1f9e2', '1f9e3', '1f9f8',
  '1f9f9', '1fa81', '1fa84', '1faa3', '1fabd', '23f1', '23f3', '25b6', '2602', '26bd', '26d1',
];

const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/style.css',
  'js/app.js',
  'js/figures.js',
  'js/items.js',
  'js/scene.js',
  'js/sound.js',
  'js/storage.js',
  'js/timer.js',
  'icons/icon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  ...EMOJI.map((cp) => `assets/emoji/emoji_u${cp}.svg`),
];

self.addEventListener('install', (event) => {
  // cache: 'reload' umgeht den HTTP-Cache, damit wirklich die neue Version geladen wird.
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES.map((f) => new Request(f, { cache: 'reload' }))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Sofort aus dem Cache antworten, im Hintergrund aktualisieren.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request, { ignoreSearch: true });
      const network = fetch(request)
        .then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});

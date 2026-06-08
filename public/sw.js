// sw.js — gør appen installerbar + tolerant over for dårligt net.
// Realtime-deling kræver netværk, så vi kører network-first og falder tilbage
// til cache (app-skal/ikoner) når der ikke er forbindelse.
const CACHE = 'indkob-v1';
const SHELL = ['/', '/app', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(SHELL.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // lad Supabase/API-kald gå direkte til nettet (ingen caching af data)
  if (url.origin !== self.location.origin) return;

  e.respondWith(
    fetch(req)
      .then((resp) => {
        const copy = resp.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return resp;
      })
      .catch(() =>
        caches.match(req).then((cached) =>
          cached || (req.mode === 'navigate' ? caches.match('/app') : undefined)
        )
      )
  );
});

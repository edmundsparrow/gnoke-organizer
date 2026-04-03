/**
 * sw.js — Gnoke Organizer
 * Service worker for offline-first PWA support.
 */

const CACHE_NAME = 'gnoke-organizer-v1';

const ASSETS = [
  './',
  './index.html',
  './main/',
  './style.css',
  './global.png',
  './manifest.json',
  './js/state.js',
  './js/theme.js',
  './js/ui.js',
  './js/update.js',
  './js/app.js',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});

const CACHE_NAME = "mabel-english-v2";
const APP_SHELL = [
  "/",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/images/brand/adventure-map.webp",
  "/images/brand/mabel-character-anchor.webp",
  "/images/units/unit-01-social.webp",
  "/images/units/unit-02-family.webp",
  "/images/units/unit-03-school.webp",
  "/images/units/unit-04-friends.webp",
  "/images/units/unit-05-shopping.webp",
  "/images/units/unit-06-dining.webp",
  "/images/units/unit-07-health.webp",
  "/images/units/unit-08-transport.webp",
  "/images/units/unit-09-airport.webp",
  "/images/units/unit-10-hotel.webp",
  "/images/units/unit-11-attractions.webp",
  "/images/units/unit-12-speaking.webp",
  "/images/units/unit-13-singapore.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match("/")))
  );
});

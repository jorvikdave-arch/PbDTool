// Cache name
const CACHE_NAME = "pbd-buddy-cache-v1";

// Files to cache
const FILES_TO_CACHE = [
  "/",
  "/manifest.json",
  "/favicon.png",
  // Add other static assets here
];

// Install service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    }),
  );
});

// Activate service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        }),
      );
    }),
  );
});

// Fetch event handler
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Always try network first for API requests
      if (event.request.url.includes("/api/")) {
        return fetch(event.request).catch(() => {
          // Return cached response if available
          return caches.match(event.request);
        });
      }

      // For other requests, return from cache first
      return response || fetch(event.request);
    }),
  );
});

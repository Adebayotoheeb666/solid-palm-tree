const CACHE_NAME = "onboard-ticket-v1";
const CRITICAL_ASSETS = [
  "/",
  "/onboard/result.png",
  "/hero.png",
  "/onboard/logos-01.png",
];

// Install event - cache critical assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Caching critical assets");
        return cache.addAll(CRITICAL_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip API requests
  if (url.pathname.startsWith("/api/")) return;

  event.respondWith(
    caches
      .match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log("[SW] Serving from cache:", request.url);
          return cachedResponse;
        }

        console.log("[SW] Fetching from network:", request.url);
        return fetch(request).then((response) => {
          // Don't cache non-successful responses
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            // Cache images, fonts, and static assets
            if (
              request.url.match(
                /\.(png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/i,
              )
            ) {
              cache.put(request, responseToCache);
            }
          });

          return response;
        });
      })
      .catch(() => {
        // Fallback for offline scenarios
        if (request.destination === "document") {
          return caches.match("/");
        }
      }),
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Perform background sync operations
      console.log("[SW] Performing background sync"),
    );
  }
});

// Push notifications (if needed in the future)
self.addEventListener("push", (event) => {
  console.log("[SW] Push received");

  const options = {
    body: event.data ? event.data.text() : "New notification",
    icon: "/onboard/result.png",
    badge: "/onboard/result.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: "2",
    },
  };

  event.waitUntil(self.registration.showNotification("OnboardTicket", options));
});

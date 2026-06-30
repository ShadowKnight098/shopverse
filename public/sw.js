const CACHE_NAME = 'shopverse-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/icons.svg',
];

// Install Event - cache core shell assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - clean up old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - service worker caching strategy
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Bypass caching for Supabase REST API, Auth, and Storage queries
  if (url.origin.includes('supabase.co') || url.pathname.includes('/rest/v1/') || e.request.method !== 'GET') {
    return;
  }

  // Stale-While-Revalidate caching strategy for local static assets
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to update cache
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(e.request, networkResponse);
            });
          }
        }).catch(() => { /* Ignore offline fetch errors */ });

        return cachedResponse;
      }

      return fetch(e.request).then((networkResponse) => {
        // Cache new local dynamic assets (like images or pages)
        if (networkResponse.status === 200 && url.origin === self.location.origin) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return networkResponse;
      });
    })
  );
});

// Push Event - display incoming push notifications
self.addEventListener('push', (e) => {
  let data = {};
  if (e.data) {
    try {
      data = e.data.json();
    } catch (err) {
      data = { title: 'New Notification', body: e.data.text() };
    }
  }

  const title = data.title || 'ShopVerse Update';
  const options = {
    body: data.body || 'You have a new update from ShopVerse.',
    icon: data.icon || '/favicon.svg',
    badge: '/favicon.svg',
    data: {
      url: data.url || '/'
    },
    actions: data.actions || [],
    vibrate: [100, 50, 100],
  };

  e.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Event - open browser and focus client
self.addEventListener('notificationclick', (e) => {
  e.notification.close();

  const destinationUrl = e.notification.data?.url || '/';

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, navigate it to target URL and focus
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.navigate(destinationUrl).then((c) => c.focus());
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(destinationUrl);
      }
    })
  );
});

// Message Event - listen for mock broadcasts from client side
self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'MOCK_BROADCAST') {
    const title = e.data.title || 'ShopVerse Broadcast';
    const options = {
      body: e.data.body || 'This is a simulated system notification.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      data: {
        url: e.data.url || '/'
      },
      vibrate: [100, 50, 100],
    };

    self.registration.showNotification(title, options);
  }
});

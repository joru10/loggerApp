/// <reference lib="webworker" />
/// <reference lib="es2020" />
/// <reference lib="webworker.iterable" />

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = 'audio-logger-v1';
const OFFLINE_URL = '/offline.html';

sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    Promise.all([
      sw.clients.claim(),
      caches.keys().then((cacheNames) => 
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log(`Deleting old cache: ${name}`);
              return caches.delete(name);
            })
        )
      ).then(() => {
        console.log('Service Worker activated and old caches cleared');
      })
    ])
  );
});

sw.addEventListener('fetch', (event: FetchEvent) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (!response || response.status === 404 || !response.ok) {
            return caches.match(OFFLINE_URL);
          }
          return caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, response.clone());
              return response;
            });
        })
        .catch(() => 
          caches.match(OFFLINE_URL)
            .then((response) => response ?? new Response('Offline page not found', {
              status: 404,
              statusText: 'Not Found',
              headers: { 'Content-Type': 'text/plain' }
            }))
        )
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then((networkResponse) => {
              if (!networkResponse || networkResponse.status !== 200) {
                return networkResponse;
              }
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              return networkResponse;
            })
            .catch(() => new Response('Resource not available offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            }));
        })
    );
  }
});

sw.addEventListener('push', (event: PushEvent) => {
  const options: NotificationOptions = {
    body: event.data?.text() ?? 'Time to record your activity!',
    icon: '/logo192.png',
    badge: '/logo192.png',
    requireInteraction: true,
    tag: 'audio-logger-reminder',
    renotify: true
  };

  event.waitUntil(
    sw.registration.showNotification('Audio Logger', options)
  );
});

sw.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'SHOW_NOTIFICATION') {
    event.waitUntil(
      sw.registration.showNotification('Audio Logger Reminder', {
        body: 'Time to record your activity!',
        icon: '/logo192.png',
        requireInteraction: true,
        tag: 'audio-logger-reminder',
        renotify: true
      })
    );
  }
});

sw.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  event.waitUntil(
    sw.clients.matchAll({ type: 'window' })
      .then(clientList => {
        const hadWindowToFocus = clientList.some(client => {
          if (client.url === '/' && 'focus' in client) {
            client.focus();
            return true;
          }
          return false;
        });
        if (!hadWindowToFocus) {
          return sw.clients.openWindow('/');
        }
      })
  );
});
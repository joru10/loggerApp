import { Anthropic } from '@anthropic-ai/sdk'
self.addEventListener('install', event => {
  console.log('Service Worker installed');
});

self.addEventListener('activate', event => {
  console.log('Service Worker activated');
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  clients.openWindow('/');
});
```
```javascript
// Remove this line, service workers can't use imports
// import { Anthropic } from '@anthropic-ai/sdk'

self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  console.log('Service Worker activated');
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification('Audio Logger Reminder', {
      body: 'Time to record your activity!',
      icon: '/logo192.png',
      requireInteraction: true,
      tag: 'audio-logger-reminder',
      renotify: true
    });
  }
});
```
```javascript
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Time to record your activity!',
    icon: '/logo192.png',
    badge: '/logo192.png'
  };

  event.waitUntil(
    self.registration.showNotification('Audio Logger', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
```
```javascript
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification('Audio Logger Reminder', {
      body: 'Time to record your activity!',
      icon: '/logo192.png',
      requireInteraction: true,
      tag: 'audio-logger-reminder',
      renotify: true
    });
  }
});
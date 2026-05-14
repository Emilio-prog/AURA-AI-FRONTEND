self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  let data = {
    title: 'AURA IA',
    body: 'Tienes un recordatorio pendiente.',
    url: '/#/dashboard',
    type: 'REMINDER',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || 'AURA IA', {
        body: data.body || 'Tienes un recordatorio pendiente.',
        tag: `aura-${data.type || 'push'}-${Date.now()}`,
        renotify: true,
        requireInteraction: data.type === 'TEST',
        data: { url: data.url || '/#/dashboard' },
      }),
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          client.postMessage({
            source: 'aura-push',
            title: data.title || 'AURA IA',
            body: data.body || 'Tienes un recordatorio pendiente.',
            type: data.type || 'REMINDER',
          });
        }
      }),
    ]),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = new URL(event.notification.data?.url || '/#/dashboard', self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    }),
  );
});

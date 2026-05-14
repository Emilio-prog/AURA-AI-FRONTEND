import { httpClient } from './httpClient';

export interface PushConfig {
  enabled: boolean;
  publicKey: string | null;
  subscribed: boolean;
}

interface PushTestResponse {
  sent: boolean;
}

export type PushPermissionState = NotificationPermission | 'unsupported';

export const isPushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

export const getPushPermissionState = (): PushPermissionState => {
  if (!isPushSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

export const getPushConfig = async (): Promise<PushConfig> => {
  const { data } = await httpClient.get<PushConfig>('/push/config');
  return data;
};

export const enablePushNotifications = async (): Promise<void> => {
  if (!isPushSupported()) {
    throw new Error('Este navegador no soporta notificaciones push.');
  }

  const config = await getPushConfig();
  if (!config.enabled || !config.publicKey) {
    throw new Error('Las notificaciones push no estan disponibles ahora mismo.');
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error('Permiso de notificaciones no concedido.');
  }

  const registration = await navigator.serviceWorker.register('/aura-push-sw.js');
  await registration.update().catch(() => undefined);
  await navigator.serviceWorker.ready;
  const applicationServerKey = urlBase64ToUint8Array(config.publicKey);
  let existing = await registration.pushManager.getSubscription();
  if (existing) {
    const oldEndpoint = existing.endpoint;
    await existing.unsubscribe();
    await httpClient.post('/push/subscriptions/disable', { endpoint: oldEndpoint }).catch(() => undefined);
    existing = null;
  }
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    }));

  const json = subscription.toJSON();
  await httpClient.post('/push/subscriptions', {
    endpoint: subscription.endpoint,
    expirationTime: subscription.expirationTime
      ? new Date(subscription.expirationTime).toISOString()
      : null,
    keys: {
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
    },
  });
};

export const disablePushNotifications = async (): Promise<void> => {
  let endpoint: string | undefined;
  if (isPushSupported()) {
    const subscription = await findBrowserPushSubscription();
    endpoint = subscription?.endpoint;
    await subscription?.unsubscribe();
  }
  await httpClient.post('/push/subscriptions/disable', { endpoint });
};

export const sendPushTest = async (): Promise<void> => {
  const { data } = await httpClient.post<PushTestResponse>('/push/test');
  if (!data.sent) {
    throw new Error('No se pudo entregar la notificación. Pulsa RENOVAR_PUSH y vuelve a probar.');
  }
};

const urlBase64ToUint8Array = (value: string): ArrayBuffer => {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }
  return output.buffer.slice(0);
};

const findBrowserPushSubscription = async (): Promise<PushSubscription | null> => {
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      return subscription;
    }
  }
  return null;
};

import { httpClient } from './httpClient';

export interface PushConfig {
  enabled: boolean;
  publicKey: string | null;
  subscribed: boolean;
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
  const existing = await registration.pushManager.getSubscription();
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(config.publicKey),
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
    const registration = await navigator.serviceWorker.getRegistration('/aura-push-sw.js');
    const subscription = await registration?.pushManager.getSubscription();
    endpoint = subscription?.endpoint;
    await subscription?.unsubscribe();
  }
  await httpClient.post('/push/subscriptions/disable', { endpoint });
};

export const sendPushTest = async (): Promise<void> => {
  await httpClient.post('/push/test');
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

import { httpClient } from './httpClient';

export interface PanicNotification {
  id: string;
  contactId: string | null;
  contactName: string | null;
  channel: string;
  status: 'MOCKED' | 'SENT' | 'FAILED';
  details: string | null;
  createdAt: string;
}

export interface PanicAlert {
  id: string;
  triggeredAt: string;
  resolvedAt: string | null;
  notes: string | null;
  contextJson: Record<string, unknown>;
  notifications: PanicNotification[];
  createdAt: string;
  updatedAt: string | null;
}

export interface TriggerPanicPayload {
  notes?: string | null;
  contactId?: string | null;
  contextJson?: Record<string, unknown>;
}

export async function triggerPanic(payload: TriggerPanicPayload = {}) {
  const { data } = await httpClient.post<PanicAlert>('/panic/trigger', payload);
  return data;
}

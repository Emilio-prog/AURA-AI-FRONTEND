import { httpClient } from './httpClient';

export type AchievementCode =
  | 'REFUGIO_ACTIVADO'
  | 'PRIMER_CHAT_AURA'
  | 'PRIMERA_ENTRADA_DIARIO'
  | 'SIETE_DIAS_DIARIO'
  | 'PRIMER_CHECKIN_MOOD'
  | 'TRES_DIAS_MOOD'
  | 'RED_SOS_ACTIVA'
  | 'EXPLORADOR_CALMA';

export type AchievementEventType =
  | 'BREATHING_COMPLETED'
  | 'SOUNDSCAPE_PLAYED'
  | 'MINIGAME_OPENED';

export interface Achievement {
  code: AchievementCode;
  title: string;
  description: string;
  category: string;
  accent: string;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt: string | null;
  progressLabel: string;
}

export interface AchievementListResponse {
  total: number;
  unlocked: number;
  achievements: Achievement[];
}

export async function getAchievements() {
  const { data } = await httpClient.get<AchievementListResponse>('/achievements');
  return data;
}

export async function recordAchievementEvent(
  type: AchievementEventType,
  idempotencyKey: string,
  metadata: Record<string, unknown> = {},
) {
  const { data } = await httpClient.post<AchievementListResponse>('/achievements/events', {
    type,
    idempotencyKey,
    occurredAt: new Date().toISOString(),
    metadata,
  });
  return data;
}

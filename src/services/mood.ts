import { httpClient } from './httpClient';
import type { PageResponse } from './diary';

export interface MoodLog {
  id: string;
  beforeLevel: number;
  afterLevel: number;
  note: string | null;
  loggedAt: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface MoodLogRequest {
  beforeLevel: number;
  afterLevel: number;
  note?: string | null;
  loggedAt?: string;
}

export interface MoodLogFilters {
  size?: number;
  from?: string;
  to?: string;
}

export async function listMoodLogs(filters: number | MoodLogFilters = 100) {
  const params =
    typeof filters === 'number'
      ? { size: filters }
      : {
          size: filters.size ?? 100,
          from: filters.from,
          to: filters.to,
        };
  const { data } = await httpClient.get<PageResponse<MoodLog>>('/mood', {
    params,
  });
  return data;
}

export async function createMoodLog(payload: MoodLogRequest) {
  const { data } = await httpClient.post<MoodLog>('/mood', payload);
  return data;
}

export async function deleteMoodLog(id: string) {
  await httpClient.delete(`/mood/${id}`);
}

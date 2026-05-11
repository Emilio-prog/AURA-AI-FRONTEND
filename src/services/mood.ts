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

export async function listMoodLogs(size = 100) {
  const { data } = await httpClient.get<PageResponse<MoodLog>>('/mood', {
    params: { size },
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

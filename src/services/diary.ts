import { httpClient } from './httpClient';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface DiaryEntry {
  id: string;
  title: string | null;
  content: string;
  moodScore: number | null;
  moodLabel: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface DiaryEntryRequest {
  title?: string | null;
  content: string;
  moodScore?: number | null;
  moodLabel?: string | null;
}

export async function listDiaryEntries(size = 100) {
  const { data } = await httpClient.get<PageResponse<DiaryEntry>>('/diary', {
    params: { size },
  });
  return data;
}

export async function createDiaryEntry(payload: DiaryEntryRequest) {
  const { data } = await httpClient.post<DiaryEntry>('/diary', payload);
  return data;
}

export async function updateDiaryEntry(id: string, payload: DiaryEntryRequest) {
  const { data } = await httpClient.put<DiaryEntry>(`/diary/${id}`, payload);
  return data;
}

export async function deleteDiaryEntry(id: string) {
  await httpClient.delete(`/diary/${id}`);
}

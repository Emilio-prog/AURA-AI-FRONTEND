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
  tags: string[];
  createdAt: string;
  updatedAt: string | null;
}

export interface DiaryEntryRequest {
  title?: string | null;
  content: string;
  moodScore?: number | null;
  moodLabel?: string | null;
  tags?: string[];
}

export interface DiaryEntryListFilters {
  size?: number;
  q?: string;
  tags?: string[];
}

export async function listDiaryEntries(filters: DiaryEntryListFilters | number = {}) {
  const normalized = typeof filters === 'number' ? { size: filters } : filters;
  const params: Record<string, string | number> = {
    size: normalized.size ?? 100,
  };
  if (normalized.q?.trim()) {
    params.q = normalized.q.trim();
  }
  if (normalized.tags?.length) {
    params.tags = normalized.tags.join(',');
  }
  const { data } = await httpClient.get<PageResponse<DiaryEntry>>('/diary', {
    params,
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

import { httpClient } from './httpClient';

export interface ChatMessage {
  role: 'user' | 'assistant' | string;
  content: string;
  timestamp?: string;
  sentiment?: string;
  riskLevel?: 'low' | 'medium' | 'high' | string;
  emotions?: string[];
}

export interface ChatSession {
  id: string;
  title: string | null;
  messages: ChatMessage[];
  startedAt: string;
  updatedAt: string | null;
}

export interface ChatSessionPage {
  content: ChatSession[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: string;
}

export async function listChatSessions() {
  const { data } = await httpClient.get<ChatSessionPage>('/chatbot/sessions', {
    params: {
      page: 0,
      size: 12,
      sort: ['updatedAt,desc', 'startedAt,desc'],
    },
  });
  return data;
}

export async function createChatSession() {
  const { data } = await httpClient.post<ChatSession>('/chatbot/sessions');
  return data;
}

export async function getChatSession(sessionId: string) {
  const { data } = await httpClient.get<ChatSession>(`/chatbot/sessions/${sessionId}`);
  return data;
}

export async function sendChatMessage(sessionId: string, message: string) {
  const { data } = await httpClient.post<ChatSession>(
    `/chatbot/sessions/${sessionId}/messages`,
    { message },
    { timeout: 45_000 },
  );
  return data;
}

export async function deleteChatSession(sessionId: string) {
  await httpClient.delete(`/chatbot/sessions/${sessionId}`);
}

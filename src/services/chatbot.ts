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

export async function createChatSession() {
  const { data } = await httpClient.post<ChatSession>('/chatbot/sessions');
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

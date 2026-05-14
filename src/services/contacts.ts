import { httpClient } from './httpClient';

export interface Contact {
  id: string;
  name: string;
  phone: string;
  relationship: string | null;
  priority: number;
  available: boolean;
  sosEnabled: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface ContactRequest {
  name: string;
  phone: string;
  relationship?: string | null;
  priority?: number;
  available?: boolean;
  sosEnabled?: boolean;
}

export async function listContacts() {
  const { data } = await httpClient.get<Contact[]>('/contacts');
  return data;
}

export async function createContact(payload: ContactRequest) {
  const { data } = await httpClient.post<Contact>('/contacts', payload);
  return data;
}

export async function updateContact(id: string, payload: ContactRequest) {
  const { data } = await httpClient.put<Contact>(`/contacts/${id}`, payload);
  return data;
}

export async function deleteContact(id: string) {
  await httpClient.delete(`/contacts/${id}`);
}

import { httpClient } from './httpClient';

export interface DeleteAccountPayload {
  confirmationText: string;
  currentPassword?: string;
}

export async function exportUserDataJson() {
  const { data } = await httpClient.get('/users/me/export');
  return data;
}

export async function exportUserDataPdf() {
  const { data } = await httpClient.get('/users/me/export.pdf', {
    responseType: 'blob',
  });
  return data as Blob;
}

export async function deleteCurrentAccount(payload: DeleteAccountPayload) {
  await httpClient.post('/users/me/delete', payload);
}

import { httpClient } from './httpClient';

export interface GoogleOAuthStartResponse {
  authorizationUrl: string;
}

export interface GoogleOAuthStatus {
  linked: boolean;
  email?: string | null;
  linkedAt?: string | null;
}

const frontendBaseHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') {
    return {};
  }
  return {
    'X-Aura-Frontend-Base-Url': window.location.origin,
  };
};

export const startGoogleLogin = async (): Promise<string> => {
  const { data } = await httpClient.post<GoogleOAuthStartResponse>(
    '/auth/oauth/google/start',
    undefined,
    { headers: frontendBaseHeaders() },
  );
  return data.authorizationUrl;
};

export const startGoogleLink = async (): Promise<string> => {
  const { data } = await httpClient.post<GoogleOAuthStartResponse>(
    '/auth/oauth/google/link/start',
    undefined,
    { headers: frontendBaseHeaders() },
  );
  return data.authorizationUrl;
};

export const exchangeGoogleCode = async <TAuthResponse>(code: string): Promise<TAuthResponse> => {
  const { data } = await httpClient.post<TAuthResponse>('/auth/oauth/google/exchange', { code });
  return data;
};

export const getGoogleOAuthStatus = async (): Promise<GoogleOAuthStatus> => {
  const { data } = await httpClient.get<GoogleOAuthStatus>('/auth/oauth/google/status');
  return data;
};

export const unlinkGoogleOAuth = async (): Promise<void> => {
  await httpClient.delete('/auth/oauth/google/link');
};

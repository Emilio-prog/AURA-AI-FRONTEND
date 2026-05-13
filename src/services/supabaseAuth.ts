import { httpClient } from './httpClient';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');

export const startSupabaseGoogleLogin = (): void => {
  if (!supabaseUrl) {
    throw new Error('Supabase no esta configurado.');
  }

  const url = new URL(`${supabaseUrl}/auth/v1/authorize`);
  url.searchParams.set('provider', 'google');
  url.searchParams.set('redirect_to', `${window.location.origin}/#/auth/supabase/callback`);
  window.location.assign(url.toString());
};

export const exchangeSupabaseAccessToken = async <TAuthResponse>(
  accessToken: string,
): Promise<TAuthResponse> => {
  const { data } = await httpClient.post<TAuthResponse>('/auth/supabase/exchange', { accessToken });
  return data;
};

export const readSupabaseCallback = (): { accessToken?: string; error?: string } => {
  const hash = window.location.hash;
  const accessTokenIndex = hash.indexOf('#access_token=');
  const errorIndex = hash.indexOf('#error=');

  let rawParams = '';
  if (accessTokenIndex >= 0) {
    rawParams = hash.slice(accessTokenIndex + 1);
  } else if (errorIndex >= 0) {
    rawParams = hash.slice(errorIndex + 1);
  } else if (hash.startsWith('#access_token=') || hash.startsWith('#error=')) {
    rawParams = hash.slice(1);
  }

  if (!rawParams) {
    return { error: 'Falta la sesion de Supabase.' };
  }

  const params = new URLSearchParams(rawParams);
  const providerError = params.get('error_description') ?? params.get('error');
  if (providerError) {
    return { error: providerError };
  }

  const accessToken = params.get('access_token');
  if (!accessToken) {
    return { error: 'Falta el access token de Supabase.' };
  }

  return { accessToken };
};

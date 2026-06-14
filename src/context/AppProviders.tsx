import { useEffect, type ReactNode } from 'react';
import { iniciarCookieConsent } from '@/cookies/cookieConsent';
import { ThemeProvider } from './ThemeContext';
import { AuthProvider } from './AuthContext';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Wrapper único de providers para la app. Hito 1: stubs vacíos.
 * Hitos siguientes lo poblarán con auth real (mock), tema y router.
 */
export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    iniciarCookieConsent();
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

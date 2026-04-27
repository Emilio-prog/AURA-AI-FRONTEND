import type { ReactNode } from 'react';
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
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

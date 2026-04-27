import { createContext, useMemo, useState, type ReactNode } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro' | 'team';
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Stub de autenticación. Hito 4 lo reemplazará por el flujo mock con
 * credenciales fijas + fake JWT en localStorage.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      login: async () => {
        // placeholder — implementación real en Hito 4
      },
      logout: () => setUser(null),
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

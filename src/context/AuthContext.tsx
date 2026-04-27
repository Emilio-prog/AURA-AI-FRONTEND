import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { SEED_USERS, type MockUser, type UserPlan } from '@/data/users';
import { readJSON, writeJSON, remove, STORAGE_KEYS } from '@/utils/storage';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  initials: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const computeInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase() || 'AU';
};

const toAuthUser = ({ id, name, email, plan, initials }: MockUser): AuthUser => ({
  id,
  name,
  email,
  plan,
  initials,
});

const FAKE_JWT_PREFIX = 'aura.fake-jwt';

const issueFakeToken = (userId: string): string =>
  `${FAKE_JWT_PREFIX}.${userId}.${Date.now().toString(36)}`;

const getAllUsers = (): MockUser[] => {
  const persisted = readJSON<MockUser[]>(STORAGE_KEYS.users) ?? [];
  return [...SEED_USERS, ...persisted];
};

const persistRegisteredUsers = (users: MockUser[]): void => {
  const seedIds = new Set(SEED_USERS.map((u) => u.id));
  writeJSON(
    STORAGE_KEYS.users,
    users.filter((u) => !seedIds.has(u.id)),
  );
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  // Restaurar sesión persistida (token + user) al montar.
  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const stored = readJSON<AuthUser>(STORAGE_KEYS.user);
    if (token && stored) {
      setUser(stored);
    }
    setIsHydrating(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    await delay(450);
    const match = getAllUsers().find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
    );
    if (!match) {
      throw new Error('Credenciales no válidas. Verifica email y contraseña.');
    }
    const authUser = toAuthUser(match);
    const token = issueFakeToken(match.id);
    localStorage.setItem(STORAGE_KEYS.token, token);
    writeJSON(STORAGE_KEYS.user, authUser);
    setUser(authUser);
    return authUser;
  }, []);

  const register = useCallback(
    async ({ name, email, password }: RegisterPayload): Promise<AuthUser> => {
      await delay(550);
      const all = getAllUsers();
      if (all.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Ya existe una cuenta con ese email.');
      }
      const newUser: MockUser = {
        id: `usr_${Date.now().toString(36)}`,
        name: name.trim(),
        email: email.trim(),
        password,
        plan: 'free',
        initials: computeInitials(name),
        joinedAt: new Date().toISOString().slice(0, 10),
      };
      persistRegisteredUsers([...all, newUser]);
      const authUser = toAuthUser(newUser);
      const token = issueFakeToken(newUser.id);
      localStorage.setItem(STORAGE_KEYS.token, token);
      writeJSON(STORAGE_KEYS.user, authUser);
      setUser(authUser);
      return authUser;
    },
    [],
  );

  const logout = useCallback(() => {
    remove(STORAGE_KEYS.token);
    remove(STORAGE_KEYS.user);
    remove(STORAGE_KEYS.section);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isHydrating,
      login,
      register,
      logout,
    }),
    [user, isHydrating, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

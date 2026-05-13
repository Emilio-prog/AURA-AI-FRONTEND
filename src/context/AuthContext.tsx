import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { httpClient } from '@/services/httpClient';
import { exchangeGoogleCode, startGoogleLogin as requestGoogleLoginUrl } from '@/services/googleAuth';
import { writeJSON, remove, STORAGE_KEYS } from '@/utils/storage';

export type UserPlan = 'free' | 'personal' | 'premium';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  initials: string;
  onboardedAt: string | null;
}

export interface CompleteOnboardingPayload {
  preferredName: string;
  language: 'es';
  timezone: string;
  privacyAccepted: boolean;
  termsAccepted: boolean;
  supportOnlyAccepted: boolean;
  ageConfirmed: boolean;
  goals: string[];
  anxietyTriggers: string[];
  currentMood: {
    label: string;
    intensity: number;
  };
  toolPreferences: string[];
  notifications: {
    enabled: boolean;
    dailyReminderTime: string;
    timezone?: string;
    moodReminderEnabled?: boolean;
    quickMeditationEnabled?: boolean;
    quickMeditationPeriods?: string[];
    streakEnabled?: boolean;
    weeklyCheckinEnabled?: boolean;
    weeklyCheckinDay?: string;
    weeklyCheckinTime?: string;
  };
  trustedContact?: {
    name: string;
    phone: string;
    relationship?: string;
  };
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  captchaToken?: string;
}

export interface RegisterResult {
  email: string;
  message: string;
  requiresVerification: boolean;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  startGoogleLogin: () => Promise<void>;
  completeGoogleOAuth: (code: string) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  resendVerification: (email: string) => Promise<string>;
  completeOnboarding: (payload: CompleteOnboardingPayload) => Promise<AuthUser>;
  updateProfile: (payload: Partial<Pick<AuthUser, 'name' | 'email'>>) => AuthUser | null;
  logout: () => void;
}

interface BackendUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  onboardedAt?: string | null;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}

interface PendingVerificationResponse {
  email: string;
  message: string;
  requiresVerification?: boolean;
}

interface ApiErrorResponse {
  message?: string;
  error?: string;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const computeInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase() || 'AU';
};

const normalizePlan = (plan: string): UserPlan => {
  const normalized = plan.toLowerCase();
  if (normalized === 'personal' || normalized === 'pro') {
    return 'personal';
  }
  if (normalized === 'premium' || normalized === 'team') {
    return 'premium';
  }
  return 'free';
};

const toAuthUser = (user: BackendUser): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  plan: normalizePlan(user.plan),
  initials: computeInitials(user.name),
  onboardedAt: user.onboardedAt ?? null,
});

const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: ApiErrorResponse } }).response;
    return response?.data?.message ?? response?.data?.error ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
};

const persistSession = ({ accessToken, refreshToken, user }: AuthResponse): AuthUser => {
  const authUser = toAuthUser(user);
  localStorage.setItem(STORAGE_KEYS.token, accessToken);
  localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken);
  writeJSON(STORAGE_KEYS.user, authUser);
  return authUser;
};

const clearSession = (): void => {
  remove(STORAGE_KEYS.token);
  remove(STORAGE_KEYS.refreshToken);
  remove(STORAGE_KEYS.user);
  remove(STORAGE_KEYS.section);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      const accessToken = localStorage.getItem(STORAGE_KEYS.token);
      const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);

      if (!accessToken && !refreshToken) {
        if (mounted) {
          setIsHydrating(false);
        }
        return;
      }

      try {
        const { data } = await httpClient.get<BackendUser>('/auth/me');
        const authUser = toAuthUser(data);
        writeJSON(STORAGE_KEYS.user, authUser);
        if (mounted) {
          setUser(authUser);
        }
      } catch {
        if (!refreshToken) {
          clearSession();
          if (mounted) {
            setUser(null);
          }
        } else {
          try {
            const { data } = await httpClient.post<AuthResponse>('/auth/refresh', { refreshToken });
            const authUser = persistSession(data);
            if (mounted) {
              setUser(authUser);
            }
          } catch {
            clearSession();
            if (mounted) {
              setUser(null);
            }
          }
        }
      } finally {
        if (mounted) {
          setIsHydrating(false);
        }
      }
    };

    void hydrate();
    return () => {
      mounted = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    try {
      const { data } = await httpClient.post<AuthResponse>('/auth/login', { email, password });
      const authUser = persistSession(data);
      setUser(authUser);
      return authUser;
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Credenciales no validas. Verifica email y contrasena.'),
      );
    }
  }, []);

  const beginGoogleLogin = useCallback(async (): Promise<void> => {
    try {
      const authorizationUrl = await requestGoogleLoginUrl();
      window.location.assign(authorizationUrl);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'No se pudo iniciar sesion con Google.'));
    }
  }, []);

  const completeGoogleOAuth = useCallback(async (code: string): Promise<AuthUser> => {
    try {
      const data = await exchangeGoogleCode<AuthResponse>(code);
      const authUser = persistSession(data);
      setUser(authUser);
      return authUser;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'No se pudo completar el acceso con Google.'));
    }
  }, []);

  const register = useCallback(
    async ({ name, email, password, captchaToken }: RegisterPayload): Promise<RegisterResult> => {
      try {
        const { data } = await httpClient.post<PendingVerificationResponse>('/auth/register', {
          name,
          email,
          password,
          captchaToken,
        });
        return {
          email: data.email,
          message: data.message,
          requiresVerification: data.requiresVerification ?? true,
        };
      } catch (error) {
        throw new Error(getApiErrorMessage(error, 'Error al crear cuenta.'));
      }
    },
    [],
  );

  const resendVerification = useCallback(async (email: string): Promise<string> => {
    try {
      const { data } = await httpClient.post<{ message: string }>('/auth/resend-verification', {
        email,
      });
      return data.message;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'No se pudo reenviar el email de verificacion.'));
    }
  }, []);

  const completeOnboarding = useCallback(
    async (payload: CompleteOnboardingPayload): Promise<AuthUser> => {
      try {
        const { data } = await httpClient.post<BackendUser>('/users/me/onboarding', payload);
        const authUser = toAuthUser(data);
        writeJSON(STORAGE_KEYS.user, authUser);
        setUser(authUser);
        return authUser;
      } catch (error) {
        throw new Error(getApiErrorMessage(error, 'No se pudo completar el onboarding.'));
      }
    },
    [],
  );

  const logout = useCallback(() => {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken);
    clearSession();
    setUser(null);

    if (refreshToken) {
      void httpClient.post('/auth/logout', { refreshToken }).catch(() => undefined);
    }
  }, []);

  const updateProfile = useCallback(
    (payload: Partial<Pick<AuthUser, 'name' | 'email'>>): AuthUser | null => {
      if (!user) return null;
      const next: AuthUser = {
        ...user,
        ...payload,
        initials: payload.name ? computeInitials(payload.name) : user.initials,
      };
      writeJSON(STORAGE_KEYS.user, next);
      setUser(next);
      return next;
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isHydrating,
      login,
      startGoogleLogin: beginGoogleLogin,
      completeGoogleOAuth,
      register,
      resendVerification,
      completeOnboarding,
      updateProfile,
      logout,
    }),
    [user, isHydrating, login, beginGoogleLogin, completeGoogleOAuth, register, resendVerification, completeOnboarding, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

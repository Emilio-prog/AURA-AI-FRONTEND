export const STORAGE_KEYS = {
  token: 'aura.token',
  user: 'aura.user',
  users: 'aura.users',
  section: 'aura.section',
} as const;

export function readJSON<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function writeJSON<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage lleno o deshabilitado — silencioso en mock phase
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // noop
  }
}

export function readString(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // noop
  }
}

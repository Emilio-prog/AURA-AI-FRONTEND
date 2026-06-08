/* eslint-disable */
// @ts-nocheck
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { BillingView } from './BillingView';
import { getAchievements, recordAchievementEvent } from '@/services/achievements';
import {
  createDiaryEntry,
  deleteDiaryEntry,
  listDiaryEntries,
  updateDiaryEntry,
} from '@/services/diary';
import { createMoodLog, getMoodStats, listMoodLogs } from '@/services/mood';
import {
  createContact,
  deleteContact as deleteContactApi,
  listContacts,
  updateContact,
} from '@/services/contacts';
import {
  createChatSession,
  deleteChatSession,
  getChatSession,
  listChatSessions,
  sendChatMessage,
} from '@/services/chatbot';
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushConfig,
  getPushPermissionState,
  isPushSupported,
  sendPushTest,
} from '@/services/pushNotifications';
import { getGoogleOAuthStatus, startGoogleLink, unlinkGoogleOAuth } from '@/services/googleAuth';
import { triggerPanic } from '@/services/panic';
import { deleteCurrentAccount, exportUserDataJson, exportUserDataPdf } from '@/services/users';
import i18n from '@/i18n';

/* ── CONSTANTS ──
 * Acentos (T/M/CR) son tokens de marca y NO cambian con el tema.
 * Los neutros (K/W/DK/BORDE/SOMBRA) leen de CSS vars y se invierten en dark.
 */
const T = '#2DD4BF',
  M = '#A855F7',
  CR = '#FB7185',
  K = 'var(--aura-fg)',
  W = 'var(--aura-bg)',
  DK = 'var(--aura-bg-stats)';
const TL = 'rgba(45,212,191,0.12)',
  ML = 'rgba(168,85,247,0.10)',
  CL = 'rgba(251,113,133,0.11)';
const BORDE = '4px solid var(--aura-fg)',
  SOMBRA = 'var(--aura-shadow)',
  SOMBRA_SM = 'var(--aura-shadow-sm)';

const NAV = [
  { id: 'inicio', icon: 'home', label: 'INICIO_', labelKey: 'dashboard.nav.inicio' },
  { id: 'sos', icon: 'emergency', label: 'BOTÓN_SOS', labelKey: 'dashboard.nav.sos', sos: true },
  { id: 'chatbot', icon: 'smart_toy', label: 'AURA IA', labelKey: 'dashboard.nav.chatbot' },
  { id: 'mood', icon: 'mood', label: 'MOOD_TRACKER', labelKey: 'dashboard.nav.mood' },
  { id: 'juegos', icon: 'sports_esports', label: 'MINIJUEGOS', labelKey: 'dashboard.nav.juegos' },
  {
    id: 'sonidos',
    icon: 'headphones',
    label: 'AMBIENTES_SONOROS',
    labelKey: 'dashboard.nav.sonidos',
  },
  { id: 'diario', icon: 'book_2', label: 'DIARIO', labelKey: 'dashboard.nav.diario' },
  { id: 'logros', icon: 'military_tech', label: 'LOGROS', labelKey: 'dashboard.nav.logros' },
  { id: 'billing', icon: 'credit_card', label: 'FACTURACION', labelKey: 'dashboard.nav.billing' },
  {
    id: 'contactos',
    icon: 'group',
    label: 'CONTACTOS_CONFIANZA',
    labelKey: 'dashboard.nav.contactos',
  },
  { id: 'config', icon: 'settings', label: 'CONFIGURACIÓN', labelKey: 'dashboard.nav.config' },
];

const PANEL_SECTIONS = NAV.map(({ id }) => id);
const DIARY_STORAGE_KEY = 'aura.diary.entries';
const CONTACTS_STORAGE_KEY = 'aura.contacts';
const PROFILE_STORAGE_KEY = 'aura.profile';

const DEFAULT_PANEL_USER = {
  name: 'María Solís',
  email: 'demo@aura.ai',
  plan: 'personal',
  initials: 'MS',
};

const panelFirstName = (name) => name?.trim().split(/\s+/)[0] || 'María';

const planLabel = (plan) => {
  if (plan === 'premium' || plan === 'team') return 'PREMIUM';
  if (plan === 'personal' || plan === 'pro') return 'PERSONAL';
  return 'FREE';
};

const todayMoodKey = () => {
  const d = new Date();
  return `aura-mood-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
};

const panelDateLabel = () =>
  new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
    .format(new Date())
    .replace(/\./g, '')
    .replace(/,/g, '')
    .toUpperCase();

const parsePanelDate = (value) => {
  if (!value) return null;
  const parsed = value instanceof Date ? value : new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const safePanelIso = (value, fallback = new Date().toISOString()) =>
  (parsePanelDate(value) ?? parsePanelDate(fallback) ?? new Date()).toISOString();

const panelDateMs = (value) => parsePanelDate(value)?.getTime() ?? 0;

const diaryDateLabel = (date) => {
  const parsed = parsePanelDate(date);
  if (!parsed) return 'SIN_FECHA';
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
    .format(parsed)
    .replace(/\./g, '')
    .replace(/,/g, '')
    .toUpperCase();
};

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'BIEN', score: 8, color: T },
  { emoji: '😌', label: 'CALMA', score: 7, color: T },
  { emoji: '😰', label: 'ANSIEDAD', score: 3, color: CR },
  { emoji: '😔', label: 'TRISTEZA', score: 4, color: '#fb923c' },
  { emoji: '😤', label: 'FRUSTRACIÓN', score: 4, color: '#f59e0b' },
  { emoji: '🥺', label: 'VULNERABLE', score: 5, color: M },
  { emoji: '😐', label: 'NEUTRAL', score: 6, color: '#94a3b8' },
];

const MOOD_CHECKIN_OPTIONS = [
  { e: '😰', l: 'MUY_MAL', c: CR, nivel: 9 },
  { e: '😔', l: 'MAL', c: '#fb923c', nivel: 7 },
  { e: '😐', l: 'REGULAR', c: '#facc15', nivel: 5 },
  { e: '😊', l: 'BIEN', c: T, nivel: 3 },
  { e: '🤩', l: 'GENIAL', c: M, nivel: 1 },
];

const DIARY_TAG_SUGGESTIONS = [
  'ansiedad',
  'sueño',
  'trabajo',
  'familia',
  'social',
  'gratitud',
  'crisis',
  'rutina',
  'calma',
  'reflexión',
];

const readLocalJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // mock phase: ignore blocked storage
  }
};

const seedDiaryEntries = () => [
  {
    id: 'seed_1',
    date: new Date(Date.now() - 86400000).toISOString(),
    mood: '😌',
    moodLabel: 'CALMA',
    text: 'Me sentí mucho mejor después de hacer el ejercicio de respiración. El minijuego de burbujas me ayudó a despejar la mente.',
  },
  {
    id: 'seed_2',
    date: new Date(Date.now() - 86400000 * 2).toISOString(),
    mood: '😐',
    moodLabel: 'NEUTRAL',
    text: 'Día difícil en el trabajo, pero Aura me ayudó a ordenar mis pensamientos. Usé el grounding 5-4-3-2-1.',
  },
];

const seedContacts = () => [
  {
    id: 'contact_ana',
    name: 'Ana López',
    role: 'HERMANA',
    emoji: '👩',
    phone: '+34 600 123 456',
    available: true,
    sosAuto: true,
  },
  {
    id: 'contact_carlos',
    name: 'Dr. Carlos Ruiz',
    role: 'PSICÓLOGO',
    emoji: '👨‍⚕️',
    phone: '+34 912 345 678',
    available: true,
    sosAuto: true,
  },
  {
    id: 'contact_marco',
    name: 'Marco Sánchez',
    role: 'AMIGO',
    emoji: '👨',
    phone: '+34 655 987 321',
    available: false,
    sosAuto: false,
  },
];

const emptyContact = {
  name: '',
  role: '',
  emoji: '👤',
  phone: '',
  available: true,
  sosAuto: false,
};

const backendErrorMessage = (error) => {
  const errores = error?.response?.data?.fieldErrors;
  if (errores) {
    const campos = Object.keys(errores);
    const campo = campos[0];

    if (campo) {
      return errores[campo];
    }
  }

  return error?.response?.data?.message || error?.message || 'No se pudo completar la operacion.';
};

function usePushNotificationState() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState('unsupported');
  const [enabled, setEnabled] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    const browserSupported = isPushSupported();
    setSupported(browserSupported);
    setPermission(getPushPermissionState());
    if (!browserSupported) {
      setEnabled(false);
      setSubscribed(false);
      setLoading(false);
      return;
    }
    try {
      const config = await getPushConfig();
      setEnabled(Boolean(config.enabled && config.publicKey));
      setSubscribed(Boolean(config.subscribed));
    } catch (err) {
      setError(`Error de notificaciones: ${backendErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return undefined;
    }
    const onPushMessage = (event: MessageEvent) => {
      if (event.data?.source === 'aura-push') {
        setMessage(`Notificación recibida: ${event.data.body || 'Notificación recibida.'}`);
      }
    };
    navigator.serviceWorker.addEventListener('message', onPushMessage);
    return () => navigator.serviceWorker.removeEventListener('message', onPushMessage);
  }, []);

  const activate = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await enablePushNotifications();
      setMessage('Notificaciones activado');
      await refresh();
    } catch (err) {
      setError(`Error de notificaciones: ${backendErrorMessage(err)}`);
      setPermission(getPushPermissionState());
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await disablePushNotifications();
      setMessage('Notificaciones desactivadas');
      await refresh();
    } catch (err) {
      setError(`Error de notificaciones: ${backendErrorMessage(err)}`);
    } finally {
      setBusy(false);
    }
  };

  const test = async () => {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      try {
        await sendPushTest();
      } catch {
        await enablePushNotifications();
        await refresh();
        await sendPushTest();
      }
      setMessage('Notificación de prueba enviada');
    } catch (err) {
      setError(`Error de notificaciones: ${backendErrorMessage(err)}`);
    } finally {
      setBusy(false);
    }
  };

  return {
    supported,
    permission,
    enabled,
    subscribed,
    loading,
    busy,
    message,
    error,
    activate,
    deactivate,
    test,
  };
}

const currentDayKey = () => new Date().toISOString().slice(0, 10);

const ACHIEVEMENT_SEEN_STORAGE_KEY = 'aura.achievements.seen';

const unlockedAchievements = (data) =>
  (data?.achievements ?? []).filter((achievement) => achievement?.unlocked && achievement?.code);

const readSeenAchievementCodes = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(ACHIEVEMENT_SEEN_STORAGE_KEY) || '[]'));
  } catch {
    return new Set();
  }
};

const writeSeenAchievementCodes = (codes) => {
  localStorage.setItem(ACHIEVEMENT_SEEN_STORAGE_KEY, JSON.stringify([...codes]));
};

const notifyAchievementUnlocks = (achievements, unlockedAfter) => {
  const fresh = achievements.filter((achievement) => {
    if (!achievement.unlockedAt || !unlockedAfter) return true;
    return new Date(achievement.unlockedAt).getTime() >= unlockedAfter;
  });
  if (!fresh.length) return;
  const body =
    fresh.length === 1
      ? `Enhorabuena, has desbloqueado: ${fresh[0].title}.`
      : `Enhorabuena, has desbloqueado ${fresh.length} logros nuevos.`;
  window.dispatchEvent(
    new CustomEvent('aura-achievement-unlocked', {
      detail: {
        title: 'LOGRO_DESBLOQUEADO',
        body,
        achievements: fresh,
      },
    }),
  );
  if (getPushPermissionState() !== 'granted') return;
  try {
    const options = {
      body,
      tag: `aura-achievement-${fresh.map((achievement) => achievement.code).join('-')}`,
      data: { url: '/#/dashboard/logros' },
    };
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready
        .then((registration) => registration.showNotification('AURA IA', options))
        .catch(() => new Notification('AURA IA', options));
    } else {
      new Notification('AURA IA', options);
    }
  } catch {
    // La notificación del navegador es un extra visual; nunca debe romper el flujo.
  }
};

const syncAchievementUnlockState = (data, { notify = false, unlockedAfter = 0 } = {}) => {
  const unlocked = unlockedAchievements(data);
  const seen = readSeenAchievementCodes();
  const newlyUnlocked = unlocked.filter((achievement) => !seen.has(achievement.code));
  const recentlyUnlocked = notify
    ? unlocked.filter((achievement) => {
        if (!seen.has(achievement.code) || !achievement.unlockedAt || !unlockedAfter) return false;
        return new Date(achievement.unlockedAt).getTime() >= unlockedAfter;
      })
    : [];
  const notifyTargets = [
    ...new Map(
      [...newlyUnlocked, ...recentlyUnlocked].map((achievement) => [achievement.code, achievement]),
    ).values(),
  ];
  unlocked.forEach((achievement) => seen.add(achievement.code));
  writeSeenAchievementCodes(seen);
  if (notify) notifyAchievementUnlocks(notifyTargets, unlockedAfter);
  window.dispatchEvent(new CustomEvent('aura-achievements-updated', { detail: data }));
  return data;
};

const refreshAchievementsForNotifications = (unlockedAfter = Date.now() - 1000) =>
  getAchievements()
    .then((data) => syncAchievementUnlockState(data, { notify: true, unlockedAfter }))
    .catch(() => null);

const fireAchievementEvent = (type, metadata = {}) => {
  const startedAt = Date.now() - 1000;
  return recordAchievementEvent(type, `${type}:${currentDayKey()}`, metadata)
    .then((data) =>
      syncAchievementUnlockState(data, {
        notify: true,
        unlockedAfter: startedAt,
      }),
    )
    .catch(() => null);
};

const moodByLabel = (label) =>
  MOOD_OPTIONS.find((item) => item.label === label) ??
  MOOD_OPTIONS.find((item) => item.label === 'NEUTRAL');

const backendDiaryToPanel = (entry, fallbackDate = new Date().toISOString()) => {
  const moodScore = entry?.moodScore ?? entry?.mood_score ?? null;
  const moodLabel = entry?.moodLabel ?? entry?.mood_label ?? null;
  const moodOption =
    MOOD_OPTIONS.find((item) => item.score === moodScore) || moodByLabel(moodLabel);
  return {
    id: entry?.id ?? `diary_${Date.now()}`,
    date: safePanelIso(
      entry?.createdAt ?? entry?.created_at ?? entry?.date ?? entry?.updatedAt ?? entry?.updated_at,
      fallbackDate,
    ),
    mood: moodOption?.emoji ?? '😐',
    moodLabel: moodLabel ?? moodOption?.label ?? 'NEUTRAL',
    text: entry?.content ?? entry?.text ?? '',
    title: entry?.title ?? null,
    moodScore,
    tags: Array.isArray(entry?.tags) ? entry.tags : [],
  };
};

const backendMoodToPanel = (log) => ({
  id: log.id,
  date: log.loggedAt,
  before: log.beforeLevel,
  after: log.afterLevel,
  mood: Math.round((log.beforeLevel + log.afterLevel) / 2),
});

const formatoMood = (value) => {
  const numero = Number(value);
  if (!Number.isFinite(numero)) return '0';
  return numero.toFixed(1).replace(/\.0$/, '');
};

const etiquetaTendenciaMood = (estadisticas) => {
  const valor = String(estadisticas?.tendencia ?? estadisticas?.trend ?? 'estable').toLowerCase();
  if (valor === 'mejorando' || valor === 'improving') return 'MEJORANDO';
  if (valor === 'empeorando' || valor === 'declining') return 'EMPEORANDO';
  return 'ESTABLE';
};

const colorTendenciaMood = (estadisticas) => {
  const etiqueta = etiquetaTendenciaMood(estadisticas);
  if (etiqueta === 'MEJORANDO') return T;
  if (etiqueta === 'EMPEORANDO') return CR;
  return M;
};

const fechasRangoMood = (dias) => {
  const hasta = new Date();
  const desde = new Date(hasta);
  desde.setDate(hasta.getDate() - dias + 1);
  return {
    from: desde.toISOString(),
    to: hasta.toISOString(),
  };
};

const backendContactToPanel = (contact) => ({
  id: contact.id,
  name: contact.name,
  role: contact.relationship || 'CONFIANZA',
  emoji: '👤',
  phone: contact.phone,
  priority: contact.priority,
  available: contact.available,
  sosAuto: contact.sosEnabled,
});

const panelContactToRequest = (contact, priority = 1) => ({
  name: contact.name.trim(),
  phone: contact.phone.trim(),
  relationship: contact.role?.trim() || 'CONFIANZA',
  priority,
  available: Boolean(contact.available),
  sosEnabled: Boolean(contact.sosAuto),
});

const SOS_MANUAL_MESSAGE = 'AURA IA: necesito apoyo ahora. Puedes llamarme o escribirme?';

const normalizePhoneForUri = (phone = '') =>
  String(phone)
    .trim()
    .replace(/[^\d+]/g, '')
    .replace(/(?!^)\+/g, '');

const normalizePhoneForWhatsapp = (phone = '') =>
  normalizePhoneForUri(phone).replace(/^\+/, '').replace(/^00/, '');

const buildManualSosLinks = (phone, message = SOS_MANUAL_MESSAGE) => {
  const smsPhone = normalizePhoneForUri(phone);
  const whatsappPhone = normalizePhoneForWhatsapp(phone);
  return {
    sms: smsPhone ? `sms:${smsPhone}` : '',
    whatsapp: whatsappPhone
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
      : '',
  };
};

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const backendChatToPanel = (message, index) => ({
  id: `${message?.role ?? 'message'}_${message?.timestamp ?? index}`,
  from: message?.role === 'user' ? 'user' : 'ai',
  text: String(message?.content ?? ''),
  riskLevel: message?.riskLevel ?? 'low',
  sentiment: message?.sentiment ?? null,
});

const panelMessagesFromChatSession = (session) =>
  (session?.messages ?? []).map(backendChatToPanel).filter((message) => message.text.trim());

const chatSessionTime = (session) =>
  new Date(session?.updatedAt || session?.startedAt || 0).getTime() || 0;

const sortChatSessions = (sessions = []) =>
  [...sessions].sort((a, b) => chatSessionTime(b) - chatSessionTime(a));

const emptyAchievements = {
  total: 8,
  unlocked: 0,
  achievements: [],
};

const generateMoodHistory = (days = 90) => {
  const result = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const wave = Math.sin(i / 4.7) * 1.7 + Math.cos(i / 9.2) * 1.1;
    const before = Math.min(10, Math.max(1, Math.round(5.4 + wave + ((i * 7) % 5) * 0.28)));
    const after = Math.min(10, Math.max(1, before + 1 + ((i * 5) % 3)));
    result.push({
      id: d.toISOString().slice(0, 10),
      date: d.toISOString(),
      before,
      after,
      mood: Math.round((before + after) / 2),
    });
  }
  return result;
};

function sectionFromPath(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  if (normalizedPath === '/dashboard') return 'inicio';

  const match = normalizedPath.match(/\/dashboard\/([^/]+)/);
  if (!match) return null;
  return PANEL_SECTIONS.includes(match[1]) ? match[1] : null;
}

/* ── SIDEBAR ── */
function Sidebar({ active, set }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const panelUser = user ?? DEFAULT_PANEL_USER;

  return (
    <aside
      style={{
        width: 240,
        height: '100vh',
        background: W,
        borderRight: BORDE,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        zIndex: 20,
      }}
    >
      <div
        style={{
          padding: '20px 18px',
          borderBottom: BORDE,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #c084fc 0%, #2DD4BF 100%)',
            border: '4px solid #000',
            flexShrink: 0,
          }}
        />
        <div>
          <div style={{ fontWeight: 900, fontSize: 16, letterSpacing: '-0.02em', lineHeight: 1 }}>
            AURA <span style={{ color: M }}>AI</span>
          </div>
          <div className="lbl" style={{ fontSize: 8, marginTop: 2 }}>
            PANEL_INTERIOR_V2
          </div>
        </div>
      </div>
      <nav style={{ flex: 1, overflowY: 'auto' }}>
        {NAV.map(({ id, icon, label, labelKey, sos }) => (
          <button
            key={id}
            onClick={() => set(id)}
            className={['nav-item', active === id ? 'active' : '', sos ? 'sos-nav' : '']
              .filter(Boolean)
              .join(' ')}
          >
            <span
              className="icon"
              style={{ fontSize: 18, color: active === id ? W : sos ? CR : 'inherit' }}
            >
              {icon}
            </span>
            <span style={{ flex: 1 }}>{t(labelKey, { defaultValue: label })}</span>
            {sos && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: CR,
                  flexShrink: 0,
                }}
              />
            )}
          </button>
        ))}
      </nav>
      <div
        style={{
          borderTop: BORDE,
          padding: '16px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            border: BORDE,
            background: M,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            color: W,
            fontWeight: 900,
            letterSpacing: '0.06em',
            flexShrink: 0,
          }}
        >
          {panelUser.initials}
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700 }}>{panelUser.name}</div>
          <div className="lbl lbl-turquesa" style={{ fontSize: 9 }}>
            PLAN_{planLabel(panelUser.plan)}_ACTIVO
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── STATS MARQUEE ── */
function StatsBar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [estadisticas, setEstadisticas] = useState(null);

  const cargarEstadisticas = useCallback(() => {
    getMoodStats(fechasRangoMood(30))
      .then((datos) => setEstadisticas(datos))
      .catch(() => setEstadisticas(null));
  }, []);

  useEffect(() => {
    cargarEstadisticas();
    window.addEventListener('aura-mood-updated', cargarEstadisticas);
    return () => window.removeEventListener('aura-mood-updated', cargarEstadisticas);
  }, [cargarEstadisticas]);

  const tieneMood = estadisticas?.count > 0;
  const ansiedadPromedio = tieneMood ? `${formatoMood(estadisticas.averageAfter)}/10` : 'SIN_DATOS';
  const tendencia = tieneMood ? etiquetaTendenciaMood(estadisticas) : 'SIN_DATOS';
  const items = [
    'SESIONES_HOY: 3',
    'RACHA: DÍA_07_CONSECUTIVO',
    `ANSIEDAD_PROMEDIO: ${ansiedadPromedio}`,
    `TENDENCIA_ANIMO: ${tendencia}`,
    'EJERCICIOS_RESPIRACIÓN: 12',
    'BURBUJAS_EXPLOTADAS: 847',
    'TIEMPO_APP: 23MIN',
  ];
  const doubled = [...items, ...items];
  return (
    <div
      style={{
        background: DK,
        color: '#fff',
        height: 38,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        borderBottom: BORDE,
        flexShrink: 0,
      }}
    >
      <div className="marquee-track" style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        {doubled.map((t, i) => (
          <span
            key={i}
            className="mono"
            style={{
              fontSize: 11,
              color: '#fff',
              letterSpacing: '0.06em',
              padding: '0 32px',
              borderRight: '1px solid #333',
            }}
          >
            <span style={{ color: T, marginRight: 8 }}>◆</span>
            {t}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
        title={isDark ? 'Tema claro' : 'Tema oscuro'}
        style={{
          flexShrink: 0,
          width: 38,
          height: 38,
          background: W,
          color: K,
          border: 'none',
          borderLeft: '4px solid #000',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
        }}
      >
        <span className="icon">{isDark ? 'light_mode' : 'dark_mode'}</span>
      </button>
    </div>
  );
}

/* ── SOS BENTO CARD ── */
function SOSBentoCard({ openBreathing }) {
  return (
    <div
      className="bc c4"
      style={{
        background: CR,
        borderColor: K,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="lbl" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 9 }}>
          NIVEL_URGENCIA_ALTO
        </div>
        <span className="chip chip-negro" style={{ fontSize: 9 }}>
          SIEMPRE_ACTIVO
        </span>
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 900,
          color: W,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
        }}
      >
        ACTIVAR_
        <br />
        PROTOCOLO
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 90,
            height: 90,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.3)',
            animation: 'ring 2s ease-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 90,
            height: 90,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.2)',
            animation: 'ring 2s ease-out infinite 0.7s',
          }}
        />
        <button
          onClick={openBreathing}
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: W,
            border: '4px solid #000',
            boxShadow: SOMBRA,
            cursor: 'pointer',
            fontSize: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            transition: 'transform .1s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          aria-label="Activar SOS - Respiración guiada"
        >
          🆘
        </button>
      </div>
      <button
        onClick={openBreathing}
        className="btn btn-negro"
        style={{ width: '100%', justifyContent: 'center', fontSize: 11 }}
      >
        RESPIRA_CONMIGO →
      </button>
    </div>
  );
}

/* ── HERO BENTO CARD ── */
function HeroBentoCard() {
  const { user } = useAuth();
  const panelUser = user ?? DEFAULT_PANEL_USER;
  const [mood, setMood] = useState(() => localStorage.getItem(todayMoodKey()));
  const [guardando, setGuardando] = useState(false);
  const [errorMood, setErrorMood] = useState('');
  const h = new Date().getHours();
  const greet = h < 12 ? 'BUENOS_DÍAS_' : h < 18 ? 'BUENAS_TARDES_' : 'BUENAS_NOCHES_';
  const registerMood = async (value) => {
    const opcion = MOOD_CHECKIN_OPTIONS.find((item) => item.l === value);
    if (!opcion || guardando) return;
    const startedAt = Date.now() - 1000;
    setGuardando(true);
    setErrorMood('');
    try {
      await createMoodLog({
        beforeLevel: opcion.nivel,
        afterLevel: opcion.nivel,
        note: null,
        loggedAt: new Date().toISOString(),
      });
      setMood(value);
      localStorage.setItem(todayMoodKey(), value);
      window.dispatchEvent(new CustomEvent('aura-mood-updated'));
      void refreshAchievementsForNotifications(startedAt);
    } catch (err) {
      setErrorMood(`ERR_MOOD: ${backendErrorMessage(err)}`);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bc c8" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="lbl" style={{ marginBottom: 6 }}>
          {greet}
          <span style={{ color: M }}>{panelFirstName(panelUser.name).toUpperCase()}</span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          ¿CÓMO_ESTÁS_HOY?
        </div>
        <div className="lbl" style={{ marginTop: 6 }}>
          {panelDateLabel()} · <span style={{ color: T }}>REGISTRA_TU_ESTADO_EMOCIONAL</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {MOOD_CHECKIN_OPTIONS.map(({ e, l, c }) => (
          <button
            key={l}
            onClick={() => registerMood(l)}
            disabled={guardando}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              padding: '12px 6px',
              border: `3px solid ${mood === l ? c : K}`,
              background: mood === l ? c + '22' : W,
              cursor: guardando ? 'wait' : 'pointer',
              opacity: guardando ? 0.65 : 1,
              transition: 'all .15s',
            }}
          >
            <span style={{ fontSize: 24 }}>{e}</span>
            <span
              className="mono"
              style={{ fontSize: 9, color: mood === l ? c : K, fontWeight: 700 }}
            >
              {l}
            </span>
          </button>
        ))}
      </div>
      {guardando && (
        <span className="chip chip-negro" style={{ alignSelf: 'flex-start', fontSize: 9 }}>
          GUARDANDO_MOOD
        </span>
      )}
      {errorMood && (
        <div
          className="mono"
          style={{ border: `3px solid ${CR}`, background: CL, padding: 10, fontSize: 9 }}
        >
          {errorMood}
        </div>
      )}
      {mood && (
        <div
          style={{
            border: '3px solid #000',
            background: TL,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <span className="mono" style={{ fontSize: 10, color: T, fontWeight: 700 }}>
            LOG_MOOD_REGISTRADO
          </span>
          <span className="mono" style={{ fontSize: 10, color: K }}>
            ESTADO: {mood} · {panelDateLabel()} ·{' '}
            {new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}
    </div>
  );
}

/* ── MOOD CHART CARD ── */
function MoodChartCard() {
  const [hov, setHov] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [errorMood, setErrorMood] = useState('');

  const cargarMoodInicio = useCallback(() => {
    const rango = fechasRangoMood(7);
    setCargando(true);
    setErrorMood('');
    Promise.all([listMoodLogs({ size: 7, from: rango.from, to: rango.to }), getMoodStats(rango)])
      .then(([page, datos]) => {
        setHistorial(
          (page.content ?? [])
            .map(backendMoodToPanel)
            .sort((a, b) => new Date(a.date) - new Date(b.date)),
        );
        setEstadisticas(datos);
      })
      .catch((err) => setErrorMood(`ERR_MOOD: ${backendErrorMessage(err)}`))
      .finally(() => setCargando(false));
  }, []);

  useEffect(() => {
    cargarMoodInicio();
    window.addEventListener('aura-mood-updated', cargarMoodInicio);
    return () => window.removeEventListener('aura-mood-updated', cargarMoodInicio);
  }, [cargarMoodInicio]);

  const datos = historial.slice(-7);
  const tieneDatos = datos.length > 0;
  const days = datos.map((item) => diaryDateLabel(item.date).charAt(0) || '?');
  const before = datos.map((item) => item.before);
  const after = datos.map((item) => item.after);
  const W2 = 320,
    H2 = 100,
    pad = 10,
    max = 10;
  const toX = (i) => pad + (i / Math.max(days.length - 1, 1)) * (W2 - pad * 2);
  const toY = (v) => H2 - pad - (v / max) * (H2 - pad * 2);
  const pathBefore = before.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');
  const pathAfter = after.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(v)}`).join(' ');
  const avgBefore = tieneDatos ? before.reduce((sum, value) => sum + value, 0) / before.length : 0;
  const avgAfter = tieneDatos ? after.reduce((sum, value) => sum + value, 0) / after.length : 0;
  const mejora = estadisticas?.count
    ? estadisticas.improvementPercentage
    : avgBefore
      ? ((avgBefore - avgAfter) / avgBefore) * 100
      : 0;
  const tendencia = tieneDatos ? etiquetaTendenciaMood(estadisticas) : 'SIN_DATOS';
  return (
    <div className="bc c8" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.02em' }}>
            LOG_DIARIO_ESTADO_EMOCIONAL
          </div>
          <div className="lbl" style={{ marginTop: 3 }}>
            ULTIMOS_7_DIAS · DATOS_REALES_BACKEND
          </div>
        </div>
        <span className="chip chip-morado" style={{ fontSize: 9 }}>
          {tieneDatos ? `MEJORA_${Math.round(mejora)}%` : 'SIN_DATOS_REALES'}
        </span>
      </div>
      {cargando && (
        <span className="chip chip-negro" style={{ alignSelf: 'flex-start', fontSize: 9 }}>
          CARGANDO_MOOD
        </span>
      )}
      {errorMood && (
        <div
          className="mono"
          style={{ border: `3px solid ${CR}`, background: CL, padding: 10, fontSize: 9 }}
        >
          {errorMood}
        </div>
      )}
      {!tieneDatos ? (
        <div
          className="mono"
          style={{ border: '3px solid #000', padding: 18, fontSize: 10, background: TL }}
        >
          SIN_DATOS_REALES · REGISTRA_TU_ESTADO_PARA_VER_TENDENCIA
        </div>
      ) : (
        <>
          <div style={{ position: 'relative' }}>
            <svg width="100%" viewBox={`0 0 ${W2} ${H2 + 20}`} style={{ overflow: 'visible' }}>
              {[2, 4, 6, 8, 10].map((v) => (
                <line
                  key={v}
                  x1={pad}
                  y1={toY(v)}
                  x2={W2 - pad}
                  y2={toY(v)}
                  stroke="#e5e5e5"
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              ))}
              <path
                d={pathBefore}
                fill="none"
                stroke="#ccc"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d={pathAfter} fill="none" stroke={M} strokeWidth="2.5" strokeLinejoin="round" />
              {after.map((v, i) => (
                <g
                  key={i}
                  onMouseEnter={() => setHov(i)}
                  onMouseLeave={() => setHov(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={toX(i)}
                    cy={toY(v)}
                    r={hov === i ? 7 : 5}
                    fill={M}
                    stroke={K}
                    strokeWidth="2"
                  />
                  {hov === i && (
                    <g>
                      <rect x={toX(i) - 40} y={toY(v) - 34} width="80" height="22" fill={K} />
                      <text
                        x={toX(i)}
                        y={toY(v) - 18}
                        textAnchor="middle"
                        fill={W}
                        fontSize="9"
                        fontFamily="Space Mono"
                      >{`${before[i]}->${v}`}</text>
                    </g>
                  )}
                  <text
                    x={toX(i)}
                    y={H2 + 16}
                    textAnchor="middle"
                    fill="#555"
                    fontSize="10"
                    fontFamily="Space Mono"
                  >
                    {days[i]}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[
              { l: 'PROM_ANTES', v: formatoMood(avgBefore), c: 'var(--aura-border-subtle)' },
              { l: 'PROM_DESPUES', v: formatoMood(avgAfter), c: M },
              { l: 'TENDENCIA', v: tendencia, c: colorTendenciaMood(estadisticas) },
            ].map(({ l, v, c }) => (
              <div
                key={l}
                style={{
                  border: `3px solid ${K}`,
                  padding: '10px 12px',
                  borderLeft: `6px solid ${c}`,
                }}
              >
                <div className="lbl" style={{ fontSize: 8 }}>
                  {l}
                </div>
                <div
                  style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.02em', marginTop: 2 }}
                >
                  {v}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <div style={{ display: 'flex', gap: 10 }}>
        {[
          { c: 'var(--aura-border-subtle)', l: 'ANTES' },
          { c: M, l: 'DESPUES' },
        ].map(({ c, l }) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }} className="lbl">
            <div style={{ width: 16, height: 3, background: c, border: '1px solid #000' }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── SOUND PLAYER CARD ── */
function SoundPlayerCard() {
  const [playing, setPlaying] = useState(null);
  const [vol, setVol] = useState(70);
  const audioRef = useRef(null);
  const sounds = [
    { id: 'lluvia', icon: '☁️', l: 'LLUVIA_SUAVE' },
    { id: 'oceano', icon: '🌊', l: 'OCÉANO' },
    { id: 'bosque', icon: '🌿', l: 'BOSQUE' },
    { id: 'blanco', icon: '〰️', l: 'RUIDO_BLANCO' },
  ];

  useEffect(() => {
    audioRef.current?.stop();
    audioRef.current = null;
    if (playing) {
      audioRef.current = startGeneratedSound(playing, 'FOCO', vol);
    }
    return () => {
      audioRef.current?.stop();
      audioRef.current = null;
    };
  }, [playing]);

  useEffect(() => {
    audioRef.current?.setVolume(vol);
  }, [vol]);

  const toggleSound = (id) => {
    setPlaying((current) => {
      const next = current === id ? null : id;
      if (next)
        fireAchievementEvent('SOUNDSCAPE_PLAYED', {
          soundscape: id,
          mode: 'FOCO',
          source: 'dashboard_home',
        });
      return next;
    });
  };

  return (
    <div className="bc c4" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: '-0.02em' }}>
        AMBIENTES_SONOROS
      </div>
      {playing && (
        <div
          style={{
            border: '3px solid ' + T,
            padding: '6px 10px',
            background: TL,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: T,
              animation: 'pulse 1.5s ease infinite',
            }}
          />
          <span className="lbl lbl-turquesa" style={{ fontSize: 9 }}>
            REPRODUCIENDO_AHORA
          </span>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {sounds.map(({ id, icon, l }) => (
          <button
            key={id}
            type="button"
            aria-pressed={playing === id}
            aria-label={`${playing === id ? 'Detener' : 'Reproducir'} ${l}`}
            onClick={() => toggleSound(id)}
            style={{
              border: `3px solid ${playing === id ? T : K}`,
              padding: '10px 8px',
              background: playing === id ? TL : W,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              transition: 'all .1s',
            }}
          >
            <span style={{ fontSize: 18 }}>{icon}</span>
            <span
              className="mono"
              style={{ fontSize: 8, color: playing === id ? T : K, fontWeight: 700 }}
            >
              {l}
            </span>
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span className="icon" style={{ fontSize: 14 }}>
          volume_mute
        </span>
        <div
          style={{
            flex: 1,
            height: 5,
            background: 'var(--aura-border-subtle)',
            border: '2px solid #000',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${vol}%`,
              background: M,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${vol}%`,
              transform: 'translate(-50%,-50%)',
              width: 12,
              height: 12,
              background: W,
              border: '2px solid #000',
            }}
          />
          <input
            aria-label="Volumen ambiente sonoro"
            type="range"
            min="0"
            max="100"
            value={vol}
            onChange={(e) => setVol(Number(e.target.value))}
            style={{
              position: 'absolute',
              inset: -10,
              width: 'calc(100% + 20px)',
              height: 25,
              opacity: 0,
              cursor: 'pointer',
              margin: 0,
            }}
          />
        </div>
        <span className="mono" style={{ fontSize: 10, fontWeight: 700, minWidth: 28 }}>
          {vol}%
        </span>
      </div>
    </div>
  );
}

/* ── QUICK ACCESS ROW ── */
function QuickAccess({ setSection, openBreathing }) {
  const items = [
    { icon: 'smart_toy', l: 'AURA IA', sec: 'chatbot', c: M, bg: ML },
    { icon: 'sports_esports', l: 'MINIJUEGOS', sec: 'juegos', c: T, bg: TL },
    { icon: 'book_2', l: 'DIARIO', sec: 'diario', c: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
    { icon: 'air', l: 'RESPIRACIÓN_GUIADA', sec: null, action: openBreathing, c: CR, bg: CL },
  ];
  return (
    <div className="c12" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
      {items.map(({ icon, l, sec, action, c, bg }) => (
        <button
          key={l}
          onClick={action || (() => setSection(sec))}
          style={{
            border: BORDE,
            boxShadow: SOMBRA_SM,
            background: W,
            padding: '18px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textAlign: 'left',
            transition: 'transform .1s,box-shadow .1s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = bg;
            e.currentTarget.style.transform = 'translate(-2px,-2px)';
            e.currentTarget.style.boxShadow = '10px 10px 0 0 #000';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = W;
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = SOMBRA_SM;
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: bg,
              border: `3px solid ${c}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="icon" style={{ color: c, fontSize: 20 }}>
              {icon}
            </span>
          </div>
          <span
            className="mono"
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', lineHeight: 1.3 }}
          >
            {l}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ── STREAK CARD ── */
function StreakCard() {
  const days = [1, 2, 3, 4, 5, 6, 7];
  return (
    <div className="bc c6" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.02em' }}>
          RACHA_CONSECUTIVA
        </div>
        <span className="chip chip-morado">DÍA_07_CONSECUTIVO</span>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {days.map((d) => (
          <div
            key={d}
            style={{
              flex: 1,
              height: 36,
              border: `3px solid ${K}`,
              background: d <= 7 ? M : W,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="mono" style={{ fontSize: 9, color: d <= 7 ? W : K, fontWeight: 700 }}>
              {d}
            </span>
          </div>
        ))}
      </div>
      <div className="lbl" style={{ fontSize: 9 }}>
        DÍAS_SIN_CRISIS_DE_ANSIEDAD · <span style={{ color: T }}>RÉCORD_PERSONAL: 12_DÍAS</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {['🏅 INICIO', '⚡ DÍA_3', '🌟 DÍA_7'].map((b) => (
          <div
            key={b}
            style={{
              border: '2px solid #000',
              padding: '5px 8px',
              fontSize: 9,
              fontFamily: 'Space Mono',
              background: TL,
            }}
          >
            {b}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── QUOTE CARD ── */
function QuoteCard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div
      className="c6"
      style={{
        border: BORDE,
        boxShadow: SOMBRA,
        background: DK,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div className="lbl" style={{ color: isDark ? '#fff' : 'var(--aura-fg-soft)', fontSize: 9 }}>
        FRASE_DEL_DÍA
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: isDark ? '#fff' : W,
          lineHeight: 1.45,
          letterSpacing: '-0.01em',
        }}
      >
        "LA ANSIEDAD ES LA EMOCIÓN DEL FUTURO IMAGINADO. VUELVE AL PRESENTE."
      </div>
      <div
        className="mono"
        style={{ fontSize: 9, color: isDark ? '#fff' : 'var(--aura-fg-muted)' }}
      >
        — ADAPTADO_DE_CBT · FUENTE_CLÍNICA_VALIDADA
      </div>
    </div>
  );
}

function useAchievementsData() {
  const [data, setData] = useState(emptyAchievements);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (options = {}) => {
    setLoading(true);
    setError('');
    try {
      const next = await getAchievements();
      setData(
        syncAchievementUnlockState(next, {
          notify: Boolean(options.notify),
          unlockedAfter: Date.now() - 60_000,
        }),
      );
    } catch (err) {
      setError(`ERR_ACHIEVEMENTS: ${backendErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onAchievementsUpdated = (event) => {
      if (event.detail) setData(event.detail);
    };
    window.addEventListener('aura-achievements-updated', onAchievementsUpdated);
    return () => window.removeEventListener('aura-achievements-updated', onAchievementsUpdated);
  }, []);

  return { data, loading, error, refresh };
}

function AchievementsSummaryCard({ setSection }) {
  const { data, loading, error } = useAchievementsData();
  const percent = data.total ? Math.round((data.unlocked / data.total) * 100) : 0;
  const next = data.achievements.find((achievement) => !achievement.unlocked);

  return (
    <div
      className="c12"
      style={{
        border: BORDE,
        boxShadow: SOMBRA,
        background: W,
        padding: 22,
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 18,
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="lbl lbl-morado" style={{ fontSize: 9 }}>
          SISTEMA_LOGROS · SERVER_SIDE
        </div>
        <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.03em' }}>
          {loading
            ? 'SINCRONIZANDO_LOGROS...'
            : `${data.unlocked}/${data.total} LOGROS_DESBLOQUEADOS`}
        </div>
        <div style={{ border: '3px solid #000', height: 18, background: 'var(--aura-bg-muted)' }}>
          <div
            style={{
              width: `${percent}%`,
              height: '100%',
              background: M,
              transition: 'width .2s ease',
            }}
          />
        </div>
        {error ? (
          <div
            className="mono"
            style={{ border: `3px solid ${CR}`, background: CL, padding: 10, fontSize: 10 }}
          >
            {error}
          </div>
        ) : (
          <div className="lbl" style={{ fontSize: 9 }}>
            SIGUIENTE:{' '}
            {next ? `${next.title.toUpperCase()} · ${next.progressLabel}` : 'CATALOGO_COMPLETADO'}
          </div>
        )}
      </div>
      <button
        onClick={() => setSection('logros')}
        className="btn btn-morado"
        style={{ fontSize: 10, whiteSpace: 'nowrap' }}
      >
        VER_LOGROS
      </button>
    </div>
  );
}

function AchievementsView() {
  const { data, loading, error, refresh } = useAchievementsData();

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fadeUp .3s ease' }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 28, letterSpacing: '-0.04em' }}>LOGROS_AURA</div>
          <div className="lbl" style={{ marginTop: 4, fontSize: 9 }}>
            DESBLOQUEOS_MOTIVACIONALES · {data.unlocked}/{data.total}
          </div>
        </div>
        <button onClick={() => refresh({ notify: true })} className="btn" style={{ fontSize: 10 }}>
          RECALCULAR
        </button>
      </div>

      {error && (
        <div
          className="mono"
          style={{
            border: `4px solid ${K}`,
            boxShadow: SOMBRA_SM,
            background: CL,
            padding: 14,
            fontSize: 11,
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          className="bc"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}
        >
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              style={{ border: '3px solid #000', height: 120, background: 'var(--aura-bg-muted)' }}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            gap: 14,
          }}
        >
          {data.achievements.map((achievement) => (
            <div
              key={achievement.code}
              className="bc"
              style={{
                padding: 18,
                opacity: achievement.unlocked ? 1 : 0.68,
                background: achievement.unlocked ? `${achievement.accent}22` : W,
                boxShadow: achievement.unlocked ? SOMBRA_SM : 'none',
                gap: 12,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span
                  className="chip"
                  style={{
                    borderColor: K,
                    background: achievement.accent,
                    color: achievement.unlocked ? W : K,
                  }}
                >
                  {achievement.category.toUpperCase()}
                </span>
                <span
                  className="icon"
                  style={{
                    color: achievement.unlocked ? achievement.accent : 'var(--aura-fg-muted)',
                  }}
                >
                  {achievement.unlocked ? 'workspace_premium' : 'lock'}
                </span>
              </div>
              <div style={{ fontWeight: 900, fontSize: 18, lineHeight: 1.1 }}>
                {achievement.title.toUpperCase()}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--aura-fg-muted)' }}>
                {achievement.description}
              </div>
              <div
                style={{ border: '2px solid #000', height: 12, background: 'var(--aura-bg-muted)' }}
              >
                <div
                  style={{
                    width: `${Math.min(100, Math.round((achievement.progress / achievement.target) * 100))}%`,
                    height: '100%',
                    background: achievement.accent,
                  }}
                />
              </div>
              <div className="lbl" style={{ fontSize: 9 }}>
                {achievement.unlocked
                  ? `DESBLOQUEADO · ${diaryDateLabel(achievement.unlockedAt)}`
                  : `PROGRESO · ${achievement.progressLabel}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PushOptInBanner() {
  const push = usePushNotificationState();
  if (push.loading || !push.supported || !push.enabled || push.permission === 'granted') {
    return null;
  }
  return (
    <div className="bento">
      <div
        className="bc c12"
        style={{
          background: ML,
          border: BORDE,
          boxShadow: SOMBRA_SM,
          padding: 18,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontFamily: 'Space Mono', fontWeight: 800, fontSize: 11 }}>
            RECORDATORIOS_PUSH
          </div>
          <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.5 }}>
            Activa avisos privados para mood, diario y logros. Nunca mostramos contenido sensible.
          </div>
          {push.error && (
            <div className="chip chip-coral" style={{ marginTop: 10 }}>
              {push.error}
            </div>
          )}
        </div>
        <button
          onClick={push.activate}
          disabled={push.busy}
          className="btn btn-morado"
          style={{ fontSize: 10, whiteSpace: 'nowrap' }}
        >
          {push.busy ? 'Activando...' : 'Activar notificaciones'}
        </button>
      </div>
    </div>
  );
}

function PushNotificationSettings() {
  const push = usePushNotificationState();
  const toggleLabel = push.subscribed ? 'Desactivar notificaciones' : 'Activar notificaciones';
  const togglePush = () => (push.subscribed ? push.deactivate() : push.activate());
  if (push.loading) {
    return <div className="chip">Cargando notificaciones...</div>;
  }
  if (!push.supported) {
    return <div className="chip chip-coral">Este navegador no permite notificaciones</div>;
  }
  if (!push.enabled) {
    return <div className="chip chip-coral">Notificaciones no configuradas</div>;
  }
  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <button
        onClick={togglePush}
        disabled={push.busy}
        className={push.subscribed ? 'btn btn-coral' : 'btn btn-morado'}
        style={{ alignSelf: 'flex-start', fontSize: 10 }}
      >
        {push.busy ? 'Guardando...' : toggleLabel}
      </button>
      {push.message && <div className="chip chip-turquesa">{push.message}</div>}
      {push.error && <div className="chip chip-coral">{push.error}</div>}
    </div>
  );
}

/* ── DASHBOARD VIEW ── */
function DashboardView({ setSection, openBreathing }) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'fadeUp .3s ease' }}
    >
      <PushOptInBanner />
      <div className="bento">
        <HeroBentoCard />
        <SOSBentoCard openBreathing={openBreathing} />
      </div>
      <div className="bento">
        <MoodChartCard />
        <SoundPlayerCard />
      </div>
      <div className="bento">
        <QuickAccess setSection={setSection} openBreathing={openBreathing} />
      </div>
      <div className="bento">
        <AchievementsSummaryCard setSection={setSection} />
      </div>
      <div className="bento">
        <StreakCard />
        <QuoteCard />
      </div>
    </div>
  );
}

/* ── SOS VIEW ── */
function ManualSosFallback({ contact, message = SOS_MANUAL_MESSAGE }) {
  const links = buildManualSosLinks(contact.phone, message);

  if (!links.sms && !links.whatsapp) return null;

  return (
    <div
      style={{
        border: '3px solid #000',
        background: ML,
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        maxWidth: 420,
        boxShadow: '4px 4px 0 #000',
      }}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {links.whatsapp && (
          <a
            className="btn btn-turquesa"
            href={links.whatsapp}
            target="_blank"
            rel="noreferrer"
            style={{ fontSize: 9, padding: '8px 12px', textDecoration: 'none' }}
          >
            AVISAR_WHATSAPP
          </a>
        )}
        {links.sms && (
          <a
            className="btn"
            href={links.sms}
            style={{ fontSize: 9, padding: '8px 12px', textDecoration: 'none' }}
          >
            ENVIAR_SMS
          </a>
        )}
      </div>
    </div>
  );
}

function SOSView({ openBreathing }) {
  const [contacts, setContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [sosError, setSosError] = useState('');
  const emergencyNumbers = [
    {
      label: 'EMERGENCIAS',
      number: '112',
      detail: 'RIESGO_INMEDIATO · ATENCIÓN_URGENTE',
      color: CR,
    },
    {
      label: 'LÍNEA_024',
      number: '024',
      detail: 'CONDUCTA_SUICIDA · ESPAÑA_24H',
      color: M,
    },
  ];
  const resources = [
    {
      title: 'GROUNDING_5-4-3-2-1',
      text: 'Nombra 5 cosas que ves, 4 que sientes, 3 que oyes, 2 que hueles y 1 que saboreas.',
      icon: 'psychology_alt',
    },
    {
      title: 'ANCLAJE_FÍSICO',
      text: 'Apoya ambos pies en el suelo, presiona las palmas y describe dónde estás en voz baja.',
      icon: 'self_improvement',
    },
    {
      title: 'MENSAJE_SEGURO',
      text: 'Escribe a una persona de confianza: "Necesito compañía unos minutos. ¿Puedes llamarme?".',
      icon: 'sms',
    },
  ];
  const [sent, setSent] = useState({});
  const [introActive, setIntroActive] = useState(true);
  const loadContacts = useCallback(async () => {
    setLoadingContacts(true);
    setSosError('');
    try {
      const items = await listContacts();
      setContacts(items.map(backendContactToPanel));
    } catch (err) {
      setSosError(`ERR_SOS: ${backendErrorMessage(err)}`);
    } finally {
      setLoadingContacts(false);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => setIntroActive(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);
  const sendSos = async (contact) => {
    if (!contact.available || !contact.sosAuto) return;
    setSent((current) => ({ ...current, [contact.id]: 'ENVIANDO' }));
    setSosError('');
    try {
      const alert = await triggerPanic({
        contactId: contact.id,
        contextJson: { source: 'dashboard_sos', contactName: contact.name },
      });
      const notification = alert.notifications?.find((item) => item.contactId === contact.id);
      if (notification?.status === 'FAILED') {
        setSent((current) => ({ ...current, [contact.id]: 'MANUAL_READY' }));
        setSosError(
          `ERR_SOS: ${notification.details || 'No se pudo enviar el SMS automatico. Usa el aviso manual.'}`,
        );
        return;
      }
      setSent((current) => ({
        ...current,
        [contact.id]: notification?.status === 'MOCKED' ? 'MANUAL_READY' : 'SMS_ENVIADO',
      }));
    } catch (err) {
      setSent((current) => ({ ...current, [contact.id]: 'ERROR' }));
      setSosError(`ERR_SOS: ${backendErrorMessage(err)}`);
    }
  };
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        animation: 'fadeUp .3s ease, auraSosViewSnap .62s ease-out',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.03em' }}>BOTÓN_SOS</div>
          <div className="lbl" style={{ marginTop: 4 }}>
            PROTOCOLO_DE_CONTENCIÓN_INMEDIATA
          </div>
        </div>
        <span className="chip chip-coral">NIVEL_URGENCIA_ALTO</span>
      </div>
      <div
        className="bc"
        style={{
          textAlign: 'center',
          padding: 48,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: introActive ? '12px 12px 0 0 #FB7185' : SOMBRA,
          transition: 'box-shadow .35s ease',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: CL, zIndex: 0 }} />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: '-35%',
              top: 0,
              width: '28%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.46), transparent)',
              animation: introActive ? 'auraSosScan .9s ease-out 1' : 'none',
            }}
          />
          <div
            className="mono"
            style={{
              position: 'absolute',
              top: 14,
              right: 16,
              border: '3px solid #000',
              background: introActive ? CR : W,
              color: introActive ? W : K,
              padding: '5px 10px',
              fontSize: 9,
              fontWeight: 900,
              boxShadow: '4px 4px 0 #000',
              transition: 'background .25s ease, color .25s ease',
            }}
          >
            {introActive ? 'SOS_ACTIVADO' : 'MODO_CONTENCIÓN'}
          </div>
        </div>
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 24,
          }}
        >
          <div
            className="mono"
            style={{ fontSize: 12, color: 'var(--aura-fg-muted)', letterSpacing: '0.08em' }}
          >
            PRESIONA PARA ACTIVAR RESPIRACIÓN GUIADA 4-4-6
          </div>
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: 180,
                height: 180,
                borderRadius: '50%',
                border: '3px solid ' + CR,
                animation: 'ring 2.4s ease-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                width: 180,
                height: 180,
                borderRadius: '50%',
                border: '3px solid ' + CR,
                animation: 'ring 2.4s ease-out infinite 0.9s',
              }}
            />
            <button
              onClick={openBreathing}
              style={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, #fda4af, ${CR})`,
                border: '6px solid #000',
                boxShadow: SOMBRA,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                position: 'relative',
                zIndex: 1,
                animation: introActive
                  ? 'auraSosButtonAlarm 1.05s ease-out 1, auraSosBreath 3.4s ease-in-out 1.05s infinite'
                  : 'auraSosBreath 3.4s ease-in-out infinite',
                transition: 'transform .15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.12)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              aria-label="Activar respiración guiada - Botón SOS"
            >
              <span style={{ fontSize: 40 }}>🆘</span>
              <span
                className="mono"
                style={{ fontSize: 9, color: W, fontWeight: 700, letterSpacing: '0.05em' }}
              >
                RESPIRA_CONMIGO
              </span>
            </button>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={openBreathing} className="btn btn-coral">
              RESPIRACIÓN_4-4-6 →
            </button>
            <button className="btn" style={{ background: ML, borderColor: M, color: M }}>
              GROUNDING_5-4-3-2-1 →
            </button>
          </div>
          <div style={{ border: '3px solid #000', padding: '10px 18px', background: W }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--aura-fg-muted)' }}>
              TÉCNICA_GUIADA: Inhala 4s · Sostén 4s · Exhala 6s · Vuelve al presente
            </span>
          </div>
        </div>
      </div>
      <div className="bento">
        {emergencyNumbers.map(({ label, number, detail, color }) => (
          <div
            key={number}
            className="bc c6"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              background: number === '112' ? CL : ML,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                border: BORDE,
                background: color,
                color: W,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {number}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: '-0.02em' }}>{label}</div>
              <div className="lbl" style={{ fontSize: 9, marginTop: 3 }}>
                {detail}
              </div>
            </div>
            <a
              className="btn btn-negro"
              href={`tel:${number}`}
              style={{ textDecoration: 'none', fontSize: 10 }}
            >
              LLAMAR_{number}
            </a>
          </div>
        ))}
      </div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.02em', marginBottom: 12 }}>
          CONTACTOS_DE_CONFIANZA
        </div>
        {loadingContacts && <div className="chip">CARGANDO_CONTACTOS...</div>}
        {sosError && (
          <div className="chip chip-coral" style={{ marginBottom: 10 }}>
            {sosError}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {!loadingContacts && contacts.length === 0 && (
            <div className="bc" style={{ padding: 16 }}>
              <div className="lbl">SIN_CONTACTOS_SOS</div>
              <div style={{ marginTop: 6, fontSize: 13 }}>
                Añade contactos de confianza desde la sección Contactos para poder avisar por SOS.
              </div>
            </div>
          )}
          {contacts.map(({ id, name, role, emoji, available, phone, sosAuto }) => (
            <div
              key={id}
              className="bc"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                display: 'flex',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  border: BORDE,
                  background: ML,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  flexShrink: 0,
                }}
              >
                {emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{name}</div>
                <div className="lbl" style={{ fontSize: 9, marginTop: 2 }}>
                  {role} ·{' '}
                  <span style={{ color: available && sosAuto ? T : CR }}>
                    {available && sosAuto ? 'SOS_ACTIVO' : 'NO_DISPONIBLE_PARA_SMS'}
                  </span>
                  {' · '}
                  <span>{phone}</span>
                </div>
              </div>
              <div
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}
              >
                <div
                  style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}
                >
                  <a
                    className="btn btn-negro"
                    href={`tel:${normalizePhoneForUri(phone)}`}
                    style={{ fontSize: 10, textDecoration: 'none' }}
                  >
                    LLAMAR
                  </a>
                  <button
                    onClick={() => sendSos({ id, name, role, emoji, available, phone, sosAuto })}
                    disabled={!available || !sosAuto || sent[id] === 'ENVIANDO'}
                    className={`btn ${
                      sent[id] === 'SMS_ENVIADO'
                        ? 'btn-turquesa'
                        : sent[id] === 'MANUAL_READY'
                          ? 'btn-morado'
                          : 'btn-coral'
                    }`}
                    style={{ fontSize: 10 }}
                  >
                    {sent[id] === 'ENVIANDO'
                      ? 'ENVIANDO'
                      : sent[id] === 'SMS_ENVIADO'
                        ? `✓ ${sent[id]}`
                        : sent[id] === 'MANUAL_READY'
                          ? 'ENVIAR_SOS'
                          : 'ENVIAR_SOS'}
                  </button>
                </div>
                {sent[id] === 'MANUAL_READY' && (
                  <ManualSosFallback
                    contact={{ id, name, role, emoji, available, phone, sosAuto }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.02em', marginBottom: 12 }}>
          RECURSOS_DE_CONTENCIÓN
        </div>
        <div className="bento">
          {resources.map(({ title, text, icon }) => (
            <div
              key={title}
              className="bc c4"
              style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  border: BORDE,
                  background: TL,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span className="icon" style={{ color: T }}>
                  {icon}
                </span>
              </div>
              <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: '-0.02em' }}>{title}</div>
              <div
                className="lbl"
                style={{ fontSize: 9, lineHeight: 1.6, color: 'var(--aura-fg-muted)' }}
              >
                {text}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          border: '3px solid #000',
          background: DK,
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <span className="icon" style={{ color: CR }}>
          warning
        </span>
        <span className="mono" style={{ fontSize: 10, color: W, lineHeight: 1.5 }}>
          AURA_AI_NO_SUSTITUYE_ATENCIÓN_PROFESIONAL. EN_CRISIS_LLAMA_AL_024.
        </span>
      </div>
    </div>
  );
}

/* ── CHATBOT VIEW ── */
function ChatbotView() {
  const { user } = useAuth();
  const panelUser = user ?? DEFAULT_PANEL_USER;
  const firstName = panelFirstName(panelUser.name);
  const welcomeMessage = {
    id: 'welcome',
    from: 'ai',
    text: `Hola ${firstName}. Estoy aquí contigo. ¿Cómo te sientes en este momento?`,
    riskLevel: 'low',
  };
  const [sessionId, setSessionId] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [inp, setInp] = useState('');
  const [botStatus, setBotStatus] = useState('idle');
  const [loadingSession, setLoadingSession] = useState(true);
  const [error, setError] = useState('');
  const botRef = useRef();
  const thinkingRef = useRef();
  const streamRef = useRef();
  const isBusy = botStatus !== 'idle' || loadingSession;
  const CHIPS = ['ME_SIENTO_ANSIOSO', 'NO_PUEDO_DORMIR', 'TENGO_PÁNICO', 'ESTOY_BIEN'];
  const visibleMessages = msgs.length ? msgs : [welcomeMessage];
  const activeChatStorageKey = `aura.chatbot.activeSessionId.${panelUser.id}`;
  const [sessionTitle, setSessionTitle] = useState('');
  const [chatSessions, setChatSessions] = useState([]);

  const applySession = useCallback(
    (session) => {
      setSessionId(session.id);
      setSessionTitle(session.title || 'Nueva conversación');
      setMsgs(panelMessagesFromChatSession(session));
      localStorage.setItem(activeChatStorageKey, session.id);
    },
    [activeChatStorageKey],
  );

  const refreshChatSessions = useCallback(async () => {
    const page = await listChatSessions();
    const sessions = sortChatSessions(page.content ?? []);
    setChatSessions(sessions);
    return sessions;
  }, []);

  const createFreshSession = useCallback(async () => {
    setBotStatus('idle');
    setError('');
    setLoadingSession(true);
    window.clearTimeout(thinkingRef.current);
    window.clearInterval(streamRef.current);
    try {
      const session = await createChatSession();
      applySession(session);
      setChatSessions((current) =>
        sortChatSessions([session, ...current.filter((item) => item.id !== session.id)]),
      );
      setInp('');
    } catch (err) {
      setError(`ERR_CHATBOT: ${backendErrorMessage(err)}`);
    } finally {
      setLoadingSession(false);
    }
  }, [applySession]);

  const openChatSession = useCallback(
    async (id) => {
      if (!id || id === sessionId || isBusy) return;
      setLoadingSession(true);
      setError('');
      window.clearTimeout(thinkingRef.current);
      window.clearInterval(streamRef.current);
      try {
        const session = await getChatSession(id);
        applySession(session);
      } catch (err) {
        localStorage.removeItem(activeChatStorageKey);
        setError(`ERR_CHATBOT: ${backendErrorMessage(err)}`);
      } finally {
        setLoadingSession(false);
      }
    },
    [activeChatStorageKey, applySession, isBusy, sessionId],
  );

  const deleteSelectedSession = useCallback(async () => {
    if (!sessionId || isBusy) return;
    const deletedSessionId = sessionId;
    setLoadingSession(true);
    setError('');
    setInp('');
    window.clearTimeout(thinkingRef.current);
    window.clearInterval(streamRef.current);
    try {
      await deleteChatSession(deletedSessionId);
      const remainingSessions = sortChatSessions(
        chatSessions.filter((session) => session.id !== deletedSessionId),
      );
      setChatSessions(remainingSessions);
      localStorage.removeItem(activeChatStorageKey);
      if (remainingSessions.length) {
        const nextSession = await getChatSession(remainingSessions[0].id);
        applySession(nextSession);
        return;
      }
      const freshSession = await createChatSession();
      applySession(freshSession);
      setChatSessions([freshSession]);
    } catch (err) {
      setError(`ERR_CHATBOT: ${backendErrorMessage(err)}`);
    } finally {
      setLoadingSession(false);
    }
  }, [activeChatStorageKey, applySession, chatSessions, isBusy, sessionId]);

  const streamAssistantReply = (baseMessages, assistantMessage) => {
    const aiId = assistantMessage.id ?? `ai_${Date.now()}`;
    const reply = assistantMessage.text ?? '';
    let cursor = 0;
    setBotStatus('streaming');
    setMsgs([...baseMessages, { ...assistantMessage, id: aiId, from: 'ai', text: '' }]);
    streamRef.current = window.setInterval(() => {
      cursor += 1;
      setMsgs((current) =>
        current.map((msg) => (msg.id === aiId ? { ...msg, text: reply.slice(0, cursor) } : msg)),
      );
      if (cursor >= reply.length) {
        window.clearInterval(streamRef.current);
        setBotStatus('idle');
      }
    }, 24);
  };
  const send = async (text) => {
    const t = (text ?? inp).trim();
    if (isBusy || !sessionId) return;
    const startedAt = Date.now() - 1000;
    const userId = `user_${Date.now()}`;
    const optimisticMessages = [...msgs, { id: userId, from: 'user', text: t, riskLevel: 'low' }];
    setMsgs(optimisticMessages);
    setInp('');
    setError('');
    setBotStatus('thinking');
    window.clearTimeout(thinkingRef.current);
    window.clearInterval(streamRef.current);
    try {
      const session = await sendChatMessage(sessionId, t);
      void refreshAchievementsForNotifications(startedAt);
      setSessionTitle(session.title || 'Conversación guardada');
      localStorage.setItem(activeChatStorageKey, session.id);
      setChatSessions((current) =>
        sortChatSessions([session, ...current.filter((item) => item.id !== session.id)]),
      );
      const backendMessages = panelMessagesFromChatSession(session);
      const assistantIndex = backendMessages.map((message) => message.from).lastIndexOf('ai');
      if (assistantIndex >= 0) {
        thinkingRef.current = window.setTimeout(() => {
          streamAssistantReply(
            backendMessages.slice(0, assistantIndex),
            backendMessages[assistantIndex],
          );
        }, 220);
      } else {
        setMsgs(backendMessages.length ? backendMessages : optimisticMessages);
        setBotStatus('idle');
      }
    } catch (err) {
      setError(`ERR_CHATBOT: ${backendErrorMessage(err)}`);
      setBotStatus('idle');
    }
  };
  useEffect(() => {
    let active = true;
    setLoadingSession(true);
    setError('');
    const loadPersistedSession = async () => {
      try {
        const storedSessionId = localStorage.getItem(activeChatStorageKey);
        const sessions = await refreshChatSessions();
        if (!active) return;
        if (storedSessionId) {
          try {
            const session = await getChatSession(storedSessionId);
            if (!active) return;
            applySession(session);
            return;
          } catch {
            localStorage.removeItem(activeChatStorageKey);
          }
        }
        const latestSession = sessions[0];
        if (latestSession) {
          applySession(latestSession);
          return;
        }
        const session = await createChatSession();
        if (!active) return;
        applySession(session);
        setChatSessions([session]);
      } catch (err) {
        if (active) setError(`ERR_CHATBOT: ${backendErrorMessage(err)}`);
      } finally {
        if (active) setLoadingSession(false);
      }
    };
    void loadPersistedSession();
    return () => {
      active = false;
    };
  }, [activeChatStorageKey, applySession, refreshChatSessions]);
  useEffect(() => {
    botRef.current && (botRef.current.scrollTop = botRef.current.scrollHeight);
  }, [visibleMessages, botStatus]);
  useEffect(
    () => () => {
      window.clearTimeout(thinkingRef.current);
      window.clearInterval(streamRef.current);
    },
    [],
  );
  return (
    <div
      style={{
        display: 'flex',
        gap: 14,
        height: 'calc(100vh - 156px)',
        animation: 'fadeUp .3s ease',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          border: BORDE,
          boxShadow: SOMBRA,
          background: W,
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: BORDE,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              border: BORDE,
              background: ML,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}
          >
            🤖
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: '-0.01em' }}>
              AURA · ASISTENTE_IA
            </div>
            <div className="lbl lbl-turquesa" style={{ fontSize: 9 }}>
              {sessionTitle ? `SESIÓN_GUARDADA · ${sessionTitle}` : 'DISPONIBLE_24/7 · TCC_DIGITAL'}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 18 }}>
            <button
              onClick={createFreshSession}
              disabled={isBusy}
              className="btn"
              style={{
                background: W,
                color: K,
                fontSize: 9,
                padding: '8px 10px',
                opacity: isBusy ? 0.55 : 1,
              }}
            >
              NUEVA_CONVERSACIÓN
            </button>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: T,
                animation: 'pulse 2s ease infinite',
              }}
            />
            <span className="mono" style={{ fontSize: 9, color: T }}>
              {loadingSession ? 'CONECTANDO' : botStatus !== 'idle' ? 'ESCRIBIENDO' : 'EN_LÍNEA'}
            </span>
          </div>
        </div>
        {error && (
          <div
            className="mono"
            style={{
              borderBottom: BORDE,
              background: CL,
              color: K,
              padding: '10px 16px',
              fontSize: 10,
            }}
          >
            {error}
          </div>
        )}
        <div
          ref={botRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {visibleMessages.map((m, i) => (
            <div
              key={m.id ?? i}
              style={{
                display: 'flex',
                justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  border: BORDE,
                  background: m.from === 'user' ? M : m.riskLevel === 'high' ? CL : W,
                  color: m.from === 'user' ? W : K,
                  fontSize: 14,
                  lineHeight: 1.6,
                  boxShadow: m.from === 'user' ? '4px 4px 0 0 #000' : '4px 4px 0 0 #ccc',
                }}
              >
                {m.text}
                {m.from === 'ai' && botStatus === 'streaming' && i === msgs.length - 1 && (
                  <span style={{ color: M, fontWeight: 900 }}>▌</span>
                )}
              </div>
            </div>
          ))}
          {botStatus !== 'idle' && (
            <div
              style={{
                display: 'flex',
                gap: 5,
                padding: '12px 16px',
                border: BORDE,
                background: W,
                width: 128,
                alignItems: 'center',
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    background: M,
                    display: 'block',
                    animation: `bounce 1.2s ease ${i * 0.2}s infinite`,
                  }}
                />
              ))}
              <span className="mono" style={{ fontSize: 9, color: M, marginLeft: 6 }}>
                {botStatus === 'thinking' ? 'PENSANDO' : 'STREAMING'}
              </span>
            </div>
          )}
        </div>
        <div style={{ padding: '12px 16px', borderTop: BORDE, display: 'flex', gap: 10 }}>
          <input
            value={inp}
            onChange={(e) => setInp(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="ESCRIBE_LO_QUE_SIENTES..."
            disabled={isBusy || !sessionId}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: BORDE,
              background: isBusy || !sessionId ? '#eee' : 'var(--aura-bg-soft)',
              fontFamily: 'Space Mono, monospace',
              fontSize: 11,
              color: K,
              outline: 'none',
              letterSpacing: '0.04em',
            }}
          />
          <button
            onClick={() => send()}
            className="btn btn-morado"
            disabled={isBusy || !sessionId}
            style={{ padding: '12px 16px', opacity: isBusy || !sessionId ? 0.65 : 1 }}
          >
            <span className="icon" style={{ fontSize: 18 }}>
              send
            </span>
          </button>
        </div>
      </div>
      <div style={{ width: 220, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            border: BORDE,
            background: W,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: SOMBRA_SM,
          }}
        >
          <div className="lbl" style={{ fontSize: 9 }}>
            HISTORIAL_GUARDADO
          </div>
          {loadingSession && !chatSessions.length ? (
            <div className="chip">CARGANDO_SESIONES...</div>
          ) : chatSessions.length ? (
            chatSessions.slice(0, 6).map((session) => (
              <button
                key={session.id}
                onClick={() => openChatSession(session.id)}
                disabled={isBusy || session.id === sessionId}
                style={{
                  border: session.id === sessionId ? `3px solid ${M}` : '2px solid #000',
                  padding: '8px 10px',
                  background: session.id === sessionId ? ML : W,
                  color: K,
                  cursor: isBusy || session.id === sessionId ? 'default' : 'pointer',
                  opacity: isBusy && session.id !== sessionId ? 0.55 : 1,
                  textAlign: 'left',
                  fontFamily: 'Space Mono, monospace',
                  fontSize: 9,
                  fontWeight: 800,
                  lineHeight: 1.35,
                }}
              >
                {(session.title || 'Nueva conversación').slice(0, 38)}
                <span
                  style={{
                    display: 'block',
                    marginTop: 4,
                    color: 'var(--aura-fg-soft)',
                    fontSize: 8,
                  }}
                >
                  {session.messages?.length ?? 0} MENSAJES
                </span>
              </button>
            ))
          ) : (
            <div className="chip">SIN_HISTORIAL</div>
          )}
          <button
            onClick={deleteSelectedSession}
            disabled={!sessionId || isBusy}
            className="btn btn-coral"
            style={{
              marginTop: 2,
              fontSize: 8,
              padding: '8px 10px',
              opacity: !sessionId || isBusy ? 0.55 : 1,
            }}
          >
            ELIMINAR_SESIÓN_SELECCIONADA
          </button>
        </div>
        <div
          style={{
            border: BORDE,
            background: W,
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            boxShadow: SOMBRA_SM,
          }}
        >
          <div className="lbl" style={{ fontSize: 9 }}>
            SUGERENCIAS_RÁPIDAS
          </div>
          {CHIPS.map((c) => (
            <button
              key={c}
              onClick={() => send(c)}
              disabled={isBusy || !sessionId}
              style={{
                border: '2px solid #000',
                padding: '8px 12px',
                background: W,
                cursor: isBusy || !sessionId ? 'not-allowed' : 'pointer',
                opacity: isBusy || !sessionId ? 0.55 : 1,
                textAlign: 'left',
                fontFamily: 'Space Mono, monospace',
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.04em',
                transition: 'background .1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ML)}
              onMouseLeave={(e) => (e.currentTarget.style.background = W)}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={{ border: BORDE, background: DK, padding: 14, boxShadow: SOMBRA_SM }}>
          <div
            className="mono"
            style={{ fontSize: 9, color: 'var(--aura-fg-soft)', lineHeight: 1.6 }}
          >
            AURA_AI_NO_SUSTITUYE ATENCIÓN_PROFESIONAL. EN_CRISIS_LLAMA_AL{' '}
            <span style={{ color: CR }}>024</span>.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── MOOD TRACKER VIEW ── */
function MoodTrackerView() {
  const [val, setVal] = useState(6);
  const [after, setAfter] = useState(8);
  const [range, setRange] = useState(90);
  const [sessionSaved, setSessionSaved] = useState(false);
  const [history, setHistory] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const weeks = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const data = history.slice(-range);
  const chunks = Array.from({ length: Math.ceil(data.length / 7) }, (_, i) =>
    data.slice(i * 7, i * 7 + 7),
  );
  const weekBars = chunks.slice(-12).map((chunk, i) => {
    const avgBefore = chunk.reduce((sum, d) => sum + d.before, 0) / chunk.length;
    const avgAfter = chunk.reduce((sum, d) => sum + d.after, 0) / chunk.length;
    return {
      id: `S${i + 1}`,
      before: Math.round(avgBefore * 10) / 10,
      after: Math.round(avgAfter * 10) / 10,
    };
  });
  const avgBefore = data.length
    ? Math.round((data.reduce((sum, d) => sum + d.before, 0) / data.length) * 10) / 10
    : 0;
  const avgAfter = data.length
    ? Math.round((data.reduce((sum, d) => sum + d.after, 0) / data.length) * 10) / 10
    : 0;
  const improvement = estadisticas?.count
    ? Math.round(estadisticas.improvementPercentage)
    : avgBefore
      ? Math.round(((avgBefore - avgAfter) / avgBefore) * 100)
      : 0;
  const tendencia = data.length ? etiquetaTendenciaMood(estadisticas) : 'SIN_DATOS';
  const colorTendencia = colorTendenciaMood(estadisticas);
  const getColor = (v) => (v <= 3 ? TL : v <= 5 ? 'rgba(251,191,36,0.24)' : v <= 7 ? ML : CL);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const rango = fechasRangoMood(range);
    Promise.all([
      listMoodLogs({
        size: range,
        from: rango.from,
        to: rango.to,
      }),
      getMoodStats(rango),
    ])
      .then(([page, datos]) => {
        if (!active) return;
        setHistory(
          (page.content ?? [])
            .map(backendMoodToPanel)
            .sort((a, b) => new Date(a.date) - new Date(b.date)),
        );
        setEstadisticas(datos);
      })
      .catch((err) => active && setError(`ERR_MOOD: ${backendErrorMessage(err)}`))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [range]);
  const saveSession = async () => {
    const today = new Date();
    const startedAt = Date.now() - 1000;
    setError('');
    try {
      const savedLog = await createMoodLog({
        beforeLevel: val,
        afterLevel: after,
        note: null,
        loggedAt: today.toISOString(),
      });
      const next = backendMoodToPanel(savedLog);
      setHistory((items) =>
        [...items, next].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-120),
      );
      getMoodStats(fechasRangoMood(range))
        .then(setEstadisticas)
        .catch(() => null);
      window.dispatchEvent(new CustomEvent('aura-mood-updated'));
      setSessionSaved(true);
      void refreshAchievementsForNotifications(startedAt);
      setTimeout(() => setSessionSaved(false), 1800);
    } catch (err) {
      setError(`ERR_MOOD: ${backendErrorMessage(err)}`);
    }
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp .3s ease' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.03em' }}>
            MOOD_TRACKER
          </div>
          <div className="lbl" style={{ fontSize: 9, marginTop: 4 }}>
            BACKEND_DATASET · {range}_DÍAS · BAR_CHART + HEATMAP
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
            <span
              className="chip"
              style={{ fontSize: 9, borderColor: colorTendencia, color: colorTendencia }}
            >
              TENDENCIA_{tendencia}
            </span>
            <span className="chip chip-turquesa" style={{ fontSize: 9 }}>
              MEDIA_RECIENTE_{formatoMood(estadisticas?.mediaReciente ?? avgAfter)}/10
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 0, border: BORDE }}>
          {[30, 60, 90].map((d) => (
            <button
              key={d}
              onClick={() => setRange(d)}
              style={{
                padding: '8px 13px',
                background: range === d ? K : W,
                color: range === d ? W : K,
                border: 'none',
                borderRight: d !== 90 ? '2px solid #000' : 'none',
                fontFamily: 'Space Mono',
                fontSize: 9,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="bc" style={{ gap: 14, display: 'flex', flexDirection: 'column' }}>
          <div className="lbl" style={{ fontSize: 9 }}>
            NIVEL_ANSIEDAD_ANTES · ESCALA_1-10
          </div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 36,
              letterSpacing: '-0.03em',
              color: val <= 3 ? T : val <= 6 ? '#fb923c' : CR,
            }}
          >
            {val}
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={val}
            onChange={(e) => setVal(+e.target.value)}
            style={{ width: '100%', accentColor: M, height: 6, cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }} className="lbl">
            <span>1_CALMA</span>
            <span>10_CRISIS</span>
          </div>
        </div>
        <div className="bc" style={{ gap: 14, display: 'flex', flexDirection: 'column' }}>
          <div className="lbl" style={{ fontSize: 9 }}>
            NIVEL_ANSIEDAD_DESPUÉS · ESCALA_1-10
          </div>
          <div
            style={{
              fontWeight: 900,
              fontSize: 36,
              letterSpacing: '-0.03em',
              color: after <= 3 ? T : after <= 6 ? '#fb923c' : CR,
            }}
          >
            {after}
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={after}
            onChange={(e) => setAfter(+e.target.value)}
            style={{ width: '100%', accentColor: T, height: 6, cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }} className="lbl">
            <span>1_CALMA</span>
            <span>10_CRISIS</span>
          </div>
        </div>
      </div>
      <div className="bc" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={saveSession} className="btn btn-morado" style={{ fontSize: 10 }}>
          REGISTRAR_SESIÓN →
        </button>
        <div className="lbl" style={{ flex: 1, fontSize: 9, lineHeight: 1.5 }}>
          Guarda el estado de hoy en el backend. Los logros se recalculan desde datos persistidos.
        </div>
        {loading && (
          <span className="chip chip-negro" style={{ fontSize: 9 }}>
            CARGANDO
          </span>
        )}
        {sessionSaved && (
          <span className="chip chip-turquesa" style={{ fontSize: 9 }}>
            SESIÓN_ACTUALIZADA
          </span>
        )}
      </div>
      {error && (
        <div
          className="mono"
          style={{ border: `3px solid ${CR}`, background: CL, padding: 12, fontSize: 10 }}
        >
          {error}
        </div>
      )}
      <div className="bc" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.02em' }}>
              BAR_CHART_SEMANAL
            </div>
            <div className="lbl" style={{ marginTop: 3 }}>
              PROMEDIOS_ANTES/DESPUÉS · ÚLTIMAS_{weekBars.length}_SEMANAS
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <span
              className="chip"
              style={{ fontSize: 9, borderColor: colorTendencia, color: colorTendencia }}
            >
              {tendencia}
            </span>
            <span className="chip chip-morado" style={{ fontSize: 9 }}>
              MEJORA_{improvement >= 0 ? '+' : ''}
              {improvement}%
            </span>
          </div>
        </div>
        <div
          style={{
            height: 180,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 10,
            borderLeft: '3px solid #000',
            borderBottom: '3px solid #000',
            padding: '12px 12px 0',
          }}
        >
          {weekBars.map(({ id, before, after }) => (
            <div
              key={id}
              style={{
                flex: 1,
                minWidth: 28,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div style={{ height: 130, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
                <div
                  title={`Antes: ${before}`}
                  style={{
                    width: 10,
                    height: `${before * 12}px`,
                    background: 'var(--aura-border-subtle)',
                    border: '2px solid #000',
                  }}
                />
                <div
                  title={`Después: ${after}`}
                  style={{
                    width: 10,
                    height: `${after * 12}px`,
                    background: M,
                    border: '2px solid #000',
                  }}
                />
              </div>
              <span className="mono" style={{ fontSize: 8, color: 'var(--aura-fg-muted)' }}>
                {id}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { c: 'var(--aura-border-subtle)', l: 'ANTES' },
            { c: M, l: 'DESPUÉS' },
          ].map(({ c, l }) => (
            <div key={l} className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 18, height: 8, border: '2px solid #000', background: c }} />
              {l}
            </div>
          ))}
        </div>
      </div>
      <div className="bc">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.02em' }}>
              HEATMAP_EMOCIONAL
            </div>
            <div className="lbl" style={{ marginTop: 3 }}>
              CADA_CELDA_REPRESENTA_1_DÍA · TONO_SEGÚN_NIVEL
            </div>
          </div>
          <div className="lbl" style={{ fontSize: 9 }}>
            PROMEDIO: <span style={{ color: M }}>{avgAfter}/10</span>
          </div>
        </div>
        <div
          style={{ display: 'grid', gridTemplateColumns: `repeat(7,1fr)`, gap: 4, marginBottom: 8 }}
        >
          {weeks.map((d) => (
            <div
              key={d}
              className="mono"
              style={{ fontSize: 9, textAlign: 'center', color: 'var(--aura-fg-muted)' }}
            >
              {d}
            </div>
          ))}
        </div>
        {chunks.map((row, ri) => (
          <div
            key={ri}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7,1fr)',
              gap: 4,
              marginBottom: 4,
            }}
          >
            {row.map((item, ci) => (
              <div
                key={item.id}
                style={{
                  height: 32,
                  border: '2px solid #000',
                  background: getColor(item.after),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default',
                }}
                title={`${diaryDateLabel(item.date)} · Antes ${item.before} · Después ${item.after}`}
              >
                <span className="mono" style={{ fontSize: 9, fontWeight: 700 }}>
                  {item.after}
                </span>
              </div>
            ))}
            {Array.from({ length: 7 - row.length }).map((_, i) => (
              <div key={`empty-${ri}-${i}`} style={{ height: 32 }} />
            ))}
          </div>
        ))}
      </div>
      <div className="bc" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {[
          {
            l: 'MEDIA_ANTERIOR',
            v: data.length ? `${formatoMood(estadisticas?.mediaAnterior ?? avgAfter)}/10` : '--',
            c: 'var(--aura-border-subtle)',
          },
          {
            l: 'MEDIA_RECIENTE',
            v: data.length ? `${formatoMood(estadisticas?.mediaReciente ?? avgAfter)}/10` : '--',
            c: M,
          },
          {
            l: 'DIFERENCIA_ANSIEDAD',
            v: data.length
              ? `${Number(estadisticas?.diferenciaTendencia ?? 0) >= 0 ? '+' : ''}${formatoMood(estadisticas?.diferenciaTendencia ?? 0)}`
              : '--',
            c: Number(estadisticas?.diferenciaTendencia ?? 0) > 0 ? CR : T,
          },
          {
            l: 'ALERTA_CAIDA',
            v: estadisticas?.alertaCaida ? 'SI' : 'NO',
            c: estadisticas?.alertaCaida ? CR : T,
          },
        ].map(({ l, v, c }) => (
          <div
            key={l}
            style={{
              flex: '1 1 140px',
              border: `3px solid ${K}`,
              padding: '12px 14px',
              borderTop: `6px solid ${c}`,
            }}
          >
            <div className="lbl" style={{ fontSize: 8, marginBottom: 4 }}>
              {l}
            </div>
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: '-0.02em', color: c }}>
              {v}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── BUBBLE GAME ── */
function BubbleGame() {
  const [bubbles, setBubbles] = useState(() =>
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      x: Math.random() * 82 + 4,
      y: Math.random() * 72 + 8,
      size: 24 + Math.random() * 28,
      color: [ML, TL, CL, 'rgba(251,191,36,0.2)', 'rgba(96,165,250,0.15)'][i % 5],
      popped: false,
    })),
  );
  const [score, setScore] = useState(0);
  const pop = (id) => {
    setBubbles((b) => b.map((b) => (b.id === id ? { ...b, popped: true } : b)));
    setScore((s) => s + 1);
  };
  useEffect(() => {
    if (bubbles.every((b) => b.popped))
      setTimeout(
        () =>
          setBubbles((b) =>
            b.map((b) => ({
              ...b,
              popped: false,
              x: Math.random() * 82 + 4,
              y: Math.random() * 72 + 8,
              size: 24 + Math.random() * 28,
            })),
          ),
        600,
      );
  }, [bubbles]);
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: 200,
        border: BORDE,
        overflow: 'hidden',
        background: 'var(--aura-bg-soft)',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <div
        className="mono"
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          border: '2px solid #000',
          padding: '3px 10px',
          background: W,
          fontSize: 10,
          fontWeight: 700,
        }}
      >
        {score} EXPLOTADAS
      </div>
      {bubbles.map(
        (b) =>
          !b.popped && (
            <div
              key={b.id}
              onClick={() => pop(b.id)}
              style={{
                position: 'absolute',
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size,
                borderRadius: '50%',
                background: b.color,
                border: '2px solid #000',
                cursor: 'pointer',
                animation: `float ${3 + Math.random() * 2}s ease-in-out infinite ${Math.random() * 2}s`,
                transition: 'transform .1s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ),
      )}
    </div>
  );
}

/* ── MINIJUEGOS VIEW ── */
/* ── GAME HERO VISUALS (SVG atmospheric) ── */
const GameHero = {
  arena: (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 480 200"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gh1sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>
        <linearGradient id="gh1fade" x1="0%" y1="60%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity=".95" />
        </linearGradient>
        <radialGradient id="gh1glow" cx="50%" cy="85%" r="50%">
          <stop offset="0%" stopColor="#fef9c3" stopOpacity=".6" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <rect width="480" height="200" fill="url(#gh1sky)" />
      <rect width="480" height="200" fill="url(#gh1glow)" />
      {/* Ground */}
      <ellipse cx="240" cy="195" rx="260" ry="30" fill="#e0f7fa" opacity=".5" />
      {/* Cathedral */}
      <g fill="white" opacity=".9" stroke="rgba(186,230,253,0.4)" strokeWidth=".5">
        {/* Main body */}
        <rect x="155" y="90" width="170" height="110" />
        {/* Front towers */}
        <rect x="155" y="50" width="38" height="80" />
        <rect x="287" y="50" width="38" height="80" />
        {/* Spires */}
        <polygon points="174,50 155,50 164.5,14" />
        <polygon points="174,50 193,50 164.5,14" />
        <polygon points="306,50 287,50 296.5,14" />
        <polygon points="306,50 325,50 296.5,14" />
        {/* Center nave */}
        <rect x="193" y="70" width="94" height="30" />
        {/* Rose window */}
        <circle
          cx="240"
          cy="82"
          r="10"
          fill="rgba(186,230,253,.5)"
          stroke="rgba(186,230,253,.8)"
          strokeWidth="1.5"
        />
        {/* Door arch */}
        <rect x="224" y="130" width="32" height="70" />
        <path d="M224 130 Q240 112 256 130" fill="rgba(186,230,253,.35)" />
        {/* Side windows */}
        {[175, 205, 255, 285].map((x, i) => (
          <rect key={i} x={x} y="100" width="14" height="26" rx="7" fill="rgba(186,230,253,.45)" />
        ))}
      </g>
      <rect width="480" height="200" fill="url(#gh1fade)" />
    </svg>
  ),
  cromatica: (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 480 200"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gh2bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f0c29" />
          <stop offset="50%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0d1117" />
        </linearGradient>
        <radialGradient id="gh2orb" cx="50%" cy="52%" r="28%">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity=".95" />
          <stop offset="35%" stopColor="#818cf8" stopOpacity=".55" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="gh2halo" cx="50%" cy="52%" r="55%">
          <stop offset="0%" stopColor="#6366f1" stopOpacity=".15" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <linearGradient id="gh2fade" x1="0%" y1="55%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity=".92" />
        </linearGradient>
      </defs>
      <rect width="480" height="200" fill="url(#gh2bg)" />
      <rect width="480" height="200" fill="url(#gh2halo)" />
      {/* Star field */}
      {[
        [60, 30],
        [120, 55],
        [300, 22],
        [380, 40],
        [440, 70],
        [30, 80],
        [180, 35],
        [420, 18],
        [90, 15],
        [350, 65],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r={i % 3 === 0 ? 1.5 : 0.8}
          fill="white"
          opacity={0.4 + i * 0.04}
        />
      ))}
      {/* Light beam */}
      <ellipse cx="240" cy="104" rx="22" ry="7" fill="#e0f2fe" opacity=".9" />
      <ellipse cx="240" cy="104" rx="60" ry="18" fill="url(#gh2orb)" />
      {/* Horizon line */}
      <line x1="80" y1="104" x2="160" y2="104" stroke="#c7d2fe" strokeWidth=".5" opacity=".4" />
      <line x1="320" y1="104" x2="400" y2="104" stroke="#c7d2fe" strokeWidth=".5" opacity=".4" />
      <rect width="480" height="200" fill="url(#gh2fade)" />
    </svg>
  ),
  burbujas: (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 480 200"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gh3bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="60%" stopColor="#f5d0fe" />
          <stop offset="100%" stopColor="#fecdd3" />
        </linearGradient>
        <linearGradient id="gh3fade" x1="0%" y1="55%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity=".92" />
        </linearGradient>
      </defs>
      <rect width="480" height="200" fill="url(#gh3bg)" />
      {[
        { cx: 90, cy: 70, r: 44, f: '#f0abfc', o: 0.5 },
        { cx: 240, cy: 50, r: 32, f: '#c084fc', o: 0.42 },
        { cx: 370, cy: 80, r: 54, f: '#fb7185', o: 0.42 },
        { cx: 155, cy: 140, r: 26, f: '#f9a8d4', o: 0.45 },
        { cx: 320, cy: 150, r: 38, f: '#fda4af', o: 0.4 },
        { cx: 50, cy: 155, r: 20, f: '#e879f9', o: 0.35 },
        { cx: 430, cy: 45, r: 28, f: '#c084fc', o: 0.4 },
        { cx: 450, cy: 155, r: 22, f: '#fb7185', o: 0.3 },
        { cx: 200, cy: 100, r: 18, f: '#f0abfc', o: 0.38 },
        { cx: 280, cy: 95, r: 15, f: '#818cf8', o: 0.35 },
      ].map(({ cx, cy, r, f, o }, i) => (
        <g key={i}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={f}
            opacity={o}
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity=".5"
          />
          <ellipse
            cx={cx - r * 0.28}
            cy={cy - r * 0.32}
            rx={r * 0.2}
            ry={r * 0.12}
            fill="white"
            opacity=".4"
          />
        </g>
      ))}
      <rect width="480" height="200" fill="url(#gh3fade)" />
    </svg>
  ),
  memoria: (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 480 200"
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="gh4bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f5f3ff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </linearGradient>
        <linearGradient id="gh4fade" x1="0%" y1="55%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="white" stopOpacity=".92" />
        </linearGradient>
      </defs>
      <rect width="480" height="200" fill="url(#gh4bg)" />
      {/* Grid of tiles */}
      {[
        ['#a855f7', '#2dd4bf', '#fb7185', '#818cf8', '#34d399'],
        ['#2dd4bf', '#fb7185', '#a855f7', '#34d399', '#818cf8'],
        ['#818cf8', '#a855f7', '#2dd4bf', '#fb7185', '#34d399'],
      ].map((row, ri) =>
        row.map((col, ci) => {
          const show = [
            [1, 0, 1, 1, 0],
            [0, 1, 1, 0, 1],
            [1, 1, 0, 1, 0],
          ][ri][ci];
          return show ? (
            <rect
              key={`${ri}-${ci}`}
              x={80 + ci * 66}
              y={20 + ri * 55}
              width={52}
              height={42}
              fill={col}
              opacity=".38"
              stroke="white"
              strokeWidth="2.5"
            />
          ) : null;
        }),
      )}
      {/* Highlight one */}
      <rect
        x={80 + 2 * 66}
        y={20}
        width={52}
        height={42}
        fill="#a855f7"
        opacity=".65"
        stroke="#000"
        strokeWidth="2"
      />
      <rect width="480" height="200" fill="url(#gh4fade)" />
    </svg>
  ),
};

function MinijuegosView() {
  const [active, setActive] = useState(null);

  const juegos = [
    {
      id: 'arena',
      hero: 'arena',
      chips: [
        { l: 'SIN_GAME_OVER', c: T, bg: TL },
        { l: 'DURACIÓN_SUGERIDA: 5_MIN', c: 'var(--aura-fg-muted)', bg: 'var(--aura-bg-muted)' },
      ],
      title: 'PINTURA_CON_ARENA',
      desc: 'Flujos cromáticos interactivos para enraizar tu atención en el momento presente.',
      cta: 'COMENZAR_VIAJE →',
      btnBg: T,
      btnColor: K,
    },
    {
      id: 'cromatica',
      hero: 'cromatica',
      chips: [
        { l: 'SIN_GAME_OVER', c: M, bg: ML },
        { l: 'DURACIÓN_SUGERIDA: 10_MIN', c: 'var(--aura-fg-muted)', bg: 'var(--aura-bg-muted)' },
      ],
      title: 'ORDENACIÓN_CROMÁTICA',
      desc: 'Organiza gradientes suaves para estructurar tus pensamientos caóticos.',
      cta: 'EXPLORAR_ARMONÍA →',
      btnBg: M,
      btnColor: W,
    },
    {
      id: 'burbujas',
      hero: 'burbujas',
      chips: [
        { l: 'SIN_GAME_OVER', c: CR, bg: CL },
        { l: 'FLUJO_INFINITO', c: 'var(--aura-fg-muted)', bg: 'var(--aura-bg-muted)' },
      ],
      title: 'EXPLOTAR_BURBUJAS',
      desc: 'Estímulo táctil de baja carga cognitiva. Sin consecuencias. Solo desahogo.',
      cta: 'LIBERAR_TENSIÓN →',
      btnBg: CR,
      btnColor: W,
    },
    {
      id: 'memoria',
      hero: 'memoria',
      chips: [
        { l: 'BASADO_EN_EVIDENCIA', c: M, bg: ML },
        { l: 'DURACIÓN_SUGERIDA: 8_MIN', c: 'var(--aura-fg-muted)', bg: 'var(--aura-bg-muted)' },
      ],
      title: 'MEMORIA_VISUAL',
      desc: 'Vacuna cognitiva para pensamientos intrusivos. Redirige el foco con suavidad.',
      cta: 'EXPLORAR_CALMA →',
      btnBg: K,
      btnColor: W,
    },
  ];

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 28, animation: 'fadeUp .3s ease' }}
    >
      {/* Header */}
      <div>
        <div
          style={{
            fontWeight: 900,
            fontSize: 34,
            letterSpacing: '-0.04em',
            lineHeight: 1.05,
            fontFamily: 'Inter,sans-serif',
          }}
        >
          REFUGIO_LÚDICO<span style={{ color: M }}>.</span>
        </div>
        <div
          style={{
            fontSize: 14,
            color: 'var(--aura-fg-muted)',
            marginTop: 10,
            maxWidth: 520,
            lineHeight: 1.75,
          }}
        >
          Ejercicios interactivos diseñados para reducir la carga cognitiva y promover la calma
          activa. Sin puntuaciones. Sin presión.
        </div>
      </div>

      {/* 2-col bento grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {juegos.map(({ id, hero, chips, title, desc, cta, btnBg, btnColor }) => (
          <div
            key={id}
            style={{
              border: BORDE,
              boxShadow: SOMBRA,
              background: W,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'transform .12s,box-shadow .12s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translate(-3px,-3px)';
              e.currentTarget.style.boxShadow = '12px 12px 0 0 #000';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = '';
              e.currentTarget.style.boxShadow = SOMBRA;
            }}
          >
            {/* Hero image */}
            <div
              style={{
                height: 200,
                overflow: 'hidden',
                borderBottom: BORDE,
                flexShrink: 0,
                position: 'relative',
              }}
            >
              {GameHero[hero]}
            </div>
            {/* Card body */}
            <div
              style={{
                padding: '20px 22px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
                flex: 1,
              }}
            >
              {/* Chips */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {chips.map(({ l, c, bg }) => (
                  <span
                    key={l}
                    style={{
                      border: `2px solid ${K}`,
                      padding: '3px 10px',
                      fontFamily: 'Space Mono,monospace',
                      fontSize: 9,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      background: bg,
                      color: c,
                    }}
                  >
                    {l}
                  </span>
                ))}
              </div>
              {/* Title */}
              <div
                style={{
                  fontWeight: 900,
                  fontSize: 19,
                  letterSpacing: '-0.025em',
                  lineHeight: 1.1,
                }}
              >
                {title}
              </div>
              {/* Desc */}
              <div
                style={{ fontSize: 13, color: 'var(--aura-fg-muted)', lineHeight: 1.75, flex: 1 }}
              >
                {desc}
              </div>
              {/* CTA */}
              <button
                onClick={() => {
                  const opening = active !== id;
                  setActive(opening ? id : null);
                  if (opening) fireAchievementEvent('MINIGAME_OPENED', { game: id });
                }}
                style={{
                  border: BORDE,
                  boxShadow: SOMBRA_SM,
                  padding: '13px 20px',
                  background: active === id ? 'var(--aura-bg-muted)' : btnBg,
                  color: active === id ? K : btnColor,
                  fontFamily: 'Space Mono,monospace',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform .1s,box-shadow .1s',
                  alignSelf: 'flex-start',
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.transform = 'translate(4px,4px)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = SOMBRA_SM;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = SOMBRA_SM;
                }}
              >
                {active === id ? 'CERRAR_SESIÓN ×' : cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Game modal overlay */}
      {active && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(8px)',
            zIndex: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
          }}
          onClick={() => setActive(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 860,
              maxHeight: '90vh',
              overflowY: 'auto',
              animation: 'fadeUp .25s ease',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <GamePanel id={active} onClose={() => setActive(null)} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════
   GAME COMPONENTS
══════════════════════════════════════ */

function GamePanel({ id, onClose }) {
  const titles = {
    arena: 'PINTURA_CON_ARENA',
    cromatica: 'ORDENACIÓN_CROMÁTICA',
    burbujas: 'EXPLOTAR_BURBUJAS',
    memoria: 'MEMORIA_VISUAL',
  };
  const subs = {
    arena: 'SIN_GAME_OVER · FLUJO_LIBRE · ENRAIZAMIENTO',
    cromatica: 'SIN_GAME_OVER · ORDEN_SUAVE · CLARIDAD_MENTAL',
    burbujas: 'SIN_PRESIÓN · FLUJO_INFINITO · SOLO_DESAHOGO',
    memoria: 'SIN_TIMER · PARES_SUAVES · FOCO_COGNITIVO',
  };
  return (
    <div
      style={{
        border: BORDE,
        boxShadow: SOMBRA,
        background: W,
        overflow: 'hidden',
        animation: 'fadeUp .3s ease',
      }}
    >
      <div
        style={{
          padding: '16px 22px',
          borderBottom: BORDE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--aura-bg-soft)',
        }}
      >
        <div>
          <div style={{ fontWeight: 900, fontSize: 15, letterSpacing: '-0.02em' }}>
            {titles[id]}
          </div>
          <div className="lbl" style={{ fontSize: 9, color: 'var(--aura-fg-soft)', marginTop: 3 }}>
            {subs[id]}
          </div>
        </div>
        <button onClick={onClose} className="btn" style={{ fontSize: 10, padding: '8px 14px' }}>
          CERRAR ×
        </button>
      </div>
      <div style={{ padding: 24 }}>
        {id === 'arena' && <GameArena />}
        {id === 'cromatica' && <GameCromatica />}
        {id === 'burbujas' && <GameBurbujas />}
        {id === 'memoria' && <GameMemoria />}
      </div>
    </div>
  );
}

/* ── GAME 1: PINTURA CON ARENA ── */
function GameArena() {
  const canvasRef = useRef();
  const painting = useRef(false);
  const lastPos = useRef(null);
  const [color, setColor] = useState('#2DD4BF');
  const [size, setSize] = useState(18);
  const [mode, setMode] = useState('sand');

  const COLORS = [
    '#2DD4BF',
    '#A855F7',
    '#FB7185',
    '#FBBF24',
    '#60A5FA',
    '#34D399',
    '#F472B6',
    '#818CF8',
  ];

  const getPos = (e, canvas) => {
    const r = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - r.left, y: src.clientY - r.top };
  };

  const draw = (e) => {
    if (!painting.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    if (mode === 'sand') {
      // Sand particles
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * size;
        const px = pos.x + Math.cos(angle) * dist;
        const py = pos.y + Math.sin(angle) * dist;
        const s = Math.random() * 3 + 1;
        ctx.globalAlpha = Math.random() * 0.6 + 0.2;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(px, py, s, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (mode === 'flow') {
      if (lastPos.current) {
        ctx.globalAlpha = 0.55;
        ctx.strokeStyle = color;
        ctx.lineWidth = size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      }
    } else {
      // Watercolor blobs
      const grad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, size * 1.5);
      grad.addColorStop(0, color + 'cc');
      grad.addColorStop(1, color + '00');
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    lastPos.current = pos;
  };

  const start = (e) => {
    painting.current = true;
    lastPos.current = null;
    draw(e);
  };
  const stop = () => {
    painting.current = false;
    lastPos.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    // Set actual pixel dimensions
    canvas.width = canvas.offsetWidth || 860;
    canvas.height = canvas.offsetHeight || 340;
  }, []);

  const modes = [
    { id: 'sand', l: 'ARENA', c: T },
    { id: 'flow', l: 'FLUJO', c: M },
    { id: 'water', l: 'ACUARELA', c: CR },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 0, border: BORDE }}>
          {modes.map(({ id, l, c }) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              style={{
                padding: '8px 14px',
                background: mode === id ? c : W,
                color: mode === id ? (mode === 'sand' ? K : W) : K,
                border: 'none',
                borderRight: id !== 'water' ? '2px solid #000' : 'none',
                fontFamily: 'Space Mono,monospace',
                fontSize: 9,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              {l}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 28,
                height: 28,
                background: c,
                border: `3px solid ${color === c ? K : 'transparent'}`,
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: color === c ? SOMBRA_SM : 'none',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span className="lbl" style={{ fontSize: 9 }}>
            TAMAÑO
          </span>
          <input
            type="range"
            min="6"
            max="40"
            value={size}
            onChange={(e) => setSize(+e.target.value)}
            style={{ width: 80, accentColor: M, cursor: 'pointer' }}
          />
          <button onClick={clear} className="btn" style={{ fontSize: 9, padding: '7px 12px' }}>
            LIMPIAR
          </button>
        </div>
      </div>
      {/* Canvas */}
      <div
        style={{
          border: BORDE,
          background: 'var(--aura-bg)',
          cursor: 'crosshair',
          userSelect: 'none',
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: 340, touchAction: 'none' }}
          onMouseDown={start}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={start}
          onTouchMove={draw}
          onTouchEnd={stop}
        />
        <div
          className="lbl"
          style={{
            position: 'absolute',
            bottom: 10,
            right: 12,
            fontSize: 9,
            color: '#bbb',
            fontFamily: 'Space Mono,monospace',
          }}
        >
          LIENZO_INFINITO · SIN_ERRORES
        </div>
      </div>
      <div
        className="lbl"
        style={{ fontSize: 9, color: 'var(--aura-fg-subtle)', textAlign: 'center' }}
      >
        Dibuja libremente. No hay manera de hacerlo mal.
      </div>
    </div>
  );
}

/* ── GAME 2: ORDENACIÓN CROMÁTICA ── */
function GameCromatica() {
  const makeSwatches = () => {
    const hues = [0, 30, 60, 120, 180, 210, 260, 300, 330, 15];
    const base = hues.map((h, i) => ({
      id: i,
      h,
      label: `H${String(h).padStart(3, '0')}`,
      color: `hsl(${h},65%,62%)`,
    }));
    // Shuffle
    for (let i = base.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [base[i], base[j]] = [base[j], base[i]];
    }
    return base;
  };
  const [swatches, setSwatches] = useState(makeSwatches);
  const [drag, setDrag] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [solved, setSolved] = useState(false);
  const [moves, setMoves] = useState(0);
  const [pops, setPops] = useState({});

  const checkSorted = (arr) => {
    for (let i = 0; i < arr.length - 1; i++) if (arr[i].h > arr[i + 1].h) return false;
    return true;
  };

  const drop = (toIdx) => {
    if (drag === null || drag === toIdx) {
      setDrag(null);
      setDragOver(null);
      return;
    }
    const arr = [...swatches];
    const item = arr.splice(drag, 1)[0];
    arr.splice(toIdx, 0, item);
    setSwatches(arr);
    setMoves((m) => m + 1);
    setDrag(null);
    setDragOver(null);
    // pop feedback
    setPops((p) => ({ ...p, [toIdx]: Date.now() }));
    setTimeout(
      () =>
        setPops((p) => {
          const n = { ...p };
          delete n[toIdx];
          return n;
        }),
      400,
    );
    if (checkSorted(arr)) setSolved(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="lbl" style={{ fontSize: 9 }}>
          ARRASTRA_Y_ORDENA_POR_MATIZ · DE_ROJO_A_PÚRPURA
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 10, color: 'var(--aura-fg-muted)' }}>
            MOVIMIENTOS: {moves}
          </span>
          <button
            onClick={() => {
              setSwatches(makeSwatches());
              setSolved(false);
              setMoves(0);
            }}
            className="btn"
            style={{ fontSize: 9, padding: '7px 12px' }}
          >
            BARAJAR
          </button>
        </div>
      </div>

      {solved && (
        <div
          style={{
            border: `4px solid ${T}`,
            background: TL,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
          }}
        >
          <span style={{ fontSize: 24 }}>🌈</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.01em', color: T }}>
              ARMONÍA_COMPLETADA
            </div>
            <div className="lbl" style={{ fontSize: 9, marginTop: 2 }}>
              En {moves} movimientos · La calma tiene su propio orden
            </div>
          </div>
          <button
            onClick={() => {
              setSwatches(makeSwatches());
              setSolved(false);
              setMoves(0);
            }}
            className="btn btn-turquesa"
            style={{ marginLeft: 'auto', fontSize: 10 }}
          >
            VOLVER_A_JUGAR
          </button>
        </div>
      )}

      {/* Swatch row */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        {swatches.map((sw, i) => (
          <div
            key={sw.id}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(i);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => drop(i)}
            onDragEnd={() => {
              setDrag(null);
              setDragOver(null);
            }}
            style={{
              flex: 1,
              height: drag === i ? 90 : dragOver === i ? 110 : 80,
              background: sw.color,
              border: `3px solid ${dragOver === i ? K : 'transparent'}`,
              cursor: 'grab',
              transition: 'height .2s ease,transform .15s',
              transform: drag === i ? 'scale(0.92)' : pops[i] ? 'scale(1.08)' : 'scale(1)',
              boxShadow: drag === i ? 'none' : dragOver === i ? SOMBRA_SM : 'none',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              paddingBottom: 6,
              userSelect: 'none',
            }}
          >
            <span
              style={{
                fontFamily: 'Space Mono,monospace',
                fontSize: 8,
                color: 'rgba(255,255,255,.8)',
                fontWeight: 700,
                textShadow: '0 1px 3px rgba(0,0,0,.3)',
              }}
            >
              {sw.label}
            </span>
          </div>
        ))}
      </div>

      {/* Reference gradient */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="lbl" style={{ fontSize: 9, color: '#aaa' }}>
          GRADIENTE_OBJETIVO
        </div>
        <div
          style={{
            height: 16,
            border: BORDE,
            background:
              'linear-gradient(to right,hsl(0,65%,62%),hsl(30,65%,62%),hsl(60,65%,62%),hsl(120,65%,62%),hsl(180,65%,62%),hsl(210,65%,62%),hsl(260,65%,62%),hsl(300,65%,62%),hsl(330,65%,62%),hsl(355,65%,62%))',
          }}
        />
      </div>
      <div
        className="lbl"
        style={{ fontSize: 9, color: 'var(--aura-fg-subtle)', textAlign: 'center' }}
      >
        No hay puntuación. Solo la satisfacción de ver el arco iris ordenarse.
      </div>
    </div>
  );
}

/* ── GAME 3: EXPLOTAR BURBUJAS (enhanced) ── */
function GameBurbujas() {
  const mkBubble = (id) => ({
    id,
    x: 5 + Math.random() * 88,
    y: 5 + Math.random() * 85,
    size: 22 + Math.random() * 34,
    color: ['#f0abfc', '#c084fc', '#fb7185', '#2dd4bf', '#818cf8', '#fda4af', '#a5f3fc', '#fbbf24'][
      Math.floor(Math.random() * 8)
    ],
    speed: 2 + Math.random() * 2,
    phase: Math.random() * Math.PI * 2,
    popped: false,
    popping: false,
  });
  const [bubbles, setBubbles] = useState(() => Array.from({ length: 18 }, (_, i) => mkBubble(i)));
  const [score, setScore] = useState(0);
  const [ripples, setRipples] = useState([]);
  const nextId = useRef(18);
  const rafRef = useRef();
  const t = useRef(0);

  // Gentle float animation
  useEffect(() => {
    const tick = () => {
      t.current += 0.012;
      setBubbles((bs) =>
        bs.map((b) =>
          b.popped
            ? b
            : {
                ...b,
                y: b.y + Math.sin(t.current * b.speed + b.phase) * 0.018,
                x: b.x + Math.cos(t.current * b.speed * 0.7 + b.phase) * 0.009,
              },
        ),
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const pop = (id, e) => {
    const rect = e.currentTarget.closest('[data-arena]').getBoundingClientRect();
    const bRect = e.currentTarget.getBoundingClientRect();
    const rx = ((bRect.left + bRect.width / 2 - rect.left) / rect.width) * 100;
    const ry = ((bRect.top + bRect.height / 2 - rect.top) / rect.height) * 100;
    const rid = Date.now();
    setRipples((r) => [
      ...r,
      { id: rid, x: rx, y: ry, color: bubbles.find((b) => b.id === id)?.color || '#c084fc' },
    ]);
    setTimeout(() => setRipples((r) => r.filter((x) => x.id !== rid)), 700);
    setBubbles((bs) => bs.map((b) => (b.id === id ? { ...b, popping: true } : b)));
    setScore((s) => s + 1);
    setTimeout(() => {
      setBubbles((bs) => {
        const filtered = bs.filter((b) => b.id !== id);
        const newB = mkBubble(nextId.current++);
        return [...filtered, { ...newB, popped: false }];
      });
    }, 300);
  };

  const activeBubbles = bubbles.filter((b) => !b.popped && !b.popping);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="lbl" style={{ fontSize: 9 }}>
          TOCA_LAS_BURBUJAS · FLUJO_INFINITO
        </span>
        <span className="mono" style={{ fontSize: 11, fontWeight: 700 }}>
          {score} <span style={{ fontWeight: 400, color: '#999' }}>LIBERADAS</span>
        </span>
      </div>
      <div
        data-arena
        style={{
          position: 'relative',
          height: 320,
          border: BORDE,
          overflow: 'hidden',
          background: 'linear-gradient(135deg,#fce7f3,#f5d0fe 50%,#fecdd3)',
          cursor: 'default',
          userSelect: 'none',
        }}
      >
        {/* Ripple effects */}
        {ripples.map(({ id, x, y, color }) => (
          <div
            key={id}
            style={{
              position: 'absolute',
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%,-50%)',
              width: 60,
              height: 60,
              borderRadius: '50%',
              border: `3px solid ${color}`,
              animation: 'ring .7s ease-out forwards',
              pointerEvents: 'none',
            }}
          />
        ))}
        {activeBubbles.map((b) => (
          <div
            key={b.id}
            onClick={(e) => pop(b.id, e)}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size,
              borderRadius: '50%',
              background: b.color,
              border: '2px solid rgba(255,255,255,.6)',
              cursor: 'pointer',
              transition: 'transform .1s',
              boxShadow: `inset -${b.size * 0.15}px -${b.size * 0.1}px ${b.size * 0.3}px rgba(255,255,255,.4), 0 2px 12px ${b.color}55`,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.18)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            {/* Highlight gloss */}
            <div
              style={{
                position: 'absolute',
                top: '18%',
                left: '20%',
                width: '30%',
                height: '20%',
                borderRadius: '50%',
                background: 'rgba(255,255,255,.55)',
                transform: 'rotate(-30deg)',
              }}
            />
          </div>
        ))}
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 12,
            fontFamily: 'Space Mono,monospace',
            fontSize: 9,
            color: 'rgba(0,0,0,.25)',
          }}
        >
          SIN_GAME_OVER · INFINITO
        </div>
      </div>
      <div
        className="lbl"
        style={{ fontSize: 9, color: 'var(--aura-fg-subtle)', textAlign: 'center' }}
      >
        Las burbujas siempre vuelven. No hay manera de perder.
      </div>
    </div>
  );
}

/* ── GAME 4: MEMORIA VISUAL ── */
function GameMemoria() {
  const PAIRS = [
    { id: 'a', color: '#2DD4BF', label: 'TURQUESA' },
    { id: 'b', color: '#A855F7', label: 'AMATISTA' },
    { id: 'c', color: '#FB7185', label: 'CORAL' },
    { id: 'd', color: '#FBBF24', label: 'ÁMBAR' },
    { id: 'e', color: '#60A5FA', label: 'ZAFIRO' },
    { id: 'f', color: '#34D399', label: 'JADE' },
    { id: 'g', color: '#F472B6', label: 'ROSA' },
    { id: 'h', color: '#818CF8', label: 'LAVANDA' },
  ];
  const mkCards = () => {
    const c = [...PAIRS, ...PAIRS].map((p, i) => ({
      uid: i,
      ...p,
      flipped: false,
      matched: false,
    }));
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  };
  const [cards, setCards] = useState(mkCards);
  const [sel, setSel] = useState([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [checking, setChecking] = useState(false);
  const [done, setDone] = useState(false);

  const flip = (uid) => {
    if (checking) return;
    const card = cards.find((c) => c.uid === uid);
    if (!card || card.flipped || card.matched) return;
    const newSel = [...sel, uid];
    setCards((cs) => cs.map((c) => (c.uid === uid ? { ...c, flipped: true } : c)));
    if (newSel.length === 2) {
      setMoves((m) => m + 1);
      setChecking(true);
      setSel([]);
      const [a, b] = newSel.map((uid) => cards.find((c) => c.uid === uid));
      if (a.id === b.id) {
        setTimeout(() => {
          setCards((cs) => cs.map((c) => (newSel.includes(c.uid) ? { ...c, matched: true } : c)));
          setMatches((m) => {
            const nm = m + 1;
            if (nm === PAIRS.length) setDone(true);
            return nm;
          });
          setChecking(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((cs) => cs.map((c) => (newSel.includes(c.uid) ? { ...c, flipped: false } : c)));
          setChecking(false);
        }, 900);
      }
    } else {
      setSel(newSel);
    }
  };

  const reset = () => {
    setCards(mkCards());
    setSel([]);
    setMoves(0);
    setMatches(0);
    setDone(false);
    setChecking(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          <span className="mono" style={{ fontSize: 10 }}>
            PARES:{' '}
            <span style={{ color: M, fontWeight: 700 }}>
              {matches}/{PAIRS.length}
            </span>
          </span>
          <span className="mono" style={{ fontSize: 10 }}>
            TURNOS: <span style={{ fontWeight: 700 }}>{moves}</span>
          </span>
        </div>
        <button onClick={reset} className="btn" style={{ fontSize: 9, padding: '7px 12px' }}>
          NUEVA_PARTIDA
        </button>
      </div>

      {done && (
        <div
          style={{
            border: `4px solid ${M}`,
            background: ML,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            animation: 'fadeUp .3s ease',
          }}
        >
          <span style={{ fontSize: 24 }}>✨</span>
          <div>
            <div style={{ fontWeight: 900, fontSize: 14, color: M }}>MEMORIA_COMPLETADA</div>
            <div className="lbl" style={{ fontSize: 9, marginTop: 2 }}>
              En {moves} turnos · Tu mente encontró el patrón
            </div>
          </div>
          <button
            onClick={reset}
            className="btn btn-morado"
            style={{ marginLeft: 'auto', fontSize: 10 }}
          >
            VOLVER_A_JUGAR
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {cards.map(({ uid, id, color, label, flipped, matched }) => (
          <div
            key={uid}
            onClick={() => flip(uid)}
            style={{
              height: 72,
              cursor: flipped || matched ? 'default' : 'pointer',
              perspective: 600,
              position: 'relative',
            }}
          >
            {/* Back */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                border: BORDE,
                background: flipped || matched ? color : '#1a1a1a',
                boxShadow: matched
                  ? `4px 4px 0 0 ${color}`
                  : flipped
                    ? SOMBRA_SM
                    : '4px 4px 0 0 #555',
                transition: 'background .25s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                opacity: matched ? 0.85 : 1,
              }}
            >
              {flipped || matched ? (
                <>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,.35)',
                      border: '2px solid rgba(255,255,255,.6)',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'Space Mono,monospace',
                      fontSize: 8,
                      color: 'rgba(255,255,255,.9)',
                      fontWeight: 700,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {label}
                  </span>
                </>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,8px)', gap: 3 }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: 8,
                        height: 8,
                        background: 'rgba(255,255,255,.12)',
                        border: '1px solid rgba(255,255,255,.08)',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div
        className="lbl"
        style={{ fontSize: 9, color: 'var(--aura-fg-subtle)', textAlign: 'center' }}
      >
        Sin timer. Sin presión. El cerebro encuentra los pares cuando está en calma.
      </div>
    </div>
  );
}

/* ── SONIDOS VIEW ── */
const soundModeGain = (mode) => (mode === 'DORMIR' ? 0.55 : mode === 'MEDITAR' ? 0.72 : 0.82);

function createNoiseBuffer(ctx, type) {
  const seconds = 3;
  const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let brown = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = Math.random() * 2 - 1;
    if (type === 'brown') {
      brown = (brown + 0.02 * white) / 1.02;
      data[i] = brown * 3.5;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

function attachFilter(ctx, source, soundId) {
  const filter = ctx.createBiquadFilter();
  if (soundId === 'lluvia') {
    filter.type = 'bandpass';
    filter.frequency.value = 2400;
    filter.Q.value = 0.8;
  } else if (soundId === 'oceano') {
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.5;
  } else if (soundId === 'bosque') {
    filter.type = 'bandpass';
    filter.frequency.value = 1800;
    filter.Q.value = 1.2;
  } else if (soundId === 'cafe') {
    filter.type = 'bandpass';
    filter.frequency.value = 650;
    filter.Q.value = 0.7;
  } else {
    filter.type = 'lowpass';
    filter.frequency.value = soundId === 'marron' ? 520 : 3600;
    filter.Q.value = 0.4;
  }
  source.connect(filter);
  return filter;
}

function startGeneratedSound(soundId, mode, volume) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    return { stop: () => undefined, setVolume: () => undefined };
  }
  let ctx;
  try {
    ctx = AudioCtx();
  } catch {
    ctx = new AudioCtx();
  }
  if (typeof ctx.resume === 'function') {
    ctx.resume().catch(() => undefined);
  }
  const master = ctx.createGain();
  master.gain.value = Math.max(0, Math.min(1, volume / 100)) * soundModeGain(mode) * 0.24;
  master.connect(ctx.destination);
  const nodes = [];

  if (soundId === '432hz' || soundId === '528hz') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = soundId === '432hz' ? 432 : 528;
    const pad = ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = soundId === '432hz' ? 216 : 264;
    const padGain = ctx.createGain();
    padGain.gain.value = 0.28;
    osc.connect(master);
    pad.connect(padGain);
    padGain.connect(master);
    osc.start();
    pad.start();
    nodes.push(osc, pad);
  } else {
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, soundId === 'marron' ? 'brown' : 'white');
    source.loop = true;
    const filter = attachFilter(ctx, source, soundId);
    filter.connect(master);
    source.start();
    nodes.push(source);

    if (soundId === 'oceano') {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.16;
      lfoGain.gain.value = 260;
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();
      nodes.push(lfo);
    }
  }

  return {
    setVolume: (nextVolume) => {
      master.gain.setTargetAtTime(
        Math.max(0, Math.min(1, nextVolume / 100)) * soundModeGain(mode) * 0.24,
        ctx.currentTime,
        0.05,
      );
    },
    stop: () => {
      nodes.forEach((node) => {
        try {
          node.stop();
        } catch {
          // Already stopped.
        }
      });
      ctx.close().catch(() => undefined);
    },
  };
}

function SonidosView() {
  const [playing, setPlaying] = useState(null);
  const [vol, setVol] = useState(70);
  const [modo, setModo] = useState('FOCO');
  const audioRef = useRef(null);
  const ambientes = [
    { id: 'lluvia', icon: '🌧️', l: 'LLUVIA_SUAVE', dur: '∞' },
    { id: 'oceano', icon: '🌊', l: 'OCÉANO', dur: '∞' },
    { id: 'bosque', icon: '🌿', l: 'BOSQUE', dur: '∞' },
    { id: 'blanco', icon: '〰️', l: 'RUIDO_BLANCO', dur: '∞' },
    { id: 'marron', icon: '🟫', l: 'RUIDO_MARRÓN', dur: '∞' },
    { id: '432hz', icon: '🔮', l: 'BINAURAL_432Hz', dur: '∞' },
    { id: '528hz', icon: '✨', l: 'FRECUENCIA_528Hz', dur: '∞' },
    { id: 'cafe', icon: '☕', l: 'CAFÉ_AMBIENTE', dur: '∞' },
  ];
  const modos = ['FOCO', 'DORMIR', 'MEDITAR'];
  useEffect(() => {
    audioRef.current?.stop();
    audioRef.current = null;
    if (playing) {
      audioRef.current = startGeneratedSound(playing, modo, vol);
    }
    return () => {
      audioRef.current?.stop();
      audioRef.current = null;
    };
  }, [playing, modo]);
  useEffect(() => {
    audioRef.current?.setVolume(vol);
  }, [vol]);
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp .3s ease' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.03em' }}>
          AMBIENTES_SONOROS
        </div>
        <span className="chip chip-negro" style={{ fontSize: 9 }}>
          WEB_AUDIO · SIN_TRACKING
        </span>
        <div style={{ display: 'flex', gap: 0, border: BORDE }}>
          {modos.map((m) => (
            <button
              key={m}
              onClick={() => setModo(m)}
              style={{
                padding: '8px 14px',
                background: modo === m ? K : W,
                color: modo === m ? W : K,
                border: 'none',
                borderRight: m !== 'MEDITAR' ? '2px solid #000' : 'none',
                fontFamily: 'Space Mono',
                fontSize: 9,
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.05em',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        {ambientes.map(({ id, icon, l, dur }) => (
          <button
            key={id}
            onClick={() =>
              setPlaying((p) => {
                const next = p === id ? null : id;
                if (next) fireAchievementEvent('SOUNDSCAPE_PLAYED', { soundscape: id, mode: modo });
                return next;
              })
            }
            style={{
              border: `3px solid ${playing === id ? T : K}`,
              padding: '18px 14px',
              background: playing === id ? TL : W,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              boxShadow: playing === id ? SOMBRA_SM : 'none',
              transition: 'all .1s',
            }}
          >
            <span style={{ fontSize: 28 }}>{icon}</span>
            <span
              className="mono"
              style={{
                fontSize: 9,
                fontWeight: 700,
                color: playing === id ? T : K,
                textAlign: 'center',
                lineHeight: 1.3,
              }}
            >
              {l}
            </span>
            {playing === id && (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: T,
                  animation: 'pulse 1.5s ease infinite',
                }}
              />
            )}
          </button>
        ))}
      </div>
      {playing && (
        <div
          style={{
            border: '4px solid #000',
            boxShadow: SOMBRA,
            background: DK,
            padding: '18px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
          }}
        >
          <div style={{ fontSize: 24 }}>{ambientes.find((a) => a.id === playing)?.icon}</div>
          <div style={{ flex: 1 }}>
            <div className="mono" style={{ fontSize: 11, color: T, fontWeight: 700 }}>
              {ambientes.find((a) => a.id === playing)?.l}
            </div>
            <div
              className="lbl"
              style={{ color: 'var(--aura-fg-soft)', fontSize: 9, marginTop: 2 }}
            >
              MODO_{modo} · AUDIO_GENERADO_EN_TU_NAVEGADOR
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <span className="icon" style={{ color: 'var(--aura-fg-soft)', fontSize: 16 }}>
              volume_mute
            </span>
            <span className="mono" style={{ fontSize: 9, color: '#777' }}>
              INTENSIDAD
            </span>
            <div
              style={{
                flex: 1,
                height: 4,
                background: 'var(--aura-stats-divider)',
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setVol(Math.round(((e.clientX - r.left) / r.width) * 100));
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  height: '100%',
                  width: `${vol}%`,
                  background: T,
                }}
              />
            </div>
            <span className="mono" style={{ fontSize: 10, color: W, minWidth: 28 }}>
              {vol}%
            </span>
          </div>
          <button
            onClick={() => setPlaying(null)}
            className="btn"
            style={{ background: CR, color: W, borderColor: K, fontSize: 10, padding: '8px 14px' }}
          >
            PARAR
          </button>
        </div>
      )}
    </div>
  );
}

/* ── DIARIO VIEW ── */
function DiarioView() {
  const [text, setText] = useState('');
  const [mood, setMood] = useState(null);
  const [entryTags, setEntryTags] = useState([]);
  const [tagDraft, setTagDraft] = useState('');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilterTags, setActiveFilterTags] = useState([]);
  const [saved, setSaved] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const prompts = [
    '¿QUÉ_TE_PREOCUPA_HOY?',
    'TRES_COSAS_BUENAS_DEL_DÍA',
    '¿CÓMO_MANEJÉ_MIS_EMOCIONES?',
  ];
  const selectedMood = MOOD_OPTIONS.find((item) => item.emoji === mood);
  const sortedEntries = [...entries].sort((a, b) => panelDateMs(b.date) - panelDateMs(a.date));
  const now = new Date();
  const monthDays = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const entriesThisMonth = sortedEntries.filter((entry) => {
    const d = parsePanelDate(entry.date);
    if (!d) return false;
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const entryForDay = (day) =>
    entriesThisMonth.find((entry) => parsePanelDate(entry.date)?.getDate() === day);
  const moodColor = (emoji) =>
    MOOD_OPTIONS.find((item) => item.emoji === emoji)?.color ?? 'var(--aura-bg-muted)';
  const normalizePanelTag = (value) =>
    value.trim().replace(/^#+/, '').replace(/\s+/g, '-').toLowerCase();
  const addEntryTag = (value) => {
    const tag = normalizePanelTag(value);
    if (!tag || tag.length < 2 || tag.length > 32) return;
    setEntryTags((items) => (items.includes(tag) || items.length >= 12 ? items : [...items, tag]));
    setTagDraft('');
  };
  const removeEntryTag = (tag) => setEntryTags((items) => items.filter((item) => item !== tag));
  const toggleEntryTag = (tag) =>
    setEntryTags((items) =>
      items.includes(tag)
        ? items.filter((item) => item !== tag)
        : items.length >= 12
          ? items
          : [...items, tag],
    );
  const toggleFilterTag = (tag) =>
    setActiveFilterTags((items) =>
      items.includes(tag) ? items.filter((item) => item !== tag) : [...items, tag],
    );
  const resetForm = () => {
    setText('');
    setMood(null);
    setEntryTags([]);
    setTagDraft('');
    setEditingId(null);
    setSaved(false);
  };
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [searchText]);
  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const page = await listDiaryEntries({
        size: 120,
        q: debouncedSearch,
        tags: activeFilterTags,
      });
      setEntries((page.content ?? []).map(backendDiaryToPanel));
    } catch (err) {
      setError(`ERR_DIARY: ${backendErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, activeFilterTags]);
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);
  const saveEntry = async () => {
    const startedAt = Date.now() - 1000;
    const payload = {
      title: null,
      content: text.trim(),
      moodScore: selectedMood?.score ?? null,
      moodLabel: selectedMood?.label ?? 'NEUTRAL',
      tags: entryTags,
    };
    setError('');
    try {
      const savedEntry = editingId
        ? await updateDiaryEntry(editingId, payload)
        : await createDiaryEntry(payload);
      const responseEntry = savedEntry ?? {};
      const entry = backendDiaryToPanel(
        {
          id: responseEntry.id ?? editingId,
          title: responseEntry.title ?? payload.title,
          content: responseEntry.content ?? payload.content,
          moodScore: responseEntry.moodScore ?? payload.moodScore,
          moodLabel: responseEntry.moodLabel ?? payload.moodLabel,
          tags: responseEntry.tags ?? payload.tags,
          createdAt: responseEntry.createdAt ?? responseEntry.created_at ?? responseEntry.date,
          updatedAt: responseEntry.updatedAt ?? responseEntry.updated_at,
        },
        new Date().toISOString(),
      );
      setEntries((items) =>
        editingId ? items.map((item) => (item.id === editingId ? entry : item)) : [entry, ...items],
      );
      setSaved(true);
      setEditingId(null);
      setText('');
      setMood(null);
      setEntryTags([]);
      setTagDraft('');
      if (!editingId) void refreshAchievementsForNotifications(startedAt);
      setTimeout(() => setSaved(false), 1800);
    } catch (err) {
      setError(`ERR_DIARY: ${backendErrorMessage(err)}`);
    }
  };
  const editEntry = (entry) => {
    setEditingId(entry.id);
    setText(entry.text);
    setMood(entry.mood);
    setEntryTags(entry.tags ?? []);
    setTagDraft('');
    setSaved(false);
  };
  const deleteEntry = async (id) => {
    setError('');
    try {
      await deleteDiaryEntry(id);
      setEntries((items) => items.filter((entry) => entry.id !== id));
      if (editingId === id) resetForm();
    } catch (err) {
      setError(`ERR_DIARY: ${backendErrorMessage(err)}`);
    }
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: 16,
        animation: 'fadeUp .3s ease',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.03em' }}>
          DIARIO_EMOCIONAL
        </div>
        <div
          className="bc"
          style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <div className="lbl" style={{ fontSize: 9 }}>
            BUSCAR_Y_FILTRAR_DIARIO
          </div>
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="BUSCAR_EN_DIARIO..."
            style={{
              width: '100%',
              border: BORDE,
              background: 'var(--aura-bg-soft)',
              color: K,
              padding: '12px 14px',
              fontFamily: 'Space Mono',
              fontSize: 11,
              fontWeight: 800,
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DIARY_TAG_SUGGESTIONS.map((tag) => {
              const active = activeFilterTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleFilterTag(tag)}
                  style={{
                    border: '2px solid #000',
                    padding: '6px 10px',
                    background: active ? T : W,
                    color: active ? '#000' : K,
                    fontFamily: 'Space Mono',
                    fontSize: 9,
                    fontWeight: 900,
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                  }}
                >
                  #{tag}
                </button>
              );
            })}
            {(searchText || activeFilterTags.length > 0) && (
              <button
                onClick={() => {
                  setSearchText('');
                  setDebouncedSearch('');
                  setActiveFilterTags([]);
                }}
                className="btn"
                style={{ fontSize: 9, padding: '6px 10px' }}
              >
                LIMPIAR_FILTROS
              </button>
            )}
          </div>
        </div>
        {error && (
          <div
            className="mono"
            style={{ border: `3px solid ${CR}`, background: CL, padding: 12, fontSize: 10 }}
          >
            {error}
          </div>
        )}
        <div className="bc" style={{ gap: 14, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="lbl" style={{ fontSize: 9 }}>
              {panelDateLabel()} · {editingId ? 'EDITANDO_ENTRADA' : 'ENTRADA_DE_HOY'}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {MOOD_OPTIONS.map(({ emoji, label, color }) => (
                <button
                  key={emoji}
                  onClick={() => setMood(emoji)}
                  title={label}
                  style={{
                    width: 34,
                    height: 34,
                    border: `2px solid ${mood === emoji ? color : K}`,
                    background: mood === emoji ? `${color}22` : W,
                    cursor: 'pointer',
                    fontSize: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {prompts.map((p) => (
              <button
                key={p}
                onClick={() => setText((current) => `${current ? `${current}\n\n` : ''}${p}\n`)}
                style={{
                  border: '2px solid #000',
                  padding: '5px 10px',
                  background: W,
                  fontFamily: 'Space Mono',
                  fontSize: 9,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = ML)}
                onMouseLeave={(e) => (e.currentTarget.style.background = W)}
              >
                {p}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setSaved(false);
            }}
            placeholder="Escribe libremente cómo te sientes. Este espacio es tuyo, sin juicios..."
            style={{
              width: '100%',
              height: 180,
              padding: 16,
              border: BORDE,
              background: 'var(--aura-bg-soft)',
              fontFamily: 'Inter',
              fontSize: 14,
              color: K,
              resize: 'none',
              outline: 'none',
              lineHeight: 1.7,
            }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="lbl" style={{ fontSize: 9 }}>
              TAGS_PRIVADOS
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DIARY_TAG_SUGGESTIONS.map((tag) => {
                const active = entryTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleEntryTag(tag)}
                    style={{
                      border: '2px solid #000',
                      padding: '6px 10px',
                      background: active ? M : W,
                      color: active ? '#fff' : K,
                      fontFamily: 'Space Mono',
                      fontSize: 9,
                      fontWeight: 900,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEntryTag(tagDraft);
                  }
                }}
                placeholder="AÑADIR_TAG_PROPIO"
                style={{
                  flex: '1 1 180px',
                  border: '3px solid #000',
                  background: W,
                  color: K,
                  padding: '9px 10px',
                  fontFamily: 'Space Mono',
                  fontSize: 10,
                  fontWeight: 800,
                  outline: 'none',
                }}
              />
              <button
                onClick={() => addEntryTag(tagDraft)}
                className="btn"
                style={{ fontSize: 9, padding: '8px 12px' }}
              >
                AÑADIR_TAG
              </button>
            </div>
            {entryTags.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {entryTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => removeEntryTag(tag)}
                    title={`Quitar ${tag}`}
                    style={{
                      border: '2px solid #000',
                      background: ML,
                      color: K,
                      padding: '5px 8px',
                      fontFamily: 'Space Mono',
                      fontSize: 9,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    #{tag} ×
                  </button>
                ))}
              </div>
            )}
          </div>
          {!saved ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={saveEntry}
                className="btn btn-morado"
                style={{ justifyContent: 'center', fontSize: 11, flex: 1 }}
              >
                {editingId ? 'ACTUALIZAR_ENTRADA →' : 'GUARDAR_ENTRADA →'}
              </button>
              {editingId && (
                <button onClick={resetForm} className="btn" style={{ fontSize: 11 }}>
                  CANCELAR
                </button>
              )}
            </div>
          ) : (
            <div
              className="mono"
              style={{
                border: `3px solid ${T}`,
                padding: '12px',
                background: TL,
                textAlign: 'center',
                fontSize: 11,
                color: T,
              }}
            >
              ✓ ENTRADA_GUARDADA_EN_BACKEND ·{' '}
              {new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
        </div>
        {loading && (
          <div className="bc" style={{ padding: 16, background: 'var(--aura-bg-muted)' }}>
            <div className="lbl" style={{ fontSize: 9 }}>
              CARGANDO_DIARIO_BACKEND
            </div>
          </div>
        )}
        {sortedEntries.map((entry) => (
          <div
            key={entry.id}
            className="bc"
            style={{
              flexDirection: 'row',
              gap: 14,
              alignItems: 'flex-start',
              padding: 16,
              display: 'flex',
            }}
          >
            <div style={{ fontSize: 24, flexShrink: 0 }}>{entry.mood}</div>
            <div style={{ flex: 1 }}>
              <div className="lbl" style={{ fontSize: 9, marginBottom: 6 }}>
                {diaryDateLabel(entry.date)} · {entry.moodLabel ?? 'REGISTRO'}
              </div>
              <div style={{ fontSize: 13, color: K, lineHeight: 1.65, fontStyle: 'italic' }}>
                "{entry.text}"
              </div>
              {entry.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="mono"
                      style={{
                        border: '2px solid #000',
                        background: TL,
                        padding: '4px 7px',
                        fontSize: 8,
                        fontWeight: 900,
                        color: K,
                        textTransform: 'uppercase',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button
                  onClick={() => editEntry(entry)}
                  className="btn"
                  style={{ fontSize: 9, padding: '7px 12px' }}
                >
                  EDITAR
                </button>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="btn btn-coral"
                  style={{ fontSize: 9, padding: '7px 12px' }}
                >
                  BORRAR
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          className="bc"
          style={{ padding: 14, gap: 12, display: 'flex', flexDirection: 'column' }}
        >
          <div className="lbl" style={{ fontSize: 9 }}>
            CALENDARIO_EMOCIONAL ·{' '}
            {new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(now).toUpperCase()}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
            {Array.from({ length: monthDays }, (_, i) => {
              const day = i + 1;
              const entry = entryForDay(day);
              const color = entry ? moodColor(entry.mood) : null;
              return (
                <div
                  key={i}
                  style={{
                    height: 24,
                    border: '2px solid #000',
                    background: color || 'var(--aura-bg-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={
                    entry ? `${diaryDateLabel(entry.date)} · ${entry.moodLabel}` : `Día ${day}`
                  }
                >
                  <span className="mono" style={{ fontSize: 7, color: color ? W : K }}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { c: T, l: 'BIEN' },
              { c: M, l: 'MUY_BIEN' },
              { c: CR, l: 'DIFÍCIL' },
              { c: 'var(--aura-bg-muted)', l: 'SIN_ENTRADA' },
            ].map(({ c, l }) => (
              <div
                key={l}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                className="lbl"
              >
                <div style={{ width: 10, height: 10, background: c, border: '1px solid #000' }} />
                {l}
              </div>
            ))}
          </div>
        </div>
        <div
          className="bc"
          style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <div className="lbl" style={{ fontSize: 9 }}>
            RESUMEN_BACKEND
          </div>
          {[
            { l: 'ENTRADAS', v: sortedEntries.length, c: M },
            { l: 'ESTE_MES', v: entriesThisMonth.length, c: T },
            { l: 'ÚLTIMA_EMOCIÓN', v: sortedEntries[0]?.mood ?? '—', c: CR },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ border: '2px solid #000', padding: '8px 10px' }}>
              <div className="lbl" style={{ fontSize: 8 }}>
                {l}
              </div>
              <div style={{ fontWeight: 900, fontSize: 18, color: c, marginTop: 2 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── CONTACTOS VIEW ── */
function ContactosView() {
  const [sent, setSent] = useState({});
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyContact);
  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const startCreate = () => {
    setEditingId(null);
    setForm(emptyContact);
    setFormOpen(true);
  };
  const startEdit = (contact) => {
    setEditingId(contact.id);
    setForm({
      name: contact.name,
      role: contact.role,
      emoji: contact.emoji,
      phone: contact.phone,
      available: contact.available,
      sosAuto: contact.sosAuto,
    });
    setFormOpen(true);
  };
  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listContacts();
      setContacts((data ?? []).map(backendContactToPanel));
    } catch (err) {
      setError(`ERR_ACHIEVEMENTS: ${backendErrorMessage(err)}`);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);
  const saveContact = async () => {
    const startedAt = Date.now() - 1000;
    const next = {
      id: editingId ?? `contact_${Date.now().toString(36)}`,
      name: form.name.trim(),
      role: form.role.trim() || 'CONFIANZA',
      emoji: form.emoji || '👤',
      phone: form.phone.trim(),
      priority: contacts.find((item) => item.id === editingId)?.priority ?? contacts.length + 1,
      available: form.available,
      sosAuto: form.sosAuto,
    };
    setError('');
    try {
      const savedContact = editingId
        ? await updateContact(editingId, panelContactToRequest(next, next.priority))
        : await createContact(panelContactToRequest(next, next.priority));
      const panelContact = backendContactToPanel(savedContact);
      setContacts((items) =>
        editingId
          ? items.map((item) => (item.id === editingId ? panelContact : item))
          : [panelContact, ...items],
      );
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyContact);
      if (panelContact.available && panelContact.sosAuto) {
        void refreshAchievementsForNotifications(startedAt);
      }
    } catch (err) {
      setError(`ERR_ACHIEVEMENTS: ${backendErrorMessage(err)}`);
    }
  };
  const deleteContact = async (id) => {
    setError('');
    try {
      await deleteContactApi(id);
      setContacts((items) => items.filter((contact) => contact.id !== id));
      if (editingId === id) {
        setFormOpen(false);
        setEditingId(null);
      }
    } catch (err) {
      setError(`ERR_ACHIEVEMENTS: ${backendErrorMessage(err)}`);
    }
  };
  const toggleContact = async (id, field) => {
    const current = contacts.find((contact) => contact.id === id);
    if (!current) return;
    const next = { ...current, [field]: !current[field] };
    setContacts((items) => items.map((contact) => (contact.id === id ? next : contact)));
    setError('');
    try {
      const startedAt = Date.now() - 1000;
      const savedContact = await updateContact(id, panelContactToRequest(next, next.priority));
      setContacts((items) =>
        items.map((contact) => (contact.id === id ? backendContactToPanel(savedContact) : contact)),
      );
      if (next.available && next.sosAuto) {
        void refreshAchievementsForNotifications(startedAt);
      }
    } catch (err) {
      setContacts((items) => items.map((contact) => (contact.id === id ? current : contact)));
      setError(`ERR_ACHIEVEMENTS: ${backendErrorMessage(err)}`);
    }
  };
  const sendContactSos = async (contact) => {
    if (!contact.available || !contact.sosAuto) return;
    setSent((current) => ({ ...current, [contact.id]: 'ENVIANDO' }));
    setError('');
    try {
      const alert = await triggerPanic({
        contactId: contact.id,
        contextJson: { source: 'contacts_view', contactName: contact.name },
      });
      const notification = alert.notifications?.find((item) => item.contactId === contact.id);
      if (notification?.status === 'FAILED') {
        setSent((current) => ({ ...current, [contact.id]: 'MANUAL_READY' }));
        setError(
          `ERR_SOS: ${notification.details || 'No se pudo enviar el SMS automatico. Usa el aviso manual.'}`,
        );
        return;
      }
      setSent((current) => ({
        ...current,
        [contact.id]: notification?.status === 'MOCKED' ? 'MANUAL_READY' : 'SMS_ENVIADO',
      }));
    } catch (err) {
      setSent((current) => ({ ...current, [contact.id]: 'ERROR' }));
      setError(`ERR_SOS: ${backendErrorMessage(err)}`);
    }
  };

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 16, animation: 'fadeUp .3s ease' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.03em' }}>
          CONTACTOS_DE_CONFIANZA
        </div>
        <button
          onClick={startCreate}
          className="btn"
          style={{ borderStyle: 'dashed', fontSize: 10 }}
        >
          + AÑADIR_CONTACTO
        </button>
      </div>
      {error && (
        <div
          className="mono"
          style={{ border: `3px solid ${CR}`, background: CL, padding: 12, fontSize: 10 }}
        >
          {error}
        </div>
      )}
      {loading && (
        <div className="bc" style={{ padding: 16, background: 'var(--aura-bg-muted)' }}>
          <div className="lbl" style={{ fontSize: 9 }}>
            CARGANDO_CONTACTOS_BACKEND
          </div>
        </div>
      )}
      {formOpen && (
        <div className="bc" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input
            aria-label="Nombre contacto"
            value={form.name}
            onChange={(e) => updateForm('name', e.target.value)}
            placeholder="Nombre"
            style={{ border: BORDE, padding: '10px 12px', fontFamily: 'Inter' }}
          />
          <input
            aria-label="Teléfono contacto"
            value={form.phone}
            onChange={(e) => updateForm('phone', e.target.value)}
            placeholder="+34 600 000 000"
            style={{ border: BORDE, padding: '10px 12px', fontFamily: 'Inter' }}
          />
          <input
            aria-label="Rol contacto"
            value={form.role}
            onChange={(e) => updateForm('role', e.target.value)}
            placeholder="HERMANA / PSICÓLOGO / AMIGO"
            style={{ border: BORDE, padding: '10px 12px', fontFamily: 'Inter' }}
          />
          <input
            aria-label="Avatar contacto"
            value={form.emoji}
            onChange={(e) => updateForm('emoji', e.target.value)}
            placeholder="👤"
            style={{ border: BORDE, padding: '10px 12px', fontFamily: 'Inter' }}
          />
          <label className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.available}
              onChange={(e) => updateForm('available', e.target.checked)}
            />
            DISPONIBLE
          </label>
          <label className="lbl" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={form.sosAuto}
              onChange={(e) => updateForm('sosAuto', e.target.checked)}
            />
            SOS_AUTO
          </label>
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 10 }}>
            <button onClick={saveContact} className="btn btn-morado" style={{ fontSize: 10 }}>
              {editingId ? 'ACTUALIZAR_CONTACTO' : 'GUARDAR_CONTACTO'}
            </button>
            <button onClick={() => setFormOpen(false)} className="btn" style={{ fontSize: 10 }}>
              CANCELAR
            </button>
          </div>
        </div>
      )}
      <div
        className="bc"
        style={{
          background: ML,
          padding: '12px 16px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <span className="icon" style={{ color: M }}>
          info
        </span>
        <span className="lbl lbl-morado" style={{ fontSize: 9 }}>
          MENSAJE_SOS_PREDEFINIDO: "Necesito ayuda, estoy teniendo una crisis de ansiedad. Por favor
          contáctame."
        </span>
      </div>
      {contacts.map(({ id, name, role, emoji, phone, available, sosAuto }) => (
        <div
          key={id}
          className="bc"
          style={{ flexDirection: 'row', gap: 16, alignItems: 'center', display: 'flex' }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              border: BORDE,
              background: ML,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 26,
              flexShrink: 0,
            }}
          >
            {emoji}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{name}</div>
            <div className="lbl" style={{ fontSize: 9, marginTop: 2 }}>
              {role} · {phone}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background: available ? T : CR,
                  border: '1px solid #000',
                }}
              />
              <span className="lbl" style={{ fontSize: 8, color: available ? T : CR }}>
                {available ? 'DISPONIBLE' : 'OCUPADO'}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <span className="lbl" style={{ fontSize: 8 }}>
                SOS_AUTO
              </span>
              <div
                onClick={() => toggleContact(id, 'sosAuto')}
                style={{
                  width: 36,
                  height: 20,
                  border: '2px solid #000',
                  background: sosAuto ? M : '#f0f0f0',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'background .2s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: sosAuto ? 16 : 2,
                    width: 12,
                    height: 12,
                    background: W,
                    border: '1px solid #000',
                    transition: 'left .2s',
                  }}
                />
              </div>
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <a
                href={`tel:${normalizePhoneForUri(phone)}`}
                className="btn btn-negro"
                style={{ fontSize: 10, padding: '8px 14px', textDecoration: 'none' }}
              >
                LLAMAR
              </a>
              <button
                onClick={() => sendContactSos({ id, name, role, emoji, phone, available, sosAuto })}
                disabled={!available || !sosAuto || sent[id] === 'ENVIANDO'}
                className={`btn ${
                  sent[id] === 'SMS_ENVIADO'
                    ? 'btn-turquesa'
                    : sent[id] === 'MANUAL_READY'
                      ? 'btn-morado'
                      : 'btn-coral'
                }`}
                style={{ fontSize: 10, padding: '8px 14px' }}
              >
                {sent[id] === 'ENVIANDO'
                  ? 'ENVIANDO'
                  : sent[id] === 'SMS_ENVIADO'
                    ? `✓ ${sent[id]}`
                    : sent[id] === 'MANUAL_READY'
                      ? 'ENVIAR_SOS'
                      : 'ENVIAR_SOS'}
              </button>
              <button
                onClick={() => startEdit({ id, name, role, emoji, phone, available, sosAuto })}
                className="btn"
                style={{ fontSize: 10, padding: '8px 14px' }}
              >
                EDITAR
              </button>
              <button
                onClick={() => deleteContact(id)}
                className="btn btn-coral"
                style={{ fontSize: 10, padding: '8px 14px' }}
              >
                BORRAR
              </button>
            </div>
            {sent[id] === 'MANUAL_READY' && (
              <ManualSosFallback contact={{ id, name, role, emoji, phone, available, sosAuto }} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── CONFIG VIEW ── */
function ConfigView() {
  const { user, logout, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const panelUser = user ?? DEFAULT_PANEL_USER;
  const [profile, setProfile] = useState(() =>
    readLocalJSON(PROFILE_STORAGE_KEY, {
      name: panelUser.name,
      email: panelUser.email,
      plan: panelUser.plan,
    }),
  );
  const [language, setLanguage] = useState(() => i18n.language?.split('-')[0] || 'es');
  const [profileSaved, setProfileSaved] = useState(false);
  const [dataMessage, setDataMessage] = useState('');
  const [settingsError, setSettingsError] = useState('');
  const [busySettings, setBusySettings] = useState('');
  const [deleteForm, setDeleteForm] = useState({ confirmationText: '' });
  const [open, setOpen] = useState('PERFIL');
  const sections = [
    'PERFIL',
    'APARIENCIA_IDIOMA',
    'PRIVACIDAD_GDPR',
    'GOOGLE',
    'NOTIFICACIONES',
    'PLAN_SUSCRIPCIÓN',
    'EXPORTAR_DATOS',
    'ELIMINAR_CUENTA',
    'SESIÓN',
  ];
  const content = {
    PERFIL: `Nombre: ${profile.name} · Email: ${profile.email} · Idioma: ${language.toUpperCase()} · Zona horaria: Europe/Madrid`,
    APARIENCIA_IDIOMA:
      'Cambia idioma de interfaz y tema visual. Los cambios quedan guardados en localStorage.',
    PRIVACIDAD_GDPR:
      'Cumplimiento GDPR y AI Act. Datos cifrados en reposo y tránsito. Anonimización opcional. Exportación completa disponible.',
    GOOGLE:
      'Conecta Google para iniciar sesión sin contraseña. Los tokens de Google no se guardan en AURA.',
    NOTIFICACIONES:
      'Recordatorios privados de mood, diario y logros. El texto del diario y el estado emocional no aparecen en la notificación.',
    PLAN_SUSCRIPCIÓN: `Plan ${planLabel(profile.plan ?? panelUser.plan)}: activo · Renovación: 27 Mayo 2026 · Incluye: Chatbot IA ilimitado + todos los ambientes`,
    EXPORTAR_DATOS: 'Descarga una copia de tus datos personales. Puedes elegir JSON o PDF.',
    ELIMINAR_CUENTA:
      'Elimina tu cuenta y todos tus datos de forma definitiva. Esta acción no se puede deshacer.',
    SESIÓN: 'Cierra tu sesión en este dispositivo. Podrás volver a entrar cuando quieras.',
  };
  const saveProfile = () => {
    const next = {
      name: profile.name.trim() || panelUser.name,
      email: profile.email.trim() || panelUser.email,
      plan: profile.plan ?? panelUser.plan,
    };
    writeLocalJSON(PROFILE_STORAGE_KEY, next);
    updateProfile({ name: next.name, email: next.email });
    setProfile(next);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 1600);
  };
  const changeLanguage = (next) => {
    setLanguage(next);
    i18n.changeLanguage(next);
    localStorage.setItem('aura.language', next);
  };
  const downloadBlob = (content, filename, type) => {
    if (typeof URL !== 'undefined' && URL.createObjectURL) {
      const blob = content instanceof Blob ? content : new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
  };
  const exportJson = async () => {
    setBusySettings('export-json');
    setSettingsError('');
    try {
      const payload = await exportUserDataJson();
      downloadBlob(
        JSON.stringify(payload, null, 2),
        `aura-export-${new Date().toISOString().slice(0, 10)}.json`,
        'application/json',
      );
      setDataMessage('EXPORT_JSON_COMPLETADO');
    } catch (err) {
      setSettingsError(`ERR_EXPORT: ${backendErrorMessage(err)}`);
    } finally {
      setBusySettings('');
    }
  };
  const exportPdf = async () => {
    setBusySettings('export-pdf');
    setSettingsError('');
    try {
      const blob = await exportUserDataPdf();
      downloadBlob(
        blob,
        `aura-export-${new Date().toISOString().slice(0, 10)}.pdf`,
        'application/pdf',
      );
      setDataMessage('EXPORT_PDF_COMPLETADO');
    } catch (err) {
      setSettingsError(`ERR_EXPORT: ${backendErrorMessage(err)}`);
    } finally {
      setBusySettings('');
    }
  };
  const deleteAccount = async () => {
    setBusySettings('delete-account');
    setSettingsError('');
    setDataMessage('');
    try {
      await deleteCurrentAccount({
        confirmationText: deleteForm.confirmationText.trim(),
      });
      logout();
      navigate('/', { replace: true });
    } catch (err) {
      setSettingsError(`ERR_DELETE_ACCOUNT: ${backendErrorMessage(err)}`);
    } finally {
      setBusySettings('');
    }
  };
  const deleteConfirmation = deleteForm.confirmationText.trim();
  const deleteReady = deleteConfirmation === 'ELIMINAR MI CUENTA';
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeUp .3s ease' }}
    >
      <div style={{ fontWeight: 900, fontSize: 20, letterSpacing: '-0.03em' }}>CONFIGURACIÓN</div>
      {sections.map((s) => (
        <div key={s} style={{ border: BORDE, boxShadow: open === s ? SOMBRA_SM : 'none' }}>
          <button
            onClick={() => setOpen((o) => (o === s ? null : s))}
            style={{
              width: '100%',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: open === s ? DK : W,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Space Mono',
              fontSize: 11,
              fontWeight: 700,
              color: open === s ? W : K,
              letterSpacing: '0.04em',
              textAlign: 'left',
            }}
          >
            {s}
            <span className="icon" style={{ color: open === s ? W : K, fontSize: 20 }}>
              {open === s ? 'remove' : 'add'}
            </span>
          </button>
          {open === s && (
            <div
              style={{
                padding: '14px 18px',
                background: 'var(--aura-bg-soft)',
                borderTop: '2px solid #000',
                fontSize: 13,
                color: K,
                lineHeight: 1.7,
              }}
            >
              {content[s]}
              {s === 'PERFIL' && (
                <div
                  style={{
                    marginTop: 14,
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 10,
                  }}
                >
                  <input
                    aria-label="Nombre perfil"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile((current) => ({ ...current, name: e.target.value }))
                    }
                    style={{ border: BORDE, padding: '10px 12px', fontFamily: 'Inter' }}
                  />
                  <input
                    aria-label="Email perfil"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile((current) => ({ ...current, email: e.target.value }))
                    }
                    style={{ border: BORDE, padding: '10px 12px', fontFamily: 'Inter' }}
                  />
                  <button onClick={saveProfile} className="btn btn-morado" style={{ fontSize: 10 }}>
                    GUARDAR_PERFIL
                  </button>
                  {profileSaved && <span className="chip chip-turquesa">PERFIL_ACTUALIZADO</span>}
                </div>
              )}
              {s === 'APARIENCIA_IDIOMA' && (
                <div style={{ marginTop: 14, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 0, border: BORDE }}>
                    {['es', 'en'].map((lng) => (
                      <button
                        key={lng}
                        onClick={() => changeLanguage(lng)}
                        style={{
                          padding: '8px 14px',
                          background: language === lng ? M : W,
                          color: language === lng ? W : K,
                          border: 'none',
                          borderRight: lng === 'es' ? '2px solid #000' : 'none',
                          fontFamily: 'Space Mono',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {lng.toUpperCase()}
                      </button>
                    ))}
                  </div>
                  <button onClick={toggleTheme} className="btn btn-negro" style={{ fontSize: 10 }}>
                    TEMA_{theme === 'dark' ? 'OSCURO' : 'CLARO'}
                  </button>
                </div>
              )}
              {s === 'NOTIFICACIONES' && <PushNotificationSettings />}
              {s === 'GOOGLE' && <GoogleAccountSettings />}
              {s === 'ELIMINAR_CUENTA' && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div
                    style={{
                      border: `3px solid ${CR}`,
                      background: CL,
                      padding: 12,
                      fontFamily: 'Space Mono',
                      fontSize: 10,
                      fontWeight: 900,
                      lineHeight: 1.6,
                    }}
                  >
                    ADVERTENCIA: se eliminarán diario, mood, chat, contactos, SOS, logros,
                    notificaciones y acceso a la cuenta. No podremos recuperarlo.
                  </div>
                  <label
                    htmlFor="delete-account-confirmation"
                    style={{ fontFamily: 'Space Mono', fontSize: 10, fontWeight: 900 }}
                  >
                    ESCRIBE EXACTAMENTE: ELIMINAR MI CUENTA
                  </label>
                  <textarea
                    id="delete-account-confirmation"
                    aria-label="Confirmación eliminar cuenta"
                    name="aura-delete-account-confirmation"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    placeholder="Escribe: ELIMINAR MI CUENTA"
                    value={deleteForm.confirmationText}
                    onChange={(e) =>
                      setDeleteForm((current) => ({ ...current, confirmationText: e.target.value }))
                    }
                    rows={2}
                    style={{
                      border: BORDE,
                      padding: '10px 12px',
                      fontFamily: 'Space Mono',
                      resize: 'vertical',
                      minHeight: 58,
                      background: W,
                    }}
                  />
                  {!deleteReady && (
                    <div className="chip chip-coral" style={{ alignSelf: 'flex-start' }}>
                      Falta escribir la frase exacta para activar el borrado.
                    </div>
                  )}
                  <button
                    onClick={deleteAccount}
                    disabled={busySettings === 'delete-account'}
                    className="btn btn-coral"
                    style={{ fontSize: 10 }}
                  >
                    {busySettings === 'delete-account'
                      ? 'ELIMINANDO_CUENTA...'
                      : 'ELIMINAR_CUENTA_DEFINITIVAMENTE'}
                  </button>
                </div>
              )}
              {s === 'EXPORTAR_DATOS' && (
                <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button
                    onClick={exportJson}
                    disabled={busySettings === 'export-json'}
                    className="btn"
                    style={{ fontSize: 10, background: T, color: K }}
                  >
                    {busySettings === 'export-json' ? 'PREPARANDO_JSON...' : 'DESCARGAR_JSON'}
                  </button>
                  <button
                    onClick={exportPdf}
                    disabled={busySettings === 'export-pdf'}
                    className="btn btn-morado"
                    style={{ fontSize: 10 }}
                  >
                    {busySettings === 'export-pdf' ? 'PREPARANDO_PDF...' : 'DESCARGAR_PDF'}
                  </button>
                </div>
              )}
              {s === 'SESIÓN' && (
                <button
                  onClick={logout}
                  className="btn btn-negro"
                  style={{ marginTop: 12, fontSize: 10 }}
                >
                  CERRAR_SESIÓN
                </button>
              )}
              {dataMessage && (s === 'EXPORTAR_DATOS' || s === 'ELIMINAR_CUENTA') && (
                <div className="chip chip-turquesa" style={{ marginTop: 12 }}>
                  {dataMessage}
                </div>
              )}
              {settingsError && (s === 'EXPORTAR_DATOS' || s === 'ELIMINAR_CUENTA') && (
                <div className="chip chip-coral" style={{ marginTop: 12 }}>
                  {settingsError}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function GoogleAccountSettings() {
  const [status, setStatus] = useState({ linked: false, email: null, linkedAt: null });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const errorMessage = (err, fallback) => {
    const errores = err?.response?.data?.fieldErrors;
    if (errores) {
      const campos = Object.keys(errores);
      const campo = campos[0];

      if (campo) {
        return errores[campo];
      }
    }

    return err?.response?.data?.message || err?.response?.data?.error || err?.message || fallback;
  };

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setStatus(await getGoogleOAuthStatus());
    } catch (err) {
      setError(errorMessage(err, 'No se pudo cargar el estado de Google.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const next = await getGoogleOAuthStatus();
        if (mounted) setStatus(next);
      } catch (err) {
        if (mounted) setError(errorMessage(err, 'No se pudo cargar el estado de Google.'));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, []);

  const connect = async () => {
    setBusy('connect');
    setError('');
    try {
      const url = await startGoogleLink();
      window.location.assign(url);
    } catch (err) {
      setError(errorMessage(err, 'No se pudo conectar Google.'));
      setBusy('');
    }
  };

  const disconnect = async () => {
    setBusy('disconnect');
    setError('');
    try {
      await unlinkGoogleOAuth();
      await loadStatus();
    } catch (err) {
      setError(errorMessage(err, 'No se pudo desconectar Google.'));
    } finally {
      setBusy('');
    }
  };

  return (
    <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        className={status.linked ? 'chip chip-turquesa' : 'chip'}
        style={{ width: 'fit-content' }}
      >
        {loading
          ? 'GOOGLE_VERIFICANDO'
          : status.linked
            ? 'GOOGLE_CONECTADO'
            : 'GOOGLE_NO_CONECTADO'}
      </div>

      {status.linked && (
        <div className="mono" style={{ fontSize: 11, fontWeight: 700 }}>
          EMAIL_GOOGLE: {status.email || 'SIN_EMAIL'}
        </div>
      )}

      {error && (
        <div
          className="mono"
          role="alert"
          style={{
            border: '3px solid #000',
            background: CR,
            color: W,
            padding: '8px 10px',
            fontSize: 11,
            fontWeight: 900,
          }}
        >
          ERR_AUTH_GOOGLE: {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {!status.linked && (
          <button
            onClick={connect}
            className="btn"
            disabled={Boolean(busy)}
            style={{ fontSize: 10, background: W, color: K }}
          >
            {busy === 'connect' ? 'CONECTANDO_GOOGLE' : 'CONECTAR_GOOGLE'}
          </button>
        )}
        {status.linked && (
          <button
            onClick={disconnect}
            className="btn btn-coral"
            disabled={Boolean(busy)}
            style={{ fontSize: 10 }}
          >
            {busy === 'disconnect' ? 'DESCONECTANDO_GOOGLE' : 'DESCONECTAR_GOOGLE'}
          </button>
        )}
        <button onClick={loadStatus} className="btn btn-negro" style={{ fontSize: 10 }}>
          RECARGAR_GOOGLE
        </button>
      </div>
    </div>
  );
}

/* ── BREATHING MODAL ── */
function BreathingModal({ onClose }) {
  const phases = [
    { name: 'INHALA', dur: 4 },
    { name: 'SOSTÉN', dur: 4 },
    { name: 'EXHALA', dur: 6 },
  ];
  const [pi, setPi] = useState(0);
  const [count, setCount] = useState(phases[0].dur);
  const [cycle, setCycle] = useState(1);
  const achievementSentRef = useRef(false);
  const ph = phases[pi];
  useEffect(() => {
    setCount(ph.dur);
    const iv = setInterval(
      () =>
        setCount((c) => {
          if (c <= 1) {
            clearInterval(iv);
            const ni = (pi + 1) % phases.length;
            setPi(ni);
            if (ni === 0) setCycle((c) => c + 1);
            return phases[ni].dur;
          }
          return c - 1;
        }),
      1000,
    );
    return () => clearInterval(iv);
  }, [pi]);
  useEffect(() => {
    if (cycle > 1 && !achievementSentRef.current) {
      achievementSentRef.current = true;
      fireAchievementEvent('BREATHING_COMPLETED', { protocol: '4-4-6' });
    }
  }, [cycle]);
  const breathScale = pi === 0 ? 1.14 : pi === 1 ? 1.05 : 0.76;
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(16px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: W,
          border: '6px solid #000',
          boxShadow: '12px 12px 0 0 #000',
          padding: 48,
          width: 440,
          textAlign: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lbl lbl-coral" style={{ marginBottom: 8 }}>
          PROTOCOLO_RESPIRACIÓN_4-4-6
        </div>
        <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: '-0.03em', marginBottom: 6 }}>
          RESPIRA_CONMIGO
        </div>
        <div className="lbl" style={{ marginBottom: 36 }}>
          CICLO_{String(cycle).padStart(2, '0')} · INHALA_4 · SOSTÉN_4 · EXHALA_6
        </div>
        <div
          style={{
            position: 'relative',
            width: 154,
            height: 154,
            margin: '0 auto 34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'auraBreathingFloat 2.35s ease-in-out infinite',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                border: '4px solid #000',
                background: `radial-gradient(circle, #fda4af 0%, ${CR} 100%)`,
                transform: `scale(${breathScale})`,
                transition: `transform ${ph.dur}s ease-in-out`,
                opacity: 0.9,
              }}
            />
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{ fontSize: 34, fontWeight: 900, color: W, lineHeight: 1 }}>{count}</div>
              <div
                className="mono"
                style={{
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.9)',
                  fontWeight: 700,
                  marginTop: 4,
                }}
              >
                {ph.name}
              </div>
            </div>
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 8,
            marginBottom: 24,
          }}
        >
          {phases.map(({ name, dur }, i) => {
            const isActive = i === pi;
            const displaySeconds = isActive ? count : dur;
            return (
              <div
                key={name}
                style={{
                  border: `3px solid ${isActive ? CR : K}`,
                  padding: '8px',
                  background: isActive ? CL : W,
                }}
              >
                <div
                  className="mono"
                  style={{ fontSize: 9, fontWeight: 700, color: isActive ? CR : K }}
                >
                  {name}
                </div>
                <div style={{ fontSize: 18, fontWeight: 900, color: isActive ? CR : K }}>
                  {displaySeconds}s
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onClose}
          className="btn btn-negro"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          CERRAR_EJERCICIO
        </button>
      </div>
    </div>
  );
}

/* ── TWEAKS ── */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/ {
  userName: 'María Solís',
  accentColor: '#A855F7',
  showStreak: true,
  density: 'NORMAL',
}; /*EDITMODE-END*/

function TweaksPanel({ visible }) {
  if (!visible) return null;
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        background: W,
        border: BORDE,
        boxShadow: SOMBRA,
        padding: 24,
        width: 260,
        zIndex: 9999,
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 14, marginBottom: 16, letterSpacing: '-0.01em' }}>
        TWEAKS_PANEL
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label
          className="lbl"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 9,
          }}
        >
          COLOR_ACENTO
          <input
            type="color"
            defaultValue="#A855F7"
            onChange={(e) =>
              window.parent.postMessage(
                { type: '__edit_mode_set_keys', edits: { accentColor: e.target.value } },
                '*',
              )
            }
            style={{ width: 40, height: 28, border: '2px solid #000', cursor: 'pointer' }}
          />
        </label>
        <label
          className="lbl"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 9,
          }}
        >
          MOSTRAR_RACHA
          <input
            type="checkbox"
            defaultChecked
            onChange={(e) =>
              window.parent.postMessage(
                { type: '__edit_mode_set_keys', edits: { showStreak: e.target.checked } },
                '*',
              )
            }
            style={{ cursor: 'pointer', width: 16, height: 16 }}
          />
        </label>
        <label
          className="lbl"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 9,
          }}
        >
          DENSIDAD_BENTO
          <select
            defaultValue="NORMAL"
            style={{
              border: '2px solid #000',
              padding: '3px 6px',
              fontFamily: 'Space Mono',
              fontSize: 9,
              cursor: 'pointer',
            }}
            onChange={(e) =>
              window.parent.postMessage(
                { type: '__edit_mode_set_keys', edits: { density: e.target.value } },
                '*',
              )
            }
          >
            <option>COMPACTA</option>
            <option>NORMAL</option>
            <option>ESPACIADA</option>
          </select>
        </label>
      </div>
    </div>
  );
}

/* ── SECTION ROUTER ── */
function SectionView({ id, setSection, openBreathing }) {
  switch (id) {
    case 'inicio':
      return <DashboardView setSection={setSection} openBreathing={openBreathing} />;
    case 'sos':
      return <SOSView openBreathing={openBreathing} />;
    case 'chatbot':
      return <ChatbotView />;
    case 'mood':
      return <MoodTrackerView />;
    case 'juegos':
      return <MinijuegosView />;
    case 'sonidos':
      return <SonidosView />;
    case 'diario':
      return <DiarioView />;
    case 'logros':
      return <AchievementsView />;
    case 'billing':
      return <BillingView />;
    case 'contactos':
      return <ContactosView />;
    case 'config':
      return <ConfigView />;
    default:
      return null;
  }
}

/* ── APP ── */
function AuraPanelApp() {
  const location = useLocation();
  const navigate = useNavigate();
  const [section, setSection] = useState(
    () => sectionFromPath(location.pathname) || localStorage.getItem('aura-section') || 'inicio',
  );
  const [modal, setModal] = useState(null);
  const [tweaks, setTweaks] = useState(false);
  const [achievementToast, setAchievementToast] = useState(null);
  const achievementToastTimer = useRef();
  useEffect(() => {
    localStorage.setItem('aura-section', section);
  }, [section]);
  useEffect(() => {
    const next = sectionFromPath(location.pathname);
    if (next !== null && next !== section) setSection(next);
  }, [location.pathname, section]);
  const selectSection = (s) => {
    setSection(s);
    navigate(s === 'inicio' ? '/dashboard' : `/dashboard/${s}`);
  };
  useEffect(() => {
    const h = (e) => {
      if (e.data?.type === '__activate_edit_mode') setTweaks(true);
      if (e.data?.type === '__deactivate_edit_mode') setTweaks(false);
    };
    window.addEventListener('message', h);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', h);
  }, []);
  useEffect(() => {
    const onAchievementUnlocked = (event) => {
      window.clearTimeout(achievementToastTimer.current);
      setAchievementToast(event.detail);
      achievementToastTimer.current = window.setTimeout(() => setAchievementToast(null), 6500);
    };
    window.addEventListener('aura-achievement-unlocked', onAchievementUnlocked);
    return () => {
      window.clearTimeout(achievementToastTimer.current);
      window.removeEventListener('aura-achievement-unlocked', onAchievementUnlocked);
    };
  }, []);
  return (
    <div className="aura-panel-shell">
      <div className="blobs" aria-hidden="true">
        <div className="blob b1"></div>
        <div className="blob b2"></div>
        <div className="blob b3"></div>
      </div>
      <div
        style={{
          display: 'flex',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Sidebar active={section} set={selectSection} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <StatsBar />
          <main
            style={{ flex: 1, overflowY: 'auto', padding: '28px 32px', background: 'transparent' }}
          >
            <div style={{ maxWidth: 960, margin: '0 auto' }} key={section}>
              <SectionView
                id={section}
                setSection={selectSection}
                openBreathing={() => setModal('breathing')}
              />
            </div>
          </main>
        </div>
      </div>
      {achievementToast && (
        <button
          type="button"
          onClick={() => {
            setAchievementToast(null);
            selectSection('logros');
          }}
          style={{
            position: 'fixed',
            top: 54,
            right: 28,
            zIndex: 1200,
            width: 'min(320px, calc(100vw - 32px))',
            border: '3px solid var(--aura-fg)',
            boxShadow: SOMBRA_SM,
            backgroundColor: '#D8FFF8',
            opacity: 1,
            color: K,
            padding: 12,
            textAlign: 'left',
            cursor: 'pointer',
          }}
        >
          <div className="lbl lbl-turquesa" style={{ fontSize: 8, marginBottom: 6 }}>
            {achievementToast.title ?? 'LOGRO_DESBLOQUEADO'}
          </div>
          <div style={{ fontWeight: 900, fontSize: 13, lineHeight: 1.2 }}>
            {achievementToast.body}
          </div>
          <div
            className="mono"
            style={{ marginTop: 7, fontSize: 8, color: 'var(--aura-fg-muted)' }}
          >
            CLIC_PARA_VER_LOGROS
          </div>
        </button>
      )}
      {modal === 'breathing' && <BreathingModal onClose={() => setModal(null)} />}
      <TweaksPanel visible={tweaks} />
    </div>
  );
}

export function AuraPanelPage() {
  return <AuraPanelApp />;
}

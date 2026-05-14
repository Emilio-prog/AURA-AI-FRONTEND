import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Flame,
  Gamepad2,
  Headphones,
  HelpCircle,
  Info,
  Lock,
  MessageSquare,
  Plus,
  Shield,
  Wind,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { CompleteOnboardingPayload } from '@/context/AuthContext';
import { cn } from '@/utils/cn';

const TOTAL_ONBOARDING_STEPS = 8;
const CONSENT_GRANTED = true;

const goalOptions = [
  { id: 'sleep', label: 'CALIDAD_DEL_SUEÑO', icon: '🌙', activeClass: 'bg-[#2DD4BF]/30' },
  { id: 'anxiety', label: 'GESTIONAR_ANSIEDAD', icon: '💭', activeClass: 'bg-[#F0DBFF]' },
  { id: 'stress', label: 'REDUCIR_ESTRÉS', icon: '🌊', activeClass: 'bg-[#FFDADC]' },
  { id: 'focus', label: 'MEJORAR_CONCENTRACIÓN', icon: '🎯', activeClass: 'bg-[#FDE68A]' },
  { id: 'calm', label: 'ENCONTRAR_CALMA', icon: '🧘', activeClass: 'bg-[#BAE6FD]' },
  { id: 'mood', label: 'SUPERAR_BAJONES', icon: '💔', activeClass: 'bg-[#FB7185]/25' },
  { id: 'rumination', label: 'ROMPER_RUMIACIÓN', icon: '↩️', activeClass: 'bg-[#62FAE3]' },
  { id: 'relationships', label: 'MEJORAR_RELACIONES', icon: '🤝', activeClass: 'bg-[#A855F7]/25' },
];

const moodOptions = [
  { id: 'muy_ansioso', emoji: '😰' },
  { id: 'triste', emoji: '🙁' },
  { id: 'neutral', emoji: '😐' },
  { id: 'bien', emoji: '🙂' },
  { id: 'calma', emoji: '😌' },
];

const triggerOptions = [
  { id: 'wake', label: 'AL_DESPERTAR', icon: '🌅' },
  { id: 'night', label: 'ANTES_DE_DORMIR', icon: '🌙' },
  { id: 'work', label: 'EN_EL_TRABAJO', icon: '💼' },
  { id: 'social', label: 'EN_SITUACIONES_SOCIALES', icon: '👥' },
  { id: 'no_reason', label: 'SIN_RAZÓN_APARENTE', icon: '❓' },
  { id: 'rarely', label: 'RARAMENTE', icon: '✨' },
];

const frequencyOptions = ['diario', 'semanal', 'mensual', 'raro'] as const;

const toolOptions = [
  {
    id: 'breathing',
    label: 'RESPIRACIÓN_GUIADA',
    detail: 'técnica 4-7-8 validada clínicamente',
    tag: 'MIND',
    tagClass: 'bg-[#2DD4BF]',
    icon: Wind,
  },
  {
    id: 'chat',
    label: 'CONVERSAR_CON_IA',
    detail: 'chatbot empático 24/7',
    tag: 'CONNECT',
    tagClass: 'bg-[#8127CF] text-white',
    icon: MessageSquare,
  },
  {
    id: 'games',
    label: 'MINIJUEGOS_SENSORIALES',
    detail: 'sin game over, sin frustración',
    tag: 'PLAY',
    tagClass: 'bg-[#FFA5AE]',
    icon: Gamepad2,
  },
  {
    id: 'sounds',
    label: 'AMBIENTES_SONOROS',
    detail: 'lluvia, océano, ruido blanco',
    tag: 'RELAX',
    tagClass: 'bg-[#2DD4BF]',
    icon: Headphones,
  },
  {
    id: 'journal',
    label: 'ESCRIBIR_DIARIO',
    detail: 'journaling guiado por ia',
    tag: 'DIARIO',
    tagClass: 'bg-[#8127CF] text-white',
    icon: BookOpen,
  },
  {
    id: 'unknown',
    label: 'NO_LO_SÉ_TODAVÍA',
    detail: 'mostrarme todo en el dashboard',
    tag: 'SKIP',
    tagClass: 'bg-[#FFA5AE]',
    icon: HelpCircle,
  },
];

const detectTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Madrid';
  } catch {
    return 'Europe/Madrid';
  }
};

function toggleValue(values: string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

function firstName(name?: string | null): string {
  return name?.trim().split(/\s+/)[0] || 'Alex';
}

export function OnboardingPage() {
  const { user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const timezone = useMemo(detectTimezone, []);
  const fallbackName = useMemo(() => firstName(user?.name), [user?.name]);
  const contactNameInputRef = useRef<HTMLInputElement>(null);

  const [screen, setScreen] = useState(0);
  const [preferredName, setPreferredName] = useState('');
  const [pronouns, setPronouns] = useState('él');
  const [goals, setGoals] = useState<string[]>(['anxiety', 'stress', 'rumination']);
  const [moodIntensity, setMoodIntensity] = useState(7);
  const [moodLabel, setMoodLabel] = useState('bien');
  const [anxietyTriggers, setAnxietyTriggers] = useState<string[]>(['night', 'work']);
  const [frequency, setFrequency] = useState<(typeof frequencyOptions)[number]>('semanal');
  const [toolPreferences, setToolPreferences] = useState<string[]>([
    'breathing',
    'sounds',
    'journal',
  ]);
  const [contactEnabled, setContactEnabled] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactRelationship, setContactRelationship] = useState('FAMILIA');
  const [sosMessage, setSosMessage] = useState(
    'Hola, necesito ayuda. Estoy teniendo una crisis de ansiedad y agradecería que me contactaras lo antes posible.',
  );
  const [moodReminderEnabled, setMoodReminderEnabled] = useState(true);
  const [quickMeditationEnabled, setQuickMeditationEnabled] = useState(true);
  const [streakEnabled, setStreakEnabled] = useState(true);
  const [weeklyCheckinEnabled, setWeeklyCheckinEnabled] = useState(false);
  const [dailyReminderTime, setDailyReminderTime] = useState('21:00');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const displayName = preferredName.trim() || fallbackName;
  const isFinal = screen === 8;

  useEffect(() => {
    if (screen === 6 && contactEnabled) {
      contactNameInputRef.current?.focus();
    }
  }, [screen, contactEnabled]);

  const openTrustedContactForm = () => {
    setError(null);
    setContactEnabled(true);
    setContactRelationship((value) => value || 'FAMILIA');
  };

  const goNext = () => {
    setError(null);
    setScreen((current) => Math.min(current + 1, 8));
  };

  const goBack = () => {
    setError(null);
    setScreen((current) => Math.max(current - 1, 0));
  };

  const skipQuestion = () => {
    if (screen === 1 && !preferredName.trim()) {
      setPreferredName(fallbackName);
    }
    goNext();
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isFinal) {
      goNext();
      return;
    }

    const normalizedName = displayName.trim();
    if (normalizedName.length < 2) {
      setScreen(1);
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    const hasPartialContact = contactEnabled && [contactName, contactPhone, contactRelationship].some((value) => value.trim());
    if (hasPartialContact && (!contactName.trim() || !contactPhone.trim())) {
      setScreen(6);
      setError('Completa nombre y teléfono del contacto o elimina el contacto.');
      return;
    }

    const payload: CompleteOnboardingPayload = {
      preferredName: normalizedName,
      language: 'es',
      timezone,
      privacyAccepted: CONSENT_GRANTED,
      termsAccepted: CONSENT_GRANTED,
      supportOnlyAccepted: CONSENT_GRANTED,
      ageConfirmed: CONSENT_GRANTED,
      goals,
      anxietyTriggers: [...anxietyTriggers, `frequency:${frequency}`],
      currentMood: {
        label: moodLabel,
        intensity: moodIntensity,
      },
      toolPreferences,
      notifications: {
        enabled:
          moodReminderEnabled ||
          quickMeditationEnabled ||
          streakEnabled ||
          weeklyCheckinEnabled,
        dailyReminderTime,
        timezone,
        moodReminderEnabled,
        quickMeditationEnabled,
        quickMeditationPeriods: ['morning', 'night'],
        streakEnabled,
        weeklyCheckinEnabled,
        weeklyCheckinDay: 'sunday',
        weeklyCheckinTime: '19:00',
      },
      trustedContact:
        contactEnabled && contactName.trim() && contactPhone.trim()
          ? {
              name: contactName.trim(),
              phone: contactPhone.trim(),
              relationship: contactRelationship.trim() || undefined,
            }
          : undefined,
    };

    setLoading(true);
    try {
      await completeOnboarding(payload);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo completar el onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="relative h-dvh overflow-hidden bg-[#f9f9f9] font-mono text-[#1b1b1b]"
    >
      <AuraBlobs />
      {screen === 0 ? (
        <WelcomeScreen onStart={goNext} onSkip={skipQuestion} />
      ) : (
        <>
          <TopBar
            activeStep={screen}
            final={isFinal}
            variant={screen === 6 || screen === 7 ? 'wide' : 'segments'}
            onSkip={skipQuestion}
          />
          <main className="relative z-10 h-[calc(100dvh-122px)] overflow-y-auto overflow-x-hidden px-4 pb-7 pt-3 md:px-6 lg:px-8">
            {renderScreen()}
            {error && (
              <div
                role="alert"
                className="mx-auto mt-8 max-w-5xl border-4 border-black bg-[#FB7185] px-5 py-4 font-mono text-xs font-black uppercase text-black shadow-[8px_8px_0_#000]"
              >
                ERR_ONBOARDING: {error}
              </div>
            )}
          </main>
          <Footer
            activeStep={screen}
            final={isFinal}
            loading={loading}
            onBack={goBack}
          />
        </>
      )}
    </form>
  );

  function renderScreen() {
    switch (screen) {
      case 1:
        return (
          <section className="aura-screen grid gap-8 lg:grid-cols-[38%_1fr] lg:items-center">
            <div className="space-y-6">
              <ProgressSegments active={1} className="justify-start" />
              <div>
                <h1 className="aura-onboarding-title max-w-4xl">¿CÓMO_TE_LLAMAMOS?</h1>
                <p className="aura-screen-copy mt-5 max-w-lg">
                  Solo necesitamos un nombre o apodo. No tiene que ser real.
                </p>
              </div>
            </div>

            <div className="space-y-10">
              <input
                aria-label="NOMBRE_PREFERIDO"
                className="h-24 w-full border-4 border-black bg-white px-6 font-headline text-2xl font-black uppercase text-black shadow-[6px_6px_0_#000] outline-none placeholder:text-[#bacac5] focus:border-[#006b5f] md:text-3xl"
                placeholder="ESCRIBE_AQUÍ_TU_NOMBRE"
                type="text"
                value={preferredName}
                onChange={(event) => setPreferredName(event.target.value)}
              />

              <div className="space-y-4">
                <p className="font-mono text-sm font-black uppercase tracking-[0.08em]">
                  ¿PRONOMBRES?
                </p>
                <div className="flex flex-wrap gap-2">
                  {['él', 'ella', 'elle', 'prefiero_no_decir'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setPronouns(option)}
                      className={cn(
                        'border-4 border-black px-5 py-3 font-mono text-xs font-black uppercase tracking-[0.08em] transition-transform',
                        pronouns === option
                          ? 'bg-[#8127CF] text-white shadow-[4px_4px_0_#000]'
                          : 'bg-white text-black hover:bg-[#e2e2e2]',
                      )}
                    >
                      {option.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <p className="border-l-4 border-[#006b5f] pl-4 font-mono text-xs font-black uppercase tracking-[0.08em] text-[#6b7a76]">
                // LO_USAREMOS_PARA_PERSONALIZAR_TU_EXPERIENCIA
              </p>
            </div>
          </section>
        );
      case 2:
        return (
          <section className="aura-screen text-center">
            <h1 className="aura-onboarding-title">¿QUÉ_QUIERES_MEJORAR?</h1>
            <p className="aura-screen-copy mx-auto mt-5 max-w-2xl">
              Elige todas las que apliquen. Sin límite.
            </p>

            <div className="mx-auto mt-7 grid max-w-[1040px] gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {goalOptions.map((option) => {
                const active = goals.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setGoals(toggleValue(goals, option.id))}
                    className={cn(
                      'relative flex min-h-28 flex-col items-center justify-center border-4 border-black p-3 transition-transform',
                      active
                        ? `${option.activeClass} translate-x-1 translate-y-1 shadow-[8px_8px_0_#000]`
                        : 'bg-white hover:-translate-y-1 hover:shadow-[8px_8px_0_#000]',
                    )}
                  >
                    {active && (
                      <Check className="absolute right-3 top-3 h-6 w-6 text-[#FB7185]" strokeWidth={3} />
                    )}
                    <span className="text-3xl">{option.icon}</span>
                    <span className="mt-4 break-words text-center font-mono text-[11px] font-black uppercase tracking-[0.08em]">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mx-auto mt-8 w-max border-4 border-black bg-[#eeeeee] px-6 py-2 font-mono text-xs font-black uppercase tracking-[0.12em]">
              SELECCIONADAS: {String(goals.length).padStart(2, '0')}
            </div>
          </section>
        );
      case 3:
        return (
          <section className="aura-screen text-center">
            <h1 className="aura-onboarding-title">¿CÓMO_TE_SIENTES_AHORA?</h1>
            <p className="aura-screen-copy mx-auto mt-5 max-w-2xl">
              Esta será tu línea base. Mediremos tu progreso desde aquí.
            </p>

            <div className="mt-8 font-headline text-[72px] font-black leading-none text-[#8127CF]">
              {String(moodIntensity).padStart(2, '0')}
            </div>

            <div className="mx-auto mt-8 max-w-3xl">
              <input
                aria-label="INTENSIDAD_MOOD"
                min={1}
                max={10}
                type="range"
                value={moodIntensity}
                onChange={(event) => setMoodIntensity(Number(event.target.value))}
                className="aura-brutal-range"
              />
              <div className="mt-5 flex justify-between gap-4 font-mono text-xs font-black uppercase tracking-[0.1em]">
                <span className="text-[#FB7185]">1: MUY_ANSIOSO</span>
                <span className="text-[#2DD4BF]">10: EN_CALMA_TOTAL</span>
              </div>
            </div>

            <div className="mx-auto my-12 max-w-4xl border-t-2 border-dashed border-black" />

            <h2 className="font-mono text-sm font-black uppercase tracking-[0.18em]">
              Y_TU_ENERGÍA_HOY?
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-5">
              {moodOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setMoodLabel(option.id)}
                  className={cn(
                    'flex h-16 w-16 items-center justify-center bg-white text-3xl transition-transform',
                    moodLabel === option.id
                      ? 'translate-x-1 -translate-y-2 bg-[#ddb7ff] shadow-[8px_8px_0_#000]'
                      : 'hover:-translate-y-1',
                  )}
                >
                  {option.emoji}
                </button>
              ))}
            </div>

            <p className="mt-12 font-mono text-xs font-black uppercase tracking-[0.06em]">
              // NO_HAY_RESPUESTA_CORRECTA. SOLO_TU_VERDAD.
            </p>
          </section>
        );
      case 4:
        return (
          <section className="aura-screen">
            <h1 className="aura-onboarding-title max-w-[1500px]">
              ¿CUÁNDO_APARECE_LA_ANSIEDAD?
            </h1>
            <p className="aura-screen-copy mt-5">
              Nos ayuda a estar disponibles cuando más nos necesites.
            </p>

            <p className="mt-10 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#6b7a76]">
              // MOMENTOS_FRECUENTES
            </p>
            <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {triggerOptions.map((option) => {
                const active = anxietyTriggers.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAnxietyTriggers(toggleValue(anxietyTriggers, option.id))}
                    className={cn(
                      'relative flex min-h-28 flex-col items-center justify-center border-4 border-black p-4 transition-transform',
                      active
                        ? 'translate-x-[-4px] translate-y-[-4px] bg-[#62FAE3]/25 shadow-[8px_8px_0_#000]'
                        : 'bg-white hover:translate-x-1 hover:translate-y-1',
                    )}
                  >
                    {active && (
                      <span className="absolute right-3 top-3 grid h-8 w-8 place-items-center border-4 border-black bg-[#A93349] text-white">
                        <Check className="h-5 w-5" strokeWidth={4} />
                      </span>
                    )}
                    <span className="text-3xl">{option.icon}</span>
                    <span className="mt-4 break-words text-center font-mono text-xs font-black uppercase tracking-[0.08em]">
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <p className="mt-12 font-mono text-sm font-black uppercase tracking-[0.12em] text-[#6b7a76]">
              // FRECUENCIA_DE_CRISIS_INTENSAS
            </p>
            <div className="mt-4 flex max-w-4xl flex-wrap">
              {frequencyOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFrequency(option)}
                  className={cn(
                    'min-w-32 border-4 border-black px-6 py-3 font-mono text-sm font-black uppercase tracking-[0.1em]',
                    frequency === option
                      ? 'translate-x-[-2px] translate-y-[-2px] bg-[#8127CF] text-white shadow-[4px_4px_0_#000]'
                      : 'bg-white text-black hover:bg-[#e2e2e2]',
                  )}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
        );
      case 5:
        return (
          <section className="aura-screen">
            <h1 className="aura-onboarding-title">¿QUÉ_TE_FUNCIONA_MEJOR?</h1>
            <p className="aura-screen-copy mt-5">
              Personalizaremos tus accesos rápidos según esto.
            </p>

            <div className="mt-7 grid gap-4 lg:grid-cols-3">
              {toolOptions.map((option) => {
                const Icon = option.icon;
                const active = toolPreferences.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setToolPreferences(toggleValue(toolPreferences, option.id))}
                    className={cn(
                      'relative flex min-h-36 flex-col border-4 border-black p-5 text-left transition-transform',
                      active
                        ? option.id === 'sounds'
                          ? 'bg-[#2DD4BF]/25 shadow-[6px_6px_0_#000]'
                          : 'bg-[#F0DBFF]/25 shadow-[6px_6px_0_#000]'
                        : 'bg-white shadow-[6px_6px_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_#000]',
                    )}
                  >
                    {active && (
                      <span className="absolute right-5 top-5 grid h-8 w-8 place-items-center bg-black font-mono text-base font-black text-white">
                        X
                      </span>
                    )}
                    <Icon
                      className={cn(
                        'mb-auto h-9 w-9',
                        option.id === 'chat' || option.id === 'journal'
                          ? 'text-[#8127CF]'
                          : option.id === 'sounds'
                            ? 'text-[#006b5f]'
                            : 'text-black',
                      )}
                      strokeWidth={3}
                    />
                    <h2 className="mt-5 break-words font-headline text-xl font-black uppercase leading-none">
                      {option.label}
                    </h2>
                    <p className="mt-2 max-w-sm text-sm leading-5">{option.detail}</p>
                    <span
                      className={cn(
                        'mt-5 inline-flex w-max border-0 px-3 py-1 font-mono text-xs font-black uppercase tracking-[0.12em]',
                        option.tagClass,
                      )}
                    >
                      {option.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        );
      case 6:
        return (
          <section className="aura-screen max-w-[920px]">
            <h1 className="aura-onboarding-title max-w-[1500px]">
              ¿QUIÉN_PUEDE_AYUDARTE_EN_CRISIS?
            </h1>
            <p className="aura-screen-copy mt-3">
              Configuremos tu red SOS. Podrás cambiarla cuando quieras.
            </p>

            <div className="mt-5 border-0 bg-[#FFA5AE] px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.1em] shadow-[5px_5px_0_#000]">
              <Info className="mr-2 inline h-5 w-5" strokeWidth={3} />
              // PASO_OPCIONAL - PUEDES_CONFIGURARLO_DESPUÉS
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="border-b-[6px] border-r-[6px] border-black bg-white p-4">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <span className="font-mono text-xs font-black uppercase tracking-[0.12em]">
                    CONTACTO_01
                  </span>
                  {contactEnabled && (
                    <button
                      type="button"
                      onClick={() => {
                        setContactEnabled(false);
                        setContactName('');
                        setContactPhone('');
                        setContactRelationship('');
                      }}
                      className="border-4 border-black bg-[#BA1A1A] px-2 py-1 font-mono text-xs font-black uppercase text-white shadow-[4px_4px_0_#000] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    >
                      ELIMINAR_CONTACTO
                    </button>
                  )}
                </div>
                {contactEnabled ? (
                  <div className="space-y-3">
                    <FieldLabel label="NOMBRE">
                      <input
                        aria-label="CONTACTO_NOMBRE"
                        ref={contactNameInputRef}
                        className="aura-input"
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                      />
                    </FieldLabel>
                    <FieldLabel label="TELÉFONO">
                      <input
                        aria-label="CONTACTO_TELEFONO"
                        className="aura-input"
                        value={contactPhone}
                        onChange={(event) => setContactPhone(event.target.value)}
                      />
                    </FieldLabel>
                    <FieldLabel label="RELACIÓN">
                      <div className="relative">
                        <select
                          aria-label="RELACION"
                          className="aura-input appearance-none pr-12"
                          value={contactRelationship}
                          onChange={(event) => setContactRelationship(event.target.value)}
                        >
                          <option>FAMILIA</option>
                          <option>AMISTAD</option>
                          <option>PROFESIONAL</option>
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2" />
                      </div>
                    </FieldLabel>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openTrustedContactForm}
                    aria-expanded={contactEnabled}
                    className="flex min-h-32 w-full flex-col items-center justify-center gap-3 border-4 border-dashed border-black bg-[#eeeeee] font-mono text-xs font-black uppercase tracking-[0.12em] transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0_#000]"
                  >
                    <Plus className="h-9 w-9" />
                    + AÑADIR_CONTACTO
                  </button>
                )}
              </div>

              <aside className="flex min-h-36 flex-col justify-between border-4 border-black bg-[#2DD4BF]/20 p-4 shadow-[5px_5px_0_#000]">
                <div>
                  <h2 className="font-headline text-xl font-black uppercase leading-none">
                    RED_SOS_OPCIONAL
                  </h2>
                  <p className="mt-3 text-xs leading-5">
                    Si añades un contacto, lo guardaremos como contacto SOS activo. Si lo omites,
                    podrás configurarlo más tarde desde Contactos.
                  </p>
                </div>
                <div className="mt-4 border-4 border-black bg-white px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.1em] shadow-[4px_4px_0_#000]">
                  {contactEnabled ? 'SE_GUARDA_AL_FINALIZAR' : 'PUEDES_OMITIR_ESTE_PASO'}
                </div>
              </aside>
            </div>

            <div className="mt-5">
              <div className="flex justify-between">
                <label
                  htmlFor="sos-message"
                  className="font-mono text-xs font-black uppercase tracking-[0.1em]"
                >
                  // MENSAJE_QUE_RECIBIRÁN
                </label>
                <span className="font-mono text-xs font-black">{sosMessage.length}/280</span>
              </div>
              <textarea
                id="sos-message"
                className="mt-2 h-20 w-full resize-none border-4 border-black bg-white p-3 text-xs leading-5 shadow-[5px_5px_0_#000] outline-none focus:border-[#8127CF]"
                value={sosMessage}
                maxLength={280}
                onChange={(event) => setSosMessage(event.target.value)}
              />
            </div>
          </section>
        );
      case 7:
        return (
          <section className="aura-screen max-w-[940px]">
            <h1 className="aura-onboarding-title">¿CUÁNDO_TE_RECORDAMOS?</h1>
            <p className="aura-screen-copy mt-5">
              Sin spam. Solo cuando elijas.
            </p>

            <div className="mt-5 border-0 bg-[#e2e2e2] px-5 py-4 font-mono text-xs font-black uppercase tracking-[0.08em] shadow-[6px_6px_0_#000]">
              <Info className="mr-3 inline h-7 w-7" strokeWidth={3} />
              // PUEDES_DESACTIVAR_TODO_DESDE_CONFIGURACIÓN
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <NotificationCard
                icon={<BarChart3 className="h-8 w-8" strokeWidth={3} />}
                title="RECORDATORIO_MOOD_DIARIO"
                enabled={moodReminderEnabled}
                onToggle={() => setMoodReminderEnabled((value) => !value)}
              >
                <label
                  htmlFor="daily-reminder-time"
                  className="mt-5 block font-mono text-xs font-black uppercase tracking-[0.12em]"
                >
                  HORA:
                </label>
                <input
                  id="daily-reminder-time"
                  aria-label="HORA_RECORDATORIO"
                  className="mt-2 w-full border-2 border-black bg-white px-3 py-2 text-lg outline-none"
                  type="time"
                  value={dailyReminderTime}
                  onChange={(event) => setDailyReminderTime(event.target.value)}
                />
              </NotificationCard>
              <NotificationCard
                icon={<span className="text-3xl">🧘</span>}
                title="MEDITACIÓN_RÁPIDA_3_MIN"
                enabled={quickMeditationEnabled}
                onToggle={() => setQuickMeditationEnabled((value) => !value)}
              >
                <div className="mt-8 flex flex-wrap gap-2">
                  <SmallAccentButton active>MAÑANA</SmallAccentButton>
                  <SmallAccentButton>TARDE</SmallAccentButton>
                  <SmallAccentButton active>NOCHE</SmallAccentButton>
                </div>
              </NotificationCard>
              <NotificationCard
                icon={<Flame className="h-8 w-8" strokeWidth={3} />}
                title="RACHA_DE_USO"
                enabled={streakEnabled}
                onToggle={() => setStreakEnabled((value) => !value)}
              >
                <p className="mt-8 font-mono text-xs font-black uppercase tracking-[0.08em]">
                  MOTIVACIONAL, SIN CULPA POR DÍAS SALTADOS
                </p>
              </NotificationCard>
              <NotificationCard
                icon={<CalendarDays className="h-8 w-8" strokeWidth={3} />}
                title="CHECK-IN_SEMANAL"
                enabled={weeklyCheckinEnabled}
                onToggle={() => setWeeklyCheckinEnabled((value) => !value)}
              >
                <p className="mt-8 font-mono text-xs font-black uppercase tracking-[0.08em]">
                  RESUMEN LOS DOMINGOS A LAS 19:00
                </p>
              </NotificationCard>
            </div>
          </section>
        );
      default:
        return (
          <section className="aura-screen max-w-[880px]">
            <h1 className="aura-onboarding-title text-[clamp(1.8rem,3.4vw,3.2rem)]">
              LISTO, {displayName.toUpperCase()}_
            </h1>
            <p className="aura-screen-copy mt-3">
              Tu refugio digital está preparado.
            </p>

            <div className="mt-4 border-4 border-black bg-[#080808] p-4 text-white shadow-[8px_8px_0_#A855F7] md:p-5">
              <div className="grid gap-4 md:grid-cols-[1fr_1px_1fr]">
                <div className="space-y-3">
                  <SummaryBlock
                    label="OBJETIVOS_PRIORITARIOS"
                    value={summaryGoals()}
                  />
                  <SummaryBlock
                    label="ENERGÍA_INICIAL"
                    value={moodOptions.find((item) => item.id === moodLabel)?.emoji ?? '🙂'}
                  />
                  <SummaryBlock
                    label="FRECUENCIA_DE_CRISIS"
                    value={capitalize(frequency)}
                  />
                  <SummaryBlock
                    label="CONTACTOS_SOS"
                    value={summaryContact()}
                  />
                </div>
                <div className="hidden bg-white/30 md:block" />
                <div className="space-y-3">
                  <SummaryBlock label="LÍNEA_BASE_EMOCIONAL" value={`${moodIntensity}/10`} />
                  <SummaryBlock label="MOMENTOS_CRÍTICOS" value={summaryTriggers()} />
                  <SummaryBlock label="HERRAMIENTAS_FAVORITAS" value={summaryTools()} />
                  <SummaryBlock label="RECORDATORIOS_ACTIVOS" value={summaryNotifications()} />
                  <SummaryBlock label="IDIOMA_Y_ZONA" value={`Español · ${timezone}`} />
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-4">
              <Badge icon={<Lock className="h-5 w-5" />}>DATOS_ENCRIPTADOS</Badge>
              <Badge icon={<Shield className="h-5 w-5" />}>CUMPLE_GDPR</Badge>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mx-auto mt-5 flex w-full max-w-md items-center justify-center border-4 border-black bg-gradient-to-r from-[#A855F7] to-[#FB7185] px-7 py-3 font-headline text-lg font-black uppercase text-white shadow-[6px_6px_0_#000] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_#000] disabled:opacity-60 md:text-xl"
            >
              {loading ? 'CARGANDO' : 'ENTRAR_A_MI_REFUGIO'}
            </button>

            <div className="mt-4 border-y-4 border-black bg-[#1b1b1b] px-3 py-2 text-center font-mono text-[10px] font-black uppercase tracking-[0.08em] text-white">
              // AURA AI NO SUSTITUYE ATENCIÓN PROFESIONAL. EN CRISIS GRAVE LLAMA AL 024
            </div>
          </section>
        );
    }
  }

  function summaryGoals(): string {
    const labels = goals
      .map((id) => goalOptions.find((option) => option.id === id)?.label.replaceAll('_', ' '))
      .filter(Boolean)
    return labels.length ? labels.join(', ') : 'Sin prioridad';
  }

  function summaryTriggers(): string {
    const labels = anxietyTriggers
      .map((id) => triggerOptions.find((option) => option.id === id)?.label.replaceAll('_', ' '))
      .filter(Boolean)
    return labels.length ? labels.join(', ') : 'Sin momentos críticos';
  }

  function summaryTools(): string {
    const labels = toolPreferences
      .map((id) => toolOptions.find((option) => option.id === id)?.label.replaceAll('_', ' '))
      .filter(Boolean);
    return labels.length ? labels.join(', ') : 'Dashboard completo';
  }

  function summaryNotifications(): string {
    const items = [
      moodReminderEnabled ? `Mood diario (${dailyReminderTime})` : null,
      quickMeditationEnabled ? 'Meditación rápida' : null,
      streakEnabled ? 'Racha de uso' : null,
      weeklyCheckinEnabled ? 'Check-in semanal' : null,
    ].filter(Boolean);
    return items.length ? items.join(', ') : 'Desactivados';
  }

  function summaryContact(): string {
    if (!contactEnabled || !contactName.trim() || !contactPhone.trim()) {
      return 'Omitido';
    }
    return [contactName.trim(), contactPhone.trim(), contactRelationship.trim()]
      .filter(Boolean)
      .join(' · ');
  }
}

function AuraBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -left-40 top-12 h-[560px] w-[560px] rounded-full bg-[#2DD4BF]/25 blur-[80px]" />
      <div className="absolute -right-32 bottom-8 h-[680px] w-[680px] rounded-full bg-[#A855F7]/25 blur-[80px]" />
      <div className="absolute bottom-20 left-1/2 h-[460px] w-[460px] rounded-full bg-[#FB7185]/20 blur-[80px]" />
    </div>
  );
}

function WelcomeScreen({ onStart, onSkip }: { onStart: () => void; onSkip: () => void }) {
  return (
    <>
      <nav className="fixed left-0 top-0 z-50 flex h-14 w-full items-center justify-between border-b-[5px] border-black bg-[#f9f9f9] px-5 shadow-[6px_6px_0_#000] md:px-8">
        <div className="font-headline text-3xl font-black leading-none">Aura AI</div>
        <button
          type="button"
          onClick={onSkip}
          className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#006b5f] transition-transform hover:translate-x-1 hover:translate-y-1 md:tracking-[0.28em]"
        >
          SALTAR_ONBOARDING
        </button>
      </nav>
      <main className="relative z-10 flex h-dvh items-center justify-center overflow-y-auto px-5 pb-8 pt-20 text-center">
        <div className="mx-auto flex max-w-[1000px] flex-col items-center">
          <EqualizerOrb />
          <div className="mb-4 mt-6 bg-[#2DD4BF] px-4 py-2 font-mono text-xs font-black uppercase tracking-[0.14em] text-[#00574d]">
            DURACIÓN_ESTIMADA: DOS_MINUTOS
          </div>
          <h1 className="aura-onboarding-title">
            BIENVENIDO_A_TU_REFUGIO
          </h1>
          <p className="aura-screen-copy mx-auto mt-5 max-w-3xl">
            Vamos a conocerte en 2 minutos. Sin prisas. Sin juicios.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-7 w-full max-w-md border-4 border-black bg-gradient-to-r from-[#8127CF] to-[#A93349] px-8 py-4 font-headline text-xl font-black uppercase text-white shadow-[6px_6px_0_#000] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_#000] md:text-2xl"
          >
            COMENZAR_VIAJE
          </button>
          <p className="mt-4 max-w-md font-mono text-xs font-black leading-4 text-[#6b7a76]">
            Puedes saltarte cualquier pregunta. Tus respuestas son privadas y encriptadas.
          </p>
        </div>
      </main>
    </>
  );
}

function EqualizerOrb() {
  return (
    <div className="aura-eq-orb" aria-hidden="true">
      <div className="aura-eq-orb__glow" />
      <div className="aura-eq-orb__bars">
        {Array.from({ length: 13 }, (_, index) => (
          <span key={index} style={{ animationDelay: `${index * 90}ms` }} />
        ))}
      </div>
    </div>
  );
}

function TopBar({
  activeStep,
  final,
  variant,
  onSkip,
}: {
  activeStep: number;
  final: boolean;
  variant: 'segments' | 'wide';
  onSkip: () => void;
}) {
  return (
    <nav className="relative z-40 flex h-14 items-center justify-between gap-4 border-b-[5px] border-black bg-[#f9f9f9] px-5 md:px-7">
      <div className="shrink-0 font-headline text-3xl font-black leading-none">Aura AI</div>
      {final ? (
        <span className="font-mono text-sm font-black uppercase tracking-[0.2em] text-[#8127CF]">
          PASO_08_DE_08
        </span>
      ) : variant === 'wide' ? (
        <WideProgress active={activeStep} />
      ) : (
        <ProgressSegments active={activeStep} />
      )}
      {!final && (
        <button
          type="button"
          onClick={onSkip}
          className={cn(
            'shrink-0 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#1b1b1b] transition-transform hover:translate-x-1 hover:translate-y-1',
            activeStep === 2 || activeStep === 7
              ? 'border-4 border-black bg-white px-4 py-2 shadow-[6px_6px_0_#000]'
              : 'text-[#006b5f]',
          )}
        >
          SALTAR_ONBOARDING
        </button>
      )}
    </nav>
  );
}

function Footer({
  activeStep,
  final,
  loading,
  onBack,
}: {
  activeStep: number;
  final: boolean;
  loading: boolean;
  onBack: () => void;
}) {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 flex h-[68px] items-center justify-between gap-3 border-t-[5px] border-black bg-[#f9f9f9] px-5 md:px-8">
      <button
        type="button"
        onClick={onBack}
        disabled={activeStep === 0 || loading}
        className="border-0 bg-transparent font-mono text-xs font-black uppercase tracking-[0.14em] text-black disabled:opacity-40"
      >
        ATRÁS
      </button>
      <span
        className={cn(
          'hidden font-mono text-xs font-black uppercase tracking-[0.16em] sm:block',
          final ? 'text-[#8127CF]' : 'text-[#3c4a46]',
        )}
      >
        {final ? 'PASO_08_DE_08 - COMPLETADO' : `PASO_${String(activeStep).padStart(2, '0')}_DE_08`}
      </span>
      {final ? (
        <button
          type="submit"
          disabled={loading}
          className="border-4 border-black bg-[#A855F7] px-5 py-3 font-mono text-xs font-black uppercase tracking-[0.1em] text-white shadow-[4px_4px_0_#000] disabled:opacity-60 md:px-8"
        >
          {loading ? 'CARGANDO' : 'PASO_08_DE_08 - COMPLETADO'}
        </button>
      ) : (
        <button
          type="submit"
          className="border-4 border-black bg-[#8127CF] px-7 py-3 font-mono text-xs font-black uppercase tracking-[0.12em] text-white shadow-[4px_4px_0_#000] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none md:px-10"
        >
          CONTINUAR
        </button>
      )}
    </footer>
  );
}

function ProgressSegments({ active, className }: { active: number; className?: string }) {
  return (
    <div className={cn('flex items-center justify-center gap-1', className)}>
      {Array.from({ length: TOTAL_ONBOARDING_STEPS }, (_, index) => (
        <span
          key={index}
          className={cn(
            'h-3 w-5 border-2 border-black shadow-[2px_2px_0_#000] sm:w-8 md:w-12',
            index < active ? 'bg-[#8127CF]' : 'bg-[#eeeeee]',
          )}
        />
      ))}
    </div>
  );
}

function WideProgress({ active }: { active: number }) {
  const width = `${Math.min(active / TOTAL_ONBOARDING_STEPS, 1) * 100}%`;
  return (
    <div className="hidden h-6 w-[44vw] max-w-[680px] border-0 md:block">
      <div className="h-3 border-2 border-black bg-white shadow-[6px_6px_0_#000]">
        <div className="h-full bg-[#A855F7]" style={{ width }} />
      </div>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="font-mono text-xs font-black uppercase tracking-[0.08em] text-[#3c4a46]">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function NotificationCard({
  icon,
  title,
  enabled,
  onToggle,
  children,
}: {
  icon: ReactNode;
  title: string;
  enabled: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <article className="border-4 border-black bg-white p-5 shadow-[6px_6px_0_#000]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {icon}
          <h2 className="break-words font-headline text-xl font-black uppercase leading-none">
            {title.replace('_', '_\n').split('\n').map((part) => (
              <span key={part} className="block">
                {part}
              </span>
            ))}
          </h2>
        </div>
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={enabled}
          className={cn(
            'relative h-9 w-16 shrink-0 border-4 border-black',
            enabled ? 'bg-[#2DD4BF]' : 'bg-white',
          )}
        >
          <span
            className={cn(
              'absolute top-0 h-7 w-7 bg-[#A855F7] transition-transform',
              enabled ? 'right-0' : 'left-0 bg-white',
            )}
          />
        </button>
      </div>
      {children}
    </article>
  );
}

function SmallAccentButton({ active, children }: { active?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        'border-4 border-black px-3 py-2 font-mono text-[11px] font-black uppercase tracking-[0.08em]',
        active ? 'bg-[#2DD4BF] shadow-[6px_6px_0_#000]' : 'bg-[#e2e2e2] text-[#3c4a46]',
      )}
    >
      {children}
    </button>
  );
}

function SummaryBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="break-words font-mono text-[10px] font-black uppercase tracking-[0.14em] text-[#2DD4BF]">
        {label}
      </div>
      <div className="mt-1 break-words text-base leading-6">{value}</div>
    </div>
  );
}

function Badge({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 bg-white px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.1em] shadow-[5px_5px_0_#000]">
      {icon}
      {children}
    </span>
  );
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

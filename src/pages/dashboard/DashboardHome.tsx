import { useNavigate } from 'react-router-dom';
import { Siren, Bot, Smile, BookOpen } from 'lucide-react';
import { Button, Skeleton, SkeletonText } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const greetingFor = (hour: number): string => {
  if (hour < 12) return 'BUENOS_DÍAS_';
  if (hour < 18) return 'BUENAS_TARDES_';
  return 'BUENAS_NOCHES_';
};

const formatToday = (): string => {
  const d = new Date();
  return d
    .toLocaleDateString('es-ES', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase()
    .replace(/\./g, '');
};

export function DashboardHome() {
  const { user, isHydrating } = useAuth();
  const navigate = useNavigate();
  const greet = greetingFor(new Date().getHours());

  const quickAccess = [
    { label: 'BOTÓN_SOS', path: '/dashboard/sos', icon: Siren, accent: 'bg-brutal-coral' },
    { label: 'CHATBOT_IA', path: '/dashboard/chatbot', icon: Bot, accent: 'bg-brutal-purple' },
    { label: 'MOOD_HOY', path: '/dashboard/mood', icon: Smile, accent: 'bg-brutal-teal' },
    { label: 'DIARIO', path: '/dashboard/diario', icon: BookOpen, accent: 'bg-brutal-black' },
  ];

  if (isHydrating) {
    return <DashboardHomeSkeleton />;
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Hero card */}
      <div className="border-4 border-brutal-black bg-white/85 p-8 shadow-brutal backdrop-blur-md dark:bg-zinc-900/85 dark:text-white">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted dark:text-zinc-400">
          {greet}{' '}
          <span className="text-brutal-purple">
            {user?.name?.split(' ')[0]?.toUpperCase() ?? 'USUARIO'}
          </span>
        </p>
        <h1 className="mt-2 font-headline text-4xl font-black uppercase leading-none tracking-tighter lg:text-5xl">
          ¿CÓMO_ESTÁS_HOY?
        </h1>
        <p className="mt-3 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-zinc-400">
          {formatToday()} · <span className="text-brutal-teal">REGISTRA_TU_ESTADO_EMOCIONAL</span>
        </p>
      </div>

      {/* Quick access */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickAccess.map(({ label, path, icon: Icon, accent }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="group flex flex-col items-start gap-3 border-4 border-brutal-black bg-white/85 p-5 text-left shadow-brutal-sm backdrop-blur-sm transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0 active:translate-y-0 active:shadow-none dark:bg-zinc-900/85 dark:text-white"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center border-2 border-brutal-black ${accent} text-white`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-mono text-[11px] font-bold uppercase tracking-widest">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Hito notice */}
      <div className="mt-6 border-4 border-brutal-black bg-brutal-purple/10 p-6 backdrop-blur-md dark:bg-brutal-purple/20 dark:text-white">
        <span className="inline-block border-2 border-brutal-black bg-brutal-purple px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
          HITO_4_COMPLETADO
        </span>
        <h2 className="mt-3 font-headline text-2xl font-black uppercase tracking-tighter">
          AUTH_+_DASHBOARD_LAYOUT
        </h2>
        <p className="mt-2 font-mono text-[11px] font-bold uppercase leading-relaxed tracking-wider text-ink-muted dark:text-zinc-300">
          Sesión activa. Sidebar y drawer móvil operativos. Próximo hito: SOS, chatbot IA y mood
          tracker funcional.
        </p>
        <Button
          variant="black"
          size="sm"
          className="mt-4"
          onClick={() => navigate('/dashboard/sos')}
        >
          EXPLORAR_MÓDULOS →
        </Button>
      </div>
    </div>
  );
}

function DashboardHomeSkeleton() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="border-4 border-brutal-black bg-white/85 p-8 shadow-brutal backdrop-blur-md dark:bg-zinc-900/85">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="mt-4 h-10 w-3/5" />
        <Skeleton className="mt-3 h-3 w-1/2" />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="border-4 border-brutal-black bg-white/85 p-5 shadow-brutal-sm backdrop-blur-sm dark:bg-zinc-900/85"
          >
            <Skeleton className="mb-3 h-10 w-10" bordered />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
      <div className="mt-6 border-4 border-brutal-black bg-white/85 p-6 dark:bg-zinc-900/85">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-6 w-2/5" />
        <SkeletonText className="mt-3" lines={2} />
      </div>
    </div>
  );
}

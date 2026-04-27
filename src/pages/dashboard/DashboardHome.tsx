import { useNavigate } from 'react-router-dom';
import { Siren, Bot, Smile, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const greet = greetingFor(new Date().getHours());

  const quickAccess = [
    { label: 'BOTÓN_SOS', path: '/dashboard/sos', icon: Siren, accent: 'bg-brutal-coral' },
    { label: 'CHATBOT_IA', path: '/dashboard/chatbot', icon: Bot, accent: 'bg-brutal-purple' },
    { label: 'MOOD_HOY', path: '/dashboard/mood', icon: Smile, accent: 'bg-brutal-teal' },
    { label: 'DIARIO', path: '/dashboard/diario', icon: BookOpen, accent: 'bg-brutal-black' },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      {/* Hero card */}
      <div className="border-4 border-brutal-black bg-white/85 p-8 shadow-brutal backdrop-blur-md">
        <p className="font-mono text-[11px] font-bold uppercase tracking-widest text-ink-muted">
          {greet}{' '}
          <span className="text-brutal-purple">
            {user?.name?.split(' ')[0]?.toUpperCase() ?? 'USUARIO'}
          </span>
        </p>
        <h1 className="mt-2 font-headline text-4xl font-black uppercase leading-none tracking-tighter lg:text-5xl">
          ¿CÓMO_ESTÁS_HOY?
        </h1>
        <p className="mt-3 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted">
          {formatToday()} · <span className="text-brutal-teal">REGISTRA_TU_ESTADO_EMOCIONAL</span>
        </p>
      </div>

      {/* Quick access */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickAccess.map(({ label, path, icon: Icon, accent }) => (
          <button
            key={label}
            onClick={() => navigate(path)}
            className="group flex flex-col items-start gap-3 border-4 border-brutal-black bg-white/85 p-5 text-left shadow-brutal-sm backdrop-blur-sm transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal active:translate-x-0 active:translate-y-0 active:shadow-none"
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
      <div className="mt-6 border-4 border-brutal-black bg-brutal-purple/10 p-6 backdrop-blur-md">
        <span className="inline-block border-2 border-brutal-black bg-brutal-purple px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
          HITO_4_COMPLETADO
        </span>
        <h2 className="mt-3 font-headline text-2xl font-black uppercase tracking-tighter">
          AUTH_+_DASHBOARD_LAYOUT
        </h2>
        <p className="mt-2 font-mono text-[11px] font-bold uppercase leading-relaxed tracking-wider text-ink-muted">
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

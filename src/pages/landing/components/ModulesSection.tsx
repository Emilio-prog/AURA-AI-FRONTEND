import { ShieldAlert, MessageCircle, Activity, Headphones, Gamepad2 } from 'lucide-react';

interface ModuleCard {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string; // bg color class
  colSpan: string; // Tailwind md:col-span-*
  size?: 'lg' | 'sm';
}

const modules: ModuleCard[] = [
  {
    icon: <ShieldAlert className="h-10 w-10" />,
    title: 'Botón de Pánico SOS',
    description:
      'PROTOCOLO DE ENRAIZAMIENTO ACTIVADO CON UN CLIC. SIN DEMORAS. SIEMPRE DISPONIBLE.',
    accent: 'bg-brutal-coral/20',
    colSpan: 'md:col-span-8',
    size: 'lg',
  },
  {
    icon: <MessageCircle className="h-8 w-8" />,
    title: 'Chatbot IA',
    description: 'ANÁLISIS EMPÁTICO SIN FILTROS. PROCESAMIENTO 24/7.',
    accent: 'bg-brutal-purple/20',
    colSpan: 'md:col-span-4',
  },
  {
    icon: <Activity className="h-8 w-8" />,
    title: 'Mood Tracker',
    description: 'LOG_DIARIO_ESTADO_EMOCIONAL. SIN JUICIOS.',
    accent: 'bg-brutal-teal/20',
    colSpan: 'md:col-span-4',
  },
  {
    icon: <Headphones className="h-8 w-8 text-brutal-teal" />,
    title: 'AUDIO_DATA',
    description: 'MODULACIÓN DE FRECUENCIAS CEREBRALES VÍA BINAURAL.',
    accent: 'bg-white/80',
    colSpan: 'md:col-span-4',
  },
  {
    icon: <Gamepad2 className="h-8 w-8" />,
    title: 'Minijuegos',
    description: 'DISTRACCIÓN COGNITIVA CONTROLADA PARA CICLOS DE RUMIACIÓN.',
    accent: 'bg-white/60',
    colSpan: 'md:col-span-4',
  },
];

export function ModulesSection() {
  return (
    <section id="funcionalidades" className="relative z-10 px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 font-headline text-4xl font-black uppercase tracking-tighter lg:text-5xl">
          MÓDULOS_
          <br className="md:hidden" />
          OPERATIVOS
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {modules.map(({ icon, title, description, accent, colSpan, size }) => (
            <div
              key={title}
              className={`${colSpan} flex flex-col justify-between border-4 border-brutal-black p-6 shadow-brutal backdrop-blur-sm ${accent} transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[12px_12px_0_0_#000]`}
            >
              <div>
                <div className="mb-4">{icon}</div>
                <h3
                  className={`mb-3 font-headline font-black uppercase ${size === 'lg' ? 'text-3xl' : 'text-xl'}`}
                >
                  {title}
                </h3>
                <p className="font-mono text-xs font-bold uppercase leading-relaxed">
                  {description}
                </p>
              </div>

              {/* SOS accent bar */}
              {title.includes('SOS') && (
                <div className="mt-8 border-4 border-brutal-black bg-brutal-coral p-2 text-center font-mono text-xs font-bold uppercase text-white">
                  NIVEL_URGENCIA_ALTO
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

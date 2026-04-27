import { Sparkles, Wrench, Code2 } from 'lucide-react';

/**
 * Página de bienvenida del scaffolding (Hito 1).
 * Sirve como prueba visual de que los design tokens brutalistas funcionan.
 * Será reemplazada por la landing real en el Hito 3.
 */
export function WelcomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-surface">
      {/* Blobs decorativos */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div
          className="absolute -left-20 top-[45%] h-[420px] w-[420px] rounded-full opacity-50"
          style={{ background: 'rgba(255,180,190,0.45)', filter: 'blur(80px)' }}
        />
        <div
          className="absolute -top-20 left-1/4 h-[520px] w-[520px] rounded-full opacity-50"
          style={{ background: 'rgba(100,230,210,0.45)', filter: 'blur(80px)' }}
        />
        <div
          className="absolute -right-32 bottom-[-180px] h-[640px] w-[640px] rounded-full opacity-50"
          style={{ background: 'rgba(200,170,255,0.45)', filter: 'blur(80px)' }}
        />
      </div>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-16">
        <div className="brutal-card w-full max-w-2xl bg-white">
          {/* Header monoespaciado al estilo de la landing */}
          <div className="mb-6 flex items-center justify-between border-b-3 border-brutal-black pb-4">
            <span className="brutal-label">SYSTEM_OK / HITO_01</span>
            <span className="brutal-chip-purple">SCAFFOLDING</span>
          </div>

          {/* Logo + título */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center bg-brutal-purple text-white shadow-brutal-sm">
              <span className="font-headline text-2xl font-black">A</span>
            </div>
            <div className="font-headline text-2xl font-black uppercase tracking-tight">
              AURA <span className="bg-brutal-black px-1.5 text-white">IA</span>
            </div>
          </div>

          <h1 className="mb-4 font-headline text-display-lg font-black uppercase">
            CIMIENTOS LISTOS.
          </h1>
          <p className="mb-8 max-w-xl text-base text-ink">
            Vite + React + TypeScript + Tailwind CSS están operativos y los design tokens
            brutalistas se aplican correctamente. Próximo paso:{' '}
            <span className="bg-brutal-teal px-1 font-mono text-sm">
              Hito 2 — sistema de diseño
            </span>
            .
          </p>

          {/* Stack chips */}
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="brutal-chip-coral">VITE 6</span>
            <span className="brutal-chip-purple">REACT 18</span>
            <span className="brutal-chip-teal">TS 5.7</span>
            <span className="brutal-chip-black">TAILWIND 3.4</span>
          </div>

          {/* Tres pequeñas tarjetas que muestran la jerarquía visual */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FeatureMini
              icon={<Sparkles className="h-4 w-4" />}
              label="DESIGN_TOKENS"
              description="Colores, sombras y tipografías aplicadas."
              accent="bg-brutal-teal"
            />
            <FeatureMini
              icon={<Wrench className="h-4 w-4" />}
              label="LINT_FORMAT"
              description="ESLint + Prettier + Husky preparados."
              accent="bg-brutal-coral"
            />
            <FeatureMini
              icon={<Code2 className="h-4 w-4" />}
              label="STRUCTURE"
              description="Carpetas del prompt creadas y listas."
              accent="bg-brutal-purple"
            />
          </div>
        </div>
      </main>
    </div>
  );
}

interface FeatureMiniProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  accent: string;
}

function FeatureMini({ icon, label, description, accent }: FeatureMiniProps) {
  return (
    <div className="border-3 border-brutal-black bg-white p-3 shadow-brutal-sm">
      <div
        className={`mb-2 inline-flex h-7 w-7 items-center justify-center border-2 border-brutal-black text-brutal-black ${accent}`}
      >
        {icon}
      </div>
      <p className="brutal-label mb-1">{label}</p>
      <p className="text-xs leading-snug text-ink">{description}</p>
    </div>
  );
}

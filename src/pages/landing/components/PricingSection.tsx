import { Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';

interface PlanFeature {
  text: string;
}

interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: PlanFeature[];
  accentBg: string; // header bg
  accentText: string; // header text
  accentCheck: string; // check icon color
  ctaLabel: string;
  ctaVariant: 'teal' | 'purple' | 'coral';
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    id: 'gratis',
    name: 'Gratis',
    price: '0€',
    period: '/UNIDAD_TIEMPO',
    tagline: 'ID: ACCESO_BÁSICO_LIMITADO',
    features: [
      { text: 'Botón SOS Básico' },
      { text: 'Diario simple' },
      { text: '3 Ambientes sonoros' },
    ],
    accentBg: 'bg-brutal-teal',
    accentText: 'text-brutal-black',
    accentCheck: 'text-brutal-teal',
    ctaLabel: 'ACTIVAR_LICENCIA',
    ctaVariant: 'teal',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '9€',
    period: '/MES',
    tagline: 'ID: EQUILIBRIO_OPTIMIZADO',
    features: [
      { text: 'Todo lo de Gratis' },
      { text: 'Chatbot IA ilimitado' },
      { text: 'Insights de Mood Tracker' },
      { text: 'Todos los minijuegos' },
      { text: 'Todos los ambientes sonoros' },
    ],
    accentBg: 'bg-brutal-purple',
    accentText: 'text-white',
    accentCheck: 'text-brutal-purple',
    ctaLabel: 'EJECUTAR_PLAN',
    ctaVariant: 'purple',
    highlighted: true,
  },
  {
    id: 'equipo',
    name: 'Equipo',
    price: '29€',
    period: '/MES',
    tagline: 'ID: CUIDADO_COLECTIVO_MAX',
    features: [
      { text: 'Todo lo de Pro' },
      { text: 'Panel de administración' },
      { text: 'Hasta 20 usuarios' },
      { text: 'Reportes y exportación' },
      { text: 'Soporte prioritario' },
    ],
    accentBg: 'bg-brutal-coral',
    accentText: 'text-white',
    accentCheck: 'text-brutal-coral',
    ctaLabel: 'UPGRADE_FULL',
    ctaVariant: 'coral',
  },
];

export function PricingSection() {
  return (
    <section id="precios" className="relative z-10 overflow-x-hidden px-6 py-24 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-headline text-4xl font-black uppercase tracking-tighter lg:text-5xl">
            ADQUISICIÓN_DE_PLANES
          </h2>
          <p className="font-mono text-xs font-bold uppercase">
            SELECCIONE NIVEL DE ACCESO REQUERIDO
          </p>
        </div>

        {/* Plans grid */}
        <div className="mx-auto grid max-w-5xl grid-cols-1 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col border-4 border-brutal-black bg-white/85 p-8 backdrop-blur-md',
                // Remove left border on middle and right cards on desktop (adjacent borders collapse)
                plan.id !== 'gratis' && 'md:border-l-0',
                plan.highlighted && 'z-10 shadow-brutal md:-translate-y-4 md:border-l-4',
              )}
            >
              {/* "Más popular" badge */}
              {plan.highlighted && (
                <div className="absolute -top-6 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap border-4 border-brutal-black bg-white px-4 py-1 font-mono text-[10px] font-black uppercase">
                  ⭐ MÁS POPULAR
                </div>
              )}

              {/* Plan name header */}
              <div
                className={`mb-6 border-4 border-brutal-black p-2 text-center font-headline text-xl font-black uppercase ${plan.accentBg} ${plan.accentText}`}
              >
                {plan.name}
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="font-headline text-6xl font-black">{plan.price}</span>
                <span className="ml-1 font-mono text-[10px] font-bold uppercase text-ink-muted">
                  {plan.period}
                </span>
              </div>

              {/* Tagline */}
              <p className="mb-8 border-b-2 border-brutal-black pb-4 font-mono text-[10px] font-bold uppercase">
                {plan.tagline}
              </p>

              {/* Features */}
              <ul className="mb-auto space-y-4">
                {plan.features.map(({ text }) => (
                  <li
                    key={text}
                    className="flex items-center gap-2 font-mono text-xs font-bold uppercase"
                  >
                    <Check className={`h-4 w-4 shrink-0 ${plan.accentCheck}`} aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button variant={plan.ctaVariant} size="md" className="mt-12 w-full justify-center">
                {plan.ctaLabel}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Link } from 'react-router-dom';
import { Phone, MessageCircle, Heart, AlertTriangle, ArrowLeft } from 'lucide-react';
import { BlobsBackground } from '@/components/ui';

interface EmergencyContact {
  number: string;
  label: string;
  description: string;
  hours: string;
  href: string;
  accent: 'coral' | 'purple' | 'teal';
}

const CONTACTS: EmergencyContact[] = [
  {
    number: '112',
    label: 'EMERGENCIAS_GENERALES',
    description:
      'Si tú o alguien cercano corre peligro inmediato (intento de suicidio, agresión, accidente). Operativo 24/7 en toda España y la Unión Europea.',
    hours: '24H · GRATUITO · TODA_LA_UE',
    href: 'tel:112',
    accent: 'coral',
  },
  {
    number: '024',
    label: 'PREVENCIÓN_SUICIDIO',
    description:
      'Línea oficial del Ministerio de Sanidad. Atención profesional, confidencial y gratuita para conductas suicidas y crisis emocionales agudas.',
    hours: '24H · GRATUITO · CONFIDENCIAL',
    href: 'tel:024',
    accent: 'purple',
  },
  {
    number: '717 003 717',
    label: 'TELÉFONO_DE_LA_ESPERANZA',
    description:
      'ONG con voluntariado profesional. Apoyo emocional para crisis personales, soledad, ansiedad y duelo.',
    hours: '24H · COSTE_LLAMADA_LOCAL',
    href: 'tel:717003717',
    accent: 'teal',
  },
];

const accentClasses: Record<EmergencyContact['accent'], { bg: string; shadow: string; text: string }> = {
  coral: { bg: 'bg-brutal-coral', shadow: 'shadow-brutal-coral', text: 'text-brutal-coral' },
  purple: { bg: 'bg-brutal-purple', shadow: 'shadow-brutal-purple', text: 'text-brutal-purple' },
  teal: { bg: 'bg-brutal-teal', shadow: 'shadow-brutal-teal', text: 'text-brutal-teal' },
};

export function EmergencyPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BlobsBackground />

      <header className="relative z-10 border-b-4 border-brutal-black bg-white/85 px-6 py-4 backdrop-blur-md lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 font-headline text-xl font-black uppercase tracking-tighter"
          >
            <span className="h-8 w-8 rounded-full border-4 border-brutal-black bg-gradient-to-br from-brutal-purple to-brutal-teal" />
            AURA <span className="text-brutal-purple">AI</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted hover:text-brutal-black"
          >
            <ArrowLeft className="h-3 w-3" />
            VOLVER_INICIO
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          {/* Banner crítico */}
          <div className="mb-8 border-4 border-brutal-coral bg-brutal-coral/15 p-5 sm:p-6">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-brutal-coral">
              <AlertTriangle className="h-4 w-4" />
              ALERTA_CRÍTICA · USO_INMEDIATO
            </div>
            <h1 className="font-headline text-3xl font-black uppercase leading-tight tracking-tighter sm:text-4xl">
              Si estás en peligro
              <br />
              llama al <span className="text-brutal-coral">112</span> ahora.
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-ink">
              AURA IA <strong>no es un servicio de emergencia</strong>. Si tienes pensamientos
              de hacerte daño, si alguien cercano está en peligro o si necesitas atención
              inmediata, descuelga el teléfono.
            </p>
            <a
              href="tel:112"
              className="mt-5 inline-flex items-center gap-3 border-4 border-brutal-black bg-brutal-coral px-6 py-3 font-headline text-xl font-black uppercase tracking-tight text-white shadow-brutal transition-transform duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0"
            >
              <Phone className="h-5 w-5" />
              LLAMAR AL 112
            </a>
          </div>

          {/* Lista de contactos */}
          <div className="space-y-5">
            {CONTACTS.map((c) => {
              const accent = accentClasses[c.accent];
              return (
                <article
                  key={c.number}
                  className="border-4 border-brutal-black bg-white/95 p-5 shadow-brutal-sm backdrop-blur-md sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="mb-2 inline-block border-2 border-brutal-black bg-white px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-ink-muted">
                        {c.label}
                      </span>
                      <div
                        className={`font-headline text-4xl font-black uppercase leading-none tracking-tighter sm:text-5xl ${accent.text}`}
                      >
                        {c.number}
                      </div>
                      <p className="mt-3 text-[14px] leading-relaxed text-ink">{c.description}</p>
                      <p className="mt-2 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted">
                        {c.hours}
                      </p>
                    </div>
                    <a
                      href={c.href}
                      aria-label={`Llamar al ${c.number}`}
                      className={`flex shrink-0 items-center gap-2 border-4 border-brutal-black px-4 py-2 font-mono text-xs font-black uppercase tracking-widest text-white transition-transform duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 ${accent.bg} ${accent.shadow}`}
                    >
                      <Phone className="h-4 w-4" />
                      LLAMAR
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Mientras esperas */}
          <section className="mt-10 border-4 border-brutal-black bg-white/95 p-6 backdrop-blur-md">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-brutal-purple">
              <Heart className="h-4 w-4" />
              MIENTRAS_ESPERAS_LA_LLAMADA
            </div>
            <h2 className="font-headline text-2xl font-black uppercase tracking-tight">
              Pequeñas cosas que pueden ayudar ahora
            </h2>
            <ul className="mt-4 space-y-3 text-[14px] leading-relaxed text-ink">
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 bg-brutal-purple" />
                <span>
                  <strong>Aleja del alcance</strong> medicamentos, objetos cortantes o cualquier
                  medio que puedas usar para hacerte daño.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 bg-brutal-purple" />
                <span>
                  <strong>Habla con alguien</strong> de tu confianza, aunque sea por mensaje. No
                  tienes que explicarlo todo, basta con decir "estoy mal".
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 bg-brutal-purple" />
                <span>
                  <strong>Respira despacio</strong>: inhala 4 segundos, retén 4, exhala 6.
                  Repítelo unas pocas veces. No resuelve, pero baja la intensidad para poder
                  pensar.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-1 inline-block h-2 w-2 shrink-0 bg-brutal-purple" />
                <span>
                  <strong>Cambia de espacio</strong>: ve a otra habitación, sal a la calle un
                  momento, abre una ventana. El cuerpo a veces necesita un cambio físico para
                  romper la espiral.
                </span>
              </li>
            </ul>
          </section>

          {/* Recursos adicionales */}
          <section className="mt-8 border-4 border-brutal-black bg-brutal-purple/10 p-6">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-widest text-brutal-purple">
              <MessageCircle className="h-4 w-4" />
              RECURSOS_NO_INMEDIATOS
            </div>
            <h2 className="font-headline text-xl font-black uppercase tracking-tight">
              Para apoyo continuo
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-ink">
              Si lo que necesitas es seguimiento sostenido, busca un/a psicólogo/a colegiado/a o
              acude a tu médico/a de cabecera para que te derive a salud mental. AURA IA puede
              acompañarte entre sesiones, pero no las sustituye.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 font-mono text-[11px] font-bold uppercase tracking-widest">
              <a
                className="border-2 border-brutal-black bg-white px-3 py-1.5 hover:bg-brutal-purple hover:text-white"
                href="https://www.consejogeneralpsicologia.com"
                target="_blank"
                rel="noreferrer"
              >
                COLEGIO_OFICIAL_PSICÓLOGOS_↗
              </a>
              <a
                className="border-2 border-brutal-black bg-white px-3 py-1.5 hover:bg-brutal-purple hover:text-white"
                href="https://www.sanidad.gob.es"
                target="_blank"
                rel="noreferrer"
              >
                MINISTERIO_SANIDAD_↗
              </a>
            </div>
          </section>

          {/* Footer legal */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            <Link to="/privacy" className="hover:text-brutal-purple">
              → PRIVACIDAD
            </Link>
            <Link to="/terms" className="hover:text-brutal-purple">
              → TÉRMINOS
            </Link>
            <Link to="/" className="hover:text-brutal-black">
              → INICIO
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

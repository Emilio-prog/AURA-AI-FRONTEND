import { useState } from 'react';
import {
  Heart,
  Zap,
  Star,
  AlertCircle,
  Mail,
  Lock,
  Home,
  MessageCircle,
  BookOpen,
  Settings,
  Activity,
  Gamepad2,
  Music,
  Users,
  ShieldAlert,
} from 'lucide-react';
import {
  Button,
  Card,
  Chip,
  Input,
  Textarea,
  Modal,
  NavItem,
  BlobsBackground,
} from '@/components/ui';

/**
 * Playground de componentes — visible solo en modo desarrollo (?playground en la URL).
 * Cubre todos los componentes del Hito 2 con sus variantes.
 */
export function DevPlayground() {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('inicio');
  const [inputVal, setInputVal] = useState('');

  return (
    <div className="relative min-h-screen bg-surface">
      <BlobsBackground />

      <div className="relative z-10 mx-auto max-w-4xl space-y-16 px-6 py-12">
        {/* Header */}
        <div className="border-b-4 border-brutal-black pb-6">
          <span className="brutal-label mb-2 block">DEV_ONLY · HITO_02</span>
          <h1 className="font-headline text-display-xl font-black uppercase">
            PLAYGROUND<span className="text-brutal-purple">.</span>
          </h1>
          <p className="mt-2 font-mono text-xs text-ink-muted">
            Sistema de diseño brutalista — todas las variantes de componentes.
          </p>
        </div>

        {/* ── COLORES ── */}
        <Section id="colors" title="PALETA_BRUTALISTA">
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'TEAL', bg: 'bg-brutal-teal', text: 'text-brutal-black' },
              { label: 'PURPLE', bg: 'bg-brutal-purple', text: 'text-white' },
              { label: 'CORAL', bg: 'bg-brutal-coral', text: 'text-white' },
              { label: 'BLACK', bg: 'bg-brutal-black', text: 'text-white' },
              {
                label: 'WHITE',
                bg: 'bg-white border-3 border-brutal-black',
                text: 'text-brutal-black',
              },
              {
                label: 'SURFACE',
                bg: 'bg-surface-muted border-3 border-brutal-black',
                text: 'text-brutal-black',
              },
            ].map(({ label, bg, text }) => (
              <div key={label} className={`flex h-16 w-24 items-end p-2 shadow-brutal-sm ${bg}`}>
                <span className={`font-mono text-[9px] font-bold ${text}`}>{label}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* ── TIPOGRAFÍA ── */}
        <Section id="typography" title="TIPOGRAFÍA">
          <div className="space-y-4">
            <div className="border-l-4 border-brutal-purple pl-4">
              <p className="brutal-label mb-1">DISPLAY_2XL · Inter Black</p>
              <p className="font-headline text-display-2xl font-black uppercase leading-none">
                AURA IA.
              </p>
            </div>
            <div className="border-l-4 border-brutal-teal pl-4">
              <p className="brutal-label mb-1">DISPLAY_LG · Inter Black</p>
              <p className="font-headline text-display-lg font-black uppercase">
                BIENESTAR MENTAL.
              </p>
            </div>
            <div className="border-l-4 border-brutal-coral pl-4">
              <p className="brutal-label mb-1">BODY · Inter 400</p>
              <p className="text-base text-ink">
                Plataforma de apoyo emocional para personas que sufren ansiedad o estrés. El diseño
                prioriza la calma visual y la accesibilidad inmediata.
              </p>
            </div>
            <div className="border-l-4 border-brutal-black pl-4">
              <p className="brutal-label mb-1">MONO · Space Mono 700</p>
              <p className="font-mono text-sm font-bold uppercase tracking-widest">
                SESIONES_HOY: 3 · RACHA: DÍA_07 · MOOD: BIEN
              </p>
            </div>
          </div>
        </Section>

        {/* ── BUTTONS ── */}
        <Section id="buttons" title="BOTONES">
          <div className="space-y-4">
            <p className="brutal-label">VARIANTES</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="coral">CORAL</Button>
              <Button variant="purple">PURPLE</Button>
              <Button variant="teal">TEAL</Button>
              <Button variant="black">BLACK</Button>
              <Button variant="white">WHITE</Button>
              <Button variant="ghost">GHOST</Button>
            </div>
            <p className="brutal-label">TAMAÑOS</p>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="purple" size="sm">
                SM
              </Button>
              <Button variant="purple" size="md">
                MD
              </Button>
              <Button variant="purple" size="lg">
                LG
              </Button>
            </div>
            <p className="brutal-label">ESTADOS</p>
            <div className="flex flex-wrap gap-3">
              <Button variant="coral" leftIcon={<Heart className="h-3.5 w-3.5" />}>
                CON_ICONO
              </Button>
              <Button variant="teal" rightIcon={<Zap className="h-3.5 w-3.5" />}>
                DERECHO
              </Button>
              <Button variant="purple" loading>
                CARGANDO
              </Button>
              <Button variant="black" disabled>
                DESACTIVADO
              </Button>
            </div>
          </div>
        </Section>

        {/* ── CARDS ── */}
        <Section id="cards" title="CARDS">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <p className="brutal-label mb-2">SOLID_DEFAULT</p>
              <p className="text-sm text-ink">Tarjeta estándar, fondo blanco opaco.</p>
            </Card>
            <Card variant="glass">
              <p className="brutal-label mb-2">GLASS_VARIANT</p>
              <p className="text-sm text-ink">Backdrop-blur semi-transparente.</p>
            </Card>
            <Card hoverable shadowColor="purple">
              <p className="brutal-label mb-2">HOVERABLE_PURPLE</p>
              <p className="text-sm text-ink">Hover: translateY(-2px) + shadow intensificada.</p>
            </Card>
            <Card size="sm" shadowColor="coral">
              <p className="brutal-label mb-1">SM_CORAL</p>
              <p className="text-xs text-ink">Padding reducido.</p>
            </Card>
            <Card hoverable shadowColor="teal">
              <p className="brutal-label mb-2">HOVERABLE_TEAL</p>
              <p className="text-sm text-ink">Sombra teal al hacer hover.</p>
            </Card>
            <Card className="bg-brutal-black text-white">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-white/60">
                DARK
              </p>
              <p className="text-sm text-white">Fondo negro, texto en blanco.</p>
            </Card>
          </div>
        </Section>

        {/* ── CHIPS ── */}
        <Section id="chips" title="CHIPS">
          <div className="flex flex-wrap gap-2">
            <Chip variant="coral">CORAL</Chip>
            <Chip variant="purple">PURPLE</Chip>
            <Chip variant="teal">TEAL</Chip>
            <Chip variant="black">BLACK</Chip>
            <Chip variant="yellow">YELLOW</Chip>
            <Chip variant="outline">OUTLINE</Chip>
            <Chip variant="coral" leftIcon={<Star className="h-2.5 w-2.5" />}>
              CON_ICONO
            </Chip>
            <Chip variant="purple">PLAN_PRO_ACTIVO</Chip>
            <Chip variant="teal">DÍA_07_CONSECUTIVO</Chip>
            <Chip variant="black">SIEMPRE_ACTIVO</Chip>
          </div>
        </Section>

        {/* ── INPUTS ── */}
        <Section id="inputs" title="INPUTS_Y_FORM">
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Email" placeholder="USUARIO@AURA.AI" type="email" />
            <Input
              label="Contraseña"
              placeholder="••••••••"
              type="password"
              leftIcon={<Lock className="h-4 w-4" />}
            />
            <Input
              label="Buscar"
              placeholder="BUSCAR..."
              leftIcon={<Mail className="h-4 w-4" />}
              hint="Mínimo 3 caracteres"
            />
            <Input
              label="Campo con error"
              placeholder="..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              error="CAMPO_REQUERIDO · Introduce un valor válido."
            />
            <div className="sm:col-span-2">
              <Textarea
                label="¿Cómo te sientes hoy?"
                placeholder="ESCRIBE_LO_QUE_SIENTES..."
                hint="Tu diario es privado y solo visible para ti."
                rows={3}
              />
            </div>
          </div>
        </Section>

        {/* ── NAV ITEMS ── */}
        <Section id="nav" title="NAV_ITEMS_SIDEBAR">
          <div className="w-60 border-4 border-brutal-black shadow-brutal">
            {[
              { id: 'inicio', icon: <Home className="h-4 w-4" />, label: 'INICIO_' },
              {
                id: 'sos',
                icon: <ShieldAlert className="h-4 w-4" />,
                label: 'BOTÓN_SOS',
                sos: true,
              },
              { id: 'chatbot', icon: <MessageCircle className="h-4 w-4" />, label: 'CHATBOT_IA' },
              { id: 'mood', icon: <Activity className="h-4 w-4" />, label: 'MOOD_TRACKER' },
              { id: 'juegos', icon: <Gamepad2 className="h-4 w-4" />, label: 'MINIJUEGOS' },
              { id: 'sonidos', icon: <Music className="h-4 w-4" />, label: 'AMBIENTES_SONOROS' },
              { id: 'diario', icon: <BookOpen className="h-4 w-4" />, label: 'DIARIO' },
              {
                id: 'contactos',
                icon: <Users className="h-4 w-4" />,
                label: 'CONTACTOS_CONFIANZA',
              },
              { id: 'config', icon: <Settings className="h-4 w-4" />, label: 'CONFIGURACIÓN' },
            ].map(({ id, icon, label, sos }) => (
              <NavItem
                key={id}
                icon={icon}
                label={label}
                isActive={activeNav === id}
                isSOS={sos}
                onClick={() => setActiveNav(id)}
              />
            ))}
          </div>
        </Section>

        {/* ── MODAL ── */}
        <Section id="modal" title="MODAL">
          <div className="flex flex-wrap gap-3">
            <Button variant="purple" onClick={() => setModalOpen(true)}>
              ABRIR MODAL →
            </Button>
          </div>
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="MODAL_DEMO"
            size="md"
          >
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-ink">
                Este modal usa <span className="font-mono font-bold">framer-motion</span> para las
                animaciones de entrada/salida. Ciérralo con <kbd className="brutal-chip">ESC</kbd> o
                haciendo clic en el backdrop.
              </p>
              <div className="flex gap-3">
                <Button variant="purple" onClick={() => setModalOpen(false)}>
                  CONFIRMAR
                </Button>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  CANCELAR
                </Button>
              </div>
            </div>
          </Modal>
        </Section>

        {/* ── ANIMACIONES ── */}
        <Section id="animations" title="ANIMACIONES_CSS">
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 animate-breathe rounded-full border-4 border-brutal-black bg-brutal-coral" />
              <span className="brutal-label">BREATHE</span>
            </div>
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute h-16 w-16 animate-ring rounded-full border-3 border-brutal-coral" />
              <div className="absolute h-16 w-16 animate-ring rounded-full border-3 border-brutal-coral [animation-delay:0.7s]" />
              <div className="h-10 w-10 rounded-full border-4 border-brutal-black bg-brutal-coral" />
              <span className="brutal-label absolute -bottom-5">RING</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 animate-float border-4 border-brutal-black bg-brutal-purple" />
              <span className="brutal-label">FLOAT</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-end gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-3 w-3 animate-bounce-soft bg-brutal-purple"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <span className="brutal-label">BOUNCE</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 animate-pulse-soft border-4 border-brutal-black bg-brutal-teal" />
              <span className="brutal-label">PULSE</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 animate-fade-up border-4 border-brutal-black bg-white">
                <AlertCircle className="h-full w-full p-2 text-brutal-purple" />
              </div>
              <span className="brutal-label">FADE_UP</span>
            </div>
          </div>
        </Section>

        {/* ── BLOBS ── */}
        <Section id="blobs" title="BLOBS_BACKGROUND">
          <div className="relative h-48 overflow-hidden border-4 border-brutal-black">
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute -left-8 top-4 h-40 w-40 rounded-full"
                style={{ background: 'rgba(45,212,191,0.5)', filter: 'blur(40px)' }}
              />
              <div
                className="absolute -right-8 bottom-4 h-48 w-48 rounded-full"
                style={{ background: 'rgba(168,85,247,0.5)', filter: 'blur(40px)' }}
              />
              <div
                className="absolute left-1/3 top-8 h-36 w-36 rounded-full"
                style={{ background: 'rgba(251,113,133,0.5)', filter: 'blur(40px)' }}
              />
            </div>
            <div className="relative flex h-full items-center justify-center">
              <p className="brutal-chip-purple border-3 shadow-brutal-sm">BLOBS_EN_FONDO</p>
            </div>
          </div>
        </Section>

        <footer className="border-t-4 border-brutal-black pt-6 text-center">
          <span className="brutal-label">AURA_IA · DESIGN_SYSTEM · HITO_02_COMPLETO</span>
        </footer>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-8">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-mono text-xs font-bold uppercase tracking-widest">{title}</h2>
        <div className="h-px flex-1 bg-brutal-black" />
      </div>
      {children}
    </section>
  );
}

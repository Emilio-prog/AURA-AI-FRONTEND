import { Siren, Bot, Smile, Gamepad2, Headphones, BookOpen, Users, Settings } from 'lucide-react';
import { DashboardHome } from './DashboardHome';
import { SectionPlaceholder } from './SectionPlaceholder';

export { DashboardHome };

export const SOSPage = () => (
  <SectionPlaceholder
    icon={Siren}
    title="BOTÓN_DEL_PÁNICO"
    hito="HITO_5"
    description="Protocolo de respiración 4-4-6, llamada directa a contactos de confianza, números de emergencia (112, 024) y recursos de apoyo."
  />
);

export const ChatbotPage = () => (
  <SectionPlaceholder
    icon={Bot}
    title="AURA IA"
    hito="HITO_5"
    description="Asistente empático con respuestas en streaming. Disponible 24/7 sin filtros, sin juicios."
  />
);

export const MoodTrackerPage = () => (
  <SectionPlaceholder
    icon={Smile}
    title="MOOD_TRACKER"
    hito="HITO_6"
    description="Registro diario de estado emocional con gráficas de evolución a 30-90 días y análisis de patrones."
  />
);

export const MinigamesPage = () => (
  <SectionPlaceholder
    icon={Gamepad2}
    title="MINIJUEGOS"
    hito="HITO_6"
    description="4 juegos de distracción cognitiva: Pintura con Arena, Ordenación Cromática, Explotar Burbujas y Memoria Visual."
  />
);

export const SoundscapesPage = () => (
  <SectionPlaceholder
    icon={Headphones}
    title="AMBIENTES_SONOROS"
    hito="HITO_6"
    description="Modulación de frecuencias cerebrales vía binaural. Selección de paisajes sonoros para concentración y descanso."
  />
);

export const DiaryPage = () => (
  <SectionPlaceholder
    icon={BookOpen}
    title="DIARIO"
    hito="HITO_6"
    description="Registro libre de pensamientos con selector de 7 emociones. Persistencia local cifrada."
  />
);

export const ContactsPage = () => (
  <SectionPlaceholder
    icon={Users}
    title="CONTACTOS_CONFIANZA"
    hito="HITO_7"
    description="Red de soporte personal: añade hasta 5 contactos accesibles desde el botón SOS para llamadas y mensajes inmediatos."
  />
);

export const SettingsPage = () => (
  <SectionPlaceholder
    icon={Settings}
    title="CONFIGURACIÓN"
    hito="HITO_7"
    description="Edición de perfil, idioma, tema, exportación de datos y gestión de sesión."
  />
);

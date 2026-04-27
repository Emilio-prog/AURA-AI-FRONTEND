import {
  Home,
  Siren,
  Bot,
  Smile,
  Gamepad2,
  Headphones,
  BookOpen,
  Users,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface DashboardNavEntry {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  isSOS?: boolean;
}

export const DASHBOARD_NAV: DashboardNavEntry[] = [
  { id: 'inicio', path: '/dashboard', label: 'INICIO_', icon: Home },
  { id: 'sos', path: '/dashboard/sos', label: 'BOTÓN_SOS', icon: Siren, isSOS: true },
  { id: 'chatbot', path: '/dashboard/chatbot', label: 'CHATBOT_IA', icon: Bot },
  { id: 'mood', path: '/dashboard/mood', label: 'MOOD_TRACKER', icon: Smile },
  { id: 'juegos', path: '/dashboard/juegos', label: 'MINIJUEGOS', icon: Gamepad2 },
  { id: 'sonidos', path: '/dashboard/sonidos', label: 'AMBIENTES_SONOROS', icon: Headphones },
  { id: 'diario', path: '/dashboard/diario', label: 'DIARIO', icon: BookOpen },
  { id: 'contactos', path: '/dashboard/contactos', label: 'CONTACTOS_CONFIANZA', icon: Users },
  { id: 'config', path: '/dashboard/config', label: 'CONFIGURACIÓN', icon: Settings },
];

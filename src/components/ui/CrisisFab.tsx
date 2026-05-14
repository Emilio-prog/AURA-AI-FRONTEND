import { Link } from 'react-router-dom';
import { LifeBuoy } from 'lucide-react';

/**
 * Botón flotante persistente que lleva a la página de emergencia.
 * Visible en landing y dashboard. No usar dentro de la propia /emergencia.
 */
export function CrisisFab() {
  return (
    <Link
      to="/emergencia"
      aria-label="Ayuda en crisis. Ir a la página de emergencia."
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 border-4 border-brutal-black bg-brutal-coral px-4 py-3 font-mono text-[11px] font-black uppercase tracking-widest text-white shadow-brutal-sm transition-transform duration-100 hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-0 active:translate-y-0 sm:bottom-6 sm:right-6 sm:px-5 sm:py-3.5"
    >
      <LifeBuoy className="h-5 w-5 animate-pulse-soft" aria-hidden />
      <span className="hidden sm:inline">¿NECESITAS_AYUDA_AHORA?</span>
      <span className="sm:hidden">SOS</span>
    </Link>
  );
}

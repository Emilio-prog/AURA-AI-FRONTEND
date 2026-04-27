import { Menu } from 'lucide-react';

interface DashboardTopbarProps {
  onOpenMenu: () => void;
}

const STATS_TICKER = [
  'SESIONES_HOY: 3',
  'RACHA: DÍA_07_CONSECUTIVO',
  'ANSIEDAD_PROMEDIO: 4.2/10',
  'MOOD_HOY: BIEN',
  'EJERCICIOS_RESPIRACIÓN: 12',
  'BURBUJAS_EXPLOTADAS: 847',
  'TIEMPO_APP: 23MIN',
];

export function DashboardTopbar({ onOpenMenu }: DashboardTopbarProps) {
  const doubled = [...STATS_TICKER, ...STATS_TICKER];

  return (
    <div className="flex items-stretch border-b-4 border-brutal-black bg-brutal-black text-white">
      {/* Burger — solo mobile */}
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label="Abrir menú"
        className="flex h-10 w-10 shrink-0 items-center justify-center border-r-4 border-brutal-black bg-white text-brutal-black md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Stats marquee */}
      <div className="relative flex-1 overflow-hidden">
        <div className="flex w-max animate-marquee items-center">
          {doubled.map((entry, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap border-r border-white/20 px-8 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest"
            >
              <span className="text-brutal-teal">◆</span>
              {entry}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

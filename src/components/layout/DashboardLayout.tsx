import { useEffect, useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { BlobsBackground, CrisisFab } from '@/components/ui';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardTopbar } from './DashboardTopbar';

export function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Cierra el drawer móvil con ESC.
  useEffect(() => {
    if (!drawerOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [drawerOpen]);

  // Bloquea scroll del body cuando el drawer está abierto.
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [drawerOpen]);

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <BlobsBackground />

      {/* Sidebar — desktop */}
      <div className="relative z-10 hidden md:flex">
        <DashboardSidebar />
      </div>

      {/* Drawer — móvil */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0 bg-brutal-black/60 backdrop-blur-sm"
          />
          <div className="relative flex h-full w-60 animate-slide-in-left">
            <DashboardSidebar onNavigate={() => setDrawerOpen(false)} />
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              aria-label="Cerrar menú"
              className="absolute -right-12 top-3 flex h-9 w-9 items-center justify-center border-4 border-brutal-black bg-white text-brutal-black shadow-brutal-sm"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="relative z-10 flex min-h-screen flex-1 flex-col">
        <DashboardTopbar onOpenMenu={() => setDrawerOpen(true)} />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <Outlet />
          <footer className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t-2 border-brutal-black/10 pt-6 font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted dark:border-white/10 dark:text-zinc-400">
            <Link to="/privacy" className="hover:text-brutal-purple">
              PRIVACIDAD
            </Link>
            <span aria-hidden>·</span>
            <Link to="/terms" className="hover:text-brutal-purple">
              TÉRMINOS
            </Link>
            <span aria-hidden>·</span>
            <Link to="/emergencia" className="hover:text-brutal-coral">
              EMERGENCIA_24H
            </Link>
            <span aria-hidden className="hidden sm:inline">
              ·
            </span>
            <span className="hidden sm:inline">© 2026 AURA AI</span>
          </footer>
        </main>
      </div>

      <CrisisFab />
    </div>
  );
}

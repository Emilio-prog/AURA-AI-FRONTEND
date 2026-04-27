import { useLocation, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NavItem } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { writeString, STORAGE_KEYS } from '@/utils/storage';
import { DASHBOARD_NAV } from './dashboardNav';

interface DashboardSidebarProps {
  onNavigate?: () => void;
}

const planLabel = (plan: string): string => {
  switch (plan) {
    case 'pro':
      return 'PLAN_PRO_ACTIVO';
    case 'team':
      return 'PLAN_EQUIPO_ACTIVO';
    default:
      return 'PLAN_GRATIS';
  }
};

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleClick = (path: string, id: string) => {
    writeString(STORAGE_KEYS.section, id);
    navigate(path);
    onNavigate?.();
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const isActive = (path: string): boolean => {
    if (path === '/dashboard') return location.pathname === '/dashboard';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r-4 border-brutal-black bg-white">
      {/* Brand */}
      <div className="flex items-center gap-3 border-b-4 border-brutal-black px-5 py-5">
        <div className="h-9 w-9 shrink-0 rounded-full border-4 border-brutal-black bg-gradient-to-br from-brutal-purple to-brutal-teal" />
        <div>
          <div className="font-headline text-base font-black leading-none tracking-tighter">
            AURA <span className="text-brutal-purple">AI</span>
          </div>
          <div className="mt-1 font-mono text-[8px] font-bold uppercase tracking-wider text-ink-muted">
            PANEL_INTERIOR_V2
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" aria-label="Navegación principal">
        {DASHBOARD_NAV.map(({ id, path, label, icon: Icon, isSOS }) => (
          <NavItem
            key={id}
            icon={<Icon className="h-4 w-4" />}
            label={label}
            isActive={isActive(path)}
            isSOS={isSOS}
            onClick={() => handleClick(path, id)}
          />
        ))}
      </nav>

      {/* User block */}
      <div className="border-t-4 border-brutal-black p-3">
        <div className="flex items-center gap-2.5 border-2 border-brutal-black bg-brutal-purple/10 p-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-brutal-black bg-brutal-purple font-mono text-xs font-black uppercase text-white">
            {user?.initials ?? 'AU'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold">{user?.name ?? 'Usuario'}</div>
            <div className="font-mono text-[9px] font-bold uppercase tracking-widest text-brutal-teal">
              {planLabel(user?.plan ?? 'free')}
            </div>
          </div>
          <button
            onClick={handleLogout}
            aria-label="Cerrar sesión"
            className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-brutal-black bg-white text-brutal-black transition-transform duration-100 hover:bg-brutal-coral hover:text-white active:translate-x-0.5 active:translate-y-0.5"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

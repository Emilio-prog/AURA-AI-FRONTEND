import { type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { smoothScrollTo } from '@/lib/smoothScroll';

const navLinks = [
  { label: 'Inicio', target: 0 },
  { label: 'Funcionalidades', target: '#funcionalidades' },
  { label: 'Testimonios', target: '#testimonios' },
];

const NAVBAR_HEIGHT = 80;

export function LandingNavbar() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, target: string | number) => {
    e.preventDefault();
    smoothScrollTo(target, typeof target === 'number' ? 0 : -NAVBAR_HEIGHT);
  };

  return (
    <nav className="fixed top-0 z-50 w-full border-b-4 border-brutal-black bg-white/85 text-ink backdrop-blur-md transition-colors dark:bg-zinc-950/90 dark:text-white">
      <div className="mx-auto flex h-20 ls:h-12 w-full max-w-7xl items-center gap-3 px-4 sm:gap-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3 no-underline" aria-label="Aura AI inicio">
          <div className="h-9 w-9 ls:h-7 ls:w-7 shrink-0 border-[6px] ls:border-4 border-brutal-black bg-gradient-to-tr from-brutal-purple to-brutal-teal sm:h-10 sm:w-10" />
          <div className="whitespace-nowrap font-headline text-2xl ls:text-lg font-black uppercase tracking-tighter sm:text-3xl">
            Aura <span className="text-brutal-purple">AI</span>
          </div>
        </Link>

        <div className="ml-8 hidden items-center gap-8 font-mono text-sm font-bold uppercase md:flex">
          {navLinks.map(({ label, target }) => (
            <a
              key={label}
              href={typeof target === 'string' ? target : '#'}
              onClick={(e) => handleNavClick(e, target)}
              className="decoration-4 underline-offset-4 hover:underline cursor-pointer"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3 sm:gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="border-2 sm:border-4 border-brutal-black bg-brutal-purple px-3 py-1.5 sm:px-6 sm:py-3 text-xs sm:text-base font-bold uppercase tracking-tighter text-white shadow-brutal-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              PANEL
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="font-mono text-xs font-bold uppercase hover:underline sm:text-sm"
              >
                Log_In
              </Link>
              <Link
                to="/register"
                className="border-2 sm:border-4 border-brutal-black bg-brutal-teal px-3 py-1.5 sm:px-6 sm:py-3 text-xs sm:text-base font-bold uppercase tracking-tighter text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-brutal-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none inline-flex"
              >
                <span className="sm:hidden">START</span>
                <span className="hidden sm:inline">START_FREE</span>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
          title={isDark ? 'Tema claro' : 'Tema oscuro'}
          className="ml-1 hidden h-9 w-9 shrink-0 items-center justify-center border-2 border-brutal-black/35 bg-white/55 text-brutal-black transition-colors hover:border-brutal-black hover:bg-brutal-teal/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brutal-purple dark:border-white/35 dark:bg-zinc-950/45 dark:text-white dark:hover:border-white dark:hover:bg-zinc-800 sm:flex"
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
      </div>
    </nav>
  );
}

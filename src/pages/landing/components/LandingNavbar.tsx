import { Link } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const navLinks = [
  { label: 'Inicio', href: '#' },
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Testimonios', href: '#testimonios' },
];

export function LandingNavbar() {
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <nav className="fixed top-0 z-50 w-full border-b-4 border-brutal-black bg-white/85 text-ink backdrop-blur-md transition-colors dark:bg-zinc-950/90 dark:text-white">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-6">
        <Link to="/" className="flex items-center gap-3 no-underline" aria-label="Aura AI inicio">
          <div className="h-10 w-10 border-[6px] border-brutal-black bg-gradient-to-tr from-brutal-purple to-brutal-teal" />
          <div className="font-headline text-3xl font-black uppercase tracking-tighter">
            Aura <span className="text-brutal-purple">AI</span>
          </div>
        </Link>

        <div className="ml-8 hidden items-center gap-8 font-mono text-sm font-bold uppercase md:flex">
          {navLinks.map(({ label, href }) => (
            <a key={label} className="decoration-4 underline-offset-4 hover:underline" href={href}>
              {label}
            </a>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="border-4 border-brutal-black bg-brutal-purple px-6 py-3 font-bold uppercase tracking-tighter text-white shadow-brutal-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              IR_AL_PANEL
            </Link>
          ) : (
            <>
              <Link to="/login" className="font-mono text-sm font-bold uppercase hover:underline">
                Log_In
              </Link>
              <Link
                to="/register"
                className="border-4 border-brutal-black bg-brutal-teal px-6 py-3 font-bold uppercase tracking-tighter text-black shadow-brutal-sm transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
              >
                START_FREE
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
          title={isDark ? 'Tema claro' : 'Tema oscuro'}
          className="ml-1 flex h-9 w-9 shrink-0 items-center justify-center border-2 border-brutal-black/35 bg-white/55 text-brutal-black transition-colors hover:border-brutal-black hover:bg-brutal-teal/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brutal-purple dark:border-white/35 dark:bg-zinc-950/45 dark:text-white dark:hover:border-white dark:hover:bg-zinc-800"
        >
          {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
        </button>
      </div>
    </nav>
  );
}

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/utils/cn';

const navLinks = [
  { label: 'INICIO', href: '#' },
  { label: 'FUNCIONALIDADES', href: '#funcionalidades' },
  { label: 'TESTIMONIOS', href: '#testimonios' },
  { label: 'PRECIOS', href: '#precios' },
];

export function LandingNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full border-b-4 border-brutal-black bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <a href="#" className="flex items-center gap-3 no-underline" aria-label="AURA IA inicio">
          <div className="h-10 w-10 border-4 border-brutal-black bg-brutal-purple shadow-brutal-sm" />
          <span className="font-headline text-3xl font-black uppercase tracking-tighter">
            AURA <span className="text-brutal-purple">AI</span>
          </span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 font-mono text-xs font-bold uppercase md:flex">
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href} className="decoration-4 underline-offset-4 hover:underline">
              {label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-4 md:flex">
          <button className="font-mono text-sm font-bold uppercase hover:underline">LOG_IN</button>
          <Button variant="teal" size="md">
            START_FREE
          </Button>
        </div>

        {/* Mobile burger */}
        <button
          className="border-3 border-brutal-black p-2 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      <div
        className={cn(
          'overflow-hidden border-t-4 border-brutal-black bg-white transition-all duration-300 md:hidden',
          mobileOpen ? 'max-h-screen' : 'max-h-0',
        )}
      >
        <nav className="flex flex-col divide-y-4 divide-brutal-black">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setMobileOpen(false)}
              className="px-6 py-4 font-mono text-xs font-bold uppercase hover:bg-surface-muted"
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-3 px-6 py-4">
            <button className="text-left font-mono text-xs font-bold uppercase hover:underline">
              LOG_IN
            </button>
            <Button variant="teal" size="sm" className="w-full justify-center">
              START_FREE
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

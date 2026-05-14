import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';
import { BlobsBackground } from '@/components/ui';

interface LegalLayoutProps {
  badge: string;
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: ReactNode;
}

export function LegalLayout({ badge, title, subtitle, lastUpdated, children }: LegalLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <BlobsBackground />

      <header className="relative z-10 border-b-4 border-brutal-black bg-white/85 px-6 py-4 backdrop-blur-md lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 font-headline text-xl font-black uppercase tracking-tighter"
          >
            <span className="h-8 w-8 rounded-full border-4 border-brutal-black bg-gradient-to-br from-brutal-purple to-brutal-teal" />
            AURA <span className="text-brutal-purple">AI</span>
          </Link>
          <Link
            to="/"
            className="font-mono text-[10px] font-bold uppercase tracking-widest text-ink-muted hover:text-brutal-black"
          >
            ← VOLVER_INICIO
          </Link>
        </div>
      </header>

      <main className="relative z-10 px-6 py-12 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <div className="border-4 border-brutal-black bg-white/95 p-6 shadow-brutal backdrop-blur-md sm:p-10">
            <span className="inline-block border-2 border-brutal-black bg-brutal-purple px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
              {badge}
            </span>
            <h1 className="mt-4 font-headline text-3xl font-black uppercase leading-none tracking-tighter sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              {subtitle}
            </p>
            <p className="mt-1 font-mono text-[10px] font-bold uppercase tracking-wider text-ink-muted">
              ÚLTIMA_ACTUALIZACIÓN: {lastUpdated}
            </p>

            <div className="legal-content mt-8 space-y-6 text-[15px] leading-relaxed text-ink">
              {children}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted">
            <Link to="/privacy" className="hover:text-brutal-purple">
              → PRIVACIDAD
            </Link>
            <Link to="/terms" className="hover:text-brutal-purple">
              → TÉRMINOS
            </Link>
            <Link to="/emergencia" className="hover:text-brutal-coral">
              → EMERGENCIA_24H
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

interface LegalSectionProps {
  number: string;
  title: string;
  children: ReactNode;
}

export function LegalSection({ number, title, children }: LegalSectionProps) {
  return (
    <section>
      <h2 className="mb-3 flex items-baseline gap-3 font-headline text-xl font-black uppercase tracking-tight text-brutal-black">
        <span className="border-2 border-brutal-black bg-brutal-teal px-2 py-0.5 font-mono text-xs">
          {number}
        </span>
        {title}
      </h2>
      <div className="space-y-3 text-ink">{children}</div>
    </section>
  );
}

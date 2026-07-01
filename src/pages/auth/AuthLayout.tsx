import { Link } from 'react-router-dom';
import { type ReactNode } from 'react';
import { BlobsBackground } from '@/components/ui';

interface AuthLayoutProps {
  badge: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ badge, title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BlobsBackground />

      <header className="relative z-10 border-b-4 border-brutal-black bg-white/85 px-6 py-4 ls:py-2 backdrop-blur-md lg:px-8">
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

      <main className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-6 py-12 ls:py-4 ls:items-start lg:px-8">
        <div className="w-full max-w-md">
          <div className="border-4 border-brutal-black bg-white/90 p-8 ls:p-5 shadow-brutal backdrop-blur-md">
            <span className="inline-block border-2 border-brutal-black bg-brutal-purple px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
              {badge}
            </span>
            <h1 className="mt-4 font-headline text-3xl font-black uppercase leading-none tracking-tighter">
              {title}
            </h1>
            <p className="mt-2 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              {subtitle}
            </p>

            <div className="mt-8 ls:mt-4">{children}</div>
          </div>

          {footer && <div className="mt-6 text-center">{footer}</div>}
        </div>
      </main>
    </div>
  );
}

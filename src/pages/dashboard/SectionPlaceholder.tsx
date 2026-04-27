import { type LucideIcon } from 'lucide-react';

interface SectionPlaceholderProps {
  icon: LucideIcon;
  title: string;
  hito: string;
  description: string;
}

export function SectionPlaceholder({
  icon: Icon,
  title,
  hito,
  description,
}: SectionPlaceholderProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 py-8">
      <div className="border-4 border-brutal-black bg-white/85 p-8 shadow-brutal backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-block border-2 border-brutal-black bg-brutal-black px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
            {hito}
          </span>
          <Icon className="h-10 w-10 text-brutal-purple" aria-hidden="true" />
        </div>

        <h1 className="mt-6 font-headline text-4xl font-black uppercase leading-none tracking-tighter">
          {title}
        </h1>

        <p className="mt-4 font-mono text-[11px] font-bold uppercase leading-relaxed tracking-wider text-ink-muted">
          {description}
        </p>

        <div className="mt-8 border-t-2 border-dashed border-brutal-black pt-4">
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-brutal-coral">
            ◆ MÓDULO_EN_PROVISIÓN — VOLVERÁ_PRONTO
          </p>
        </div>
      </div>
    </div>
  );
}

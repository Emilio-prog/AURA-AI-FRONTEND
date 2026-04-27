import { type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface NavItemProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  isSOS?: boolean;
  onClick?: () => void;
  className?: string;
}

export function NavItem({
  icon,
  label,
  isActive = false,
  isSOS = false,
  onClick,
  className,
}: NavItemProps) {
  return (
    <button
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex w-full items-center gap-2.5 border-b-2 border-brutal-black px-3.5 py-3 text-left transition-colors duration-100',
        // fuente
        'font-mono text-[10px] uppercase tracking-[0.05em]',
        // estado inactivo
        !isActive && 'bg-white text-ink-muted hover:bg-surface-muted hover:text-ink',
        // estado activo
        isActive && 'bg-brutal-purple text-white',
        // borde derecho SOS
        isSOS && !isActive && 'border-r-[6px] border-r-brutal-coral',
        className,
      )}
    >
      {/* Icono */}
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center text-base',
          isActive ? 'text-white' : isSOS ? 'text-brutal-coral' : 'text-ink-muted',
        )}
      >
        {icon}
      </span>

      {/* Label */}
      <span className="flex-1 truncate">{label}</span>

      {/* Indicador pulsante SOS */}
      {isSOS && (
        <span
          className="h-2 w-2 shrink-0 animate-pulse-soft rounded-full bg-brutal-coral"
          aria-hidden="true"
        />
      )}
    </button>
  );
}

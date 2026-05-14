import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type ChipVariant = 'coral' | 'purple' | 'teal' | 'black' | 'yellow' | 'outline';

interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  leftIcon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<ChipVariant, string> = {
  coral: 'bg-brutal-coral text-white border-brutal-black',
  purple: 'bg-brutal-purple text-white border-brutal-black',
  teal: 'bg-brutal-teal text-brutal-black border-brutal-black',
  black: 'bg-brutal-black text-white border-brutal-black',
  yellow: 'bg-yellow-300 text-brutal-black border-brutal-black',
  outline: 'bg-white text-brutal-black border-brutal-black',
};

export function Chip({ variant = 'outline', leftIcon, children, className, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border-2 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider',
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {leftIcon && <span className="shrink-0">{leftIcon}</span>}
      {children}
    </span>
  );
}

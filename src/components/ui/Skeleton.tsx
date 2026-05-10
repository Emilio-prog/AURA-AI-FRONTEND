import { type HTMLAttributes } from 'react';
import clsx from 'clsx';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Si true, redondea con bordes brutalistas (border-3 + bg). */
  bordered?: boolean;
}

/**
 * Bloque de carga con animación pulse-soft. Mantiene el lenguaje brutalista:
 * borde negro grueso + fondo neutro. Aplica `dark:` variants automáticamente.
 */
export function Skeleton({ className, bordered = false, ...rest }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={clsx(
        'animate-pulse-soft bg-zinc-200 dark:bg-zinc-700',
        bordered && 'border-3 border-brutal-black dark:border-zinc-500',
        className,
      )}
      {...rest}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

/** Bloque de varias líneas para placeholders de párrafo. */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div className={clsx('flex flex-col gap-2', className)} aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={clsx('h-3', i === lines - 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  );
}

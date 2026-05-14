import { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type CardShadowColor = 'default' | 'coral' | 'purple' | 'teal';
export type CardVariant = 'solid' | 'glass';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  size?: 'sm' | 'md';
  shadowColor?: CardShadowColor;
  hoverable?: boolean;
}

const shadowMap: Record<CardShadowColor, string> = {
  default: 'shadow-brutal hover:shadow-[12px_12px_0_0_#000]',
  coral: 'shadow-brutal-coral hover:shadow-[12px_12px_0_0_#FB7185]',
  purple: 'shadow-brutal-purple hover:shadow-[12px_12px_0_0_#A855F7]',
  teal: 'shadow-brutal-teal hover:shadow-[12px_12px_0_0_#2DD4BF]',
};

export function Card({
  children,
  variant = 'solid',
  size = 'md',
  shadowColor = 'default',
  hoverable = false,
  className,
  ...props
}: CardProps) {
  const isGlass = variant === 'glass';

  return (
    <div
      className={cn(
        'border-4 border-brutal-black',
        size === 'sm' ? 'p-4' : 'p-6',
        isGlass ? 'bg-white/88 backdrop-blur-brutal' : 'bg-white',
        shadowMap[shadowColor],
        hoverable &&
          'cursor-pointer transition-transform duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

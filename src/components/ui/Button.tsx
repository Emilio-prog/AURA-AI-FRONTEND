import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'coral' | 'purple' | 'teal' | 'black' | 'white' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  coral: 'bg-brutal-coral text-white border-brutal-black',
  purple: 'bg-brutal-purple text-white border-brutal-black',
  teal: 'bg-brutal-teal text-brutal-black border-brutal-black',
  black: 'bg-brutal-black text-white border-brutal-black',
  white: 'bg-white text-brutal-black border-brutal-black',
  ghost: 'bg-transparent text-brutal-black border-brutal-black hover:bg-surface-muted',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[10px] gap-1.5',
  md: 'px-5 py-2.5 text-xs gap-2',
  lg: 'px-7 py-3.5 text-sm gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'white',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // base
          'inline-flex items-center justify-center border-3 font-sans font-bold uppercase tracking-wider shadow-brutal-sm',
          'transition-transform duration-100',
          // interactive
          'hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none',
          // disabled
          'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
          variantClasses[variant],
          sizeClasses[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            <span>CARGANDO</span>
          </span>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';

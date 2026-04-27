import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, rows = 4, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="brutal-label">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
          className={cn(
            'block w-full resize-y border-3 border-brutal-black bg-white px-4 py-2.5 font-sans text-sm text-ink',
            'placeholder:text-ink-subtle',
            'focus:outline-none focus:ring-0',
            'focus-visible:outline-3 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-brutal-purple',
            'disabled:pointer-events-none disabled:opacity-50',
            error && 'border-brutal-coral',
            className,
          )}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="font-mono text-[10px] uppercase tracking-wider text-brutal-coral"
          >
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${textareaId}-hint`} className="brutal-label">
            {hint}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

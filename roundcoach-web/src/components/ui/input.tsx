import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'w-full rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm text-ink outline-none transition focus:border-ember focus:ring-2 focus:ring-ember/20',
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = 'Input';

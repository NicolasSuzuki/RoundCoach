import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import clsx from 'clsx';

export function Button({
  children,
  className,
  ...props
}: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={clsx(
        'rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-sand transition hover:translate-y-[-1px] hover:bg-pine disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

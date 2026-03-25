import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

const toneStyles = {
  info: 'border-slate-200 bg-slate-50 text-slate-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  error: 'border-rose-200 bg-rose-50 text-rose-800',
} as const;

export function Notice({
  tone = 'info',
  title,
  children,
  className,
}: PropsWithChildren<{
  tone?: keyof typeof toneStyles;
  title?: string;
  className?: string;
}>) {
  return (
    <div className={clsx('rounded-[24px] border p-4', toneStyles[tone], className)}>
      {title ? <p className="text-sm font-semibold">{title}</p> : null}
      <div className={clsx('text-sm leading-6', title ? 'mt-2' : '')}>{children}</div>
    </div>
  );
}

import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

export function Card({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={clsx(
        'rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-panel backdrop-blur',
        className,
      )}
    >
      {children}
    </section>
  );
}

import type { PropsWithChildren } from 'react';

export function Field({
  label,
  hint,
  children,
}: PropsWithChildren<{ label: string; hint?: string }>) {
  return (
    <label className="grid gap-2 text-sm text-ink">
      <span className="font-medium">{label}</span>
      {children}
      {hint ? <span className="text-xs text-ink/60">{hint}</span> : null}
    </label>
  );
}

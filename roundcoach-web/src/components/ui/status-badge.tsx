import clsx from 'clsx';

const styles: Record<string, string> = {
  WIN: 'bg-emerald-100 text-emerald-800',
  LOSS: 'bg-rose-100 text-rose-800',
  UPLOADED: 'bg-slate-100 text-slate-700',
  PROCESSING: 'bg-amber-100 text-amber-800',
  PROCESSED: 'bg-emerald-100 text-emerald-800',
  FAILED: 'bg-rose-100 text-rose-800',
  COMPLETED: 'bg-emerald-100 text-emerald-800',
  PENDING: 'bg-slate-100 text-slate-700',
};

const labels: Record<string, string> = {
  WIN: 'Vitoria',
  LOSS: 'Derrota',
  UPLOADED: 'Enviado',
  PROCESSING: 'Processando',
  PROCESSED: 'Processado',
  FAILED: 'Falhou',
  COMPLETED: 'Concluida',
  PENDING: 'Pendente',
};

export function StatusBadge({ value }: { value: string }) {
  return (
    <span
      className={clsx(
        'inline-flex rounded-full px-3 py-1 text-xs font-semibold',
        styles[value] ?? 'bg-slate-100 text-slate-700',
      )}
    >
      {labels[value] ?? value}
    </span>
  );
}

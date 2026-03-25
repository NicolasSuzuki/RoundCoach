export function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR');
}

export function formatScore(value?: number | null) {
  if (value === undefined || value === null) {
    return '--';
  }

  return `${value}`;
}

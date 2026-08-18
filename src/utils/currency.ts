export function formatRwf(amount: number): string {
  return `${Math.round(amount).toLocaleString()} RWF`;
}

// The backend stores every price in USD; the storefront (web and mobile) always
// displays RWF. Keep this rate in sync with lib/currency.ts in the backend repo.
export const USD_TO_RWF = 1400;

export function usdToRwf(usd: number): number {
  return Math.round(usd * USD_TO_RWF);
}

export function rwfToUsd(rwf: number): number {
  return rwf / USD_TO_RWF;
}

/** Formats a USD amount (as stored/returned by the API) as an RWF display string. */
export function formatRwf(usd: number): string {
  return `${usdToRwf(usd).toLocaleString()} RWF`;
}

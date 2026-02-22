/**
 * XO chain helpers: canonical day strings and normalization.
 * Use UTC to avoid timezone shifts in builds.
 */

export function isoDay(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function normalizeDigestDay(input?: string | Date): string | undefined {
  if (!input) return undefined;
  if (input instanceof Date) return isoDay(input);
  const s = String(input).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined;
}

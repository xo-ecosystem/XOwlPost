/**
 * XO chain helpers: canonical day strings and normalization.
 * Use UTC to avoid timezone shifts in builds.
 */

const DAY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function isoDay(d: Date): string | undefined {
  if (Number.isNaN(d.getTime())) return undefined;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  const s = `${y}-${m}-${day}`;
  return DAY_REGEX.test(s) ? s : undefined;
}

export function normalizeDigestDay(input?: string | Date): string | undefined {
  if (!input) return undefined;
  if (input instanceof Date) return isoDay(input);
  const s = String(input).trim();
  return DAY_REGEX.test(s) ? s : undefined;
}

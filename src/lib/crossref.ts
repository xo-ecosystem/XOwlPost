import { getCollection } from 'astro:content';
import { createHash } from 'node:crypto';
import { XO_VAULT_BASE } from '../consts';
import { normalizeDigestDay } from './xo_chain';

export type Crossref = {
  byPost: Record<
    string,
    {
      id: string;
      title: string;
      url: string;
      pubDate: string;
      vault_url?: string | null;
      ledger_day?: string;
      digest_day?: string;
      content_sha256?: string;
    }
  >;
  byDigestDay: Record<string, string[]>; // day → post URLs
};

/**
 * Single source of truth for digest day ↔ posts. Purely generated; no manual edits.
 * Digest day: frontmatter.digest_day if present/valid, else pubDate (YYYY-MM-DD).
 * Option B: invalid digest_day → fallback to pubDate; invalid pubDate → omit digest linking.
 */
export async function buildCrossref(): Promise<Crossref> {
  const posts = await getCollection('blog');
  const viewerBase = XO_VAULT_BASE.replace(/\/$/, '');

  const byPost: Crossref['byPost'] = {};
  const byDigestDay: Crossref['byDigestDay'] = {};

  for (const p of posts) {
    if (p.data.draft) continue;

    // Content-bound integrity (v1.1): hash the raw body (normalized newlines).
    // This intentionally does NOT include derived links (vault/digest/ledger), so content remains the anchor.
    const body = (typeof (p as any).body === 'string' ? (p as any).body : '').replace(/\r\n/g, '\n');
    const contentSha256 = body
      ? createHash('sha256').update(body, 'utf8').digest('hex')
      : undefined;

    const url = `/posts/${p.id}/`;
    const pubDate =
      p.data.pubDate instanceof Date
        ? p.data.pubDate
        : new Date(p.data.pubDate);

    const digestDay =
      normalizeDigestDay(p.data.digest_day) ?? normalizeDigestDay(pubDate);
    const ledgerDay =
      normalizeDigestDay(p.data.ledger_day) ?? normalizeDigestDay(pubDate);
    const derivedVaultUrl =
      (typeof p.data.vault_url === 'string' && p.data.vault_url.trim().length > 0)
        ? p.data.vault_url
        : (ledgerDay ? `${viewerBase}/vault/daily/index.html#${ledgerDay}` : undefined);

    const item = {
      id: p.id,
      title: p.data.title,
      url,
      pubDate: pubDate.toISOString(),
      vault_url: derivedVaultUrl ?? null,
      ledger_day: ledgerDay ?? undefined,
      digest_day: digestDay ?? undefined,
      content_sha256: contentSha256 ?? undefined,
    };

    byPost[url] = item;

    if (digestDay) {
      (byDigestDay[digestDay] ??= []).push(url);
    }
  }

  for (const day of Object.keys(byDigestDay)) {
    byDigestDay[day].sort();
  }

  return { byPost, byDigestDay };
}

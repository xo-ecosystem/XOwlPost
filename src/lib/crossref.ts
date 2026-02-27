import { getCollection } from 'astro:content';
import { createHash } from 'node:crypto';
import { XO_VAULT_BASE } from '../consts';
import { normalizeDigestDay } from './xo_chain';

export type Crossref = {
  version: number;
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
  const postsRaw = await getCollection('blog');
  const posts = [...postsRaw].sort((a, b) => a.id.localeCompare(b.id));
  const viewerBase = XO_VAULT_BASE.replace(/\/$/, '');

  const byPost: Crossref['byPost'] = {};
  const byDigestDay: Crossref['byDigestDay'] = {};

  for (const p of posts) {
    if (p.data.draft) continue;

    const rawBody = typeof (p as any).body === 'string' ? (p as any).body : '';

    // Normalize:
    // 1) CRLF → LF
    // 2) trim trailing whitespace per line
    // 3) collapse 3+ blank lines → 2
    const body = rawBody
      .replace(/\r\n/g, '\n')
      .split('\n')
      .map((line) => line.replace(/[ \t]+$/g, ''))
      .join('\n')
      .replace(/\n{3,}/g, '\n\n');

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

  // Ensure stable key order for deterministic JSON output
  const sortedByPost = Object.fromEntries(
    Object.entries(byPost).sort(([a], [b]) => a.localeCompare(b))
  );

  return {
    version: 1,
    hashRules: "v1",
    byPost: sortedByPost,
    byDigestDay,
  };
}

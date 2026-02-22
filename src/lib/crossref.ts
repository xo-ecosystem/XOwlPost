import { getCollection } from 'astro:content';
import { normalizeDigestDay } from './xo_chain';

export type Crossref = {
  byDigestDay: Record<string, string[]>;
  byPost: Record<
    string,
    {
      url: string;
      title: string;
      pubDate: string;
      digest_day?: string;
      ledger_day?: string;
      vault_url?: string | null;
    }
  >;
};

/** Single source of truth for digest day ↔ posts. Used by /crossref.json and /digest/[day]. */
export async function buildCrossref(): Promise<Crossref> {
  const posts = await getCollection('blog');

  const byDigestDay: Record<string, string[]> = {};
  const byPost: Crossref['byPost'] = {};

  for (const p of posts) {
    if (p.data.draft) continue;

    const pubDate = new Date(p.data.pubDate);
    const digest_day =
      normalizeDigestDay(p.data.digest_day) ?? normalizeDigestDay(pubDate);
    const ledger_day =
      normalizeDigestDay(p.data.ledger_day) ?? normalizeDigestDay(pubDate);
    const url = `/posts/${p.id}/`;

    byPost[p.id] = {
      url,
      title: p.data.title,
      pubDate: pubDate.toISOString(),
      digest_day: digest_day ?? undefined,
      ledger_day: ledger_day ?? undefined,
      vault_url: p.data.vault_url ?? null,
    };

    if (digest_day) {
      byDigestDay[digest_day] ??= [];
      byDigestDay[digest_day].push(p.id);
    }
  }

  for (const day of Object.keys(byDigestDay)) {
    byDigestDay[day].sort((a, b) => {
      const A = byPost[a];
      const B = byPost[b];
      return +new Date(B.pubDate) - +new Date(A.pubDate);
    });
  }

  return { byDigestDay, byPost };
}

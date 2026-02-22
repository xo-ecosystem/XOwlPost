import { getCollection } from 'astro:content';
import { normalizeDigestDay } from '../lib/xo_chain';

export async function GET() {
  const posts = await getCollection('blog');
  const items = posts
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
    .map((p) => {
      const pubDate = new Date(p.data.pubDate);
      const digest_day =
        normalizeDigestDay(p.data.digest_day) ?? normalizeDigestDay(pubDate);
      const ledger_day =
        normalizeDigestDay(p.data.ledger_day) ?? normalizeDigestDay(pubDate);
      return {
        id: p.id,
        title: p.data.title,
        description: p.data.description ?? '',
        pubDate: pubDate.toISOString(),
        url: `/posts/${p.id}/`,
        vault_url: p.data.vault_url ?? null,
        digest_day: digest_day ?? null,
        ledger_day: ledger_day ?? null,
      };
    });

  return new Response(
    JSON.stringify({ count: items.length, items }, null, 2),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control':
          'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
      },
    },
  );
}

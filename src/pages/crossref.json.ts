import { buildCrossref } from '../lib/crossref';

/** Build-time index: digest_day ↔ post URLs; post id → chain fields. */
export async function GET() {
  const { byDigestDay, byPost } = await buildCrossref();
  const byDigestDayUrls: Record<string, string[]> = {};
  for (const [day, ids] of Object.entries(byDigestDay)) {
    byDigestDayUrls[day] = ids.map((id) => byPost[id].url);
  }
  const data = { byDigestDay: byDigestDayUrls, byPost };
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}

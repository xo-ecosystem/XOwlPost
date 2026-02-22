import { buildCrossref } from '../lib/crossref';

/** Purely generated at build; no manual edits. */
export async function GET() {
  const data = await buildCrossref();
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
    },
  });
}

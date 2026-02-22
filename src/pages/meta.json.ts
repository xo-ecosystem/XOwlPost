/**
 * Build stamp: which deploy is live.
 * GET /meta.json — commit, branch, builtAt.
 * Cloudflare Pages injects CF_PAGES_COMMIT_SHA and CF_PAGES_BRANCH at build time.
 * Optional env: BUILD_COMMIT, BUILD_BRANCH (e.g. in Pages dashboard).
 */
export async function GET() {
  const commit =
    (import.meta.env.BUILD_COMMIT as string | undefined) ||
    (import.meta.env.CF_PAGES_COMMIT_SHA as string | undefined) ||
    'unknown';
  const branch =
    (import.meta.env.BUILD_BRANCH as string | undefined) ||
    (import.meta.env.CF_PAGES_BRANCH as string | undefined) ||
    'unknown';

  const body = JSON.stringify(
    {
      commit,
      branch,
      builtAt: new Date().toISOString(),
    },
    null,
    2,
  );

  return new Response(body, {
    headers: { 'Content-Type': 'application/json' },
  });
}

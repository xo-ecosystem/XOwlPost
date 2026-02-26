import { XO_VAULT_API_BASE } from '../consts';
import { buildVaultBadgesIndex } from '../lib/vault_proofs';
import { XO_VAULT_PROOFS_PUB_B64 } from '../lib/vault_proofs_key';

const PLACEHOLDER_KEYS = ['REPLACE_ME', 'REPLACE_ME_BASE64_32B'];

/**
 * Debug/status endpoint for Vault badge verification.
 *
 * NOTE: Must be prerendered for Cloudflare Pages (static) deployments.
 * It still reflects current proofs availability at build time.
 */
export const prerender = true;

export async function GET() {
  const strict = import.meta.env.PUBLIC_XO_VAULT_PROOFS_STRICT === '1';
  const apiBase = XO_VAULT_API_BASE.replace(/\/$/, '');
  const proofsUrl = `${apiBase}/vault/proofs/posts.json`;
  const pubKey = (XO_VAULT_PROOFS_PUB_B64 ?? '').trim();
  const keyConfigured = !!pubKey && !PLACEHOLDER_KEYS.includes(pubKey);

  if (!keyConfigured) {
    return new Response(
      JSON.stringify(
        {
          status: 'key_not_configured',
          strict,
          keyConfigured,
          apiBase,
          proofsUrl,
          badgeCount: 0,
          checkedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      },
    );
  }

  try {
    const badges = await buildVaultBadgesIndex();
    return new Response(
      JSON.stringify(
        {
          status: 'ok',
          strict,
          keyConfigured,
          apiBase,
          proofsUrl,
          badgeCount: Object.keys(badges).length,
          checkedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      },
    );
  } catch (err) {
    if (strict) throw err;
    return new Response(
      JSON.stringify(
        {
          status: 'proofs_unavailable',
          strict,
          keyConfigured,
          apiBase,
          proofsUrl,
          badgeCount: 0,
          error: err instanceof Error ? err.message : String(err),
          checkedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      },
    );
  }
}

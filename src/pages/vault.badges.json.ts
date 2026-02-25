import { buildVaultBadgesIndex } from '../lib/vault_proofs';
import { XO_VAULT_PROOFS_PUB_B64 } from '../lib/vault_proofs_key';

const PLACEHOLDER_KEYS = ['REPLACE_ME', 'REPLACE_ME_BASE64_32B'];

/** Build-time verified badges. If key is placeholder or fetch fails, returns {}. Set PUBLIC_XO_VAULT_PROOFS_STRICT=1 to fail build instead. */
export const prerender = true;

export async function GET() {
  const strict = import.meta.env.PUBLIC_XO_VAULT_PROOFS_STRICT === '1';
  let badges: Record<string, { verified: true; [k: string]: unknown }>;

  if (PLACEHOLDER_KEYS.includes(XO_VAULT_PROOFS_PUB_B64)) {
    badges = {};
    if (strict) throw new Error('Vault proofs key not configured');
  } else {
    try {
      badges = await buildVaultBadgesIndex();
    } catch (e) {
      if (strict) throw e;
      badges = {};
    }
  }

  return new Response(JSON.stringify(meta, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}

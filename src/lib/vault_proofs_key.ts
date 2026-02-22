/**
 * Ed25519 public key (raw 32 bytes) base64-encoded for xo-vault proofs.
 *
 * Source of truth:
 * - Cloudflare Pages env var: PUBLIC_XO_VAULT_PROOFS_PUB_B64
 *
 * Fallback:
 * - 'REPLACE_ME_BASE64_32B' keeps builds working before Vault proofs are wired.
 */
export const XO_VAULT_PROOFS_PUB_B64 =
  (import.meta.env.PUBLIC_XO_VAULT_PROOFS_PUB_B64 ?? '').trim() ||
  'REPLACE_ME_BASE64_32B';

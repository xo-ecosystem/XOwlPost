// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'XOwlPost';
export const SITE_DESCRIPTION = 'Signed posts linked to the XO chain: Vault → Ledger → Digest.';

// XO chain base URLs: env-driven so prod/staging don't require code edits.
// PUBLIC_XO_VAULT_BASE = viewer (links like "View in Vault" open this).
// PUBLIC_XO_VAULT_API_BASE = API (proofs fetch, inbox submit); defaults to viewer if unset.
export const XO_VAULT_BASE =
  (import.meta.env.PUBLIC_XO_VAULT_BASE as string | undefined) ?? 'https://xo-vault.com';
export const XO_VAULT_API_BASE =
  (import.meta.env.PUBLIC_XO_VAULT_API_BASE as string | undefined)?.trim() || XO_VAULT_BASE;
export const XO_VAULT_DEBUG = import.meta.env.PUBLIC_XO_VAULT_DEBUG === '1';
export const XO_LEDGER_BASE =
  (import.meta.env.PUBLIC_XO_LEDGER_BASE as string | undefined) ?? 'https://xoledger.com';
export const XO_DIGEST_BASE =
  (import.meta.env.PUBLIC_XO_DIGEST_BASE as string | undefined) ?? 'https://xo-digest.com';

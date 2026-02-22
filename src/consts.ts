// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = 'XOwlPost';
export const SITE_DESCRIPTION = 'Signed posts linked to the XO chain: Vault → Ledger → Digest.';

// XO chain base URLs: env-driven so prod/staging don't require code edits.
// Set in Cloudflare Pages (or .env): PUBLIC_XO_VAULT_BASE, PUBLIC_XO_LEDGER_BASE, PUBLIC_XO_DIGEST_BASE
export const XO_VAULT_BASE =
  (import.meta.env.PUBLIC_XO_VAULT_BASE as string | undefined) ?? 'https://xo-vault.com';
export const XO_LEDGER_BASE =
  (import.meta.env.PUBLIC_XO_LEDGER_BASE as string | undefined) ?? 'https://xoledger.com';
export const XO_DIGEST_BASE =
  (import.meta.env.PUBLIC_XO_DIGEST_BASE as string | undefined) ?? 'https://xo-digest.com';

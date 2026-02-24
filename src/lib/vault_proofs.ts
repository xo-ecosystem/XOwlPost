import { XO_VAULT_API_BASE } from '../consts';
import { XO_VAULT_PROOFS_PUB_B64 } from './vault_proofs_key';

export type ProofPost = {
  vault_url?: string;
  digest_day?: string;
  ledger_day?: string;
  content_sha256?: string;
};

export type ProofsFile = {
  version: number;
  issuer: string;
  signedAt: string;
  posts: Record<string, ProofPost>;
  signature: string;
};

function b64ToBytes(b64: string): Uint8Array {
  const bin = typeof Buffer !== 'undefined'
    ? Buffer.from(b64, 'base64')
    : new Uint8Array([...atob(b64)].map((c) => c.charCodeAt(0)));
  return new Uint8Array(bin);
}

function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
  const keys = Object.keys(obj as object).sort();
  return `{${keys.map((k) => JSON.stringify(k) + ':' + stableStringify((obj as Record<string, unknown>)[k])).join(',')}}`;
}

async function verifyEd25519(
  msg: Uint8Array,
  sig: Uint8Array,
  pub: Uint8Array,
): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    pub,
    { name: 'Ed25519' },
    false,
    ['verify'],
  );
  return crypto.subtle.verify('Ed25519', key, sig, msg);
}

export async function fetchAndVerifyVaultProofs(): Promise<ProofsFile> {
  const url = `${XO_VAULT_API_BASE.replace(/\/$/, '')}/vault/proofs/posts.json`;
  const res = await fetch(url, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`Vault proofs fetch failed: ${res.status}`);
  const data = (await res.json()) as ProofsFile;

  const { signature, ...unsigned } = data;
  if (data.issuer !== 'xo-vault' || data.version !== 1) {
    throw new Error('Vault proofs header invalid');
  }
  if (!signature) throw new Error('Vault proofs missing signature');

  const canon = stableStringify(unsigned);
  const ok = await verifyEd25519(
    new TextEncoder().encode(canon),
    b64ToBytes(signature),
    b64ToBytes(XO_VAULT_PROOFS_PUB_B64),
  );
  if (!ok) throw new Error('Vault proofs signature invalid');
  return data;
}

export type VaultBadgesIndex = Record<string, ProofPost & { verified: true }>;

let cachedBadges: Promise<VaultBadgesIndex> | null = null;

/** Cached so multiple post pages only fetch+verify once per build. */
export function getCachedVaultBadgesIndex(): Promise<VaultBadgesIndex> {
  if (!cachedBadges) {
    cachedBadges = buildVaultBadgesIndex();
  }
  return cachedBadges;
}

const PLACEHOLDER_KEYS = ['REPLACE_ME', 'REPLACE_ME_BASE64_32B'];

export async function buildVaultBadgesIndex(): Promise<VaultBadgesIndex> {
  if (PLACEHOLDER_KEYS.includes(XO_VAULT_PROOFS_PUB_B64)) return {} as VaultBadgesIndex;
  const proofs = await fetchAndVerifyVaultProofs();
  const out: VaultBadgesIndex = {} as VaultBadgesIndex;
  for (const [url, p] of Object.entries(proofs.posts ?? {})) {
    out[url] = { ...p, verified: true };
  }
  return out;
}

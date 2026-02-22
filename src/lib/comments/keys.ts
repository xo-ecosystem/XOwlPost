/**
 * Client-only: Ed25519 keypair for signed comments. Stored in localStorage; no accounts.
 */

const LS_PRIV = 'xo_comments_ed25519_priv_jwk';
const LS_PUB = 'xo_comments_ed25519_pub_b64';

export async function getOrCreateKeypair(): Promise<{
  privJwk: JsonWebKey;
  pubB64: string;
}> {
  if (typeof localStorage === 'undefined') {
    throw new Error('localStorage required');
  }
  const existing = localStorage.getItem(LS_PRIV);
  const existingPub = localStorage.getItem(LS_PUB);
  if (existing && existingPub) {
    return { privJwk: JSON.parse(existing) as JsonWebKey, pubB64: existingPub };
  }

  const kp = await crypto.subtle.generateKey(
    { name: 'Ed25519' },
    true,
    ['sign', 'verify'],
  );
  const privJwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
  const pubRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', kp.publicKey),
  );
  const pubB64 = btoa(String.fromCharCode(...pubRaw));

  localStorage.setItem(LS_PRIV, JSON.stringify(privJwk));
  localStorage.setItem(LS_PUB, pubB64);
  return { privJwk, pubB64 };
}

export async function importPrivateKey(
  privJwk: JsonWebKey,
): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'jwk',
    privJwk,
    { name: 'Ed25519' },
    false,
    ['sign'],
  );
}

function stableStringify(obj: unknown): string {
  if (obj === null || typeof obj !== 'object') return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(stableStringify).join(',')}]`;
  const keys = Object.keys(obj as object).sort();
  return `{${keys.map((k) => JSON.stringify(k) + ':' + stableStringify((obj as Record<string, unknown>)[k])).join(',')}}`;
}

export async function signObject(
  obj: Record<string, unknown>,
  privJwk: JsonWebKey,
): Promise<string> {
  const key = await importPrivateKey(privJwk);
  const msg = new TextEncoder().encode(stableStringify(obj));
  const sig = new Uint8Array(await crypto.subtle.sign('Ed25519', key, msg));
  return btoa(String.fromCharCode(...sig));
}

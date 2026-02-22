# XOwlPost

Signed posts linked to the XO chain: Vault → Ledger → Digest.

- **Option A:** XO theme (Ink/Paper), clean post layout, Content Collections.
- **Option B:** Per-post chain links (Vault, Ledger day, Merkle, PDF, Digest JSON, Validate), `/posts.json`, `/crossref.json`, RSS. No backend.

## Local

```sh
git clone git@github.com:xo-ecosystem/XOwlPost.git
cd XOwlPost
pnpm i
pnpm dev
```

## Cloudflare Pages (single production branch)

- **Repo:** `xo-ecosystem/XOwlPost`
- **Production branch:** `main`
- **Build command:** `pnpm install --frozen-lockfile && pnpm build`
- **Output directory:** `dist`
- **Node version:** 18 or 20 (set in Pages → Settings → Environment variables or in `.nvmrc` / `ENGINE` in package.json if you prefer)

Required in repo root: `package.json`, `pnpm-lock.yaml`, `astro.config.mjs`, `src/`.

## Environment (optional)

Bases for chain links are env-driven with safe defaults. Set in Cloudflare Pages (Settings → Environment variables) to override:

| Variable | Default | Purpose |
|----------|---------|---------|
| `PUBLIC_XO_VAULT_BASE` | `https://xo-vault.com` | Vault root |
| `PUBLIC_XO_LEDGER_BASE` | `https://xoledger.com` | Ledger root |
| `PUBLIC_XO_DIGEST_BASE` | `https://xo-digest.com` | Digest root |

Optional for build stamp (see below):

| Variable | Injected by Pages | Purpose |
|----------|-------------------|---------|
| `CF_PAGES_COMMIT_SHA` | Yes | Commit of the deploy |
| `CF_PAGES_BRANCH` | Yes | Branch name |
| `BUILD_COMMIT` | You | Override commit in `/meta.json` |
| `BUILD_BRANCH` | You | Override branch in `/meta.json` |

## Build stamp (which deploy is live)

Static equivalent of a `/_meta` endpoint:

```bash
curl -s https://your-site.pages.dev/meta.json
```

Returns `commit`, `branch`, and `builtAt`. On Cloudflare Pages, `CF_PAGES_COMMIT_SHA` and `CF_PAGES_BRANCH` are inlined at build time (see `astro.config.mjs`). Optional: set `BUILD_COMMIT` / `BUILD_BRANCH` in Pages env to override.

## Commands

| Command | Action |
|--------|--------|
| `pnpm dev` | Dev server at `localhost:4321` |
| `pnpm build` | Production build to `./dist/` |
| `pnpm preview` | Preview the build locally |
| `pnpm new:post "Post Title"` | Create a new draft post in `src/content/blog/` with XO frontmatter (slug, `ledger_day`/`digest_day` = today, `draft: true`) |

Draft posts (`draft: true`) are excluded from `/posts/`, homepage, RSS, `posts.json`, and `crossref.json`. Set `draft: false` or remove `draft` when publishing.

## Structure

- `src/styles/xo.css` — XO theme tokens and utilities.
- `src/layouts/Base.astro` — Global shell + XO CSS.
- `src/layouts/Post.astro` — Single post + XO chain links.
- `src/pages/index.astro` — Homepage + latest posts.
- `src/pages/posts/` — Post list and `[...slug]` for single posts.
- `src/pages/posts.json` — Index of all posts (for other tools).
- `src/pages/crossref.json` — Post ↔ digest day mapping (uses shared `src/lib/crossref.ts`).
- `src/pages/digest/[day].astro` — Day index: “Digest day YYYY-MM-DD” and list of posts referenced that day.
- `src/pages/meta.json` — Build stamp (commit, branch, builtAt).
- `src/lib/xo_chain.ts` — `isoDay()`, `normalizeDigestDay()` for canonical day handling.
- `src/content/blog/` — Markdown/MDX; optional frontmatter: `vault_url`, `ledger_day`, `digest_day`, `draft`.

## Post frontmatter (Option B)

```yaml
title: "Why XO Digest exists"
description: "..."
pubDate: "2026-02-21"
vault_url: "https://xo-vault.com/vault/daily/index.html#2026-02-21"
ledger_day: "2026-02-21"
digest_day: "2026-02-21"   # optional
```

Chain links and “Referenced by Digest day …” are derived from these + `pubDate`; no backend required.

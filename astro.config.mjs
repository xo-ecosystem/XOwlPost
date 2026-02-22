// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap()],
	vite: {
		// Expose Cloudflare Pages build env to _meta.json so "which deploy is live" works.
		define: {
			'import.meta.env.CF_PAGES_COMMIT_SHA': JSON.stringify(
				process.env.CF_PAGES_COMMIT_SHA ?? '',
			),
			'import.meta.env.CF_PAGES_BRANCH': JSON.stringify(
				process.env.CF_PAGES_BRANCH ?? '',
			),
		},
	},
});

import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
		schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			draft: z.boolean().optional(),
			// Option B: XO chain pointers (YAML may parse dates as Date; allow null for vault_url)
			vault_url: z
				.union([z.string().url(), z.literal(''), z.null()])
				.optional()
				.transform((v) => (v == null || v === '' ? undefined : v)),
			vault_id: z.string().optional(),
			ledger_day: z
				.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.coerce.date()])
				.optional()
				.transform((d) =>
					d instanceof Date ? d.toISOString().slice(0, 10) : d,
				),
			digest_day: z
				.union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.coerce.date()])
				.optional()
				.transform((d) =>
					d instanceof Date ? d.toISOString().slice(0, 10) : d,
				),
		}),
});

export const collections = { blog };

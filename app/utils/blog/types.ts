import { z } from 'zod'
import type calculateReadingTime from 'reading-time'

export const frontmatterSchema = z.object({
	title: z.string(),
	description: z.string(),
	date: z.string(),
	categories: z.array(z.string()).optional(),
	draft: z.boolean().optional(),
	archived: z.boolean().optional(),
	unlisted: z.boolean().optional(),
	bannerAlt: z.string().optional(),
	bannerCredit: z.string().optional(),
	meta: z
		.object({
			keywords: z.array(z.string()).optional(),
		})
		.optional(),
})

export type Frontmatter = z.infer<typeof frontmatterSchema>

export type MdxPage = {
	code: string
	slug: string
	editLink: string
	readTime?: ReturnType<typeof calculateReadingTime>
	dateDisplay?: string
	frontmatter: Frontmatter
}

export type MdxListItem = Omit<MdxPage, 'code'>

export type GitHubFile = {
	path: string
	content: string
}

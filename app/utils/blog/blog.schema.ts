import { z } from 'zod'

export const BlogPostFrontmatterSchema = z
	.object({
		title: z.string({ required_error: 'Title is required' }),
		description: z.string({ required_error: 'Description is required' }),
		date: z
			.string({ required_error: 'Date is required' })
			.pipe(z.coerce.date()),
		published: z.boolean({ required_error: 'Published status is required' }),
		bannerImage: z.string().optional(),
		bannerAlt: z.string().optional(),
	})
	.refine((data) => !data.bannerImage || data.bannerAlt, {
		message: 'bannerAlt is required when bannerImage is provided',
		path: ['bannerAlt'],
	})
	.refine((data) => !data.bannerAlt || data.bannerImage, {
		message: 'bannerImage is required when bannerAlt is provided',
		path: ['bannerImage'],
	})

export type BlogPostFrontmatter = z.infer<typeof BlogPostFrontmatterSchema>

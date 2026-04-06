import { bundleMDX } from 'mdx-bundler'
import readingTime from 'reading-time'
import remarkGfm from 'remark-gfm'
import { getPostContent, getPostSlugs } from './github.server.ts'
import {
	BlogPostFrontmatterSchema,
	type BlogPostFrontmatter,
} from './blog.schema.ts'

export type BlogPostListing = {
	slug: string
	title: string
	description: string
	date: string
}

export async function getPostListings(): Promise<BlogPostListing[]> {
	const slugs = await getPostSlugs()

	const posts = await Promise.all(
		slugs.map(async (slug) => {
			try {
				const source = await getPostContent(slug)
				const { frontmatter: rawFrontmatter } = await bundleMDX({
					source,
					mdxOptions(options) {
						options.remarkPlugins = [
							...(options.remarkPlugins ?? []),
							remarkGfm,
						]
						return options
					},
				})

				const result = BlogPostFrontmatterSchema.safeParse(rawFrontmatter)
				if (!result.success) return null
				if (!result.data.published) return null

				return {
					slug,
					title: result.data.title,
					description: result.data.description,
					date: result.data.date.toISOString(),
				}
			} catch {
				return null
			}
		}),
	)

	return posts
		.filter((post): post is BlogPostListing => post !== null)
		.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export type CompiledBlogPost = {
	code: string
	frontmatter: BlogPostFrontmatter
	readingTime: string
}

export async function compileMdxPost(
	slug: string,
	source: string,
): Promise<CompiledBlogPost> {
	const { code, frontmatter: rawFrontmatter } = await bundleMDX({
		source,
		mdxOptions(options) {
			options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm]
			return options
		},
	})

	const result = BlogPostFrontmatterSchema.safeParse(rawFrontmatter)
	if (!result.success) {
		throw new Error(
			`Invalid frontmatter in blog post "${slug}": ${result.error.message}`,
		)
	}

	const stats = readingTime(source)

	return {
		code,
		frontmatter: result.data,
		readingTime: stats.text,
	}
}

import { bundleMDX } from 'mdx-bundler'
import readingTime from 'reading-time'
import remarkGfm from 'remark-gfm'
import {
	BlogPostFrontmatterSchema,
	type BlogPostFrontmatter,
} from './blog.schema.ts'
import {
	getPostContent,
	getPostSlugs,
	REPO_NAME,
	REPO_OWNER,
} from './github.server.ts'

export function getBlogImageSrc(slug: string, imagePath: string): string {
	const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/master/content/blog/${slug}/${imagePath}`
	return `/resources/images?src=${encodeURIComponent(rawUrl)}`
}

export type BlogPostListing = {
	slug: string
	title: string
	description: string
	date: string
	readingTime: string
	bannerImage: string | null
	bannerAlt: string | null
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

				const stats = readingTime(source)

				return {
					slug,
					title: result.data.title,
					description: result.data.description,
					date: result.data.date.toISOString(),
					readingTime: stats.text,
					bannerImage: result.data.bannerImage
						? getBlogImageSrc(slug, result.data.bannerImage)
						: null,
					bannerAlt: result.data.bannerAlt ?? null,
				}
			} catch (error) {
				console.error(
					`Failed to process blog post listing for slug "${slug}"`,
					error,
				)
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

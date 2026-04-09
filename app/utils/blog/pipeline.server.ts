import rehypeShiki from '@shikijs/rehype'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeSlug from 'rehype-slug'
import {
	cachified,
	type CacheEntry,
	totalTtl,
	type Cache,
} from '@epic-web/cachified'
import { remember } from '@epic-web/remember'
import { bundleMDX } from 'mdx-bundler'
import { LRUCache } from 'lru-cache'
import readingTime from 'reading-time'
import remarkGfm from 'remark-gfm'
import { BlogPostFrontmatterSchema } from './blog.schema.ts'
import { type BlogContentSource } from './content-source.ts'
import { createGitHubContentSource } from './github-content-source.ts'

export type BlogPost = {
	code: string
	frontmatter: {
		title: string
		description: string
		date: string
		published: boolean
	}
	readingTime: string
	bannerImage: string | null
	bannerAlt: string | null
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

const POST_TTL = 1000 * 60 * 60 // 1 hour
const POST_SWR = 1000 * 60 * 60 * 24 // 1 day
const LISTING_TTL = 1000 * 60 * 5 // 5 minutes
const LISTING_SWR = 1000 * 60 * 60 // 1 hour

function createLruCache(): Cache {
	const lru = new LRUCache<string, CacheEntry<unknown>>({ max: 500 })
	return {
		name: 'blog-pipeline-cache',
		set(key, value) {
			const ttl = totalTtl(value?.metadata)
			lru.set(key, value, {
				ttl: ttl === Infinity ? undefined : ttl,
				start: value?.metadata?.createdTime,
			})
			return value
		},
		get: (key) => lru.get(key),
		delete: (key) => lru.delete(key),
	}
}

function createCompilationQueue(concurrency: number) {
	let running = 0
	const queue: Array<() => void> = []

	return async function run<T>(fn: () => Promise<T>): Promise<T> {
		if (running >= concurrency) {
			await new Promise<void>((resolve) => queue.push(resolve))
		}
		running++
		try {
			return await fn()
		} finally {
			running--
			queue.shift()?.()
		}
	}
}

async function compilePost(
	slug: string,
	source: BlogContentSource,
): Promise<BlogPost> {
	const content = await source.getContent(slug)

	const { code, frontmatter: rawFrontmatter } = await bundleMDX({
		source: content,
		mdxOptions(options) {
			options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm]
			options.rehypePlugins = [
				...(options.rehypePlugins ?? []),
				[rehypeShiki, { theme: 'github-dark' }],
				rehypeSlug,
				[rehypeAutolinkHeadings, { behavior: 'wrap' }],
			]
			return options
		},
	})

	const result = BlogPostFrontmatterSchema.safeParse(rawFrontmatter)
	if (!result.success) {
		throw new Error(
			`Invalid frontmatter in blog post "${slug}": ${result.error.message}`,
		)
	}

	const stats = readingTime(content)

	return {
		code,
		frontmatter: {
			title: result.data.title,
			description: result.data.description,
			date: result.data.date.toISOString(),
			published: result.data.published,
		},
		readingTime: stats.text,
		bannerImage: result.data.bannerImage
			? source.getImageUrl(slug, result.data.bannerImage)
			: null,
		bannerAlt: result.data.bannerAlt ?? null,
	}
}

async function compileListing(
	slug: string,
	source: BlogContentSource,
): Promise<BlogPostListing | null> {
	try {
		const content = await source.getContent(slug)

		const { frontmatter: rawFrontmatter } = await bundleMDX({
			source: content,
			mdxOptions(options) {
				options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm]
				return options
			},
		})

		const result = BlogPostFrontmatterSchema.safeParse(rawFrontmatter)
		if (!result.success) return null
		if (!result.data.published) return null

		const stats = readingTime(content)

		return {
			slug,
			title: result.data.title,
			description: result.data.description,
			date: result.data.date.toISOString(),
			readingTime: stats.text,
			bannerImage: result.data.bannerImage
				? source.getImageUrl(slug, result.data.bannerImage)
				: null,
			bannerAlt: result.data.bannerAlt ?? null,
		}
	} catch (error) {
		console.error(`Failed to process blog listing for "${slug}"`, error)
		return null
	}
}

export function createBlogPipeline(source: BlogContentSource) {
	const cache = createLruCache()
	const queue = createCompilationQueue(2)

	return {
		async getPost(slug: string): Promise<BlogPost> {
			return cachified({
				key: `blog:post:${slug}`,
				cache,
				ttl: POST_TTL,
				swr: POST_SWR,
				getFreshValue() {
					return queue(() => compilePost(slug, source))
				},
			})
		},

		async getListings(): Promise<BlogPostListing[]> {
			return cachified({
				key: 'blog:listings',
				cache,
				ttl: LISTING_TTL,
				swr: LISTING_SWR,
				async getFreshValue() {
					const slugs = await source.getSlugs()
					const results = await Promise.all(
						slugs.map((slug) => compileListing(slug, source)),
					)
					return results
						.filter((post): post is BlogPostListing => post !== null)
						.sort(
							(a, b) =>
								new Date(b.date).getTime() - new Date(a.date).getTime(),
						)
				},
			})
		},

		invalidate(slug?: string): void {
			if (slug !== undefined) {
				cache.delete(`blog:post:${slug}`)
			} else {
				cache.delete('blog:listings')
			}
		},
	}
}

export function getBlog() {
	return remember('blog-pipeline', () =>
		createBlogPipeline(createGitHubContentSource()),
	)
}

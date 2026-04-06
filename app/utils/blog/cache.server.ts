import {
	cachified,
	type CacheEntry,
	totalTtl,
	type Cache,
} from '@epic-web/cachified'
import { remember } from '@epic-web/remember'
import { LRUCache } from 'lru-cache'
import { getPostContent } from './github.server.ts'
import {
	compileMdxPost,
	getPostListings,
	type BlogPostListing,
	type CompiledBlogPost,
} from './mdx.server.ts'

const blogCache = remember(
	'blog-lru-cache',
	() => new LRUCache<string, CacheEntry<unknown>>({ max: 500 }),
)

export const blogLruCache = {
	name: 'blog-memory-cache',
	set: (key, value) => {
		const ttl = totalTtl(value?.metadata)
		blogCache.set(key, value, {
			ttl: ttl === Infinity ? undefined : ttl,
			start: value?.metadata?.createdTime,
		})
		return value
	},
	get: (key) => blogCache.get(key),
	delete: (key) => blogCache.delete(key),
} satisfies Cache

// Compilation queue — limits concurrent MDX compilations to prevent memory spikes
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
			const nextInQueue = queue.shift()
			nextInQueue?.()
		}
	}
}

export const compilationQueue = remember('blog-compilation-queue', () =>
	createCompilationQueue(2),
)

const POST_TTL = 1000 * 60 * 60 // 1 hour
const POST_SWR = 1000 * 60 * 60 * 24 // 1 day stale-while-revalidate
const LISTING_TTL = 1000 * 60 * 5 // 5 minutes
const LISTING_SWR = 1000 * 60 * 60 // 1 hour stale-while-revalidate

export async function getCachedCompiledPost(
	slug: string,
): Promise<CompiledBlogPost> {
	return cachified({
		key: `blog:post:${slug}`,
		cache: blogLruCache,
		ttl: POST_TTL,
		swr: POST_SWR,
		async getFreshValue() {
			const source = await getPostContent(slug)
			return compilationQueue(() => compileMdxPost(slug, source))
		},
	})
}

export async function getCachedPostListings(): Promise<BlogPostListing[]> {
	return cachified({
		key: 'blog:listings',
		cache: blogLruCache,
		ttl: LISTING_TTL,
		swr: LISTING_SWR,
		async getFreshValue() {
			return getPostListings()
		},
	})
}

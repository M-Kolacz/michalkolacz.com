import { format } from 'date-fns'
import { cache, cachified } from '#app/utils/cache.server.ts'
import { type Timings } from '#app/utils/timing.server.ts'
import { compileMdx } from './compile-mdx.server.ts'
import { downloadDirList, downloadMdxFileOrDirectory } from './github.server.ts'
import { type GitHubFile, type MdxPage, type MdxListItem } from './types.ts'

type CachifiedOptions = {
	forceFresh?: boolean
	request?: Request
	ttl?: number
	timings?: Timings
}

const defaultTTL = 1000 * 60 * 60 * 24 * 14
const defaultStaleWhileRevalidate = 1000 * 60 * 60 * 24 * 365 * 100

const checkCompiledValue = (value: unknown) =>
	typeof value === 'object' &&
	(value === null || ('code' in value && 'frontmatter' in value))

export async function getMdxPage(
	{ slug }: { slug: string },
	options: CachifiedOptions,
): Promise<MdxPage | null> {
	const { forceFresh, ttl = defaultTTL, timings } = options
	const key = `mdx-page:blog:${slug}:compiled`
	const page = await cachified({
		key,
		cache,
		timings,
		ttl,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		forceFresh,
		checkValue: checkCompiledValue,
		getFreshValue: async () => {
			const pageFiles = await downloadMdxFilesCached(slug, options)
			const compiledPage = await compileMdxCached({
				slug,
				...pageFiles,
				options,
			}).catch((err) => {
				console.error(`Failed to get a fresh value for mdx:`, { slug })
				return Promise.reject(err)
			})
			return compiledPage
		},
	})
	if (!page) {
		void cache.delete(key)
	}
	return page
}

export async function getMdxPagesInDirectory(options: CachifiedOptions) {
	const dirList = await getMdxDirList(options)

	const pageDatas = await Promise.all(
		dirList.map(async ({ slug }) => ({
			...(await downloadMdxFilesCached(slug, options)),
			slug,
		})),
	)

	const pages = await Promise.all(
		pageDatas.map((pageData) => compileMdxCached({ ...pageData, options })),
	)
	return pages.filter(Boolean) as Array<MdxPage>
}

export async function getMdxDirList(options?: CachifiedOptions) {
	const { forceFresh, ttl = defaultTTL, timings } = options ?? {}
	const key = 'blog:dir-list'
	return cachified({
		cache,
		timings,
		ttl,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		forceFresh,
		key,
		checkValue: (value: unknown) => Array.isArray(value),
		getFreshValue: async () => {
			const fullContentDirPath = 'content/blog'
			const dirList = (await downloadDirList(fullContentDirPath))
				.map(({ name, path }) => ({
					name,
					slug: path
						.replace(/\\/g, '/')
						.replace(`${fullContentDirPath}/`, '')
						.replace(/\.mdx$/, ''),
				}))
				.filter(({ name }) => name !== 'README.md')
			return dirList
		},
	})
}

export async function getBlogMdxListItems(
	options: CachifiedOptions & { showDrafts?: boolean },
): Promise<Array<MdxListItem>> {
	const { forceFresh, ttl = defaultTTL, timings, showDrafts = false } = options
	const key = showDrafts ? 'blog:mdx-list-items:drafts' : 'blog:mdx-list-items'
	return cachified({
		cache,
		timings,
		ttl,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		forceFresh,
		key,
		getFreshValue: async () => {
			let pages = await getMdxPagesInDirectory(options).then((allPosts) =>
				allPosts.filter(
					(p) =>
						!p.frontmatter.unlisted &&
						(showDrafts || !p.frontmatter.draft),
				),
			)

			pages = pages.sort((a, z) => {
				const aTime = new Date(a.frontmatter.date ?? '').getTime()
				const zTime = new Date(z.frontmatter.date ?? '').getTime()
				return aTime > zTime ? -1 : aTime === zTime ? 0 : 1
			})

			return pages.map(({ code, ...rest }) => rest)
		},
	})
}

export async function downloadMdxFilesCached(
	slug: string,
	options: CachifiedOptions,
) {
	const { forceFresh, ttl = defaultTTL, timings } = options
	const key = `blog:${slug}:downloaded`
	const downloaded = await cachified({
		cache,
		timings,
		ttl,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		forceFresh,
		key,
		checkValue: (value: unknown) => {
			if (typeof value !== 'object') return 'value is not an object'
			if (value === null) return 'value is null'

			const download = value as Record<string, unknown>
			if (!Array.isArray(download.files)) return 'value.files is not an array'
			if (typeof download.entry !== 'string')
				return 'value.entry is not a string'

			return true
		},
		getFreshValue: async () => downloadMdxFileOrDirectory(slug),
	})
	if (!downloaded.files.length) {
		void cache.delete(key)
	}
	return downloaded
}

async function compileMdxCached({
	slug,
	entry,
	files,
	options,
}: {
	slug: string
	entry: string
	files: Array<GitHubFile>
	options: CachifiedOptions
}) {
	const key = `mdx-page:blog:${slug}:compiled`
	const page = await cachified({
		cache,
		ttl: defaultTTL,
		staleWhileRevalidate: defaultStaleWhileRevalidate,
		...options,
		key,
		checkValue: checkCompiledValue,
		getFreshValue: async () => {
			const compiledPage = await compileMdx(slug, files)
			if (compiledPage) {
				return {
					dateDisplay: compiledPage.frontmatter.date
						? format(new Date(compiledPage.frontmatter.date), 'PPP')
						: undefined,
					...compiledPage,
					slug,
					editLink: `https://github.com/M-Kolacz/michalkolacz.com/edit/master/${entry}`,
				}
			} else {
				return null
			}
		},
	})
	if (!page) {
		void cache.delete(key)
	}
	return page
}

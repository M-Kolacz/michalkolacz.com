import { describe, expect, test, vi } from 'vitest'
import { consoleError } from '#tests/setup/setup-test-env.ts'
import { type BlogContentSource } from './content-source.ts'
import { createBlogPipeline } from './pipeline.server.ts'

function createFakeSource(
	posts: Record<string, string>,
): BlogContentSource {
	return {
		async getSlugs() {
			return Object.keys(posts)
		},
		async getContent(slug) {
			const content = posts[slug]
			if (content === undefined) {
				throw new Error(`Not found: ${slug}`)
			}
			return content
		},
		getImageUrl(slug, imagePath) {
			return `/fake/${slug}/${imagePath}`
		},
	}
}

const validMdx = `---
title: "Test Post"
description: "A test description"
date: "2026-04-05"
published: true
---

Hello world content.
`

const withBannerMdx = `---
title: "Banner Post"
description: "Has a banner"
date: "2026-04-05"
published: true
bannerImage: "hero.png"
bannerAlt: "Hero image"
---

Content here.
`

const unpublishedMdx = `---
title: "Draft Post"
description: "Not ready"
date: "2026-04-05"
published: false
---

Draft content.
`

const olderMdx = `---
title: "Older Post"
description: "An older post"
date: "2026-01-01"
published: true
---

Older content.
`

const invalidFrontmatterMdx = `---
title: "Missing required fields"
---

Content here.
`

describe('createBlogPipeline', () => {
	describe('getPost', () => {
		test(
			'returns compiled MDX with correct frontmatter and reading time',
			{ timeout: 15_000 },
			async () => {
				// arrange
				const pipeline = createBlogPipeline(
					createFakeSource({ 'test-post': validMdx }),
				)

				// act
				const post = await pipeline.getPost('test-post')

				// assert
				expect(post.code).toBeDefined()
				expect(post.code.length).toBeGreaterThan(0)
				expect(post.frontmatter.title).toBe('Test Post')
				expect(post.frontmatter.description).toBe('A test description')
				expect(post.frontmatter.published).toBe(true)
				expect(post.readingTime).toContain('min read')
			},
		)

		test('serializes date as ISO string — no Date objects cross the boundary', async () => {
			// arrange
			const pipeline = createBlogPipeline(
				createFakeSource({ 'test-post': validMdx }),
			)

			// act
			const post = await pipeline.getPost('test-post')

			// assert
			expect(typeof post.frontmatter.date).toBe('string')
			expect(post.frontmatter.date).toBe('2026-04-05T00:00:00.000Z')
		})

		test(
			'resolves banner image URL through the content source',
			{ timeout: 15_000 },
			async () => {
				// arrange
				const pipeline = createBlogPipeline(
					createFakeSource({ 'banner-post': withBannerMdx }),
				)

				// act
				const post = await pipeline.getPost('banner-post')

				// assert
				expect(post.bannerImage).toBe('/fake/banner-post/hero.png')
				expect(post.bannerAlt).toBe('Hero image')
			},
		)

		test('sets bannerImage and bannerAlt to null when not in frontmatter', async () => {
			// arrange
			const pipeline = createBlogPipeline(
				createFakeSource({ 'test-post': validMdx }),
			)

			// act
			const post = await pipeline.getPost('test-post')

			// assert
			expect(post.bannerImage).toBeNull()
			expect(post.bannerAlt).toBeNull()
		})

		test(
			'throws on invalid frontmatter',
			{ timeout: 15_000 },
			async () => {
				// arrange
				const pipeline = createBlogPipeline(
					createFakeSource({ 'bad-post': invalidFrontmatterMdx }),
				)

				// act & assert
				await expect(pipeline.getPost('bad-post')).rejects.toThrow(
					'Invalid frontmatter',
				)
			},
		)

		test('throws when slug does not exist', async () => {
			// arrange
			const pipeline = createBlogPipeline(createFakeSource({}))

			// act & assert
			await expect(pipeline.getPost('non-existent')).rejects.toThrow(
				'Not found: non-existent',
			)
		})
	})

	describe(
		'getListings',
		{ timeout: 15_000 },
		() => {
			test('returns published posts sorted by date descending', async () => {
				// arrange
				const pipeline = createBlogPipeline(
					createFakeSource({
						'newer-post': validMdx, // date: 2026-04-05
						'older-post': olderMdx, // date: 2026-01-01
					}),
				)

				// act
				const listings = await pipeline.getListings()

				// assert
				expect(listings).toHaveLength(2)
				expect(listings[0]?.slug).toBe('newer-post')
				expect(listings[1]?.slug).toBe('older-post')
			})

			test('silently filters posts with invalid frontmatter', async () => {
				// arrange
				consoleError.mockImplementation(() => {})
				const pipeline = createBlogPipeline(
					createFakeSource({
						'good-post': validMdx,
						'bad-post': invalidFrontmatterMdx,
					}),
				)

				// act
				const listings = await pipeline.getListings()

				// assert
				expect(listings).toHaveLength(1)
				expect(listings[0]?.slug).toBe('good-post')
			})

			test('silently filters unpublished posts', async () => {
				// arrange
				const pipeline = createBlogPipeline(
					createFakeSource({
						'published-post': validMdx,
						'draft-post': unpublishedMdx,
					}),
				)

				// act
				const listings = await pipeline.getListings()

				// assert
				expect(listings).toHaveLength(1)
				expect(listings[0]?.slug).toBe('published-post')
			})

			test('resolves banner image URLs through the content source', async () => {
				// arrange
				const pipeline = createBlogPipeline(
					createFakeSource({ 'banner-post': withBannerMdx }),
				)

				// act
				const listings = await pipeline.getListings()

				// assert
				expect(listings[0]?.bannerImage).toBe('/fake/banner-post/hero.png')
				expect(listings[0]?.bannerAlt).toBe('Hero image')
			})

			test('returns ISO date strings', async () => {
				// arrange
				const pipeline = createBlogPipeline(
					createFakeSource({ 'test-post': validMdx }),
				)

				// act
				const listings = await pipeline.getListings()

				// assert
				expect(typeof listings[0]?.date).toBe('string')
				expect(listings[0]?.date).toBe('2026-04-05T00:00:00.000Z')
			})
		},
	)
})

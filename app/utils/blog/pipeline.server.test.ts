import { describe, expect, test } from 'vitest'
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
})

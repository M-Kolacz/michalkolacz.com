import { describe, expect, test } from 'vitest'
import { BlogPostFrontmatterSchema } from './blog.schema.ts'

const validFrontmatter = {
	title: 'Test Post',
	description: 'A test blog post',
	date: '2026-04-05',
	published: true,
}

describe('BlogPostFrontmatterSchema', () => {
	test('accepts valid frontmatter with required fields', () => {
		const result = BlogPostFrontmatterSchema.safeParse(validFrontmatter)
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.title).toBe('Test Post')
			expect(result.data.description).toBe('A test blog post')
			expect(result.data.date).toBeInstanceOf(Date)
			expect(result.data.published).toBe(true)
		}
	})

	test('accepts valid frontmatter with optional fields', () => {
		const result = BlogPostFrontmatterSchema.safeParse({
			...validFrontmatter,
			bannerImage: './banner.jpg',
			bannerAlt: 'A banner image',
		})
		expect(result.success).toBe(true)
		if (result.success) {
			expect(result.data.bannerImage).toBe('./banner.jpg')
			expect(result.data.bannerAlt).toBe('A banner image')
		}
	})

	test('rejects missing title', () => {
		const { title: _, ...withoutTitle } = validFrontmatter
		const result = BlogPostFrontmatterSchema.safeParse(withoutTitle)
		expect(result.success).toBe(false)
	})

	test('rejects missing description', () => {
		const { description: _, ...withoutDescription } = validFrontmatter
		const result = BlogPostFrontmatterSchema.safeParse(withoutDescription)
		expect(result.success).toBe(false)
	})

	test('rejects missing date', () => {
		const { date: _, ...withoutDate } = validFrontmatter
		const result = BlogPostFrontmatterSchema.safeParse(withoutDate)
		expect(result.success).toBe(false)
	})

	test('rejects invalid date format', () => {
		const result = BlogPostFrontmatterSchema.safeParse({
			...validFrontmatter,
			date: 'not-a-date',
		})
		expect(result.success).toBe(false)
	})

	test('rejects missing published field', () => {
		const { published: _, ...withoutPublished } = validFrontmatter
		const result = BlogPostFrontmatterSchema.safeParse(withoutPublished)
		expect(result.success).toBe(false)
	})

	test('rejects non-boolean published field', () => {
		const result = BlogPostFrontmatterSchema.safeParse({
			...validFrontmatter,
			published: 'yes',
		})
		expect(result.success).toBe(false)
	})
})

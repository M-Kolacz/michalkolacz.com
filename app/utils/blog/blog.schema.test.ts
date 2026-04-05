import { invariant } from '@epic-web/invariant'
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
		// arrange
		const input = validFrontmatter

		// act
		const result = BlogPostFrontmatterSchema.safeParse(input)

		// assert
		invariant(result.success, 'Expected parsing to succeed')
		expect(result.data.title).toBe('Test Post')
		expect(result.data.description).toBe('A test blog post')
		expect(result.data.date).toBeInstanceOf(Date)
		expect(result.data.published).toBe(true)
	})

	test('accepts valid frontmatter with optional fields', () => {
		// arrange
		const input = {
			...validFrontmatter,
			bannerImage: './banner.jpg',
			bannerAlt: 'A banner image',
		}

		// act
		const result = BlogPostFrontmatterSchema.safeParse(input)

		// assert
		invariant(result.success, 'Expected parsing to succeed')
		expect(result.data.bannerImage).toBe('./banner.jpg')
		expect(result.data.bannerAlt).toBe('A banner image')
	})

	test('rejects missing date', () => {
		// arrange
		const { date: _, ...input } = validFrontmatter

		// act
		const result = BlogPostFrontmatterSchema.safeParse(input)

		// assert
		expect(result.success).toBe(false)
	})

	test('rejects invalid date format', () => {
		// arrange
		const input = { ...validFrontmatter, date: 'not-a-date' }

		// act
		const result = BlogPostFrontmatterSchema.safeParse(input)

		// assert
		expect(result.success).toBe(false)
	})

	test('rejects bannerImage without bannerAlt', () => {
		// arrange
		const input = { ...validFrontmatter, bannerImage: './banner.jpg' }

		// act
		const result = BlogPostFrontmatterSchema.safeParse(input)

		// assert
		invariant(!result.success, 'Expected parsing to fail')
		expect(result.error.issues[0]?.path).toEqual(['bannerAlt'])
	})

	test('rejects bannerAlt without bannerImage', () => {
		// arrange
		const input = { ...validFrontmatter, bannerAlt: 'A banner image' }

		// act
		const result = BlogPostFrontmatterSchema.safeParse(input)

		// assert
		invariant(!result.success, 'Expected parsing to fail')
		expect(result.error.issues[0]?.path).toEqual(['bannerImage'])
	})
})

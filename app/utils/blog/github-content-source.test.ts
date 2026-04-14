import { describe, expect, test } from 'vitest'
import { createGitHubContentSource } from './github-content-source.ts'

// MSW intercepts Octokit calls in test mode and serves from the local filesystem.
// See tests/mocks/github.ts for the handler that maps GitHub API calls to CWD paths.

describe('createGitHubContentSource', () => {
	describe('getSlugs', () => {
		test('returns directory names from the blog content path', async () => {
			// arrange
			const source = createGitHubContentSource()

			// act
			const slugs = await source.getSlugs()

			// assert
			expect(Array.isArray(slugs)).toBe(true)
			expect(slugs).toContain('visual-regression-testing')
			expect(slugs.every((s) => typeof s === 'string')).toBe(true)
		})

		test('omits files — returns only directories', async () => {
			// arrange
			const source = createGitHubContentSource()

			// act
			const slugs = await source.getSlugs()

			// assert — local fixture has no non-dir entries, but each slug must be a valid name
			expect(slugs).not.toContain('index.mdx')
		})
	})

	describe('getContent', () => {
		test('returns decoded MDX string for a known slug', async () => {
			// arrange
			const source = createGitHubContentSource()

			// act
			const content = await source.getContent('visual-regression-testing')

			// assert
			expect(typeof content).toBe('string')
			expect(content.length).toBeGreaterThan(0)
			expect(content).toContain('Visual Regression Testing')
		})

		test('returned content is valid UTF-8 text, not raw base64', async () => {
			// arrange
			const source = createGitHubContentSource()

			// act
			const content = await source.getContent('visual-regression-testing')

			// assert — base64 strings don't contain MDX front-matter dashes
			expect(content).toMatch(/^---/)
		})

		test('throws when slug does not exist', async () => {
			// arrange
			const source = createGitHubContentSource()

			// act & assert
			await expect(source.getContent('non-existent-slug')).rejects.toThrow()
		})
	})

	describe('getImageUrl', () => {
		test('returns an image proxy URL for the given slug and path', () => {
			// arrange
			const source = createGitHubContentSource()

			// act
			const url = source.getImageUrl('visual-regression-testing', 'img.png')

			// assert
			expect(url).toMatch(/^\/resources\/images\?src=/)
		})

		test('encodes the raw GitHub URL as the src query param', () => {
			// arrange
			const source = createGitHubContentSource()

			// act
			const url = source.getImageUrl('visual-regression-testing', 'img.png')
			const src = new URLSearchParams(
				url.replace('/resources/images?', ''),
			).get('src')

			// assert
			expect(src).toBe(
				'https://raw.githubusercontent.com/M-Kolacz/michalkolacz.com/master/content/blog/visual-regression-testing/img.png',
			)
		})

		test('handles nested image paths', () => {
			// arrange
			const source = createGitHubContentSource()

			// act
			const url = source.getImageUrl(
				'visual-regression-testing',
				'images/hero.jpg',
			)
			const src = new URLSearchParams(
				url.replace('/resources/images?', ''),
			).get('src')

			// assert
			expect(src).toContain('images/hero.jpg')
		})
	})
})

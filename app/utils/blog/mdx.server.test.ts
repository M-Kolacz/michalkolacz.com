import { describe, expect, test } from 'vitest'
import { compileMdxPost } from './mdx.server.ts'

const validMdxSource = `---
title: "Test Post"
description: "A test description"
date: "2026-04-05"
published: true
---

## Hello World

This is a test blog post with some content to verify reading time calculation.
`

describe('compileMdxPost', () => {
	test('compiles valid MDX and returns correct metadata', async () => {
		const result = await compileMdxPost('test-post', validMdxSource)

		expect(result.code).toBeDefined()
		expect(result.code.length).toBeGreaterThan(0)
		expect(result.frontmatter.title).toBe('Test Post')
		expect(result.frontmatter.description).toBe('A test description')
		expect(result.frontmatter.date).toBeInstanceOf(Date)
		expect(result.frontmatter.published).toBe(true)
		expect(result.readingTime).toBeDefined()
		expect(result.readingTime).toContain('min read')
	})

	test('throws on invalid frontmatter', async () => {
		const invalidSource = `---
title: "Missing required fields"
---

Content here.
`
		await expect(compileMdxPost('bad-post', invalidSource)).rejects.toThrow(
			'Invalid frontmatter',
		)
	})

	test('compiles MDX with GFM features', async () => {
		const gfmSource = `---
title: "GFM Test"
description: "Testing GFM"
date: "2026-04-05"
published: true
---

| Column 1 | Column 2 |
| -------- | -------- |
| Cell 1   | Cell 2   |

~~strikethrough~~
`
		const result = await compileMdxPost('gfm-test', gfmSource)
		expect(result.code).toBeDefined()
		expect(result.frontmatter.title).toBe('GFM Test')
	})
})

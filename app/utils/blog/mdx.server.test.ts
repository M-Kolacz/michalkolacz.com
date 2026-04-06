import { describe, expect, test } from 'vitest'
import { compileMdxPost } from './mdx.server.ts'

describe('compileMdxPost', () => {
	test('compiles valid MDX and returns correct metadata', async () => {
		// arrange
		const input = `---
title: "Test Post"
description: "A test description"
date: "2026-04-05"
published: true
---

## Hello World

This is a test blog post with some content to verify reading time calculation.
`

		// act
		const result = await compileMdxPost('test-post', input)

		// assert
		expect(result.code).toBeDefined()
		expect(result.code.length).toBeGreaterThan(0)
		expect(result.frontmatter.title).toBe('Test Post')
		expect(result.frontmatter.description).toBe('A test description')
		expect(result.frontmatter.date).toEqual(new Date('2026-04-05'))
		expect(result.frontmatter.published).toBe(true)
		expect(result.readingTime).toBeDefined()
		expect(result.readingTime).toContain('min read')
	})

	test('throws on invalid frontmatter', async () => {
		// arrange
		const input = `---
title: "Missing required fields"
---

Content here.
`

		// act & assert
		await expect(compileMdxPost('bad-post', input)).rejects.toThrow(
			'Invalid frontmatter',
		)
	})

	test('short post returns 1 min read', async () => {
		// arrange
		const input = `---
title: "Short"
description: "Short post"
date: "2026-04-05"
published: true
---

A few words.
`

		// act
		const result = await compileMdxPost('short', input)

		// assert
		expect(result.readingTime).toBe('1 min read')
	})

	test('longer post returns appropriate reading time', async () => {
		// arrange — ~500 words at 200 wpm default = ~3 min read
		const words = Array(500).fill('word').join(' ')
		const input = `---
title: "Long"
description: "Long post"
date: "2026-04-05"
published: true
---

${words}
`

		// act
		const result = await compileMdxPost('long', input)

		// assert
		expect(result.readingTime).toMatch(/\d+ min read/)
		expect(result.readingTime).not.toBe('1 min read')
	})

	test('compiles MDX with code blocks producing syntax-highlighted output', async () => {
		// arrange
		const input = `---
title: "Code Test"
description: "Testing code"
date: "2026-04-05"
published: true
---

\`\`\`typescript
const x: number = 42
\`\`\`
`

		// act
		const result = await compileMdxPost('code-test', input)

		// assert
		expect(result.code).toContain('shiki')
	})

	test('compiles MDX with heading anchor IDs', async () => {
		// arrange
		const input = `---
title: "Heading Test"
description: "Testing headings"
date: "2026-04-05"
published: true
---

## My Section

Content here.
`

		// act
		const result = await compileMdxPost('heading-test', input)

		// assert
		expect(result.code).toContain('my-section')
	})

	test('compiles MDX with GFM features', async () => {
		// arrange
		const input = `---
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

		// act
		const result = await compileMdxPost('gfm-test', input)

		// assert
		expect(result.code).toBeDefined()
		expect(result.frontmatter.title).toBe('GFM Test')
	})
})

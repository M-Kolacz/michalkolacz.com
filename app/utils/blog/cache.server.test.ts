import { beforeEach, describe, expect, test, vi } from 'vitest'
import {
	blogLruCache,
	compilationQueue,
	getCachedCompiledPost,
} from './cache.server.ts'
import { getPostContent } from './github.server.ts'

vi.mock('./github.server.ts', () => ({
	getPostContent: vi.fn(),
	getPostSlugs: vi.fn(),
	REPO_OWNER: 'M-Kolacz',
	REPO_NAME: 'michalkolacz.com',
}))

const mockedGetPostContent = vi.mocked(getPostContent)

const validSource = `---
title: "Cached Post"
description: "A cached test post"
date: "2026-04-05"
published: true
---

Hello cached world.
`

describe('getCachedCompiledPost', { timeout: 15_000 }, () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	test('returns cached result on second call', async () => {
		blogLruCache.delete('blog:post:cached-test')
		mockedGetPostContent.mockResolvedValue(validSource)

		const first = await getCachedCompiledPost('cached-test')
		const second = await getCachedCompiledPost('cached-test')

		expect(first.frontmatter.title).toBe('Cached Post')
		expect(second).toBe(first) // same reference = served from cache
		expect(mockedGetPostContent).toHaveBeenCalledTimes(1)
	})

	test('recompiles after cache entry is deleted', async () => {
		blogLruCache.delete('blog:post:recompile-test')
		mockedGetPostContent.mockResolvedValue(validSource)

		const first = await getCachedCompiledPost('recompile-test')
		blogLruCache.delete('blog:post:recompile-test')
		const second = await getCachedCompiledPost('recompile-test')

		expect(first.frontmatter.title).toBe('Cached Post')
		expect(second.frontmatter.title).toBe('Cached Post')
		expect(second).not.toBe(first) // different reference = recompiled
		expect(mockedGetPostContent).toHaveBeenCalledTimes(2)
	})
})

describe('compilationQueue', () => {
	test('limits concurrent executions to 2', async () => {
		let running = 0
		let maxRunning = 0

		const task = () =>
			compilationQueue.run(async () => {
				running++
				maxRunning = Math.max(maxRunning, running)
				await new Promise((r) => setTimeout(r, 50))
				running--
				return maxRunning
			})

		await Promise.all([task(), task(), task(), task()])

		expect(maxRunning).toBeLessThanOrEqual(2)
	})

	test('all queued tasks complete', async () => {
		const results: number[] = []

		const tasks = Array.from({ length: 5 }, (_, i) =>
			compilationQueue.run(async () => {
				await new Promise((r) => setTimeout(r, 10))
				results.push(i)
				return i
			}),
		)

		const returned = await Promise.all(tasks)

		expect(returned).toEqual([0, 1, 2, 3, 4])
		expect(results).toHaveLength(5)
	})
})

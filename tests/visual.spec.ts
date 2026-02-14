import { expect, test } from '@playwright/test'

import { VIEWPORTS_DIMENSIONS } from '../.storybook/modes'
import storybook from '../storybook-static/index.json' with { type: 'json' }

const stories = Object.values(storybook.entries).filter(
	(entry) => entry.type === 'story',
)

export const Tags = {
	NETWORK_LOADING: 'network-loading',
	SKIP_VISUAL_TESTS: 'skip-visual-tests',
} as const

function getViewportFromStoryName(name: string) {
	const nameLower = name.toLowerCase()
	if (nameLower.includes('mobile')) return VIEWPORTS_DIMENSIONS.Mobile
	if (nameLower.includes('tablet')) return VIEWPORTS_DIMENSIONS.Tablet
	return VIEWPORTS_DIMENSIONS.Desktop
}

for (const story of stories) {
	test(`${story.title} ${story.name} should not have visual regressions`, async ({
		page,
	}) => {
		const viewport = getViewportFromStoryName(story.name)
		await page.setViewportSize(viewport)

		const params = new URLSearchParams({
			id: story.id,
			viewMode: 'story',
		})

		await page.goto(`/iframe.html?${params.toString()}`)
		await page.waitForSelector('#storybook-root')

		const tags = story.tags

		if (tags.includes(Tags.NETWORK_LOADING)) {
			await page.waitForLoadState('domcontentloaded').catch(console.error)
			await page.waitForTimeout(500).catch(console.error)
		} else {
			await page
				.waitForLoadState('networkidle', { timeout: 10000 })
				.catch(console.error)
		}

		const iframes = page.locator('iframe')

		await expect(page).toHaveScreenshot(
			[
				...story.title.toLowerCase().split('/'),
				`${story.name.toLowerCase().replace(' ', '-')}.png`,
			],
			{
				fullPage: true,
				animations: 'disabled',
				maxDiffPixelRatio: 0.005,
				timeout: 15000,
				mask: [iframes],
			},
		)
	})
}

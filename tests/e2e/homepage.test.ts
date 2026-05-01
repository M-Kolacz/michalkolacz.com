import { expect, getMetaTag, test } from '#tests/playwright-utils.ts'
import { t } from '#tests/utils.ts'

test('Homepage displays correctly', async ({ page, navigate }) => {
	await navigate('/')

	await expect(page.getByText(t('homepage.hero.heading'))).toBeVisible()
})

test('Homepage has correct meta tags', async ({ page, navigate }) => {
	await navigate('/')

	await expect(page).toHaveTitle('Michal Kolacz')

	// eslint-disable-next-line playwright/no-raw-locators
	const description = page.locator('meta[name="description"]')
	await expect(description).toHaveAttribute('content', /software engineer/i)

	await expect(getMetaTag(page, 'og:title')).toHaveAttribute(
		'content',
		'Michal Kolacz',
	)
	await expect(getMetaTag(page, 'og:type')).toHaveAttribute(
		'content',
		'website',
	)
	await expect(getMetaTag(page, 'og:image')).toHaveAttribute(
		'content',
		/\/og-image\.png$/,
	)
})

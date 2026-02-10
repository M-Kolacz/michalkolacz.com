import { expect, test } from '#tests/playwright-utils.ts'
import { t } from '#tests/utils.ts'

test('Homepage displays correctly', async ({ page, navigate }) => {
	await navigate('/')

	await expect(page.getByText(t('homepage.hero.heading'))).toBeVisible()
})

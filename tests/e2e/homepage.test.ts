import { expect, test } from '#tests/playwright-utils.ts'

test('Homepage displays correctly', async ({ page, navigate }) => {
	await navigate('/')

	await expect(page.getByText(/Hi, I`m Michał/i)).toBeVisible()
})

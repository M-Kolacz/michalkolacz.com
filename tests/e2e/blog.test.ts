import { expect, test } from '#tests/playwright-utils.ts'

test('Blog listing page displays published posts', async ({
	page,
	navigate,
}) => {
	await navigate('/blog')

	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog')

	const postLink = page.getByRole('link', {
		name: /Hello World: My First Blog Post/,
	})
	await expect(postLink).toBeVisible()

	await expect(postLink).toContainText('April 5, 2026')
	await expect(postLink).toContainText('Welcome to my blog! In this first post')

	await postLink.click()
	await expect(page).toHaveURL(/\/blog\/hello-world$/)
	await expect(
		page.getByRole('heading', { name: /Hello World: My First Blog Post/ }),
	).toBeVisible()
})

test('Blog post page displays banner image, title, date, and reading time', async ({
	page,
	navigate,
}) => {
	await navigate('/blog/:slug', { slug: 'hello-world' })

	const bannerImg = page.getByRole('img', {
		name: /A laptop on a desk with code on screen/,
	})
	await expect(bannerImg).toBeVisible()

	await expect(
		page.getByRole('heading', { name: /Hello World: My First Blog Post/ }),
	).toBeVisible()

	await expect(page.getByText('April 5, 2026')).toBeVisible()

	await expect(page.getByText(/min read/)).toBeVisible()
})

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

test('Blog post renders syntax-highlighted code blocks', async ({
	page,
	navigate,
}) => {
	await navigate('/blog/:slug', { slug: 'hello-world' })

	const codeBlock = page.locator('pre.shiki')
	await expect(codeBlock).toBeVisible()

	// Shiki applies inline color styles via <span> elements
	const highlightedSpan = codeBlock.locator('span[style]').first()
	await expect(highlightedSpan).toBeVisible()
})

test('Blog post headings have anchor links', async ({ page, navigate }) => {
	await navigate('/blog/:slug', { slug: 'hello-world' })

	const heading = page.getByRole('heading', { name: 'Why I Started Writing' })
	await expect(heading).toBeVisible()

	// rehype-slug adds id, rehype-autolink-headings wraps content in <a>
	const anchor = heading.locator('a')
	await expect(anchor).toHaveAttribute('href', '#why-i-started-writing')
})

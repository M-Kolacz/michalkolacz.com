import { expect, getMetaTag, test } from '#tests/playwright-utils.ts'

test('RSS feed returns valid XML with expected entries', async ({
	page,
	baseURL,
}) => {
	const response = await page.request.get(`${baseURL}blog/rss.xml`)

	expect(response.status()).toBe(200)
	expect(response.headers()['content-type']).toContain('application/rss+xml')

	const body = await response.text()
	expect(body).toContain('<?xml version="1.0"')
	expect(body).toContain('<rss version="2.0"')
	expect(body).toContain('<title>Michal Kolacz Blog</title>')
	expect(body).toContain('<item>')
	expect(body).toContain(
		'Visual Regression Testing with Storybook, Playwright, and Docker',
	)
	expect(body).toContain('/blog/visual-regression-testing</link>')
})

test('Blog post page has correct OG meta tags', async ({ page, navigate }) => {
	await navigate('/blog/:slug', { slug: 'visual-regression-testing' })

	await expect(getMetaTag(page, 'og:title')).toHaveAttribute(
		'content',
		'Visual Regression Testing with Storybook, Playwright, and Docker',
	)
	await expect(getMetaTag(page, 'og:description')).toHaveAttribute(
		'content',
		/unintended UI changes/,
	)
	await expect(getMetaTag(page, 'og:type')).toHaveAttribute(
		'content',
		'article',
	)
	await expect(getMetaTag(page, 'og:image')).toHaveAttribute(
		'content',
		/\/resources\/images/,
	)
})

test('Blog listing page has OG meta tags', async ({ page, navigate }) => {
	await navigate('/blog')

	await expect(getMetaTag(page, 'og:title')).toHaveAttribute(
		'content',
		'Blog | Michal Kolacz',
	)
	await expect(getMetaTag(page, 'og:type')).toHaveAttribute(
		'content',
		'website',
	)
})

test('Blog listing page displays published posts', async ({
	page,
	navigate,
}) => {
	await navigate('/blog')

	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Blog')

	const postLink = page.getByRole('link', {
		name: /Visual Regression Testing with Storybook, Playwright, and Docker/,
	})
	await expect(postLink).toBeVisible()

	await expect(postLink).toContainText('April 14, 2026')
	await expect(postLink).toContainText('How I catch unintended UI changes')

	await postLink.click()
	await expect(page).toHaveURL(/\/blog\/visual-regression-testing$/)
	await expect(
		page.getByRole('heading', {
			name: /Visual Regression Testing with Storybook, Playwright, and Docker/,
		}),
	).toBeVisible()
})

test('Blog post page displays banner image, title, date, and reading time', async ({
	page,
	navigate,
}) => {
	await navigate('/blog/:slug', { slug: 'visual-regression-testing' })

	const bannerImg = page.getByRole('img', {
		name: /A laptop on a desk with code on screen/,
	})
	await expect(bannerImg).toBeVisible()

	await expect(
		page.getByRole('heading', {
			name: /Visual Regression Testing with Storybook, Playwright, and Docker/,
		}),
	).toBeVisible()

	await expect(page.getByText('April 14, 2026')).toBeVisible()

	await expect(page.getByText(/min read/)).toBeVisible()
})

test('Blog post renders syntax-highlighted code blocks', async ({
	page,
	navigate,
}) => {
	await navigate('/blog/:slug', { slug: 'visual-regression-testing' })

	// eslint-disable-next-line playwright/no-raw-locators
	const codeBlock = page.locator('pre.shiki').first()
	await expect(codeBlock).toBeVisible()

	// Shiki applies inline color styles via <span> elements
	// eslint-disable-next-line playwright/no-raw-locators
	const highlightedSpan = codeBlock.locator('span[style]').first()
	await expect(highlightedSpan).toBeVisible()
})

test('Blog post headings have anchor links', async ({ page, navigate }) => {
	await navigate('/blog/:slug', { slug: 'visual-regression-testing' })

	const heading = page.getByRole('heading', {
		name: 'The Problem with UI Changes',
	})
	await expect(heading).toBeVisible()

	// rehype-slug adds id, rehype-autolink-headings wraps content in <a>
	const anchor = heading.getByRole('link')
	await expect(anchor).toHaveAttribute('href', '#the-problem-with-ui-changes')
})

import { getBlog } from '#app/utils/blog/pipeline.server.ts'
import { getDomainUrl } from '#app/utils/misc.tsx'
import { type Route } from './+types/sitemap[.]xml.ts'

const STATIC_ROUTES = [
	{ path: '/', priority: 1.0 },
	{ path: '/blog', priority: 0.8 },
]

export async function loader({ request }: Route.LoaderArgs) {
	const siteUrl = getDomainUrl(request)
	const posts = await getBlog().getListings()

	const entries = [
		...STATIC_ROUTES.map(
			({ path, priority }) => `
  <url>
    <loc>${siteUrl}${path}</loc>
    <priority>${priority}</priority>
  </url>`,
		),
		...posts.map(
			(post) => `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.date).toISOString().split('T')[0]}</lastmod>
    <priority>0.7</priority>
  </url>`,
		),
	]

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
>${entries.join('')}
</urlset>`

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': `public, max-age=${60 * 5}`,
		},
	})
}

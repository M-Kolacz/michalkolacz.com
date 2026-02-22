import { generateSitemap } from '@nasa-gcn/remix-seo'
import { getBlogMdxListItems } from '#app/utils/blog/mdx.server.ts'
import { getDomainUrl } from '#app/utils/misc.tsx'
import { type Route } from './+types/sitemap[.]xml.ts'

export async function loader({ request, context }: Route.LoaderArgs) {
	const siteUrl = getDomainUrl(request)

	// TODO: This is typeerror is coming up since of the remix-run/server-runtime package. We might need to remove/update that one.
	// @ts-expect-error
	const baseResponse = await generateSitemap(request, context.serverBuild.routes, {
		siteUrl,
		headers: {
			'Cache-Control': `public, max-age=${60 * 5}`,
		},
	})

	const baseSitemap = await baseResponse.text()
	const posts = await getBlogMdxListItems({})

	const blogEntries = posts
		.map(
			(post) => `
  <url>
    <loc>${siteUrl}/blog/${post.slug}</loc>
    <lastmod>${new Date(post.frontmatter.date).toISOString()}</lastmod>
    <priority>0.7</priority>
  </url>`,
		)
		.join('')

	const sitemap = baseSitemap.replace('</urlset>', `${blogEntries}\n  </urlset>`)

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml',
			'Content-Length': String(new TextEncoder().encode(sitemap).byteLength),
			'Cache-Control': `public, max-age=${60 * 5}`,
		},
	})
}

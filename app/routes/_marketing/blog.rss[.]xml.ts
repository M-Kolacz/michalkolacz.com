import { getBlog } from '#app/utils/blog/pipeline.server.ts'
import { getDomainUrl } from '#app/utils/misc.tsx'
import { type Route } from './+types/blog.rss[.]xml.ts'

export async function loader({ request }: Route.LoaderArgs) {
	const posts = await getBlog().getListings()
	const domainUrl = getDomainUrl(request)
	const blogUrl = `${domainUrl}/blog`
	const feedUrl = `${domainUrl}/blog/rss.xml`

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Michal Kolacz Blog</title>
    <description>Blog posts by Michal Kolacz</description>
    <link>${blogUrl}</link>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <language>en</language>${posts
			.map(
				(post) => `
    <item>
      <title>${escapeXml(post.title)}</title>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <link>${domainUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${domainUrl}/blog/${post.slug}</guid>
    </item>`,
			)
			.join('')}
  </channel>
</rss>`

	return new Response(rss, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': `public, max-age=${60 * 5}`,
		},
	})
}

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

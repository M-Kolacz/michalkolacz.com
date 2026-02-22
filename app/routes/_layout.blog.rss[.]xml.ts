import { format } from 'date-fns'
import { type Route } from './+types/_layout.blog.rss[.]xml'
import { getBlogMdxListItems } from '#app/utils/blog/mdx.server.ts'
import { getDomainUrl } from '#app/utils/misc.tsx'

export async function loader({ request }: Route.LoaderArgs) {
	const posts = await getBlogMdxListItems({})

	const blogUrl = `${getDomainUrl(request)}/blog`

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Michal Kolacz Blog</title>
    <link>${blogUrl}</link>
    <atom:link href="${blogUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Blog by Michal Kolacz</description>
    <language>en-us</language>
    <ttl>60</ttl>
    ${posts
			.map(
				(post) => `<item>
      <title>${cdata(post.frontmatter.title)}</title>
      <description>${cdata(post.frontmatter.description)}</description>
      <pubDate>${format(new Date(post.frontmatter.date), 'EEE, dd MMM yyyy HH:mm:ss xx')}</pubDate>
      <link>${blogUrl}/${post.slug}</link>
      <guid>${blogUrl}/${post.slug}</guid>
    </item>`,
			)
			.join('\n    ')}
  </channel>
</rss>`.trim()

	return new Response(rss, {
		headers: {
			'Content-Type': 'application/xml',
			'Content-Length': String(Buffer.byteLength(rss)),
			'Cache-Control': 'public, max-age=3600',
		},
	})
}

function cdata(s: string) {
	return `<![CDATA[${s}]]>`
}

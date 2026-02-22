import { format } from 'date-fns'
import { getBlogMdxListItems } from '#app/utils/blog/mdx.server.ts'

export async function loader() {
	const posts = await getBlogMdxListItems({})

	const blogUrl = 'https://michalkolacz.com/blog'

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Michal Kolacz Blog</title>
    <link>${blogUrl}</link>
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

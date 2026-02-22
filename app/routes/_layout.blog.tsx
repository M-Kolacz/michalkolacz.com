import { Link, useLoaderData } from 'react-router'
import { type MetaFunction, type LoaderFunctionArgs } from 'react-router'
import { getBlogMdxListItems } from '#app/utils/blog/mdx.server.ts'
import { getDomainUrl } from '#app/utils/misc.tsx'

const description = 'Articles about web development, software engineering, and more.'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	const canonicalUrl = data?.canonicalUrl

	return [
		{ title: 'Blog | Michal Kolacz' },
		{ name: 'description', content: description },
		{ property: 'og:title', content: 'Blog | Michal Kolacz' },
		{ property: 'og:description', content: description },
		{ property: 'og:type', content: 'website' },
		...(canonicalUrl ? [{ property: 'og:url', content: canonicalUrl }] : []),
		{ name: 'twitter:card', content: 'summary' },
		{ name: 'twitter:title', content: 'Blog | Michal Kolacz' },
		{ name: 'twitter:description', content: description },
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const posts = await getBlogMdxListItems({})
	const canonicalUrl = `${getDomainUrl(request)}/blog`
	return { posts, canonicalUrl }
}

export default function BlogIndex() {
	const { posts } = useLoaderData<typeof loader>()

	return (
		<main className="container py-12">
			<h2 className="text-h2 mb-12">Blog</h2>
			{posts.length === 0 ? (
				<p className="text-muted-foreground">No posts yet.</p>
			) : (
				<ul className="flex flex-col gap-8">
					{posts.map((post) => (
						<li key={post.slug}>
							<Link
								to={`/blog/${post.slug}`}
								className="group block"
							>
								<h3 className="text-xl font-bold group-hover:underline">
									{post.frontmatter.title}
								</h3>
								<p className="text-muted-foreground mt-1 text-sm">
									{post.dateDisplay}
									{post.readTime ? ` · ${post.readTime.text}` : null}
								</p>
								{post.frontmatter.description ? (
									<p className="mt-2">
										{post.frontmatter.description}
									</p>
								) : null}
							</Link>
						</li>
					))}
				</ul>
			)}
		</main>
	)
}

import { Link, useLoaderData } from 'react-router'
import { type MetaFunction } from 'react-router'
import { getBlogMdxListItems } from '#app/utils/blog/mdx.server.ts'

export const meta: MetaFunction = () => [{ title: 'Blog | Michal Kolacz' }]

export async function loader() {
	const posts = await getBlogMdxListItems({})
	return { posts }
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

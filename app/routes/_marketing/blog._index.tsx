import { Link } from 'react-router'
import { getPostListings } from '#app/utils/blog/mdx.server.ts'
import { type Route } from './+types/blog._index.js'

export async function loader() {
	const posts = await getPostListings()
	return { posts }
}

export default function BlogIndexRoute({ loaderData }: Route.ComponentProps) {
	const { posts } = loaderData

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			<h1 className="text-h2 mb-8">Blog</h1>
			{posts.length === 0 ? (
				<p className="text-muted-foreground">No posts yet.</p>
			) : (
				<ul className="space-y-8">
					{posts.map((post) => (
						<li key={post.slug}>
							<Link to={`/blog/${post.slug}`} className="group block">
								<h2 className="text-h4 group-hover:underline">
									{post.title}
								</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									{new Date(post.date).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										timeZone: 'UTC',
									})}
								</p>
								<p className="text-muted-foreground mt-2">
									{post.description}
								</p>
							</Link>
						</li>
					))}
				</ul>
			)}
		</main>
	)
}

import { Img } from 'openimg/react'
import { Link } from 'react-router'
import { getBlog } from '#app/utils/blog/pipeline.server.ts'
import { type Route } from './+types/blog._index.js'

export const meta: Route.MetaFunction = ({ matches }) => {
	const rootData = matches[0].loaderData
	const origin = rootData.requestInfo.origin

	return [
		{ title: 'Blog | Michal Kolacz' },
		{
			name: 'description',
			content: 'Blog posts by Michal Kolacz about software engineering.',
		},
		{ property: 'og:title', content: 'Blog | Michal Kolacz' },
		{
			property: 'og:description',
			content: 'Blog posts by Michal Kolacz about software engineering.',
		},
		{ property: 'og:type', content: 'website' },
		{ property: 'og:image', content: `${origin}/og-image.png` },
	]
}

export async function loader() {
	return { posts: await getBlog().getListings() }
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
								{post.bannerImage ? (
									<Img
										src={post.bannerImage}
										alt={post.bannerAlt ?? ''}
										className="mb-4 w-full rounded-lg object-cover"
										width={768}
										height={400}
									/>
								) : null}
								<h2 className="text-h4 group-hover:underline">{post.title}</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									{new Date(post.date).toLocaleDateString('en-US', {
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										timeZone: 'UTC',
									})}{' '}
									— {post.readingTime}
								</p>
								<p className="text-muted-foreground mt-2">{post.description}</p>
							</Link>
						</li>
					))}
				</ul>
			)}
		</main>
	)
}

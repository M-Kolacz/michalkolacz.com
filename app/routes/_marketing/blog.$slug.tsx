import { getMDXComponent } from 'mdx-bundler/client'
import { Img } from 'openimg/react'
import { useMemo } from 'react'
import { data } from 'react-router'
import { getBlog } from '#app/utils/blog/pipeline.server.ts'
import { type Route } from './+types/blog.$slug.js'

export const meta: Route.MetaFunction = ({ data, matches }) => {
	const rootData = matches[0]?.data as
		| { requestInfo: { origin: string } }
		| undefined
	const origin = rootData?.requestInfo.origin ?? ''

	if (!data) {
		return [{ title: 'Post Not Found' }]
	}

	const { frontmatter, bannerImage } = data
	const ogImage = bannerImage ? `${origin}${bannerImage}` : null

	return [
		{ title: `${frontmatter.title} | Michal Kolacz` },
		{ name: 'description', content: frontmatter.description },
		{ property: 'og:title', content: frontmatter.title },
		{ property: 'og:description', content: frontmatter.description },
		{ property: 'og:type', content: 'article' },
		...(ogImage ? [{ property: 'og:image', content: ogImage }] : []),
	]
}

export async function loader({ params }: Route.LoaderArgs) {
	const { slug } = params
	return getBlog()
		.getPost(slug)
		.catch((error) => {
			console.error(error)
			throw data(null, { status: 404 })
		})
}

export default function BlogPostRoute({ loaderData }: Route.ComponentProps) {
	const { code, frontmatter, readingTime, bannerImage, bannerAlt } = loaderData

	const Component = useMemo(() => getMDXComponent(code), [code])

	const formattedDate = new Date(frontmatter.date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		timeZone: 'UTC',
	})

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
			{bannerImage ? (
				<Img
					src={bannerImage}
					alt={bannerAlt ?? ''}
					className="mb-8 w-full rounded-lg object-cover"
					width={768}
					height={400}
				/>
			) : null}
			<header className="mb-8">
				<h1 className="text-h2 mb-2">{frontmatter.title}</h1>
				<p className="text-muted-foreground text-sm">
					{formattedDate} — {readingTime}
				</p>
			</header>
			<article className="prose dark:prose-invert max-w-none">
				<Component />
			</article>
		</main>
	)
}

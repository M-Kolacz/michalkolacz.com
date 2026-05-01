import { invariantResponse } from '@epic-web/invariant'
import { getMDXComponent } from 'mdx-bundler/client'
import { Img } from 'openimg/react'
import { useMemo } from 'react'
import { z } from 'zod'
import { getBlog } from '#app/utils/blog/pipeline.server.ts'
import { type Route } from './+types/blog.$slug.js'

export const meta: Route.MetaFunction = ({ matches, loaderData }) => {
	const rootMatch = matches[0]
	const origin = rootMatch?.loaderData.requestInfo.origin ?? ''

	const { frontmatter, bannerImage } = loaderData
	const ogImage = bannerImage
		? `${origin}${bannerImage}`
		: `${origin}/og-image.png`

	return [
		{ title: `${frontmatter.title} | Michal Kolacz` },
		{ name: 'description', content: frontmatter.description },
		{ property: 'og:title', content: frontmatter.title },
		{ property: 'og:description', content: frontmatter.description },
		{ property: 'og:type', content: 'article' },
		{ property: 'og:image', content: ogImage },
		{
			'script:ld+json': {
				'@context': 'https://schema.org',
				'@type': 'Article',
				headline: frontmatter.title,
				description: frontmatter.description,
				datePublished: frontmatter.date,
				author: {
					'@type': 'Person',
					name: 'Michal Kolacz',
				},
			},
		},
	]
}

const SlugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export async function loader({ params }: Route.LoaderArgs) {
	const parsed = SlugSchema.safeParse(params.slug)
	invariantResponse(parsed.success, 'Invalid slug', { status: 404 })
	const slug = parsed.data

	return getBlog()
		.getPost(slug)
		.catch(() => {
			throw invariantResponse(parsed.success, 'Blog post not found', {
				status: 404,
			})
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

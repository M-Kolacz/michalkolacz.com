import { getMDXComponent } from 'mdx-bundler/client'
import { useMemo } from 'react'
import { data } from 'react-router'
import { getPostContent } from '#app/utils/blog/github.server.ts'
import { compileMdxPost } from '#app/utils/blog/mdx.server.ts'
import { type Route } from './+types/blog.$slug.js'

export async function loader({ params }: Route.LoaderArgs) {
	const { slug } = params

	let source: string
	try {
		source = await getPostContent(slug)
	} catch (error) {
		console.error(error)
		throw data(null, { status: 404 })
	}

	const post = await compileMdxPost(slug, source)

	return {
		code: post.code,
		frontmatter: {
			...post.frontmatter,
			date: post.frontmatter.date.toISOString(),
		},
		readingTime: post.readingTime,
	}
}

export default function BlogPostRoute({ loaderData }: Route.ComponentProps) {
	const { code, frontmatter, readingTime } = loaderData

	const Component = useMemo(() => getMDXComponent(code), [code])

	const formattedDate = new Date(frontmatter.date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	})

	return (
		<main className="container mx-auto max-w-3xl px-4 py-12">
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

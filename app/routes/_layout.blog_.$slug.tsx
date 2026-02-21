import { data, useLoaderData } from 'react-router'
import { type MetaFunction, type LoaderFunctionArgs } from 'react-router'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { useMdxComponent } from '#app/utils/blog/mdx-components.tsx'
import { getMdxPage } from '#app/utils/blog/mdx.server.ts'

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	if (!data) return [{ title: 'Post Not Found | Michal Kolacz' }]
	return [
		{ title: `${data.page.frontmatter.title} | Michal Kolacz` },
		{ name: 'description', content: data.page.frontmatter.description },
	]
}

export async function loader({ params }: LoaderFunctionArgs) {
	const slug = params.slug
	if (!slug) throw data('Not found', { status: 404 })

	const page = await getMdxPage({ slug }, {})
	if (!page) throw data('Not found', { status: 404 })

	return { page }
}

export default function BlogPost() {
	const { page } = useLoaderData<typeof loader>()
	const Component = useMdxComponent(page.code)

	return (
		<main className="container py-12">
			<header className="mb-12">
				<h2 className="text-h2">{page.frontmatter.title}</h2>
				<p className="text-muted-foreground mt-2 text-sm">
					{page.dateDisplay}
					{page.readTime ? ` · ${page.readTime.text}` : null}
				</p>
			</header>
			<article className="prose dark:prose-invert max-w-none">
				<Component />
			</article>
		</main>
	)
}

export const ErrorBoundary = GeneralErrorBoundary

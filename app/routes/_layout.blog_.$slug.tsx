import {
	data,
	Link,
	useLoaderData,
	useNavigation,
	type MetaFunction,
	type LoaderFunctionArgs,
} from 'react-router'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Skeleton } from '#app/components/ui/skeleton.tsx'
import { getUserId } from '#app/utils/auth.server.ts'
import { useMdxComponent } from '#app/utils/blog/mdx-components.tsx'
import { getMdxPage } from '#app/utils/blog/mdx.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { getDomainUrl } from '#app/utils/misc.tsx'
import { userHasRole } from '#app/utils/user.ts'

export const meta: MetaFunction<typeof loader> = ({ data: loaderData }) => {
	if (!loaderData) return [{ title: 'Post Not Found | Michal Kolacz' }]

	const { page, canonicalUrl, isAdminDraftPreview } = loaderData
	const title = `${page.frontmatter.title} | Michal Kolacz`
	const description = page.frontmatter.description

	return [
		{ title },
		{ name: 'description', content: description },
		{ property: 'og:title', content: page.frontmatter.title },
		{ property: 'og:description', content: description },
		{ property: 'og:type', content: 'article' },
		{ property: 'og:url', content: canonicalUrl },
		{ property: 'article:published_time', content: page.frontmatter.date },
		...(page.frontmatter.categories ?? []).map((tag: string) => ({
			property: 'article:tag',
			content: tag,
		})),
		{ name: 'twitter:card', content: 'summary' },
		{ name: 'twitter:title', content: page.frontmatter.title },
		{ name: 'twitter:description', content: description },
		...(isAdminDraftPreview ? [{ name: 'robots', content: 'noindex' }] : []),
	]
}

export async function loader({ params, request }: LoaderFunctionArgs) {
	const slug = params.slug
	if (!slug) throw data('Not found', { status: 404 })

	const url = new URL(request.url)
	const wantsDraft = url.searchParams.get('draft') === 'true'

	let isAdminDraftPreview = false
	if (wantsDraft) {
		const userId = await getUserId(request)
		if (userId) {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				include: { roles: { select: { name: true, permissions: true } } },
			})
			isAdminDraftPreview = userHasRole(user, 'admin')
		}
	}

	const page = await getMdxPage({ slug }, { forceFresh: isAdminDraftPreview })
	if (!page) throw data('Not found', { status: 404 })

	if (page.frontmatter.draft && !isAdminDraftPreview) {
		throw data('Not found', { status: 404 })
	}

	const canonicalUrl = `${getDomainUrl(request)}/blog/${slug}`
	return { page, canonicalUrl, isAdminDraftPreview }
}

function BlogPostSkeleton() {
	return (
		<main className="container py-12 sm:py-16">
			<header className="mb-12">
				<Skeleton className="mb-3 h-10 w-3/4" />
				<Skeleton className="h-4 w-1/4" />
			</header>
			<div className="space-y-4">
				<Skeleton className="h-4 w-full" />
				<Skeleton className="h-4 w-5/6" />
				<Skeleton className="h-4 w-4/6" />
				<Skeleton className="mt-8 h-4 w-full" />
				<Skeleton className="h-4 w-3/4" />
			</div>
		</main>
	)
}

export default function BlogPost() {
	const { page, isAdminDraftPreview } = useLoaderData<typeof loader>()
	const Component = useMdxComponent(page.code)
	const navigation = useNavigation()

	if (navigation.state === 'loading') return <BlogPostSkeleton />

	return (
		<main className="container py-12 sm:py-16">
			<nav aria-label="Breadcrumb" className="mb-8">
				<Link
					to="/blog"
					className="text-muted-foreground hover:text-foreground text-sm underline-offset-4 hover:underline"
				>
					&larr; All posts
				</Link>
			</nav>

			{isAdminDraftPreview ? (
				<div
					role="status"
					className="mb-6 rounded border border-yellow-500 bg-yellow-50 px-4 py-2 text-sm text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200"
				>
					Draft preview — this post is not publicly visible
				</div>
			) : null}

			<header className="mb-12">
				<h2 className="text-h2">{page.frontmatter.title}</h2>
				<p className="text-muted-foreground mt-2 text-sm">
					{page.dateDisplay}
					{page.readTime ? ` · ${page.readTime.text}` : null}
				</p>
			</header>

			<article
				className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none"
				aria-label={`Article: ${page.frontmatter.title}`}
			>
				<Component />
			</article>
		</main>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<div className="container py-12 text-center">
						<p className="text-h2 mb-4">Post not found</p>
						<p className="text-muted-foreground mb-8">
							&ldquo;{params.slug}&rdquo; doesn&apos;t exist or has been
							removed.
						</p>
						<Link to="/blog" className="underline">
							Back to blog
						</Link>
					</div>
				),
			}}
		/>
	)
}

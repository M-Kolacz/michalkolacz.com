import { Link, useLoaderData, useNavigation } from 'react-router'
import { type MetaFunction, type LoaderFunctionArgs } from 'react-router'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Skeleton } from '#app/components/ui/skeleton.tsx'
import { getUserId } from '#app/utils/auth.server.ts'
import { getBlogMdxListItems } from '#app/utils/blog/mdx.server.ts'
import { prisma } from '#app/utils/db.server.ts'
import { getDomainUrl } from '#app/utils/misc.tsx'
import { userHasRole } from '#app/utils/user.ts'

const description =
	'Articles about web development, software engineering, and more.'

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
	const url = new URL(request.url)
	const wantsDraft = url.searchParams.get('draft') === 'true'

	let showDrafts = false
	if (wantsDraft) {
		const userId = await getUserId(request)
		if (userId) {
			const user = await prisma.user.findUnique({
				where: { id: userId },
				select: { roles: { select: { name: true } } },
			})
			showDrafts = userHasRole(user, 'admin')
		}
	}

	const posts = await getBlogMdxListItems({ showDrafts })
	const canonicalUrl = `${getDomainUrl(request)}/blog`
	return { posts, canonicalUrl, showDrafts }
}

function BlogListSkeleton() {
	return (
		<ul
			className="flex flex-col gap-8"
			aria-busy="true"
			aria-label="Loading posts"
		>
			{Array.from({ length: 3 }).map((_, i) => (
				<li key={i}>
					<Skeleton className="mb-2 h-6 w-2/3" />
					<Skeleton className="mb-2 h-4 w-1/4" />
					<Skeleton className="h-4 w-full" />
				</li>
			))}
		</ul>
	)
}

export default function BlogIndex() {
	const { posts, showDrafts } = useLoaderData<typeof loader>()
	const navigation = useNavigation()

	const isNavigatingToPost =
		navigation.state === 'loading' &&
		navigation.location.pathname.startsWith('/blog/')

	return (
		<main className="container py-12 sm:py-16">
			<h2 className="text-h2 mb-8 sm:mb-12">Blog</h2>

			{showDrafts ? (
				<p className="mb-6 rounded border border-yellow-500 bg-yellow-50 px-4 py-2 text-sm text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-200">
					Draft preview enabled
				</p>
			) : null}

			{isNavigatingToPost ? (
				<BlogListSkeleton />
			) : posts.length === 0 ? (
				<p className="text-muted-foreground">No posts yet.</p>
			) : (
				<ul className="flex flex-col gap-8">
					{posts.map((post) => (
						<li key={post.slug}>
							<Link
								to={`/blog/${post.slug}`}
								className="group block"
								prefetch="intent"
							>
								<div className="flex items-center gap-2">
									<h3 className="text-xl font-bold group-hover:underline">
										{post.frontmatter.title}
									</h3>
									{post.frontmatter.draft ? (
										<span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200">
											Draft
										</span>
									) : null}
								</div>
								<p className="text-muted-foreground mt-1 text-sm">
									{post.dateDisplay}
									{post.readTime ? ` · ${post.readTime.text}` : null}
								</p>
								{post.frontmatter.description ? (
									<p className="mt-2">{post.frontmatter.description}</p>
								) : null}
							</Link>
						</li>
					))}
				</ul>
			)}
		</main>
	)
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: () => (
					<div className="text-center">
						<p className="text-h2 mb-4">Blog not found</p>
						<Link to="/" className="underline">
							Go home
						</Link>
					</div>
				),
			}}
		/>
	)
}

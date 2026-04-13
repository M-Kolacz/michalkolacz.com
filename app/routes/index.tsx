import { Link } from 'react-router'
import { useTranslation } from '#app/utils/i18n/react.tsx'
import heroImage from '../assets/homepage-hero.jpg'
import { type Route } from './+types/index.ts'

const LATEST_POSTS_LIMIT = 3

export const meta: Route.MetaFunction = () => [{ title: 'Michal Kolacz' }]

export async function loader() {
	const { getBlog } = await import('#app/utils/blog/pipeline.server.ts')
	const posts = await getBlog().getListings()
	return { posts: posts.slice(0, LATEST_POSTS_LIMIT) }
}

export default function Index({ loaderData }: Route.ComponentProps) {
	const { t, locale } = useTranslation()
	const { posts } = loaderData

	return (
		<main className="container mx-auto flex w-full max-w-3xl flex-col gap-16 px-4 py-12 lg:py-16">
			<section className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
				<div className="flex flex-1 flex-col gap-4 text-black dark:text-white">
					<h2 className="text-h2">{t('homepage.hero.heading')}</h2>
					<p className="text-p1">{t('homepage.hero.subheading')}</p>
					<p className="text-body-md text-muted-foreground">
						{t('homepage.intro.body')}
					</p>
				</div>
				<img
					src={heroImage}
					alt={t('homepage.hero.imageAlt')}
					className="w-full rounded-lg object-cover md:h-[320px] md:w-[320px] md:flex-none"
				/>
			</section>

			<section className="flex flex-col gap-6">
				<h3 className="text-h3 text-black dark:text-white">
					{t('homepage.latestPosts.heading')}
				</h3>
				{posts.length === 0 ? (
					<p className="text-muted-foreground">
						{t('homepage.latestPosts.empty')}
					</p>
				) : (
					<ul className="flex flex-col gap-6">
						{posts.map((post) => (
							<li key={post.slug}>
								<Link to={`/blog/${post.slug}`} className="group block">
									<h4 className="text-h4 text-black group-hover:underline dark:text-white">
										{post.title}
									</h4>
									<p className="text-muted-foreground mt-1 text-sm">
										{new Date(post.date).toLocaleDateString(locale, {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
											timeZone: 'UTC',
										})}{' '}
										— {post.readingTime}
									</p>
									<p className="text-muted-foreground mt-2">
										{post.description}
									</p>
								</Link>
							</li>
						))}
					</ul>
				)}
				<Link
					to="/blog"
					className="text-body-md self-start font-medium text-black hover:underline dark:text-white"
				>
					{t('homepage.latestPosts.viewAll')} →
				</Link>
			</section>
		</main>
	)
}

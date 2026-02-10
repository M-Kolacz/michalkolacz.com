import heroImage from '../../assets/homepage-hero.jpg'
import { type Route } from './+types/index.ts'

export const meta: Route.MetaFunction = () => [{ title: 'Michal Kolacz' }]

export default function Index() {
	return (
		<main className="flex w-full flex-col items-center p-8 lg:py-16">
			<div className="flex w-full flex-col gap-4 md:flex-row md:items-center lg:w-auto lg:gap-7">
				<div className="flex shrink-0 flex-col gap-4 text-black dark:text-white">
					<h2 className="text-h2">Hi, I`m Michał 👋</h2>
					<p className="text-p1">
						Software engineer based in Kraków.
					</p>
				</div>
				<img
					src={heroImage}
					alt="Michał Kołacz"
					className="w-full flex-1 object-cover md:h-[460px] md:w-auto lg:size-[460px] lg:flex-none"
				/>
			</div>
		</main>
	)
}

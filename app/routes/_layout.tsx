import { Link, Outlet, useRouteLoaderData } from 'react-router'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { EpicProgress } from '#app/components/progress-bar.tsx'
import { useToast } from '#app/components/toaster.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { EpicToaster } from '#app/components/ui/sonner.tsx'
import { type loader as rootLoader } from '#app/root.tsx'
import { ThemeSwitch, useTheme } from '#app/routes/resources/theme-switch.tsx'
import { TranslationProvider } from '#app/utils/i18n/react.tsx'
import en from '#app/utils/i18n/translations/en.ts'

export default function AppLayout() {
	const data = useRouteLoaderData<typeof rootLoader>('root')
	const theme = useTheme()

	useToast(data?.toast ?? null)

	return (
		<HoneypotProvider {...(data?.honeyProps ?? {})}>
			<TranslationProvider
				fallbackLocale={['en']}
				translations={{
					en,
				}}
			>
				<div className="flex min-h-screen flex-col justify-between">
					<header className="container flex items-center justify-between py-6">
						<h1 className="text-h1 text-black dark:text-white">
							Michal Kolacz
						</h1>
						<nav className="flex items-center gap-6">
							<Link
								to="/blog"
								className="text-body-md font-medium text-black hover:underline dark:text-white"
							>
								Blog
							</Link>
							<div className="flex items-center gap-4">
								<a
									href="https://github.com/M-Kolacz"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="GitHub"
								>
									<Icon
										name="github-logo"
										size="xl"
										className="text-black dark:text-white"
									/>
								</a>
								<a
									href="https://x.com/M_Kolacz"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="Twitter"
								>
									<Icon
										name="twitter-logo"
										size="xl"
										className="text-black dark:text-white"
									/>
								</a>
								<a
									href="https://www.linkedin.com/in/m-kolacz"
									target="_blank"
									rel="noopener noreferrer"
									aria-label="LinkedIn"
								>
									<Icon
										name="linkedin-logo"
										size="xl"
										className="text-black dark:text-white"
									/>
								</a>
							</div>
						</nav>
					</header>

					<div className="flex flex-1 flex-col">
						<Outlet />
					</div>

					<footer className="container flex items-center justify-between gap-4 pt-6 pb-5">
						<p className="text-body-sm text-black dark:text-white">
							© {new Date().getFullYear()} Michał Kołacz
						</p>
						<div className="flex items-center gap-6">
							<a
								href="/blog/rss.xml"
								className="text-body-sm font-medium text-black hover:underline dark:text-white"
							>
								RSS
							</a>
							<ThemeSwitch userPreference={data?.requestInfo.userPrefs.theme} />
						</div>
					</footer>
				</div>
				<EpicToaster closeButton position="top-center" theme={theme} />
				<EpicProgress />
			</TranslationProvider>
		</HoneypotProvider>
	)
}

export const ErrorBoundary = GeneralErrorBoundary

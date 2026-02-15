import { OpenImgContextProvider } from 'openimg/react'
import { Outlet, useRouteLoaderData } from 'react-router'
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
import { getImgSrc } from '#app/utils/misc.tsx'

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
				<OpenImgContextProvider
					optimizerEndpoint="/resources/images"
					getSrc={getImgSrc}
				>
					<div className="flex min-h-screen flex-col justify-between">
						<header className="container flex items-center justify-between py-6">
							<h1 className="text-h1 text-black dark:text-white">
								Michal Kolacz
							</h1>
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
						</header>

						<div className="flex flex-1 flex-col">
							<Outlet />
						</div>

						<div className="container flex justify-between pb-5">
							<ThemeSwitch userPreference={data?.requestInfo.userPrefs.theme} />
						</div>
					</div>
					<EpicToaster closeButton position="top-center" theme={theme} />
					<EpicProgress />
				</OpenImgContextProvider>
			</TranslationProvider>
		</HoneypotProvider>
	)
}

export const ErrorBoundary = GeneralErrorBoundary

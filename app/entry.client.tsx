import { startTransition } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { HydratedRouter } from 'react-router/dom'

if (ENV.MODE === 'production' && ENV.SENTRY_DSN) {
	void import('./utils/monitoring.client.tsx').then(({ init }) => init())
}

if (ENV.MODE === 'production' && ENV.POSTHOG_KEY) {
	void import('./utils/analytics.client.ts').then(({ init }) => init())
}

startTransition(() => {
	hydrateRoot(document, <HydratedRouter />)
})

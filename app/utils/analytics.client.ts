import posthog from 'posthog-js'

export function init() {
	if (!ENV.POSTHOG_KEY) return
	posthog.init(ENV.POSTHOG_KEY, {
		api_host: ENV.POSTHOG_HOST ?? 'https://us.i.posthog.com',
		capture_pageview: 'history_change',
		capture_pageleave: true,
	})
}

import posthog from 'posthog-js'

export function init() {
	if (!ENV.POSTHOG_TOKEN) return
	posthog.init(ENV.POSTHOG_TOKEN, {
		api_host: ENV.POSTHOG_HOST ?? 'https://eu.i.posthog.com',
		capture_pageview: 'history_change',
		capture_pageleave: true,
	})
}

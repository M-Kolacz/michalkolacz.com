import posthog from 'posthog-js'

export function init() {
	if (!ENV.POSTHOG_TOKEN) return
	posthog.init(ENV.POSTHOG_TOKEN, {
		api_host: '/ingest',
		ui_host: 'https://eu.posthog.com',
		capture_pageview: 'history_change',
		capture_pageleave: true,
	})
}

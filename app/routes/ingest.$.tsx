import { type Route } from './+types/ingest.$.ts'

const POSTHOG_HOST = process.env.POSTHOG_HOST ?? 'https://eu.i.posthog.com'
const POSTHOG_ASSETS_HOST =
	process.env.POSTHOG_ASSETS_HOST ?? 'https://eu-assets.i.posthog.com'

async function proxy(request: Request, splat: string) {
	const upstreamHost = splat.startsWith('static/')
		? POSTHOG_ASSETS_HOST
		: POSTHOG_HOST
	const url = new URL(request.url)
	const target = new URL(`/${splat}${url.search}`, upstreamHost)

	const headers = new Headers(request.headers)
	headers.delete('host')
	headers.delete('connection')
	headers.delete('content-length')
	headers.set('host', new URL(upstreamHost).host)

	const init: RequestInit = {
		method: request.method,
		headers,
		body:
			request.method === 'GET' || request.method === 'HEAD'
				? undefined
				: await request.arrayBuffer(),
	}

	try {
		return await fetch(target, init)
	} catch (error) {
		console.error('PostHog proxy error', error)
		return new Response('Bad Gateway', { status: 502 })
	}
}

export async function loader({ request, params }: Route.LoaderArgs) {
	return proxy(request, params['*'] ?? '')
}

export async function action({ request, params }: Route.ActionArgs) {
	return proxy(request, params['*'] ?? '')
}

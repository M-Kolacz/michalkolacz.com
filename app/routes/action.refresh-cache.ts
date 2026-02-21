import crypto from 'node:crypto'
import { data } from 'react-router'
import { ensurePrimary } from '#app/utils/litefs.server.ts'
import {
	getMdxPage,
	getBlogMdxListItems,
	getMdxDirList,
} from '#app/utils/blog/mdx.server.ts'

type PushEventCommit = {
	added: Array<string>
	modified: Array<string>
	removed: Array<string>
}

type PushEventPayload = {
	ref: string
	commits: Array<PushEventCommit>
}

function verifySignature(payload: string, signature: string, secret: string) {
	const expected = `sha256=${crypto.createHmac('sha256', secret).update(payload).digest('hex')}`
	return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
}

function extractSlugsFromPaths(paths: Array<string>) {
	const blogPrefix = 'content/blog/'
	return paths
		.filter((p) => p.startsWith(blogPrefix))
		.map((p) => {
			const rest = p.slice(blogPrefix.length)
			// "slug/index.mdx" → "slug", "slug.mdx" → "slug"
			const slug = rest.split('/')[0]!.replace(/\.mdx?$/, '')
			return slug
		})
}

export async function action({ request }: { request: Request }) {
	const secret = process.env.GITHUB_WEBHOOK_SECRET
	if (!secret) {
		throw data({ error: 'Webhook not configured' }, { status: 501 })
	}

	const rawBody = await request.text()
	const signature = request.headers.get('x-hub-signature-256')
	if (!signature || !verifySignature(rawBody, signature, secret)) {
		throw data({ error: 'Invalid signature' }, { status: 401 })
	}

	const payload: PushEventPayload = JSON.parse(rawBody)

	if (payload.ref !== 'refs/heads/master') {
		return data({ ignored: true, reason: 'not master branch' })
	}

	await ensurePrimary()

	const changedFiles = payload.commits.flatMap((c) => [
		...c.added,
		...c.modified,
		...c.removed,
	])
	const slugs = [...new Set(extractSlugsFromPaths(changedFiles))]

	if (slugs.length === 0) {
		return data({ invalidated: [], message: 'no blog content changed' })
	}

	await Promise.all(
		slugs.map((slug) => getMdxPage({ slug }, { forceFresh: true })),
	)
	await getMdxDirList({ forceFresh: true })
	await getBlogMdxListItems({ forceFresh: true })

	return data({ invalidated: slugs })
}

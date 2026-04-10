// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import { prisma } from '#app/utils/db.server.ts'
import { type Route } from './+types/healthcheck.ts'

export async function loader(_: Route.LoaderArgs) {
	try {
		// if we can connect to the database and make a simple query, we're good.
		await prisma.user.count()
		return new Response('OK')
	} catch (error: unknown) {
		console.log('healthcheck ❌', { error })
		return new Response('ERROR', { status: 500 })
	}
}

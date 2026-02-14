import * as setCookieParser from 'set-cookie-parser'
import { sessionKey } from '#app/utils/auth.server.ts'
import { initI18n } from '#app/utils/i18n/lib/index.ts'
import en from '#app/utils/i18n/translations/en.ts'
import { authSessionStorage } from '#app/utils/session.server.ts'

export const { t } = initI18n({
	fallbackLocale: 'en',
	locale: 'en',
	translations: { en },
})

export const BASE_URL = 'https://www.epicstack.dev'

export function convertSetCookieToCookie(setCookie: string) {
	const parsedCookie = setCookieParser.parseString(setCookie)
	return new URLSearchParams({
		[parsedCookie.name]: parsedCookie.value,
	}).toString()
}

export async function getSessionSetCookieHeader(
	session: { id: string },
	existingCookie?: string,
) {
	const authSession = await authSessionStorage.getSession(existingCookie)
	authSession.set(sessionKey, session.id)
	const setCookieHeader = await authSessionStorage.commitSession(authSession)
	return setCookieHeader
}

export async function getSessionCookieHeader(
	session: { id: string },
	existingCookie?: string,
) {
	const setCookieHeader = await getSessionSetCookieHeader(
		session,
		existingCookie,
	)
	return convertSetCookieToCookie(setCookieHeader)
}

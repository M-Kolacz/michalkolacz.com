import { Octokit } from '@octokit/rest'
import { type BlogContentSource } from './content-source.ts'

const REPO_OWNER = 'M-Kolacz'
const REPO_NAME = 'michalkolacz.com'
const CONTENT_PATH = 'content/blog'

export function createGitHubContentSource(): BlogContentSource {
	const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

	return {
		async getSlugs() {
			const { data } = await octokit.repos.getContent({
				owner: REPO_OWNER,
				repo: REPO_NAME,
				path: CONTENT_PATH,
				ref: 'master',
			})

			if (!Array.isArray(data)) {
				throw new Error(
					`Expected a directory at ${CONTENT_PATH}, got a file`,
				)
			}

			return data
				.filter((item) => item.type === 'dir')
				.map((item) => item.name)
		},

		async getContent(slug) {
			const filePath = `${CONTENT_PATH}/${slug}/index.mdx`

			const { data } = await octokit.repos.getContent({
				owner: REPO_OWNER,
				repo: REPO_NAME,
				path: filePath,
				ref: 'master',
			})

			if (Array.isArray(data) || data.type !== 'file') {
				throw new Error(
					`Expected a file at ${filePath}, got ${Array.isArray(data) ? 'directory' : data.type}`,
				)
			}

			return Buffer.from(data.content, 'base64').toString('utf-8')
		},

		getImageUrl(slug, imagePath) {
			const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/master/content/blog/${slug}/${imagePath}`
			return `/resources/images?src=${encodeURIComponent(rawUrl)}`
		},
	}
}

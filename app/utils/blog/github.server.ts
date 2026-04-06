import { Octokit } from '@octokit/rest'

const REPO_OWNER = 'M-Kolacz'
const REPO_NAME = 'michalkolacz.com'
const CONTENT_PATH = 'content/blog'

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

export async function getPostSlugs(): Promise<string[]> {
	const { data } = await octokit.repos.getContent({
		owner: REPO_OWNER,
		repo: REPO_NAME,
		path: CONTENT_PATH,
		ref: 'master',
	})

	if (!Array.isArray(data)) {
		throw new Error(`Expected a directory at ${CONTENT_PATH}, got a file`)
	}

	return data.filter((item) => item.type === 'dir').map((item) => item.name)
}

export async function getPostContent(slug: string): Promise<string> {
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
}

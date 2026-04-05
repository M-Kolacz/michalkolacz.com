import fs from 'node:fs/promises'
import path from 'node:path'
import { Octokit } from '@octokit/rest'

const REPO_OWNER = 'M-Kolacz'
const REPO_NAME = 'michalkolacz.com'
const CONTENT_PATH = 'content/blog'

function getOctokit() {
	const token = process.env.GITHUB_TOKEN
	if (!token) {
		throw new Error('GITHUB_TOKEN environment variable is required')
	}
	return new Octokit({ auth: token })
}

export async function getPostContent(slug: string): Promise<string> {
	const filePath = `${CONTENT_PATH}/${slug}/index.mdx`

	if (process.env.GITHUB_TOKEN?.startsWith('MOCK_')) {
		return fs.readFile(path.join(process.cwd(), filePath), 'utf-8')
	}

	const octokit = getOctokit()

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

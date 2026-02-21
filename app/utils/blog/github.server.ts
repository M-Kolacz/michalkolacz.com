import nodePath from 'path'
import { throttling } from '@octokit/plugin-throttling'
import { Octokit as createOctokit } from '@octokit/rest'
import { type GitHubFile } from './types.ts'

const OWNER = 'M-Kolacz'
const REPO = 'michalkolacz.com'
const REF = 'master'

const safePath = (s: string) => s.replace(/\\/g, '/')

const Octokit = createOctokit.plugin(throttling)

const octokit = new Octokit({
	auth: process.env.GITHUB_TOKEN,
	throttle: {
		onRateLimit: (retryAfter, options) => {
			const method = 'method' in options ? options.method : 'METHOD_UNKNOWN'
			const url = 'url' in options ? options.url : 'URL_UNKNOWN'
			console.warn(
				`Request quota exhausted for request ${method} ${url}. Retrying after ${retryAfter} seconds.`,
			)
			return true
		},
		onSecondaryRateLimit: (_retryAfter, options) => {
			const method = 'method' in options ? options.method : 'METHOD_UNKNOWN'
			const url = 'url' in options ? options.url : 'URL_UNKNOWN'
			console.warn(`Abuse detected for request ${method} ${url}`)
		},
	},
})

async function downloadFirstMdxFile(
	list: Array<{ name: string; type: string; path: string; sha: string }>,
) {
	const filesOnly = list.filter(({ type }) => type === 'file')
	for (const extension of ['.mdx', '.md']) {
		const file = filesOnly.find(({ name }) => name.endsWith(extension))
		if (file) return downloadFileBySha(file.sha)
	}
	return null
}

async function downloadMdxFileOrDirectory(
	relativeMdxFileOrDirectory: string,
): Promise<{ entry: string; files: Array<GitHubFile> }> {
	const mdxFileOrDirectory = `content/blog/${relativeMdxFileOrDirectory}`

	const parentDir = nodePath.dirname(mdxFileOrDirectory)
	const dirList = await downloadDirList(parentDir)

	const basename = nodePath.basename(mdxFileOrDirectory)
	const mdxFileWithoutExt = nodePath.parse(mdxFileOrDirectory).name
	const potentials = dirList.filter(({ name }) => name.startsWith(basename))
	const exactMatch = potentials.find(
		({ name }) => nodePath.parse(name).name === mdxFileWithoutExt,
	)
	const dirPotential = potentials.find(({ type }) => type === 'dir')

	const content = await downloadFirstMdxFile(
		exactMatch ? [exactMatch] : potentials,
	)
	let files: Array<GitHubFile> = []
	let entry = mdxFileOrDirectory
	if (content) {
		entry = mdxFileOrDirectory.endsWith('.mdx')
			? mdxFileOrDirectory
			: `${mdxFileOrDirectory}.mdx`
		files = [
			{
				path: safePath(nodePath.join(mdxFileOrDirectory, 'index.mdx')),
				content,
			},
		]
	} else if (dirPotential) {
		entry = dirPotential.path
		files = await downloadDirectory(mdxFileOrDirectory)
	}

	return { entry, files }
}

async function downloadDirectory(dir: string): Promise<Array<GitHubFile>> {
	const dirList = await downloadDirList(dir)

	const result = await Promise.all(
		dirList.map(async ({ path: fileDir, type, sha }) => {
			switch (type) {
				case 'file': {
					const content = await downloadFileBySha(sha)
					return { path: safePath(fileDir), content }
				}
				case 'dir': {
					return downloadDirectory(fileDir)
				}
				default: {
					throw new Error(`Unexpected repo file type: ${type}`)
				}
			}
		}),
	)

	return result.flat()
}

async function downloadFileBySha(sha: string) {
	const { data } = await octokit.git.getBlob({
		owner: OWNER,
		repo: REPO,
		file_sha: sha,
	})
	const encoding = data.encoding as BufferEncoding
	return Buffer.from(data.content, encoding).toString()
}

async function downloadDirList(path: string) {
	const resp = await octokit.repos.getContent({
		owner: OWNER,
		repo: REPO,
		path,
		ref: REF,
	})
	const data = resp.data

	if (!Array.isArray(data)) {
		throw new Error(
			`Tried to download content from ${path}. GitHub did not return an array of files.`,
		)
	}

	return data
}

export { downloadMdxFileOrDirectory, downloadDirList }

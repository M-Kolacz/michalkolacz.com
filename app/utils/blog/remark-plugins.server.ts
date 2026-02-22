import remarkEmbedder, { type TransformerInfo } from '@remark-embedder/core'
import oembedTransformer from '@remark-embedder/transformer-oembed'
import type { Pluggable } from 'unified'

function handleEmbedderError({ url }: { url: string }) {
	console.error(`Failed to embed: ${url}`)
	return `<p>Failed to embed: <a href="${url}">${url}</a></p>`
}

function handleEmbedderHtml(html: string, info: TransformerInfo) {
	const { url } = info
	if (url.includes('youtube.com') || url.includes('youtu.be')) {
		return `<div style="aspect-ratio: 16/9; width: 100%">${html}</div>`
	}
	return html
}

const remarkPlugins: Pluggable[] = [
	[
		remarkEmbedder,
		{
			handleError: handleEmbedderError,
			handleHTML: handleEmbedderHtml,
			transformers: [oembedTransformer],
		},
	],
]

export { remarkPlugins }

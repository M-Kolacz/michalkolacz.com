import rehypeShiki from '@shikijs/rehype'
import { visit } from 'unist-util-visit'
import type { Pluggable } from 'unified'
import type { Root, Element } from 'hast'

function trimCodeBlocks() {
	return function (tree: Root) {
		visit(tree, 'element', (node: Element) => {
			if (node.tagName !== 'pre') return
			const codeEl = node.children.find(
				(child): child is Element =>
					child.type === 'element' && child.tagName === 'code',
			)
			if (!codeEl) return
			for (const child of codeEl.children) {
				if (child.type === 'text') {
					child.value = child.value.trim()
				}
			}
		})
	}
}

const rehypePlugins: Pluggable[] = [
	[
		rehypeShiki,
		{
			themes: {
				light: 'github-light',
				dark: 'github-dark',
			},
			defaultColor: 'light',
			langs: [
				'typescript',
				'javascript',
				'tsx',
				'jsx',
				'json',
				'bash',
				'css',
				'html',
			],
		},
	],
	trimCodeBlocks,
]

export { rehypePlugins }

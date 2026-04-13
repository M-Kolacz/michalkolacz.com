import { readFile } from 'node:fs/promises'
import { type StorybookConfig } from '@storybook/react-vite'
import { init, parse } from 'es-module-lexer'
import { transform } from 'esbuild'
import { mergeConfig, type Plugin } from 'vite'

const SERVER_RE = /\.server(\.[cm]?[jt]sx?)?($|\?)/
const STUB_SUFFIX = '?storybook-server-stub'

function stubServerModules(): Plugin {
	return {
		name: 'storybook-stub-server-modules',
		enforce: 'pre',
		async resolveId(source, importer) {
			if (source.endsWith(STUB_SUFFIX)) return source
			if (!SERVER_RE.test(source)) return null
			const resolved = await this.resolve(source, importer, { skipSelf: true })
			if (!resolved || resolved.external) return resolved
			return { id: resolved.id + STUB_SUFFIX, moduleSideEffects: false }
		},
		async load(id) {
			if (!id.endsWith(STUB_SUFFIX)) return null
			const realPath = id.slice(0, -STUB_SUFFIX.length)
			const source = await readFile(realPath, 'utf8')
			const { code } = await transform(source, {
				loader: realPath.endsWith('x') ? 'tsx' : 'ts',
				format: 'esm',
			})
			await init
			const [, exports] = parse(code)
			const lines: string[] = []
			for (const exp of exports) {
				if (exp.n === 'default') lines.push(`export default () => {}`)
				else lines.push(`export const ${exp.n} = () => {}`)
			}
			return lines.join('\n')
		},
	}
}

const config: StorybookConfig = {
	stories: ['../app/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
	addons: [
		'@chromatic-com/storybook',
		'@storybook/addon-vitest',
		'@storybook/addon-a11y',
		'@storybook/addon-docs',
		'@storybook/addon-onboarding',
	],
	framework: '@storybook/react-vite',
	viteFinal(config) {
		return mergeConfig(config, { plugins: [stubServerModules()] })
	},
}
export default config

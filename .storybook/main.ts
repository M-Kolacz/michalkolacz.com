import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { type StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'

const dirname = path.dirname(fileURLToPath(import.meta.url))

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
		return mergeConfig(config, {
			resolve: {
				alias: [
					{
						find: '#app/utils/blog/pipeline.server.ts',
						replacement: path.resolve(
							dirname,
							'./mocks/blog-pipeline.server.ts',
						),
					},
				],
			},
		})
	},
}
export default config

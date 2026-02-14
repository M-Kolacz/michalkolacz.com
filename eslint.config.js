import { default as defaultConfig } from '@epic-web/config/eslint'
import storybook from 'eslint-plugin-storybook'

/** @type {import("eslint").Linter.Config} */
export default [
	...defaultConfig,
	...storybook.configs['flat/recommended'],
	// add custom config objects here:
	{
		files: ['**/tests/**/*.ts'],
		rules: { 'react-hooks/rules-of-hooks': 'off' },
	},
	{
		files: ['**/.storybook/**/*'],
		languageOptions: {
			parserOptions: {
				projectService: {
					allowDefaultProject: ['.storybook/*.ts'],
				},
			},
		},
	},
	{
		ignores: ['.react-router/*'],
	},
]

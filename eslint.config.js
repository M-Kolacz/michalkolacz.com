import importPlugin from 'eslint-plugin-import-x'
import jestDom from 'eslint-plugin-jest-dom'
import playwright from 'eslint-plugin-playwright'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import storybook from 'eslint-plugin-storybook'
import testingLibrary from 'eslint-plugin-testing-library'
import globals from 'globals'
import * as tseslint from 'typescript-eslint'
import vitest from '@vitest/eslint-plugin'

const ERROR = 'error'
const WARN = 'warn'

const vitestFiles = ['**/__tests__/**/*', '**/*.test.*', '**/*.spec.*']
const testFiles = ['**/tests/**', '**/#tests/**', ...vitestFiles]
const playwrightFiles = ['**/tests/e2e/**']

/** @type {import("eslint").Linter.Config} */
export default [
	{
		ignores: [
			'**/.cache/**',
			'**/node_modules/**',
			'**/build/**',
			'**/public/**',
			'**/*.json',
			'**/playwright-report/**',
			'**/server-build/**',
			'**/dist/**',
			'**/coverage/**',
			'**/*.tsbuildinfo',
			'**/.react-router/**',
			'**/.wrangler/**',
			'**/worker-configuration.d.ts',
		],
	},

	// all files
	{
		plugins: {
			import: importPlugin,
		},
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		rules: {
			'no-unexpected-multiline': ERROR,
			'no-warning-comments': [
				ERROR,
				{ terms: ['FIXME'], location: 'anywhere' },
			],
			'import/no-duplicates': [WARN, { 'prefer-inline': true }],
			'import/order': [
				WARN,
				{
					alphabetize: { order: 'asc', caseInsensitive: true },
					pathGroups: [{ pattern: '#*/**', group: 'internal' }],
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
					],
				},
			],
		},
	},

	// JSX/TSX files
	{
		files: ['**/*.tsx', '**/*.jsx'],
		plugins: {
			react,
		},
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				jsx: true,
			},
		},
		rules: {
			'react/jsx-key': WARN,
		},
	},

	// react-hook rules are applicable in ts/js/tsx/jsx
	{
		files: ['**/*.ts?(x)', '**/*.js?(x)'],
		plugins: {
			'react-hooks': reactHooks,
		},
		rules: {
			'react-hooks/rules-of-hooks': ERROR,
			'react-hooks/exhaustive-deps': WARN,
		},
	},

	// JS and JSX files
	{
		files: ['**/*.js?(x)'],
		rules: {
			'no-undef': ERROR,
			'no-unused-vars': [
				WARN,
				{
					args: 'after-used',
					argsIgnorePattern: '^_',
					ignoreRestSiblings: true,
					varsIgnorePattern: '^ignored',
				},
			],
		},
	},

	// TS and TSX files
	{
		files: ['**/*.ts?(x)'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				projectService: true,
			},
		},
		plugins: {
			'@typescript-eslint': tseslint.plugin,
		},
		rules: {
			'@typescript-eslint/no-unused-vars': [
				WARN,
				{
					args: 'after-used',
					argsIgnorePattern: '^_',
					ignoreRestSiblings: true,
					varsIgnorePattern: '^ignored',
				},
			],
			'import/consistent-type-specifier-style': [WARN, 'prefer-inline'],
			'@typescript-eslint/consistent-type-imports': [
				WARN,
				{
					prefer: 'type-imports',
					disallowTypeAnnotations: true,
					fixStyle: 'inline-type-imports',
				},
			],
			'@typescript-eslint/no-misused-promises': [
				'error',
				{ checksVoidReturn: false },
			],
			'@typescript-eslint/no-floating-promises': 'error',
		},
	},

	// Restrict test file imports in source files
	{
		files: ['**/*.ts?(x)', '**/*.js?(x)'],
		ignores: testFiles,
		rules: {
			'no-restricted-imports': [
				ERROR,
				{
					patterns: [
						{
							group: testFiles,
							message: 'Do not import test files in source files',
						},
					],
				},
			],
		},
	},

	// Testing Library
	{
		files: testFiles,
		ignores: [...playwrightFiles],
		plugins: {
			'testing-library': testingLibrary,
		},
		rules: {
			'testing-library/no-unnecessary-act': [ERROR, { isStrict: false }],
			'testing-library/no-wait-for-side-effects': ERROR,
			'testing-library/prefer-find-by': ERROR,
		},
	},

	// Jest DOM
	{
		files: testFiles,
		ignores: [...playwrightFiles],
		plugins: {
			'jest-dom': jestDom,
		},
		rules: {
			'jest-dom/prefer-checked': ERROR,
			'jest-dom/prefer-enabled-disabled': ERROR,
			'jest-dom/prefer-focus': ERROR,
			'jest-dom/prefer-required': ERROR,
		},
	},

	// Vitest
	{
		files: testFiles,
		ignores: [...playwrightFiles],
		plugins: {
			vitest,
		},
		rules: {
			'vitest/no-focused-tests': [WARN, { fixable: false }],
			'vitest/no-import-node-test': ERROR,
			'vitest/prefer-comparison-matcher': ERROR,
			'vitest/prefer-equality-matcher': ERROR,
			'vitest/prefer-to-be': ERROR,
			'vitest/prefer-to-contain': ERROR,
			'vitest/prefer-to-have-length': ERROR,
			'vitest/valid-expect-in-promise': ERROR,
			'vitest/valid-expect': ERROR,
		},
	},

	// Playwright
	{
		files: [...playwrightFiles],
		plugins: {
			playwright,
		},
		rules: {
			'playwright/max-nested-describe': ERROR,
			'playwright/missing-playwright-await': ERROR,
			'playwright/no-focused-test': WARN,
			'playwright/no-page-pause': ERROR,
			'playwright/no-raw-locators': [WARN, { allowed: ['iframe'] }],
			'playwright/no-slowed-test': ERROR,
			'playwright/no-standalone-expect': ERROR,
			'playwright/no-unsafe-references': ERROR,
			'playwright/prefer-comparison-matcher': ERROR,
			'playwright/prefer-equality-matcher': ERROR,
			'playwright/prefer-native-locators': ERROR,
			'playwright/prefer-to-be': ERROR,
			'playwright/prefer-to-contain': ERROR,
			'playwright/prefer-to-have-count': ERROR,
			'playwright/prefer-to-have-length': ERROR,
			'playwright/prefer-web-first-assertions': ERROR,
			'playwright/valid-expect-in-promise': ERROR,
			'playwright/valid-expect': ERROR,
		},
	},

	// Storybook
	...storybook.configs['flat/recommended'],

	// Custom overrides
	{
		files: ['**/tests/**/*.ts'],
		rules: { 'react-hooks/rules-of-hooks': 'off' },
	},
	{
		ignores: ['.react-router/*', 'storybook-static/*'],
	},
]

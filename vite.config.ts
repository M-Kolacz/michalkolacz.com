import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { codecovVitePlugin } from '@codecov/vite-plugin'
import { reactRouter } from '@react-router/dev/vite'
import {
	type SentryReactRouterBuildOptions,
	sentryReactRouter,
} from '@sentry/react-router'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import tailwindcss from '@tailwindcss/vite'
import { playwright } from '@vitest/browser-playwright'
import { reactRouterDevTools } from 'react-router-devtools'
import { defineConfig } from 'vite'
import { envOnlyMacros } from 'vite-env-only'
import { iconsSpritesheet } from 'vite-plugin-icons-spritesheet'

const dirname =
	typeof __dirname !== 'undefined'
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url))

const MODE = process.env.NODE_ENV
const IS_STORYBOOK = process.env.STORYBOOK === 'true'

export default defineConfig((config) => ({
	build: {
		target: 'es2022',
		cssMinify: MODE === 'production',

		rollupOptions: {
			input: config.isSsrBuild ? './server/app.ts' : undefined,
			external: [/node:.*/, 'fsevents'],
		},

		assetsInlineLimit: (source: string) => {
			if (
				source.endsWith('favicon.svg') ||
				source.endsWith('apple-touch-icon.png')
			) {
				return false
			}
		},

		sourcemap: true,
	},
	server: {
		watch: {
			ignored: ['**/playwright-report/**'],
		},
	},
	sentryConfig,
	plugins: [
		IS_STORYBOOK ? null : envOnlyMacros(),
		tailwindcss(),
		IS_STORYBOOK ? null : reactRouterDevTools(),

		iconsSpritesheet({
			inputDir: './other/svg-icons',
			outputDir: './app/components/ui/icons',
			fileName: 'sprite.svg',
			withTypes: true,
			iconNameTransformer: (name) => name,
		}),
		// it would be really nice to have this enabled in tests, but we'll have to
		// wait until https://github.com/remix-run/remix/issues/9871 is fixed
		MODE === 'test' || IS_STORYBOOK ? null : reactRouter(),
		MODE === 'production' && process.env.SENTRY_AUTH_TOKEN
			? sentryReactRouter(sentryConfig, config)
			: null,
		codecovVitePlugin({
			enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
			bundleName: 'michalkolacz.com',
			uploadToken: process.env.CODECOV_TOKEN,
		}),
	],
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: 'unit',
					include: ['./app/**/*.test.{ts,tsx}'],
					setupFiles: ['./tests/setup/setup-test-env.ts'],
					globalSetup: ['./tests/setup/global-setup.ts'],
					restoreMocks: true,
					coverage: {
						include: ['app/**/*.{ts,tsx}'],
						all: true,
					},
				},
			},
			{
				plugins: [
					storybookTest({
						configDir: path.join(dirname, '.storybook'),
					}),
				],
				optimizeDeps: {
					exclude: [
						'execa',
						'npm-run-path',
						'unicorn-magic',
					],
				},
				test: {
					name: 'storybook',
					browser: {
						enabled: true,
						headless: true,
						provider: playwright({}),
						instances: [{ browser: 'chromium' }],
					},
					setupFiles: ['.storybook/vitest.setup.ts'],
					globalSetup: [],
				},
			},
		],
	},
}))

const sentryConfig: SentryReactRouterBuildOptions = {
	authToken: process.env.SENTRY_AUTH_TOKEN,
	org: process.env.SENTRY_ORG,
	project: process.env.SENTRY_PROJECT,

	unstable_sentryVitePluginOptions: {
		release: {
			name: process.env.COMMIT_SHA,
			setCommits: {
				auto: true,
			},
		},
		sourcemaps: {
			filesToDeleteAfterUpload: ['./build/**/*.map'],
		},
	},
}

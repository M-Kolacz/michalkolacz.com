import { defineConfig } from '@playwright/test'

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:6006'

export default defineConfig({
	testDir: './tests',
	outputDir: './tests/__failed-snapshots__',
	fullyParallel: true,
	snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
	reporter: 'list',
	use: {
		baseURL: BASE_URL,
	},
	webServer: {
		command: 'npx http-server storybook-static -p 6006 --silent',
		url: BASE_URL,
		reuseExistingServer: !process.env.CI,
	},
})

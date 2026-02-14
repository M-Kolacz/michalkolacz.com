import { type Decorator } from '@storybook/react-vite'
import { createRoutesStub } from 'react-router'
import { AppShell } from '#app/components/app-shell.tsx'

const AppShellWrapper = () => <AppShell theme="light" />

const mockRootLoaderData = {
	user: null,
	requestInfo: {
		hints: { theme: 'light' as const, timeZone: 'UTC' },
		origin: 'http://localhost:6006',
		path: '/',
		userPrefs: { theme: 'light' as const },
	},
	ENV: {},
	toast: null,
	honeyProps: {
		nameFieldName: 'name__confirm',
		validFromFieldName: 'from__confirm',
		encryptedValidFrom: '',
	},
}

export const withAppShell: Decorator = (Story) => {
	const Stub = createRoutesStub([
		{
			id: 'root',
			path: '/',
			Component: AppShellWrapper,
			loader: () => mockRootLoaderData,
			children: [
				{
					index: true,
					Component: Story,
				},
			],
		},
	])

	return <Stub />
}

import { type Decorator } from '@storybook/react-vite'
import { createRoutesStub, type LoaderFunction } from 'react-router'
import AppLayout from '../app/routes/_layout.tsx'

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

export const withAppShell: Decorator = (Story, context) => {
	const childLoader = context.parameters?.loader as LoaderFunction | undefined
	const Stub = createRoutesStub([
		{
			id: 'root',
			path: '/',
			Component: AppLayout,
			loader: () => mockRootLoaderData,
			children: [
				{
					index: true,
					Component: Story,
					loader: childLoader,
				},
			],
		},
	])

	return <Stub />
}

import { type Meta, type StoryObj } from '@storybook/react-vite'
import { createRoutesStub } from 'react-router'
import { GeneralErrorBoundary } from './error-boundary'

const meta = {
	title: 'Components/GeneralErrorBoundary',
	component: GeneralErrorBoundary,
} satisfies Meta<typeof GeneralErrorBoundary>

export default meta
type Story = StoryObj<typeof meta>

export const DefaultHttpError: Story = {
	render: () => {
		const Stub = createRoutesStub([
			{
				path: '/',
				ErrorBoundary: GeneralErrorBoundary,
				loader: () => {
					throw new Response('Page Not Found', { status: 404 })
				},
				Component: () => null,
			},
		])
		return <Stub initialEntries={['/']} />
	},
}

export const CustomStatusHandler: Story = {
	render: () => {
		const CustomBoundary = () => (
			<GeneralErrorBoundary
				statusHandlers={{
					403: () => <p>You are not authorized to view this page.</p>,
				}}
			/>
		)

		const Stub = createRoutesStub([
			{
				path: '/',
				ErrorBoundary: CustomBoundary,
				loader: () => {
					throw new Response('Forbidden', { status: 403 })
				},
				Component: () => null,
			},
		])
		return <Stub initialEntries={['/']} />
	},
}

export const UnexpectedError: Story = {
	render: () => {
		const Stub = createRoutesStub([
			{
				path: '/',
				ErrorBoundary: GeneralErrorBoundary,
				loader: () => {
					throw new Error('Something went terribly wrong')
				},
				Component: () => null,
			},
		])
		return <Stub initialEntries={['/']} />
	},
}

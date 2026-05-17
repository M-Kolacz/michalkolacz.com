import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { SearchBar } from './search-bar'

const meta = {
	title: 'Components/SearchBar',
	component: SearchBar,
	parameters: { layout: 'centered' },
	args: { status: 'idle' },
} satisfies Meta<typeof SearchBar>

export default meta
type Story = StoryObj<typeof meta>

export const Idle: Story = {
	args: { status: 'idle' },
}

export const Pending: Story = {
	args: { status: 'pending' },
}

export const PreFilled: Story = {
	args: { status: 'idle' },
	parameters: {
		router: { initialEntries: ['/?search=hello'] },
	},
}

export const Interaction: Story = {
	args: { status: 'idle' },
	parameters: {
		router: {
			siblingRoutes: [{ path: '/users', Component: () => <h1>Users page</h1> }],
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole('searchbox')

		await userEvent.clear(input)
		await userEvent.type(input, 'epic web')
		await expect(input).toHaveValue('epic web')

		const submitButton = canvas.getByRole('button', { name: /search/i })
		await userEvent.click(submitButton)
	},
}

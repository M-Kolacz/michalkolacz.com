import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Field } from './forms'
import { invariant } from '@epic-web/invariant'

const meta = {
	title: 'Components/Forms/Field',
	component: Field,
	parameters: { layout: 'centered' },
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		labelProps: { children: 'Email' },
		inputProps: { type: 'email', placeholder: 'you@example.com' },
	},
}

export const WithErrors: Story = {
	args: {
		labelProps: { children: 'Email' },
		inputProps: {
			type: 'email',
			id: 'email-field',
			placeholder: 'you@example.com',
		},
		errors: ['Invalid email address'],
	},
	play: async ({ canvasElement }) => {
		// Arrange
		const canvas = within(canvasElement)
		const input = canvas.getByRole('textbox')
		const errorList = canvas.getByText('Invalid email address').closest('ul')
		invariant(
			errorList,
			'Expected error list <ul> to be rendered when errors are provided',
		)

		// Assert
		await expect(input).toHaveAttribute('aria-describedby', errorList.id)
	},
}

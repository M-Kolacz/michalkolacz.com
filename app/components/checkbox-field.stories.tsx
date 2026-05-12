import { useForm } from '@conform-to/react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { CheckboxField } from './forms'

function CheckboxFieldWrapper({
	defaultChecked = false,
	errors,
}: {
	defaultChecked?: boolean
	errors?: string[]
}) {
	const [, fields] = useForm({ id: 'checkbox-story-form' })

	return (
		<CheckboxField
			labelProps={{ children: 'I agree to the terms' }}
			buttonProps={{
				name: fields.agreedToTerms?.name ?? 'agreedToTerms',
				form: 'checkbox-story-form',
				key: fields.agreedToTerms?.key,
				defaultChecked,
			}}
			errors={errors}
		/>
	)
}

const meta = {
	title: 'Components/Forms/CheckboxField',
	component: CheckboxFieldWrapper,
	parameters: { layout: 'centered' },
} satisfies Meta<typeof CheckboxFieldWrapper>

export default meta
type Story = StoryObj<typeof meta>

export const Unchecked: Story = {
	args: { defaultChecked: false },
}

export const Checked: Story = {
	args: { defaultChecked: true },
}

export const WithErrors: Story = {
	args: { errors: ['You must agree to continue'] },
}

export const Interaction: Story = {
	name: 'Interaction – check and uncheck',
	args: {},
	play: async ({ canvasElement }) => {
		// Arrange
		const canvas = within(canvasElement)
		const checkbox = canvas.getByRole('checkbox')
		await expect(checkbox).toHaveAttribute('aria-checked', 'false')

		// Act
		await userEvent.click(checkbox)

		// Assert
		await expect(checkbox).toHaveAttribute('aria-checked', 'true')

		// Act
		await userEvent.click(checkbox)

		// Assert
		await expect(checkbox).toHaveAttribute('aria-checked', 'false')
	},
}

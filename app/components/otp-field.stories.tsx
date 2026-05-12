import { type Meta, type StoryObj } from '@storybook/react-vite'
import { OTPField } from './forms'

const meta = {
	title: 'Components/Forms/OTPField',
	component: OTPField,
	parameters: { layout: 'padded' },
} satisfies Meta<typeof OTPField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		labelProps: { children: 'Verification code' },
		inputProps: {},
	},
}

export const WithErrors: Story = {
	args: {
		labelProps: { children: 'Verification code' },
		inputProps: {},
		errors: ['Code is invalid'],
	},
}

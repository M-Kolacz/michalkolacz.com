import { type Meta, type StoryObj } from '@storybook/react-vite'
import { TextareaField } from './forms'

const meta = {
	title: 'Components/Forms/TextareaField',
	component: TextareaField,
	parameters: { layout: 'padded' },
} satisfies Meta<typeof TextareaField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
	args: {
		labelProps: { children: 'Message' },
		textareaProps: { placeholder: 'Type your message…' },
	},
}

export const WithErrors: Story = {
	args: {
		labelProps: { children: 'Message' },
		textareaProps: { placeholder: 'Type your message…' },
		errors: ['Message is too short'],
	},
}

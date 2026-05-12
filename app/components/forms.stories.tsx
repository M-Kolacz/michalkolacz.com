import { useForm } from '@conform-to/react'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import {
	CheckboxField,
	ErrorList,
	Field,
	OTPField,
	TextareaField,
} from './forms'

// ---------------------------------------------------------------------------
// ErrorList
// ---------------------------------------------------------------------------

const errorListMeta = {
	title: 'Components/Forms',
	component: ErrorList,
	parameters: { layout: 'padded' },
} satisfies Meta<typeof ErrorList>

export default errorListMeta
type ErrorListStory = StoryObj<typeof errorListMeta>

export const ErrorListEmpty: ErrorListStory = {
	name: 'ErrorList – no errors',
	args: { errors: [] },
}

export const ErrorListSingle: ErrorListStory = {
	name: 'ErrorList – one error',
	args: { errors: ['This field is required'] },
}

export const ErrorListMultiple: ErrorListStory = {
	name: 'ErrorList – multiple errors',
	args: { errors: ['Too short', 'Must contain a number'] },
}

// ---------------------------------------------------------------------------
// Field
// ---------------------------------------------------------------------------

type FieldStory = StoryObj<typeof Field>

export const FieldDefault: FieldStory = {
	name: 'Field – default',
	render: () => (
		<Field
			labelProps={{ children: 'Email' }}
			inputProps={{ type: 'email', placeholder: 'you@example.com' }}
		/>
	),
}

export const FieldWithErrors: FieldStory = {
	name: 'Field – with errors',
	render: () => (
		<Field
			labelProps={{ children: 'Email' }}
			inputProps={{ type: 'email', id: 'email-field', placeholder: 'you@example.com' }}
			errors={['Invalid email address']}
		/>
	),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const input = canvas.getByRole('textbox')
		const errorList = canvas.getByText('Invalid email address').closest('ul')
		await expect(input).toHaveAttribute('aria-describedby', errorList?.id)
	},
}

// ---------------------------------------------------------------------------
// TextareaField
// ---------------------------------------------------------------------------

type TextareaFieldStory = StoryObj<typeof TextareaField>

export const TextareaFieldDefault: TextareaFieldStory = {
	name: 'TextareaField – default',
	render: () => (
		<TextareaField
			labelProps={{ children: 'Message' }}
			textareaProps={{ placeholder: 'Type your message…' }}
		/>
	),
}

export const TextareaFieldWithErrors: TextareaFieldStory = {
	name: 'TextareaField – with errors',
	render: () => (
		<TextareaField
			labelProps={{ children: 'Message' }}
			textareaProps={{ placeholder: 'Type your message…' }}
			errors={['Message is too short']}
		/>
	),
}

// ---------------------------------------------------------------------------
// OTPField
// ---------------------------------------------------------------------------

type OTPFieldStory = StoryObj<typeof OTPField>

export const OTPFieldDefault: OTPFieldStory = {
	name: 'OTPField – default',
	render: () => (
		<OTPField
			labelProps={{ children: 'Verification code' }}
			inputProps={{}}
		/>
	),
}

export const OTPFieldWithErrors: OTPFieldStory = {
	name: 'OTPField – with errors',
	render: () => (
		<OTPField
			labelProps={{ children: 'Verification code' }}
			inputProps={{}}
			errors={['Code is invalid']}
		/>
	),
}

// ---------------------------------------------------------------------------
// CheckboxField — requires a wrapper that provides conform form context
// ---------------------------------------------------------------------------

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

type CheckboxFieldStory = StoryObj<typeof CheckboxFieldWrapper>

export const CheckboxUnchecked: CheckboxFieldStory = {
	name: 'CheckboxField – unchecked',
	render: () => <CheckboxFieldWrapper />,
}

export const CheckboxChecked: CheckboxFieldStory = {
	name: 'CheckboxField – checked',
	render: () => <CheckboxFieldWrapper defaultChecked />,
}

export const CheckboxWithErrors: CheckboxFieldStory = {
	name: 'CheckboxField – with errors',
	render: () => <CheckboxFieldWrapper errors={['You must agree to continue']} />,
}

export const CheckboxInteraction: CheckboxFieldStory = {
	name: 'CheckboxField – check/uncheck interaction',
	render: () => <CheckboxFieldWrapper />,
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement)
		const checkbox = canvas.getByRole('button')

		await expect(checkbox).toHaveAttribute('aria-checked', 'false')
		await userEvent.click(checkbox)
		await expect(checkbox).toHaveAttribute('aria-checked', 'true')
		await userEvent.click(checkbox)
		await expect(checkbox).toHaveAttribute('aria-checked', 'false')
	},
}

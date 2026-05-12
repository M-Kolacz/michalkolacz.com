import { type Meta, type StoryObj } from '@storybook/react-vite'
import { ErrorList } from './forms'

const meta = {
	title: 'Components/Forms/ErrorList',
	component: ErrorList,
	parameters: { layout: 'centered' },
} satisfies Meta<typeof ErrorList>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = {
	args: { errors: [] },
}

export const Single: Story = {
	args: { errors: ['This field is required'] },
}

export const Multiple: Story = {
	args: { errors: ['Too short', 'Must contain a number'] },
}

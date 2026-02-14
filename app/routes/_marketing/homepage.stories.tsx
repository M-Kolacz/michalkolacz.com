import { type Meta, type StoryObj } from '@storybook/react-vite'
import Homepage from './index.tsx'

const meta = {
	title: 'Pages/Homepage',
	component: Homepage,
} satisfies Meta<typeof Homepage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

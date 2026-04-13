import { type Meta, type StoryObj } from '@storybook/react-vite'
import Homepage from './index.tsx'

const meta: Meta<typeof Homepage> = {
	title: 'Pages/Homepage',
	component: Homepage,
	parameters: {
		loader: () => ({
			posts: [
				{
					slug: 'visual-regression-testing',
					title: 'Visual Regression Testing with Storybook and Playwright',
					description:
						'A practical guide to catching visual bugs before they ship, using the setup that powers this very site.',
					date: '2026-03-15T00:00:00.000Z',
					readingTime: '8 min read',
					bannerImage: null,
					bannerAlt: null,
				},
			],
		}),
	},
}

export default meta
type Story = StoryObj<typeof Homepage>

export const Default: Story = {}

export const Empty: Story = {
	parameters: {
		loader: () => ({ posts: [] }),
	},
}

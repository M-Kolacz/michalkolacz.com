import { type Meta, type StoryObj } from '@storybook/react-vite'
import { fn } from 'storybook/test'
import { Button } from '../../components/ui/button.tsx'
import Homepage from './index.tsx'
import { createRoutesStub } from 'react-router'
import { TranslationProvider } from '#app/utils/i18n/react.tsx'
import en from '#app/utils/i18n/translations/en.ts'

const meta = {
	title: 'Pages/Homepage',
	parameters: {
		layout: 'centered',
	},
	component: Homepage,
	tags: ['autodocs'],
	decorators: [
		(Story) => {
			let Stub = createRoutesStub([
				{
					path: '/',
					Component: Story,
				},
			])

			return (
				<TranslationProvider
					fallbackLocale={['en']}
					translations={{
						en,
					}}
				>
					<Stub />
				</TranslationProvider>
			)
		},
	],
} satisfies Meta<typeof Homepage>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

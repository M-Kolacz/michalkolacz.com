import { type Preview } from '@storybook/react-vite'
import { withAppShell } from './decorators.tsx'
import '../app/styles/tailwind.css'
import '../app/styles/font.css'

const preview: Preview = {
	parameters: {
		controls: {
			matchers: {
				color: /(background|color)$/i,
				date: /Date$/i,
			},
		},
		a11y: {
			test: 'todo',
		},
	},
	decorators: [
		(Story, context) => {
			document.documentElement.classList.add('light')
			document.body.classList.add('bg-background', 'text-foreground')

			if (context.title.toLowerCase().includes('pages')) {
				return withAppShell(Story, context)
			}

			return Story()
		},
	],
}

export default preview

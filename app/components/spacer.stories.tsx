import { type Meta, type StoryObj } from '@storybook/react-vite'
import { options, Spacer } from './spacer'

const meta = {
	title: 'Components/Spacer',
	component: Spacer,
	parameters: {
		layout: 'padded',
	},
	tags: ['autodocs'],
} satisfies Meta<typeof Spacer>

export default meta
type Story = StoryObj<typeof meta>

export const AllSizes: Story = {
	args: { size: '4xs' },
	render: () => (
		<>
			{(Object.keys(options) as Array<keyof typeof options>).map((size) => (
				<div key={size}>
					<span className="text-muted-foreground text-sm">{size}</span>
					<Spacer size={size} />
				</div>
			))}
		</>
	),
}

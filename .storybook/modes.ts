export const VIEWPORTS_DIMENSIONS = {
	Desktop: {
		width: 1440,
		height: 1024,
	},
	Tablet: {
		width: 1024,
		height: 1366,
	},
	Mobile: {
		width: 360,
		height: 800,
	},
} as const

export const STORYBOOK_VIEWPORTS = {
	Desktop: {
		name: 'Desktop',
		styles: {
			width: `${VIEWPORTS_DIMENSIONS.Desktop.width}px`,
			height: `${VIEWPORTS_DIMENSIONS.Desktop.height}px`,
		},
	},
	Tablet: {
		name: 'Tablet',
		styles: {
			width: `${VIEWPORTS_DIMENSIONS.Tablet.width}px`,
			height: `${VIEWPORTS_DIMENSIONS.Tablet.height}px`,
		},
	},
	Mobile: {
		name: 'Mobile',
		styles: {
			width: `${VIEWPORTS_DIMENSIONS.Mobile.width}px`,
			height: `${VIEWPORTS_DIMENSIONS.Mobile.height}px`,
		},
	},
} as const

export const allModes = {
	[STORYBOOK_VIEWPORTS.Mobile.name]: {
		viewport: STORYBOOK_VIEWPORTS.Mobile.name,
	},
	[STORYBOOK_VIEWPORTS.Tablet.name]: {
		viewport: STORYBOOK_VIEWPORTS.Tablet.name,
	},
	[STORYBOOK_VIEWPORTS.Desktop.name]: {
		viewport: STORYBOOK_VIEWPORTS.Desktop.name,
	},
} as const

export const avaiableModes = {
	viewport: {
		Mobile: allModes['Mobile'],
		Tablet: allModes['Tablet'],
		Desktop: allModes['Desktop'],
	},
} as const

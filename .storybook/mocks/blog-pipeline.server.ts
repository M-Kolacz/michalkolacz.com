function unreachable(name: string): never {
	throw new Error(
		`"${name}" from blog/pipeline.server was called inside Storybook. ` +
			`Provide loader data via story parameters instead.`,
	)
}

export function getBlog() {
	unreachable('getBlog')
}

export function createBlogPipeline() {
	unreachable('createBlogPipeline')
}

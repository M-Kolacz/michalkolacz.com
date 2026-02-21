import { getMDXComponent } from 'mdx-bundler/client'
import { useMemo } from 'react'
import { cn } from '#app/utils/misc.tsx'

const mdxComponentCache = new Map<
	string,
	ReturnType<typeof getMdxComponent>
>()

function getMdxComponent(code: string) {
	const Component = getMDXComponent(code)
	function MdxComponent({
		components,
		...rest
	}: Parameters<typeof Component>['0']) {
		return (
			<Component components={{ ...mdxComponents, ...components }} {...rest} />
		)
	}
	return MdxComponent
}

export function useMdxComponent(code: string) {
	return useMemo(() => {
		if (mdxComponentCache.has(code)) {
			return mdxComponentCache.get(code)!
		}
		const component = getMdxComponent(code)
		mdxComponentCache.set(code, component)
		return component
	}, [code])
}

function Callout({
	children,
	variant = 'info',
}: {
	children: React.ReactNode
	variant?: 'info' | 'warning' | 'danger' | 'success'
}) {
	return (
		<div
			className={cn(
				'my-6 rounded-lg border-l-4 p-4',
				variant === 'info' && 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
				variant === 'warning' &&
					'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30',
				variant === 'danger' &&
					'border-red-500 bg-red-50 dark:bg-red-950/30',
				variant === 'success' &&
					'border-green-500 bg-green-50 dark:bg-green-950/30',
			)}
		>
			{children}
		</div>
	)
}

const mdxComponents = {
	Callout,
}

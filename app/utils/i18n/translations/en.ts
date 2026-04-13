import { type LanguageMessages } from '../lib'

export default {
	locale: 'en',
	homepage: {
		hero: {
			heading: "Hi, I'm Michał 👋",
			subheading:
				'Software engineer based in Kraków, building web applications with React, TypeScript, and Node.js.',
			imageAlt: 'Michał Kołacz',
		},
		intro: {
			body: "I'm a frontend-focused full-stack engineer who cares about shipping accessible, well-tested, and maintainable products. I work across the stack — from component design systems and testing infrastructure to API design and deployment pipelines — and I enjoy turning fuzzy product ideas into production-ready features. This site is where I write about the engineering problems I run into and the approaches I use to solve them.",
		},
		latestPosts: {
			heading: 'Latest posts',
			empty: 'No posts yet. Check back soon.',
			viewAll: 'View all posts',
		},
	},
} as const satisfies LanguageMessages

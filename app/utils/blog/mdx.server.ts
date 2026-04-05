import { bundleMDX } from 'mdx-bundler'
import readingTime from 'reading-time'
import remarkGfm from 'remark-gfm'
import {
	BlogPostFrontmatterSchema,
	type BlogPostFrontmatter,
} from './blog.schema.ts'

export type CompiledBlogPost = {
	code: string
	frontmatter: BlogPostFrontmatter
	readingTime: string
}

export async function compileMdxPost(
	slug: string,
	source: string,
): Promise<CompiledBlogPost> {
	const { code, frontmatter: rawFrontmatter } = await bundleMDX({
		source,
		mdxOptions(options) {
			options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm]
			return options
		},
	})

	const result = BlogPostFrontmatterSchema.safeParse(rawFrontmatter)
	if (!result.success) {
		throw new Error(
			`Invalid frontmatter in blog post "${slug}": ${result.error.message}`,
		)
	}

	const stats = readingTime(source)

	return {
		code,
		frontmatter: result.data,
		readingTime: stats.text,
	}
}

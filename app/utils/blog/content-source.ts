export interface BlogContentSource {
	getSlugs(): Promise<string[]>
	getContent(slug: string): Promise<string>
	getImageUrl(slug: string, imagePath: string): string
}

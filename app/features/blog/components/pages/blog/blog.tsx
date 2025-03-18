import { useLoaderData, type MetaFunction } from "react-router";
import { ArticleCard } from "#blog/components/molecules";
import { blogCache } from "#blog/utils/cache.server.ts";
import { Post } from "#blog/types/blog.ts";
import { getBlogPosts } from "#blog/utils/blog.server.ts";

export const meta: MetaFunction = () => {
  return [
    { title: "michalkolacz.com | Blog" },
    { name: "description", content: "michalkolacz.com blog" },
  ];
};

export const loader = async () => {
  const cachedPosts = blogCache.get<Omit<Post, "code">[]>("posts");
  if (cachedPosts)
    return {
      posts: cachedPosts,
    };
  const posts = await getBlogPosts();
  blogCache.set("posts", posts);
  return {
    posts,
  };
};

export default function HomePage() {
  const { posts } = useLoaderData<typeof loader>();

  return (
    <>
      <div className="max-w-5xl mx-auto py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-8">
          Posts
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((article) => (
            <ArticleCard key={article.title} article={article} />
          ))}
        </div>
      </div>
    </>
  );
}

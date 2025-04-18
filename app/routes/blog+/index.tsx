import { useLoaderData, type MetaFunction } from "react-router";

import { ArticleCard } from "#app/components/molecules";
import { Post } from "#app/types/blog.ts";
import { getBlogPosts } from "#app/utils/blog.server.ts";
import { blogCache } from "#app/utils/cache.server.ts";
import { prisma } from "#app/utils/db.server.ts";

export const meta: MetaFunction = () => {
  return [
    { title: "michalkolacz.com | Blog" },
    { name: "description", content: "michalkolacz.com blog" },
  ];
};

export const loader = async () => {
  const cachedPosts = blogCache.get<Omit<Post, "code">[]>("posts");
  const countNumber = await prisma.user.count();
  const userImageNumber = await prisma.userImage.count();
  await prisma.user.findMany();
  console.log({ countNumber, userImageNumber });

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
          {posts.length === 0 && (
            <div className="text-center text-gray-500">No posts found</div>
          )}
        </div>
      </div>
    </>
  );
}

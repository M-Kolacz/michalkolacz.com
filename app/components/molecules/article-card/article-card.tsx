import { Link } from "react-router";

import { Button } from "#app/components/atoms";
import type { Post } from "#app/types/blog.ts";

interface ArticleCardProps {
  article: Pick<Post, "title" | "date" | "excerpt" | "slug">;
}

export const ArticleCard = ({ article }: ArticleCardProps) => {
  return (
    <article className="bg-white dark:bg-slate-900 rounded-lg shadow-soft p-6 transition-all hover:shadow-md">
      <h3 className="text-xl font-semibold mb-2 text-blue-800 dark:text-blue-400">
        {article.title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
        {new Date(article.date).toLocaleDateString()}
      </p>
      <p className="text-slate-700 dark:text-slate-300 mb-4">
        {article.excerpt}
      </p>
      <Link to={`/blog/${article.slug}`}>
        <Button variant="outline" size="sm">
          Read More
        </Button>
      </Link>
    </article>
  );
};

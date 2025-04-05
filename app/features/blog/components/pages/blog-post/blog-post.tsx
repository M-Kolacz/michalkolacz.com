import { MDXProvider } from "@mdx-js/react";
import { ArrowLeft } from "lucide-react";
import { getMDXComponent } from "mdx-bundler/client";
import { Link, LoaderFunctionArgs, useLoaderData } from "react-router";
import { type MetaFunction } from "react-router";

import { Button } from "#app/components/atoms";
import { GeneralErrorBoundary } from "#app/components/pages/error-boundary.tsx";
import { invariantResponse } from "#app/utils/invariant.ts";

import { Post } from "#app/features/blog/types/blog.ts";
import { getBlogPost } from "#app/features/blog/utils/blog.server.ts";
import { blogCache } from "#app/features/blog/utils/cache.server.ts";

export const meta: MetaFunction = ({ params }) => {
  const postTitle = params.postTitle;

  return [
    { title: `michalkolacz.com | ${postTitle}` },
    { name: "description", content: `michalkolacz.com blog post ${postTitle}` },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { postTitle } = params;

  invariantResponse(postTitle, "No post title provided", { status: 404 });

  const postCache = blogCache.get<Post>(`posts/${postTitle}`);

  if (postCache) return postCache;

  const post = await getBlogPost(postTitle);

  return post;
};

export default function BlogPost() {
  const { code, title, date } = useLoaderData<typeof loader>();

  const Component = getMDXComponent(code);

  return (
    <MDXProvider>
      <div className="max-w-3xl mx-auto py-12">
        <Link to="/blog">
          <Button
            variant="ghost"
            className="mb-6 pl-0 flex items-center gap-1 text-blue-700 dark:text-blue-400"
          >
            <ArrowLeft size={16} />
            Back to Blog Posts
          </Button>
        </Link>

        <article className="bg-white dark:bg-slate-900 rounded-lg shadow-soft p-8 md:p-12 transition-colors duration-300">
          <header className="mb-8 border-b border-slate-100 dark:border-slate-800 pb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-blue-300 mb-3">
              {title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </header>

          <div className="prose max-w-none dark:prose-invert">
            <Component
              components={{
                h1: (props) => (
                  <h1
                    className="text-3xl font-bold text-blue-900 dark:text-blue-300 my-4"
                    {...props}
                  />
                ),
                h2: (props) => (
                  <h2
                    className="text-2xl font-semibold text-blue-800 dark:text-blue-400 my-3"
                    {...props}
                  />
                ),
                h3: (props) => (
                  <h3
                    className="text-xl font-semibold text-blue-800 dark:text-blue-400 my-2"
                    {...props}
                  />
                ),
                p: (props) => (
                  <p
                    className="my-4 text-slate-700 dark:text-slate-300 leading-relaxed"
                    {...props}
                  />
                ),
                li: (props) => <li className="ml-6 list-disc" {...props} />,
                ul: (props) => <ul className="my-4" {...props} />,
                ol: (props) => <ol className="my-4" {...props} />,
                strong: (props) => <strong {...props} />,
                em: (props) => <em {...props} />,
              }}
            />
          </div>
        </article>
      </div>
    </MDXProvider>
  );
}

export const ErrorBoundary = () => <GeneralErrorBoundary />;

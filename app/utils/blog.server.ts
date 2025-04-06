import { bundleMDX } from "mdx-bundler";

import { blogCache } from "#app/utils/cache.server.ts";
import { octokit } from "#app/utils/github.server.ts";
import { invariantResponse } from "#app/utils/invariant.ts";

export const getBlogPosts = async () => {
  const octokitResult = await octokit.repos.getContent({
    owner: "M-Kolacz",
    repo: "michalkolacz.com",
    path: "posts",
  });

  invariantResponse(
    octokitResult.data instanceof Array,
    "No data returned from octokit",
    {
      status: 500,
    }
  );

  const postsNames = octokitResult.data.map((directory) => directory.name);

  const posts = [];

  for (const post of postsNames) {
    const postResponse = await octokit.repos.getContent({
      owner: "M-Kolacz",
      repo: "michalkolacz.com",
      path: `posts/${post}/index.mdx`,
    });

    invariantResponse("content" in postResponse.data, "No data returned", {
      status: 500,
    });

    const postContent = Buffer.from(
      postResponse.data.content,
      "base64"
    ).toString("utf-8");

    const { frontmatter, code } = await bundleMDX<{
      title: string;
      date: string;
      excerpt: string;
    }>({
      source: postContent,
    });
    const convertedFrontmatter = {
      ...frontmatter,
      slug: frontmatter.title.toLowerCase().split(" ").join("-"),
    };
    blogCache.set(`posts/${convertedFrontmatter.slug}`, {
      ...convertedFrontmatter,
      code,
    });
    posts.push(convertedFrontmatter);
  }

  return posts;
};

export const getBlogPost = async (postSlug: string) => {
  const postResponse = await octokit.repos.getContent({
    owner: "M-Kolacz",
    repo: "michalkolacz.com",
    path: `posts/${postSlug}/index.mdx`,
  });

  invariantResponse("content" in postResponse.data, "No data returned", {
    status: 500,
  });

  const postContent = Buffer.from(postResponse.data.content, "base64").toString(
    "utf-8"
  );

  const { code, frontmatter } = await bundleMDX<{
    title: string;
    date: string;
    excerpt: string;
  }>({
    source: postContent,
  });

  const post = {
    code,
    slug: frontmatter.title.toLowerCase().split(" ").join("-"),
    ...frontmatter,
  };

  blogCache.set(`posts/${postSlug}`, post);

  return post;
};

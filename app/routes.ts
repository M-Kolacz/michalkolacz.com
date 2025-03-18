import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  // Homepage
  index("./features/homepage/components/pages/homepage/homepage.tsx"),
  // Blog
  route("blog", "./features/blog/components/pages/blog/blog.tsx"),
  route(
    "blog/:postTitle",
    "./features/blog/components/pages/blog-post/blog-post.tsx"
  ),
  route(
    "/resources/healthcheck",
    "./components/pages/healthcheck/healthcheck.tsx"
  ),
  route("*", "./components/pages/not-found/not-found.tsx"),
] satisfies RouteConfig;

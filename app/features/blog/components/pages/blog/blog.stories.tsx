import type { Meta, StoryObj } from "@storybook/react";
import { createRoutesStub } from "react-router";

import { layoutDecorator } from "#app/utils/storybook.tsx";

import BlogPage from "./blog";

import { createBlogPosts } from "#tests/mocks/blog.ts";

const meta = {
  title: "blog/components/pages/Blog page",
  component: BlogPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof BlogPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPosts: Story = {
  decorators: [
    layoutDecorator,
    (Story) => {
      const ReactRouterStub = createRoutesStub([
        {
          path: "/blog",
          Component: Story,
          loader: () => {
            return {
              posts: createBlogPosts(),
            };
          },
        },
      ]);

      return <ReactRouterStub initialEntries={["/blog"]} />;
    },
  ],
  args: {},
};

export const WithoutPosts: Story = {
  decorators: [
    layoutDecorator,
    (Story) => {
      const ReactRouterStub = createRoutesStub([
        {
          path: "/blog",
          Component: Story,
          loader: () => {
            return {
              posts: [],
            };
          },
        },
      ]);

      return <ReactRouterStub initialEntries={["/blog"]} />;
    },
  ],
  args: {},
};

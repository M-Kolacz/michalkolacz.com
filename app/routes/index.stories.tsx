import type { Meta, StoryObj } from "@storybook/react";
import { createRoutesStub } from "react-router";

import { layoutDecorator } from "#app/utils/storybook.tsx";

// eslint-disable-next-line boundaries/element-types
import Homepage from "./index";

const meta = {
  title: "homepage/components/pages/Homepage",
  component: Homepage,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["page"],
} satisfies Meta<typeof Homepage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  decorators: [
    layoutDecorator,
    (Story) => {
      const ReactRouterStub = createRoutesStub([
        { path: "/", Component: Story },
      ]);

      return <ReactRouterStub initialEntries={["/"]} />;
    },
  ],
  args: {},
};

import type { Meta, StoryObj } from "@storybook/react";
import { createRoutesStub } from "react-router";
import { Footer } from "#app/components/organisms/footer.tsx";
import { Header } from "#app/components/organisms/header.tsx";

import Homepage from "./_index";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "UI/Homepage",
  component: Homepage,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "fullscreen",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {},
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: {},
} satisfies Meta<typeof Homepage>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  decorators: [
    (Story) => (
      <>
        <Header />
        <Story />
        <Footer />
      </>
    ),
    (Story) => {
      const ReactRouterStub = createRoutesStub([
        { path: "/", Component: Story },
      ]);

      return <ReactRouterStub initialEntries={["/"]} />;
    },
  ],
  args: {},
};

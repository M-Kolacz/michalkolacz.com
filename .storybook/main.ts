import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";

import path from "path";

process.env.STORYBOOK = "true";

const config: StorybookConfig = {
  stories: ["../app/**/*.mdx", "../**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/experimental-addon-test",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  viteFinal: (config) => {
    return mergeConfig(config, {
      resolve: {
        alias: {
          "#app/features/blog/utils/cache.server.ts": path.resolve(
            __dirname,
            "../app/features/blog/mocks/cache.server.ts"
          ),
          "#app/features/blog/utils/blog.server.ts": path.resolve(
            __dirname,
            "../app/features/blog/mocks/blog.server.ts"
          ),
        },
      },
    });
  },
};
export default config;

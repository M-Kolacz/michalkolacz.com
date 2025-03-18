import { codecovVitePlugin } from "@codecov/vite-plugin";
import { reactRouter } from "@react-router/dev/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const MODE = process.env.NODE_ENV;
const isStorybook = process.env.STORYBOOK === "true";

export default defineConfig({
  build: {
    assetsInlineLimit: 0,
  },
  plugins: [
    isStorybook ? null : reactRouter(),
    tsconfigPaths(),
    process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          disable: MODE !== "production",
          authToken: process.env.SENTRY_AUTH_TOKEN,
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          release: {
            name: process.env.COMMIT_SHA,
            setCommits: {
              auto: true,
            },
          },
          sourcemaps: {
            filesToDeleteAfterUpload: [
              "./build/**/*.map",
              ".server-build/**/*.map",
            ],
          },
        })
      : null,
    codecovVitePlugin({
      enableBundleAnalysis: true,
      bundleName: "michalkolacz.com",
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});

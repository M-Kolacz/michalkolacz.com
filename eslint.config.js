import pluginJs from "@eslint/js";
import boundaries from 'eslint-plugin-boundaries';
import pluginImport from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import pluginStorybook from "eslint-plugin-storybook";
import globals from "globals";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  {
    ignores: [".react-router/*", "build/*", "node_modules/*", "server-build/*"],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    files: ["**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)"],
    plugins: {
      pluginStorybook,
    },
    rules: {
      ...pluginStorybook.configs.recommended.rules,
    },
  },
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/include": ["app/**/*"],
      "import/resolver": {
        alias: {
          map: [["#app", "./app"]],
          extensions: [".js", ".jsx", ".ts", ".tsx"]
        }
      },
      "boundaries/elements": [
        {
          "mode": "full",
          "type": "shared",
          "pattern": [
            "app/assets/**/*",
            "app/components/**/*",
            "app/styles/**/*",
            "app/utils/**/*",
          ]
        },
        {
          "mode": "full",
          "type": "feature",
          "capture": ["featureName"],
          "pattern": ["app/features/*/**/*"]
        },
        {
          "mode": "full",
          "type": "app",
          "capture": ["_", "fileName"],
          "pattern": ["app/**/*"]
        },
        {
          "mode": "full",
          "type": "neverImport",
          "pattern": ["app/routes.ts"]
        }
      ]
    },
    rules: {
      "boundaries/no-unknown": ["error"],
      "boundaries/no-unknown-files": ["error"],
      "boundaries/element-types": [
        "error",
        {
          "default": "disallow",
          "rules": [
            {
              "from": ["shared"],
              "allow": ["shared"]
            },
            {
              "from": ["feature"],
              "allow": [
                "shared",
                ["feature", { "featureName": "${from.featureName}" }]
              ]
            },
            {
              "from": ["app", "neverImport"],
              "allow": ["shared", "feature"]
            },
            {
              "from": ["app"],
              "allow": [["app", { "fileName": "*.css" }]]
            }
          ]
        }
      ]
    }
  },
  {
    plugins: {
      import: pluginImport,
    },
    rules: {
      "import/order": [
        "error",
        {
          "groups": ["external", "internal", "parent", "sibling", "index"],
          "pathGroups": [
            {
              "pattern": "#app/features/**",
              "group": "internal",
              "position": "after"
            },
            {
              "pattern": "#app/**",
              "group": "internal",
              "position": "before"
            }
          ],
          "pathGroupsExcludedImportTypes": [],
          "newlines-between": "always",
          "alphabetize": { "order": "asc", "caseInsensitive": true }
        }
      ]
    }
  }
];

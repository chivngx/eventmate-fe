// Flat ESLint config (Next.js App Router + TypeScript + React).
//
// NOTE: `eslint-config-next` 16.x is currently incompatible with
// @eslint/eslintrc's FlatCompat (circular JSON validation bug — see
// https://github.com/eslint/eslintrc issues). To keep `bun run lint`
// functional we use `typescript-eslint` directly with a small set of
// React-aware rules. Re-enable eslint-config-next once upstream fixes the
// validation issue (tracked in .standards/UPGRADE_PROPOSAL.md P2.11).

import js from "@eslint/js"
import tseslint from "typescript-eslint"

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "out/**",
      // Environment / non-project directories
      "skills/**",
      "examples/**",
      "mini-services/**",
      "download/**",
      "upload/**",
      ".zscripts/**",
      "tool-results/**",
      "public/**",
      // Sentry generated config (no-op stubs, not worth linting)
      "sentry.client.config.ts",
      "sentry.server.config.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-empty-object-type": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "prefer-const": "warn",
    },
  }
)

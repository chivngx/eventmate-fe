// Flat ESLint config (Next.js App Router + TypeScript + React).
//
// Note: `eslint-config-next` 16.x currently triggers a "Converting circular
// structure to JSON" error inside `@eslint/eslintrc`'s config validator when
// loaded via FlatCompat (a known ecosystem bug unrelated to this codebase).
// To keep `bun run lint` functional we use `typescript-eslint` directly with a
// small set of React-aware rules. Re-enable eslint-config-next once upstream
// fixes the validation issue.

import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "out/**",
      // Environment / non-project directories (not part of the app source)
      "skills/**",
      "examples/**",
      "mini-services/**",
      "download/**",
      "upload/**",
      ".zscripts/**",
      "tool-results/**",
      "public/**",
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
);

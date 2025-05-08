import { defineConfig } from "eslint/config";
import tsESLint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tsESLint
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      semi: "error",
      "prefer-const": "error",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": "warn"
    }
  },
  {
    ignores: ["node_modules/", "dist/"]
  }
]);
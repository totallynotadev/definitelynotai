/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ['../../.eslintrc.cjs', 'plugin:svelte/recommended'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    extraFileExtensions: ['.svelte'],
  },
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  ],
  rules: {
    // Svelte specific rules
    'svelte/no-at-html-tags': 'warn',
    'svelte/valid-compile': 'error',
  },
  ignorePatterns: ['.svelte-kit/', 'build/'],
};

// eslint.config.js
import process from 'node:process';
import tseslint from 'typescript-eslint';

const devBuild = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2019,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      // this rule helps us be honest with our code annotations
      'no-warning-comments': ['warn', { terms: ['todo', 'fixme', 'xxx', 'bug'], location: 'anywhere' }],

      // don't be using the console in production, that's just silly
      //'no-console': [devBuild ? 'warn' : 'error', { allow: ['assert'] }],

      // these rules help us keep the code readable & consistent
      'max-len': ['warn', { code: 240 }],

      'linebreak-style': ['error', 'unix'],
      'no-trailing-spaces': ['error'],
      'semi': ['error', 'always'],
    },
  },
  // include recommended configs from ESLint and TS plugin
  ...tseslint.configs.recommended,
];


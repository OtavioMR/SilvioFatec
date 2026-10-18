import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['coverage/', 'node_modules/', '.vercel/', 'public/build-info.json'] },
  js.configs.recommended,
  {
    languageOptions: { globals: { ...globals.node } },
    rules: { 'no-unused-vars': ['error', { argsIgnorePattern: '^_' }] }
  },
  { files: ['public/**/*.js'], languageOptions: { globals: { ...globals.browser } } }
];

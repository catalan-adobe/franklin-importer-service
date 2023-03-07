module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  env: {
    browser: true,
    es6: true,
  },
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    // allow reassigning param
    'no-param-reassign': [2, { props: false }],
    'linebreak-style': ['error', 'unix'],
    'import/extensions': ['error', {
      js: 'always',
    }]
  },
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  settings: {
    'import/resolver': {
      exports: {},
    },
  },
};
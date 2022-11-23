module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'turbo', 'prettier'],
  rules: {
    'indent': ['error', 2],
    'linebreak-style': ['error', 'unix'],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    '@typescript-eslint/no-unused-vars': [
      'error',
      { 'ignoreRestSiblings': true }
    ],
    '@typescript-eslint/no-non-null-assertion': 0,
  },
};

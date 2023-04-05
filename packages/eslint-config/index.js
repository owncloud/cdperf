module.exports = {
  extends: [
    'eslint:recommended',
    'prettier',
    'turbo',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
  ],
  processor: 'disable/disable',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: [ '@typescript-eslint', 'eslint-plugin-unicorn', 'disable', 'simple-import-sort', 'json-files', 'no-relative-import-paths', 'relative-imports-when-same-folder'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'import/prefer-default-export': 'off',
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/no-extraneous-dependencies': 'off',
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'space-before-blocks': [ 'error', 'always' ],
    'import/newline-after-import': [ 'error', { 'count': 1 } ],
    'no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 1, 'maxBOF': 0 }],
    'import/no-named-as-default': 'error',
    'import/no-default-export': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-relative-packages': 'error',
    'object-curly-spacing': [ 'error', 'always' ],
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    'computed-property-spacing': [ 'error', 'always' ],
    'no-console': 'off',
    'arrow-body-style': ['error', 'always'],
    'arrow-parens': ['error', 'always'],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'no-return-assign': 'off',
    'function-paren-newline': ['error', 'never'],
    'brace-style': 'error',
    'class-methods-use-this': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'indent': ['error', 2],
    'no-unused-vars': 'off',
    'no-underscore-dangle': 'off',
    'no-nested-ternary': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'no-await-in-loop': 'off',
    'no-plusplus': 'off',
    '@typescript-eslint/no-namespace': 'off',
    '@typescript-eslint/lines-between-class-members': 'off',
    'default-case': 'off',
    'no-restricted-syntax': 'off',
    '@typescript-eslint/no-unused-expressions': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-loop-func': 'off',
    'no-continue': 'off',
    'no-relative-import-paths/no-relative-import-paths': [
      'error',
      { 'allowSameFolder': true, 'rootDir': 'src', 'prefix': '@' }
    ],
    'relative-imports-when-same-folder/no-relative-imports-when-same-folder': 'error',
  },
  'settings': {
    'import/resolver': {
      'typescript': {}
    }
  },
  overrides: [
    {
      files: [ '**/package.json' ],
      plugins: [ 'json-files' ],
      parser: 'espree',
      rules: {
        'json-files/sort-package-json': 'error',
        'json-files/require-license': 'error',
        'json-files/restrict-ranges': 'error',
        'json-files/require-unique-dependency-names': 'error',
        'relative-imports-when-same-folder/no-relative-imports-when-same-folder': 'off'
      },
    },
    {
      files: [ '**/*.js' ],
      parser: 'espree',
      rules: {
        'relative-imports-when-same-folder/no-relative-imports-when-same-folder': 'off'
      },
    },
  ]
};

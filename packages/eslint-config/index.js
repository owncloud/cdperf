const sharedRules = {
  'max-len': ['error', 150],
  'arrow-body-style': ['error', 'always'],
  'arrow-parens': ['error', 'always'],
  'brace-style': ['error', '1tbs', { allowSingleLine: false }],
  'object-curly-spacing': ['error', 'always'],
  'simple-import-sort/imports': 'error',
  'simple-import-sort/exports': 'error',
  'import/extensions': 'off',
  'import/prefer-default-export': 'off',
  'import/no-duplicates': 'error',
  'import/newline-after-import': ['error', { count: 1 }],
  'import/no-default-export': 'error',
  'import/no-useless-path-segments': 'error',
  'import/no-cycle': 'error',
  'import/no-self-import': 'error',
};

module.exports = {
  extends: [
    'airbnb-base',
  ],
  plugins: [
    'simple-import-sort',
  ],
  rules: {
    ...sharedRules,
  },
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        'airbnb-typescript/base',
        'prettier',
        'turbo',
      ],
      plugins: ['no-relative-import-paths', 'relative-imports-when-same-folder'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        ...sharedRules,
        'no-relative-import-paths/no-relative-import-paths': [
          'error',
          { allowSameFolder: true, rootDir: 'src', prefix: '@' },
        ],
        'relative-imports-when-same-folder/no-relative-imports-when-same-folder': 'error',
      },
    },
    {
      files: ['package.json'],
      plugins: ['json-files'],
      rules: {
        'json-files/sort-package-json': 'error',
        'json-files/require-license': 'error',
        'json-files/restrict-ranges': 'error',
        'json-files/require-unique-dependency-names': 'error',
        'relative-imports-when-same-folder/no-relative-imports-when-same-folder': 'off',
      },
      settings: {
        'disable/disableAllExcept': true,
      },
    },
  ],
};

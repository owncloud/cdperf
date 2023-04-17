const sharedExtends = [
  require.resolve('./src/prettier.js'),
  require.resolve('./src/eslint.js'),
  require.resolve('./src/import.js'),
  require.resolve('./src/turbo.js'),
  require.resolve('./src/simple-import-sort.js')
]

module.exports = {
  extends: [
    require.resolve('./src/airbnb-base.js'),
    ...sharedExtends
  ],
  ignorePatterns: ['build.mjs', 'turbowatch.ts', 'vitest.config.ts', '*.test.ts'],
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        require.resolve('./src/airbnb-base.js'),
        require.resolve('./src/airbnb-typescript-base.js'),
        require.resolve('./src/no-relative-import-paths.js'),
        require.resolve('./src/relative-imports-when-same-folder.js'),
        ...sharedExtends
      ],
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    {
      files: ['*.json'],
      extends: [
        require.resolve('./src/json-files.js')
      ]
    }
  ]
}

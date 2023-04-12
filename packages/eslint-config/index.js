const sharedExtends = [
  require.resolve('./src/eslint.js'),
  require.resolve('./src/import.js'),
  require.resolve('./src/turbo.js'),
  require.resolve('./src/prettier.js'),
  require.resolve('./src/simple-import-sort.js'),
]

module.exports = {
  extends: [
    require.resolve('./src/airbnb-base.js'),
    ...sharedExtends
  ],
  overrides: [
    {
      files: ['*.ts'],
      extends: [
        require.resolve('./src/airbnb-base.js'),
        require.resolve('./src/airbnb-typescript-base.js'),
        ...sharedExtends
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    {
      files: ['*.json'],
      extends: [
        require.resolve('./src/json-files.js'),
      ]
    }
  ]
};

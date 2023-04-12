module.exports = {
  plugins: ['json-files'],
  rules: {
    'json-files/sort-package-json': 'error',
    'json-files/require-license': 'error',
    'json-files/restrict-ranges': 'error',
    'json-files/require-unique-dependency-names': 'error',
    'relative-imports-when-same-folder/no-relative-imports-when-same-folder': 'off',
  },
}

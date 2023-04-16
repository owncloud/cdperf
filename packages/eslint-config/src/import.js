module.exports = {
  extends: ['plugin:import/recommended'],
  rules: {
    'import/extensions': 'off',
    'import/no-unresolved': 'off',
    'import/prefer-default-export': 'off',
    'import/no-duplicates': 'error',
    'import/newline-after-import': ['error', { count: 1 }],
    'import/no-default-export': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error'
  }
}

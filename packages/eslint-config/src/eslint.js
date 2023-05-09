module.exports = {
  rules: {
    'max-len': ['error', 150],
    'arrow-body-style': ['error', 'always'],
    'semi': ['error', 'never'],
    'arrow-parens': ['error', 'always'],
    'brace-style': ['error', '1tbs', { allowSingleLine: false }],
    'object-curly-spacing': [ 'error', 'always' ],
    'quotes': ['error', 'single', { 'avoidEscape': true }],
    'comma-spacing': ['error', { 'before': false, 'after': true }],
    'comma-dangle': ['error', 'never'],
    'no-console': 'off',
    'no-lone-blocks': 'off'
  }
}

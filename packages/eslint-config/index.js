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
	plugins: [ '@typescript-eslint', 'eslint-plugin-unicorn', 'disable', 'simple-import-sort', 'json-files' ],
	rules: {
		'simple-import-sort/imports': 'error',
		'simple-import-sort/exports': 'error',
		'import/prefer-default-export': 'off',
		'import/extensions': 'off',
		'import/no-unresolved': 'off',
		'import/no-extraneous-dependencies': 'off',
		'import/first': 'error',
		'import/no-duplicates': 'error',
		'import/newline-after-import': [ 'error', { 'count': 1 } ],
		'import/no-named-as-default': 'error',
		'import/no-default-export': 'error',
		'import/no-useless-path-segments': 'error',
		'import/no-cycle': 'error',
		'import/no-self-import': 'error',
		'import/no-relative-packages': 'error',
		'object-curly-spacing': [ 'error', 'always' ],
		'computed-property-spacing': [ 'error', 'always' ],
		'no-console': 'off',
		'arrow-body-style': 'off',
		'quotes': ['error', 'single', { 'avoidEscape': true }],
		'no-return-assign': 'off',
		'class-methods-use-this': 'off',
		'@typescript-eslint/no-empty-interface': 'off',
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
		'no-continue': 'off'
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
			},
		},
	]
};

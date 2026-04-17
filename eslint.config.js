import js from '@eslint/js';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
	{
		// Ignora pastas de build, dependências e código antigo
		ignores: [ 'dist', '_legacy', 'node_modules' ]
	},
	{
		files: [ '**/*.js' ],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'module',
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
		plugins: {
			jsdoc,
			'@stylistic/js': stylisticJs,
		},
		rules: {
			...js.configs.recommended.rules,

			// --- DOCUMENTAÇÃO JSDOC (REGRA DE PROATIVIDADE) ---
			'jsdoc/require-jsdoc': [ 'warn', {
				publicOnly: false,
				require: {
					FunctionDeclaration: true,
					MethodDefinition: true,
					ClassDeclaration: true,
					ArrowFunctionExpression: true,
				}
			}],
			'jsdoc/require-description': 'warn',
			'jsdoc/require-param': 'warn',
			'jsdoc/require-param-type': 'warn',
			'jsdoc/require-returns': 'warn',
			'jsdoc/require-example': 'warn', // Obriga a IA a criar exemplos musicais
			'jsdoc/check-types': 'warn',

			// --- FORMATAÇÃO: ESPAÇOS NOS PARÊNTESES ---
			'@stylistic/js/space-in-parens': [ 'warn', 'always' ],
			'@stylistic/js/space-before-function-paren': [ 'warn', 'always' ],
			'@stylistic/js/block-spacing': [ 'warn', 'always' ],
			'@stylistic/js/object-curly-spacing': [ 'warn', 'always' ],

			// --- FORMATAÇÃO: COMMA FIRST (VÍRGULA NO INÍCIO) ---
			'@stylistic/js/comma-style': [ 'warn', 'first' ],
			'@stylistic/js/comma-spacing': [ 'warn', {
				before: false
				, after: true
			}],

			// --- REGRAS GERAIS ---
			'@stylistic/js/semi': [ 'warn', 'always' ],
			'@stylistic/js/indent': [ 'warn', 4 ], // Seguindo o padrão de 4 espaços
			'no-unused-vars': [ 'warn', { argsIgnorePattern: '^_' } ],
			'no-console': [ 'warn', { allow: [ 'warn', 'error' ] } ]
		},
	},
];
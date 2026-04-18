import { z } from 'zod';

/**
 * Schema para validação de Duração de tempo (Time Signatures).
 * Regras: Numerador (1-9) e Denominador (1-64).
 * * @param {Object|string} val - Entrada para validação.
 * @returns {Object|string} Valor validado.
 * * @example
 * tempoDuracaoSchema.parse( "1/4" );
 * @example
 * tempoDuracaoSchema.parse( { numerador: 3, denominador: 4 } );
 */

// 1. Regex simples apenas para capturar o formato
const regexFracao = /^\d+\/\d+$/;

/**
 * Função auxiliar para validar limites em strings "n/d"
 * @param {string} str
 * @param {import('zod').RefinementCtx} ctx
 */
const validarLimitesDuracao = ( str , ctx ) => {
	const [ numStr , denStr ] = str.split( '/' );
	const n = parseInt( numStr , 10 );
	const d = parseInt( denStr , 10 );

	if ( n < 1 || n > 9 ) {
		ctx.addIssue( {
			code: z.ZodIssueCode.custom
			, message: "Numerador deve estar entre 1 e 9"
		} );
	}
	if ( d < 1 || d > 64 ) {
		ctx.addIssue( {
			code: z.ZodIssueCode.custom
			, message: "Denominador deve estar entre 1 e 64"
		} );
	}
};

// 2. Formato: { numerador: 1-9, denominador: 1-64 }
const formatoObjetoNumerico = z.object( {
	numerador: z.number().int().min( 1 ).max( 9 )
	, denominador: z.number().int().min( 1 ).max( 64 )
} ).strict();

// 3. Formato: String "1/4" com superRefine
const formatoStringPura = z.string()
	.regex( regexFracao )
	.superRefine( validarLimitesDuracao );

// 4. Formato: { duracao: "1/4" }
const formatoObjetoString = z.object( {
	duracao: formatoStringPura
} ).strict();

// 5. A União (O "Motor" de validação)
export const uniaoTempoDuracao = z.union( [
	formatoObjetoNumerico
	, formatoObjetoString
	, formatoStringPura
] );

export const tempoDuracaoSchema = uniaoTempoDuracao;
import { z } from 'zod';

/**
 * Schema para validação de métricas de tempo (Time Signatures).
 * Limites: Numerador (1-9) e Denominador (1-64).
 * * @param {Object|string} val - A entrada a ser validada.
 * @returns {Object|string} O valor validado conforme um dos formatos da união.
 * * @example
 * tempoMetricaSchema.parse( "1/4" );
 * * @example
 * tempoMetricaSchema.parse( { metrica: "1/4" } );
 * * @example
 * tempoMetricaSchema.parse( { numerador: 3, denominador: 4 } );
 */

// 1. Regex simplificado para captura inicial
const regexFracao = /^\d+\/\d+$/;

/**
 * Validador de limites numéricos para strings de métrica.
 * @param {string} str
 * @param {import('zod').RefinementCtx} ctx
 */
const validarLimitesMetrica = ( str , ctx ) => {
	const [ nStr , dStr ] = str.split( '/' );
	const n = parseInt( nStr , 10 );
	const d = parseInt( dStr , 10 );

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

// 2. Definição dos formatos de dados
const formatoObjetoEstruturado = z.object( {
	numerador: z.number().int().min( 1 ).max( 9 )
	, denominador: z.number().int().min( 1 ).max( 64 )
} ).strict();

const formatoStringPura = z.string()
	.regex( regexFracao )
	.superRefine( validarLimitesMetrica );

const formatoStringObjeto = z.object( {
	metrica: formatoStringPura
} ).strict();

// 3. A União (O "Motor" de validação)
export const uniaoTempoMetrica = z.union( [
	formatoObjetoEstruturado
	, formatoStringObjeto
	, formatoStringPura
] );

// 4. Exportação final do Schema
export const tempoMetricaSchema = uniaoTempoMetrica;
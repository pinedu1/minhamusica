import { z } from 'zod';

/**
 * Schema para validação de Duração de tempo (Time Signatures).
 * Regras: Numerador (1-9) e Denominador (1-64).
 * @param {Object|string} val - Entrada para validação.
 * @returns {Object} Valor validado e normalizado para { numerador, denominador }.
 * @example
 * tempoMetricaSchema.parse( "1/4" ); // retorna { numerador: 1, denominador: 4 }
 * @example
 * tempoMetricaSchema.parse( { numerador: 3, denominador: 4 } ); // retorna { numerador: 3, denominador: 4 }
 */

// 1. Regex simples apenas para capturar o formato
const regexFracao = /^\d+\/\d+$/;

/**
 * Função auxiliar para extrair números de uma string "n/d"
 * @param {string} str
 */
const extrairFracao = ( str ) => {
	const [ numStr , denStr ] = str.split( '/' );
	return {
		numerador: parseInt( numStr , 10 ),
		denominador: parseInt( denStr , 10 )
	};
};

/**
 * Função auxiliar para validar limites em strings "n/d"
 * @param {string} str
 * @param {import('zod').RefinementCtx} ctx
 */
const validarLimitesMetrica = ( str , ctx ) => {
	const { numerador: n, denominador: d } = extrairFracao( str );

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

// 3. Formato: String "1/4" com superRefine e transformação para objeto
const formatoStringPura = z.string()
	.regex( regexFracao )
	.superRefine( validarLimitesMetrica )
	.transform( ( val ) => extrairFracao( val ) );

// 4. Formato: { metrica: "1/4" } com transformação para objeto plano
const formatoObjetoString = z.object( {
	metrica: z.string().regex( regexFracao ).superRefine( validarLimitesMetrica )
} )
	.strict()
	.transform( ( val ) => extrairFracao( val.metrica ) );

/**
 * 5. A União (O "Motor" de validação e normalização)
 * Independente da entrada, o output será sempre { numerador, denominador }
 */
export const tempoMetricaSchema = z.union( [
	formatoObjetoNumerico
	, formatoObjetoString
	, formatoStringPura
] );

/**
 * Schema focado em transformar a Classe/Objeto de domínio em String para JSON.
 * Usado pelo adaptador static toJson().
 */
export const tempoMetricaOutputSchema = z.object({
	numerador: z.number(),
	denominador: z.number()
}).transform((val) => {
	return {
		metrica: `${val.numerador}/${val.denominador}`
	};
});
/**
 * Schema focado em transformar a Classe/Objeto de domínio em String para JSON.
 * Usado pelo adaptador static toJson().
 */
export const tempoMetricaOutputStringSchema = z.object({
	numerador: z.number(),
	denominador: z.number()
}).transform((val) => {
		return `${val.numerador}/${val.denominador}`;
});
import { z } from 'zod';

/**
 * Schema para validação e NORMALIZAÇÃO de métricas de tempo e andamento.
 * Independentemente da entrada, o retorno será sempre um objeto plano.
 * * @param {Object|string} val - Entrada para validação.
 * @returns {{ numerador: number, denominador: number, bpm: number }} Dados normalizados.
 * * @example
 * // Entradas aceitas:
 * 1. String Pura: "4/4=120"
 * 2. Objeto com String: { andamento: "1/4=90" }
 * 3. Objeto Misto: { andamento: "1/4", bpm: 90 }
 * 4. Objeto Aninhado: { andamento: { numerador: 3, denominador: 4 }, bpm: 120 }
 * 5. Objeto Plano: { numerador: 4, denominador: 4, bpm: 120 }
 */

/**
 * Normaliza strings "n/d" para objeto numérico.
 */
const extrairFracao = ( str ) => {
	const [ n , d ] = str.split( '/' ).map( ( v ) => parseInt( v , 10 ) );
	return { numerador: n , denominador: d };
};

/**
 * Validador de limites reutilizável.
 */
const validarLimites = ( n , d , ctx ) => {
	if ( n < 1 || n > 9 ) {
		ctx.addIssue( { code: z.ZodIssueCode.custom , message: "Numerador deve estar entre 1 e 9" } );
	}
	if ( d < 1 || d > 64 ) {
		ctx.addIssue( { code: z.ZodIssueCode.custom , message: "Denominador deve estar entre 1 e 64" } );
	}
};

// 1. Formato: { numerador, denominador, bpm }
const formatoObjetoNumerico = z.object( {
	numerador: z.number().int().min( 1 ).max( 9 )
	, denominador: z.number().int().min( 1 ).max( 64 )
	, bpm: z.number().int().min( 1 ).max( 65535 )
} ).strict();

// 2. Formato: "1/4=90"
const formatoStringPura = z.string()
	.regex( /^\d+\/\d+=\d+$/ )
	.transform( ( val , ctx ) => {
		const [ fracao , bpmStr ] = val.split( '=' );
		const { numerador , denominador } = extrairFracao( fracao );
		const bpm = parseInt( bpmStr , 10 );

		validarLimites( numerador , denominador , ctx );
		if ( bpm < 1 || bpm > 65535 ) {
			ctx.addIssue( { code: z.ZodIssueCode.custom , message: "BPM inválido" } );
		}

		return { numerador , denominador , bpm };
	} );

// 3. Formato: { andamento: "1/4=90" }
const formatoStringObjeto = z.object( {
	andamento: formatoStringPura
} ).strict().transform( ( val ) => val.andamento );

// 4. Formato: { andamento: '1/4', bpm: 90 }
const formatoMisto = z.object( {
	andamento: z.string().regex( /^\d+\/\d+$/ )
	, bpm: z.number().int().min( 1 ).max( 65535 )
} ).strict().transform( ( val , ctx ) => {
	const { numerador , denominador } = extrairFracao( val.andamento );
	validarLimites( numerador , denominador , ctx );
	return { numerador , denominador , bpm: val.bpm };
} );

// 5. Formato: { andamento: { numerador, denominador }, bpm: 120 }
const formatoObjetoAninhado = z.object( {
	andamento: z.object( {
		numerador: z.number().int().min( 1 ).max( 9 )
		, denominador: z.number().int().min( 1 ).max( 64 )
	} ).strict()
	, bpm: z.number().int().min( 1 ).max( 65535 )
} ).strict().transform( ( val ) => ( {
	numerador: val.andamento.numerador
	, denominador: val.andamento.denominador
	, bpm: val.bpm
} ) );

export const tempoAndamentoSchema = z.union( [
	formatoObjetoNumerico
	, formatoStringObjeto
	, formatoStringPura
	, formatoMisto
	, formatoObjetoAninhado
] );
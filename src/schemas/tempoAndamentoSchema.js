import { z } from 'zod';

/**
 * Schema para validação de métricas de tempo e andamento (Time Signatures / BPM).
 * Valida limites musicais: Numerador (1-9), Denominador (1-64), BPM (1-65535).
 * * @param {Object|string} val - Entrada para validação.
 * @returns {Object|string} Valor validado.
 * * @example
 * tempoAndamentoSchema.parse( "4/4=120" );
 * * @example
 * tempoAndamentoSchema.parse( { andamento: "1/4", bpm: 90 } );
 * * @example
 * tempoAndamentoSchema.parse( { numerador: 4, denominador: 4, bpm: 120 } );
 */

// 1. Regex para frações simples (usado em partes do andamento)
const regexFracao = /^\d+\/\d+$/;

// 2. Regex para o formato completo string "n/d=bpm"
const regexFormatoCompleto = /^\d+\/\d+=\d+$/;

/**
 * Validador de limites para frações n/d
 * @param {string} str
 * @param {import('zod').RefinementCtx} ctx
 */
const validarLimitesFracao = ( str , ctx ) => {
	const [ num , den ] = str.split( '/' );
	const n = parseInt( num , 10 );
	const d = parseInt( den , 10 );

	if ( n < 1 || n > 9 ) {
		ctx.addIssue( { code: z.ZodIssueCode.custom , message: "Numerador deve ser entre 1 e 9" } );
	}
	if ( d < 1 || d > 64 ) {
		ctx.addIssue( { code: z.ZodIssueCode.custom , message: "Denominador deve ser entre 1 e 64" } );
	}
};

/**
 * Validador de limites para string completa "n/d=bpm"
 * @param {string} str
 * @param {import('zod').RefinementCtx} ctx
 */
const validarLimitesCompletos = ( str , ctx ) => {
	const [ parteMetrica , bpm ] = str.split( '=' );
	validarLimitesFracao( parteMetrica , ctx );
	const b = parseInt( bpm , 10 );
	if ( b < 1 || b > 65535 ) {
		ctx.addIssue( { code: z.ZodIssueCode.custom , message: "BPM deve ser entre 1 e 65535" } );
	}
};

// 3. Definição dos formatos

// Formato: { numerador: 1, denominador: 4, bpm: 90 }
const formatoObjetoNumerico = z.object( {
	numerador: z.number().int().min( 1 ).max( 9 )
	, denominador: z.number().int().min( 1 ).max( 64 )
	, bpm: z.number().int().min( 1 ).max( 65535 )
} ).strict();

// Formato: "1/4=90"
const formatoStringPura = z.string()
	.regex( regexFormatoCompleto )
	.superRefine( validarLimitesCompletos );

// Formato: { andamento: "1/4=90" }
const formatoStringObjeto = z.object( {
	andamento: formatoStringPura
} ).strict();

// NOVO FORMATO: { andamento: '1/4', bpm: 90 }
const formatoMisto = z.object( {
	andamento: z.string().regex( regexFracao ).superRefine( validarLimitesFracao )
	, bpm: z.number().int().min( 1 ).max( 65535 )
} ).strict();

// 4. A União Final
export const tempoAndamentoSchema = z.union( [
	formatoObjetoNumerico
	, formatoStringObjeto
	, formatoStringPura
	, formatoMisto
] );
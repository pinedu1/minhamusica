import { z } from 'zod';
import { tempoDuracaoOutputSchema } from './tempoDuracaoSchema.js';
/**
 * Schema para validação e NORMALIZAÇÃO de métricas de tempo e andamento.
 * O retorno será SEMPRE o objeto plano: { numerador: number, denominador: number, bpm: number }
 */

const extrairFracao = ( str ) => {
	const [ n , d ] = str.split( '/' ).map( ( v ) => parseInt( v , 10 ) );
	return { numerador: n , denominador: d };
};

const validarLimites = ( n , d , ctx ) => {
	if ( n < 1 || n > 9 ) {
		ctx.addIssue( { code: z.ZodIssueCode.custom , message: "Numerador deve estar entre 1 e 9" } );
	}
	if ( d < 1 || d > 64 ) {
		ctx.addIssue( { code: z.ZodIssueCode.custom , message: "Denominador deve estar entre 1 e 64" } );
	}
};

// 1. Formato Plano: { numerador, denominador, bpm }
const formatoObjetoNumerico = z.object( {
	numerador: z.number().int().min( 1 ).max( 9 )
	, denominador: z.number().int().min( 1 ).max( 64 )
	, bpm: z.number().int().min( 1 ).max( 65535 )
} ).strict();

// 2. Formato String: "4/4=120"
const formatoStringPura = z.string()
	.regex( /^\d+\/\d+=\d+$/ )
	.transform( ( val , ctx ) => {
		const [ fracao , bpmStr ] = val.split( '=' );
		const { numerador , denominador } = extrairFracao( fracao );
		const bpm = parseInt( bpmStr , 10 );

		validarLimites( numerador , denominador , ctx );
		if ( bpm < 1 || bpm > 65535 ) {
			ctx.addIssue( { code: z.ZodIssueCode.custom , message: "BPM inválido (1-65535)" } );
		}

		return { numerador , denominador , bpm };
	} );

// 3. Formato Objeto com String: { andamento: "1/4=90" }
const formatoStringObjeto = z.object( {
	andamento: formatoStringPura // O transform de formatoStringPura já resolve para o objeto plano
} ).strict().transform( ( val ) => val.andamento );

// 4. Formato Misto: { andamento: '1/4', bpm: 90 }
const formatoMisto = z.object( {
	andamento: z.string().regex( /^\d+\/\d+$/ )
	, bpm: z.number().int().min( 1 ).max( 65535 )
} ).strict().transform( ( val , ctx ) => {
	const { numerador , denominador } = extrairFracao( val.andamento );
	validarLimites( numerador , denominador , ctx );
	return { numerador , denominador , bpm: val.bpm };
} );

// 5. Formato Aninhado: { andamento: { numerador, denominador }, bpm: 120 }
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

/**
 * Motor de União: Tenta validar do mais específico/comum para o mais genérico.
 */
export const tempoAndamentoSchema = z.union( [
	formatoObjetoNumerico      // { numerador, denominador, bpm }
	, formatoStringPura        // "4/4=120"
	, formatoStringObjeto      // { andamento: "4/4=120" }
	, formatoMisto             // { andamento: "4/4", bpm: 120 }
	, formatoObjetoAninhado    // { andamento: {n, d}, bpm: 120 }
] );

/**
 * Schema focado em transformar a Classe/Objeto de domínio em String para JSON.
 * Reutiliza o tempoDuracaoOutputSchema para processar o objeto aninhado.
 */
export const tempoAndamentoOutputSchema = z.object({
	// Invocamos o schema de duração para a propriedade aninhada
	andamento: tempoDuracaoOutputSchema,
	bpm: z.number()
}).transform((val) => {
	/**
	 * val.andamento agora é o resultado do parse de tempoDuracaoOutputSchema,
	 * ou seja: { duracao: "n/d" }.
	 * * Agora concatenamos com o BPM para gerar a string final: "n/d=bpm"
	 */
	return {
		andamento: `${val.andamento.duracao}=${val.bpm}`
	};
});
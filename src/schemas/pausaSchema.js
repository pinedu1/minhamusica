import { z } from 'zod';
import { tempoDuracaoSchema } from '@schemas/tempoDuracaoSchema.js';

export const pausaSchema = z.object( {
	tipo: z.literal( 'pausa' ).default( 'pausa' )
	, duracao: tempoDuracaoSchema

	// Propriedades na raiz
	, fermata: z.boolean().optional().default( false )
	, fermataInvertida: z.boolean().optional().default( false )
	, breath: z.boolean().optional().default( false )
	, invisivel: z.boolean().optional().default( false )
	, pausaDeCompasso: z.boolean().optional().default( false )
	, acordes: z.union( [ z.string(), z.array( z.string() ) ] ).optional().default( [] )

	// Explicitamente nullable para garantir o retorno nulo
	, unidadeTempo: tempoDuracaoSchema.nullable().optional().default( null )
	, obra: z.any().nullable().optional().default( null )
	, voz: z.any().nullable().optional().default( null )
	, compasso: z.any().nullable().optional().default( null )

	, options: z.object( {
		fermata: z.boolean().default( false )
		, fermataInvertida: z.boolean().default( false )
		, breath: z.boolean().default( false )
		, invisivel: z.boolean().default( false )
		, pausaDeCompasso: z.boolean().default( false )
		, acordes: z.union( [ z.string(), z.array( z.string() ) ] ).default( [] )
		, unidadeTempo: tempoDuracaoSchema.nullable().default( null )
		, obra: z.any().nullable().default( null )
		, voz: z.any().nullable().default( null )
		, compasso: z.any().nullable().default( null )
	} ).optional().default( {} )
} )
	.strict()
	.transform( ( data ) => {
		// Função auxiliar: prioriza o valor do objeto 'options'.
		// Se não existir (ou for undefined), tenta o valor da raiz.
		// Se ainda assim for undefined, assume null ou o valor padrão.
		const pick = ( optVal, rootVal ) => ( optVal !== undefined ? optVal : ( rootVal ?? null ) );

		return {
			tipo: data.tipo
			, duracao: data.duracao
			, options: {
				// Primeiro pegamos os valores que estão dentro de data.options
				...data.options

				// Sobrescrevemos apenas se houver algo explicitamente na raiz
				// que não conflite com o que já está no options
				, fermata: data.options.fermata || data.fermata
				, fermataInvertida: data.options.fermataInvertida || data.fermataInvertida
				, breath: data.options.breath || data.breath
				, invisivel: data.options.invisivel || data.invisivel
				, pausaDeCompasso: data.options.pausaDeCompasso || data.pausaDeCompasso
				, acordes: (data.options.acordes?.length > 0) ? data.options.acordes : data.acordes

				// Para objetos complexos/nullables
				, unidadeTempo: pick( data.options.unidadeTempo, data.unidadeTempo )
				, obra: pick( data.options.obra, data.obra )
				, voz: pick( data.options.voz, data.voz )
				, compasso: pick( data.options.compasso, data.compasso )
			}
		}
	} );
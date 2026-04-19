import { z } from 'zod';
import { tempoDuracaoSchema, tempoDuracaoOutputSchema } from '@schemas/tempoDuracaoSchema.js';

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
export const pausaOutputSchema = z.object({
	tipo: z.literal('pausa').default('pausa'),

	// Aplica o schema de output que gera o objeto { duracao: "n/d" }
	duracao: tempoDuracaoOutputSchema,

	fermata: z.boolean().default(false),
	fermataInvertida: z.boolean().default(false),
	breath: z.boolean().default(false),
	invisivel: z.boolean().default(false),
	pausaDeCompasso: z.boolean().default(false),
	acordes: z.union([z.string(), z.array(z.string())]).default([]),

	// unidadeTempo também usa o schema de output
	unidadeTempo: tempoDuracaoOutputSchema.nullable().default(null),

	// Outras referências
	obra: z.any().nullable().default(null),
	voz: z.any().nullable().default(null),
	compasso: z.any().nullable().default(null)
}).transform((data) => {
	// Montamos o objeto final extraindo os valores das durações transformadas
	const result = {
		tipo: data.tipo,
		// .duracao aqui veio do tempoDuracaoOutputSchema, então é { duracao: "1/4" }
		duracao: data.duracao.duracao,
		fermata: data.fermata,
		fermataInvertida: data.fermataInvertida,
		breath: data.breath,
		invisivel: data.invisivel,
		pausaDeCompasso: data.pausaDeCompasso,
		acordes: data.acordes,
		// unidadeTempo pode ser null, se não for, pegamos a string dentro dele
		unidadeTempo: data.unidadeTempo ? data.unidadeTempo.duracao : null,
		obra: data.obra,
		voz: data.voz,
		compasso: data.compasso
	};
	// --- Lógica de Limpeza (Clean JSON) ---
	// Remove o que é falso, nulo ou vazio para exportação otimizada
	const clean = {};
	Object.entries(result).forEach(([key, val]) => {
		const isFalsy = (val === false) || (val === null) || (val === undefined);
		const isEmptyArray = Array.isArray(val) && (val.length === 0);
		if (!isFalsy && !isEmptyArray) {
			clean[key] = val;
		}
	});
	return clean;
});
import { z } from 'zod';
import { tempoDuracaoSchema, tempoDuracaoOutputSchema } from '@schemas/tempoDuracaoSchema.js';
import { notaFrequenciaSchema, notaFrequenciaOutputSchema } from '@schemas/notaFrequenciaSchema.js';

/**
 * Schema de validação para a Nota.
 * Alinhado com as propriedades da classe de domínio Nota.
 */
export const notaSchema = z.object({
	tipo: z.literal( 'nota' ).default( 'nota' ),
	altura: notaFrequenciaSchema,
	duracao: tempoDuracaoSchema,
	options: z.object({
		// INFRAESTRUTURA
		obra: z.any().nullable().default(null),
		voz: z.any().nullable().default(null),
		compasso: z.any().nullable().default(null),
		unidadeTempo: tempoDuracaoSchema.nullable().default(null),
		acordes: z.union([z.string(), z.array(z.string())]).default([]),

		// ACENTUAÇÃO E ARTICULAÇÃO
		acento: z.boolean().default(false),
		marcato: z.boolean().default(false),
		staccato: z.boolean().default(false),
		staccatissimo: z.boolean().default(false),
		tenuto: z.boolean().default(false),
		fermata: z.boolean().default(false),
		fermataInvertida: z.boolean().default(false),
		breath: z.boolean().default(false),

		// ORNAMENTOS
		mordente: z.boolean().default(false),
		upperMordent: z.boolean().default(false),
		trinado: z.boolean().default(false),
		turn: z.boolean().default(false),
		roll: z.boolean().default(false),

		// TÉCNICAS E ARCOS
		hammerOn: z.boolean().default(false),
		pullOff: z.boolean().default(false),
		ligada: z.boolean().default(false),
		pizzicato: z.boolean().default(false),
		snapPizzicato: z.boolean().default(false),
		downBow: z.boolean().default(false),
		upBow: z.boolean().default(false),
		openString: z.boolean().default(false),
		thumb: z.boolean().default(false),

		// OUTROS
		ghostNote: z.boolean().default(false),
		arpeggio: z.boolean().default(false),
		graceNote: z.any().nullable().default(null),
		dedilhado: z.number().int().min(0).max(5).nullable().default(null),

		// DINÂMICAS (Sua regra: 1, 2 ou 3)
		dinamicaSuave: z.number().int().min(0).max(3).default(0),
		dinamicaForte: z.number().int().min(0).max(3).default(0),
		dinamicaMeioForte: z.boolean().default(false),

		// EXPRESSÃO (Semântico: 'inicio' ou 'fim')
		crescendo: z.enum(['inicio', 'fim']).nullable().default(null),
		diminuendo: z.enum(['inicio', 'fim']).nullable().default(null),

		sustenido: z.boolean().default(false),
		bemol: z.boolean().default(false),
		beQuad: z.boolean().default(false)
	}).default({})
}).strict();
/**
 * Schema de validação estrita para garantir que as opções internas
 * da classe estão íntegras antes de exportar.
 * (Note que não usamos .default() aqui, pois estamos LENDO os dados que já existem)
 */
const notaOptionsOutputSchema = z.object({
	unidadeTempo: tempoDuracaoOutputSchema.nullable().optional().default(null),
	acordes: z.union([z.string(), z.array(z.string())]),

	// ACENTUAÇÃO E ARTICULAÇÃO
	acento: z.boolean(),
	marcato: z.boolean(),
	staccato: z.boolean(),
	staccatissimo: z.boolean(),
	tenuto: z.boolean(),
	fermata: z.boolean(),
	fermataInvertida: z.boolean(),
	breath: z.boolean(),

	// ORNAMENTOS
	mordente: z.boolean(),
	upperMordent: z.boolean(),
	trinado: z.boolean(),
	turn: z.boolean(),
	roll: z.boolean(),

	// TÉCNICAS E ARCOS
	hammerOn: z.boolean(),
	pullOff: z.boolean(),
	ligada: z.boolean(),
	pizzicato: z.boolean(),
	snapPizzicato: z.boolean(),
	downBow: z.boolean(),
	upBow: z.boolean(),
	openString: z.boolean(),
	thumb: z.boolean(),

	// OUTROS
	ghostNote: z.boolean(),
	arpeggio: z.boolean(),
	graceNote: z.any().nullable(),
	dedilhado: z.number().int().nullable(),

	// DINÂMICAS
	dinamicaSuave: z.number().int(),
	dinamicaForte: z.number().int(),
	dinamicaMeioForte: z.boolean(),

	// EXPRESSÃO
	crescendo: z.enum(['inicio', 'fim']).nullable(),
	diminuendo: z.enum(['inicio', 'fim']).nullable(),

	sustenido: z.boolean(),
	bemol: z.boolean(),
	beQuad: z.boolean()
});

/**
 * Serializador Principal: Converte a Instância de 'Nota' para JSON plano.
 */
export const notaOutputSchema = z.object({
	tipo: z.literal( 'nota' ).default( 'nota' ),
	// 1. Invocamos os especialistas de saída para as classes aninhadas
	altura: notaFrequenciaOutputSchema,
	duracao: tempoDuracaoOutputSchema,

	// 2. Lemos a propriedade com "_" que é a convenção da sua classe
	_options: notaOptionsOutputSchema
}).transform((val) => {

	/**
	 * OTIMIZAÇÃO DE JSON (Opcional, mas altamente recomendado):
	 * Filtramos as propriedades do _options para remover tudo que for false, null, 0 ou array vazio.
	 * Isso impede que o JSON de uma nota simples tenha 30 propriedades inúteis anexadas.
	 * Na hora de ler (fromJson), o notaSchema restaurará os falses automaticamente com os .default()!
	 */
	const cleanOptions = Object.fromEntries(
		Object.entries(val._options).filter(([key, value]) => {
			if (value === false) return false;
			if (value === null) return false;
			if (value === 0) return false; // dinamicaSuave/Forte zeradas
			if (Array.isArray(value) && value.length === 0) return false; // acordes vazios
			return true;
		})
	);

	// 3. Montamos o objeto de saída final com a chave "options" limpa
	return {
		tipo: z.literal( 'nota' ).default( 'nota' ),
		altura: val.altura,
		duracao: val.duracao,
		options: cleanOptions
	};
});
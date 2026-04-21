import { z } from 'zod';

import { notaSchema, notaOutputSchema } from '@schemas/notaSchema.js';
import { pausaSchema, pausaOutputSchema } from '@schemas/pausaSchema.js';
import { unissonoSchema, unissonoOutputSchema } from '@schemas/unissonoSchema.js';
import { tempoDuracaoSchema, tempoDuracaoOutputSchema } from '@schemas/tempoDuracaoSchema.js';
import { tempoMetricaSchema, tempoMetricaOutputSchema } from '@schemas/tempoMetricaSchema.js';
import { tipoBarraSchema, tipoBarraOutputSchema } from '@schemas/tipoBarraSchema.js';
import { quialteraSchema, quialteraOutputSchema } from "@schemas/quialteraSchema.js";

/**
 * Schema para validação de anotações e cifras
 */
const anotacaoSchema = z.object({
    texto: z.string(),
    posicao: z.number().int().min(0),
    local: z.string().optional().default("_")
});

const cifraSchema = z.object({
    texto: z.string(),
    posicao: z.number().int().min(0)
});
/**
 * Definição recursiva de elementos musicais.
 * O z.lazy permite que o quialteraSchema referencie o elementoMusicalSchema
 * antes mesmo de ele estar totalmente definido, suportando aninhamento.
 */
const elementoMusicalSchema = z.lazy(() => z.union([
	notaSchema,
	pausaSchema,
	unissonoSchema,
	quialteraSchema,
	z.any().refine(val =>
			val && ['Nota', 'Pausa', 'Unissono', 'Quialtera'].includes(val.constructor.name),
		{ message: "O elemento deve ser uma instância de Nota, Pausa, Unissono ou Quialtera" }
	)
]));

/**
 * Schema principal do Compasso
 */
export const compassoSchema = z.object({
    // Elementos podem ser objetos de dados ou instâncias já criadas
	elements: z.array(elementoMusicalSchema).default([]),

    options: z.object({
        // Referências circulares tratadas com refine para evitar importação de Voz/Obra aqui
        voz: z.any().optional().nullable(),
        obra: z.any().optional().nullable(),

        anotacoes: z.array(anotacaoSchema).default([]),
        cifras: z.array(cifraSchema).default([]),
        letra: z.array(z.string()).default([]),

        // Estruturas de Tempo
        unidadeTempo: tempoDuracaoSchema.optional().nullable(),
        metrica: tempoMetricaSchema.optional().nullable(),

        // Enums e Objetos de configuração
        barraInicial: tipoBarraSchema.optional().nullable(),
        barraFinal: tipoBarraSchema.optional().nullable(),
        mudancaDeTom: z.any().optional().nullable(), // Tonalidade
    }).default({})
});

/**
 * Schemas para anotações e cifras no formato de saída
 */
const anotacaoOutputSchema = z.object({
	texto: z.string(),
	posicao: z.number().int().min(0),
	local: z.string().optional().default("_")
});

const cifraOutputSchema = z.object({
	texto: z.string(),
	posicao: z.number().int().min(0)
});

/**
 * Definição recursiva de elementos musicais para o output.
 * O z.lazy permite o aninhamento caso a quialteraOutputSchema referencie
 * este mesmo schema internamente.
 */
const elementoMusicalOutputSchema = z.lazy(() => z.union([
	notaOutputSchema,
	pausaOutputSchema,
	unissonoOutputSchema,
	quialteraOutputSchema
]));

/**
 * Schema principal do Compasso para Output (serialização/API)
 */
export const compassoOutputSchema = z.object({
	// Valida o array com os 4 tipos definidos na union acima
	elements: z.array(elementoMusicalOutputSchema).default([]),

	options: z.object({
		// Substituindo referências completas por IDs para evitar loops no JSON
		vozId: z.string().optional().nullable(),
		obraId: z.string().optional().nullable(),

		anotacoes: z.array(anotacaoOutputSchema).default([]),
		cifras: z.array(cifraOutputSchema).default([]),
		letra: z.array(z.string()).default([]),

		// Estruturas de Tempo convertidas para output
		unidadeTempo: tempoDuracaoOutputSchema.optional().nullable(),
		metrica: tempoMetricaOutputSchema.optional().nullable(),

		// Configurações
		barraInicial: tipoBarraOutputSchema.optional().nullable(),
		barraFinal: tipoBarraOutputSchema.optional().nullable(),
		mudancaDeTom: z.any().optional().nullable(),
	}).default({})
});
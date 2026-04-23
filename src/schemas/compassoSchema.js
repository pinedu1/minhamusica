import { z } from 'zod';

import { tempoDuracaoSchema, tempoDuracaoOutputSchema, tempoDuracaoOutputStringSchema } from '@schemas/tempoDuracaoSchema.js';
import { tempoMetricaSchema, tempoMetricaOutputSchema, tempoMetricaOutputStringSchema } from "@schemas/tempoMetricaSchema.js";
import { tipoBarraSchema, tipoBarraOutputSchema, tipoBarraOutputStringSchema } from "@schemas/tipoBarraSchema.js";
import { grupoElementoOutputSchema, grupoElementoSchema } from "@schemas/grupoElementoSchema.js";
import { tonalidadeOutputStringSchema, tonalidadeSchema } from "@schemas/tonalidadeSchema.js";
import { arrayElementosOutputSchema, arrayElementosSchema } from "@schemas/elementosSchema.js";

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
 * Schema principal do Compasso
 */
export const compassoSchema = z.object({
    // Elementos podem ser objetos de dados ou instâncias já criadas
	elements: arrayElementosSchema.nullable().optional().default([]),
	grupos: z.array(grupoElementoSchema).default([]),
    options: z.object({
        voz: z.any().optional().nullable(),
        obra: z.any().optional().nullable(),

        anotacoes: z.array(anotacaoSchema).default([]),
        cifras: z.array(cifraSchema).default([]),
	    letra: z.array(z.string()).nullable().default([]),

        // Estruturas de Tempo
        unidadeTempo: tempoDuracaoSchema.optional().nullable(),
        metrica: tempoMetricaSchema.optional().nullable(),

        // Enums e Objetos de configuração
        barraInicial: tipoBarraSchema.optional().nullable(),
        barraFinal: tipoBarraSchema.optional().nullable(),
        mudancaDeTom: tonalidadeSchema.optional().nullable(), // Tonalidade
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
 * Schema principal do Compasso para Output (serialização/API)
 */
export const compassoOutputSchema = z.object({
	// Valida o array com os 4 tipos definidos na union acima
	elements: arrayElementosOutputSchema,
	grupos: z.array(grupoElementoOutputSchema),

	options: z.object({
		// Substituindo referências completas por IDs para evitar loops no JSON
		vozId: z.string().optional().nullable(),
		obraId: z.string().optional().nullable(),

		anotacoes: z.array(anotacaoOutputSchema).default([]),
		cifras: z.array(cifraOutputSchema).default([]),
		letra: z.array(z.string()).nullable().default([]),

		// Estruturas de Tempo convertidas para output
		unidadeTempo: tempoDuracaoOutputStringSchema.optional().nullable(),
		metrica: tempoMetricaOutputStringSchema.optional().nullable(),

		// Configurações
		barraInicial: tipoBarraOutputStringSchema.optional().nullable(),
		barraFinal: tipoBarraOutputStringSchema.optional().nullable(),
		mudancaDeTom: tonalidadeOutputStringSchema.optional().nullable(),
	}).default({})
});
import { z } from 'zod';
import { notaSchema, notaOutputSchema } from '@schemas/notaSchema.js';
import { pausaSchema, pausaOutputSchema } from '@schemas/pausaSchema.js';
import { unissonoSchema, unissonoOutputSchema } from '@schemas/unissonoSchema.js';
import { quialteraSchema, quialteraOutputSchema } from "@schemas/quialteraSchema.js";
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
export const grupoElementoSchema = z.object({
	// Elementos podem ser objetos de dados ou instâncias já criadas
	elements: z.array(elementoMusicalSchema).default([]),
	anotacoes: z.array(anotacaoSchema).default([]),
	cifras: z.array(cifraSchema).default([]),
	letra: z.array(z.string()).default([]),
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
export const grupoElementoOutputSchema = z.object({
	elements: z.array(elementoMusicalOutputSchema).default([]),
	anotacoes: z.array(anotacaoOutputSchema).default([]),
	cifras: z.array(cifraOutputSchema).default([]),
	letra: z.array(z.string()).default([]),
});
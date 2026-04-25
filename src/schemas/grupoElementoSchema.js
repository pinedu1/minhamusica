import { z } from 'zod';
import { arrayElementosOutputSchema, arrayElementosSchema } from "@schemas/elementosSchema.js";
/**
 * Schema para validação de anotações e acordes
 */
const anotacaoSchema = z.object({
	texto: z.string(),
	posicao: z.number().int().min(0),
	local: z.string().optional().default("_")
});

const acordeschema = z.object({
	texto: z.string(),
	posicao: z.number().int().min(0)
});

/**
 * Schema principal do Compasso
 */
export const grupoElementoSchema = z.object({
	id: z.number(),
	elements: arrayElementosSchema.default([]),
	options: z.object({
		anotacoes: z.array(anotacaoSchema).default([]),
		acordes: z.array(acordeschema).default([]),
		letra: z.array(z.string()).nullable().default([]),
	}).optional().default( { }),
});
/**
 * Schemas para anotações e acordes no formato de saída
 */
const anotacaoOutputSchema = z.object({
	texto: z.string(),
	posicao: z.number().int().min(0),
	local: z.string().optional().default("_")
});

const acordeOutputSchema = z.object({
	texto: z.string(),
	posicao: z.number().int().min(0)
});

/**
 * Schema principal do Compasso para Output (serialização/API)
 */
export const grupoElementoOutputSchema = z.object({
	id: z.number(),
	elements: arrayElementosOutputSchema.default([]),
	options: z.object({
		anotacoes: z.array(anotacaoSchema).default([]),
		acordes: z.array(acordeschema).default([]),
		letra: z.array(z.string()).nullable().default([]),
	}),
});
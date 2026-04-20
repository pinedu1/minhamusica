/**
 * @file quialteraSchema.js
 * @description Schema de validação e serialização para a entidade Unissono.
 * Gerencia a composição de múltiplas notas/pausas com uma duração global e opções compartilhadas.
 */

import { z } from 'zod';
import { notaSchema, notaOutputSchema } from '@schemas/notaSchema.js';
import { pausaSchema, pausaOutputSchema } from "@schemas/pausaSchema.js";
import { unissonoSchema, unissonoOutputSchema } from "@schemas/quialteraSchema.js";
import { tempoDuracaoSchema, tempoDuracaoOutputSchema } from '@schemas/tempoDuracaoSchema.js';

/**
 * Validação de instâncias de classe (Domain) - Usado APENAS na entrada
 */
const instanciaMusical = z.any().refine(val => {
	// CORREÇÃO 1: Adicionado o 'return'
	return val && ['nota', 'pausa', 'unissono', 'quialtera'].includes(val.tipo);
}, {
	message: "Cada item deve ser um objeto JSON válido ou uma instância de Nota, Pausa, Unissono ou Quialtera."
});

/**
 * Validação do array de notas/pausas para entrada.
 */
const arrayNotasSchema = z.array(
	z.union([
		z.lazy(() => notaSchema),
		z.lazy(() => pausaSchema),
		z.lazy(() => unissonoSchema),
		z.lazy(() => quialteraSchema),
		instanciaMusical // Permitimos instâncias entrarem
	])
).min(1, {
	message: "Uma quialtera deve conter pelo menos um item."
});

/**
 * Validação do array de notas/pausas para saída.
 */
const arrayNotasOutputSchema = z.array(
	z.union([
		z.lazy(() => notaOutputSchema),
		z.lazy(() => pausaOutputSchema),
		z.lazy(() => unissonoOutputSchema),
		z.lazy(() => quialteraOutputSchema)
		// CORREÇÃO 3: instanciaMusical removida. A saída DEVE forçar a serialização.
	])
).min(1, { message: "Um unissono deve conter pelo menos uma nota." });

/**
 * Schema de entrada para as opções do Unissono.
 * (Nota: Acidentes mantidos conforme a sua instrução)
 */
const quialteraOptionsSchema = z.object({
	// --- INFRAESTRUTURA ---
	obra: z.any().nullable().default(null),
	voz: z.any().nullable().default(null),
	compasso: z.any().nullable().default(null),
	unidadeTempo: tempoDuracaoSchema.nullable().default(null).transform((val) => {
		// Se for null ou undefined, retorna null para não quebrar o código
		if (!val) return null;
		// Se houver valor, retorna a string formatada
		return `${val.numerador}/${val.denominador}`;
	}),
	acordes: z.union([z.string(), z.array(z.string())]).default([]),

	// --- ACENTUAÇÃO E ARTICULAÇÃO ---
	acento: z.boolean().default(false),
	marcato: z.boolean().default(false),
	staccato: z.boolean().default(false),
	staccatissimo: z.boolean().default(false),
	tenuto: z.boolean().default(false),
	fermata: z.boolean().default(false),
	fermataInvertida: z.boolean().default(false),
	breath: z.boolean().default(false),

	// --- ORNAMENTOS ---
	mordente: z.boolean().default(false),
	upperMordent: z.boolean().default(false),
	trinado: z.boolean().default(false),
	turn: z.boolean().default(false),
	roll: z.boolean().default(false),

	// --- TÉCNICAS ---
	hammerOn: z.boolean().default(false),
	pullOff: z.boolean().default(false),
	ligada: z.boolean().default(false),
	pizzicato: z.boolean().default(false),
	snapPizzicato: z.boolean().default(false),
	downBow: z.boolean().default(false),
	upBow: z.boolean().default(false),
	openString: z.boolean().default(false),
	thumb: z.boolean().default(false),

	// --- OUTROS ---
	ghostNote: z.boolean().default(false),
	arpeggio: z.boolean().default(false),
	graceNote: z.array(
		z.union([
			z.lazy(() => notaSchema),
			z.lazy(() => unissonoSchema),
			z.lazy(() => quialteraSchema)
		])
	).nullable().default(null),

	// CORREÇÃO APLICADA: dedilhado passa a ser um Array para suportar a digitação de acordes!
	dedilhado: z.array(z.string()).nullable().default([]),

	// --- DINÂMICAS ---
	dinamicaSuave: z.number().int().min(0).max(3).default(0),
	dinamicaForte: z.number().int().min(0).max(3).default(0),
	dinamicaMeioForte: z.boolean().default(false),

	// --- EXPRESSÃO ---
	crescendo: z.enum(['inicio', 'fim']).nullable().default(null),
	diminuendo: z.enum(['inicio', 'fim']).nullable().default(null),

	// --- ACIDENTES ---
	sustenido: z.boolean().default(false),
	bemol: z.boolean().default(false),
	beQuad: z.boolean().default(false),
	// forceQ: Define o "orçamento de tempo" da quialtera para substituir o calculado (o 'q' do prefixo p:q:r)
	forceQ: z.number().int().nullable().default(null),
	// forceR: Define o escopo visual da linha da quiáltera da quialtera para substituir n notas (o 'r' do prefixo p:q:r)
	forceR: z.number().int().nullable().default(null),
});

/**
 * SCHEMA DE ENTRADA (Input)
 * Valida a estrutura JSON e aplica os defaults antes da instanciação.
 */
export const quialteraSchema = z.object({
	tipo: z.literal( 'quialtera' ).default( 'quialtera' ),
	notas: arrayNotasSchema,
	duracao: tempoDuracaoSchema.transform((val) => { return `${val.numerador}/${val.denominador}` }),
	options: quialteraOptionsSchema.default({})
}).strict()
	.transform((val) => {
		const cleanOptions = Object.fromEntries(
			Object.entries(val.options).filter(([key, value]) => {
				if (value === false) return false;
				if (value === null || value === undefined) return false;
				if (value === "") return false;
				if (value === 0) return false; // Limpa dinâmicas zeradas
				if (Array.isArray(value) && value.length === 0) return false; // Limpa dedilhados/acordes/graceNotes vazios
				return true;
			})
		);
		return { ...val, options: cleanOptions };
	});

// ============================================================================

/**
 * SCHEMA DE SAÍDA (Output)
 * Serializa a instância da classe Unissono para um JSON plano e otimizado.
 */
export const quialteraOutputSchema = z.object({
	tipo: z.literal( 'quialtera' ).default( 'quialtera' ),
	notas: arrayNotasOutputSchema,
	duracao: tempoDuracaoOutputSchema.transform((val) => { return val.duracao }),
	// Lê as propriedades internas (geralmente mapeadas como _options na classe)
	_options: quialteraOptionsSchema
}).transform((val) => {
	// OTIMIZAÇÃO: Remove propriedades que possuem o valor padrão (false, 0, null, [])
	const cleanOptions = Object.fromEntries(
		Object.entries(val._options).filter(([key, value]) => {
			if (value === false) return false;
			if (value === null || value === undefined) return false;
			if (value === 0) return false;
			if (value === "") return false;
			if (Array.isArray(value) && value.length === 0) return false;
			return true;
		})
	);

	return {
		// CORREÇÃO 2: Apenas repassa o valor da string, sem recriar o schema Zod
		tipo: val.tipo,
		notas: val.notas,
		duracao: val.duracao,
		options: cleanOptions
	};
});
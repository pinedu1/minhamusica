import { z } from 'zod';
import { tempoDuracaoSchema, tempoDuracaoOutputSchema, tempoDuracaoOutputStringSchema } from "@schemas/tempoDuracaoSchema.js";

// ============================================================================
// SCHEMAS DE ENTRADA (INPUT)
// ============================================================================

/**
 * Schema isolado para as opções da Pausa.
 * Resolve a redundância agrupando todas as configurações em um só lugar.
 */
const pausaOptionsSchema = z.object({
	fermata: z.boolean().default(false),
	fermataInvertida: z.boolean().default(false),
	breath: z.boolean().default(false),
	invisivel: z.boolean().default(false),
	pausaDeCompasso: z.boolean().default(false),
	acordes: z.union([z.string(), z.array(z.string())]).nullable().optional().default([]),
	letra: z.union([z.string(), z.array(z.string())]).nullable().optional().default([]),
	unidadeTempo: tempoDuracaoSchema.nullable().optional().default(null),
	obra: z.any().nullable().default(null),
	voz: z.any().nullable().default(null),
	compasso: z.any().nullable().default(null)
});

/**
 * Schema principal de entrada da Pausa.
 * Lê a duração e delega todas as outras propriedades para o options.
 */
export const pausaSchema = z.object({
	tipo: z.literal('pausa').default('pausa'),
	duracao: tempoDuracaoSchema.transform((val) => `${val.numerador}/${val.denominador}`),
	options: pausaOptionsSchema.default({})
})
	.strict()
	.transform((val) => {
		// OTIMIZAÇÃO: Limpamos false, null e arrays vazios para não inflar a instância
		const cleanOptions = Object.fromEntries(
			Object.entries(val.options).filter(([key, value]) => {
				if (value === false) return false;
				if (value === null || value === undefined) return false;
				if (value === "") return false;
				if (Array.isArray(value) && value.length === 0) return false;
				return true;
			})
		);

		// Retornamos um objeto simples e direto (adeus redundância e função pick!)
		return {
			tipo: val.tipo,
			duracao: val.duracao,
			options: cleanOptions
		};
	});

// ============================================================================
// SCHEMAS DE SAÍDA (OUTPUT)
// ============================================================================

/**
 * Schema de saída para as opções da Pausa.
 * Lê da instância para serializar o JSON.
 */
const pausaOptionsOutputSchema = z.object({
	fermata: z.boolean().default(false),
	fermataInvertida: z.boolean().default(false),
	breath: z.boolean().default(false),
	invisivel: z.boolean().default(false),
	pausaDeCompasso: z.boolean().default(false),
	acordes: z.union([z.string(), z.array(z.string())]).default([]),
	// Forçamos a letra a sempre sair como Array na serialização, conforme combinado
	letra: z.array(z.string()).nullable().default([]),
	unidadeTempo: tempoDuracaoOutputStringSchema.nullable().default(null),
	obra: z.any().nullable().default(null),
	voz: z.any().nullable().default(null),
	compasso: z.any().nullable().default(null)
});

/**
 * Schema principal de saída da Pausa.
 */
export const pausaOutputSchema = z.object({
	tipo: z.literal('pausa').default('pausa'),
	duracao: tempoDuracaoOutputStringSchema,
	_options: pausaOptionsOutputSchema // Lê direto do _options interno da classe Pausa
}).transform((val) => {
	// OTIMIZAÇÃO DO JSON FINAL: Remove lixo do payload de saída
	const cleanOptions = Object.fromEntries(
		Object.entries(val._options).filter(([key, value]) => {
			if (value === false) return false;
			if (value === null || value === undefined) return false;
			if (value === "") return false;
			if (Array.isArray(value) && value.length === 0) return false;
			return true;
		})
	);

	return {
		tipo: val.tipo,
		duracao: val.duracao,
		options: cleanOptions
	};
});
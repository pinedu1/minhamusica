import { z } from 'zod';
import { notaSchema, notaOutputSchema } from '@schemas/notaSchema.js';
import { pausaSchema, pausaOutputSchema } from "@schemas/pausaSchema.js";
import { quialteraSchema, quialteraOutputSchema } from "@schemas/quialteraSchema.js";
import { unissonoSchema, unissonoOutputSchema } from "@schemas/unissonoSchema.js";

/**
 * Validação de instâncias de classe (Domain) - Usado APENAS na entrada
 */
const instanciaMusical = z.any().refine(val => {
	return val && ['nota', 'pausa', 'unissono', 'quialtera'].includes(val.tipo);
}, {
	message: "Cada item deve ser um objeto JSON válido ou uma instância de Nota, Pausa, Unissono ou Quialtera."
});

/**
 * Validação do array de notas/pausas para entrada.
 */
export const arrayElementosSchema = z.array(
	z.union([
		z.lazy(() => notaSchema),
		z.lazy(() => pausaSchema),
		z.lazy(() => unissonoSchema),
		z.lazy(() => quialteraSchema),
		instanciaMusical // Permitimos instâncias entrarem
	])
);
/**
 * Validação do array de notas/pausas para saída.
 */
export const arrayElementosOutputSchema = z.array(
	z.union([
		z.lazy(() => notaOutputSchema),
		z.lazy(() => pausaOutputSchema),
		z.lazy(() => unissonoOutputSchema),
		z.lazy(() => quialteraOutputSchema)
		// CORREÇÃO 3: instanciaMusical removida. A saída DEVE forçar a serialização.
	])
);

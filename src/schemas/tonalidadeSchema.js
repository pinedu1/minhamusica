import { z } from 'zod';
import { Tonalidade, TonalidadeEnum } from '@domain/compasso/Tonalidade.js';

const chavesTonalidade = Object.keys(TonalidadeEnum);

export const tonalidadeSchema = z.union([
	z.instanceof(Tonalidade),
	z.object({
		valor: z.string(),
		acidentes: z.number(),
		tipo: z.enum(['#', 'b', 'n']),
		notas: z.array(z.string())
	}).refine(val => {
		return Object.values(TonalidadeEnum).some(t => t.valor === val.valor);
	}),
	z.enum([chavesTonalidade[0], ...chavesTonalidade.slice(1)])
]);

// ============================================================================
// CLOSURE REUTILIZÁVEL DE EXTRAÇÃO
// ============================================================================

/**
 * Helper para extrair apenas a string da chave (ex: 'G#', 'C')
 * de qualquer tipo de entrada (Instância, Objeto ou String).
 */
const extrairChaveTonalidade = (val) => {
	// Se já for a string da chave, retorna ela mesma
	if (typeof val === 'string') {
		return val;
	}

	// Se for uma instância ou objeto com a propriedade 'valor'
	if (val && typeof val === 'object' && val.valor) {
		const chave = Object.keys(TonalidadeEnum).find(
			k => TonalidadeEnum[k].valor === val.valor
		);
		return chave || 'C'; // Retorna a chave encontrada ou 'C' como fallback
	}

	return 'C'; // Fallback final de segurança
};


// ============================================================================
// SCHEMAS DE SAÍDA (OUTPUT)
// ============================================================================

/**
 * NOVO: Schema para exportação apenas da STRING pura.
 * Transforma a entrada e retorna APENAS 'Chave' (ex: 'C', 'G#')
 */
export const tonalidadeOutputStringSchema = z.preprocess(
	(val) => extrairChaveTonalidade(val),
	z.string()
);

/**
 * Schema para exportação do OBJETO simplificado.
 * Transforma a entrada e retorna { tonalidade: 'Chave' }
 */
export const tonalidadeOutputSchema = z.preprocess(
	(val) => ({ tonalidade: extrairChaveTonalidade(val) }),
	z.object({
		tonalidade: z.string()
	})
);
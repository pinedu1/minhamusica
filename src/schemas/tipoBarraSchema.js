import { z } from 'zod';
import { TipoBarra } from '@domain/compasso/TipoBarra.js';

// Extrai as chaves (ex: 'NONE', 'STANDARD', 'REPEAT_OPEN')
const chavesTipoBarra = Object.keys(TipoBarra).filter(key => typeof TipoBarra[key] !== 'function');

export const tipoBarraSchema = z.union([
	// 1. Permite o objeto literal do enum (ex: TipoBarra.DOUBLE)
	z.object({
		nome: z.string(),
		abc: z.string()
	}).refine(val => {
		return Object.values(TipoBarra).some(t => t.nome === val.nome);
	}),

	// 2. Permite passar diretamente a chave como string (ex: 'FINAL')
	z.enum([chavesTipoBarra[0], ...chavesTipoBarra.slice(1)])
]);


// ============================================================================
// CLOSURE REUTILIZÁVEL DE EXTRAÇÃO
// ============================================================================

/**
 * Helper para extrair apenas a string da chave (ex: 'REPEAT_OPEN', 'FINAL')
 * de qualquer tipo de entrada (Objeto Enum ou String).
 */
const extrairChaveTipoBarra = (val) => {
	// Se recebermos a chave diretamente como string válida no enum
	if (typeof val === 'string' && TipoBarra[val]) {
		return val;
	}

	// Se recebermos o objeto do enum {nome, abc}
	if (val && typeof val === 'object' && val.nome) {
		const chave = Object.keys(TipoBarra).find(
			k => TipoBarra[k].nome === val.nome
		);
		return chave || 'NONE'; // Retorna a chave ou 'NONE' como fallback
	}

	return 'NONE'; // Fallback final de segurança
};


// ============================================================================
// SCHEMAS DE SAÍDA (OUTPUT)
// ============================================================================

/**
 * NOVO: Schema para exportação apenas da STRING pura.
 * Transforma a entrada e retorna APENAS 'Chave' (ex: 'REPEAT_OPEN')
 */
export const tipoBarraOutputStringSchema = z.preprocess(
	(val) => extrairChaveTipoBarra(val),
	z.string()
);

/**
 * Schema para exportação do OBJETO simplificado.
 * Transforma a entrada no formato: { tipoBarra: 'REPEAT_OPEN' }
 */
export const tipoBarraOutputSchema = z.preprocess(
	(val) => ({ tipoBarra: extrairChaveTipoBarra(val) }),
	z.object({
		tipoBarra: z.string()
	})
);
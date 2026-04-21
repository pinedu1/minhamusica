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
/**
 * Schema para exportação simplificada do Tipo de Barra.
 * Transforma a entrada no formato: { tipoBarra: 'REPEAT_OPEN' }
 */
export const tipoBarraOutputSchema = z.preprocess((val) => {
	// Se recebermos a chave diretamente como string
	if (typeof val === 'string' && TipoBarra[val]) {
		return { tipoBarra: val };
	}

	// Se recebermos o objeto do enum {nome, abc}
	if (val && typeof val === 'object' && val.nome) {
		const chave = Object.keys(TipoBarra).find(
			k => TipoBarra[k].nome === val.nome
		);
		return { tipoBarra: chave || 'NONE' };
	}

	return val;
}, z.object({
	tipoBarra: z.string()
}));
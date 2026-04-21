// tonalidadeSchema.js (Atualização do Schema)
import { z } from 'zod';
import { Tonalidade, TonalidadeEnum } from '@domain/compasso/Tonalidade.js';

const chavesTonalidade = Object.keys(TonalidadeEnum);

export const tonalidadeSchema = z.union([
	z.instanceof(Tonalidade),
	z.object({
		valor: z.string(),
		acidentes: z.number(),
		tipo: z.enum(['#', 'b', 'n']),
		notas: z.array(z.string()) // Nova propriedade ampliada
	}).refine(val => {
		return Object.values(TonalidadeEnum).some(t => t.valor === val.valor);
	}),
	z.enum([chavesTonalidade[0], ...chavesTonalidade.slice(1)])
]);

/**
 * Schema para exportação simplificada do objeto tonalidade.
 * Transforma a entrada em { tonalidade: 'Chave' }
 */
export const tonalidadeOutputSchema = z.preprocess((val) => {
	if (val instanceof Tonalidade) {
		// Busca a chave no Enum que corresponde ao valor da instância
		const chave = Object.keys(TonalidadeEnum).find(
			k => TonalidadeEnum[k].valor === val.valor
		);
		return { tonalidade: chave || 'C' };
	}

	if (typeof val === 'string') {
		return { tonalidade: val };
	}

	if (val && typeof val === 'object' && val.valor) {
		const chave = Object.keys(TonalidadeEnum).find(
			k => TonalidadeEnum[k].valor === val.valor
		);
		return { tonalidade: chave || 'C' };
	}

	return val;
}, z.object({
	tonalidade: z.string()
}));

// Exemplo de uso:
// const output = tonalidadeOutputSchema.parse(instanciaTonalidade);
// Resultado: { tonalidade: 'G#' } (para G#)
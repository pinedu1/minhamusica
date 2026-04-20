/**
 * @file notaFrequenciaSchema.js
 * @description Centraliza as regras de validação de dados para a altura da nota.
 * ZERO DEPENDÊNCIAS DE DOMÍNIO: Este schema apenas garante que o formato do
 * dado recebido ou enviado está correto (Strings ou Objetos Planos).
 */

import { z } from 'zod';

/**
 * SCHEMA DE ENTRADA (Input Validator)
 * Aceita a string compacta ("C4", "C") ou o objeto plano detalhado.
 * Não instancia classes. Apenas garante a integridade da tipagem.
 */
export const notaFrequenciaSchema = z.union([
	// Se o JSON enviar apenas a chave ou notação ABC: "C4" ou "C"
	z.string().min(1, "A string de altura não pode ser vazia."),

	// Se o JSON enviar o objeto detalhado, apenas a 'key' é estritamente necessária
	z.object({
		key: z.string(),
		abc: z.string().nullable().optional(),
		midi: z.number().int().nullable().optional()
	}).strict()
]);
// ============================================================================

/**
 * SCHEMA DE SAÍDA (Output Serializer)
 * Lê as propriedades (getters) da instância e exporta apenas a string compacta.
 * Não precisa saber o que é a classe NotaFrequencia, apenas que o objeto
 * passado possui a propriedade 'key'.
 */
export const notaFrequenciaOutputSchema = z.object({
	key: z.string(),
	abc: z.string(),
	midi: z.number().int()
}).transform((val) => {
	// Exporta apenas a string identificadora (ex: "C4") para otimizar o JSON
	return val.key;
});
import { z } from 'zod';
import { notaSchema } from './notaSchema.js';
import { tempoDuracaoSchema } from './tempoDuracaoSchema.js';

/**
 * Schema para validação de dados de um Acorde Musical.
 * Reflete as propriedades da classe Acorde e garante a integridade dos dados antes da instanciação.
 */
export const acordeSchema = z.object({
    // O acorde é composto por um array de notas (conforme definido no notaSchema)
    notas: z.array(
        z.union([
            notaSchema,
            z.any().refine(val => val && val.constructor.name === 'Nota', {
                message: "Cada nota deve ser um objeto válido ou uma instância de Nota."
            })
        ])
    ).min(1, {
        message: "Um acorde deve conter pelo menos uma nota."
    }),
    // Duração global do acorde (ex: "1/4", "1/2")
    duracao: tempoDuracaoSchema,

    // Opções de execução e contexto hierárquico
    options: z.object({
        // Contexto (aceita objetos ou null)
        obra: z.any().optional().nullable(),
        voz: z.any().optional().nullable(),
        compasso: z.any().optional().nullable(),
        unidadeTempo: tempoDuracaoSchema.optional().nullable(),

        // Acentuação e Articulações
        acento: z.boolean().default(false),
        marcato: z.boolean().default(false),
        staccato: z.boolean().default(false),
        staccatissimo: z.boolean().default(false),
        tenuto: z.boolean().default(false),

        // Técnicas e Ornamentos
        ligada: z.boolean().default(false),
        arpeggio: z.boolean().default(false),
        fermata: z.boolean().default(false),
        ghostNote: z.boolean().default(false),
        roll: z.boolean().default(false),
        trinado: z.boolean().default(false),
        mordente: z.boolean().default(false),
        upperMordent: z.boolean().default(false),

        // Notas de adorno (pode ser null ou um array de notas)
        graceNote: z.union([
            z.literal(false),
            z.null(),
            z.array(
                z.union([
                    notaSchema,
                    // Aceita instâncias da classe Nota sem precisar importar a classe Nota aqui
                    z.any().refine(val => val && val.constructor.name === 'Nota', {
                        message: "Deve ser uma instância de Nota ou um objeto válido de Nota"
                    })
                ])
            )
        ]).default(null),

        // Texto de dedilhado (ex: "1", "p", "m")
        dedilhado: z.union([z.string(), z.number()]).nullable().default(null),
    }).default({})
});
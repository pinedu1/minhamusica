import { z } from 'zod';
import { compassoSchema } from '@schemas/compassoSchema.js';
import { tempoDuracaoSchema } from '@schemas/tempoDuracaoSchema.js';
import { tempoMetricaSchema } from '@schemas/tempoMetricaSchema.js';

/**
 * Schema principal da Voz
 */
export const vozSchema = z.object({
    // ID da voz pode ser string ou número
    // ID obrigatório, validando strings sem espaços ou números inteiros positivos
    id: z.union([
        z.string()
            .trim()
            .min(1, { message: "O ID da voz não pode ser uma string vazia." })
            .regex(/^[a-zA-Z0-9_]+$/, { message: "O ID da voz deve conter apenas letras, números e sublinhados (sem espaços)." }),

        z.number()
            .int({ message: "O ID numérico deve ser um número inteiro." })
            .positive({ message: "O ID numérico deve ser maior que zero." })
    ], {
        required_error: "O ID da voz é obrigatório.",
        invalid_type_error: "O ID deve ser texto (string) ou número (number)."
    }),

    // Aceita tanto objetos JSON de compassos quanto instâncias da classe Compasso
    compassos: z.array(
        z.union([
            compassoSchema,
            z.any().refine(val => val && val.constructor.name === 'Compasso', {
                message: "Cada item deve ser uma instância de Compasso ou um objeto válido de Compasso."
            })
        ])
    ).default([]),

    // Metadados e configurações de visualização/playback da voz
    options: z.object({
        obra: z.any().optional().nullable(), // Refine para evitar import circular com Obra

        unidadeTempo: tempoDuracaoSchema.optional().nullable(),
        metrica: tempoMetricaSchema.optional().nullable(),

        nome: z.string().optional().nullable(),
        sinonimo: z.string().optional().nullable(),

        // Enumeração rígida para direção das hastes
        direcaoHaste: z.enum(['auto', 'up', 'down']).default('auto'),

        clave: z.any().optional().nullable(), // Assume Clave ou JSON da Clave

        stafflines: z.number().int().positive().optional().nullable(),
        middle: z.string().optional().nullable(),

        // Configuração de formatação do ABC
        quebraDeLinha: z.number().int().min(1).default(5)
    }).default({})
});
import { z } from 'zod';
import { uniaoTempoDuracao } from '@schemas/tempoDuracaoSchema.js';
import { notaFrequenciaSchema } from '@schemas/notaFrequenciaSchema.js';

export const notaSchema = z.object({
    altura: notaFrequenciaSchema,
    duracao: uniaoTempoDuracao, // Aceitará "1/4" se o regex estiver lá
    options: z.object({
        obra: z.any().nullable().optional(),
        voz: z.any().nullable().optional(),
        compasso: z.any().nullable().optional(),
        unidadeTempo: uniaoTempoDuracao.nullable().optional(),

        acento: z.boolean().default(false),
        marcato: z.boolean().default(false),
        staccato: z.boolean().default(false),
        staccatissimo: z.boolean().default(false),
        tenuto: z.boolean().default(false),

        hammerOn: z.boolean().default(false),
        pullOff: z.boolean().default(false),
        ligada: z.boolean().default(false),

        mordente: z.boolean().default(false),
        upperMordent: z.boolean().default(false),
        trinado: z.boolean().default(false),
        roll: z.boolean().default(false),

        fermata: z.boolean().default(false),
        ghostNote: z.boolean().default(false),
        graceNote: z.any().nullable().optional(), // Pode ser Array<Nota> futuramente
        arpeggio: z.boolean().default(false),
        dedilhado: z.string().nullable().optional(),

        sustenido: z.boolean().default(false),
        beQuad: z.boolean().default(false)
    }).default({})
}).strict();
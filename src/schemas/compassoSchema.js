import { z } from 'zod';
import { notaSchema } from '@schemas/notaSchema.js';
import { pausaSchema } from '@schemas/pausaSchema.js';
import { unissonoSchema } from '@schemas/unissonoSchema.js';
import { tempoDuracaoSchema } from '@schemas/tempoDuracaoSchema.js';
import { tempoMetricaSchema } from '@schemas/tempoMetricaSchema.js';
import { tipoBarraSchema } from '@schemas/tipoBarraSchema.js';

/**
 * Schema para validação de anotações e cifras
 */
const anotacaoSchema = z.object({
    texto: z.string(),
    posicao: z.number().int().min(0),
    local: z.string().optional().default("_")
});

const cifraSchema = z.object({
    texto: z.string(),
    posicao: z.number().int().min(0)
});

/**
 * Schema principal do Compasso
 */
export const compassoSchema = z.object({
    // Elementos podem ser objetos de dados ou instâncias já criadas
    elementos: z.array(
        z.union([
            notaSchema,
            pausaSchema,
            unissonoSchema,
            z.any().refine(val =>
                    val && ['Nota', 'Pausa', 'Unissono'].includes(val.constructor.name),
                { message: "O elemento deve ser uma instância de Nota, Pausa ou Unissono" }
            )
        ])
    ).default([]),

    options: z.object({
        // Referências circulares tratadas com refine para evitar importação de Voz/Obra aqui
        voz: z.any().optional().nullable(),
        obra: z.any().optional().nullable(),

        anotacoes: z.array(anotacaoSchema).default([]),
        cifras: z.array(cifraSchema).default([]),
        letra: z.array(z.string()).default([]),

        // Estruturas de Tempo
        unidadeTempo: tempoDuracaoSchema.optional().nullable(),
        metrica: tempoMetricaSchema.optional().nullable(),

        // Enums e Objetos de configuração
        barraInicial: tipoBarraSchema.optional().nullable(),
        barraFinal: tipoBarraSchema.optional().nullable(),
        mudancaDeTom: z.any().optional().nullable(), // Tonalidade
    }).default({})
});
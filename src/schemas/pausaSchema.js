import { z } from 'zod';
import {tempoDuracaoSchema} from '@schemas/tempoDuracaoSchema.js';

export const pausaSchema = z.object({
    duracao: tempoDuracaoSchema,

    // Agrupamos o que pertence ao #options para garantir a estrutura
    options: z.object({
        fermata: z.boolean().nullable().optional().default(false),
	    fermataInvertida: z.boolean().nullable().optional().default(false),
        breath: z.boolean().nullable().optional().default(false),
        invisivel: z.boolean().nullable().optional().default(false),
        acordes: z.union([z.string(), z.array(z.string())]).nullable().optional().default([]),
        unidadeTempo: tempoDuracaoSchema.nullable().optional().default(null),
	    pausaDeCompasso: z.boolean().nullable().optional().default(false),

        // Referências de contexto
        obra: z.any().nullable().optional().default(null),
        voz: z.any().nullable().optional().default(null),
        compasso: z.any().nullable().optional().default(null)
    }).optional().default({}) // Se não enviar options, ele cria um objeto vazio com defaults
}).strict();
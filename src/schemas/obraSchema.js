import { z } from 'zod';
import { vozSchema } from '@schemas/vozSchema.js';
import { tempoDuracaoSchema } from '@schemas/tempoDuracaoSchema.js';
import { tempoMetricaSchema } from '@schemas/tempoMetricaSchema.js';
import { tempoAndamentoSchema } from '@schemas/tempoAndamentoSchema.js';
import { tonalidadeSchema } from '@schemas/tonalidadeSchema.js';
import { ritmoSchema } from '@schemas/ritmoSchema.js';
import { grupoInstrumentoSchema } from '@schemas/grupoInstrumentoSchema.js';
import { claveSchema } from '@schemas/claveSchema.js';

export const obraSchema = z.object({
    // X: Índice da obra (Reference Number). Deve ser inteiro positivo.
    index: z.number().int().positive().default(1),

    // Array de vozes da música
    vozes: z.array(
        z.union([
            vozSchema,
            z.any().refine(val => val && val.constructor.name === 'Voz', {
                message: "Cada item deve ser uma instância de Voz ou um objeto válido de Voz."
            })
        ])
    ).default([]),

    // Opções e metadados globais da música
    options: z.object({
        // Básico
        titulo: z.union([z.string(), z.array(z.string())]).nullable().optional(),
        compositor: z.array(z.string()).default([]),
        
        // Tempos e rítmica
        unidadeTempo: z.union([
            tempoDuracaoSchema,
            z.any().refine(val => val && val.constructor.name === 'TempoDuracao', {
                message: "Deve ser uma instância ou JSON de TempoDuracao."
            })
        ]).optional(),
        
        metrica: z.union([
            tempoMetricaSchema,
            z.any().refine(val => val && val.constructor.name === 'TempoMetrica', {
                message: "Deve ser uma instância ou JSON de TempoMetrica."
            })
        ]).optional(),
        
        tempoAndamento: z.union([
            tempoAndamentoSchema,
            z.any().refine(val => val && val.constructor.name === 'TempoAndamento', {
                message: "Deve ser uma instância ou JSON de TempoAndamento."
            })
        ]).nullable().optional(),
        
        // Tonalidade
        tonalidade: z.union([
            tonalidadeSchema,
            z.any().refine(val => val && val.constructor.name === 'Tonalidade', {
                message: "Deve ser uma instância ou JSON de Tonalidade."
            })
        ]).optional(),

        clave: z.union([
            claveSchema,
            z.any().refine(val => val && val.constructor.name === 'Clave', {
                message: "Deve ser uma instância ou JSON de Clave."
            })
        ]).optional(),

        // Outros objetos complexos
        ritmo: ritmoSchema.nullable().optional(),
        grupoInstrumento: grupoInstrumentoSchema.nullable().optional(),

        // Textos, Metadados Geográficos e Editoriais
        areaGeografica: z.string().nullable().optional(),
        origemGeografica: z.string().nullable().optional(),
        livro: z.array(z.string()).default([]),
        discografia: z.array(z.string()).default([]),
        nomeArquivo: z.string().nullable().optional(),
        historia: z.array(z.string()).default([]),
        informacoes: z.array(z.string()).default([]),
        notas: z.array(z.string()).default([]),
        partes: z.string().nullable().optional(),
        fonte: z.array(z.string()).default([]),
        letra: z.array(z.string()).nullable().optional(),
        notaTranscricao: z.union([z.string(), z.array(z.string())]).nullable().optional()

    }).default({})
});
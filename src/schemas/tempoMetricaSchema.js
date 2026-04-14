import { z } from 'zod';

// 1. Formatos de dados puros
const formatoObjeto = z.object({
    numerador: z.number().int().positive(),
    denominador: z.number().int().positive()
}).strict();

const formatoStringObjeto = z.object({
    duracao: z.string().regex(/^\d+\/[1-9]\d*$/)
}).strict();

const formatoStringPura = z.string().regex(/^\d+\/[1-9]\d*$/);

// 2. A União (O "Motor" de validação)
export const uniaoTempoMetrica = z.union([
    formatoObjeto,
    formatoStringObjeto,
    formatoStringPura,
    // Validação segura para evitar import circular
    z.any().refine((val) => {
        return val && typeof val === 'object' && val.constructor.name === 'TempoMetrica';
    }, { message: "Deve ser uma instância de TempoMetrica" })
]);

// 3. O EXPORT CORRIGIDO (Sem o objeto em volta)
// Antes era: z.object({ unidadeTempo: uniaoTempoDuracao }) -> ISSO CAUSA O ERRO
export const tempoMetricaSchema = uniaoTempoMetrica;
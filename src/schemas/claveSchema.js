import { z } from 'zod';
import { ClaveTipo } from '../model/obra/ClaveTipo.js';

// 1. Apenas JavaScript puro aqui, sem o "as [...]"
const chavesClave = Object.keys(ClaveTipo);

export const ClaveSchema = z.object({
    // 2. Usamos esta técnica de array ([item[0], ...resto]) para satisfazer o Zod no JavaScript puro
    tipo: z.enum([chavesClave[0], ...chavesClave.slice(1)], {
        errorMap: () => ({ message: `Tipo de Clave inválido. Deve ser uma das seguintes: ${chavesClave.join(', ')}` })
    }).default('TREBLE'),

    oitava: z.number({
        required_error: "A oitava é obrigatória",
        invalid_type_error: "A oitava deve ser um número"
    })
        .min(0, "A oitava deve ser no mínimo 0")
        .max(8, "A oitava deve ser no máximo 8")
        .default(0)
});
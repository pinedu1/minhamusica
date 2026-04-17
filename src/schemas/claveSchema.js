import { z } from 'zod';
import { ClaveTipo } from '../domain/obra/ClaveTipo.js';

const chavesClave = Object.keys(ClaveTipo);

// 1. Isolamos a regra do Enum para poder reaproveitá-la
const claveEnumSchema = z.enum([chavesClave[0], ...chavesClave.slice(1)], {
    errorMap: () => ({ message: `Clave inválida. Deve ser: ${chavesClave.join(', ')}` })
});

// 2. Mantemos o seu schema de objeto intacto, mas agora usando o enum isolado
const claveObjectSchema = z.object({
    tipo: claveEnumSchema.default('TREBLE').optional(),
    oitava: z.number({
        required_error: "A oitava é obrigatória",
        invalid_type_error: "A oitava deve ser um número"
    })
        .min(0, "A oitava deve ser no mínimo 0")
        .max(8, "A oitava deve ser no máximo 8")
        .default(0).optional()
});

// 3. Criamos a UNIÃO final exportada
// O Zod vai testar a primeira regra; se falhar, tenta a segunda.
export const claveSchema = z.union([
    claveObjectSchema,
    claveEnumSchema
]);
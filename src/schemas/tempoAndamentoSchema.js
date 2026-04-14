import { z } from 'zod';
import { uniaoTempoDuracao } from './tempoDuracaoSchema.js';

export const tempoAndamentoSchema = z.object({
    // Usa o schema já definido e modular para TempoDuracao,
    // garantindo validação robusta para instâncias, strings ("1/4") e objetos JSON {num, den}.
    tempo: uniaoTempoDuracao,
    duracao: z.number().int().positive({ message: "A duração deve ser um número inteiro e maior que zero." })
}).strict();

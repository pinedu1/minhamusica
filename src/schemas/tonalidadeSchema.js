import { z } from 'zod';
import { Tonalidade, TonalidadeEnum } from '../domain/compasso/Tonalidade.js';

// Extrai as chaves do enum (ex: 'A', 'Ab', 'Csm')
const chavesTonalidade = Object.keys(TonalidadeEnum);

export const tonalidadeSchema = z.union([
    // Permite que passem a própria instância da classe Tonalidade
    z.instanceof(Tonalidade),

    // Permite que passem o próprio objeto da constante
    z.object({
        valor: z.string(),
        acidentes: z.number(),
        tipo: z.enum(['#', 'b', 'n'])
    }).refine(val => {
        // Verifica se o objeto bate com algum valor do Enum original (proteção opcional)
        return Object.values(TonalidadeEnum).some(t => t.valor === val.valor);
    }),

    // Permite passar diretamente a chave (ex: 'A', 'Am')
    z.enum([chavesTonalidade[0], ...chavesTonalidade.slice(1)])
]);

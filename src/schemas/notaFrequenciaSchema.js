import { z } from 'zod';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';

export const notaFrequenciaSchema = z.union([
    // 1. Aceita a instância direta
    z.instanceof(NotaFrequencia),

    // 2. Valida tanto Chaves (A4, C2) quanto ABC (A,,) dinamicamente
    z.string().refine((val) => {
        // Esta função só roda quando você chama .parse() ou .create(),
        // garantindo que os Maps já estejam povoados.
        return !!NotaFrequencia.getByKey(val) || !!NotaFrequencia.getByAbc(val);
    }, {
        message: "A altura especificada não foi encontrada no dicionário de frequências."
    })
]);
import { z } from 'zod';
import { GrupoInstrumento, GrupoInstrumentoAbc } from '../domain/obra/GrupoInstrumento.js';

export const grupoInstrumentoSchema = z.union([
    // 1. Aceita a instância já criada da classe
    z.instanceof(GrupoInstrumento),

    // 2. Aceita uma string que seja uma das chaves (ex: "CORDAS", "VOZES")
    z.enum(Object.keys(GrupoInstrumentoAbc))
]);

import { z } from 'zod';
import { Ritmo, RitmoAbc } from '@domain/obra/Ritmo.js';

export const ritmoSchema = z.union([
    // 1. Aceita a instância já criada da classe Ritmo
    z.instanceof(Ritmo),

    // 2. Aceita uma string que seja uma das chaves de RitmoAbc (ex: "REEL", "BAIAO")
    z.enum(Object.keys(RitmoAbc))
]);

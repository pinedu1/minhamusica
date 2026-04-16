import { z } from 'zod';
import { TipoBarra } from "../model/compasso/TipoBarra.js";

// 1. Extraímos as chaves e os valores válidos
const nomesValidos = Object.keys(TipoBarra).filter(k => k !== 'getByAbc');
const abcValidos = Object.values(TipoBarra)
    .filter(v => typeof v === 'object' && v !== null)
    .map(v => v.abc);

// 2. Criamos um Schema só para aceitar as Strings válidas (ex: "|")
const TipoBarraStringSchema = z.enum([abcValidos[0], ...abcValidos.slice(1)]);

// 3. Mantemos o seu Schema do Objeto intacto
const TipoBarraObjectSchema = z.object({
    nome: z.enum([nomesValidos[0], ...nomesValidos.slice(1)]),
    abc: z.enum([abcValidos[0], ...abcValidos.slice(1)])
}).refine(
    (dados) => {
        const tipoOriginal = TipoBarra[dados.nome];
        return tipoOriginal !== undefined && tipoOriginal.abc === dados.abc;
    },
    { message: "Combinação inválida de TipoBarra. O 'abc' não corresponde ao 'nome'." }
);

// 4. Juntamos tudo em uma Union Nullable!
export const tipoBarraSchema = z.union([
    TipoBarraStringSchema,
    TipoBarraObjectSchema
]).nullable();

// DICA: Se a propriedade puder não ser enviada (undefined),
// troque o .nullable() por .nullish()
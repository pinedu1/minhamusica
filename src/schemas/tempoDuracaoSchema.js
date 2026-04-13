import { z } from 'zod';

const formatoObjeto = z.object({
    numerador: z.number().int().positive(),
    denominador: z.number().int().positive()
}).strict();

const formatoString = z.object({
    duracao: z.string().regex(
        /^\d+\/[1-9]\d*$/,
        "Formato inválido. Use 'X/Y' e certifique-se de que o denominador é maior que 0."
    )
}).strict();

// Nova definição para aceitar a string pura "X/Y" diretamente
const formatoStringPura = z.string().regex(
    /^\d+\/[1-9]\d*$/,
    "Formato inválido. Use 'X/Y'."
);

// Agora a união aceita as TRÊS formas: objeto de números, objeto de string ou string pura
export const uniaoTempoDuracao = z.union([
    formatoObjeto,
    formatoString,
    formatoStringPura
]);

export const tempoDuracaoSchema = z.object({
    unidadeTempo: uniaoTempoDuracao
});
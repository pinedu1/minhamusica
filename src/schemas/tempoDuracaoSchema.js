import { z } from 'zod';

const regex = /^[0-9]+\/(?!0+$)[0-9]+$/;
const formatoObjeto = z.object({
    duracao: z.string().regex(regex)
}).strict();

const formatoStringPura = z.string().regex( regex );

export const uniaoTempoDuracao = z.union([
    formatoObjeto,
    formatoStringPura,
]);

export const tempoDuracaoSchema = uniaoTempoDuracao;

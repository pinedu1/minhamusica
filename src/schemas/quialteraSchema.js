/**
 * @file quialteraSchema.js
 * @description Schema de validação e serialização para a entidade Unissono.
 * Gerencia a composição de múltiplas notas/pausas com uma duração global e opções compartilhadas.
 */

import { z } from 'zod';
export const quialteraSchema = z.object();
export const quialteraOutputSchema = z.object();

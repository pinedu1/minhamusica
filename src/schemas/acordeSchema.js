import { z } from 'zod';

export const acordeSchema = z.array(z.string()).default([]);
export const acordeOutputSchema = z.array(z.string());

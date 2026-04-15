import { describe, it, expect } from 'vitest';
import { Obra } from '../model/obra/Obra.js';
import { mzk_0 } from '../data/score.js';

/**
 * Limpa e normaliza uma string ABC para comparação.
 * Remove comentários, espaços extras, e linhas em branco.
 * @param {string} abcString
 * @returns {string}
 */
const normalizeAbc = (abcString) => {
    return abcString
        .split('\n')
        .map(line => {
            const commentIndex = line.indexOf('%');
            return (commentIndex !== -1 ? line.substring(0, commentIndex) : line).trim();
        })
        .filter(line => line.length > 0)
        .join('\n');
};

describe('Obra Parser', () => {
    it('should parse and reconstruct mzk_0 without loss of data', () => {
        // 1. Parsing da string ABC para o modelo de objetos
        const obra = Obra.parseAbc(mzk_0);

        // 2. Geração da string ABC a partir do modelo de objetos
        const abcGerado = obra.toAbc();

        // 3. Comparação
        const originalNormalizada = normalizeAbc(mzk_0);
        const geradaNormalizada = normalizeAbc(abcGerado);

        expect(geradaNormalizada).toBe(originalNormalizada);
    });
});

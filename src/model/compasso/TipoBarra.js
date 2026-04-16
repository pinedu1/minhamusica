/**
 * Enum para tipos de barra de compasso com mapeamento para notação ABC.
 * @enum {{nome: string, abc: string}}
 */
export const TipoBarra = Object.freeze({
    NONE: { nome: 'NONE', abc: '' },
    STANDARD: { nome: 'STANDARD', abc: '|' },
    DOUBLE: { nome: 'DOUBLE', abc: '||' },
    FINAL: { nome: 'FINAL', abc: '|]' },
    REPEAT_OPEN: { nome: 'REPEAT_OPEN', abc: '|:' },
    REPEAT_CLOSE: { nome: 'REPEAT_CLOSE', abc: ':|' },
    REPEAT_BOTH: { nome: 'REPEAT_BOTH', abc: ':|:' },
    DASHED: { nome: 'DASHED', abc: 'y' }, // 'y' ou '.' dependendo da implementação ABC
    /**
     * Retorna o objeto TipoBarra com base na string da notação ABC.
     * @param {string} abcStr - A string da notação ABC (ex: '|:', '||').
     * @returns {{nome: string, abc: string} | undefined} O tipo correspondente ou undefined.
     */
    getByAbc: function(abcStr) {
        // Itera pelos valores do próprio objeto ignorando o método 'get'
        return Object.values(this).find(tipo => tipo.abc === abcStr);
    }
});

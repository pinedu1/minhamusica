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
    DASHED: { nome: 'DASHED', abc: 'y' } // 'y' ou '.' dependendo da implementação ABC
});

/**
 * Enum para tipos de barra de compasso.
 * @enum {string}
 */
export const TipoBarra = Object.freeze({
    NONE: 'NONE',             // Sem barra (transparente)
    STANDARD: 'STANDARD',     // |
    DOUBLE: 'DOUBLE',         // ||
    FINAL: 'FINAL',           // || (grossa)
    REPEAT_OPEN: 'REPEAT_OPEN',   // |:
    REPEAT_CLOSE: 'REPEAT_CLOSE', // :|
    REPEAT_BOTH: 'REPEAT_BOTH',   // :|:
    DASHED: 'DASHED'          // ¦ (tracejada)
});
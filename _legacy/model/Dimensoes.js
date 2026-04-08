/**
 * Gerencia a métrica física e temporal de um elemento musical.
 */
export class Dimensoes {
    /** @type {number} */
    visual = 0;
    /** @type {number} */
    audio = 0;

    constructor(visual = 0, audio = 0) {
        this.visual = visual;
        this.audio = audio;
    }

    /**
     * Calcula a largura necessária para o Canvas baseado na densidade rítmica.
     * @param {Array<any>} vozes - Lista de vozes do compasso para análise.
     * @param {number} fatorEscala - Multiplicador de espaçamento (default 100).
     */
    atualizarVisual(vozes, fatorEscala = 100) {
        if (!vozes || vozes.length === 0) {
            this.visual = fatorEscala; // Largura mínima para compasso vazio
            return;
        }

        // Busca a voz com maior número de eventos (notas/pausas)
        const densidade = vozes.reduce((max, voz) =>
            Math.max(max, (voz.eventos?.length || 0)), 0
        );

        // Define a largura baseada na complexidade visual
        this.visual = densidade * fatorEscala;
    }

    /**
     * Valida se a soma das durações de áudio bate com a fórmula de compasso.
     * @param {Object} estruturaTempo - Objeto com {quantidade, unidadeTempo}.
     * @returns {boolean}
     */
    validarIntegridade(estruturaTempo) {
        if (!estruturaTempo) return false;

        const esperado = estruturaTempo.quantidade / estruturaTempo.unidadeTempo;

        // Tolerância para cálculos de ponto flutuante (Epsilon)
        return Math.abs(this.audio - esperado) < Number.EPSILON;
    }
}
export class EstruturaTempo {
    /** @type {{quantidade: number, unidadeTempo: number}} */
    #estruturaTempo;

    constructor(quantidade = 4, unidadeTempo = 4) {
        this.setEstruturaTempo(quantidade, unidadeTempo);
    }

    /**
     * Define a fórmula de compasso com validação básica.
     * @param {number} n - quantidade (numerador)
     * @param {number} d - unidadeTempo (denominador)
     */
    setEstruturaTempo(n, d) {
        this.#estruturaTempo = {
            quantidade: Math.abs(Math.round(n)) || 4,
            unidadeTempo: Math.abs(Math.round(d)) || 4
        };
    }

    /**
     * Retorna a representação da fórmula de compasso para o padrão ABC.
     * USAGE:
     * Utilizado tanto no cabeçalho global (M:4/4) quanto em mudanças
     * de métrica no meio da partitura [M:3/4].
     * @returns {string} Ex: "4/4", "3/4", "2/2"
     */
    toAbc() {
        const { quantidade, unidadeTempo } = this.#estruturaTempo;
        return `M:${quantidade}/${unidadeTempo}\n`;
    }

    /**
     * Getter amigável para depuração ou interface.
     * @returns {string}
     */
    get formatada() {
        return this.toAbc();
    }

    get estruturaTempo() {
        return this.#estruturaTempo;
    }
}
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
    get razao() {
        return this.#estruturaTempo.quantidade / this.#estruturaTempo.unidadeTempo;
    }
    get #valorFormatado() {
        const { quantidade, unidadeTempo } = this.#estruturaTempo;
        return `${quantidade}/${unidadeTempo}`;
    }

    /**
     * USAGE: Gera M:4/4
     */
    toAbc() {
        return `M:${this.#valorFormatado}\n`;
    }

    /**
     * USAGE: Gera [M:4/4] para mudanças inline
     */
    toCompasso() {
        return `[M:${this.#valorFormatado}]`;
    }

    get quantidade() { return this.#estruturaTempo.quantidade; }
    get unidadeTempo() { return this.#estruturaTempo.unidadeTempo; }

    /**
     * USAGE: Retorna o valor total do compasso na escala 1.0 = Semibreve.
     * Ex: 4/4 -> 1.0 | 3/4 -> 0.75 | 6/8 -> 0.75
     * @returns {number}
     */
    getValorTotal() {
        return this.#estruturaTempo.quantidade / this.#estruturaTempo.unidadeTempo;
    }
}

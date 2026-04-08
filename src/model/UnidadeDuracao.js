export class UnidadeDuracao {
    /** @type {{quantidade: number, unidadeTempo: number}} */
    #unidadeDuracao;

    constructor(quantidade = 4, unidadeTempo = 4) {
        this.setUnidadeDuracao(quantidade, unidadeTempo);
    }

    /**
     * Define a fórmula de compasso com validação básica.
     * @param {number} n - quantidade (numerador)
     * @param {number} d - unidadeTempo (denominador)
     */
    setUnidadeDuracao(n, d) {
        this.#unidadeDuracao = {
            quantidade: Math.abs(Math.round(n)) || 4,
            unidadeTempo: Math.abs(Math.round(d)) || 4
        };
    }
    get razao() {
        return this.#unidadeDuracao.quantidade / this.#unidadeDuracao.unidadeTempo;
    }

    get #valorFormatado() {
        const { quantidade, unidadeTempo } = this.#unidadeDuracao;
        return `${quantidade}/${unidadeTempo}`;
    }

    /**
     * USAGE: Gera L:1/4
     */
    toAbc() {
        return `L:${this.#valorFormatado}\n`;
    }

    /**
     * USAGE: Gera [M:4/4] para mudanças inline
     */
    toCompasso() {
        return `[M:${this.#valorFormatado}]`;
    }

    get quantidade() { return this.#unidadeDuracao.quantidade; }
    get unidadeTempo() { return this.#unidadeDuracao.unidadeTempo; }

    /**
     * USAGE: Retorna o valor total do compasso na escala 1.0 = Semibreve.
     * Ex: 4/4 -> 1.0 | 3/4 -> 0.75 | 6/8 -> 0.75
     * @returns {number}
     */
    getValorTotal() {
        return this.#unidadeDuracao.quantidade / this.#unidadeDuracao.unidadeTempo;
    }
}

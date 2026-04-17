import { ClaveTipo } from '@domain/obra/ClaveTipo.js';

export class Clave {
    /** @type {keyof typeof ClaveTipo} */
    #tipo = null;

    /** * Deslocamento de oitava (ex: -1 para violão/guitarra).
     * @type {number} */
    #oitava = 0;

    constructor(tipo = ClaveTipo.TREBLE, oitava = 0) {
        this.#tipo = tipo;
        this.#oitava = oitava;
    }
    /**
     * Retorna a string base de configuração.
     * @returns {string} Ex: "clef=treble-8"
     */
    get #valorFormatado() {
        const base = this.#tipo.valor;
        if (this.#oitava === 0) return `clef=${base}`;

        // Se oitava for -1, o abcjs usa "-8"
        const sufixo = this.#oitava > 0 ? `+${this.#oitava * 8}` : `${this.#oitava * 8}`;
        return `clef=${base}${sufixo}`;
    }

    /**
     * Gera a string de configuração para o abcjs.
     * Ex: clef=treble-8 ou clef=bass
     */
    toAbc() {
        return this.#valorFormatado;
    }
    /**
     * Gera a string para mudança de clave no meio da pauta (dentro do Compasso).
     * O ABCJS processa isso "inline" perfeitamente envolto em colchetes.
     * @returns {string} Ex: "[clef=treble-8]"
     */
    toCompasso() {
        return `[${this.#valorFormatado}]`;
    }
}

import { ClaveTipo } from './ClaveTipo.js';

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
     * Gera a string de configuração para o abcjs.
     * Ex: clef=treble-8 ou clef=bass
     */
    toAbc() {
        const base = this.#tipo.valor;
        if (this.#oitava === 0) return `clef=${base}`;

        // Se oitava for -1, o abcjs usa "-8"
        const sufixo = this.#oitava > 0 ? `+${this.#oitava * 8}` : `${this.#oitava * 8}`;
        return `clef=${base}${sufixo}`;
    }
}
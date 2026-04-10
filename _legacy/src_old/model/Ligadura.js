import { TipoLigadura } from './TipoLigadura.js';

export class Ligadura {
    /** @type {keyof typeof TipoLigadura} */
    #tipo;
    #inicio;
    #fim;

    /**
     * @param {keyof typeof TipoLigadura} tipo
     * @param {number} inicio
     * @param {number} fim
     */
    constructor(tipo, inicio, fim) {
        this.#tipo = tipo;
        this.#inicio = inicio;
        this.#fim = fim;
    }

    get info() {
        return TipoLigadura[this.#tipo];
    }
}
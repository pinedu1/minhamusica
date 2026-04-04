import { HasteDirecao } from './HasteDirecao.js';


export class Voz {
    /** @type {string|number} */
    #id;

    /** * Lista de notas, pausas ou acordes.
     * @type {Array<Object>} */
    #eventos = [];

    /** @type {string|null} */
    #nome = null;

    /** @type {keyof typeof HasteDirecao} */
    #direcaoHaste = HasteDirecao.AUTO;

    constructor(id = 1, nome = null, direcaoHaste = HasteDirecao.AUTO) {
        this.#id = id;
        this.#nome = nome;
        this.#direcaoHaste = direcaoHaste;
    }

    /** @param {Object} evento */
    adicionarEvento(evento) {
        this.#eventos.push(evento);
    }

    get eventos() {
        return this.#eventos;
    }

    get id() {
        return this.#id;
    }
}
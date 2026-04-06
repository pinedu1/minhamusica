import { HasteDirecao } from './HasteDirecao.js';
import { Nota } from './Nota.js'; // Importação necessária para o JSDoc reconhecer o tipo

export class Voz {
    /** @type {string|number} */
    #id;

    /** * USAGE:
     * Lista ordenada de instâncias da classe Nota que compõem esta camada rítmica.
     * garantindo que toda nota sempre pertença a uma voz (mesmo em músicas monofônicas).
     * @type {Array<Nota>}
     */
    #notas = [];

    /** @type {string|null} */
    #nome = null;

    /** @type {keyof typeof HasteDirecao} */
    #direcaoHaste = HasteDirecao.AUTO;

    constructor(id = 1, nome = null, direcaoHaste = HasteDirecao.AUTO) {
        this.#id = id;
        this.#nome = nome;
        this.#direcaoHaste = direcaoHaste;
    }
    setId( idVoz ) {
        this.#id = idVoz;
    }
    /** * Adiciona uma Nota a esta voz.
     * @param {Nota} nota
     */
    adicionarNota(nota) {
        this.#notas.push(nota);
    }

    get notas() {
        return this.#notas;
    }

    get id() {
        return this.#id;
    }

    get nome() {
        return this.#nome;
    }
}
import { HasteDirecao } from './HasteDirecao.js';
import { Nota } from './Nota.js';
import { Acorde } from './Acorde.js'; // Importação necessária para o novo tipo

export class Voz {
    /** @type {string|number} */
    #id;

    /** * USAGE:
     * Lista ordenada de elementos rítmicos (instâncias de Nota ou Acorde).
     * Esta coleção representa a linha do tempo melódica desta voz.
     * Elementos dentro de um Acorde soam simultaneamente, enquanto Elementos
     * na lista #elementos soam sequencialmente.
     * @type {Array<Nota | Acorde>}
     */
    #elementos = [];

    /** @type {string|null} */
    #nome = null;

    /** @type {keyof typeof HasteDirecao} */
    #direcaoHaste = HasteDirecao.AUTO;

    constructor(id = 1, nome = null, direcaoHaste = HasteDirecao.AUTO) {
        this.#id = id;
        this.#nome = nome;
        this.#direcaoHaste = direcaoHaste;
    }

    setId(idVoz) {
        this.#id = idVoz;
    }

    /** * Adiciona uma Nota ou um Acorde a esta voz.
     * @param {Nota | Acorde} item
     */
    adicionarElemento(item) {
        this.#elementos.push(item);
    }

    /**
     * Retorna a lista de elementos (Notas e Acordes) da voz.
     * @returns {Array<Nota | Acorde>}
     */
    get notas() {
        return this.#elementos;
    }

    get id() {
        return this.#id;
    }

    get nome() {
        return this.#nome;
    }
}
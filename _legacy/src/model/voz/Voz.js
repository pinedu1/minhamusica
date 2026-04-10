import { Compasso } from "../compasso/Compasso.js";
import { Obra } from "../obra/Obra.js";

export class Voz {
    /** @type {string|number|null} */
    #id;
    #options;
    /** @type {number} */
    #lastCompasso = 1;
    /** * USAGE:
     * Lista ordenada de elementos rítmicos (instâncias de Nota ou Acorde).
     * Esta coleção representa a linha do tempo melódica desta voz.
     * Elementos dentro de um Acorde soam simultaneamente, enquanto Elementos
     * na lista #elementos soam sequencialmente.
     * @type {Array<Compasso>}
     */
    #compassos = [];
    /** @type {Obra} */
    #obra = null;
    constructor(compassos, options = {}) {
        this.#options = {
            obra: null
            , nome: null
            , sinonimo: null
            , direcaoHaste: 'auto'  // alternativa: up, down
            , ...options
        };
        // Validação da propriedade graceNote
        const obra = this.#options.obra;
        if (obra !== null && obra !== undefined && !(obra instanceof Obra)) {
            throw new TypeError("Falha ao criar Voz: 'obra' deve ser null, undefined ou uma instância de Obra.");
        }

    }
    get obra() {
        return this.#obra;
    }

    set obra(val) {
        if (val !== null && val !== undefined && !(val instanceof Obra)) {
            throw new TypeError("Falha ao criar Voz: 'obra' deve ser null, undefined ou uma instância de Obra.");
        }
        this.#obra = val;
    }
    get #direcaoHaste() {
        return this.#options.direcaoHaste;
    }
    /** @type {string} */
    set #direcaoHaste(val) {
        if ( val !== 'auto' && val !== 'up' && val !== 'down' ) {
            throw new TypeError("A direção da haste deve ser 'auto', 'up' ou 'down'.");
        }
        this.#options.direcaoHaste = val;
    }
    get id() {
        return this.#id;
    }
    set id(val) {
        this.#id = val;
    }
    get compassos() {
        return this.#compassos;
    }
    set compassos(arrayCompassos) {
        this.#lastCompasso = 1;
        if (!Array.isArray(arrayCompassos)) {
            throw new TypeError('Os Compassos de uma Voz devem ser fornecidas como um array de instâncias de Compasso.');
        }
        if (arrayCompassos.some(compasso => !(compasso instanceof Compasso))) {
            throw new TypeError('Todos os elementos do array de Compassos devem ser instâncias de Compasso.');
        }
        arrayCompassos.forEach(compasso => this.addCompasso(compasso));
    }
    addCompasso(compasso) {
        if (!(compasso instanceof Compasso)) {
            throw new TypeError('O Compasso deve ser uma instância de Compasso.');
        }
        compasso.id = this.#lastCompasso++;
        compasso.voz = this;
        this.#compassos.push(compasso);
    }
}
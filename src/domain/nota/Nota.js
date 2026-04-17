import { NotaFrequencia } from "@domain/nota/NotaFrequencia.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { ElementoMusical } from "@domain/nota/ElementoMusical.js";
/**
 * Representa uma nota musical completa, integrando altura, duração e atributos de execução.
 */
export class Nota extends ElementoMusical {
    /** @type {NotaFrequencia} */
    #altura;
    /**
     * @param {NotaFrequencia} altura
     * @param {TempoDuracao} duracao
     * @param {Object} [options={}]
     */
    constructor(altura, duracao, options = {}) {
        super(duracao, options);
        //
        this.altura = altura;
        this.duracao = duracao;
        this._options = {
            obra: null,
            voz: null,
            compasso: null,
            unidadeTempo: null,
	        acordes: [],
            
            // ACENTUAÇÃO
            acento: false,
            marcato: false,

            // ARTICULAÇÕES DE DURAÇÃO
            staccato: false,
            staccatissimo: false,
            tenuto: false,

            // TÉCNICAS E LIGADURAS
            hammerOn: false,
            pullOff: false,
            ligada: false,

            // ORNAMENTOS
            mordente: false,
            upperMordent: false,
            trinado: false,
            roll: false,

            // OUTROS
            fermata: false,
            ghostNote: false,
            graceNote: null,
            arpeggio: false,
            dedilhado: null,
            
            sustenido: false, // Propriedade b.1
            beQuad: false,    // Propriedade b.2
            ...options
        };

        const gn = this._options.graceNote;
        if (gn !== false && gn !== null && !Array.isArray(gn)) {
            throw new TypeError("Falha ao criar Nota: 'graceNote' deve ser false, null ou Array<Nota>.");
        }
    }
    // Getters / Setters
    get altura() { return this.#altura; }
    set altura(val) {
        if (!(val instanceof NotaFrequencia)) throw new Error("A altura deve ser NotaFrequencia.");
        this.#altura = val;
    }
    get ligada() { return this._options.ligada; }
    set ligada(val) { this._options.ligada = !!val; }
}

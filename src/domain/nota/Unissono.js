import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { Nota } from "@domain/nota/Nota.js";
import { ElementoMusical } from "@domain/nota/ElementoMusical.js";
/**
 * Representa um unissono musical, um conjunto de notas tocadas simultaneamente.
 * Suporta atributos de execução globais e notas de adorno (grace notes).
 */
export class Unissono extends ElementoMusical {
    /** @type {Array<Nota>} */
    #notas = [];
    /**
     * @param {Array<Nota>} notas - Notas que compõem o unissono.
     * @param {TempoDuracao} duracao - Duração do conjunto.
     * @param {Object} [options={}] - Atributos e contexto.
     */
    constructor(notas = [], duracao, options = {}) {
        super(duracao, options);
        this.notas = notas;
        this._options = {
            obra: null,
            compasso: null,
            unidadeTempo: null,
            
            // ACENTUAÇÃO
            acento: false,
            marcato: false,

            // ARTICULAÇÕES
            staccato: false,
            staccatissimo: false,
            tenuto: false,

            // TÉCNICAS E ORNAMENTOS
            ligada: false, 
            arpeggio: false,
            fermata: false,
            ghostNote: false,
            roll: false,
            trinado: false,
            mordente: false,
            upperMordent: false,
            
            graceNote: null, // false | null | Array<Nota>
            dedilhado: null,
            ...options
        };

        // Validação da propriedade graceNote (Idêntica à classe Nota)
        const gn = this._options.graceNote;
        if (gn !== false && gn !== null && !Array.isArray(gn)) {
            throw new TypeError("Falha ao criar Unissono: 'graceNote' deve ser false, null ou um Array de instâncias de Nota.");
        }
        if (Array.isArray(gn) && gn.some(n => !(n instanceof Nota))) {
            throw new TypeError("Falha ao criar Unissono: Todos os elementos em 'graceNote' devem ser instâncias de Nota.");
        }
    }

    #addNota(nota) {
        if (!(nota instanceof Nota)) {
            throw new TypeError('A nota deve ser uma instância de Nota.');
        }
        this.#notas.push(nota);
    }
    get notas() { return this.#notas; }
    
    set notas(arrayNotas) {
        if (!Array.isArray(arrayNotas)) {
            throw new TypeError('As notas de um unissono devem ser fornecidas como um array de instâncias de Nota.');
        }
        if (arrayNotas.some(nota => !(nota instanceof Nota))) {
            throw new TypeError('Todos os elementos do array de notas devem ser instâncias de Nota.');
        }
        this.#notas = [];
        arrayNotas.forEach(nota => this.#addNota(nota));
    }
}

import {AlturaMidi, AlturaMidiEnum} from './AlturaMidi.js';
/**
 * Representa a identidade física e tonal de uma nota.
 * Centraliza a relação entre o som (MIDI) e o símbolo (ABC) através de AlturaMidi.
 */
export class Altura {
    /** * USAGE:
     * Referência obrigatória ao objeto de dados brutos (MIDI/ABC).
     * Deve receber uma das instâncias constantes do dicionário estático AlturasMidi.
     * @type {AlturaMidi}
     * @example
     * // Atribuição correta:
     * this.#alturaMidi = AlturasMidi.Gs4; // G# na oitava 4
     */
    #alturaMidi;
    /**
     * @param {AlturaMidi} alturaMidi - Objeto de mapeamento MIDI/ABC.
     */
    constructor(alturaMidi) {
        if (!(alturaMidi instanceof AlturaMidi)) {
            throw new Error("O parâmetro deve ser uma instância válida de AlturaMidi.");
        }
        this.#alturaMidi = alturaMidi;
    }

    /** * Retorna o objeto de dados MIDI/ABC.
     * @returns {AlturaMidi}
     */
    get alturaMidi() {
        return this.#alturaMidi;
    }

    /** * Atalho para o valor numérico MIDI.
     * @returns {number}
     */
    get midi() {
        return this.#alturaMidi.midi;
    }

    /** * Atalho para a notação ABC.
     * @returns {string}
     */
    get abc() {
        return this.#alturaMidi.abcjs;
    }

    /**
     * Retorna a oitava científica (ex: 4 para o Dó Central).
     * @returns {number}
     */
    get oitava() {
        return Math.floor(this.midi / 12) - 1;
    }

    /**
     * Retorna o nome da nota sem a oitava (ex: "C#").
     * @returns {string}
     */
    get nomeNota() {
        const nomes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        return nomes[this.midi % 12];
    }
    static resolverAltura(str) {
        const a = Object.values(AlturaMidiEnum).find(a => a.abcjs === str) || AlturaMidiEnum.C4;
        return new Altura(a);
    }

}
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";

/**
 * Representa a fração de andamento de uma nota (ex: 1/4=90, 3/8=120, 5/4=60).
 */
export class TempoAndamento {
    /** @type {TempoDuracao} */
    #andamento;
    /** @type {PositiveNumber} */
    #bpm;

    /**
     * USAGE: Cria uma Instancoa da Classe Tempo Formula
     * @param {TempoDuracao} andamento - A marcação de andamento. Ex: 1/4
     * @param {PositiveNumber} bpm - Duração desta nota
     * @returns {TempoAndamento}
     */
    constructor(andamento, bpm) {
        if ( andamento === null || andamento === undefined ) {
            throw new TypeError("Falha ao criar TempoAndamento: 'andamento' ser válido.");
        }
        if ( !(andamento instanceof TempoDuracao) ) {
            throw new TypeError("Falha ao criar TempoAndamento: 'andamento' deve ser Uma instancia de TempoDuracao.");
        }
        if ( bpm === null || bpm === undefined ) {
            throw new TypeError("Falha ao criar TempoAndamento: 'bpm' ser válido.");
        }
	    if ( (Number.isInteger( bpm ) === false) || (bpm <= 0) ) {
            throw new TypeError("Falha ao criar TempoAndamento: 'bpm' ser Inteiro e maior que Zero.");
        }
        this.#andamento = andamento;
        this.#bpm = bpm;
    }
    get andamento() { return this.#andamento; }
    get bpm() { return this.#bpm; }
    get razao() { return this.#andamento.razao / this.#bpm; }
    toString() {
        return `${this.#andamento.toString()}=${this.#bpm}`;
    }
}

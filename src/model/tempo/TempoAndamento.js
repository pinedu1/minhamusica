import { TempoNota } from "./TempoNota.js";
/**
 * Representa a fração de tempo de uma nota (ex: 1/4, 3/8).
 */
export class TempoAndamento {
    /** @type {TempoNota} */
    #tempo;
    /** @type {PositiveNumber} */
    #duracao;

    /**
     * USAGE: Cria uma Instancoa da Classe Tempo Formula
     * @param {TempoNota} tempo - A marcação de tempo. Ex: 1/4
     * @param {PositiveNumber} duracao - Duração desta nota
     * @returns {TempoMetrica}
     */
    constructor(tempo, duracao) {
        if ( tempo === null || tempo === undefined ) {
            throw new TypeError("Falha ao criar TempoMetrica: 'tempo' ser válido.");
        }
        if ( !(tempo instanceof TempoNota) ) {
            throw new TypeError("Falha ao criar TempoMetrica: 'tempo' deve ser Uma instancia de TempoNota.");
        }
        if ( duracao === null || duracao === undefined ) {
            throw new TypeError("Falha ao criar TempoMetrica: 'duracao' ser válido.");
        }
        if ( !Number.isInteger( duracao ) || Math.abs( duracao ) <= 0 ) {
            throw new TypeError("Falha ao criar TempoMetrica: 'duracao' ser Inteiro e maior que Zero.");
        }
        this.#tempo = tempo;
        this.#duracao = duracao;
    }
    get tempo() { return this.#tempo; }
    get duracao() { return this.#duracao; }
    get razao() { return this.#tempo.razao / this.#duracao; }
    toString() {
        return `${this.#tempo.toString()}=${this.#duracao}`;
    }
    toCompasso() {
        return `[Q:${this.toString()}]`;
    }
    toAbc() {
        return `Q:${this.toString()}\n`;
    }
    static create( tempo, duracao ) {
        const parts = tempo.split("/");
        const num = parseInt(parts[0]);
        const den = parseInt(parts[1] || 1);
        const t = new TempoNota(num, den);
        return new TempoAndamento(t, duracao);
    }
}

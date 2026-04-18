import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { tempoAndamentoSchema } from "@schemas/tempoAndamentoSchema.js";

/**
 * Representa a fração de andamento de uma nota (ex: 1/4, 3/8).
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
    toCompasso() {
        return `[Q:${this.toString()}]`;
    }
    toAbc() {
        return `Q:${this.toString()}`;
    }
    toJSON() {
        return { andamento: this.#andamento.toString(), bpm: this.#bpm };
    }
    
    /**
     * USAGE: Factory method. Aceita o formato JSON { andamento: '4/4', bpm: 95 } ou as propriedades soltas.
     */
    static create(dados) {
        // Se vier instanciado, já retorna
        if (dados instanceof TempoAndamento) return dados;
        // Validação usando o Zod Schema
        const resultado = tempoAndamentoSchema.safeParse(dados);

        if (!resultado.success) {
            throw new TypeError("TempoAndamento.create: Falha na validação.\n" + resultado.error.message);
        }

        const validado = resultado.data;

        // Delega a criação limpa para o Factory estático da dependência em vez de refazer parsings manuais aqui
        const andamento = TempoDuracao.create(validado.andamento);

        return new TempoAndamento(andamento, validado.bpm);
    }
}

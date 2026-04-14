import { TempoDuracao } from "./TempoDuracao.js";
import { tempoAndamentoSchema } from "../../schemas/tempoAndamentoSchema.js";

/**
 * Representa a fração de tempo de uma nota (ex: 1/4, 3/8).
 */
export class TempoAndamento {
    /** @type {TempoDuracao} */
    #tempo;
    /** @type {PositiveNumber} */
    #duracao;

    /**
     * USAGE: Cria uma Instancoa da Classe Tempo Formula
     * @param {TempoDuracao} tempo - A marcação de tempo. Ex: 1/4
     * @param {PositiveNumber} duracao - Duração desta nota
     * @returns {TempoAndamento}
     */
    constructor(tempo, duracao) {
        if ( tempo === null || tempo === undefined ) {
            throw new TypeError("Falha ao criar TempoAndamento: 'tempo' ser válido.");
        }
        if ( !(tempo instanceof TempoDuracao) ) {
            throw new TypeError("Falha ao criar TempoAndamento: 'tempo' deve ser Uma instancia de TempoDuracao.");
        }
        if ( duracao === null || duracao === undefined ) {
            throw new TypeError("Falha ao criar TempoAndamento: 'duracao' ser válido.");
        }
        if ( !Number.isInteger( duracao ) || Math.abs( duracao ) <= 0 ) {
            throw new TypeError("Falha ao criar TempoAndamento: 'duracao' ser Inteiro e maior que Zero.");
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
        return `Q:${this.toString()}`;
    }
    
    /**
     * USAGE: Factory method. Aceita o formato JSON { tempo: '4/4', duracao: 95 } ou as propriedades soltas.
     */
    static create(dados, duracaoOpcional) {
        // Se vier instanciado, já retorna
        if (dados instanceof TempoAndamento) return dados;

        // Adapta o suporte para os dois tipos de chamadas do programador:
        // 1. TempoAndamento.create({ tempo: '4/4', duracao: 95 })
        // 2. TempoAndamento.create('4/4', 95)
        let jsonDados;
        if (typeof dados === 'object' && dados !== null && 'tempo' in dados) {
            jsonDados = dados;
        } else {
            jsonDados = { tempo: dados, duracao: duracaoOpcional };
        }

        // Validação usando o Zod Schema
        const resultado = tempoAndamentoSchema.safeParse(jsonDados);

        if (!resultado.success) {
            throw new TypeError("TempoAndamento.create: Falha na validação.\n" + resultado.error.message);
        }

        const validado = resultado.data;

        // Delega a criação limpa para o Factory estático da dependência em vez de refazer parsings manuais aqui
        const tempoNotaInstancia = TempoDuracao.create(validado.tempo);

        return new TempoAndamento(tempoNotaInstancia, validado.duracao);
    }
}

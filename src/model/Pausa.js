import { Duracao } from './Duracao.js';

/**
 * Representa um silêncio musical dentro de uma Voz.
 */
export class Pausa {
    /** * USAGE:
     * Valor rítmico baseado no Enum Duracao (ex: Duracao.QUARTER.valor).
     * @type {number}
     */
    #duracao;

    /** * USAGE:
     * Se true, a pausa não é desenhada (usada para alinhamento de vozes).
     * No ABC, 'z' é visível e 'x' é invisível.
     * @type {boolean}
     */
    #invisivel = false;

    /** * USAGE:
     * Posição rítmica calculada (em batidas) dentro do compasso.
     * @type {number}
     */
    #tempoInico = 0;

    /** * USAGE:
     * Permite aplicar ornamentos como a Fermata sobre o silêncio.
     * @type {Array<string>}
     */
    #articulacoes = [];

    /**
     * @param {number} duracao - Use preferencialmente Duracao.[CHAVE].valor
     * @param {boolean} invisivel
     */
    constructor(duracao = Duracao.QUARTER.valor, invisivel = false) {
        this.#duracao = duracao;
        this.#invisivel = invisivel;
    }

    /**
     * Converte para a representação ABC.
     * @example "z2" (Pausa de mínima), "x/2" (Pausa invisível de colcheia)
     */
    toAbc() {
        const caractere = this.#invisivel ? 'x' : 'z';
        // Lógica simples: se for 1 (semínima), o ABC não precisa de sufixo
        const sufixo = this.#duracao === 1 ? "" : this.#duracao;

        // Se houver fermata, ela vem antes: !fermata!z
        const ornamentos = this.#articulacoes.join("");

        return `${ornamentos}${caractere}${sufixo}`;
    }

    get duracao() { return this.#duracao; }
    get tempoInico() { return this.#tempoInico; }
}
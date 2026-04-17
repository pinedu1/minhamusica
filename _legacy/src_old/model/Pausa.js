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
    constructor(duracao, options = {}) {
	    super(duracao, options);

	    this.duracao = duracao;

	    // 2. Mesclamos os padrões com o que veio do options diretamente no "this"
	    this._options = Object.assign({
		    obra: null,
		    voz: null, // <- Adicionei a voz que faltava!
		    compasso: null,
		    unidadeTempo: null,
		    fermata: false,
		    breath: null,
		    invisivel: false,
		    ...options // Sobrescreve os nulls/false se o usuário mandar algo
	    });
    }


    get duracao() { return this.#duracao; }
	get invisivel() { return this.#invisivel; }
    get tempoInico() { return this.#tempoInico; }
}
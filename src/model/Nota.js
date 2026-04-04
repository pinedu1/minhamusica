import { Altura } from './Altura.js';
import { Duracao } from './Duracao.js';
import { Articulacao } from './Articulacao.js';
import { TecnicaPalhetada } from './TecnicaPalhetada.js';

export class Nota {
    /** * USAGE:
     * Instância da classe Altura que encapsula a lógica MIDI e a string ABC.
     * @type {Altura}
     */
    #altura;

    /** * USAGE:
     * Valor rítmico da nota baseado no Enum Duracao (ex: Duracao.QUARTER.valor).
     * Representa o multiplicador ou divisor de tempo para o motor abcjs.
     * @type {Duracao}
     * @example
     * // Para uma Mínima (2 tempos):
     * this.#duracao = Duracao.METADE.valor; // Resulta em "C2" no ABC
     */
    #duracao;

    /** * USAGE:
     * Coleção de ornamentos e símbolos de articulação aplicados à nota.
     * Os valores devem ser extraídos de Articulacao[CHAVE].abc.
     * @type {Array<Articulacao>}
     * @example
     * // Nota com Staccato e Acento:
     * this.#articulacoes = [Articulacao.STACCATO.abc, Articulacao.ACCENT.abc];
     */
    #articulacoes = [];

    /** * USAGE:
     * Define a direção da palhetada ou técnica de ataque.
     * Deve ser atribuído usando TecnicaPalhetada[CHAVE].abc.
     * Essencial para a rítmica do Pagode de Viola e Cururu.
     * @type {TecnicaPalhetada | null}
     * @example
     * this.#tecnica = TecnicaPalhetada.BAIXO.abc; // Renderiza 'v' sobre a nota
     */
    #tecnica = null;

    /** * USAGE:
     * Objeto de metadados visuais calculado para renderização no Canvas.
     * Armazena a largura (width) ocupada pela nota e o seu deslocamento (offset)
     * horizontal em relação ao início do compasso.
     * @type {Dimensoes | null}
     * @example
     * // Utilizado pelo motor de desenho para evitar sobreposição:
     * if (this.#dimensoes) {
     * ctx.drawNote(this.abc, this.#dimensoes.x, this.#dimensoes.y);
     * }
     */
    #dimensoes = null;

    /** * @type {boolean} - Se true, a nota aparece entre parênteses (x)
     * Comum em notas de passagem ou notas "fantasma" no ponteado.
     */
    #ghostNote = false;

    /** * @type {boolean} - Indica se a nota está ligada à nota anterior (Tie)
     * Representado pelo símbolo '-' no ABC.
     */
    #ligada = false;

    /**
     * CONSTRUTOR EXPLÍCITO
     *
     * @param {Altura} altura - Instância obrigatória de Altura.
     * @param {Duracao} duracao - Instância obrigatória de Duracao.
     * @param {Array<Articulacao>} articulacoes - Lista de articulações (default []).
     * @param {TecnicaPalhetada|null} tecnica - Técnica de palhetada (default null).
     * @param {boolean} ghostNote - Se é nota fantasma (default false).
     * @param {boolean} ligada - Se está ligada (default false).
     */
    constructor(
        altura,
        duracao,
        articulacoes = [],
        tecnica = null,
        ghostNote = false,
        ligada = false
    ) {
        this.#altura = altura;
        this.#duracao = duracao;
        this.#articulacoes = articulacoes;
        this.#tecnica = tecnica;
        this.#ghostNote = ghostNote;
        this.#ligada = ligada;

        // Inicializa como null, aguardando o cálculo do motor de layout
        this.#dimensoes = null;
    }

    // Getters essenciais
    get altura() { return this.#altura; }
    get duracao() { return this.#duracao; }
    get abc() { return this.#altura.abc; }
    get midi() { return this.#altura.midi; }
}

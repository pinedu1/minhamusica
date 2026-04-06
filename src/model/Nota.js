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
    get midi() { return this.#altura.midi; }
    // Setter para permitir que o Parser altere a ligadura durante a quebra de compasso
    set ligada(valor) { this.#ligada = !!valor; }
    get ligada() { return this.#ligada; }

    /**
     * Renderiza a nota e todos os seus modificadores rítmicos/visuais no padrão ABC.
     * @returns {string}
     */
    toAbc() {
        let abcString = "";

        // 1. Modificadores de prefixo (Técnica de palhetada e Articulações)
        if (this.#tecnica) abcString += this.#tecnica;
        if (this.#articulacoes && this.#articulacoes.length > 0) {
            abcString += this.#articulacoes.join("");
        }

        // 2. Ghost Note (Nota Fantasma/Abafada)
        // O abcjs processa !style=x! desenhando a cabeça da nota como um "X"
        if (this.#ghostNote) {
            abcString += "!style=x!";
        }

        // 3. Altura Base (utilizando o getter que busca this.#altura.abc)
        if (this.#altura) {
            abcString += this.#altura.abc;
        }

        // 4. Duração (Verifica se é um Enum com .valor ou se já é uma string crua)
        if (this.#duracao) {
            abcString += this.#duracao.toNota();
        }

        // 5. Ligadura (Tie) - Obrigatoriamente o último caractere da nota
        if (this.#ligada) {
            abcString += "-";
        }

        return abcString;
    }
    /**
     * USAGE: Método de fábrica para criar uma nota a partir de strings brutas.
     * Encapsula a lógica de resolução de altura e associação de duração.
     * * @param {string} alturaStr - A string da nota (ex: "^F,", "c'")
     * @param {DuracaoBase} duracaoObjeto - Instância do Enum Duracao já calculada
     * @param {boolean} ligada - Estado da ligadura original
     * @returns {Nota}
     */
    static resolverNota(alturaStr, duracaoObjeto, ligada = false) {
        const alturaObjeto = Altura.resolverAltura(alturaStr);
        return new Nota(alturaObjeto, duracaoObjeto, [], null, false, ligada);
    }
}

/**
 * Representa uma acorde harmônica ancorada a um tempo do compasso.
 */
export class Acorde {
    /** @type {string} - Ex: "E", "Am", "D7" */
    #acorde;
    /** @type {string | null} - Ex: "G#" em E/G# */
    #baixo;
    /** @type {number} - Posição rítmica no compasso */
    #posicao;

    /**
     * @param {string} fundamental - A nota fundamental e sua qualidade (ex: "C#m7").
     * @param {number} posicao - Momento rítmico (0 = início).
     * @param {string | null} baixo - Nota do baixo se for invertido.
     */
    constructor(acorde, posicao = 0, baixo = null) {
        this.#acorde = fundamental;
        this.#posicao = posicao;
        this.#baixo = baixo;
    }

    /**
     * Retorna a representação textual da acorde.
     * @example "E/G#", "Am7"
     */
    get texto() {
        return this.#baixo ? `${this.#acorde}/${this.#baixo}` : this.#acorde;
    }

    /**
     * Formata para a sintaxe de acorde do abcjs: "Texto"
     */
    toAbc() {
        return `"${this.texto}"`;
    }

    get posicao() { return this.#posicao; }
}
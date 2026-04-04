/**
 * Representa um texto livre inserido na partitura.
 */
export class Anotacao {
    /** @type {string} */
    #texto;
    /** @type {'ACIMA' | 'ABAIXO' | 'ESQUERDA' | 'DIREITA'} */
    #posicaoVisual;
    /** @type {number} */
    #posicaoRitmica;

    /**
     * @param {string} texto
     * @param {number} posicaoRitmica - Momento no compasso (0, 1, 1.5...)
     * @param {'ACIMA' | 'ABAIXO' | 'ESQUERDA' | 'DIREITA'} posicaoVisual
     */
    constructor(texto, posicaoRitmica = 0, posicaoVisual = 'ACIMA') {
        this.#texto = texto;
        this.#posicaoRitmica = posicaoRitmica;
        this.#posicaoVisual = posicaoVisual;
    }

    /**
     * Converte para o prefixo de anotação do abcjs.
     * ^ = Acima, _ = Abaixo, < = Esquerda, > = Direita
     */
    get prefixoAbc() {
        const mapas = { 'ACIMA': '^', 'ABAIXO': '_', 'ESQUERDA': '<', 'DIREITA': '>' };
        return `${mapas[this.#posicaoVisual]}"${this.#texto}"`;
    }
}
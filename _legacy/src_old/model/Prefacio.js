/**
 * Representa o bloco de texto introdutório (Declamação/História)
 * que precede a pauta musical.
 */
export class Prefacio {
    /** * USAGE:
     * Lista de parágrafos ou frases da declamação.
     * @type {Array<string>}
     */
    #linhas = [];

    /** * USAGE:
     * Configurações de renderização para o motor abcjs.
     * @type {{fonte: string, tamanho: number, estilo: string}}
     */
    #estetica = {
        fonte: "Times",
        tamanho: 12,
        estilo: "Italic"
    };

    /** * USAGE:
     * Espaçamento vertical (em pontos) entre o prefácio e a pauta.
     * @type {number}
     */
    #margemInferior = 10;

    /**
     * @param {string[]} linhas - Array inicial de frases.
     * @param {Object} [opcoes] - Customização estética inicial.
     */
    constructor(linhas = [], opcoes = {}) {
        this.#linhas = linhas;
        this.#estetica = { ...this.#estetica, ...opcoes };
    }

    /**
     * Adiciona uma nova linha ao texto de introdução.
     * @param {string} texto
     */
    adicionarLinha(texto) {
        if (texto.trim()) this.#linhas.push(texto);
    }

    /**
     * Gera o bloco de diretivas ABC para o abcjs.
     * @returns {string}
     */
    toAbc() {
        if (this.#linhas.length === 0) return "";

        const { fonte, tamanho, estilo } = this.#estetica;
        let abc = `%%textfont ${fonte}-${estilo} ${tamanho}\n`;

        this.#linhas.forEach(linha => {
            abc += `%%text ${linha}\n`;
        });

        abc += `%%vskip ${this.#margemInferior}\n`;
        return abc;
    }

    // Getters e Setters para controle via UI
    set margemInferior(valor) { this.#margemInferior = valor; }
    get linhas() { return this.#linhas; }
}
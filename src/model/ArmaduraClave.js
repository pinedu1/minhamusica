import { Tonalidade } from './Tonalidade.js';
/**
 * Representa a Armadura de Clave de um trecho ou compasso.
 */
export class ArmaduraClave {
    /** @type {keyof typeof Tonalidade} */
    #tonalidade;
    /** @type {'maior' | 'menor'} */
    #modo;

    /**
     * @param {keyof typeof Tonalidade} tonalidade - Chave do Enum Tonalidade.
     * @param {'maior' | 'menor'} modo - Modo da escala.
     */
    constructor(tonalidade = 'C', modo = 'maior') {
        this.#tonalidade = tonalidade;
        this.#modo = modo;
    }
    /**
     * Retorna apenas o valor cru da tonalidade (Ex: "C", "Am", "G#m").
     * Útil como método auxiliar interno.
     * @returns {string}
     */
    get #valorFormatado() {
        const sufixo = this.#modo === 'menor' ? 'm' : '';
        return `${Tonalidade[this.#tonalidade].valor}${sufixo}`;
    }

    /**
     * Gera a string compatível com o campo K: do abcjs.
     * @example "E", "Am", "G#m"
     */
    toAbc() {
        return `K:${this.#valorFormatado}\n`;
    }
    /**
     * Gera a string para alterações no meio da pauta (dentro do Compasso).
     * Padrão: [K:Valor] embutido entre colchetes.
     * @example "[K:Am]"
     * @returns {string}
     */
    toCompasso() {
        return `[K:${this.#valorFormatado}]`;
    }

    get info() {
        return Tonalidade[this.#tonalidade];
    }
}
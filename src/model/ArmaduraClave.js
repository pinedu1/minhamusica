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
     * Gera a string compatível com o campo K: do abcjs.
     * @example "E", "Am", "G#m"
     */
    toAbc() {
        const sufixo = this.#modo === 'menor' ? 'm' : '';
        return `K:${Tonalidade[this.#tonalidade].valor}${sufixo}`;
    }

    get info() {
        return Tonalidade[this.#tonalidade];
    }
}
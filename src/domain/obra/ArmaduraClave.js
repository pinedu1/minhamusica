import { Tonalidade } from '@domain/compasso/Tonalidade.js';
/**
 * Representa a Armadura de Clave de um trecho ou compasso.
 */
export class ArmaduraClave {
    /** @type {keyof typeof Tonalidade} */
    #tonalidade;

    /**
     * @param {keyof typeof Tonalidade} tonalidade - Chave do Enum Tonalidade.
     */
    constructor(tonalidade) {
        this.tonalidade = tonalidade;
    }
    get tonalidade() {
        return this.#tonalidade;
    }
    set tonalidade( tonalidade ) {
        if (!(tonalidade instanceof Tonalidade)) {
            throw new TypeError("A tonalidade deve ser instância de Tonalidade.");
        }
        this.#tonalidade = tonalidade;
    }
    /**
     * Retorna apenas o valor cru da tonalidade (Ex: "C", "Am", "G#m").
     * Útil como método auxiliar interno.
     * @returns {string}
     */
    get #toString() {
        return `${tonalidade.valor}`;
    }

    /**
     * Gera a string compatível com o campo K: do abcjs.
     * @example "E", "Am", "G#m"
     */
    toAbc() {
        return `K:${this.#toString()}\n`;
    }
    /**
     * Gera a string para alterações no meio da pauta (dentro do Compasso).
     * Padrão: [K:Valor] embutido entre colchetes.
     * @example "[K:Am]"
     * @returns {string}
     */
    toCompasso() {
        return `[K:${this.#toString()}]`;
    }

    get info() {
        return Tonalidade[this.#tonalidade];
    }

    /**
     * USAGE: Helper para criação rápida de Armadura de Clave a partir de um JSON.
     * Ex: ArmaduraClave.create({ tom: "C" })
     * @param {Object} json - Objeto com as propriedades tipo e oitava.
     * @param {string} json.tom - Tipo da Armadura de Clave, Default: ArmaduraClave.C.
     * @returns {ArmaduraClave}
     */
    static create( json = {} ) {
        let { tom } = json;
        if ( tom === undefined || tom === null ) {
            tom = "C";
        }
        tom = Tonalidade[tonalidade];
        if (!(tom instanceof Tonalidade)) {
            throw new TypeError("A tonalidade deve ser instância de Tonalidade.");
        }
        return new ArmaduraClave(tom);
    }
}
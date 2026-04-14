import { ClaveTipo } from './ClaveTipo.js';
import { ClaveSchema } from '../../schemas/claveSchema.js';

export class Clave {
    /** @type {keyof typeof ClaveTipo} */
    #tipo = null;

    /** * Deslocamento de oitava (ex: -1 para violão/guitarra).
     * @type {number} */
    #oitava = 0;

    constructor(tipo = ClaveTipo.TREBLE, oitava = 0) {
        this.tipo = tipo;
        this.oitava = oitava;
    }
    /**
     * Retorna a string base de configuração.
     * @returns {string} Ex: "clef=treble-8"
     */
    get #toString() {
        const base = this.#tipo.valor;
        if (this.#oitava === 0) return `clef=${base}`;

        // Se oitava for -1, o abcjs usa "-8"
        const sufixo = this.#oitava > 0 ? `+${this.#oitava * 8}` : `${this.#oitava * 8}`;
        return `clef=${base}${sufixo}`;
    }

    /**
     * Gera a string de configuração para o abcjs.
     * Ex: clef=treble-8 ou clef=bass
     */
    toAbc() {
        return this.#toString;
    }
    /**
     * Gera a string para mudança de clave no meio da pauta (dentro do Compasso).
     * O ABCJS processa isso "inline" perfeitamente envolto em colchetes.
     * @returns {string} Ex: "[clef=treble-8]"
     */
    toCompasso() {
        return `[${this.#toString}]`;
    }
    get tipo() {
        return this.#tipo;
    }
    get oitava() {
        return this.#oitava;
    }
    /**
     * USAGE: Define a oitava da nota/sintetizador.
     * Ex: oitava = 4;
     * * @param {number} oitava - O valor numérico da oitava (limite matemático de 0 a 127).
     * @throws {Error} Lança um erro se o valor recebido não for um número ou se estiver fora do intervalo permitido.
     */
    set oitava(oitava) {
        if (typeof oitava !== 'number') {
            throw new Error(`A oitava deve ser numero entre 0 até 127`);
        }
        if (oitava < 0 || oitava > 8) {
            throw new Error(`A oitava deve ser numero entre 0 até 127`);
        }
        this.#oitava = oitava;
    }
    /**
     * USAGE: Define O tipoda Clave.
     * Ex: tipo = ClaveTipo.TREBLE;
     * * @param {ClaveTipo} tipo - Valor contido na Enum ClaveTipo.
     * @throws {Error} Lança um erro se o valor recebido não for um ClaveTipo [ClaveTipo.TREBLE | ClaveTipo.BASS | ClaveTipo.ALTO | ClaveTipo.TENOR | ClaveTipo.PERC].
     */
    set tipo(tipo) {
        if ( !tipo || !tipo.valor ) {
            throw new Error(`Tipo de Clave deve ser instância ClaveTipo`);
        }
        this.#tipo = tipo;
    }
    /**
     * USAGE: Helper para criação rápida de Clave a partir de um JSON.
     * Ex: Clave.create({ tipo: "TREBLE", oitava: 0 })
     * @param {Object} json - Objeto com as propriedades tipo e oitava.
     * @param {string} [json.tipo="TREBLE"] - Chave da Clave (TREBLE, BASS, ALTO, etc).
     * @param {number} [json.oitava=0] - Oitava da Clave.
     * @returns {Clave}
     */
    static create( json = {} ) {
        if (json instanceof Clave) return json;
        // 1. Desestrutura o objeto recebido por parâmetro
        let { tipo, oitava } = json;

        // 2. Se não enviou tipo, assume a CHAVE 'TREBLE' (como string)
        if ( !tipo ) {
            tipo = 'TREBLE';
        }

        // 3. Se não enviou oitava (checa undefined para não sobrescrever caso enviem oitava 0)
        if ( oitava === undefined ) {
            oitava = 0;
        }

        // 4. Busca o objeto correto dentro do Enum e instancia a Clave
        const instanciaTipo = ClaveTipo[tipo];

        // Segurança extra: se enviaram uma string que não existe no Enum (ex: tipo: "GUITARRA")
        if ( !instanciaTipo ) {
            throw new Error(`Tipo de Clave não encontrada. Deve ser uma destas chaves: ${Object.keys(ClaveTipo).join(', ')}`);
        }

        return new Clave( instanciaTipo, oitava );
    }
}

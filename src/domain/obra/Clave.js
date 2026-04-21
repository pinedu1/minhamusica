import { ClaveTipo } from '@domain/obra/ClaveTipo.js';
import { ClaveSchema } from '@schemas/claveSchema.js';

export class Clave {
    /** @type {keyof typeof ClaveTipo} */
    #tipo = null;

    /** * Deslocamento de oitava (ex: -1 para violão/guitarra).
     * @type {number} */
    #oitava = 0;
    #middle = 'B';
    #key = null;
    #transpositor = 0;
    constructor(tipo = 'TREBLE', oitava = 0) {
        if ( typeof tipo === 'object' ) {
            tipo = tipo.key || tipo.tipo;
        }
        const obj = ClaveTipo[tipo];
        this.tipo = obj;
        this.oitava = oitava;
        this.#middle = obj.middle;
        this.#key = obj.key;
    }
	toString() {
		return this.#tipo.valor;
	}
    toVoz() {
        let sufixo = ''; //this.#oitava != 0 ? `+${this.#oitava * 8}` : `-${this.#oitava * 8}`;
        if (this.#oitava > 0) {
           sufixo = `+8`;
        } else if (this.#oitava < 0) {
            sufixo = `-8`;
        }
        let meio = '' // this.#middle? ` middle=${this.#middle}` : '';  /* TODO: implementar futuramewnte */
        return `${this.toString()}${sufixo}${meio}`;
    }
    /**
     * Gera a string para mudança de clave no meio da pauta (dentro do Compasso).
     * O ABCJS processa isso "inline" perfeitamente envolto em colchetes.
     * @returns {string} Ex: "[clef=treble-8]"
     */
    toCompasso() {
        return `[${this.toString()}]`;
    }
    get tipo() {
        return this.#tipo;
    }
    get oitava() {
        return this.#oitava;
    }
    get key() {
        return this.#key;
    }
    get middle() {
        return this.#middle;
    }
    get transpositor() {
        return this.#transpositor;
    }
    /**
     * Define o transpositor da Clave.
     * @param {1|0|-1} transpositor
     */
    set transpositor(transpositor) {
        // Validação real: Se o valor passado não estiver no nosso array permitido...
        if (![1, 0, -1].includes(transpositor)) {
            // Opção A: Lançar um erro para o desenvolvedor consertar
            throw new TypeError("O transpositor deve ser estritamente 1, 0 ou -1.");
        }

        this.#transpositor = transpositor;
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
}

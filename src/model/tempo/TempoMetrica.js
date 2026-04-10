/**
 * Representa a fração de tempo de uma nota (ex: 1/4, 3/8).
 * M:	Meter :see part one of this tutorial for further details
 * Q:	Tempo -see part one of this tutorial for further details
 * R:	Rhythm -see part one of this tutorial for further details
 *
 */
export class TempoMetrica {
    #numerador;
    #denominador;

    /**
     * USAGE: Cria uma fração de tempo validando se os valores são inteiros positivos.
     * @param {number} numerador - O numerador da fração (ex: 1). Deve ser um número inteiro.
     * @param {number} denominador - O denominador da fração (ex: 4). Deve ser um número inteiro.
     * @throws {TypeError} Se algum dos argumentos não for um número inteiro.
     * @throws {Error} Se algum dos argumentos for menor ou igual a zero.
     */
    constructor(numerador = 4, denominador = 4) {
        // Utilizamos os setters para aplicar a validação
        this.numerador = numerador;
        this.denominador = denominador;
    }

    get numerador() {
        return this.#numerador;
    }

    /**
     * @param {number} novoNumerador
     */
    set numerador(novoNumerador) {
        if (!Number.isInteger(novoNumerador)) {
            throw new TypeError(`O numerador deve ser um número inteiro. Recebido: ${novoNumerador}`);
        }
        if (novoNumerador <= 0) {
            throw new Error(`O numerador deve ser um número positivo maior que zero. Recebido: ${novoNumerador}`);
        }
        this.#numerador = novoNumerador;
    }

    get denominador() {
        return this.#denominador;
    }

    /**
     * @param {number} novoDenominador
     */
    set denominador(novoDenominador) {
        if (!Number.isInteger(novoDenominador)) {
            throw new TypeError(`O denominador deve ser um número inteiro. Recebido: ${novoDenominador}`);
        }
        if (novoDenominador <= 0) {
            throw new Error(`O denominador deve ser um número positivo maior que zero (para evitar divisão por zero). Recebido: ${novoDenominador}`);
        }
        this.#denominador = novoDenominador;
    }

    /**
     * @returns {string} Ex: "1/4"
     */
    toString() {
        return `${this.#numerador}/${this.#denominador}`;
    }
    toCompasso() {
        return `[M:${this.toString()}]`;
    }

    /**
     * @returns {number} O valor decimal da fração (ex: 0.25).
     */
    get razao() {
        return this.#numerador / this.#denominador;
    }

    /**
     * USAGE: Retorna a representação ABC para a duração da nota.
     * Simplifica a string omitindo o número 1 (ex: 1/4 vira /4, 2/1 vira 2).
     * @returns {string}
     */
    toAbc() {
        if (this.#numerador === 1 && this.#denominador === 1) return "1";
        const num = this.#numerador === 1 ? "" : this.#numerador;
        const den = this.#denominador === 1 ? "" : `/${this.#denominador}`;
        return `M:${num}${den}\n`;
    }
    static create( tempo ) {
        const parts = tempo.split("/");
        const num = parseInt(parts[0]);
        const den = parseInt(parts[1] || 1);
        return new TempoMetrica(num, den);
    }
}

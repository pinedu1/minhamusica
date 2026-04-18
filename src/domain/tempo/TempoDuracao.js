import { tempoDuracaoSchema, uniaoTempoDuracao } from '@schemas/tempoDuracaoSchema.js';

/**
 * Representa a fração de tempo de uma nota (ex: 1/4, 3/8).
 */
export class TempoDuracao {
    #numerador;
    #denominador;

    /**
     * USAGE: Cria uma fração de tempo validando se os valores são inteiros positivos.
     * @param {number} numerador - O numerador da fração (ex: 1). Deve ser um número inteiro.
     * @param {number} denominador - O denominador da fração (ex: 4). Deve ser um número inteiro.
     * @throws {TypeError} Se algum dos argumentos não for um número inteiro.
     * @throws {Error} Se algum dos argumentos for menor ou igual a zero.
     */
    constructor(numerador = 1, denominador = 4) {
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
     * @returns {number} O valor decimal da fração (ex: 0.25).
     */
    get razao() {
        return this.#numerador / this.#denominador;
    }
    /**
     * @returns {string} Ex: "1/4"
     */
    toString() {
        return `${this.#numerador}/${this.#denominador}`;
    }
}

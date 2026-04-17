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
    toCompasso() {
        return `[L:${this.toString()}]`;
    }
    /**
     * USAGE: Retorna a representação ABC para a duração da nota.
     * Simplifica a string omitindo o número 1 (ex: 1/4 vira /4, 2/1 vira 2).
     * @returns {string}
     */
    toNota() {
        if (this.#numerador === 1 && this.#denominador === 1) return "1";
        const num = this.#numerador === 1 ? "" : this.#numerador;
        const den = this.#denominador === 1 ? "" : `/${this.#denominador}`;
        return `${num}${den}`;
    }
    /**
     * USAGE: Retorna a representação ABC para a duração da nota.
     * Simplifica a string omitindo o número 1 (ex: 1/4 vira /4, 2/1 vira 2).
     * @returns {string}
     */
    toAbc() {
        return `L:${this.toString()}`;
    }
    
    toJSON() {
        return {
            numerador: this.#numerador,
            denominador: this.#denominador
        };
    }

    // 2. O Helper Estático
    static create(dados) {
        // Se já for uma instância de TempoDuracao, não precisa recriar
        if (dados instanceof TempoDuracao) return dados;

        // Usamos safeParse para não estourar o erro padrão do Zod
        const resultado = uniaoTempoDuracao.safeParse(dados);

        // Caso não validou, levanta o throw personalizado
        if (!resultado.success) {
            throw new TypeError("TempoDuracao.create: unidadeTempo deve ser uma string.");
        }

        // Se validou, extraímos os dados limpos
        const validado = resultado.data;
        const regexFracao = /^\d+\/[1-9]\d*$/;
        if ( regexFracao.test(validado) ) {
            // Se entrou como string "1/4", quebra e passa para o construtor
            const partes = validado.split('/');
            const num = parseInt(partes[0], 10);
            const den = parseInt(partes[1], 10);

            return new TempoDuracao(num, den);
        }

        if (validado.duracao && regexFracao.test(validado.duracao)) {
            // Se entrou como string "1/4", quebra e passa para o construtor
            const partes = validado.duracao.split('/');
            const num = parseInt(partes[0], 10);
            const den = parseInt(partes[1], 10);

            return new TempoDuracao(num, den);
        }
        if (validado.numerador && validado.denominador) {
            return new TempoDuracao(validado.numerador, validado.denominador);
        }
        return null;
    }
    equals(outroTempo) {
        if (!(outroTempo instanceof TempoDuracao)) return false;
        // Comparamos a razão (decimal) para considerar 1/2 igual a 2/4
        return Math.abs(this.razao - outroTempo.razao) < 0.000001;
    }
}

import { EstruturaTempo } from './EstruturaTempo.js';
import { UnidadeDuracao } from './UnidadeDuracao.js';

/**
 * Classe responsável por calcular e armazenar a duração rítmica de uma nota
 * em relação a uma unidade base (L:).
 */
export class Duracao {
    /** @type {EstruturaTempo} - Estrutua de Pulsos da Obra: 4/4, 3/4, 6/8 */
    #estruturaTempo;
    /** @type {UnidadeDuracao} - Tamanho do Pulso da Obra: 1/4, 1/8, 1/16, etc.*/
    #unidadePulso;

    /**
     * USAGE: Cria uma duração resolvida para uma nota.
     * 
     * @param {EstruturaTempo} tempoNota - O tempo rítmico da nota (ex: 1/4 para semínima).
     * @param {UnidadeDuracao} unidadeBase - A unidade base L: (ex: 1/8 para colcheia).
     * @example
     * // Uma Mínima (2/4) em um contexto de Colcheia (1/8)
     * const d = new Duracao(new EstruturaTempo(2, 4), new EstruturaTempo(1, 8));
     * console.log(d.abc); // "4"
     */
    constructor(tempoNota, unidadeBase) {
        if ( !(tempoNota instanceof EstruturaTempo) ) {
            throw new Error("Duracao requer instâncias de EstruturaTempo.");
        }
        if ( !(unidadeBase instanceof UnidadeDuracao)) {
            throw new Error("UnidadeBase requer instâncias de UnidadeDuracao.");
        }
        this.#estruturaTempo = tempoNota;
        this.#unidadePulso = unidadeBase;
    }
    /**
     * Converte um número decimal em uma fração simplificada em formato de string.
     * @param {number} decimal - O número decimal (ex: 0.5, 0.25, 0.75, 1.5)
     * @returns {string} - A fração formatada (ex: "1/2", "1/4", "3/4", "3/2")
     */
    #paraFracao(decimal) {
        // 1. Se já for um número inteiro, retorna ele mesmo
        if (Number.isInteger(decimal)) {
            return decimal.toString();
        }

        // 2. Descobre quantas casas decimais o número possui
        const strDecimal = decimal.toString();
        const casasDecimais = strDecimal.split('.')[1].length;

        // 3. Monta a fração base multiplicando por potências de 10
        // Ex: 0.75 vira numerador 75 e denominador 100
        const multiplicador = Math.pow(10, casasDecimais);
        let numerador = Math.round(decimal * multiplicador);
        let denominador = multiplicador;

        // 4. Função interna para calcular o Máximo Divisor Comum (MDC)
        const calcularMDC = (a, b) => {
            while (b !== 0) {
                let resto = a % b;
                a = b;
                b = resto;
            }
            return a;
        };

        // 5. Encontra o MDC entre o numerador e o denominador
        const mdc = calcularMDC(numerador, denominador);

        // 6. Retorna a fração simplificada
        return `${numerador / mdc}/${denominador / mdc}`;
    };

    #calculaPulsos(f, u) {
        // 1. Qual é o valor matemático de 1 BATIDA do metrônomo (Pulso)?
        // Pega-se sempre 1 dividido pelo denominador da Fórmula (M)
        const valorDeUmPulso = 1 / f.unidadeTempo;
        // Ex: Em 4/4, o pulso é 1/4 = 0.25
        // Ex: Em 6/8, o pulso é 1/8 = 0.125

        // 2. Qual é a duração matemática da nossa Unidade Base (L)?
        const valorDaBase = u.quantidade / u.unidadeTempo;
        // Ex: L: 1/4 = 0.25
        // Ex: L: 1/8 = 0.125

        // 3. A FÓRMULA MÁGICA: Quantos pulsosOcupados a nossa base ocupa?
        const quantidadeDePulsos = valorDaBase / valorDeUmPulso;

        return quantidadeDePulsos;
    }
    #calculaRazao() {
        return this.#estruturaTempo.razao / this.#unidadePulso.razao;
    }
    /**
     * Converte um valor decimal de pulsosOcupados para o modificador de duração do ABC.
     * @returns {string} - A string formatada para o ABC (ex: "3/4", "/2", "", "2")
     */
    toAbc() {
        const pulsos = this.#calculaPulsos(this.#estruturaTempo, this.#unidadePulso);
        const fracaoPulsos = this.#paraFracao(pulsos);
        const fracaoEstruturaTempo = this.#paraFracao(this.#estruturaTempo.razao);
        const fracaoUnidadeBase = this.#paraFracao(this.#unidadePulso.razao);
        const razao = this.#calculaRazao();
        const fracaoRazao = this.#paraFracao(razao);
        // 1. Caso base: 1 pulso não leva modificador
        if (pulsos === 1) return "";

        // 2. Números inteiros maiores (ex: 2, 3, 4) não precisam de fração
        if (Number.isInteger(pulsos)) return pulsos.toString();

        // 2.5. Números inteiros maiores (ex: 2, 3, 4) não precisam de fração
        if (Number.isInteger(razao)) return razao.toString();

        // 3. Converter decimal em fração
        // O denominador máximo é 64 (cobre até as semifusas/quartifusas na partitura)
        const maxDenominator = 64;
        let numerator = 0;
        let denominator = 1;
        let minError = Infinity;

        // Busca a fração que melhor representa o decimal
        for (let d = 2; d <= maxDenominator; d++) {
            const n = Math.round(pulsos * d);
            const error = Math.abs(pulsos - (n / d));

            if (error < minError) {
                numerator = n;
                denominator = d;
                minError = error;
            }

            if (error === 0) break; // Encontrou a fração exata (ex: 0.75 cravou em 3/4), sai do loop
        }

        // 4. Formatação final específica para o parser ABC
        if (numerator === 1) {
            // Para 1/2, 1/4, etc. O ABC aceita tanto "/" quanto "/2",
            // mas retornar "/2" mantém a clareza que você pediu.
            return `/${denominator}`;
        }

        // Para 3/4, 3/2, etc.
        return `${numerator}/${denominator}`;
    }
}

import { Compasso } from '../model/Compasso.js';
import { Nota } from '../model/Nota.js';
import { EstruturaTempo } from '../model/EstruturaTempo.js';
import { Duracao } from '../model/Duracao.js';
import { Altura } from '../model/Altura.js';
import { AlturaMidiEnum } from '../model/AlturaMidi.js';

export class FluxoMusicalParser {
    /**
     * @param {string} textoFull - A string completa (ex: "A/d/e/ f d/ c B F/G/")
     * @param {EstruturaTempo} formula - Objeto M: (ex: 4/4)
     * @param {Duracao} unidadeBase - Objeto L: (ex: 1/8)
     * @returns {Compasso[]} Matriz de objetos Compasso
     */
    static parse(textoFull, formula, unidadeBase) {
        const compassos = [];
        const valorMaximo = formula.getValorTotal(); // Ex: 4/4 = 4.0 tempos

        let compassoAtual = new Compasso(0, { estruturaTempo: formula });
        let acumuladoNoCompasso = 0;

        // Regex para capturar os tokens musicais
        const TOKEN_REGEX = /([\^=_]*[A-Ga-g][,']*)([\d/]*)([-]?)/g;
        //const TOKEN_REGEX = /([\^=_]*[A-Ga-g][,']*?)([\d/]*)([-]?)/g;
        let match;
        while ((match = TOKEN_REGEX.exec(textoFull)) !== null) {
            const [_, alturaStr, duracaoStr, ligadura] = match;

            let valorRestanteNota = this.#calcularDuracaoReal(duracaoStr, unidadeBase);
            const altura = this.#resolverAltura(alturaStr);

// ... código anterior do regex ...

            while (valorRestanteNota > 0) {
                const espacoDisponivel = Number((valorMaximo - acumuladoNoCompasso).toFixed(8));

                if (espacoDisponivel <= 0) {
                    compassos.push(compassoAtual);
                    const novoIndice = compassos.length;
                    compassoAtual = new Compasso(novoIndice, { estruturaTempo: formula });
                    acumuladoNoCompasso = 0;
                    continue;
                }

                // Calcula o valor em ponto flutuante da fatia
                let valorDestaParte = Math.min(valorRestanteNota, espacoDisponivel);

                // --- A MUDANÇA ENTRA AQUI ---
                // Converte o float de volta para a string ABC que o seu método espera
                const tempoStringFormatada = this.#converterFloatParaTempoString(valorDestaParte);

                // Instancia usando a busca por texto
                const duracaoConvertida = Duracao.getByTempo(tempoStringFormatada);

                if (!duracaoConvertida) {
                    console.error(`Erro: Duração string '${tempoStringFormatada}' não encontrada no Enum.`);
                }

                const novaNota = new Nota(altura, duracaoConvertida);
                // ----------------------------

                if (valorRestanteNota > espacoDisponivel || ligadura === '-') {
                    novaNota.ligada = true;
                }

                compassoAtual.notaAppend(novaNota);

                // Blindando a soma para evitar falhas de precisão no JS
                acumuladoNoCompasso = Number((acumuladoNoCompasso + valorDestaParte).toFixed(8));
                valorRestanteNota = Number((valorRestanteNota - valorDestaParte).toFixed(8));

                if (acumuladoNoCompasso >= valorMaximo) {
                    compassos.push(compassoAtual);
                    const novoIndice = compassos.length;
                    compassoAtual = new Compasso(novoIndice, { estruturaTempo: formula });
                    acumuladoNoCompasso = 0;
                }
            }
        }
        // Adiciona o último compasso se ele tiver notas (mesmo que incompleto)
        if (compassoAtual.notas.length > 0) {
            compassos.push(compassoAtual);
        }

        return compassos;
    }

    /**
     * Traduz modificadores de duração do padrão ABC para valores rítmicos reais.
     * * O retorno é o produto do multiplicador da string pelo valor decimal da unidade base (L:).
     * * @param {string} str - O sufixo de duração da nota (ex: "3", "3/2", "/2").
     * @param {DuracaoBase} unidadeBase - Objeto contendo o valor da unidade padrão (ex: L:1/8 = 0.5).
     * @returns {number} Valor real da nota em tempos (beats).
     * * @example
     * // SITUAÇÃO 1: Ausência de modificador (Nota Padrão)
     * // Entrada: str = "", unidadeBase = {valor: 0.5} (L:1/8)
     * // Retorno: 0.5 (A nota dura exatamente uma Colcheia)
     * * // SITUAÇÃO 2: Multiplicador Inteiro ou Fração Explícita (Aumento/Pontuado)
     * // Entrada: str = "3/2", unidadeBase = {valor: 1.0} (L:1/4)
     * // Retorno: 1.5 (Uma Semínima pontuada: 1.0 * 1.5)
     * * // SITUAÇÃO 3: Subdivisão por Barras (Encurtamento)
     * // Entrada: str = "/4", unidadeBase = {valor: 0.5} (L:1/8)
     * // Retorno: 0.125 (Uma Fusa: 0.5 dividido por 4)
     */
    static #calcularDuracaoReal(str, unidadeBase) {
        // unidadeBase.valor para L:1/8 é 0.5
        if (!str) return unidadeBase.valor;

        // Lógica de frações (ex: "3/2", "/2", "2")
        if (str === "/") return unidadeBase.valor / 2;
        if (str.startsWith("/")) {
            return unidadeBase.valor / (parseInt(str.substring(1)) || 2);
        }
        if (str.includes("/")) {
            const [n, d] = str.split("/").map(Number);
            return (n / (d || 2)) * unidadeBase.valor;
        }
        return parseFloat(str) * unidadeBase.valor;
    }
    static #converterFloatParaTempoString(valorDecimal) {
        const tolerancia = 0.0001; // Lida com o lixo de ponto flutuante do JS

        // Testa os denominadores comuns da música: semibreve(1) até semifusa(64)
        for (let denominador of [1, 2, 4, 8, 16, 32, 64]) {
            let numerador = valorDecimal * denominador;

            // Verifica se chegamos a um numerador inteiro (ex: 0.25 * 4 = 1.0)
            if (Math.abs(Math.round(numerador) - numerador) < tolerancia) {
                numerador = Math.round(numerador);

                // Ajuste aqui conforme os padrões literais do seu Enum Duracao!
                // Exemplo: se o valor inteiro for 1, seu enum usa "1/1" ou "1"?
                if (numerador === 1 && denominador === 1) return "1/1"; // ou "1"

                return `${numerador}/${denominador}`; // Retorna "1/4", "1/2", "3/8", etc.
            }
        }

        // Fallback caso a fração seja muito bizarra (notas tercinadas complexas)
        console.warn(`Não foi possível converter a duração decimal ${valorDecimal} para string.`);
        return "1/4"; // Ou outro valor padrão de fallback
    }
    static #resolverAltura(str) {
        return Altura.resolverAltura(str);
    }
}
import { Compasso } from '../model/Compasso.js';
import { Nota } from '../model/Nota.js';
import { EstruturaTempo } from '../model/EstruturaTempo.js';
import { Duracao } from '../model/Duracao.js';
import { Altura } from '../model/Altura.js';
import { AlturaMidi } from '../model/AlturaMidi.js';

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
        const TOKEN_REGEX = /([\^=_]*[A-Ga-g][,']*?)([\d/]*)([-]?)/g;
        let match;

        while ((match = TOKEN_REGEX.exec(textoFull)) !== null) {
            const [_, alturaStr, duracaoStr, ligadura] = match;

            // Calcula o valor real da nota baseado em L:
            const valorNota = this.#calcularDuracaoReal(duracaoStr, unidadeBase);

            // REGRA DE OURO: E se a nota for maior que o espaço restante?
            // (Aqui poderíamos implementar o 'Tie' automático, mas vamos simplificar
            // assumindo que as notas cabem ou encerram o compasso)

            const novaNota = new Nota(this.#resolverAltura(alturaStr), Duracao.getByValor( valorNota ) );
            if (ligadura === '-') novaNota.ligada = true;

            compassoAtual.notas.push(novaNota);
            acumuladoNoCompasso += valorNota;

            // Se o compasso encheu (ou transbordou)
            if (acumuladoNoCompasso >= valorMaximo) {
                compassos.push(compassoAtual);

                // Abre o próximo compasso
                const novoIndice = compassos.length;
                compassoAtual = new Compasso(novoIndice, { estruturaTempo: formula });
                acumuladoNoCompasso = 0;
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

    static #resolverAltura(str) {
        const a = Object.values(AlturaMidi).find(a => a.abcjs === str) || AlturaMidi.C4;
        return new Altura(a);
    }
}
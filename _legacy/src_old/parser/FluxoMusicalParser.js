import { Compasso } from '@domain/Compasso.js';
import { Nota } from '@domain/Nota.js';
import { EstruturaTempo } from '@domain/EstruturaTempo.js';
import { Duracao, DuracaoBase } from '@domain/Duracao.js';
import { Acorde } from '@domain/Acorde.js';

/**
 * Utilitário responsável por converter strings de texto ABC em objetos musicais,
 * gerenciando a estrutura de compassos e a rítmica associada.
 */
export class FluxoMusicalParser {
    /**
     * USAGE: Transforma uma string ABC em uma matriz de compassos, 
     * gerenciando automaticamente o transbordo rítmico (Tie) entre compassos.
     * 
     * @param {string} textoFull - A string completa (ex: "A B c d | e f g a")
     * @param {EstruturaTempo} formula - Objeto M: (ex: 4/4)
     * @param {DuracaoBase|EstruturaTempo} unidadeBase - A unidade L: (ex: 1/8)
     * @returns {Compasso[]} Matriz de objetos Compasso.
     */
    static parse(textoFull, formula, unidadeBase) {
        const compassos = [];
        const valorMaximo = formula.getValorTotal();

        let compassoAtual = ObjectFactory.newCompasso(compassos.length, { estruturaTempo: formula });
        let acumuladoNoCompasso = 0;

        const TOKEN_REGEX = /\[([^\]]+)\]([\d/]*)([-]?)|([\^=_]*[A-Ga-g][,']*)([\d/]*)([-]?)/g;

        let match;
        while ((match = TOKEN_REGEX.exec(textoFull)) !== null) {
            const [
                fullMatch,
                corpoAcorde, durAcorde, ligAcorde, // Grupo 1, 2, 3 (Acorde)
                corpoNota, durNota, ligNota        // Grupo 4, 5, 6 (Nota)
            ] = match;

            const isAcorde = !!corpoAcorde;
            const conteudoBruto = isAcorde ? corpoAcorde : corpoNota;
            const duracaoStr = isAcorde ? durAcorde : durNota;
            const temLigaduraOriginal = (isAcorde ? ligAcorde : ligNota) === '-';

            // 1. Calcula o valor rítmico absoluto do token.
            let valorRestante = Duracao.calcularDuracaoReal(duracaoStr, unidadeBase);

            // 2. Loop de Transbordo (Automatic Tie)
            while (valorRestante > 0) {
                const espacoDisponivel = Number((valorMaximo - acumuladoNoCompasso).toFixed(8));

                if (espacoDisponivel <= 0) {
                    if (compassoAtual.vozes.length > 0) compassos.push(compassoAtual);
                    compassoAtual = ObjectFactory.newCompasso(compassos.length, { estruturaTempo: formula });
                    acumuladoNoCompasso = 0;
                    continue;
                }

                let valorDestaParte = Math.min(valorRestante, espacoDisponivel);
                
                // Tenta encontrar a duração absoluta no contexto.
                const contexto = (unidadeBase instanceof DuracaoBase) ? unidadeBase.parent : null;
                const duracaoObjeto = contexto 
                    ? (contexto.getByValor(valorDestaParte) || valorDestaParte)
                    : valorDestaParte;

                let elemento;
                if (isAcorde) {
                    elemento = Acorde.resolverNotas(conteudoBruto, duracaoObjeto, unidadeBase);
                } else {
                    elemento = Nota.resolverNota(conteudoBruto, duracaoObjeto, unidadeBase);
                }

                // REGRA DE OURO: Ativa a ligadura se a nota transbordar ou se já possuía uma.
                if (valorRestante > espacoDisponivel || temLigaduraOriginal) {
                    elemento.ligada = true;
                }

                compassoAtual.notaAppend(elemento, 0);

                acumuladoNoCompasso = Number((acumuladoNoCompasso + valorDestaParte).toFixed(8));
                valorRestante = Number((valorRestante - valorDestaParte).toFixed(8));

                if (acumuladoNoCompasso >= valorMaximo) {
                    compassos.push(compassoAtual);
                    compassoAtual = ObjectFactory.newCompasso(compassos.length, { estruturaTempo: formula });
                    acumuladoNoCompasso = 0;
                }
            }
        }

        if (compassoAtual.vozes.length > 0 && !compassos.includes(compassoAtual)) {
            compassos.push(compassoAtual);
        }

        return compassos;
    }
}

import { Compasso } from '../model/Compasso.js';
import { Nota } from '../model/Nota.js';
import { EstruturaTempo } from '../model/EstruturaTempo.js';
import {Duracao, DuracaoBase} from '../model/Duracao.js';
import { Acorde } from '../model/Acorde.js';

export class FluxoMusicalParser {
    /**
     * @param {string} textoFull - A string completa (ex: "A/d/e/ f d/ c B F/G/ [cde]/")
     * @param {EstruturaTempo} formula - Objeto M: (ex: 4/4)
     * @param {Duracao} unidadeBase - Objeto L: (ex: 1/8)
     * @returns {Compasso[]} Matriz de objetos Compasso
     */
    static parse(textoFull, formula, unidadeBase) {
        const compassos = [];
        const valorMaximo = formula.getValorTotal();

        let compassoAtual = new Compasso(compassos.length, { estruturaTempo: formula });
        let acumuladoNoCompasso = 0;

        const TOKEN_REGEX = /\[([^\]]+)\]([\d/]*)([-]?)|([\^=_]*[A-Ga-g][,']*)([\d/]*)([-]?)/g;

        let match;
        while ((match = TOKEN_REGEX.exec(textoFull)) !== null) {
            const [
                fullMatch,
                corpoAcorde, durAcorde, ligAcorde, // Grupo 1, 2, 3
                corpoNota, durNota, ligNota        // Grupo 4, 5, 6
            ] = match;

            const isAcorde = !!corpoAcorde;
            const conteudoBruto = isAcorde ? corpoAcorde : corpoNota;
            const duracaoStr = isAcorde ? durAcorde : durNota;
            const temLigaduraOriginal = (isAcorde ? ligAcorde : ligNota) === '-';

            let valorRestante = DuracaoBase.calcularDuracaoReal(duracaoStr, unidadeBase);

            while (valorRestante > 0) {
                const espacoDisponivel = Number((valorMaximo - acumuladoNoCompasso).toFixed(8));

                if (espacoDisponivel <= 0) {
                    if (compassoAtual.vozes.length > 0) compassos.push(compassoAtual);
                    compassoAtual = new Compasso(compassos.length, { estruturaTempo: formula });
                    acumuladoNoCompasso = 0;
                    continue;
                }

                let valorDestaParte = Math.min(valorRestante, espacoDisponivel);
                const tempoStr = DuracaoBase.converterFloatParaTempoString(valorDestaParte);
                const duracaoObjeto = Duracao.getByTempo(tempoStr) || Duracao.COLCHEIA;

                // --- DELEGAÇÃO DE CRIAÇÃO ---
                let elemento;
                if (isAcorde) {
                    // Acorde se resolve sozinho
                    elemento = Acorde.resolverNotas(conteudoBruto, duracaoObjeto);
                } else {
                    // Nota se resolve sozinha
                    elemento = Nota.resolverNota(conteudoBruto, duracaoObjeto);
                }

                // Lógica de ligadura (se for cortada pelo compasso ou se já tinha o '-')
                if (valorRestante > espacoDisponivel || temLigaduraOriginal) {
                    elemento.ligada = true;
                }

                compassoAtual.notaAppend(elemento, 0);

                acumuladoNoCompasso = Number((acumuladoNoCompasso + valorDestaParte).toFixed(8));
                valorRestante = Number((valorRestante - valorDestaParte).toFixed(8));

                if (acumuladoNoCompasso >= valorMaximo) {
                    compassos.push(compassoAtual);
                    compassoAtual = new Compasso(compassos.length, { estruturaTempo: formula });
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
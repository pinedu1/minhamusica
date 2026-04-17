/**
 * @file PausaAbc.js
 * @description Adaptador para manipular entrada e saída no formato ABCJS para Pausas.
 */

import { Pausa } from '@domain/nota/Pausa.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

/**
 * Classe responsável por traduzir Pausas entre o modelo de domínio e o formato ABCJS.
 */
export class PausaAbc {
    /**
     * @param {Pausa} pausa - A instância de domínio da Pausa.
     */
    constructor( pausa ) {
        this.pausa = pausa;
    }

    /**
     * Retorna a string de marcações extras aplicáveis na Pausa em ABC.
     *
     * @returns {string} String com as marcações extras, se existirem.
     * @example
     * const extras = adaptador.getNotasExtras();
     */
    getNotasExtras() {
        let notaStrExtra = '';
        if ( this.pausa.fermata ) {
            notaStrExtra += '!fermata!';
        }
        if ( this.pausa.breath ) {
            notaStrExtra += '!breath!';
        }
        
        const acordes = this.pausa.acordes;
        if ( acordes ) {
            if ( Array.isArray( acordes ) ) {
                notaStrExtra += acordes.map( ac => `"${ac}"` ).join( '' );
            } else if ( typeof acordes === 'string' ) {
                notaStrExtra += `"${acordes}"`;
            }
        }
        return notaStrExtra;
    }

    /**
     * Formata a duração no padrão do ABC (como string).
     * Retorna "1" para semínima (se a unidade de tempo for 1/4),
     * "2" para mínima, "1/2" para colcheia, etc.
     *
     * @returns {string} Duração formatada em ABCJS.
     * @example
     * const duracaoStr = adaptador.formatarDuracaoAbc();
     */
    formatarDuracaoAbc() {
        let duracaoAbc = this.pausa.duracao.multiplicador;
        const opts = this.pausa.options;
        const dCompasso = opts.compasso?.duracao || 1;
        const dUnidade = opts.unidadeTempo || 1;
        duracaoAbc = duracaoAbc / ( dCompasso / dUnidade );
        
        let duracaoFinal;
        if ( duracaoAbc === 1 ) {
            duracaoFinal = '';
        } else if ( duracaoAbc === 0.5 ) {
            duracaoFinal = '/2';
        } else if ( duracaoAbc === 0.25 ) {
            duracaoFinal = '/4';
        } else if ( duracaoAbc === 0.125 ) {
            duracaoFinal = '/8';
        } else if ( duracaoAbc === 0.0625 ) {
            duracaoFinal = '/16';
        } else if ( Number.isInteger( duracaoAbc ) ) {
            duracaoFinal = duracaoAbc.toString();
        } else {
            // Em caso de duvidas ou ritmos complexos
            duracaoFinal = duracaoAbc.toString();
        }
        return duracaoFinal;
    }

    /**
     * Converte a pausa para sua representação no formato ABC.
     *
     * @returns {string} A string correspondente à pausa em notação ABC.
     * @example
     * const abc = adaptador.toAbc(); // Ex: "z2" ou "x/2"
     */
    toAbc() {
        const char = this.pausa.invisivel ? 'x' : 'z';
        const strDuracao = this.formatarDuracaoAbc();
        const strExtras = this.getNotasExtras();
        
        return `${strExtras}${char}${strDuracao}`;
    }
}

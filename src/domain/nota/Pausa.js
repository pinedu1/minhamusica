import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { ElementoMusical } from '@domain/nota/ElementoMusical.js';

/**
 * Representa um silêncio (pausa) na pauta musical, focada exclusivamente no estado do domínio.
 *
 * @example
 * const duracao = new TempoDuracao( 1, 4 );
 * const pausa = new Pausa( duracao, { invisivel: true } );
 */
export class Pausa extends ElementoMusical {
    /**
     * @param {import('@domain/tempo/TempoDuracao').TempoDuracao} duracao - Duração da pausa.
     * @param {Object} [options={}] - Configurações opcionais.
     * @param {string|string[]|null} [options.acordes] - Acorde(s) na posição da pausa.
     * @param {boolean} [options.invisivel=false] - Define se é pausa de espaço (x).
     * @param {Object} [options.voz] - Instância da voz a que pertence.
     */
    constructor( duracao, options = {} ) {
        super( duracao, options );
        this._options = Object.assign( {
            obra: null
            , voz: null
            , compasso: null
            , unidadeTempo: null
            , fermata: false
            , breath: null
            , invisivel: false
            , acordes: []
        }, options );
        this._duracao = duracao;
    }

    /**
     * Retorna se a pausa possui fermata.
     *
     * @returns {boolean} Verdadeiro se possui fermata.
     * @example
     * const temFermata = pausa.fermata;
     */
    get fermata() {
        return this._options.fermata === true;
    }

    /**
     * Retorna se a pausa possui marcação de respiração.
     *
     * @returns {boolean} Verdadeiro se possui marcação de respiração.
     * @example
     * const temBreath = pausa.breath;
     */
    get breath() {
        return this._options.breath === true;
    }

    /**
     * Retorna se a pausa é invisível (pausa de espaço).
     *
     * @returns {boolean} Verdadeiro se a pausa for invisível.
     * @example
     * const ehInvisivel = pausa.invisivel;
     */
    get invisivel() {
        return this._options.invisivel === true;
    }

    /**
     * Retorna os acordes associados à pausa.
     *
     * @returns {string|string[]|null} Acordes atribuídos à pausa.
     * @example
     * const meusAcordes = pausa.acordes;
     */
    get acordes() {
        return this.getAcordes();
    }

    /**
     * Retorna as opções internas da pausa.
     *
     * @returns {Object} Objeto com as opções de estado.
     * @example
     * const voz = pausa.options.voz;
     */
    get options() {
        return this._options;
    }

    /**
     * Retorna a duração definida para a pausa.
     *
     * @returns {import('@domain/tempo/TempoDuracao').TempoDuracao} Instância com a duração da pausa.
     * @example
     * const duracaoAtual = pausa.duracao;
     */
    get duracao() {
        return this._duracao;
    }
}

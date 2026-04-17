/**
 * @file PausaJson.js
 * @description Adaptador para manipular entrada e saída no formato JSON para Pausas.
 */

import { Pausa } from '@domain/nota/Pausa.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';

/**
 * Classe responsável por serializar e desserializar Pausas em JSON.
 */
export class PausaJson {
    /**
     * @param {Pausa} pausa - A instância de domínio da Pausa.
     */
    constructor( pausa ) {
        this.pausa = pausa;
    }

    /**
     * Converte a pausa para um objeto JSON padronizado.
     *
     * @returns {Object} Representação JSON da pausa.
     * @example
     * const json = adaptador.toJson();
     */
    toJson() {
        return {
            tipo: 'pausa'
            , duracao: {
                valor: this.pausa.duracao.valor
                , unidade: this.pausa.duracao.unidade
            }
            , invisivel: this.pausa.invisivel
            , fermata: this.pausa.fermata
            , breath: this.pausa.breath
            , acordes: this.pausa.acordes
        };
    }

    /**
     * Instancia uma Pausa de domínio a partir de um objeto JSON.
     *
     * @param {Object} data - O objeto JSON representando a Pausa.
     * @returns {Pausa} Uma nova instância de domínio de Pausa.
     * @example
     * const novaPausa = PausaJson.fromJson({ duracao: { valor: 1, unidade: 4 }, invisivel: true });
     */
    static fromJson( data ) {
        if ( !data || !data.duracao ) {
            throw new Error( 'Dados JSON inválidos para criação de Pausa.' );
        }

        const duracao = new TempoDuracao( data.duracao.valor, data.duracao.unidade );
        
        const options = {};
        if ( data.invisivel !== undefined ) {
            options.invisivel = data.invisivel;
        }
        if ( data.fermata !== undefined ) {
            options.fermata = data.fermata;
        }
        if ( data.breath !== undefined ) {
            options.breath = data.breath;
        }
        if ( data.acordes !== undefined ) {
            options.acordes = data.acordes;
        }

        return new Pausa( duracao, options );
    }
}

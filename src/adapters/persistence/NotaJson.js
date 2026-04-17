/**
 * @file NotaJson.js
 * @description Adaptador para manipular entrada e saída no formato JSON para Notas.
 */

import { Nota } from '@domain/nota/Nota.js';
import { TempoDuracaoJson } from "@persistence/TempoDuracaoJson.js";

/**
 * Classe responsável por serializar e desserializar Notas em JSON.
 */
export class NotaJson {
    /**
     * Converte a nota para um objeto JSON padronizado.
     * @param {Nota} nota - A nota a ser convertida.
     * @returns {Object} Representação JSON da nota.
     * @example
     * const json = adaptador.toJson();
     */
    static toJson( nota ) {
        const opts = nota._options;

        const data = {
            tipo: 'nota'
	        , duracao: `${nota.duracao.toString()}`
            , altura: `${nota.altura.toString()}`
        };

        // Exportar apenas se for verdadeiro ou não-nulo
        if ( opts.ligada ) data.ligada = true;
        if ( opts.acento ) data.acento = true;
        if ( opts.marcato ) data.marcato = true;
        if ( opts.staccato ) data.staccato = true;
        if ( opts.staccatissimo ) data.staccatissimo = true;
        if ( opts.tenuto ) data.tenuto = true;
        if ( opts.hammerOn ) data.hammerOn = true;
        if ( opts.pullOff ) data.pullOff = true;
        if ( opts.mordente ) data.mordente = true;
        if ( opts.upperMordent ) data.upperMordent = true;
        if ( opts.trinado ) data.trinado = true;
        if ( opts.roll ) data.roll = true;
        if ( opts.fermata ) data.fermata = true;
        if ( opts.ghostNote ) data.ghostNote = true;
        if ( opts.arpeggio ) data.arpeggio = true;
        if ( opts.dedilhado ) data.dedilhado = opts.dedilhado;
        if ( opts.sustenido ) data.sustenido = true;
        if ( opts.beQuad ) data.beQuad = true;

        if ( opts.graceNote && Array.isArray( opts.graceNote ) ) {
            data.graceNote = opts.graceNote.map( g => NotaJson.toJson( g ) );
        }

        return data;
    }

    /**
     * Instancia uma Nota de domínio a partir de um objeto JSON.
     *
     * @param {Object} data - O objeto JSON representando a Nota.
     * @returns {Nota} Uma nova instância de domínio de Nota.
     * @example
     * const novaNota = NotaJson.fromJson({ altura: { nome: "C", oitava: 4 }, duracao: { valor: 1, unidade: 4 } });
     */
    static fromJson( dados ) {
	    if (dados instanceof Nota) return dados;

	    const resultado = notaSchema.safeParse(dados);

	    // 1. Validação do Schema
	    if (!resultado.success) {
		    throw new TypeError("Nota.create: Erro na estrutura dos dados: " + resultado.error.message);
	    }

        const altura = NotaFrequenciaJson.fromJson( data.altura );
        const duracao = TempoDuracaoJson.fromJson( data.duracao );
        const options = {};
		const opt = data.options;
		// ATRIBUIÇÃO DE UNIDADE DE TEMPO
	    if ( opt.unidadeTempo !== null && opt.unidadeTempo !== undefined && opt.unidadeTempo ) {
		    options.unidadeTempo = TempoDuracaoJson.fromJson ( opt.unidadeTempo );
	    }

		// ACENTUAÇÃO
	    if ( opt.acento !== null && opt.acento !== undefined && opt.acento ) {
		    options.acento = opt.acento;
	    }
	    if ( opt.marcato !== null && opt.marcato !== undefined && opt.marcato ) {
		    options.marcato = opt.marcato;
	    }

		// ARTICULAÇÕES DE DURAÇÃO
	    if ( opt.staccato !== null && opt.staccato !== undefined && opt.staccato ) {
		    options.staccato = opt.staccato;
	    }
	    if ( opt.staccatissimo !== null && opt.staccatissimo !== undefined && opt.staccatissimo ) {
		    options.staccatissimo = opt.staccatissimo;
	    }
	    if ( opt.tenuto !== null && opt.tenuto !== undefined && opt.tenuto ) {
		    options.tenuto = opt.tenuto;
	    }

		// TÉCNICAS E LIGADURAS
	    if ( opt.hammerOn !== null && opt.hammerOn !== undefined && opt.hammerOn ) {
		    options.hammerOn = opt.hammerOn;
	    }
	    if ( opt.pullOff !== null && opt.pullOff !== undefined && opt.pullOff ) {
		    options.pullOff = opt.pullOff;
	    }
	    if ( opt.ligada !== null && opt.ligada !== undefined && opt.ligada ) {
		    options.ligada = opt.ligada;
	    }

		// ORNAMENTOS
	    if ( opt.mordente !== null && opt.mordente !== undefined && opt.mordente ) {
		    options.mordente = opt.mordente;
	    }
	    if ( opt.upperMordent !== null && opt.upperMordent !== undefined && opt.upperMordent ) {
		    options.upperMordent = opt.upperMordent;
	    }
	    if ( opt.trinado !== null && opt.trinado !== undefined && opt.trinado ) {
		    options.trinado = opt.trinado;
	    }
	    if ( opt.roll !== null && opt.roll !== undefined && opt.roll ) {
		    options.roll = opt.roll;
	    }

		// OUTROS
	    if ( opt.fermata !== null && opt.fermata !== undefined && opt.fermata ) {
		    options.fermata = opt.fermata;
	    }
	    if ( opt.ghostNote !== null && opt.ghostNote !== undefined && opt.ghostNote ) {
		    options.ghostNote = opt.ghostNote;
	    }
	    if ( opt.arpeggio !== null && opt.arpeggio !== undefined && opt.arpeggio ) {
		    options.arpeggio = opt.arpeggio;
	    }
	    if ( opt.dedilhado !== null && opt.dedilhado !== undefined && opt.dedilhado ) {
		    options.dedilhado = opt.dedilhado;
	    }
	    if ( opt.sustenido !== null && opt.sustenido !== undefined && opt.sustenido ) {
		    options.sustenido = opt.sustenido;
	    }
	    if ( opt.beQuad !== null && opt.beQuad !== undefined && opt.beQuad ) {
		    options.beQuad = opt.beQuad;
	    }

	    if ( opt.graceNote !== null && opt.graceNote !== undefined && Array.isArray( opt.graceNote ) ) {
            options.graceNote = data.graceNote.map( g => NotaJson.fromJson( g ) );
        }

        return new Nota( altura, duracao, options );
    }
}

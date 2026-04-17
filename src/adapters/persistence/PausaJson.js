/**
 * @file PausaJson.js
 * @description Adaptador para manipular entrada e saída no formato JSON para Pausas.
 */

import { Pausa } from '@domain/nota/Pausa.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { pausaSchema } from "@schemas/pausaSchema.js";

/**
 * Classe responsável por serializar e desserializar Pausas em JSON.
 */
export class PausaJson {
    /**
     * Converte a pausa para um objeto JSON padronizado.
     * @param {Pausa} pausa - A pausa a ser convertida.
     * @returns {Object} Representação JSON da pausa.
     * @example
     * const json = adaptador.toJson();
     */
    static toJson(pausa) {
        return {
            tipo: 'pausa'
            , duracao: `${pausa.duracao.toString()}`
            , invisivel: pausa.invisivel
            , fermata: pausa.fermata
            , breath: pausa.breath
            , acordes: pausa.acordes
        };
    }

    /**
     * Instancia uma Pausa de domínio a partir de um objeto JSON.
     *
     * @param {Object} data - O objeto JSON representando a Pausa.
     * @returns {Pausa} Uma nova instância de domínio de Pausa.
     * @example
     * const novaPausa = PausaJson.fromJson({ duracao: "1/4", options: {invisivel: true }});
     */
    static fromJson( data ) {
	    const resultado = pausaSchema.safeParse(data);

	    // 1. Validação do Schema
	    if (!resultado.success) {
		    throw new TypeError("Pausa.create: Erro na estrutura dos dados: " + resultado.error.message);
	    }

	    const { duracao, options } = resultado.data;

	    // 3. Instanciação das dependências
	    const instanciaDuracao = TempoDuracao.fromJson(duracao);

	    // 4. Tratamento específico para unidadeTempo se ela existir no options
	    const optionsProcessado = { ...options };

	    // Retorno usando o spread para manter o DRY em todas as propriedades de options
	    return new Pausa(instanciaDuracao, optionsProcessado);
    }
}

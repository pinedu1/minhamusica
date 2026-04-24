/**
 * @file NotaJson.js
 * @description Adaptador para manipular entrada e saída no formato JSON para Notas.
 */

import { Nota } from '@domain/nota/Nota.js';
import { notaSchema, notaOutputSchema } from "@schemas/notaSchema.js";
import { NotaFrequencia } from "@domain/nota/NotaFrequencia.js";
import { TempoDuracaoJson } from "@persistence/TempoDuracaoJson.js";
import { PausaJson } from "@persistence/PausaJson.js";
import { UnissonoJson } from "@persistence/UnissonoJson.js";
import { QuialteraJson } from "@persistence/QuialteraJson.js";

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
		return notaOutputSchema.parse( nota );
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

		let { altura, duracao, options} = resultado.data;
	    const optionsProcessado = { ...options };
		if ( options.unidadeTempo ) {
			optionsProcessado.unidadeTempo = TempoDuracaoJson.fromJson(options.unidadeTempo);
		}
	    // Tratamento de GraceNotes se forem um array
	    if (Array.isArray(options.graceNote)) {
		    // Usando o .map() para construir o novo array!
		    optionsProcessado.graceNote = options.graceNote.map(n => {
			    if ( n.tipo === 'nota' ) return NotaJson.fromJson(n);
			    if ( n.tipo === 'unissono' ) return UnissonoJson.fromJson(n);
			    if ( n.tipo === 'pausa' ) return PausaJson.fromJson(n);
			    if ( n.tipo === 'quialtera' ) return QuialteraJson.fromJson(n);
			    return null;
		    });
	    }
		let alturaObj = null;
		if ( typeof altura === 'string' ) {
			alturaObj = NotaFrequencia.getByKey( altura );
		} else if ( typeof altura === 'object' ) {
			if ( altura.key ) {
				alturaObj = NotaFrequencia.getByKey( altura.key );
			} else if ( altura.abc ) {
				alturaObj = NotaFrequencia.getByAbc( altura.abc );
			}
		}
		if ( !alturaObj ) {
			throw new TypeError(`NotaJson.fromJson: Não foi possivel encontrar a altura para a nota ${altura}.`);
		}
        return new Nota( alturaObj, TempoDuracaoJson.fromJson( duracao ), optionsProcessado );
    }
}

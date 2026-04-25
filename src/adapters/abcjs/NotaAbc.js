import { Nota } from '@domain/nota/Nota.js';
import { ElementoMusicalAbc } from "@adapters/abcjs/ElementoMusicalAbc.js";
import { NotaFrequencia } from "@domain/nota/NotaFrequencia.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

/**
 * @file NotaAbc.js
 * @description Adaptador para manipular entrada e saída no formato ABCJS para Notas.
 */
export class NotaAbc extends ElementoMusicalAbc {
	/**
	 * Converte a nota para sua representação completa no formato ABC.
	 * Inclui notas de enfeite (grace notes) se houverem.
	 * @param {Nota} nota - A nota a ser convertida.
	 * @returns {string} A string correspondente à nota em notação ABC.
	 * @example
	 * const abc = NotaAbc.toAbc( notaInstance ); // Ex: "{C}D2"
	 */
	static toAbc( nota, isAcorde = false, isQuialtera = false ) {
		return this._toElementoAbc( nota, isAcorde, isQuialtera );
	}
	/**
	 * Factory: Converte uma string ABC complexa em uma instância de Nota.
	 * Captura acordes (ex: "Am""G"), decoradores, altura e duração.
	 * @param {string} abcString - A string completa vinda do parser ABC.
	 * @returns {Nota}
	 */
	static fromAbc ( abcString, contextOptions = {} ) {
		// Inicializa o options completo para cobrir todos os atributos da classe
		let tempAbc = abcString;
/*
		if ( tempAbc === 'B-' ) {
			console.log("abcString", abcString);
		}
*/
		let { conteudoEncontrado, conteudoRestante} = this._consomePayloadInicioSentenca( tempAbc );
/*
		if ( conteudoEncontrado ) {
			console.log("conteudoEncontrado:", conteudoEncontrado);
		}
*/
		let { payloadString, optionsGerado} = this._trataPayLoad( conteudoEncontrado )
		const options = {
			...optionsGerado
		};
		tempAbc = conteudoRestante;

		const matchNota = tempAbc.match( /([_^=]*[A-Ga-g][',]*)(.*)/ );

		let alturaString = matchNota
			? matchNota[ 1 ]
			: "C"
		;

		const duracaoString = matchNota
			? matchNota[ 2 ]
			: ""
		;
		const duracao = this._calcularDuracaoAbcString( contextOptions, duracaoString ?? '' );
		const frequencia = NotaFrequencia.getByAbc( alturaString );

		return ObjectFactory.newNota ( frequencia, duracao, options );
	}
}
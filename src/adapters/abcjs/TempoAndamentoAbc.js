import { TempoAndamento } from '@domain/tempo/TempoAndamento.js'
import { AdapterUtils } from "@adapters/AdapterUtils.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";

/**
 * Adapter para TempoAndamento para notação AbcJs.
 * @see {@link TempoAndamento}
 * Ex: Q:1/4=94
 */
export class TempoAndamentoAbc extends AdapterUtils {
	/**
	 * Cria uma instância de TempoAndamento a partir de uma string no formato ABC.
	 * @param {string} abc - A string de duração (ex: "1/4=90", "/2=90", "/", "2=85").
	 * @returns {TempoAndamento} Uma nova instância da classe.
	 */
	static fromAbc( abcString ) {
		abcString = abcString?.replaceAll(' ', '').trim();
		const regexFormatoCompleto = /^\d+\/\d+=\d+$/;
		let numerador;
		let denominador;
		let bpm;
		if ( regexFormatoCompleto.test( abcString ) ) {
			let anda = abcString.split( '=' );
			bpm = anda[1];
			anda = anda[0];
			const extraido = this.extrairNumerosDuracaoAbc( anda );
			numerador = extraido.numerador;
			denominador = extraido.denominador;
			bpm = parseInt( bpm );
		}

		if ( bpm === null || bpm === undefined ) {
			throw new TypeError("Falha ao criar TempoAndamento: 'bpm' ser válido.");
		}
		if ( (Number.isInteger( bpm ) === false) || (bpm <= 0) ) {
			throw new TypeError("Falha ao criar TempoAndamento: 'bpm' ser Inteiro e maior que Zero.");
		}
		const tempoDuracao = new TempoDuracao( numerador, denominador );
		return new TempoAndamento( tempoDuracao, bpm );
	}
	/**
	 * USAGE: Retorna a representação ABC para a Andamento.
	 * @param {TempoAndamento} tempoAndamento
	 * @returns {string}
	 * Ex: Q:1/4=94
	 */
	static toAbc( tempoAndamento) {
		if ( !( tempoAndamento instanceof TempoAndamento ) ) {
			throw new TypeError( "TempoAndamentoAbc.toAbc: deve ser uma instância de TempoAndamento." );
		}
		return `Q:${tempoAndamento.toString()}`;
	}
	static toCompasso( tempoAndamento ) {
		return `[${this.toAbc( tempoAndamento )}]`;
	}
	static toVoz( tempoAndamento ) {
		return this.toCompasso( tempoAndamento );
	}
}
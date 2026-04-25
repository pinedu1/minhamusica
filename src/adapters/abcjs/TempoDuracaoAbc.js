import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { AdapterUtils } from "@adapters/AdapterUtils.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class TempoDuracaoAbc extends AdapterUtils {
	/**
	 * USAGE: Retorna a representação ABC para a duração da nota.
	 * @param {TempoDuracao} tempoDuracao
	 * @returns {string}
	 * Ex: L:1/4
	 */
	static toAbc( tempoDuracao ) {
		if ( !( tempoDuracao instanceof TempoDuracao ) ) {
			throw new TypeError( "TempoDuracaoAbc.toAbc: deve ser uma instância de TempoDuracao." );
		}
		return `L:${tempoDuracao.toString()}`;
	}

	/**
	 * USAGE: Retorna a representação ABC para a duração da nota dentro do compasso EX: [L:1/4].
	 * @param tempoDuracao
	 * @return {string}
	 * Ex: [L:1/4]
	 */
	static toCompasso( tempoDuracao ) {
		return `[L:${tempoDuracao.toString()}]`;
	}
	/**
	 * Atalho semântico para toCompasso.
	 * Utilizado quando a definição de unidade de tempo é aplicada ao escopo de uma Voz (V:).
	 * @param {TempoDuracao} tempoDuracao
	 * @returns {string}
	 * @see {@link TempoDuracaoAbc.toCompasso}
	 */
	static toVoz( tempoDuracao ) {
		return this.toCompasso( tempoDuracao );
	}
	/**
	 * USAGE: Retorna a representação ABC para a duração da nota.
	 * Simplifica a string omitindo o número 1 (ex: 1/4 vira /4, 2/1 vira 2).
	 * @returns {string}
	 * Ex: "1/4", "/2", "/", "2", "1/"
	 */
	static toNota( tempoDuracao ) {
		// Caso especial: 1/1 vira apenas "" (Padrão ABC)
		if ( tempoDuracao.numerador === 1 && tempoDuracao.denominador === 1 ) return "";
		// Caso especial: 1/2 vira apenas "/" (Padrão ABC)
		if ( tempoDuracao.numerador === 1 && tempoDuracao.denominador === 2 ) return "/";
		const num = tempoDuracao.numerador === 1 ? "" : tempoDuracao.numerador;
		const den = tempoDuracao.denominador === 1 ? "" : `/${ tempoDuracao.denominador }`;

		return `${ num }${ den }`;
	}
	/**
	 * Cria uma instância de TempoDuracao a partir de uma string no formato ABC.
	 * Trata o caso especial da barra isolada "/" (comum em L:/ ou notas C/) como 1/2.
	 * * @param {string} abc - A string de duração (ex: "1/4", "/2", "/", "2").
	 * @returns {TempoDuracao} Uma nova instância da classe.
	 */
	static fromAbc( abc ) {
		const { numerador, denominador} = this.extrairNumerosDuracaoAbc( abc );
		return new TempoDuracao( numerador, denominador );
	}
}
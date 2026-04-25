import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { AdapterUtils } from "@adapters/AdapterUtils.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class TempoMetricaAbc extends AdapterUtils {
	/**
	 * USAGE: Retorna a representação ABC para a duração da nota.
	 * @param {TempoMetrica} tempoMetrica
	 * @returns {string}
	 * Ex: L:1/4
	 */
	static toAbc( tempoMetrica ) {
		if ( !( tempoMetrica instanceof TempoMetrica ) ) {
			throw new TypeError( "TempoMetricaAbc.toAbc: deve ser uma instância de TempoMetrica." );
		}
		return `M:${tempoMetrica.toString()}`;
	}

	/**
	 * USAGE: Retorna a representação ABC para a duração da nota dentro do compasso EX: [L:1/4].
	 * @param tempoMetrica
	 * @return {string}
	 * Ex: [L:1/4]
	 */
	static toCompasso( tempoMetrica ) {
		return `[M:${tempoMetrica.toString()}]`;
	}
	/**
	 * Atalho semântico para toCompasso.
	 * Utilizado quando a definição de unidade de tempo é aplicada ao escopo de uma Voz (V:).
	 * @param {TempoMetrica} tempoMetrica
	 * @returns {string}
	 * @see {@link TempoMetricaAbc.toCompasso}
	 */
	static toVoz( tempoMetrica ) {
		return this.toCompasso( tempoMetrica );
	}
	/**
	 * Cria uma instância de TempoMetrica a partir de uma string no formato ABC.
	 * Trata o caso especial da barra isolada "/" (comum em L:/ ou notas C/) como 1/2.
	 * * @param {string} abc - A string de duração (ex: "1/4", "/2", "/", "2").
	 * @returns {TempoMetrica} Uma nova instância da classe.
	 */
	static fromAbc( abc ) {
		const { numerador, denominador} = this.extrairNumerosDuracaoAbc( abc )
		return new TempoMetrica( numerador, denominador );
	}
}
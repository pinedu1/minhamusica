import { NotaFrequencia } from "@domain/nota/NotaFrequencia.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class NotaFrequenciaAbc {
	/**
	 * Cria uma saida no format abcJs para NotaFrequencia.
	 * @param notaFrequencia {NotaFrequencia}
	 * @returns {string}
	 * Ex: C
	 */
	static toAbc( notaFrequencia ) {
		return notaFrequencia.abc;
	}

	/**
	 * Cria um instancia de NotaFrequencia a partir de uma string no formato ABC.
	 * @param abcString
	 * @return {NotaFrequencia}
	 */
	static fromAbc( abcString ) {
		return NotaFrequencia.getByAbc( abcString );
	}
}
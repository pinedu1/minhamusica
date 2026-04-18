import { Clave } from "@domain/obra/Clave.js";

export class ClaveAbc {
	/**
	 * @param clave {Clave}
	 * Gera a string de configuração para o abcjs.
	 * Ex: clef=treble-8 ou clef=bass
	 */
	toAbc(clave) {
		return ClaveAbc.#toString(clave);
	}
	/**
	 * @param clave {Clave}
	 * Retorna a string base de configuração.
	 * @returns {string} Ex: "clef=treble-8"
	 */
	#toString(clave) {
		const base = clave.tipo.valor;
		if (clave.oitava === 0) return `clef=${base}`;

		// Se oitava for -1, o abcjs usa "-8"
		const sufixo = clave.oitava > 0 ? `+${clave.oitava * 8}` : `${clave.oitava * 8}`;
		return `clef=${base}${sufixo}`;
	}

}
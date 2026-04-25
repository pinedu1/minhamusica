/**
 * Factory centralizada para geração de IDs únicos dentro do sistema.
 * Garante que cada componente da Obra (Voz, Compasso, Elemento, Ligadura)
 * possua uma identidade distinta.
 */
export class IdFactory {
	static #contador = 0;
	static #contextoTestes = false;
	/**
	 * Gera um novo ID único.
	 * @param {string} prefixo - Prefixo opcional para facilitar o debug (ex: 'nota', 'vox').
	 * @returns {string|number} O ID gerado.
	 */
	static proximoId() {
		if (this.#contextoTestes) return 0;
		return this.#contador++;
	}

	/**
	 * Reinicia o contador. Util para testes unitários ou nova Obra.
	 */
	static reset() {
		this.#contador = 0;
	}

	/**
	 * Retorna o valor atual do contador sem incrementá-lo.
	 */
	static get atual() {
		return this.#contador;
	}
	static set contextoTestes( contexto ) {
		this.#contextoTestes = contexto;
	}
	static get contextoTestes() {
		return this.#contextoTestes;
	}
}
/**
 * Representa uma conexão musical entre dois elementos.
 * Pode ser uma ligadura de prolongamento (tie) ou de expressão (slur).
 */
export class Ligadura {
	#id;
	#tipo;
	#origem;
	#destino;

	/**
	 * @param {Object} params
	 * @param {number|string} params.id - Identificador único gerado (ex: via IdFactory).
	 * @param {'tie' | 'slur'} params.tipo - O tipo da ligadura.
	 * @param {number|string} params.origem - O ID do ElementoMusical de origem.
	 * @param {number|string} params.destino - O ID do ElementoMusical de destino.
	 */
	constructor({ id, tipo, origem, destino }) {
		this.id = id;
		this.tipo = tipo;
		this.origem = origem;
		this.destino = destino;
	}

	// --- Getters e Setters ---

	get id() { return this.#id; }
	set id(val) {
		if (val == null) throw new TypeError("Ligadura: 'id' é obrigatório.");
		this.#id = val;
	}

	get tipo() { return this.#tipo; }
	set tipo(val) {
		if (!['tie', 'slur'].includes(val)) {
			throw new TypeError("Ligadura: 'tipo' deve ser 'tie' (prolongamento) ou 'slur' (expressão).");
		}
		this.#tipo = val;
	}

	get origem() { return this.#origem; }
	set origem(val) {
		if (val == null) throw new TypeError("Ligadura: 'origem' (ID) é obrigatória.");
		this.#origem = val;
	}

	get destino() { return this.#destino; }
	set destino(val) {
		// O destino pode ser nulo temporariamente durante o parsing (ligadura aberta)
		this.#destino = val;
	}

	/**
	 * Verifica se a ligadura está completa (possui origem e destino).
	 * @returns {boolean}
	 */
	isCompleta() {
		return this.#origem != null && this.#destino != null;
	}

	/**
	 * Retorna uma representação simples para debug ou persistência.
	 */
	toJSON() {
		return {
			id: this.#id,
			tipo: this.#tipo,
			origem: this.#origem,
			destino: this.#destino
		};
	}
}
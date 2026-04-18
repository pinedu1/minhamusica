import { ElementoMusical } from "@domain/nota/ElementoMusical.js";

/**
 * Representa uma quiáltera musical (duinas, tercinas, etc.).
 * Agrupa elementos sucessivos que ocupam um tempo comprimido no compasso.
 * @extends ElementoMusical
 */
export class Quialtera extends ElementoMusical {
	/** @type {Array<ElementoMusical>} */
	#elementos = [];

	/**
	 * @param {Array<ElementoMusical>} elementos - Notas, pausas ou uníssonos que compõem a quiáltera.
	 * @param {TempoDuracao} duracaoOcupada - A duração real que o grupo ocupa no compasso.
	 * @param {Object} [options={}] - Atributos de expressão que afetam o grupo todo.
	 */
	constructor( elementos = [] , duracaoOcupada , options = {} ) {
		super( duracaoOcupada , options );

		this.elementos = elementos;

		this._options = {
			obra: null
			, compasso: null
			, unidadeTempo: null

			// EFEITOS GLOBAIS (Baseados na tabela de aplicação)
			, fermata: false          // Prolonga o grupo todo
			, fermataInvertida: false
			, breath: false           // Respiração após o grupo
			, ligada: false           // Ligadura do grupo com o próximo elemento

			// DINÂMICAS GLOBAIS
			, dinamica: null          // ex: 'f', 'p', 'mf'

			// FLUXO (Se a quiáltera estiver no início/fim de uma seção)
			, segno: false
			, coda: false
			, ...options
		};
	}

	/**
	 * Adiciona um elemento à sequência da quiáltera.
	 * @param {ElementoMusical} elemento
	 */
	#addElemento( elemento ) {
		if ( !( elemento instanceof ElementoMusical ) ) {
			throw new TypeError( 'Os itens da quiáltera devem ser instâncias de Nota, Pausa ou Unissono.' );
		}
		this.#elementos.push( elemento );
	}

	/** @returns {Array<ElementoMusical>} */
	get elementos() { return this.#elementos; }

	/** @param {Array<ElementoMusical>} lista */
	set elementos( lista ) {
		if ( !Array.isArray( lista ) ) {
			throw new TypeError( 'Os elementos devem ser fornecidos como um array.' );
		}
		this.#elementos = [];
		lista.forEach( el => this.#addElemento( el ) );
	}

	/**
	 * Retorna a quantidade de notas para a notação (ex: 3 para tercina).
	 * @returns {number}
	 */
	get quantidade() {
		return this.#elementos.length;
	}
}
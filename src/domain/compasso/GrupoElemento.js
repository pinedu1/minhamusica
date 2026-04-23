import { ElementoMusical } from '@domain/nota/ElementoMusical.js';
import { Compasso } from '@domain/compasso/Compasso.js';
import { TipoBarra } from "@domain/compasso/TipoBarra.js";
import { Voz } from "@domain/voz/Voz.js";
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { Tonalidade } from "@domain/compasso/Tonalidade.js";
import { Obra } from "@domain/obra/Obra.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";

/**
 * Representa um grupo visual de elementos musicais dentro de um compasso,
 * como notas conectadas por uma barra de ligação (bandeirola).
 */
export class GrupoElemento {
    /** @type {Array<ElementoMusical>} */
    #elements = [];

    /** @type {Object} */
    #options;

    /**
     * Construtor do GrupoElemento.
     *
     * @param {Array<ElementoMusical>} [elements=[]] - Array inicial de elementos musicais.
     * @param {Object} [options={}] - Configurações para o grupo.
     * @param {Compasso|null} [options.compasso=null] - Referência ao compasso pai.
     */
    constructor(elements = [], options = {}) {
        this.#options = {
            compasso: options.compasso || null
	        , anotacoes: options.anotacoes || []
	        , cifras: options.cifras || []
	        , ...options
        };

        this.elements = elements;
    }
	/**
	 * USAGE: Adiciona anotação.
	 */
	addAnotacao(texto, posicao, local = "_") {
		this.#options.anotacoes.push({ texto, posicao, local });
	}

    /**
     * Adiciona um elemento musical ao grupo.
     * @param {ElementoMusical} elemento - A instância de Nota, Pausa, Unissono ou Quialtera.
     */
    addElemento(elemento) {
		if ( !( elemento instanceof ElementoMusical ) ) {
			throw new TypeError('GrupoElemento.elements: Deve ser instância de Nota, Pausa, Unissono ou Quialtera.');
		}
		elemento.options.grupo = this;
		this.#elements.push(elemento);
	}

    /**
     * Retorna os elementos musicais do grupo.
     * @returns {Array<ElementoMusical>}
     */
    get elements() {
        return this.#elements;
    }

    /**
     * Define os elementos musicais do grupo.
     * @param {Array<ElementoMusical>} val - Um array de elementos musicais.
     */
    set elements(val) {
        if (!Array.isArray(val)) {
            throw new TypeError('GrupoElemento: Elementos devem ser um Array.');
        }
		this.#elements = [];
		val.forEach(e => this.addElemento(e));
    }

    /**
     * Retorna o compasso associado a este grupo.
     * @returns {Compasso|null}
     */
    get compasso() {
        return this.#options.compasso;
    }

    /**
     * Define o compasso associado a este grupo.
     * @param {Compasso|null} val
     */
    set compasso(val) {
        if (val !== null && !(val instanceof Compasso)) {
            throw new TypeError('GrupoElemento: O compasso deve ser uma instância de Compasso ou null.');
        }
        this.#options.compasso = val;
    }
	getUnidadeTempo() {
		return this.compasso.getUnidadeTempo();
	}
	getMetrica() {
		return this.compasso.getMetrica();
	}
	/**
	 * Calcula a unidade de tempo baseado no compasso e suas propriedades.
	 * @param unidadeTempo @type{TempoDuracao}
	 * @returns {Number}
	 */
	getPulsos() {
		return this.compasso.getTotalPulsos(this.getUnidadeTempo());
	}
	/**
	 * USAGE: Adiciona cifra.
	 */
	addCifra(texto, posicao) {
		this.#options.cifras.push({ texto, posicao });
	}

	/**
	 * USAGE: Adiciona anotação.
	 */
	addAnotacao(texto, posicao, local = "_") {
		this.#options.anotacoes.push({ texto, posicao, local });
	}

	/**
	 * Retorna a array de letras.
	 * Contatenando as letras da notas com as letras intrinsecas do grupo
	 * @return {string[]}
	 */
	getLetras() {
		let letras = [];
		this.elements.forEach((elemento) => {
			if ( elemento.letra ) {
				letras.push(elemento.letra);
			}
		});
		if ( this.letra && this.letra.length > 0 ) {
			letras.push( ...this.letra );
		}
		return letras;
	}
	/**
	 * Usage: Letra pertencente ao compasso
	 * Nota: Está nota não pode ser usada no metodo toAbc() do Compasso
	 * ela será manipulada no Objeto pai Voz, e dará o out da sequencia de letras dos seus compassos
	 * @return {Array<string>}
	 * */
	get letra() { return this.#options.letra; }
	/**
	 * Usage: Letra pertencente ao compasso
	 * Nota: Está nota não pode ser usada no metodo toAbc() do Compasso
	 * ela será manipulada no Objeto pai Voz, e dará o out da sequencia de letras dos seus compassos
	 *
	 * @param {Array<string>} letra
	 * @return {void}
	 * */
	set letra(letra) {
		if (!Array.isArray(letra)) {
			throw new TypeError("Compasso: A propriedade 'letra' deve ser um Array de strings.");
		}
		this.#options.letra = letra;
	}
	get options() { return this.#options; }

	get acordes() {
		return this.#options.acordes;
	}
	get pulsosOcupados() {
		return this.elements.reduce((total, e) => total + e.pulsoElemento, 0);
	}
}

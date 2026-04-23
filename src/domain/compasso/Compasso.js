import { TipoBarra } from "@domain/compasso/TipoBarra.js";
import { Voz } from "@domain/voz/Voz.js";
import { Obra } from "@domain/obra/Obra.js";
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { Tonalidade } from "@domain/compasso/Tonalidade.js";
import { ElementoMusical } from "@domain/nota/ElementoMusical.js";
import { GrupoElemento } from "@domain/compasso/GrupoElemento.js";


/**
 * Representa um compasso musical, organizando notas, pausas e unissonos dentro de uma métrica.
 */
export class Compasso {
    /** @type {number} */
    #index = 0;

    /** @type {Array<GrupoElemento>} */
    #grupos = [];
	/** @type {Array<ElementoMusical>} */
	#elements = [];

    /** @type {Object} */
    #options;

	/**
	 * USAGE: Construtor do Compasso. Inicializa o conteúdo e valida metadados.
	 *
	 * @param {Array<ElementoMusical>} elements - Matriz de elementos musicais.
	 * @param {Object} [options={}] - Configurações detalhadas.
	 */
	constructor(elements = [], options = {}) {
		this.#options = {
			voz: options.voz || null
			, obra: options.obra || null
			, anotacoes: options.anotacoes || []
			, cifras: options.cifras || []
			, letra: options.letra || null
			, unidadeTempo: null
			, barraInicial: options.barraInicial || TipoBarra.NONE
			, barraFinal: options.barraFinal || TipoBarra.STANDARD
			, mudancaDeTom: options.mudancaDeTom || null
			, ...options
		};
		this.elements = elements;
		this.index = options.index || 0;
	}

/*
    /!**
     * USAGE: Construtor do Compasso. Inicializa o conteúdo e valida metadados.
     *
     * @param {Array<GrupoElemento>} grupos - Matriz de grupos de elementos musicais.
     * @param {Object} [options={}] - Configurações detalhadas.
     *!/
    constructor(grupos = [], options = {}) {
        this.#options = {
            voz: options.voz || null
            , obra: options.obra || null
            , anotacoes: options.anotacoes || []
            , cifras: options.cifras || []
            , unidadeTempo: null
            , barraInicial: options.barraInicial || TipoBarra.NONE
            , barraFinal: options.barraFinal || TipoBarra.STANDARD
            , mudancaDeTom: options.mudancaDeTom || null
            , ...options
        };
        
        this.grupos = grupos;
        this.index = options.index || 0;
    }
*/

    getUnidadeTempo() {
        if (this.unidadeTempo) {
            return this.unidadeTempo;
        }
        if (this.voz) {
            return this.voz.getUnidadeTempo();
        }
        if ( this.obra ) {
            return this.obra.unidadeTempo;
        }
        return null;
    }
    getMetrica() {
        if (this.#options.metrica) {
            return this.#options.metrica;
        }
        if (this.#options.voz) {
            const voz = this.#options.voz;
            if (voz instanceof Voz) {
                return voz.getMetrica();
            } else if (voz.options.metrica) {
                return voz.options.metrica;
            }
        }
        if (this.#options.obra) {
            const obra = this.#options.obra;
            if (obra instanceof Voz) {
                return obra.getMetrica();
            } else if (obra.options.metrica) {
                return obra.options.metrica;
            }
        }
        return null;
    }
    /**
     * Calcula a unidade de tempo baseado no compasso e suas propriedades.
     * @param unidadeTempo @type{TempoDuracao}
     * @returns {Number}
     */
    getTotalPulsos( unidadeTempo) {
        const metricaRef = this.getMetrica();
        let pulsosTotais = 0;
        if (metricaRef) {
            // Ex: M: 4/4, L: 1/8 => (4/4) / 0.125 = 8 pulsosOcupados.
            pulsosTotais = metricaRef.razao / unidadeTempo.razao;
        } else {
            // Fallback: calcula pulsosOcupados baseados na soma das durações reais dos elementos
            const somaRazoes = this.elements.reduce((acc, el) => acc + el.duracao.razao, 0);
            pulsosTotais = somaRazoes / unidadeTempo.razao;
        }
        return pulsosTotais;
    }
	get pulsosOcupados() {
		let total = 0;
		if ( this.grupos.length > 0 ) {
			total = this.grupos.reduce((total, g) => total + g.pulsosOcupados, 0);
		}
		if ( this.elements.length > 0 ) {
			total += this.elements.reduce((total, e) => total + e.pulsoElemento, 0);
		}
		return total;
	}



    /**
     * USAGE: Índice do compasso.
     */
    get index() { return this.#index; }
    set index(val) { this.#index = val; }

    /**
     * USAGE: Voz associada.
     */
    get voz() { return this.#options.voz; }
    set voz(val) {
        if (val == null) { this.#options.voz = null; return; }
        if (!(val instanceof Voz)) throw new TypeError('Compasso: O objeto deve ser uma instância de Voz.');
        this.#options.voz = val;
    }
	
    /**
     * Retorna os grupos de elementos do compasso.
     * @returns {Array<GrupoElemento>}
     */
    get grupos() {
	    if (this.#grupos.length === 0) {
		    this.#grupos = [new GrupoElemento([], { compasso: this })];
	    }
        return this.#grupos;
    }

    /**
     * Define os grupos de elementos do compasso.
     * @param {Array<GrupoElemento>} val - Um array de GrupoElemento.
     */
    set grupos(val) {
        if (!Array.isArray(val) || !val.every(g => g instanceof GrupoElemento)) {
            throw new TypeError('Compasso: A propriedade "grupos" deve ser um Array de instâncias de GrupoElemento.');
        }
        this.#grupos = val;
        this.#grupos.forEach(g => g.compasso = this);
    }
	/**
	 * Adiciona um elemento musical ao último grupo de elementos do compasso.
	 * @param {ElementoMusical} elemento - A instância de Nota, Pausa, Unissono ou Quialtera.
	 */
	addElementoGrupo(elemento, indexGrupo = this.grupos.length - 1) {
		if ( !( elemento instanceof ElementoMusical ) ) {
			throw new TypeError('Compasso.addElementoGrupo: O elemento deve ser uma instância de ElementoMusical.');
		}
		if ( !( indexGrupo >= 0 && indexGrupo < this.grupos.length ) ) {
			throw new TypeError('Compasso.addElementoGrupo: O indice do grupo está fora da faixa de grupos do Compasso.');
		}
		// Se indexGrupo foi passado, usa ele. Se não, usa o padrão (último item).
		const grupoAlvo = this.grupos[indexGrupo];
		grupoAlvo.elements.push(elemento);
	}
	/*
	/!**
	 * [DEPRECIADO] Retorna uma lista achatada de todos os elementos de todos os grupos.
	 * @returns {Array<ElementoMusical>}
	 *!/
	get elements() {
		return this.#grupos.flatMap(g => g.elements);
	}

	/!**
	 * [DEPRECIADO] Substitui todos os elementos, colocando-os em um único grupo.
	 * @param {Array<ElementoMusical>} val - Um array de elementos musicais.
	 *!/
	set elements(val) {
		const novoGrupo = new GrupoElemento(val, { compasso: this });
		this.grupos = [novoGrupo];
	}
*/
	#addElemento(elemento) {
		if ( !( elemento instanceof ElementoMusical ) ) {
			throw new TypeError('Compasso.elemnts: Deve ser intância de Nota, Pausa, Unissono ou Quialtera.');
		}
		elemento.options.compasso = this;
		this.#elements.push(elemento);
	}
	/**
	 * USAGE: Elementos musicais (Nota, Pausa, Unissono).
	 */
	get elements() { return this.#elements; }
	set elements(val) {
		if (!Array.isArray(val)) {
			throw new TypeError('Compasso: Elementos devem ser um Array.');
		}
		this.#elements = [];
		val.forEach(e => this.#addElemento(e));
	}

    /**
     * USAGE: Barra inicial.
     */
    get barraInicial() { return this.#options.barraInicial; }
    set barraInicial(val) {
        //if (!(val instanceof TipoBarra)) throw new TypeError('Compasso: Barra inicial deve ser do tipo TipoBarra.');
        this.#options.barraInicial = val;
    }

    /**
     * USAGE: Barra final.
     */
    get barraFinal() { return this.#options.barraFinal; }
    set barraFinal(val) {
        //if (!(val instanceof TipoBarra)) throw new TypeError('Compasso: Barra final deve ser do tipo TipoBarra.');
        this.#options.barraFinal = val;
    }

    /**
     * USAGE: Mudança de métrica local.
     */
    get metrica() { return this.#options.metrica; }
    set metrica(val) {
        if (val == null) { this.#options.metrica = null; return; }
        if (!(val instanceof TempoMetrica)) throw new TypeError('Compasso: Deve ser instância de TempoMetrica.');
        this.#options.metrica = val;
    }

    /**
     * USAGE: Tonalidade local.
     */
    get mudancaDeTom() { return this.#options.mudancaDeTom; }
    set mudancaDeTom(val) {
        if (val == null) { this.#options.mudancaDeTom = null; return; }
        const existe = Object.values(Tonalidade).includes(val);
        if (!existe) throw new TypeError("Compasso: A tonalidade deve ser um membro válido do Enum Tonalidade.");
        this.#options.mudancaDeTom = val;
    }

    /**
     * USAGE: Referência à Obra.
     */
    get obra() { return this.#options.obra; }
    set obra(val) {
        if (val == null) { this.#options.obra = null; return; }
        if (!(val instanceof Obra)) throw new TypeError('Compasso: Obra deve ser uma instância de Obra.');
        this.#options.obra = val;
    }
    get unidadeTempo() { return this.#options.unidadeTempo; }

    set unidadeTempo(tempo) {
        if (!(tempo instanceof TempoDuracao)) {
            throw new TypeError("O 'unidadeTempo' do compasso deve ser do tipo TempoDuracao.");
        }
        this.#options.unidadeTempo = tempo;
    }

    /**
     * USAGE: Adiciona cifra.
     */
    addCifra(texto, posicao) {
        this.#options.cifras.push({ texto, posicao });
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
}

import { TipoBarra } from "@domain/compasso/TipoBarra.js";
import { Nota } from "@domain/nota/Nota.js";
import { Pausa } from "@domain/nota/Pausa.js";
import { Unissono } from "@domain/nota/Unissono.js";
import { Voz } from "@domain/voz/Voz.js";
import { Obra } from "@domain/obra/Obra.js";
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { Tonalidade } from "@domain/compasso/Tonalidade.js";
import { compassoSchema } from "@schemas/compassoSchema.js";
import { ElementoMusical } from "@domain/nota/ElementoMusical.js";


/**
 * Representa um compasso musical, organizando notas, pausas e unissonos dentro de uma métrica.
 */
export class Compasso {
    /** @type {number} */
    #index = 0;

    /** @type {Array<Nota|Pausa|Unissono>} */
    #elements = [];

    /** @type {Object} */
    #options;


    /**
     * USAGE: Construtor do Compasso. Inicializa o conteúdo e valida metadados.
     *
     * @param {Array<Nota|Pausa|Unissono>} elements - Matriz de elementos musicais.
     * @param {Object} [options={}] - Configurações detalhadas.
     */
    constructor(elements = [], options = {}) {
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
        this.elements = elements;
        this.index = options.index || 0;
    }

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
    getPulsos(unidadeTempo) {
        const metricaRef = this.getMetrica();
        let pulsosTotais = 0;
        if (metricaRef) {
            // Ex: M: 4/4, L: 1/8 => (4/4) / 0.125 = 8 pulsos.
            pulsosTotais = metricaRef.razao / unidadeTempo.razao;
        } else {
            // Fallback: calcula pulsos baseados na soma das durações reais dos elementos
            const somaRazoes = this.#elements.reduce((acc, el) => acc + el.duracao.razao, 0);
            pulsosTotais = somaRazoes / unidadeTempo.razao;
        }
        return pulsosTotais;
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
     * USAGE: Adiciona anotação.
     */
    addAnotacao(texto, posicao, local = "_") {
        this.#options.anotacoes.push({ texto, posicao, local });
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

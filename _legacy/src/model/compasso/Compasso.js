import { TipoBarra } from "@domain/compasso/TipoBarra.js";
import { Nota } from "@domain/nota/Nota.js";
import { Pausa } from "@domain/nota/Pausa.js"; 
import { Acorde } from "../nota/Acorde.js";
import { Voz } from "@domain/voz/Voz.js";
import { Obra } from "@domain/obra/Obra.js";
import { TempoCompasso } from "@domain/tempo/TempoCompasso.js";
import { Tonalidade } from "@domain/compasso/Tonalidade.js";

/**
 * Representa um compasso musical, organizando notas, pausas e acordes dentro de uma métrica.
 */
export class Compasso {
    /** @type {number} */
    #index = 0;
    
    /** @type {Array<Nota|Pausa|Acorde>} */
    #elements = [];
    
    /** @type {Object} */
    #options;
    
    /** @type {Voz|null} */
    #voz = null;
    
    /** @type {TipoBarra|null} */
    #barraInicial = null;
    
    /** @type {TipoBarra|null} */
    #barraFinal = null;
    
    /** @type {TempoCompasso|null} */
    #tempoCompasso = null;
    
    /** @type {Obra|null} */
    #obra = null;

    /**
     * USAGE: Construtor do Compasso. Inicializa o conteúdo e valida metadados.
     * 
     * @param {Array<Nota|Pausa|Acorde>} elements - Matriz de elementos musicais.
     * @param {Object} [options={}] - Configurações detalhadas.
     */
    constructor(elements = [], options = {}) {
        this.#options = {
            anotacoes: options.anotacoes || [],
            cifras: options.cifras || [],
            mudancaDeTom: null,
            ...options
        };

        // Inicialização via SETTERS para garantir validação
        this.elements = elements;
        this.index = options.index || 0;
        this.voz = options.voz || null;
        this.obra = options.obra || null;
        this.barraInicial = options.barraInicial || TipoBarra.NONE;
        this.barraFinal = options.barraFinal || TipoBarra.STANDARD;
        this.tempoCompasso = options.tempoCompasso || null;
        this.mudancaDeTom = options.mudancaDeTom || null;
    }

    /**
     * USAGE: Orquestra a geração da string ABC completa do compasso.
     * @returns {string}
     */
    toAbc() {
        let abc = "";

        if (this.#barraInicial && this.#barraInicial !== TipoBarra.NONE) {
            abc += this.#barraInicial.abc;
        }

        if (this.#tempoCompasso) {
            abc += `[M:${this.#tempoCompasso.numerador}/${this.#tempoCompasso.denominador}]`;
        }
        
        if (this.mudancaDeTom) {
            abc += `[K:${this.mudancaDeTom.valor}]`;
        }

        this.#elements.forEach((elemento, idx) => {
            const cifrasDaPosicao = this.#options.cifras.filter(c => c.posicao === idx);
            cifrasDaPosicao.forEach(c => { abc += `"${c.texto}"`; });

            const anotacoesDaPosicao = this.#options.anotacoes.filter(a => a.posicao === idx);
            anotacoesDaPosicao.forEach(a => {
                const local = a.local || "_";
                abc += `"${local}${a.texto}"`;
            });

            abc += elemento.toAbc();
            if (idx < this.#elements.length - 1) abc += " ";
        });

        if (this.#barraFinal) {
            abc += this.#barraFinal.abc;
        }

        return abc;
    }

    /** 
     * USAGE: Índice do compasso.
     */
    get index() { return this.#index; }
    set index(val) { this.#index = val; }

    /** 
     * USAGE: Voz associada.
     */
    get voz() { return this.#voz; }
    set voz(val) {
        if (val == null) { this.#voz = null; return; }
        if (!(val instanceof Voz)) throw new TypeError('Compasso: O objeto deve ser uma instância de Voz.');
        this.#voz = val;
    }

    /**
     * USAGE: Elementos musicais (Nota, Pausa, Acorde).
     */
    get elements() { return this.#elements; }
    set elements(val) {
        if (!Array.isArray(val)) throw new TypeError('Compasso: Elementos devem ser Array.');
        if (val.some(n => !(n instanceof Nota) && !(n instanceof Pausa) && !(n instanceof Acorde))) {
            throw new TypeError("Compasso: Apenas instâncias de Nota, Pausa ou Acorde são permitidas.");
        }
        this.#elements = val;
    }

    /** 
     * USAGE: Barra inicial.
     */
    get barraInicial() { return this.#barraInicial; }
    set barraInicial(val) {
        //if (!(val instanceof TipoBarra)) throw new TypeError('Compasso: Barra inicial deve ser do tipo TipoBarra.');
        this.#barraInicial = val;
    }

    /** 
     * USAGE: Barra final.
     */
    get barraFinal() { return this.#barraFinal; }
    set barraFinal(val) {
        //if (!(val instanceof TipoBarra)) throw new TypeError('Compasso: Barra final deve ser do tipo TipoBarra.');
        this.#barraFinal = val;
    }

    /**
     * USAGE: Mudança de métrica local.
     */
    get tempoCompasso() { return this.#tempoCompasso; }
    set tempoCompasso(val) {
        if (val == null) { this.#tempoCompasso = null; return; }
        if (!(val instanceof TempoCompasso)) throw new TypeError('Compasso: Deve ser instância de TempoCompasso.');
        this.#tempoCompasso = val;
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
    get obra() { return this.#obra; }
    set obra(val) {
        if (val == null) { this.#obra = null; return; }
        if (!(val instanceof Obra)) throw new TypeError('Compasso: Obra deve ser uma instância de Obra.');
        this.#obra = val;
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
}

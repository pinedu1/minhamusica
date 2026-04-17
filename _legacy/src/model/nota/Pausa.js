import { TempoNota } from "@domain/tempo/TempoNota.js";
import { TempoPadrao } from "@domain/tempo/TempoPadrao.js";

/**
 * Representa um silêncio (pausa) na pauta musical.
 */
export class Pausa {
    /** @type {TempoNota} */
    #duracao;
    /** @type {Object} */
    #options;
    /** @type {TempoPadrao} */
    #tempoReferencia;

    /**
     * @param {TempoNota} duracao - Duração da pausa.
     * @param {Object} [options={}] - Contexto e atributos.
     */
    constructor(duracao, options = {}) {
        this.duracao = duracao;
        this.#options = {
            obra: null,
            compasso: null,
            tempoReferencia: null,
            fermata: false, // Pausas podem ter fermatas
            ...options
        };

        this.tempoReferencia =
            this.#options.tempoReferencia || 
            this.#options.compasso?.tempoReferencia || 
            this.#options.obra?.unidadeTempo;

        if (!(this.#tempoReferencia instanceof TempoPadrao)) {
            throw new Error("Falha ao criar Pausa: 'tempoReferencia' (L:) não encontrado.");
        }
    }

    /**
     * USAGE: Gera a string ABC da pausa (ex: "z2", "z/").
     * @returns {string}
     */
    toAbc() {
        let abc = "";
        
        if (this.#options.fermata) abc += "!fermata!";
        
        // Caractere padrão de pausa no ABC
        abc += "z";

        // Sufixo de duração
        abc += this.#formatarDuracaoAbc();

        return abc;
    }

    /**
     * @private
     */
    #formatarDuracaoAbc() {
        const razao = this.#duracao.razao / this.#tempoReferencia.razao;
        if (Math.abs(razao - 1) < 0.000001) return "";

        if (Number.isInteger(Number(razao.toFixed(8)))) {
            return Math.round(razao).toString();
        }

        const d = Number(razao.toFixed(8));
        if (d === 0.5) return "/";
        
        const denominador = Math.round(1 / d);
        if (Math.abs((1 / denominador) - d) < 0.000001) {
            return `/${denominador}`;
        }

        return razao.toString();
    }

    get duracao() { return this.#duracao; }
    
    set duracao(val) {
        if (!(val instanceof TempoNota)) {
            throw new TypeError("A duração da pausa deve ser uma instância de TempoNota.");
        }
        this.#duracao = val;
    }

    get tempoReferencia() { return this.#tempoReferencia; }
    
    set tempoReferencia( tempo ) {
        if (!(tempo instanceof TempoPadrao)) {
            throw new TypeError("O 'tempoReferencia' da pausa deve ser do tipo TempoPadrao.");
        }
        this.#tempoReferencia = tempo;
    }
}

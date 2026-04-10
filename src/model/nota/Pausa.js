import { TempoDuracao } from "../tempo/TempoDuracao.js";

/**
 * Representa um silêncio (pausa) na pauta musical.
 */
export class Pausa {
    /** @type {TempoDuracao} */
    #duracao;
    /** @type {Object} */
    #options;
    /** @type {TempoDuracao} */
    #unidadeTempo;

    /**
     * @param {TempoDuracao} duracao - Duração da pausa.
     * @param {Object} [options={}] - Contexto e atributos.
     */
    constructor(duracao, options = {}) {
        this.duracao = duracao;
        this.#options = {
            obra: null,
            compasso: null,
            unidadeTempo: null,
            fermata: false, // Pausas podem ter fermatas
            breath: null, // Instrução de Respiração (opcional) !breath!
            invisivel: false, // Pausa invisível "x" ao invés de "z"
            ...options
        };

        const ctxTempo = 
            this.#options.unidadeTempo || 
            this.#options.compasso?.unidadeTempo || 
            this.#options.obra?.unidadeTempo;
            
        if (!ctxTempo) {
            throw new Error("Falha ao criar Pausa: 'unidadeTempo' (L:) não encontrado no contexto.");
        }
        
        this.unidadeTempo = ctxTempo;
    }

    /**
     * USAGE: Gera a string ABC da pausa (ex: "z2", "z/").
     * @returns {string}
     */
    toAbc() {
        let abc = "";
        
        if (this.#options.fermata) abc += "!fermata!";
        if (this.#options.breath) abc += "!breath!";
        
        // Caractere de pausa no ABC (z = visível, x = invisível)
        abc += this.#options.invisivel ? "x" : "z";

        // Sufixo de duração
        abc += this.#formatarDuracaoAbc();

        return abc;
    }

    /**
     * @private
     */
    #formatarDuracaoAbc() {
        const razao = this.#duracao.razao / this.#unidadeTempo.razao;
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
        if (!(val instanceof TempoDuracao)) {
            throw new TypeError("A duração da pausa deve ser uma instância de TempoDuracao.");
        }
        this.#duracao = val;
    }

    get unidadeTempo() { return this.#unidadeTempo; }
    
    set unidadeTempo( tempo ) {
        if (!(tempo instanceof TempoDuracao)) {
            throw new TypeError("O 'unidadeTempo' da pausa deve ser do tipo TempoDuracao.");
        }
        this.#unidadeTempo = tempo;
    }
    
    /**
     * USAGE: Helper para criação rápida de Pausa a partir de um JSON.
     * Ex: Pausa.create({ tempo: "2", duracao: "1/4", fermata: true })
     */
    static create(config = {}) {
        let { tempo, duracao, unidadeTempo, ...options } = config;

        tempo = tempo || "1";
        let duracaoObj;
        if (tempo instanceof TempoDuracao) {
            duracaoObj = tempo;
        } else {
            const parts = tempo.toString().split("/");
            const num = parseInt(parts[0]) || 1;
            const den = parseInt(parts[1]) || 1;
            duracaoObj = new TempoDuracao(num, den);
        }

        const refTempo = duracao || unidadeTempo;
        if (refTempo) {
            if (refTempo instanceof TempoDuracao) {
                options.unidadeTempo = refTempo;
            } else {
                const rParts = refTempo.toString().split("/");
                const rNum = parseInt(rParts[0]) || 1;
                const rDen = parseInt(rParts[1]) || 1;
                options.unidadeTempo = new TempoDuracao(rNum, rDen);
            }
        }

        return new Pausa(duracaoObj, options);
    }
}
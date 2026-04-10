import { NotaFrequencia } from "./NotaFrequencia.js";
import { TempoNota } from "../tempo/TempoNota.js";
import { TempoPadrao } from "../tempo/TempoPadrao.js";

/**
 * Representa uma nota musical completa, integrando altura, duração e atributos de execução.
 */
export class Nota {
    /** @type {NotaFrequencia} */
    #altura;
    /** @type {TempoNota} */
    #duracao;
    /** @type {Object} */
    #options;
    /** @type {TempoPadrao} */
    #tempoReferencia;

    /**
     * @param {NotaFrequencia} altura
     * @param {TempoNota} duracao
     * @param {Object} [options={}]
     */
    constructor(altura, duracao, options = {}) {
        this.altura = altura;
        this.duracao = duracao;
        this.#options = {
            obra: null,
            compasso: null,
            tempoReferencia: null,
            acento: false,
            marcato: false,
            staccato: false,
            staccatissimo: false,
            tenuto: false,
            hammerOn: false,
            pullOff: false,
            ligada: false,
            mordente: false,
            upperMordent: false,
            trinado: false,
            fermata: false,
            ghostNote: false,
            graceNote: null, // Pode ser false, null ou Array<Nota>
            roll: false,
            arpeggio: false,
            dedilhado: null, 
            ...options
        };

        // Validação da propriedade graceNote
        const gn = this.#options.graceNote;
        if (gn !== false && gn !== null && !Array.isArray(gn)) {
            throw new TypeError("Falha ao criar Nota: 'graceNote' deve ser false, null ou um Array de instâncias de Nota.");
        }
        if (Array.isArray(gn) && gn.some(n => !(n instanceof Nota))) {
            throw new TypeError("Falha ao criar Nota: Todos os elementos em 'graceNote' devem ser instâncias de Nota.");
        }

        this.tempoReferencia =
            this.#options.tempoReferencia || 
            this.#options.compasso?.tempoReferencia || 
            this.#options.obra?.unidadeTempo;
    }
    /**
     * USAGE: Gera a string ABC para graceNotes. Apenas com Frequencia e duração da nota
     * @returns {string}
     */
    toGraceNote() {
        let abc = this.#altura.abc;
        abc += this.#formatarDuracaoAbc();
        return abc;
    }
    /**
     * USAGE: Gera a string ABC completa processando todos os atributos.
     * @param {boolean} [ignorarDecoracaoOrnamento=false] - Se true, renderiza apenas altura e duração.
     * @returns {string}
     */
    toAbc( isAcorde = false ) {
        let abc = "";
        const opt = this.#options;
        
        if ( isAcorde === true ) {
            return this.#altura.abc;
        }

        // 1. PREFIXOS (Decoradores e Ornamentos)
        if (opt.ghostNote) abc += "!style=x!";
        if (opt.fermata) abc += "!fermata!";
        if (opt.arpeggio) abc += "!arpeggio!";
        
        if (opt.marcato) abc += "!marcato!";
        else if (opt.acento) abc += "!accent!";

        if (opt.staccatissimo) abc += "!staccatissimo!";
        else if (opt.staccato) abc += ".";
        else if (opt.tenuto) abc += "!tenuto!";

        if (opt.trinado) abc += "!trill!";
        else if (opt.mordente) abc += "!mordent!";
        else if (opt.upperMordent) abc += "!uppermordent!";
        
        if (opt.roll) abc += "~";

        // Grace Notes (Notas de adorno) resolvidas via método privado
        abc += this.#toGraceNotes();

        // 2. ALTURA DA NOTA
        abc += this.#altura.abc;

        // 3. SUFIXO DE DURAÇÃO
        abc += this.#formatarDuracaoAbc();

        // 4. SUFIXOS (Dedilhado e Ligaduras)
        if (opt.dedilhado) abc += `$"${opt.dedilhado}"`;

        if (opt.ligada || opt.hammerOn || opt.pullOff) {
            abc += "-";
        }

        return abc;
    }

    /**
     * USAGE: Transforma a matriz de notas de adorno em uma string ABC enfileirada.
     * @private
     * @returns {string}
     */
    #toGraceNotes() {
        const gn = this.#options.graceNote;
        if (!Array.isArray(gn) || gn.length === 0) return "";

        // Enfileira o toAbc de cada nota de adorno, forçando ignorar decorações nelas
        const notasGraceAbc = gn.map(nota => nota.toGraceNote()).join('');
        return `{${notasGraceAbc}}`;
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

    get altura() { return this.#altura; }
    set altura(val) {
        if (!(val instanceof NotaFrequencia)) {
            throw new Error("Falha ao definir Nota: 'altura' deve ser NotaFrequencia.");
        }
        this.#altura = val;
    }

    get duracao() { return this.#duracao; }
    set duracao(val) {
        if (!(val instanceof TempoNota)) {
            throw new Error("Falha ao definir Nota: 'duracao' deve ser TempoNota.");
        }
        this.#duracao = val;
    }

    get tempoReferencia() { return this.#tempoReferencia; }
    set tempoReferencia( tempo ) {
        if (!(tempo instanceof TempoPadrao)) {
            throw new Error("Falha ao criar Nota: 'tempoReferencia' (L:) não encontrado.");
        }
        this.#tempoReferencia = tempo;
    }
}

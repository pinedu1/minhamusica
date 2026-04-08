import { TempoPadrao } from "../tempo/TempoPadrao.js";
import { TempoNota } from "../tempo/TempoNota.js";
import { Nota } from "../nota/Nota.js";

/**
 * Representa um acorde musical, um conjunto de notas tocadas simultaneamente.
 * Suporta atributos de execução globais e notas de adorno (grace notes).
 */
export class Acorde {
    /** @type {Array<Nota>} */
    #notas = [];
    /** @type {TempoNota} */
    #duracao;
    /** @type {Object} */
    #options;
    /** @type {TempoPadrao} */
    #tempoReferencia;

    /**
     * @param {Array<Nota>} notas - Notas que compõem o acorde.
     * @param {TempoNota} duracao - Duração do conjunto.
     * @param {Object} [options={}] - Atributos e contexto.
     */
    constructor(notas = [], duracao, options = {}) {
        this.notas = notas;
        this.duracao = duracao;
        this.#options = {
            obra: null,
            compasso: null,
            tempoReferencia: null,
            
            // ACENTUAÇÃO
            acento: false,
            marcato: false,

            // ARTICULAÇÕES
            staccato: false,
            staccatissimo: false,
            tenuto: false,

            // TÉCNICAS E ORNAMENTOS
            ligada: false, 
            arpeggio: false,
            fermata: false,
            ghostNote: false,
            roll: false,
            trinado: false,
            mordente: false,
            upperMordent: false,
            
            graceNote: null, // false | null | Array<Nota>
            dedilhado: null,
            ...options
        };

        // Validação da propriedade graceNote (Idêntica à classe Nota)
        const gn = this.#options.graceNote;
        if (gn !== false && gn !== null && !Array.isArray(gn)) {
            throw new TypeError("Falha ao criar Acorde: 'graceNote' deve ser false, null ou um Array de instâncias de Nota.");
        }
        if (Array.isArray(gn) && gn.some(n => !(n instanceof Nota))) {
            throw new TypeError("Falha ao criar Acorde: Todos os elementos em 'graceNote' devem ser instâncias de Nota.");
        }

        this.tempoReferencia =
            this.#options.tempoReferencia ||
            this.#options.compasso?.tempoReferencia ||
            this.#options.obra?.unidadeTempo;

        if (!(this.#tempoReferencia instanceof TempoPadrao)) {
            throw new Error("Falha ao criar Acorde: 'tempoReferencia' (L:) não encontrado.");
        }
    }

    /**
     * USAGE: Gera a string ABC do acorde processando notas internas e atributos globais.
     * @returns {string}
     */
    toAbc() {
        let abc = "";
        const opt = this.#options;

        // 1. PREFIXOS GLOBAIS
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

        // Grace Notes (Adornos) aplicados ao acorde
        abc += this.#toGraceNotes();

        // 2. CORPO DO ACORDE
        const notasAbc = this.#notas.map(nota => nota.toAbc(true)).join('');
        abc += `[${notasAbc}]`;

        // 3. SUFIXO DE DURAÇÃO
        abc += this.#formatarDuracaoAbc();

        // 4. SUFIXOS FINAIS
        if (opt.dedilhado) abc += `$"${opt.dedilhado}"`;
        if (opt.ligada) abc += "-";

        return abc;
    }

    /**
     * USAGE: Transforma a matriz de adornos em uma string ABC enfileirada.
     * @private
     * @returns {string}
     */
    #toGraceNotes() {
        const gn = this.#options.graceNote;
        if (!Array.isArray(gn) || gn.length === 0) return "";

        const notasGraceAbc = gn.map(nota => nota.toGraceNote(true)).join('');
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
    #addNota(nota) {
        if (!(nota instanceof Nota)) {
            throw new TypeError('A nota deve ser uma instância de Nota.');
        }
        this.#notas.push(nota);
    }
    get notas() { return this.#notas; }
    
    set notas(arrayNotas) {
        if (!Array.isArray(arrayNotas)) {
            throw new TypeError('As notas de um acorde devem ser fornecidas como um array de instâncias de Nota.');
        }
        if (arrayNotas.some(nota => !(nota instanceof Nota))) {
            throw new TypeError('Todos os elementos do array de notas devem ser instâncias de Nota.');
        }
        arrayNotas.forEach(nota => this.#addNota(nota));
    }

    get duracao() { return this.#duracao; }
    
    set duracao(val) {
        if (!(val instanceof TempoNota)) {
            throw new TypeError("A duração do acorde deve ser uma instância de TempoNota.");
        }
        this.#duracao = val;
    }

    get tempoReferencia() { return this.#tempoReferencia; }
    
    set tempoReferencia( tempo ) {
        if (!(tempo instanceof TempoPadrao)) {
            throw new TypeError("O 'tempoReferencia' do acorde deve ser do tipo TempoPadrao.");
        }
        this.#tempoReferencia = tempo;
    }
}

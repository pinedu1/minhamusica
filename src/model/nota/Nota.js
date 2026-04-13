import { NotaFrequencia } from "./NotaFrequencia.js";
import { TempoDuracao } from "../tempo/TempoDuracao.js";

/**
 * Representa uma nota musical completa, integrando altura, duração e atributos de execução.
 */
export class Nota {
    /** @type {NotaFrequencia} */
    #altura;
    /** @type {TempoDuracao} */
    #duracao;
    /** @type {Object} */
    #options;
    /**
     * Unidade de Tempo herada dos objetos pai
     * @type {TempoDuracao} */
    #unidadeTempo;

    /**
     * @param {NotaFrequencia} altura
     * @param {TempoDuracao} duracao
     * @param {Object} [options={}]
     */
    constructor(altura, duracao, options = {}) {
        this.altura = altura;
        this.duracao = duracao;
        this.#options = {
            obra: null,
            compasso: null,
            unidadeTempo: null,
            
            // ACENTUAÇÃO
            acento: false,
            marcato: false,

            // ARTICULAÇÕES DE DURAÇÃO
            staccato: false,
            staccatissimo: false,
            tenuto: false,

            // TÉCNICAS E LIGADURAS
            hammerOn: false,
            pullOff: false,
            ligada: false,

            // ORNAMENTOS
            mordente: false,
            upperMordent: false,
            trinado: false,
            roll: false,

            // OUTROS
            fermata: false,
            ghostNote: false,
            graceNote: null,
            arpeggio: false,
            dedilhado: null,
            
            sustenido: false, // Propriedade b.1
            beQuad: false,    // Propriedade b.2
            ...options
        };

        const gn = this.#options.graceNote;
        if (gn !== false && gn !== null && !Array.isArray(gn)) {
            throw new TypeError("Falha ao criar Nota: 'graceNote' deve ser false, null ou Array<Nota>.");
        }

        this.unidadeTempo = this.#options.unidadeTempo;
    }

    /**
     * USAGE: Helper para criação rápida de Nota a partir de um JSON.
     * Ex: Nota.create({ freq: "C", tempo: "1/4", duracao: "1/4", sustenido: true })
     */
    static create(config = {}) {
        let { freq, tempo, duracao, unidadeTempo, ...options } = config;
        
        if (!freq) throw new Error("A propriedade 'freq' é obrigatória no create().");
        
        const freqObj = NotaFrequencia.getByAbc(freq);
        if (!freqObj) throw new Error(`NotaFrequencia não encontrada para: ${freq}`);

        //if (!tempo) throw new Error(`Nota.create: Você deve informar o tempo da nota. Exemplo: tempo: "1/4"`);

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

        return new Nota(freqObj, duracaoObj, options);
    }

    /**
     * USAGE: Gera string ABC simplificada para notas de adorno.
     */
    toGraceNote() {
        let abc = "";
        if (this.#options.sustenido) abc += "^";
        if (this.#options.beQuad) abc += "=";
        abc += this.#altura.abc;
        abc += this.#formatarDuracaoAbc();
        return abc;
    }

    /**
     * USAGE: Gera a string ABC completa processando todos os atributos de execução.
     * @param {boolean} [isAcorde=false] - Se true, simplifica a saída para dentro de colchetes.
     * @returns {string}
     */
    toAbc( isAcorde = false ) {
        let abc = "";
        const opt = this.#options;
        
        // Em acordes, aplicamos apenas acidentes e altura individual (simplificação padrão ABC)
        if ( isAcorde === true ) {
            if (opt.sustenido) abc += "^";
            if (opt.beQuad) abc += "=";
            abc += this.#altura.abc;
            return abc;
        }

        // 1. PREFIXOS (Decoradores e Ornamentos)
        if (opt.ghostNote) abc += "!style=x!";
        if (opt.fermata) abc += "!fermata!";
        if (opt.arpeggio) abc += "!arpeggio!";

        // Acentuação (Exclusiva)
        if (opt.marcato) abc += "!marcato!";
        else if (opt.acento) abc += "!accent!";

        // Articulações (Exclusiva)
        if (opt.staccatissimo) abc += "!staccatissimo!";
        else if (opt.staccato) abc += ".";
        else if (opt.tenuto) abc += "!tenuto!";
        
        // Acidentes locais
        if (opt.sustenido) abc += "^";
        if (opt.beQuad) abc += "=";

        // Ornamentos (Exclusiva)
        if (opt.trinado) abc += "!trill!";
        else if (opt.mordente) abc += "!mordent!";
        else if (opt.upperMordent) abc += "!uppermordent!";
        
        if (opt.roll) abc += "~";

        // Grace Notes (Adornos)
        abc += this.#toGraceNotes();

        // 2. ALTURA DA NOTA
        abc += this.#altura.abc;

        // 3. SUFIXO DE DURAÇÃO
        abc += this.#formatarDuracaoAbc();

        // 4. SUFIXOS (Dedilhado e Ligaduras)
        if (opt.dedilhado) abc += `$"${opt.dedilhado}"`;

        // Ligaduras (Prolongamento/Tie)
        if (opt.ligada || opt.hammerOn || opt.pullOff) {
            abc += "-";
        }

        return abc;
    }

    /**
     * @private
     */
    #toGraceNotes() {
        const gn = this.#options.graceNote;
        if (!Array.isArray(gn) || gn.length === 0) return "";
        const notasGraceAbc = gn.map(nota => nota.toGraceNote()).join('');
        return `{${notasGraceAbc}}`;
    }

    /**
     * @private
     */
    #formatarDuracaoAbc() {
        // Substituído para usar o método toNota() da classe TempoDuracao se houver uma forma adequada
        // A proporção de tempo é: (Duração da Nota / Unidade Base)
        const razao = this.#duracao.razao / this.unidadeTempo.razao;

        if (Math.abs(razao - 1) < 0.000001) return "";

        if (Number.isInteger(Number(razao.toFixed(8)))) {
            return Math.round(razao).toString();
        }

        const d = Number(razao.toFixed(8));
        if (d === 0.5) return "/";
        const den = Math.round(1 / d);
        return Math.abs((1 / den) - d) < 0.000001 ? `/${den}` : razao.toString();
    }

    // Getters / Setters
    get altura() { return this.#altura; }
    set altura(val) {
        if (!(val instanceof NotaFrequencia)) throw new Error("A altura deve ser NotaFrequencia.");
        this.#altura = val;
    }
    get duracao() { return this.#duracao; }
    set duracao(val) {
        if (val === null && this.#duracao === null) return;
        if (!(val instanceof TempoDuracao)) throw new Error("A duração deve ser TempoDuracao.");
        this.#duracao = val;
    }
    get unidadeTempo() {
        return this.#unidadeTempo ||
            this.#options.compasso?.unidadeTempo ||
            this.#options.voz?.unidadeTempo ||
            this.#options.obra?.unidadeTempo;
    }
    set unidadeTempo( val ) {
        if ((val === null || val === undefined ) && (this.#unidadeTempo === null || this.#unidadeTempo === undefined )) return;
        if (!(val instanceof TempoDuracao)) {
            throw new Error("A unidadeTempo deve ser TempoDuracao.");
        }
        this.#unidadeTempo = val;
    }
    get ligada() { return this.#options.ligada; }
    set ligada(val) { this.#options.ligada = !!val; }
    get options() { return this.#options; }

}

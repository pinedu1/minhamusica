import { TempoDuracao } from "../tempo/TempoDuracao.js";
import { Nota } from "./Nota.js";

/**
 * Representa um acorde musical, um conjunto de notas tocadas simultaneamente.
 * Suporta atributos de execução globais e notas de adorno (grace notes).
 */
export class Acorde {
    /** @type {Array<Nota>} */
    #notas = [];
    /** @type {TempoDuracao} */
    #duracao;
    /** @type {Object} */
    #options;
    /** @type {TempoDuracao} */
    #unidadeTempo;

    /**
     * @param {Array<Nota>} notas - Notas que compõem o acorde.
     * @param {TempoDuracao} duracao - Duração do conjunto.
     * @param {Object} [options={}] - Atributos e contexto.
     */
    constructor(notas = [], duracao, options = {}) {
        this.notas = notas;
        this.duracao = duracao;
        this.#options = {
            obra: null,
            compasso: null,
            unidadeTempo: null,
            
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

        this.unidadeTempo = this.#options.unidadeTempo;

        if (!(this.#unidadeTempo instanceof TempoDuracao)) {
            throw new Error("Falha ao criar Acorde: 'unidadeTempo' (L:) não encontrado.");
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
        const razao = this.#duracao.razao / this.unidadeTempo.razao;
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
        this.#notas = [];
        arrayNotas.forEach(nota => this.#addNota(nota));
    }

    get duracao() { return this.#duracao; }
    
    set duracao(val) {
        if (!(val instanceof TempoDuracao)) {
            throw new TypeError("A duração do acorde deve ser uma instância de TempoDuracao.");
        }
        this.#duracao = val;
    }

    get unidadeTempo() {
        return this.#unidadeTempo ||
            this.#options.compasso?.unidadeTempo ||
            this.#options.voz?.unidadeTempo ||
            this.#options.obra?.unidadeTempo;
    }
    
    set unidadeTempo( tempo ) {
        if (!(tempo instanceof TempoDuracao)) {
            throw new TypeError("O 'unidadeTempo' do acorde deve ser do tipo TempoDuracao.");
        }
        this.#unidadeTempo = tempo;
    }
    get options() { return this.#options; }

    /**
     * USAGE: Helper para criação rápida de Acorde a partir de um JSON.
     * Ex: Acorde.create({ notas: [{ freq: "C", sustenido: true }, { freq: "E," }], tempo: "1/4", duracao: "1/4" })
     */
    static create(config = {}) {
        let { notas, tempo, duracao, unidadeTempo, ...options } = config;

        if (!notas || !Array.isArray(notas)) {
            throw new Error("A propriedade 'notas' é obrigatória e deve ser um array no create() de Acorde.");
        }

        // Processa o tempo do acorde (duração dele próprio)
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

        // Processa a unidade de referência (L:)
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

        // Instancia as notas
        const notasInstanciadas = notas.map(notaConfig => {
            if (notaConfig instanceof Nota) return notaConfig;
            
            // Adiciona a unidadeTempo ao contexto da nota
            const notaOpt = { ...notaConfig };
            if (options.unidadeTempo) {
                notaOpt.unidadeTempo = options.unidadeTempo;
            }
            
            return Nota.create(notaOpt);
        });

        // Caso options possua graceNotes em JSON, as converte para instâncias de Nota
        if (options.graceNote && Array.isArray(options.graceNote)) {
            options.graceNote = options.graceNote.map(gnConfig => {
                if (gnConfig instanceof Nota) return gnConfig;
                const gnOpt = { ...gnConfig };
                if (options.unidadeTempo) gnOpt.unidadeTempo = options.unidadeTempo;
                return Nota.create(gnOpt);
            });
        }

        return new Acorde(notasInstanciadas, duracaoObj, options);
    }
}
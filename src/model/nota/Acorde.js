import { TempoDuracao } from "../tempo/TempoDuracao.js";
import { Nota } from "./Nota.js";
import { ElementoMusical } from "./ElementoMusical.js";
import { acordeSchema } from "../../schemas/acordeSchema.js";
import { NotaFrequencia } from "./NotaFrequencia.js";
import { NotaFrequenciaSchema } from "../../schemas/notaFrequenciaSchema.js";
import { TempoDuracaoSchema } from "../../schemas/tempoDuracaoSchema.js";
/**
 * Representa um acorde musical, um conjunto de notas tocadas simultaneamente.
 * Suporta atributos de execução globais e notas de adorno (grace notes).
 */
export class Acorde extends ElementoMusical {
    /** @type {Array<Nota>} */
    #notas = [];
    /**
     * @param {Array<Nota>} notas - Notas que compõem o acorde.
     * @param {TempoDuracao} duracao - Duração do conjunto.
     * @param {Object} [options={}] - Atributos e contexto.
     */
    constructor(notas = [], duracao, options = {}) {
        super(duracao, options);
        this.notas = notas;
        this._options = {
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
        const gn = this._options.graceNote;
        if (gn !== false && gn !== null && !Array.isArray(gn)) {
            throw new TypeError("Falha ao criar Acorde: 'graceNote' deve ser false, null ou um Array de instâncias de Nota.");
        }
        if (Array.isArray(gn) && gn.some(n => !(n instanceof Nota))) {
            throw new TypeError("Falha ao criar Acorde: Todos os elementos em 'graceNote' devem ser instâncias de Nota.");
        }
    }

    /**
     * USAGE: Gera a string ABC do acorde processando notas internas e atributos globais.
     * @returns {string}
     */
    toAbc() {
        let abc = "";
        const opt = this._options;

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
        abc += this._formatarDuracaoAbc();

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
        const gn = this._options.graceNote;
        if (!Array.isArray(gn) || gn.length === 0) return "";

        const notasGraceAbc = gn.map(nota => nota.toGraceNote(true)).join('');
        return `{${notasGraceAbc}}`;
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

    /**
     * USAGE: Helper para criação rápida de Acorde a partir de um JSON.
     * Ex: Acorde.create({ notas: [{ altura: "C", duracao: "1/4" }, { altura: "E", duracao: "1/4" }], options: { unidadeTempo: "4/4" } })
     */
    /**
     * USAGE: Helper para criação rápida de Acorde a partir de um JSON.
     */
    static create(dados) {
        if (dados instanceof Acorde) return dados;

        // 1. Validação via Zod
        const resultado = acordeSchema.safeParse(dados);

        if (!resultado.success) {
            throw new TypeError("Acorde.create: Erro na estrutura dos dados: " + resultado.error.message);
        }

        const { notas, duracao, options } = resultado.data;

        // 2. Validação da Regra de Negócio (Hierarquia de Tempo)
        if (!options.unidadeTempo && !options.compasso && !options.voz && !options.obra) {
            throw new TypeError("Acorde.create: A unidadeTempo Global deve ser definida em algum nível da hierarquia.");
        }

        // 3. Instanciação recursiva das Notas
        // Como o 'notas' do JSON são objetos puros, transformamos em instâncias de Nota
        const instanciasNotas = notas.map(n =>{
            if (!n.options.unidadeTempo) n.options.unidadeTempo = options.unidadeTempo;
            return Nota.create(n);
        });

        // 4. Instanciação da Duração e Unidade de Tempo
        const instanciaDuracao = TempoDuracao.create(duracao);
        const optionsProcessado = { ...options };

        if (options.unidadeTempo) {
            optionsProcessado.unidadeTempo = TempoDuracao.create(options.unidadeTempo);
        }

        // Tratamento de GraceNotes se forem um array
        if (Array.isArray(options.graceNote)) {
            optionsProcessado.graceNote = options.graceNote.map(n => Nota.create(n));
        }

        // 5. Retorna a nova instância de Acorde
        return new Acorde(instanciasNotas, instanciaDuracao, optionsProcessado);
    }
}